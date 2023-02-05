import fetch from 'node-fetch'
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
    const users = await client`SELECT * FROM users WHERE id = ${userId};`

    if (idToken && users.length === 0) {
        await client`INSERT INTO user_activity_logs (code, source, tag, message) VALUES (16, '/api/auth-idp-login', 'INFO', 'Successfully exchanged Authorization Code for auth tokens, however, no Stockwise userId was found for the user. Creating Stockwise user.');`
        console.log('idToken && !userId (AWS Cognito user has signed up but doesnt have a stockwise userId associated with it yet.)')

        const email = jwt.decode(idToken)["email"]

        await client`
            INSERT INTO users (id, email, account_type)
                VALUES (${userId}, ${email}, 1) 
            ON CONFLICT (email, account_type) 
                WHERE ((email)::text = ${email}::text AND (account_type)::int = 1) DO NOTHING;`
    }

    if (event.headers.origin === 'https://www.stockwise.app')
        setCookies()

    if (accessToken && idToken && refreshToken) {
        console.log('Successful idp login')
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