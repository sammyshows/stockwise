DROP DATABASE IF EXISTS stockwise;


-- Create the db
CREATE DATABASE stockwise;

-- Move into the db
\c stockwise

-- Create our table if it doesn't already exist
CREATE TABLE users (user_id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(user_id) , email VARCHAR ( 50 ) UNIQUE NOT NULL);
INSERT INTO users (email) VALUES ('sammymac.eng@gmail.com');

CREATE TABLE portfolios (portfolio_id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(portfolio_id), user_id INT, name VARCHAR ( 50 ) NOT NULL, included BOOLEAN);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT user_id FROM users WHERE email='sammymac.eng@gmail.com'), 'AUS EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT user_id FROM users WHERE email='sammymac.eng@gmail.com'), 'U.S. EQUITIES', TRUE);

CREATE TABLE assets (asset_id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(asset_id), current_price NUMERIC(10,3), prev_close NUMERIC(10,3), symbol TEXT, name TEXT, exchange TEXT);
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('aapl', 293.98, 282.71, 'Apple Technologies', 'NASDAQ');
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('tsla', 189.92, 180.71, 'Tesla Motor Company', 'NASDAQ');

CREATE TABLE holdings (holding_id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(holding_id), portfolio_id INT, asset_id INT, CONSTRAINT fk_portfolio FOREIGN KEY(portfolio_id) REFERENCES portfolios(portfolio_id), CONSTRAINT fk_asset FOREIGN KEY(asset_id) REFERENCES assets(asset_id));
INSERT INTO holdings (portfolio_id, asset_id) VALUES (1, 1);
INSERT INTO holdings (portfolio_id, asset_id) VALUES (1, (SELECT asset_id FROM assets WHERE symbol = 'tsla'));
INSERT INTO holdings (portfolio_id, asset_id) VALUES (2, 1);

CREATE TABLE transactions (transaction_id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(transaction_id), holding_id INT, type TEXT, quantity NUMERIC(10,3), initial_price NUMERIC(10,3), date DATE NOT NULL DEFAULT CURRENT_DATE, exchange_rate NUMERIC(10,3), CONSTRAINT fk_holding FOREIGN KEY(holding_id) REFERENCES holdings(holding_id));
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (1, 'BUY', 3, 187.69, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (1, 'BUY', 1, 295.00, 1.293);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (2, 'BUY', 3, 172.11, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (2, 'BUY', 3, 156.18, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (3, 'BUY', 12, 180.90, 1.344);

CREATE FUNCTION uspReadPortfolios() RETURNS TABLE (id INT, name VARCHAR(50), transaction_count BIGINT, initial_value NUMERIC(10,3), current_value NUMERIC (10,3), total_percent NUMERIC (10,2), daily_value NUMERIC(10,3), daily_percent NUMERIC(10,2)) LANGUAGE plpgsql AS $$ DECLARE portfolio RECORD;
BEGIN FOR portfolio IN SELECT portfolio_id AS id, portfolios.name FROM portfolios LOOP
RETURN QUERY
SELECT portfolio.id,
       portfolio.name,
       count(transactions),
       ROUND(Sum(initial_price*quantity), 2),
       ROUND(Sum(current_price*quantity), 2),
       ROUND((Sum(current_price*quantity)-Sum(initial_price*quantity))*100.0 / Sum(initial_price*quantity), 2),
       ROUND(Sum(current_price*quantity)-Sum(prev_close*quantity), 2),
       ROUND((Sum(current_price*quantity)-Sum(prev_close*quantity))*100.0 / Sum(prev_close*quantity), 2)
FROM transactions
    INNER JOIN holdings ON holdings.holding_id = transactions.holding_id
    INNER JOIN assets ON holdings.asset_id = assets.asset_id
WHERE portfolio_id = portfolio.id;
END LOOP;
END;
$$;

