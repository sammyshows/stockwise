DROP TABLE IF EXISTS studies;
DROP TABLE IF EXISTS sells;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS users;
DROP FUNCTION IF EXISTS uspReadTransactions;
DROP FUNCTION IF EXISTS uspUpdateHolding;


CREATE TABLE users (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, email VARCHAR ( 50 ) UNIQUE NOT NULL, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO users (id, email) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'sammymac.eng@gmail.com');

CREATE TABLE portfolios (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid, name VARCHAR ( 50 ) NOT NULL, included BOOLEAN, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO portfolios (user_id, name, included) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'AUS EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'U.S. EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'Commodities', TRUE);

CREATE TABLE assets (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, current_price NUMERIC, prev_close NUMERIC, symbol TEXT, name TEXT, exchange TEXT, type INT, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO assets (symbol, current_price, prev_close, name, exchange, type) VALUES ('AAPL', 158.98, 157.71, 'Apple Inc', 'NASDAQ', 0);
INSERT INTO assets (symbol, current_price, prev_close, name, exchange, type) VALUES ('TSLA', 882.92, 883.29, 'Tesla', 'NASDAQ', 0);
INSERT INTO assets (symbol, current_price, prev_close, name, exchange, type) VALUES ('MSFT', 280.18, 278.30, 'Microsoft Inc', 'NASDAQ', 0);
INSERT INTO assets (symbol, current_price, prev_close, name, exchange, type) VALUES ('NNOX', 10.22, 10.76, 'Nano X Technology', 'NASDAQ', 0);
WITH currency (code, name) AS (
    SELECT *
    FROM
        UNNEST(
                ARRAY['AUD', 'CAD', 'CHF', 'CNH', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'ILS', 'INR', 'JPY', 'MXN', 'NOK', 'NZD', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR']::TEXT[],
                ARRAY['Australian Dollar', 'Canadian Dollar', 'Swiss Franc', 'Chinese Yuan Renminbi (HK)', 'Czech Koruna', 'Danish Krone', 'Euro', 'British Pound', 'Hong Kong Dollar', 'Hungarian Forint', 'Israeli New Shekel','Indian Rupee', 'Japanese Yen', 'Mexican Peso', 'Norwegian Krone', 'New Zealand Dollar', 'Polish Zloty', 'Romanian Leu', 'Russian Ruble', 'Swedish Krona', 'Singapore Dollar', 'Thai Baht', 'Turkish Lira', 'U.S. Dollar', 'South African Rand']::TEXT[]
            )
)
INSERT INTO assets (symbol, current_price, prev_close, name, type) SELECT code, 1, 1, name, 2 FROM currency;
CREATE UNIQUE INDEX unique_asset on assets(symbol) WHERE NOT type = 3;

CREATE TABLE holdings (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, portfolio_id uuid, asset_id uuid, share_count NUMERIC, initial_value NUMERIC, realized NUMERIC, realized_initial NUMERIC, all_time_initial NUMERIC, CONSTRAINT fk_portfolio FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE, CONSTRAINT fk_asset FOREIGN KEY(asset_id) REFERENCES assets(id), created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO holdings (id, portfolio_id, asset_id, share_count, initial_value, realized, realized_initial, all_time_initial) VALUES ('10ffde40-5715-4176-8b14-37fbcd39e85f', (SELECT id FROM portfolios WHERE name='AUS EQUITIES'), (SELECT id FROM assets WHERE symbol='AAPL'), 4.43340, 640.18307280, 1034.89, 6691.61268600, 7331.7957588);
INSERT INTO holdings (id, portfolio_id, asset_id, share_count, initial_value) VALUES ('20ffde40-5715-4176-8b14-37fbcd39e85f', (SELECT id FROM portfolios WHERE name='AUS EQUITIES'), (SELECT id FROM assets WHERE symbol='TSLA'), 7.5713, 6860.10163446);
INSERT INTO holdings (id, portfolio_id, asset_id, share_count, initial_value, realized, realized_initial, all_time_initial) VALUES ('30ffde40-5715-4176-8b14-37fbcd39e85f', (SELECT id FROM portfolios WHERE name='U.S. EQUITIES'), (SELECT id FROM assets WHERE symbol='AAPL'), 6.7562, 1251.433590, -329.20, 1329.30, 2580.73359);
INSERT INTO holdings (id, portfolio_id, asset_id, share_count, initial_value, realized, realized_initial, all_time_initial) VALUES ('40ffde40-5715-4176-8b14-37fbcd39e85f', (SELECT id FROM portfolios WHERE name='U.S. EQUITIES'), (SELECT id FROM assets WHERE symbol='MSFT'), 4.8069, 1115.74722, 67.49, 367.860, 1483.60722);
INSERT INTO holdings (id, portfolio_id, asset_id, share_count, initial_value) VALUES ('50ffde40-5715-4176-8b14-37fbcd39e85f', (SELECT id FROM portfolios WHERE name='Commodities'), (SELECT id FROM assets WHERE symbol='TSLA'), 2.78, 2510.062);
INSERT INTO holdings (id, portfolio_id, asset_id, share_count, initial_value) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85f', (SELECT id FROM portfolios WHERE name='Commodities'), (SELECT id FROM assets WHERE symbol='MSFT'), 12, 2284.32);
INSERT INTO holdings (id, portfolio_id, asset_id, share_count, initial_value) VALUES ('70ffde40-5715-4176-8b14-37fbcd39e85f', (SELECT id FROM portfolios WHERE name='Commodities'), (SELECT id FROM assets WHERE symbol='NNOX'), 100.000009, 1049.7800944802);

CREATE TABLE transactions (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, holding_id uuid, type INT, sell_method INT, quantity NUMERIC, initial_price NUMERIC, timestamp timestamptz, exchange_rate NUMERIC, initial_value NUMERIC GENERATED ALWAYS AS (quantity*initial_price) STORED, CONSTRAINT fk_holding FOREIGN KEY(holding_id) REFERENCES holdings(id) ON DELETE CASCADE, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('11ffde40-5715-4176-8b14-37fbcd39e85a', '10ffde40-5715-4176-8b14-37fbcd39e85f', 0, 50.1289, 142.692, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('12ffde40-5715-4176-8b14-37fbcd39e85a', '10ffde40-5715-4176-8b14-37fbcd39e85f', 0, 1.2, 149.0023, 1.293, '2022-04-29T10:06:01.000Z');
INSERT INTO transactions (id, holding_id, type, sell_method, quantity, initial_price, exchange_rate, timestamp) VALUES ('13ffde40-5715-4176-8b14-37fbcd39e85a', '10ffde40-5715-4176-8b14-37fbcd39e85f', 1, 0, -13.68875, 153.27, 1.29, '2022-04-29T10:07:32.000Z');
INSERT INTO transactions (id, holding_id, type, sell_method, quantity, initial_price, exchange_rate, timestamp) VALUES ('14ffde40-5715-4176-8b14-37fbcd39e85a', '10ffde40-5715-4176-8b14-37fbcd39e85f', 1, 0, -33.20675, 153.27, 1.29, '2022-04-29T10:08:33.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('15ffde40-5715-4176-8b14-37fbcd39e85a', '20ffde40-5715-4176-8b14-37fbcd39e85f', 0, 3.9056, 934.11, 1.344, '2022-04-29T10:02:01.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('16ffde40-5715-4176-8b14-37fbcd39e85a', '20ffde40-5715-4176-8b14-37fbcd39e85f', 0, 3.6657, 876.1878, 1.344, '2022-04-29T10:02:02.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('17ffde40-5715-4176-8b14-37fbcd39e85a', '30ffde40-5715-4176-8b14-37fbcd39e85f', 0, 12.6562, 189.90, 1.344, '2022-04-29T10:02:03.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('18ffde40-5715-4176-8b14-37fbcd39e85a', '30ffde40-5715-4176-8b14-37fbcd39e85f', 0, 1.1, 161.2011, 1.344, '2022-04-29T10:02:04.000Z');
INSERT INTO transactions (id, holding_id, type, sell_method, quantity, initial_price, exchange_rate, timestamp) VALUES ('19ffde40-5715-4176-8b14-37fbcd39e85a', '30ffde40-5715-4176-8b14-37fbcd39e85f', 1, 0, -7, 142.8709, 1.344, '2022-04-29T10:02:05.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('20ffde40-5715-4176-8b14-37fbcd39e85a', '40ffde40-5715-4176-8b14-37fbcd39e85f', 0, 2.0069, 213.8, 1.344, '2022-04-29T10:02:05.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('21ffde40-5715-4176-8b14-37fbcd39e85a', '40ffde40-5715-4176-8b14-37fbcd39e85f', 0, 4.3, 245.24, 1.344, '2022-04-29T10:02:06.000Z');
INSERT INTO transactions (id, holding_id, type, sell_method, quantity, initial_price, exchange_rate, timestamp) VALUES ('22ffde40-5715-4176-8b14-37fbcd39e85a', '40ffde40-5715-4176-8b14-37fbcd39e85f', 1, 0, -1.5, 290.23, 1.344, '2022-04-29T10:02:07.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('23ffde40-5715-4176-8b14-37fbcd39e85a', '50ffde40-5715-4176-8b14-37fbcd39e85f', 0, 2.78, 902.90, 1.344, '2022-04-29T10:02:07.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('24ffde40-5715-4176-8b14-37fbcd39e85a', '60ffde40-5715-4176-8b14-37fbcd39e85f', 0, 12, 190.36, 1.344, '2022-04-29T10:02:08.000Z');
INSERT INTO transactions (id, holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ('25ffde40-5715-4176-8b14-37fbcd39e85a', '70ffde40-5715-4176-8b14-37fbcd39e85f', 0, 100.000009, 10.4978, 1.344, '2022-04-29T10:02:09.000Z');

CREATE TABLE sells (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, transaction_id uuid, sell_id uuid, quantity NUMERIC, sell_price NUMERIC, exchange_rate NUMERIC, initial_value NUMERIC GENERATED ALWAYS AS (quantity*sell_price) STORED, CONSTRAINT fk_transaction FOREIGN KEY(transaction_id) REFERENCES transactions(id) ON DELETE CASCADE, CONSTRAINT fk_sell FOREIGN KEY(sell_id) REFERENCES transactions(id) ON DELETE CASCADE, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO sells (transaction_id, sell_id, quantity, sell_price, exchange_rate) VALUES ('11ffde40-5715-4176-8b14-37fbcd39e85a', '13ffde40-5715-4176-8b14-37fbcd39e85a', 13.68875, 164.76, 1.344);
INSERT INTO sells (transaction_id, sell_id, quantity, sell_price, exchange_rate) VALUES ('11ffde40-5715-4176-8b14-37fbcd39e85a', '14ffde40-5715-4176-8b14-37fbcd39e85a', 33.20675, 164.76, 1.344);
INSERT INTO sells (transaction_id, sell_id, quantity, sell_price, exchange_rate) VALUES ('17ffde40-5715-4176-8b14-37fbcd39e85a', '19ffde40-5715-4176-8b14-37fbcd39e85a', 7, 142.8709, 1.344);
INSERT INTO sells (transaction_id, sell_id, quantity, sell_price, exchange_rate) VALUES ('21ffde40-5715-4176-8b14-37fbcd39e85a', '22ffde40-5715-4176-8b14-37fbcd39e85a', 1.5, 290.23, 1.344);

CREATE TABLE studies (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid, asset_id uuid, type INT, name TEXT, symbol TEXT, notes TEXT, question_one INT, question_two INT, question_three INT, question_four INT, question_five INT, question_six NUMERIC, question_seven NUMERIC, question_eight INT,
                      completed_qs INT GENERATED ALWAYS AS (CASE WHEN question_one IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_two IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_three IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_four IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_five IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_six IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_seven IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN question_eight IS NOT NULL THEN 1 ELSE 0 END) STORED,
                      created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO studies (user_id, asset_id, name, symbol, type, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', (SELECT id FROM assets WHERE symbol='AAPL'), 'Apple Inc', 'AAPL', 0, 7, 8, 6, 8, 4, 1.345, 4.5661, NULL);
INSERT INTO studies (user_id, asset_id, name, symbol, type, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', (SELECT id FROM assets WHERE symbol='TSLA'), 'Tesla', 'TSLA', 0, 4, 5, 3, 8, 6, 4.49, NULL, NULL);
INSERT INTO studies (user_id, asset_id, name, symbol, type, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', (SELECT id FROM assets WHERE symbol='MSFT'), 'Microsoft Inc', 'MSFT', 0, 7, 8, 6, 8, 4, NULL, NULL, NULL);
INSERT INTO studies (user_id, asset_id, name, symbol, type, notes, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', (SELECT id FROM assets WHERE symbol='TSLA'), 'Tesla', 'TSLA', 0, 'This study of Tesla was done following the leak that their car motors are powered by Hamsters in a wheel. Given the severity of this issue, I took the chance to re-evaluate my position as a Tesla shareholder.', 4, 5, 3, 8, 6, 4.49, 2.34, 7);
INSERT INTO studies (user_id, asset_id, name, symbol, type, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', (SELECT id FROM assets WHERE symbol='MSFT'), 'Microsoft Inc', 'MSFT', 0, 4, 5, 3, 9, 3, 5.98, 2.43, 4);
INSERT INTO studies (user_id, asset_id, name, symbol, type, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', (SELECT id FROM assets WHERE symbol='NNOX'), 'Nano X Technology', 'NNOX', 4, 5, 3, 4, 9, 3, 0.9, 3.3, 5);



CREATE OR REPLACE FUNCTION updateColumnUpdatedAt()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_update_time BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_portfolio_update_time BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_asset_update_time BEFORE UPDATE ON assets FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_holding_update_time BEFORE UPDATE ON holdings FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();
CREATE TRIGGER update_transaction_update_time BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE updateColumnUpdatedAt();



CREATE OR REPLACE FUNCTION uspReadTransactions(holding_id uuid) RETURNS TABLE (id uuid, type INT, symbol TEXT, exchange TEXT, name TEXT, initial_quantity NUMERIC, current_quantity NUMERIC, price NUMERIC, initial_value NUMERIC, current_value NUMERIC, total_change NUMERIC, daily_change NUMERIC, daily_percent NUMERIC, realized NUMERIC, realized_initial NUMERIC, all_time_initial NUMERIC) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
        SELECT t.id,
               t.type,
               a.symbol,
               a.exchange,
               a.name,
               t.quantity,
               COALESCE(t.quantity - SUM(s.quantity), t.quantity),
               t.initial_price,
               COALESCE(t.initial_value - (t.initial_price * SUM(s.quantity)), t.initial_value),
               COALESCE(a.current_price * (t.quantity - SUM(s.quantity)), a.current_price * t.quantity),
               COALESCE((a.current_price - t.initial_price) * (t.quantity - SUM(s.quantity)), (a.current_price - t.initial_price) * t.quantity),
               COALESCE((a.current_price * (t.quantity - SUM(s.quantity))) - (a.prev_close * (t.quantity - SUM(s.quantity))), (a.current_price * t.quantity) - (a.prev_close * t.quantity)),
               COALESCE(((a.current_price * (t.quantity - SUM(s.quantity))) - (a.prev_close * (t.quantity - SUM(s.quantity)))) * 100.0 / NULLIF(a.prev_close * (t.quantity - SUM(s.quantity)), 0), ((a.current_price * t.quantity) - (a.prev_close * t.quantity))*100.0 / (a.prev_close * t.quantity)),
               SUM(s.quantity * (s.sell_price - t.initial_price)),
               SUM(s.quantity * t.initial_price),
               t.initial_value
        FROM transactions as t
                 INNER JOIN holdings ON holdings.id = t.holding_id
                 INNER JOIN assets AS a ON holdings.asset_id = a.id
                 LEFT JOIN sells AS s ON t.id = s.transaction_id
        WHERE holdings.id = $1
        GROUP BY t.id, a.id, s.transaction_id
        ORDER BY MIN(t.timestamp) DESC;
END;
$$;


CREATE OR REPLACE FUNCTION uspUpdateHolding()
    RETURNS TRIGGER AS $$
BEGIN
    WITH txs AS (
        SELECT SUM(COALESCE(t.quantity - s.quantity, t.quantity)) as share_count,
               SUM(t.initial_price * COALESCE(t.quantity - s.quantity, t.quantity)) as initial_value
        FROM transactions AS t
                 LEFT JOIN (
            SELECT SUM(quantity) as quantity,
                   transaction_id,
                   COUNT(sell_id) as sell_count
            FROM sells
            GROUP BY transaction_id
        ) AS s ON t.id = s.transaction_id
        WHERE t.holding_id = NEW.holding_id AND t.type = 0
    )
    UPDATE holdings
    SET share_count = txs.share_count,
        initial_value = txs.initial_value
    FROM txs
    WHERE id = NEW.holding_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_holding_calculations AFTER INSERT OR UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE uspUpdateHolding();