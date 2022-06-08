DROP TABLE IF EXISTS studies;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS users;
DROP FUNCTION uspReadTransactions;
DROP FUNCTION uspUpdateHolding;


CREATE TABLE users (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, email VARCHAR ( 50 ) UNIQUE NOT NULL, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO users (id, email) VALUES ('60ffde40-5715-4176-8b14-37fbcd39e85d', 'sammymac.eng@gmail.com');

CREATE TABLE portfolios (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid, name VARCHAR ( 50 ) NOT NULL, included BOOLEAN, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'AUS EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'U.S. EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'Commodities', TRUE);

CREATE TABLE assets (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, current_price NUMERIC, prev_close NUMERIC, symbol TEXT, name TEXT, exchange TEXT, type INT, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO assets (symbol, current_price, prev_close, name, exchange, type) VALUES ('AAPL', 158.98, 157.71, 'Apple Inc', 'NASDAQ', 0);
INSERT INTO assets (symbol, current_price, prev_close, name, exchange, type) VALUES ('TSLA', 882.92, 883.29, 'Tesla', 'NASDAQ', 0);
INSERT INTO assets (symbol, current_price, prev_close, name, exchange, type) VALUES ('MSFT', 280.18, 278.30, 'Microsoft Inc', 'NASDAQ', 0);
INSERT INTO assets (symbol, current_price, prev_close, name, exchange, type) VALUES ('NNOX', 10.22, 10.76, 'Nano X Technology', 'NASDAQ', 0);
CREATE UNIQUE INDEX unique_asset on assets(symbol) WHERE NOT type = 3;

CREATE TABLE holdings (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, portfolio_id uuid, asset_id uuid, share_count NUMERIC, initial_value NUMERIC, transaction_count INT, CONSTRAINT fk_portfolio FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE, CONSTRAINT fk_asset FOREIGN KEY(asset_id) REFERENCES assets(id), created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES ((SELECT id FROM portfolios WHERE name='AUS EQUITIES'), (SELECT id FROM assets WHERE symbol='AAPL'), 51.3289, 7331.7957588, 3);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES ((SELECT id FROM portfolios WHERE name='AUS EQUITIES'), (SELECT id FROM assets WHERE symbol='TSLA'), 7.5713, 6860.10163446, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES ((SELECT id FROM portfolios WHERE name='U.S. EQUITIES'), (SELECT id FROM assets WHERE symbol='AAPL'), 13.7562, 2580.73359, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES ((SELECT id FROM portfolios WHERE name='U.S. EQUITIES'), (SELECT id FROM assets WHERE symbol='MSFT'), 6.3069, 1483.60722, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES ((SELECT id FROM portfolios WHERE name='Commodities'), (SELECT id FROM assets WHERE symbol='TSLA'), 2.78, 2510.062, 1);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES ((SELECT id FROM portfolios WHERE name='Commodities'), (SELECT id FROM assets WHERE symbol='MSFT'), 12, 2284.32, 1);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES ((SELECT id FROM portfolios WHERE name='Commodities'), (SELECT id FROM assets WHERE symbol='NNOX'), 100.000009, 1049.7800944802, 1);

CREATE TABLE transactions (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, holding_id uuid, type INT, quantity NUMERIC, initial_price NUMERIC, timestamp timestamptz, exchange_rate NUMERIC, initial_value NUMERIC GENERATED ALWAYS AS (quantity*initial_price) STORED, CONSTRAINT fk_holding FOREIGN KEY(holding_id) REFERENCES holdings(id) ON DELETE CASCADE, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=7331.7957588), 0, 50.1289, 142.692, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=7331.7957588), 0, 1.2, 149.0023, 1.293, '2022-04-29T10:02:01.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=7331.7957588 ), 1, 13.68875, 153.27, 1.29, '2022-04-29T10:02:32.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=6860.10163446), 0, 3.9056, 934.11, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=6860.10163446), 0, 3.6657, 876.1878, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=2580.73359), 0, 12.6562, 189.90, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=2580.73359), 0, 1.1, 161.2011, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=1483.60722), 0, 2.0069, 213.8, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=1483.60722), 0, 4.3, 245.24, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=2510.0620), 0, 2.78, 902.90, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=2284.32), 0, 12, 190.36, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES ((SELECT id FROM holdings WHERE initial_value=1049.7800944802), 0, 100.000009, 10.4978, 1.344, '2022-04-29T10:02:00.000Z');

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



CREATE OR REPLACE FUNCTION uspReadTransactions(holding_id uuid) RETURNS TABLE (id uuid, type INT, symbol TEXT, exchange TEXT, name TEXT, shares NUMERIC, price NUMERIC, initial_value NUMERIC, current_value NUMERIC, total_change NUMERIC, daily_change NUMERIC, daily_percent NUMERIC) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
        SELECT transactions.id,
               transactions.type,
               assets.symbol,
               assets.exchange,
               assets.name,
               ROUND(quantity, 3),
               ROUND(initial_price, 3),
               transactions.initial_value,
               ROUND(current_price*quantity, 2),
               (current_price - initial_price) * quantity,
               ROUND(current_price*quantity-prev_close*quantity, 2),
               ROUND((current_price*quantity-prev_close*quantity)*100.0 / (prev_close*quantity), 2)
        FROM transactions
                 INNER JOIN holdings ON holdings.id = transactions.holding_id
                 INNER JOIN assets ON holdings.asset_id = assets.id
        WHERE holdings.id = $1
        ORDER BY transactions.timestamp DESC;
END;
$$;


CREATE OR REPLACE FUNCTION uspUpdateHolding()
    RETURNS TRIGGER AS $$
    BEGIN
        WITH txs AS (
            SELECT SUM(quantity) as share_count,
                   SUM(initial_value) as initial_value,
                   COUNT(*) as transaction_count
            FROM transactions
            WHERE transactions.holding_id = NEW.holding_id
        )
        UPDATE holdings
        SET share_count = txs.share_count,
            initial_value = txs.initial_value,
            transaction_count = txs.transaction_count
        FROM txs
        WHERE id = NEW.holding_id;
        RETURN NEW;
    END;
$$ language 'plpgsql';

CREATE TRIGGER update_holding_calculations AFTER INSERT OR UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE uspUpdateHolding();



