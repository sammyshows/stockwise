import fetch from 'node-fetch'
const AWS = require('aws-sdk');
import cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken"
const client = require("../database/client.ts")


exports.handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    let accessToken
    let idToken
    let refreshToken
    let accessCookie
    let idCookie
    let refreshCookie

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

    const response = await fetch(`${process.env.AWS_AUTH_URL}/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=authorization_code&client_id=${process.env.AWS_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DOMAIN + '/portfolios')}&code=${eventBody.code}`
    }).then(res => res.json())

    accessToken = response["access_token"]
    idToken = response["id_token"]
    refreshToken = response["refresh_token"]

    const userId = jwt.decode(idToken)?.["custom:sw_user_id"]

    if (idToken && !userId) {
        const cognito = new AWS.CognitoIdentityServiceProvider();
        const username = jwt.decode(accessToken)["username"]
        const email = jwt.decode(idToken)["email"]
        const uuid = uuidv4()
        const params = {
            UserAttributes: [
                {
                    Name: 'custom:sw_user_id',
                    Value: uuid
                }
            ],
            UserPoolId: process.env.AWS_POOL_ID,
            Username: username
        }

        await new Promise((resolve, reject): void => {
            cognito.adminUpdateUserAttributes(params, async (error, session): Promise<void> => {
                if (error) {
                    resolve(console.log(error.message))
                }

                resolve(
                    await client`
                    INSERT INTO users (id, email)
                    VALUES (${uuid}, ${email}) ON CONFLICT (email) 
                    DO NOTHING;`
                )
            })
        })
    }


    setCookies()
    if (accessToken && idToken && refreshToken) {
        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': [ accessCookie, idCookie, refreshCookie ],
                'Cache-Control': 'no-cache',
                'Content-Type': 'text/html'
            }
        }
    } else {
        return {
            statusCode: 500
        }
    }

}