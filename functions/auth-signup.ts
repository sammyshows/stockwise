import cookie from 'cookie'
import { CognitoUserPool, CognitoUserAttribute } from "amazon-cognito-identity-js"
import { v4 as uuidv4 } from 'uuid';
const client = require("../database/client.ts")


exports.handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    let cognitoUser
    let errorMessage
    let accessToken
    let idToken
    let refreshToken
    let accessCookie
    let idCookie
    let refreshCookie
    let userPool = new CognitoUserPool({
        UserPoolId : process.env.AWS_POOL_ID,
        ClientId : process.env.AWS_CLIENT_ID
    })

    const setCookies = () => {
        const thirtyDays = 30 * 24 * 3600000
        accessCookie = cookie.serialize('sw_access_token', accessToken, {
            secure: true,
            httpOnly: true,
            path: '/',
            maxAge: thirtyDays
        })

        idCookie = cookie.serialize('sw_id_token', idToken, {
            secure: true,
            httpOnly: true,
            path: '/',
            maxAge: thirtyDays
        })

        refreshCookie = cookie.serialize('sw_refresh_token', refreshToken, {
            secure: true,
            httpOnly: true,
            path: '/',
            maxAge: thirtyDays
        })
    }

    const uuid = uuidv4()

    const emailAttribute = new CognitoUserAttribute({ Name: 'email', Value: eventBody.email })
    const userId = new CognitoUserAttribute({ Name: 'custom:sw_user_id', Value: uuid })
    let attributes = [ emailAttribute, userId ]

    await new Promise((resolve) => {
        userPool.signUp(eventBody.email, eventBody.password, attributes, null, async (error, result) => {
            if (error) {
                console.log(error)
                resolve(errorMessage = error["code"])
            } else {
                await client`
                    INSERT INTO users (id, email)
                    VALUES (${uuid}, ${eventBody.email});`

                resolve(cognitoUser = result.user)
            }
        })
    })

    if (errorMessage) {
        return {
            statusCode: 303,
            body: JSON.stringify({
                errorMessage: errorMessage
            })
        }
    } else {
        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': [ accessCookie, idCookie, refreshCookie ],
                'Cache-Control': 'no-cache',
                'Content-Type': 'text/html'
            }
        }
    }
}