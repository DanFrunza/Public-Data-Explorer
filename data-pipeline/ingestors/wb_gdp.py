import os
import time
from typing import Iterable, List

import requests
import psycopg2
import psycopg2.extras

# Allow empty env to fall back to default
WB_BASE = os.environ.get('WB_BASE') or 'https://api.worldbank.org/v2'


def db_conn():
    # Require Supabase Session Pooler via DATABASE_URL; no local fallback
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise SystemExit('DATABASE_URL is required for pipeline ingestion.')
    if 'sslmode=' not in dsn:
        # Ensure SSL is required for Supabase
        sep = '&' if '?' in dsn else '?'
        dsn = f"{dsn}{sep}sslmode=require"
    return psycopg2.connect(dsn)

def _print_db_diagnostics(conn, masked_target: str):
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT current_database(), current_user, inet_server_addr(), version()')
            db, user, addr, ver = cur.fetchone()
            print('[pipeline-db] target:', masked_target)
            print('[pipeline-db] current_database:', db)
            print('[pipeline-db] user:', user)
            print('[pipeline-db] server addr:', addr)
            print('[pipeline-db] version:', (ver or '').split('\n')[0])
    except Exception as e:
        print('[pipeline-db] diagnostics failed:', e)


def fetch_json(url: str):
    resp = requests.get(url, headers={'User-Agent': 'public-data-explorer/pipeline'}, timeout=20)
    resp.raise_for_status()
    return resp.json()


def fetch_all_pages(url_base: str):
    page = 1
    pages = 1
    out: List[dict] = []
    while page <= pages:
        url = f"{url_base}&page={page}"
        data = fetch_json(url)
        meta = data[0]
        rows = data[1] or []
        pages = meta.get('pages', 1)
        out.extend(rows)
        page += 1
        # be nice to the API
        time.sleep(0.1)
    return out


def upsert_countries(conn, items: Iterable[dict]):
    if not items:
        return
    with conn.cursor() as cur:
        psycopg2.extras.execute_batch(cur,
            """
            INSERT INTO wb_countries(iso3, name, region, income_level, iso2)
            VALUES (%(iso3)s, %(name)s, %(region)s, %(income)s, %(iso2)s)
            ON CONFLICT (iso3) DO UPDATE
              SET name=EXCLUDED.name,
                  region=EXCLUDED.region,
                  income_level=EXCLUDED.income_level,
                  iso2=EXCLUDED.iso2
            """,
            [
                {
                    'iso3': (c.get('id') or '').upper(),
                    'name': c.get('name'),
                    'region': (c.get('region') or {}).get('value'),
                    'income': (c.get('incomeLevel') or {}).get('value'),
                    'iso2': c.get('iso2Code')
                }
                for c in items if c.get('id') and len(c.get('id')) == 3
            ]
        )
    conn.commit()


def load_countries(conn):
    data = fetch_json(f"{WB_BASE}/country?format=json&per_page=400")
    items = data[1] or []
    upsert_countries(conn, items)
    # Select ISO3 excluding aggregates
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT iso3 FROM wb_countries
            WHERE iso3 ~ '^[A-Z]{3}$'
              AND (income_level IS NULL OR income_level <> 'Aggregates')
            ORDER BY iso3
            """
        )
        iso3 = [r[0] for r in cur.fetchall()]
    return iso3


def chunk(xs: List[str], n: int):
    for i in range(0, len(xs), n):
        yield xs[i:i+n]


def upsert_indicator_annual(conn, indicator_code: str, records: Iterable[dict]):
    rows = []
    for r in records:
        iso3 = (r.get('countryiso3code') or '').upper()
        if not iso3 or len(iso3) != 3:
            # try fallback to country.id (iso2) map via join later if needed
            continue
        try:
            year = int(r.get('date'))
        except (TypeError, ValueError):
            continue
        val = r.get('value')
        rows.append((indicator_code, iso3, year, val))

    if not rows:
        return

    with conn.cursor() as cur:
        psycopg2.extras.execute_batch(cur,
            """
            INSERT INTO wb_indicator_annual(indicator_code, iso3, year, value, source)
            VALUES (%s, %s, %s, %s, 'worldbank')
            ON CONFLICT (indicator_code, iso3, year)
            DO UPDATE SET value = EXCLUDED.value, ingested_at = NOW()
            """,
            rows,
            page_size=1000
        )
    conn.commit()


def run(indicator_code: str = 'NY.GDP.MKTP.CD', start_year: int = 1990, end_year: int | None = None):
    # Resolve end_year: cli arg > env > current year; tolerate empty/invalid env
    env_end = os.environ.get('WB_END_YEAR', '').strip()
    env_end_int = None
    try:
        env_end_int = int(env_end) if env_end else None
    except ValueError:
        env_end_int = None
    end_year = end_year or env_end_int or int(time.strftime('%Y'))

    conn = db_conn()
    try:
        # Safe diagnostics similar to backend migrations (mask password)
        raw_dsn = os.environ.get('DATABASE_URL', '')
        masked = raw_dsn
        if '://' in masked and '@' in masked:
            pre, post = masked.split('://', 1)
            userpass, rest = post.split('@', 1)
            if ':' in userpass:
                user, _ = userpass.split(':', 1)
                masked = f"{pre}://{user}:***@{rest}"
        _print_db_diagnostics(conn, masked)
        print(f"[pipeline] WB_BASE: {WB_BASE}")

        iso3_list = load_countries(conn)
        total = 0
        for group in chunk(iso3_list, 60):
            url = (
                f"{WB_BASE}/country/{';'.join(group)}/indicator/{indicator_code}"
                f"?format=json&per_page=20000&date={start_year}:{end_year}"
            )
            records = fetch_all_pages(url)
            upsert_indicator_annual(conn, indicator_code, records)
            total += len(records)
            # politeness delay across chunks
            time.sleep(0.2)
        print(f"[wb_gdp] Upserted ~{total} rows for {indicator_code} ({start_year}-{end_year})")
    finally:
        conn.close()
