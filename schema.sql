-- Move into the db
\c stockwise

SELECT 'DROP FUNCTION ' || ns.nspname || '.' || proname
           || ';'
FROM pg_proc INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
WHERE ns.nspname = 'public'  order by proname;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS users;

-- Create our table if it doesn't already exist
CREATE TABLE users (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id) , email VARCHAR ( 50 ) UNIQUE NOT NULL);
INSERT INTO users (email) VALUES ('sammymac.eng@gmail.com');

CREATE TABLE portfolios (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), user_id INT, name VARCHAR ( 50 ) NOT NULL, included BOOLEAN);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'AUS EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'U.S. EQUITIES', TRUE);
INSERT INTO portfolios (user_id, name, included) VALUES ((SELECT id FROM users WHERE email='sammymac.eng@gmail.com'), 'Commodities', TRUE);

CREATE TABLE assets (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), current_price NUMERIC(50,20), prev_close NUMERIC(50,20), symbol TEXT UNIQUE, name TEXT, exchange TEXT);
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('AAPL', 293.98, 282.71, 'Apple Inc', 'NASDAQ');
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('TSLA', 189.92, 180.29, 'Tesla', 'NASDAQ');
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('MSFT', 120.58, 127.30, 'Microsoft Inc', 'NASDAQ');
INSERT INTO assets (symbol, current_price, prev_close, name, exchange) VALUES ('NNOX', 12.22, 11.76, 'Nano X Technology', 'NASDAQ');

CREATE TABLE holdings (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), portfolio_id INT, asset_id INT, share_count NUMERIC(50,20), initial_value NUMERIC(50,20), transaction_count INT, CONSTRAINT fk_portfolio FOREIGN KEY(portfolio_id) REFERENCES portfolios(id), CONSTRAINT fk_asset FOREIGN KEY(asset_id) REFERENCES assets(id));
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (1, 1, 4, 858.07, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (1, (SELECT id FROM assets WHERE symbol = 'TSLA'), 6, 984.87, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (2, 1, 13, 2347, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (2, 3, 6, 736.66, 2);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (3, 2, 2, 335.8, 1);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (3, 3, 12, 580.32, 1);
INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) VALUES (3, 4, 100, 1049.00, 1);

CREATE TABLE transactions (id INT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id), holding_id INT, type TEXT, quantity NUMERIC(50,20), initial_price NUMERIC(50,20), date DATE NOT NULL DEFAULT CURRENT_DATE, exchange_rate NUMERIC(50,20), CONSTRAINT fk_holding FOREIGN KEY(holding_id) REFERENCES holdings(id) ON DELETE CASCADE);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (1, 'BUY', 3, 187.69, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (1, 'BUY', 1, 295.00, 1.293);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (2, 'BUY', 3, 172.11, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (2, 'BUY', 3, 156.18, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (3, 'BUY', 12, 180.90, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (3, 'BUY', 1, 176.20, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (4, 'BUY', 2, 109.85, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (4, 'BUY', 4, 129.24, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (5, 'BUY', 2, 167.90, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (6, 'BUY', 12, 48.36, 1.344);
INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) VALUES (7, 'BUY', 100, 10.49, 1.344);

CREATE FUNCTION uspReadPortfolios() RETURNS TABLE (id INT, name VARCHAR(50), transaction_count BIGINT, initial_value NUMERIC(50,20), current_value NUMERIC (50,20), total_percent NUMERIC (10,2), daily_value NUMERIC(50,20), daily_percent NUMERIC(10,2)) LANGUAGE plpgsql AS $$ DECLARE portfolio RECORD;
BEGIN FOR portfolio IN SELECT portfolios.id, portfolios.name FROM portfolios LOOP
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
    INNER JOIN holdings ON holdings.id = transactions.holding_id
    INNER JOIN assets ON holdings.asset_id = assets.id
WHERE portfolio_id = portfolio.id;
END LOOP;
END;
$$;


CREATE FUNCTION uspReadHoldings(portfolio_id INT) RETURNS TABLE (id INT, portfolio VARCHAR(50), symbol TEXT, exchange TEXT, name TEXT, transaction_count BIGINT, initial_value NUMERIC(50,20), current_value NUMERIC (50,20), total_percent NUMERIC (10,2), daily_value NUMERIC(50,20), daily_percent NUMERIC(10,2)) LANGUAGE plpgsql AS $$ DECLARE portfolio RECORD;
BEGIN
    RETURN QUERY
        SELECT holdings.id,
               portfolios.name,
               assets.symbol,
               assets.exchange,
               assets.name,
               count(transactions),
               ROUND(Sum(initial_price*quantity), 2),
               ROUND(Sum(current_price*quantity), 2),
               ROUND((Sum(current_price*quantity)-Sum(initial_price*quantity))*100.0 / Sum(initial_price*quantity), 2),
               ROUND(Sum(current_price*quantity)-Sum(prev_close*quantity), 2),
               ROUND((Sum(current_price*quantity)-Sum(prev_close*quantity))*100.0 / Sum(prev_close*quantity), 2)
        FROM transactions
                 INNER JOIN holdings ON holdings.id = transactions.holding_id
                 INNER JOIN assets ON holdings.asset_id = assets.id
                 INNER JOIN portfolios ON holdings.portfolio_id = portfolios.id
        WHERE portfolios.id = $1
        GROUP BY holdings.id, assets.id, portfolios.id;
END;
$$;


CREATE FUNCTION uspReadTransactions(holding_id INT) RETURNS TABLE (id INT, symbol TEXT, exchange TEXT, name TEXT, shares NUMERIC(50,20), price NUMERIC(50,20), initial_value NUMERIC(50,20), current_value NUMERIC (50,20), total_percent NUMERIC (10,2), daily_value NUMERIC(50,20), daily_percent NUMERIC(10,2)) LANGUAGE plpgsql AS $$ DECLARE portfolio RECORD;
BEGIN
    RETURN QUERY
        SELECT transactions.id,
               assets.symbol,
               assets.exchange,
               assets.name,
               ROUND(transactions.quantity, 3),
               ROUND(transactions.initial_price, 3),
               ROUND(initial_price*quantity, 2),
               ROUND(current_price*quantity, 2),
               ROUND((current_price*quantity-initial_price*quantity)*100.0 / (initial_price*quantity), 2),
               ROUND(current_price*quantity-prev_close*quantity, 2),
               ROUND((current_price*quantity-prev_close*quantity)*100.0 / (prev_close*quantity), 2)
        FROM transactions
                 INNER JOIN holdings ON holdings.id = transactions.holding_id
                 INNER JOIN assets ON holdings.asset_id = assets.id
        WHERE holdings.id = $1;
END;
$$;

