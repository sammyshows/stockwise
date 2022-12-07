import cookie from 'cookie'
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoRefreshToken } from "amazon-cognito-identity-js"
import jwt from "jsonwebtoken"

exports.handler = async (event, context) => {
    console.log('Logging in...')
    const eventBody = JSON.parse(event.body)

    let errorMessage = "LoginRequired"
    let accessToken = eventBody.accessToken
    let idToken = eventBody.idToken
    let refreshToken = eventBody.refreshToken
    let accessCookie
    let idCookie
    let refreshCookie
    let userPool = new CognitoUserPool({
        UserPoolId : process.env.AWS_POOL_ID,
        ClientId : process.env.AWS_CLIENT_ID
    })

    // If called from the web, see if the access_token, id_token and refresh_token are stored in cookies
    if (event.headers.origin === 'https://www.stockwise.app' && event.headers.cookie) {
        const cookies = cookie.parse(event.headers.cookie)
        accessToken = cookies.sw_access_token
        idToken = cookies.sw_id_token
        refreshToken = cookies.sw_refresh_token
    }

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

    const unexpiredToken = (token): Boolean => {
        let decodedJwt = jwt.decode(token)
        if (decodedJwt.exp < Math.floor(Date.now() / 1000)) {
            console.log("Expired token")
            return false
        }
        return true
    }

    await (async () => {
        // --------- If a username / password have been provided in the request body ---------
        if (eventBody.email && eventBody.password) {
            console.log('Logging in with email / password...')
            const authenticationDetails = new AuthenticationDetails({
                Username: eventBody.email,
                Password: eventBody.password
            })

            const userData = {
                Username: eventBody.email,
                Pool: userPool
            }
            const cognitoUser = new CognitoUser(userData)

            await new Promise(function(resolve, reject) {
                cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: async (result) => {
                        accessToken = result.getAccessToken().getJwtToken()
                        idToken = result.getIdToken().getJwtToken()
                        refreshToken = result.getRefreshToken().getToken()
                        resolve(await setCookies())
                    },
                    onFailure: async (err) => {
                        errorMessage = err.code
                        resolve(console.log(errorMessage))
                    }
                })
            })
            return
        }

        // -------- If token cookies are present ---------
        if (accessToken && idToken && refreshToken && unexpiredToken(accessToken)) {
            console.log('Using existing tokens...')
            // --------- If there's cookies and the accessToken is valid ---------
            setCookies()
            return
        } else if (accessToken && refreshToken) {
            // --------- If there's a valid refreshToken ---------
            console.log('Refreshing token...')
            const RefreshToken = new CognitoRefreshToken({RefreshToken: refreshToken});

            const userData = {
                Username: '', // This is required, even though it can be anything. Perhaps required for logs, but I can't get the username at this stage. Would be good to replace with username somehow if possible, just in case.
                Pool: userPool
            };

            const cognitoUser = new CognitoUser(userData);

            await new Promise(function(resolve, reject) {
                cognitoUser.refreshSession(RefreshToken, async (err, session) => {
                    if (err) {
                        console.log(err);
                    } else {
                        accessToken = session.accessToken.jwtToken
                        idToken = session.idToken.jwtToken
                        refreshToken = session.refreshToken.token
                        resolve(await setCookies())
                    }
                })
            })
            return
        }
    })()

    if (accessToken && refreshToken && idToken)
        console.log('All 3 tokens are present')

    if (accessToken && refreshToken && idToken) {
        console.log('Returning userId...')
        const userId = jwt.decode(idToken)['custom:sw_user_id']

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
    } else { // tell the client to redirect to the login page
        console.log('Returning error...')
        return {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 300,
            body: JSON.stringify({
                errorMessage: errorMessage
            })
        }
    }
}