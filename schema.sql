DROP SCHEMA IF EXISTS partman CASCADE;
DROP TABLE IF EXISTS studies;
DROP TABLE IF EXISTS sells;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS assets;
DROP FUNCTION IF EXISTS uspReadTransactions;

CREATE SCHEMA partman;
CREATE EXTENSION pg_partman WITH SCHEMA partman;


UPDATE partman.part_config
SET infinite_time_partitions = true,
    retention_keep_table = true
WHERE parent_table = 'partman';


CREATE TABLE assets (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, current_price NUMERIC, prev_close NUMERIC, symbol TEXT, name TEXT, exchange TEXT, currency_id uuid, type INT, CONSTRAINT fk_currency FOREIGN KEY(currency_id) REFERENCES assets(id), created_at timestamptz default now(), updated_at timestamptz default now());
CREATE UNIQUE INDEX unique_asset on assets(symbol) WHERE NOT type = 3;
WITH currency (code, name) AS (
    SELECT *
    FROM
        UNNEST(
                ARRAY['USDAUD', 'USDCAD', 'USDCHF', 'USDCNH', 'USDCZK', 'USDDKK', 'USDEUR', 'USDGBP', 'USDHKD', 'USDHUF', 'USDILS', 'USDINR', 'USDJPY', 'USDMXN', 'USDNOK', 'USDNZD', 'USDPLN', 'USDRON', 'USDRUB', 'USDSEK', 'USDSGD', 'USDTHB', 'USDTRY', 'USDUSD', 'USDZAR', 'AUDUSD', 'CADUSD', 'CHFUSD', 'CNHUSD', 'CZKUSD', 'DKKUSD', 'EURUSD', 'GBPUSD', 'HKDUSD', 'HUFUSD', 'ILSUSD', 'INRUSD', 'JPYUSD', 'MXNUSD', 'NOKUSD', 'NZDUSD', 'PLNUSD', 'RONUSD', 'RUBUSD', 'SEKUSD', 'SGDUSD', 'THBUSD', 'TRYUSD', 'ZARUSD']::TEXT[],
                ARRAY['U.S. Dollar to Australian Dollar', 'U.S. Dollar to Canadian Dollar', 'U.S. Dollar to Swiss Franc', 'U.S. Dollar to Chinese Yuan Renminbi (HK)', 'U.S. Dollar to Czech Koruna', 'U.S. Dollar to Danish Krone', 'U.S. Dollar to Euro', 'U.S. Dollar to British Pound', 'U.S. Dollar to Hong Kong Dollar', 'U.S. Dollar to Hungarian Forint', 'U.S. Dollar to Israeli New Shekel', 'U.S. Dollar to Indian Rupee', 'U.S. Dollar to Japanese Yen', 'U.S. Dollar to Mexican Peso', 'U.S. Dollar to Norwegian Krone', 'U.S. Dollar to New Zealand Dollar', 'U.S. Dollar to Polish Zloty', 'U.S. Dollar to Romanian Leu', 'U.S. Dollar to Russian Ruble', 'U.S. Dollar to Swedish Krona', 'U.S. Dollar to Singapore Dollar', 'U.S. Dollar to Thai Baht', 'U.S. Dollar to Turkish Lira', 'U.S. Dollar to U.S. Dollar', 'U.S. Dollar to South African Rand', 'Australian Dollar to U.S. Dollar', 'Canadian Dollar to U.S. Dollar', 'Swiss Franc to U.S. Dollar', 'Chinese Yuan Renminbi (HK) to U.S. Dollar', 'Czech Koruna to U.S. Dollar', 'Danish Krone to U.S. Dollar', 'Euro to U.S. Dollar', 'British Pound to U.S. Dollar', 'Hong Kong Dollar to U.S. Dollar', 'Hungarian Forint to U.S. Dollar', 'Israeli New Shekel to U.S. Dollar', 'Indian Rupee to U.S. Dollar', 'Japanese Yen to U.S. Dollar', 'Mexican Peso to U.S. Dollar', 'Norwegian Krone to U.S. Dollar', 'New Zealand Dollar to U.S. Dollar', 'Polish Zloty to U.S. Dollar', 'Romanian Leu to U.S. Dollar', 'Russian Ruble to U.S. Dollar', 'Swedish Krona to U.S. Dollar', 'Singapore Dollar to U.S. Dollar', 'Thai Baht to U.S. Dollar', 'Turkish Lira to U.S. Dollar', 'South African Rand to U.S. Dollar']::TEXT[]
            )
)
INSERT INTO assets (symbol, current_price, prev_close, name, type) SELECT code, 1, 1, name, 1 FROM currency;

WITH currency (code, name) AS (
    SELECT *
    FROM
        UNNEST(
                ARRAY['AUD', 'CAD', 'CHF', 'CNH', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'ILS', 'INR', 'JPY', 'MXN', 'NOK', 'NZD', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR']::TEXT[],ARRAY['AUD', 'CAD', 'CHF', 'CNH', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'ILS', 'INR', 'JPY', 'MXN', 'NOK', 'NZD', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR']::TEXT[],
                ARRAY['Australian Dollar', 'Canadian Dollar', 'Swiss Franc', 'Chinese Yuan Renminbi (HK)', 'Czech Koruna', 'Danish Krone', 'Euro', 'British Pound', 'Hong Kong Dollar', 'Hungarian Forint', 'Israeli New Shekel','Indian Rupee', 'Japanese Yen', 'Mexican Peso', 'Norwegian Krone', 'New Zealand Dollar', 'Polish Zloty', 'Romanian Leu', 'Russian Ruble', 'Swedish Krona', 'Singapore Dollar', 'Thai Baht', 'Turkish Lira', 'U.S. Dollar', 'South African Rand']::TEXT[]
            )
)
INSERT INTO assets (symbol, current_price, prev_close, name, type, currency_id) SELECT currency.code, 1, 1, currency.name, 2, assets.id FROM currency INNER JOIN assets ON CONCAT(currency.code, 'USD') = assets.symbol AND assets.type = 1;

INSERT INTO assets (id, symbol, current_price, prev_close, name, exchange, currency_id, type) SELECT 'a3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'AAPL', 358.98, 157.71, 'Apple Inc', 'NASDAQ', id, 0 FROM assets WHERE symbol = 'USDUSD' AND type = 1;
INSERT INTO assets (id, symbol, current_price, prev_close, name, exchange, currency_id, type) SELECT 'b3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'TSLA', 882.92, 883.29, 'Tesla', 'NASDAQ', id, 0 FROM assets WHERE symbol = 'USDUSD' AND type = 1;
INSERT INTO assets (id, symbol, current_price, prev_close, name, exchange, currency_id, type) SELECT 'c3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'MSFT', 280.18, 278.30, 'Microsoft Inc', 'NASDAQ', id, 0 FROM assets WHERE symbol = 'USDUSD' AND type = 1;
INSERT INTO assets (id, symbol, current_price, prev_close, name, exchange, currency_id, type) SELECT 'd3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'NNOX', 11.44, 11.02, 'Nano X Technology', 'NASDAQ', id, 0 FROM assets WHERE symbol = 'USDUSD' AND type = 1;
INSERT INTO assets (id, symbol, current_price, prev_close, name, exchange, currency_id, type) SELECT 'e3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'HPQ', 31.54, 31.77, 'HP Inc', 'NYSE', id, 0 FROM assets WHERE symbol = 'USDUSD' AND type = 1;


CREATE TABLE partman.asset_data (id uuid DEFAULT gen_random_uuid(), asset_id uuid, close NUMERIC, label TEXT, date DATE NOT NULL, CONSTRAINT fk_portfolio FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE, created_at timestamptz default now()) PARTITION BY RANGE(date);
CREATE INDEX asset_data_time_brin_index
    ON partman.asset_data
        USING BRIN (date)
    WITH (pages_per_range = 32);
SELECT partman.create_parent('partman.asset_data', 'date', 'native', 'daily', p_start_partition := '2022-06-20');


CREATE TABLE users (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, email VARCHAR ( 50 ) UNIQUE NOT NULL, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO users (id, email) VALUES('60ffde40-5715-4176-8b14-37fbcd39e85d', 'sammymac.eng@gmail.com');

CREATE TABLE user_settings (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid, currency_id uuid, CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, CONSTRAINT fk_currency FOREIGN KEY(currency_id) REFERENCES assets(id), created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO user_settings (user_id, currency_id) SELECT '60ffde40-5715-4176-8b14-37fbcd39e85d', id FROM assets WHERE symbol = 'USDAUD' AND type = 1;

CREATE OR REPLACE FUNCTION insertUserSettings()
    RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id, currency_id) SELECT NEW.id, id FROM assets WHERE symbol = 'USDUSD' AND type = 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER insert_user_settings AFTER INSERT ON users FOR EACH ROW EXECUTE PROCEDURE insertUserSettings();

CREATE TABLE partman.user_portfolios_data (id uuid DEFAULT gen_random_uuid(), user_id uuid, current_value NUMERIC, initial_value NUMERIC, all_time_change NUMERIC, all_time_percent NUMERIC, date DATE NOT NULL, CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, created_at timestamptz default now()) PARTITION BY RANGE(date);
CREATE INDEX user_portfolios_data_time_brin_index
    ON partman.user_portfolios_data
        USING BRIN (date)
    WITH (pages_per_range = 32);
SELECT partman.create_parent('partman.user_portfolios_data', 'date', 'native', 'daily', p_start_partition := '2022-06-12');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 8911.25, 10740.4077062204, -1801.76, -22.12, '2022-06-12');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 8891.25, 10740.4077062204, -1901.76, -23.12, '2022-06-13');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 9031.25, 10740.4077062204, -1701.76, -21.12, '2022-06-14');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 9181.25, 10740.4077062204, -1601.76, -20.12, '2022-06-15');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 9161.25, 10740.4077062204, -1601.76, -20.12, '2022-06-16');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 9031.25, 10740.4077062204, -1701.76, -21.12, '2022-06-17');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 8961.25, 10740.4077062204, -1801.76, -22.12, '2022-06-18');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 8821.25, 10740.4077062204, -1901.76, -23.12, '2022-06-19');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 8921.25, 10740.4077062204, -1801.76, -22.12, '2022-06-20');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 8951.25, 10740.4077062204, -1801.76, -22.12, '2022-06-21');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 9061.25, 10740.4077062204, -1701.76, -21.12, '2022-06-22');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 9101.25, 10740.4077062204, -1601.76, -20.12, '2022-06-23');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 19201.25, 20740.4077062204, -1501.76, -19.12, '2022-06-24');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 19401.25, 20740.4077062204, -1301.76, -7.12, '2022-06-25');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 19501.25, 20740.4077062204, -1201.76, -3.12, '2022-06-26');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 19701.25, 20740.4077062204, -701.76, -1.12, '2022-06-27');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 19901.25, 20740.4077062204, -201.76, 0.12, '2022-06-28');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 19801.25, 20740.4077062204, -301.76, 3.12, '2022-06-29');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 19701.25, 20740.4077062204, -101.76, 2.12, '2022-06-30');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 21001.25, 20740.4077062204, 51.76, 0.12, '2022-07-01');
INSERT INTO partman.user_portfolios_data (user_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 23101.25, 20740.4077062204, 101.76, 3.12, '2022-07-02');

CREATE TABLE portfolios (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid, name VARCHAR ( 50 ) NOT NULL, included BOOLEAN, CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO portfolios (id, user_id, name, included) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', '60ffde40-5715-4176-8b14-37fbcd39e85d', 'AUS EQUITIES', TRUE);
INSERT INTO portfolios (id, user_id, name, included) VALUES ('26fc5ca2-32ba-499a-a606-49679dfed51e', '60ffde40-5715-4176-8b14-37fbcd39e85d', 'U.S. EQUITIES', TRUE);
INSERT INTO portfolios (id, user_id, name, included) VALUES ('36fc5ca2-32ba-499a-a606-49679dfed51e', '60ffde40-5715-4176-8b14-37fbcd39e85d', 'Commodities', TRUE);

CREATE TABLE partman.portfolio_data (id uuid DEFAULT gen_random_uuid(), portfolio_id uuid, current_value NUMERIC, initial_value NUMERIC, all_time_change NUMERIC, all_time_percent NUMERIC, date DATE NOT NULL, CONSTRAINT fk_portfolio FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE, created_at timestamptz default now()) PARTITION BY RANGE(date);
CREATE INDEX portfolio_data_time_brin_index
    ON partman.portfolio_data
        USING BRIN (date)
    WITH (pages_per_range = 32);
SELECT partman.create_parent('partman.portfolio_data', 'date', 'native', 'daily', p_start_partition := '2022-06-20');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 4911.25, 4500.28470726, -1801.76, -22.12, '2022-06-12');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 4891.25, 4500.28470726, -1901.76, -23.12, '2022-06-13');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 4031.25, 4500.28470726, -1701.76, -21.12, '2022-06-14');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 4181.25, 4500.28470726, -1601.76, -20.12, '2022-06-15');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 5161.25, 5500.28470726, -1601.76, -20.12, '2022-06-16');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 5031.25, 5500.28470726, -1701.76, -21.12, '2022-06-17');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 5961.25, 5500.28470726, -1801.76, -22.12, '2022-06-18');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 5821.25, 5500.28470726, -1901.76, -23.12, '2022-06-19');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 5921.25, 5500.28470726, -1801.76, -22.12, '2022-06-20');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 5951.25, 5500.28470726, -1801.76, -22.12, '2022-06-21');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 5061.25, 5500.28470726, -1701.76, -21.12, '2022-06-22');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 5101.25, 5500.28470726, -1601.76, -20.12, '2022-06-23');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 7201.25, 7500.28470726, -1501.76, -19.12, '2022-06-24');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 7401.25, 7500.28470726, -1301.76, -7.12, '2022-06-25');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 7501.25, 7500.28470726, -1201.76, -3.12, '2022-06-26');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 7701.25, 7500.28470726, -701.76, -1.12, '2022-06-27');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 7901.25, 7500.28470726, -201.76, -0.12, '2022-06-28');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 7801.25, 7500.28470726, -301.76, -3.12, '2022-06-29');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 7701.25, 7500.28470726, -101.76, -2.12, '2022-06-30');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 8301.25, 7500.28470726, 51.76, -5.12, '2022-07-01');
INSERT INTO partman.portfolio_data (portfolio_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('16fc5ca2-32ba-499a-a606-49679dfed51e', 8701.25, 7500.28470726, 101.76, -3.12, '2022-07-02');


CREATE TABLE holdings (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, portfolio_id uuid, asset_id uuid, CONSTRAINT fk_portfolio FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE, CONSTRAINT fk_asset FOREIGN KEY(asset_id) REFERENCES assets(id), created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO holdings (id, portfolio_id, asset_id) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', '16fc5ca2-32ba-499a-a606-49679dfed51e', 'a3113ec5-d9c8-4c76-aea0-6bd28b239edc');
INSERT INTO holdings (id, portfolio_id, asset_id) VALUES ('20ffde40-5715-4176-8b14-37fbcd39e85f', '16fc5ca2-32ba-499a-a606-49679dfed51e', 'b3113ec5-d9c8-4c76-aea0-6bd28b239edc');
INSERT INTO holdings (id, portfolio_id, asset_id) VALUES ('30ffde40-5715-4176-8b14-37fbcd39e85f', '26fc5ca2-32ba-499a-a606-49679dfed51e', 'a3113ec5-d9c8-4c76-aea0-6bd28b239edc');
INSERT INTO holdings (id, portfolio_id, asset_id) VALUES ('40ffde40-5715-4176-8b14-37fbcd39e85f', '26fc5ca2-32ba-499a-a606-49679dfed51e', 'c3113ec5-d9c8-4c76-aea0-6bd28b239edc');
INSERT INTO holdings (id, portfolio_id, asset_id) VALUES ('50ffde40-5715-4176-8b14-37fbcd39e85f', '36fc5ca2-32ba-499a-a606-49679dfed51e', 'b3113ec5-d9c8-4c76-aea0-6bd28b239edc');
INSERT INTO holdings (id, portfolio_id, asset_id) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85f', '36fc5ca2-32ba-499a-a606-49679dfed51e', 'c3113ec5-d9c8-4c76-aea0-6bd28b239edc');
INSERT INTO holdings (id, portfolio_id, asset_id) VALUES ('70ffde40-5715-4176-8b14-37fbcd39e85f', '36fc5ca2-32ba-499a-a606-49679dfed51e', 'd3113ec5-d9c8-4c76-aea0-6bd28b239edc');
INSERT INTO holdings (id, portfolio_id, asset_id) VALUES ('80ffde40-5715-4176-8b14-37fbcd39e85f', '36fc5ca2-32ba-499a-a606-49679dfed51e', 'e3113ec5-d9c8-4c76-aea0-6bd28b239edc');

CREATE TABLE partman.holding_data (id uuid DEFAULT gen_random_uuid(), holding_id uuid, current_value NUMERIC, initial_value NUMERIC, all_time_change NUMERIC, all_time_percent NUMERIC, date DATE NOT NULL, CONSTRAINT fk_holding FOREIGN KEY(holding_id) REFERENCES holdings(id) ON DELETE CASCADE, created_at timestamptz default now()) PARTITION BY RANGE(date);
CREATE INDEX holding_data_time_brin_index
    ON partman.holding_data
        USING BRIN (date)
    WITH (pages_per_range = 32);
SELECT partman.create_parent('partman.holding_data', 'date', 'native', 'daily', p_start_partition := '2022-06-20');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 511.25, 640.1830728, 1801.76, 22.12, '2022-06-12');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 591.25, 640.1830728, 1901.76, 23.12, '2022-06-13');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 531.25, 640.1830728, 1701.76, 21.12, '2022-06-14');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 581.25, 640.1830728, 1601.76, 20.12, '2022-06-15');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 571.25, 640.1830728, 1601.76, 20.12, '2022-06-16');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 561.25, 640.1830728, 1701.76, 21.12, '2022-06-17');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 571.25, 640.1830728, 1801.76, 22.12, '2022-06-18');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 581.25, 640.1830728, 1901.76, 23.12, '2022-06-19');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 621.25, 640.1830728, 1801.76, 22.12, '2022-06-20');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 671.25, 640.1830728, 1801.76, 22.12, '2022-06-21');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 651.25, 640.1830728, 1701.76, 21.12, '2022-06-22');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 671.25, 640.1830728, 1601.76, 20.12, '2022-06-23');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 741.25, 640.1830728, 1501.76, 19.12, '2022-06-24');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 731.25, 640.1830728, 1301.76, 17.12, '2022-06-25');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 721.25, 640.1830728, 1201.76, 13.12, '2022-06-26');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 711.25, 640.1830728, 1701.76, 11.12, '2022-06-27');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 751.25, 640.1830728, 1201.76, 10.12, '2022-06-28');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 891.25, 640.1830728, 1301.76, 13.12, '2022-06-29');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 851.25, 640.1830728, 1101.76, 12.12, '2022-06-30');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 841.25, 640.1830728, 1151.76, 10.12, '2022-07-01');
INSERT INTO partman.holding_data (holding_id, current_value, initial_value, all_time_change, all_time_percent, date) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', 940.25, 640.1830728, 1101.76, 13.12, '2022-07-02');


CREATE TABLE transactions (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, holding_id uuid, type INT, sell_method INT, quantity NUMERIC, initial_price NUMERIC, timestamp timestamptz, exchange_rate NUMERIC, sell_quantity NUMERIC, initial_value NUMERIC GENERATED ALWAYS AS (quantity*initial_price) STORED, CONSTRAINT fk_holding FOREIGN KEY(holding_id) REFERENCES holdings(id) ON DELETE CASCADE, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, sell_quantity, timestamp) VALUES ('11ffde40-5715-4176-8b14-37fbcd39e85a', '10ffde40-5715-4176-8b14-37fbcd39e85f', 0, 50.1289, 142.692, 1.344, 46.8955, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('12ffde40-5715-4176-8b14-37fbcd39e85a', '10ffde40-5715-4176-8b14-37fbcd39e85f', 0, 1.2, 149.0023, 1.293, '2022-04-29T10:06:01.000Z');
INSERT INTO transactions (id, holding_id, type, sell_method, quantity, initial_price, timestamp) VALUES ('13ffde40-5715-4176-8b14-37fbcd39e85a', '10ffde40-5715-4176-8b14-37fbcd39e85f', 1, 0, 13.68875, 153.27, '2022-04-29T10:07:32.000Z');
INSERT INTO transactions (id, holding_id, type, sell_method, quantity, initial_price, timestamp) VALUES ('14ffde40-5715-4176-8b14-37fbcd39e85a', '10ffde40-5715-4176-8b14-37fbcd39e85f', 1, 0, 33.20675, 153.27, '2022-04-29T10:08:33.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('15ffde40-5715-4176-8b14-37fbcd39e85a', '20ffde40-5715-4176-8b14-37fbcd39e85f', 0, 3.9056, 934.11, 1.344, '2022-04-29T10:02:01.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('16ffde40-5715-4176-8b14-37fbcd39e85a', '20ffde40-5715-4176-8b14-37fbcd39e85f', 0, 3.6657, 876.1878, 1.344, '2022-04-29T10:02:02.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, sell_quantity, timestamp) VALUES ('17ffde40-5715-4176-8b14-37fbcd39e85a', '30ffde40-5715-4176-8b14-37fbcd39e85f', 0, 12.6562, 189.90, 1.344, 7, '2022-04-29T10:02:03.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('18ffde40-5715-4176-8b14-37fbcd39e85a', '30ffde40-5715-4176-8b14-37fbcd39e85f', 0, 1.1, 161.2011, 1.344, '2022-04-29T10:02:04.000Z');
INSERT INTO transactions (id, holding_id, type, sell_method, quantity, initial_price, exchange_rate, timestamp) VALUES ('19ffde40-5715-4176-8b14-37fbcd39e85a', '30ffde40-5715-4176-8b14-37fbcd39e85f', 1, 0, 7, 142.8709, 1.344, '2022-04-29T10:02:05.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, sell_quantity, timestamp) VALUES ('20ffde40-5715-4176-8b14-37fbcd39e85a', '40ffde40-5715-4176-8b14-37fbcd39e85f', 0, 2.0069, 213.8, 1.344, 1.5, '2022-04-29T10:02:05.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('21ffde40-5715-4176-8b14-37fbcd39e85a', '40ffde40-5715-4176-8b14-37fbcd39e85f', 0, 4.3, 245.24, 1.344, '2022-04-29T10:02:06.000Z');
INSERT INTO transactions (id, holding_id, type, sell_method, quantity, initial_price, exchange_rate, timestamp) VALUES ('22ffde40-5715-4176-8b14-37fbcd39e85a', '40ffde40-5715-4176-8b14-37fbcd39e85f', 1, 0, 1.5, 290.23, 1.344, '2022-04-29T10:02:07.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('23ffde40-5715-4176-8b14-37fbcd39e85a', '50ffde40-5715-4176-8b14-37fbcd39e85f', 0, 2.78, 902.90, 1.344, '2022-04-29T10:02:07.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('24ffde40-5715-4176-8b14-37fbcd39e85a', '60ffde40-5715-4176-8b14-37fbcd39e85f', 0, 12, 190.36, 1.344, '2022-04-29T10:02:08.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('25ffde40-5715-4176-8b14-37fbcd39e85a', '70ffde40-5715-4176-8b14-37fbcd39e85f', 0, 64.048, 31.697, 1.3346, '2022-04-29T10:02:09.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('26ffde40-5715-4176-8b14-37fbcd39e85a', '80ffde40-5715-4176-8b14-37fbcd39e85f', 0, 55, 30.77, 1.48, '2022-04-29T10:02:09.000Z');

CREATE TABLE sells (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, transaction_id uuid, sell_id uuid, quantity NUMERIC, sell_price NUMERIC, exchange_rate NUMERIC, initial_value NUMERIC GENERATED ALWAYS AS (quantity*sell_price) STORED, CONSTRAINT fk_transaction FOREIGN KEY(transaction_id) REFERENCES transactions(id) ON DELETE CASCADE, CONSTRAINT fk_sell FOREIGN KEY(sell_id) REFERENCES transactions(id) ON DELETE CASCADE, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO sells (transaction_id, sell_id, quantity, sell_price) VALUES ('11ffde40-5715-4176-8b14-37fbcd39e85a', '13ffde40-5715-4176-8b14-37fbcd39e85a', 13.68875, 153.27);
INSERT INTO sells (transaction_id, sell_id, quantity, sell_price) VALUES ('11ffde40-5715-4176-8b14-37fbcd39e85a', '14ffde40-5715-4176-8b14-37fbcd39e85a', 33.20675, 153.27);
INSERT INTO sells (transaction_id, sell_id, quantity, sell_price, exchange_rate) VALUES ('17ffde40-5715-4176-8b14-37fbcd39e85a', '19ffde40-5715-4176-8b14-37fbcd39e85a', 7, 142.8709, 1.344);
INSERT INTO sells (transaction_id, sell_id, quantity, sell_price, exchange_rate) VALUES ('21ffde40-5715-4176-8b14-37fbcd39e85a', '22ffde40-5715-4176-8b14-37fbcd39e85a', 1.5, 290.23, 1.344);

CREATE TABLE studies (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid, asset_id uuid, type INT, name TEXT, symbol TEXT, notes TEXT, question_one INT, question_two INT, question_three INT, question_four INT, question_five INT, question_six INT, question_seven NUMERIC, question_eight NUMERIC, question_nine NUMERIC,
                      completed_qs INT GENERATED ALWAYS AS (CASE WHEN question_one IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_two IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_three IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_four IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_five IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_six IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_seven IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_eight IS NOT NULL THEN 1 ELSE 0 END) STORED,
                      created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO studies (user_id, asset_id, name, symbol, type, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight, question_nine) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'a3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'Apple Inc', 'AAPL', 0, 9, 7, 8, 6, 8, 4, 12, 11345, 405661);
INSERT INTO studies (user_id, asset_id, name, symbol, type, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight, question_nine) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'b3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'Tesla', 'TSLA', 0, 4, 5, 3, 8, 6, 4, 20, NULL, NULL);
INSERT INTO studies (user_id, asset_id, name, symbol, type, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight, question_nine) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'c3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'Microsoft Inc', 'MSFT', 0, 5, 7, 8, 6, 8, 4, NULL, NULL, NULL);
INSERT INTO studies (user_id, asset_id, name, symbol, type, notes, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight, question_nine) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'b3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'Tesla', 'TSLA', 0, 'This study of Tesla was done following the leak that their car motors are powered by Hamsters in a wheel. Given the severity of this issue, I took the chance to re-evaluate my position as a Tesla shareholder.', 4, 5, 3, 8, 6, 4, 29, 776443, 7209394);
INSERT INTO studies (user_id, asset_id, name, symbol, type, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight, question_nine) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'c3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'Microsoft Inc', 'MSFT', 0, 9, 4, 5, 3, 9, 3, 15.98, 20000643, 400094745);
INSERT INTO studies (user_id, asset_id, name, symbol, type, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight, question_nine) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'd3113ec5-d9c8-4c76-aea0-6bd28b239edc', 'Nano X Technology', 'NNOX', 0, 4, 5, 3, 4, 9, 3, 10.9, 300863, 5686844);



CREATE OR REPLACE FUNCTION updateColumnUpdatedAt()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_update_time BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_user_settings_update_time BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_portfolio_update_time BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_asset_update_time BEFORE UPDATE ON assets FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_holding_update_time BEFORE UPDATE ON holdings FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_transaction_update_time BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_sell_update_time BEFORE UPDATE ON sells FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_study_update_time BEFORE UPDATE ON studies FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();



CREATE OR REPLACE FUNCTION uspReadTransactions(holding_uuid uuid) RETURNS TABLE (transaction_id uuid, holding_id uuid, currency_symbol TEXT, type INT, sell_method INT, exchange_rate NUMERIC, datetime timestamptz, initial_quantity NUMERIC, current_quantity NUMERIC, price NUMERIC, initial_value NUMERIC, current_value NUMERIC, total_change NUMERIC, daily_change NUMERIC, daily_percent NUMERIC, realized NUMERIC, realized_initial NUMERIC, all_time_initial NUMERIC) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
        SELECT t.id,
               h.id,
               SUBSTRING(asset_c.symbol, 1, 3),
               t.type,
               t.sell_method,
               t.exchange_rate,
               t.timestamp,
               t.quantity,
               COALESCE(t.quantity - SUM(s.quantity), t.quantity),
               t.initial_price,
               (t.quantity - COALESCE(SUM(s.quantity), 0)) * t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price),
               COALESCE(a.current_price * (t.quantity - SUM(s.quantity)), a.current_price * t.quantity) * asset_c.current_price * user_c.current_price,
               ((a.current_price * asset_c.current_price * user_c.current_price) - (t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))) * (t.quantity - COALESCE(SUM(s.quantity), 0)),
               ((a.current_price * (t.quantity - COALESCE(SUM(s.quantity), 0))) - (a.prev_close * (t.quantity - COALESCE(SUM(s.quantity), 0)))) * asset_c.current_price * user_c.current_price,
               COALESCE(((a.current_price * (t.quantity - SUM(s.quantity))) - (a.prev_close * (t.quantity - SUM(s.quantity)))) * 100.0 / NULLIF(a.prev_close * (t.quantity - SUM(s.quantity)), 0), ((a.current_price * t.quantity) - (a.prev_close * t.quantity))*100.0 / (a.prev_close * t.quantity)),
               SUM(s.quantity * (s.sell_price * COALESCE(s.exchange_rate, asset_c.current_price * user_c.current_price) - t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))),
               SUM(s.quantity * (t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))),
               t.initial_value * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price)
        FROM transactions as t
                 INNER JOIN holdings AS h ON t.holding_id = h.id
                 INNER JOIN assets AS a ON h.asset_id = a.id
                 INNER JOIN portfolios AS p ON h.portfolio_id = p.id
                 INNER JOIN user_settings AS u ON p.user_id = u.user_id
                 INNER JOIN assets AS asset_c ON a.currency_id = asset_c.id
                 INNER JOIN assets AS user_c ON u.currency_id = user_c.id
                 LEFT JOIN sells AS s ON t.id = s.transaction_id
        WHERE h.id = $1
        GROUP BY t.id, h.id, a.id, s.transaction_id, asset_c.id, user_c.id
        ORDER BY MIN(t.timestamp) DESC;
END;
$$;