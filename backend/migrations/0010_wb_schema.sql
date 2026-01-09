-- World Bank countries and indicator annual values (GDP and more)
CREATE TABLE IF NOT EXISTS wb_countries (
  iso3 CHAR(3) PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  income_level TEXT,
  iso2 CHAR(2)
);

CREATE TABLE IF NOT EXISTS wb_indicator_annual (
  indicator_code TEXT NOT NULL,
  iso3 CHAR(3) NOT NULL,
  year INT NOT NULL,
  value NUMERIC,
  source TEXT DEFAULT 'worldbank',
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (indicator_code, iso3, year)
);

CREATE INDEX IF NOT EXISTS idx_wb_indicator_iso3_year ON wb_indicator_annual(iso3, year);
CREATE INDEX IF NOT EXISTS idx_wb_indicator_code_year ON wb_indicator_annual(indicator_code, year);
