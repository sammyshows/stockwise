import fetch from 'node-fetch'
const AWS = require('aws-sdk');
import cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken"
import { CognitoRefreshToken, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
const client = require("../database/client.ts")


exports.handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

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

    const response = await fetch(`${process.env.AWS_AUTH_URL}/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=authorization_code&client_id=${process.env.AWS_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DOMAIN)}&code=${eventBody.code}`
    }).then(res => {
        return res.json()
    })

    accessToken = response["access_token"]
    idToken = response["id_token"]
    refreshToken = response["refresh_token"]

    let userId = jwt.decode(idToken)?.["custom:sw_user_id"]

    if (idToken && !userId) {
        await client`INSERT INTO user_activity_logs (code, source, tag, message) VALUES (16, '/api/auth-idp-login', 'INFO', 'Successfully exchanged Authorization Code for auth tokens, however, no Stockwise userId was found for the user. Creating Stockwise user.');`
        console.log('idToken && !userId (AWS Cognito user has signed up but doesnt have a stockwise userId associated with it yet.)')

        const cognito = new AWS.CognitoIdentityServiceProvider();
        const username = jwt.decode(accessToken)["username"]
        const email = jwt.decode(idToken)["email"]
        const uuid = uuidv4()
        console.log('Created UUID: ', uuid)
        const params = {
            AccessToken: accessToken,
            UserAttributes: [
                {
                    Name: 'custom:sw_user_id',
                    Value: uuid
                }
            ]
        }

        await new Promise((resolve, reject): void => {
            cognito.updateUserAttributes(params, async (error, session): Promise<void> => {
                if (error) {
                    await client`INSERT INTO user_activity_logs (code, source, tag, message) VALUES (17, '/api/auth-idp-login', 'ERR', 'Failed to update AWS user with Stockwise userId.');`
                    console.log('updateUserAttributes: ', error)
                    reject(console.log('updateUserAttributes message: ', error.message))
                }

                await client`
                INSERT INTO users (id, email, account_type)
                    VALUES (${uuid}, ${email}, 1) 
                ON CONFLICT (email, account_type) 
                    WHERE ((email)::text = ${email}::text AND (account_type)::int = 1) DO NOTHING;`

                userId = uuid

                const RefreshToken = new CognitoRefreshToken({RefreshToken: refreshToken});

                const userData = {
                    Username: email, // This is required, even though it seems it can be anything. In this case I've put the email here in case it's used for logs.
                    Pool: userPool
                };

                const cognitoUser = new CognitoUser(userData);

                resolve(await new Promise(function(resolve, reject) {
                    cognitoUser.refreshSession(RefreshToken, async (err, session) => {
                        if (err) {
                            console.log(err);
                        } else {
                            accessToken = session.accessToken.jwtToken
                            idToken = session.idToken.jwtToken
                            resolve(refreshToken = session.refreshToken.token)
                        }
                    })
                }))
            })
        })
    }

    if (event.headers.origin === 'https://www.stockwise.app')
        setCookies()

    if (accessToken && idToken && refreshToken) {
        console.log('Successful google login')
        return {
            statusCode: 200,
            // Only set cookies if the origin is the web. Apps should not have cookies sent back to them simply for security
            // reasons - there's no point exposing these tokens when we don't need to
            'multiValueHeaders': {
                'Set-Cookie': event.headers.origin === 'https://www.stockwise.app' ? [ accessCookie, idCookie, refreshCookie ] : []
            },
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache',
                'Content-Type': 'text/html'
            },
            body: JSON.stringify({
                accessToken: accessToken,
                refreshToken: refreshToken,
                idToken: idToken,
                userId: userId,
                accessTokenExp: jwt.decode(accessToken).exp
            })
        }
    } else {
        await client`INSERT INTO user_activity_logs (code, source, tag, message) VALUES (18, '/api/auth-idp-login', 'INFO', 'Failed idp login.');`
        console.log('failed google login')
        return {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 500
        }
    }

}