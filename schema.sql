\c stockwise

DROP TABLE IF EXISTS studies;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS users;
DROP FUNCTION uspReadTransactions(holding_id INT);
DROP FUNCTION uspUpdateHolding(holding_id INT);


CREATE TABLE users (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id) , email VARCHAR ( 50 ) UNIQUE NOT NULL, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO users (email) VALUES ('sammymac.eng@gmail.com');

CREATE TABLE portfolios (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), user_id INT, name VARCHAR ( 50 ) NOT NULL, included BOOLEAN, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'AUS EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'U.S. EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'Commodities', TRUE);

CREATE TABLE assets (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), current_price NUMERIC, prev_close NUMERIC, symbol TEXT UNIQUE, name TEXT, exchange TEXT, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('AAPL', 158.98, 157.71, 'Apple Inc', 'NASDAQ');
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('TSLA', 882.92, 883.29, 'Tesla', 'NASDAQ');
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('MSFT', 280.18, 278.30, 'Microsoft Inc', 'NASDAQ');
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('NNOX', 10.22, 10.76, 'Nano X Technology', 'NASDAQ');

CREATE TABLE holdings (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), portfolio_id INT, asset_id INT, share_count NUMERIC, initial_value NUMERIC, transaction_count INT, CONSTRAINT fk_portfolio FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE, CONSTRAINT fk_asset FOREIGN KEY(asset_id) REFERENCES assets(id), created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (1, 1, 4.3289, 625.2717588, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (1, (SELECT id FROM assets WHERE symbol = 'TSLA'), 7.5713, 6860.10163446, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (2, 1, 13.7562, 2580.733590, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (2, 3, 6.3069, 1483.60722, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (3, 2, 2.78, 2510.0620, 1);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (3, 3, 12, 2284.32, 1);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (3, 4, 100.000009, 1049.7800944802, 1);

CREATE TABLE transactions (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), holding_id INT, type INT, quantity NUMERIC, initial_price NUMERIC, timestamp timestamptz, exchange_rate NUMERIC, initial_value NUMERIC GENERATED ALWAYS AS (quantity*initial_price) STORED, CONSTRAINT fk_holding FOREIGN KEY(holding_id) REFERENCES holdings(id) ON DELETE CASCADE, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (1, 0, 50.1289, 142.692, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (1, 0, 1.2, 149.0023, 1.293, '2022-04-29T10:02:01.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (1, 1, 13.68875, 153.27, 1.29, '2022-04-29T10:02:32.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (2, 0, 3.9056, 934.11, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (2, 0, 3.6657, 876.1878, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (3, 0, 12.6562, 189.90, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (3, 0, 1.1, 161.2011, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (4, 0, 2.0069, 213.8, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (4, 0, 4.3, 245.24, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (5, 0, 2.78, 902.90, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (6, 0, 12, 190.36, 1.344, '2022-04-29T10:02:00.000Z');
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) VALUES (7, 0, 100.000009, 10.4978, 1.344, '2022-04-29T10:02:00.000Z');

CREATE TABLE studies (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), user_id INT, asset_id INT, type INT, completed BOOLEAN, question_one INT, question_two INT, question_three INT, question_four INT, question_five INT, question_six NUMERIC, question_seven NUMERIC, question_eight INT, created_at timestamptz default now(), updated_at timestamptz default now());
INSERT INTO studies (user_id, asset_id, type, completed, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight) VALUES (1, 1, 0, FALSE, 7, 8, 6, 8, 4, 1.345, 4.5661, NULL);
INSERT INTO studies (user_id, asset_id, type, completed, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight) VALUES (1, 2, 0, FALSE, 4, 5, 3, 8, 6, 4.49, NULL, NULL);
INSERT INTO studies (user_id, asset_id, type, completed, question_one, question_two, question_three, question_four, question_five, question_six, question_seven, question_eight) VALUES (1, 3, 0, FALSE, 4, 5, 3, 9, NULL, NULL, NULL, NULL);


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



CREATE OR REPLACE FUNCTION uspReadTransactions(holding_id INT) RETURNS TABLE (id INT, type INT, symbol TEXT, exchange TEXT, name TEXT, shares NUMERIC, price NUMERIC, initial_value NUMERIC, current_value NUMERIC, total_change NUMERIC, daily_change NUMERIC, daily_percent NUMERIC) LANGUAGE plpgsql AS $$
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

CREATE TRIGGER update_holding_calculations AFTER INSERT ON transactions FOR EACH ROW EXECUTE PROCEDURE uspUpdateHolding();
CREATE TRIGGER update_holding_calculations AFTER UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE uspUpdateHolding();



