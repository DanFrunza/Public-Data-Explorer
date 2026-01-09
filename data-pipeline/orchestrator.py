import json
import os
import time
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from importlib import import_module

from dotenv import load_dotenv


def load_jobs_config(path: str):
    with open(path, 'r', encoding='utf-8') as f:
        cfg = json.load(f)
    return cfg.get('jobs', [])


def run_job(module_name: str, func_name: str, params: dict | None = None):
    mod = import_module(module_name)
    func = getattr(mod, func_name)
    return func(**(params or {}))


def main():
    load_dotenv()  # allow DB env vars from .env if present

    jobs = load_jobs_config(os.path.join(os.getcwd(), 'jobs.json'))
    if not jobs:
        print('[pipeline] No jobs configured. Sleeping...')
        while True:
            time.sleep(3600)

    scheduler = BackgroundScheduler(timezone=os.environ.get('TZ', 'UTC'))
    scheduler.start()

    for job in jobs:
        job_id = job['id']
        module = job['module']
        func = job['function']
        cron = job['cron']
        params = job.get('params', {})

        trigger = CronTrigger.from_crontab(cron)

        def _runner(m=module, f=func, p=params, jid=job_id):
            started = datetime.utcnow().isoformat()
            print(f"[pipeline] Job {jid} start at {started}")
            try:
                run_job(m, f, p)
                print(f"[pipeline] Job {jid} completed OK")
            except Exception as e:
                print(f"[pipeline] Job {jid} FAILED: {e}")

        scheduler.add_job(_runner, trigger, id=job_id, replace_existing=True)
        print(f"[pipeline] Scheduled {job_id} → {cron}")

        # Optional immediate run on start for backfill/testing
        if os.environ.get('RUN_JOBS_ON_START', 'false').lower() in ('1', 'true', 'yes'):
            _runner()

    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        pass
    finally:
        scheduler.shutdown()


if __name__ == '__main__':
    main()
