import fetch from 'node-fetch'
import jwkToPem from "jwk-to-pem"
import jwt from "jsonwebtoken"
let jwks = {}

const verifyJwt = (handler) => async (event, context) => {
    console.log('httpMethod', event.httpMethod)
    console.log(event)
    if (event.httpMethod == 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization'
            }
        }
    }

    const updateJwks = async (): Promise<void> => {
        jwks = await fetch(`https://cognito-idp.${process.env.AWS_POOL_REGION}.amazonaws.com/${process.env.AWS_POOL_ID}/.well-known/jwks.json`)
            .then(response => response.json())
    }

    const validToken = async (token): Promise<Boolean> => {
        if (jwks == {})
            await updateJwks()

        let pems = {}
        let keys = jwks['keys']
        for (let i = 0; i < keys.length; i++) {
            // Convert each key to PEM
            let key_id = keys[i].kid
            let modulus = keys[i].n
            let exponent = keys[i].e
            let key_type = keys[i].kty
            let jwk = { kty: key_type, n: modulus, e: exponent }
            let pem = jwkToPem(jwk)
            pems[key_id] = pem
        }
        // validate the token
        let decodedJwt = jwt.decode(token, {complete: true})
        if (!decodedJwt) {
            console.log("Not a valid JWT token")
            return false
        }

        let kid = decodedJwt.header.kid
        let pem = pems[kid]
        if (!pem) {
            console.log('Invalid token.')
            throw 'Invalid token.'
            return false
        }

        return jwt.verify(token, pem, function (err) {
            if (err) {
                console.log("Invalid token..")
                return false
            } else {
                console.log("Valid token.")
                return true
            }
        })
    }

    const isValidToken = await validToken(event.headers.authorization)
        .catch(async () => {
            console.log('Fetching current jwks')
            await updateJwks()
            return await validToken(event.headers.authorization)
        })

    if (isValidToken)
        return handler(event, context)
    else
        return {
            'statusCode': 401
        }
}

module.exports.requireAuth = verifyJwt;