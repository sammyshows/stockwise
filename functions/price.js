import fetch from 'node-fetch'

exports.handler = async function (event, context) {
  const eventBody = JSON.parse(event.body)

  // const data = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${eventBody.symbol}&apikey=B642KXFN4VUO0FC2`, {
  //   "method": "GET"
  // })
  //   .then(response => response.json())
  //   .then(quote => quote["Global Quote"])

  return {
    statusCode: 200,
    body: JSON.stringify({
      price: eventBody
    })
  }
}
