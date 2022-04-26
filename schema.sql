\c stockwise

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS users;


CREATE TABLE users (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id) , email VARCHAR ( 50 ) UNIQUE NOT NULL, created_at timestamp default now(), updated_at timestamp default now());
INSERT INTO users (email) VALUES ('sammymac.eng@gmail.com');

CREATE TABLE portfolios (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), user_id INT, name VARCHAR ( 50 ) NOT NULL, included BOOLEAN, created_at timestamp default now(), updated_at timestamp default now());
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'AUS EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'U.S. EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'Commodities', TRUE);

CREATE TABLE assets (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), current_price NUMERIC, prev_close NUMERIC, symbol TEXT UNIQUE, name TEXT, exchange TEXT, created_at timestamp default now(), updated_at timestamp default now());
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('AAPL', 293.98, 282.71, 'Apple Inc', 'NASDAQ');
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('TSLA', 189.92, 180.29, 'Tesla', 'NASDAQ');
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('MSFT', 120.58, 127.30, 'Microsoft Inc', 'NASDAQ');
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('NNOX', 12.22, 11.76, 'Nano X Technology', 'NASDAQ');

CREATE TABLE holdings (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), portfolio_id INT, asset_id INT, share_count NUMERIC, initial_value NUMERIC, transaction_count INT, CONSTRAINT fk_portfolio FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE, CONSTRAINT fk_asset FOREIGN KEY(asset_id) REFERENCES assets(id), created_at timestamp default now(), updated_at timestamp default now());
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (1, 1, 4, 858.07, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (1, (SELECT id FROM assets WHERE symbol = 'TSLA'), 6, 984.87, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (2, 1, 13, 2347, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (2, 3, 6, 736.66, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (3, 2, 2, 335.8, 1);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (3, 3, 12, 580.32, 1);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (3, 4, 100, 1049.00, 1);

CREATE TABLE transactions (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), holding_id INT, type TEXT, quantity NUMERIC, initial_price NUMERIC, date DATE NOT NULL DEFAULT CURRENT_DATE, exchange_rate NUMERIC, initial_value NUMERIC GENERATED ALWAYS AS (quantity*initial_price) STORED, CONSTRAINT fk_holding FOREIGN KEY(holding_id) REFERENCES holdings(id) ON DELETE CASCADE, created_at timestamp default now(), updated_at timestamp default now());
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (1, 'BUY', 3.1289, 187.692, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (1, 'BUY', 1.2, 295.0023, 1.293);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (2, 'BUY', 3.9056, 172.11, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (2, 'BUY', 3.6657, 156.1878, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (3, 'BUY', 12.6562, 180.90, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (3, 'BUY', 1.1, 176.2011, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (4, 'BUY', 2.0069, 109.8, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (4, 'BUY', 4.3, 129.24, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (5, 'BUY', 2.78, 167.90, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (6, 'BUY', 12, 48.36, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (7, 'BUY', 100.000009, 10.4978, 1.344);


CREATE OR REPLACE FUNCTION update_column_updated_at()
    RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_update_time BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_column_updated_at();
CREATE TRIGGER update_portfolio_update_time BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE PROCEDURE update_column_updated_at();
CREATE TRIGGER update_asset_update_time BEFORE UPDATE ON assets FOR EACH ROW EXECUTE PROCEDURE update_column_updated_at();
CREATE TRIGGER update_holding_update_time BEFORE UPDATE ON holdings FOR EACH ROW EXECUTE PROCEDURE update_column_updated_at();
CREATE TRIGGER update_transaction_update_time BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_column_updated_at();



CREATE OR REPLACE FUNCTION uspReadTransactions(holding_id INT) RETURNS TABLE (id INT, symbol TEXT, exchange TEXT, name TEXT, shares NUMERIC, price NUMERIC, initial_value NUMERIC, current_value NUMERIC, total_change NUMERIC, daily_change NUMERIC, daily_percent NUMERIC) LANGUAGE plpgsql AS $$ DECLARE portfolio RECORD;
BEGIN
    RETURN QUERY
        SELECT transactions.id,
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
        ORDER BY transactions.created_at;
END;
$$;

