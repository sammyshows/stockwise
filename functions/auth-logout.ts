import cookie from 'cookie'
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js"
import jwt from "jsonwebtoken"


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


    return {
        statusCode: 200,
        headers: {
            'Set-Cookie': [ accessCookie, idCookie, refreshCookie ],
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/html'
        },
    }
}