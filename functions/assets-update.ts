import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = async () => {
    // Get all the asset symbols
  // TAKEN FROM QUERY BELOW - UNCOMMENT FOR FOREX UPDATES 'SELECT type ... WHERE ... OR type = 1'
    const assets = await client`
        SELECT DISTINCT a.symbol, a.type FROM assets AS a LEFT OUTER JOIN holdings AS h ON h.asset_id = a.id WHERE type = 0 AND h.asset_id IS NOT NULL;`

    const stockSymbolArray = assets.filter(asset => asset.type === 0).map(stock => stock.symbol)
  // UNCOMMENT FOR FOREX UPDATES const forexSymbolArray = assets.filter(asset => asset.type === 1).map(forex => forex.symbol)

    // Use the symbols from above to do a batch call to the IEX Cloud API for quotes on all of them.
    // At the time of writing a batch is limited to 100 symbols at a time, so when we surpass that, we should split the
    // symbols array into groups of 100 and call each group individually
    let stockData;
  // UNCOMMENT FOR FOREX UPDATES let forexData;

    const getStockData = () => fetch(`https://cloud.iexapis.com/stable/stock/market/batch?symbols=${stockSymbolArray.join(',')}&types=quote&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    // UNCOMMENT FOR FOREX UPDATES const getForexData = () => fetch(`https://cloud.iexapis.com/stable/fx/latest?symbols=${forexSymbolArray.join(',')}&token=${process.env.IEXTOKEN}`)
    //     .then(response => response.json())

    // TAKEN FROM ARRAY BELOW - UNCOMMENT FOR FOREX UPDATES ', getForexData()'
    await Promise.all([getStockData()])
        .then(result => {
            stockData = result[0]
          // UNCOMMENT FOR FOREX UPDATES forexData = result[1]
        })

    // Sometimes a quote will have null price fields (generally the niche quotes), but Postgres expects that this data
    // be typed if we want to UNNEST it (below). Therefore, we use a NUMERIC type for prices and filter out the null values
    const stockFilteredData = Object.values(stockData).filter(asset => asset["quote"].symbol && asset["quote"].latestPrice && asset["quote"].previousClose)

    // Get an array of all values for each required field. Then we can turn these into rows and use them in the update below
    const stockSymbols = Object.values(stockFilteredData).map(asset => asset["quote"].symbol)
    const stockCurrentPrices = Object.values(stockFilteredData).map(asset => asset["quote"].latestPrice)
    const stockPrevCloses = Object.values(stockFilteredData).map(asset => asset["quote"].previousClose)

    // UNCOMMENT FOR FOREX UPDATES const forexFilteredData = forexData.filter(forex => forex.symbol && forex.rate)

    // UNCOMMENT FOR FOREX UPDATES const forexSymbols = forexData.map(forex => forex.symbol)
  // UNCOMMENT FOR FOREX UPDATES const forexRates = forexData.map(forex => forex.rate)

    const updateStocks = () => client`
    WITH asset (symbol, current_price, prev_close) AS (
        SELECT * 
        FROM 
            UNNEST(
                ${stockSymbols}::TEXT[],
                ${stockCurrentPrices}::NUMERIC[],
                ${stockPrevCloses}::NUMERIC[]
            )
    )
    UPDATE 
        assets
        SET current_price = asset.current_price,
            prev_close = asset.prev_close
        FROM asset
        WHERE assets.symbol = asset.symbol AND type = 0;`

  // UNCOMMENT FOR FOREX UPDATES const updateForexs = () => client`
  //   WITH asset (symbol, current_price) AS (
  //       SELECT *
  //       FROM
  //           UNNEST(
  //               ${forexSymbols}::TEXT[],
  //               ${forexRates}::NUMERIC[]
  //           )
  //   )
  //   UPDATE
  //       assets
  //       SET current_price = asset.current_price
  //       FROM asset
  //       WHERE assets.symbol = asset.symbol AND type = 1;`

  // TAKEN FROM ARRAY BELOW - UNCOMMENT FOR FOREX UPDATES ', updateForexs()'
    await Promise.all([updateStocks()])

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
}

export { handler }