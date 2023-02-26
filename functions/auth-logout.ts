import cookie from 'cookie'
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js"
import jwt from "jsonwebtoken"
import fetch from "node-fetch";


exports.handler = async (event, context) => {
    let cognitoUser
    let accessCookie = cookie.serialize('sw_access_token', 'accessToken', { secure: true, httpOnly: true, path: '/', maxAge: -3600 })
    let idCookie = cookie.serialize('sw_id_token', 'idToken', { secure: true, httpOnly: true, path: '/', maxAge: -3600 })
    let refreshCookie = cookie.serialize('sw_refresh_token', 'refreshToken', { secure: true, httpOnly: true, path: '/', maxAge: -3600 })

    let userPool = new CognitoUserPool({
        UserPoolId : process.env.AWS_POOL_ID,
        ClientId : process.env.AWS_CLIENT_ID
    })

    // -------- Get user's email from idToken (assuming there is an idToken cookie) ---------
    if (event.headers.cookie) {
        const cookies = cookie.parse(event.headers.cookie)
        const idToken = cookies.sw_id_token

        cognitoUser = new CognitoUser({
            Username: jwt.decode(idToken).email,
            Pool: userPool
        })

        cognitoUser.signOut()
    }

    await fetch(`${process.env.AWS_AUTH_URL}/logout?client_id=${process.env.AWS_CLIENT_ID}&logout_uri=https://stockwise.app/auth/login`)
    await fetch('https://www.google.com/accounts/Logout')

    return {
        statusCode: 200,
        'multiValueHeaders': {
            'Set-Cookie': [ accessCookie, idCookie, refreshCookie ]
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/html'
        },
    }
}