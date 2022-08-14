import cookie from 'cookie'
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoRefreshToken } from "amazon-cognito-identity-js"
import jwt from "jsonwebtoken"

exports.handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    let errorMessage = "LoginRequired"
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

    // See if the access_token, id_token and refresh_token are stored in cookies
    if (event.headers.cookie) {
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
            console.log('Using access token from cookie...')
            // --------- If there's cookies and the accessToken is valid ---------
            setCookies()
            return
        } else if (accessToken && refreshToken) {
            // --------- If there's a valid refreshToken ---------
            console.log('Refreshing token...')
            const username = jwt.decode(accessToken).username
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

    if (accessToken && refreshToken && idToken) {
        const userId = jwt.decode(idToken)['custom:sw_user_id']
        console.log(userId)

        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': [ accessCookie, idCookie, refreshCookie ],
                'Cache-Control': 'no-cache',
                'Content-Type': 'text/html'
            },
            body: JSON.stringify({
                accessToken: accessToken,
                userId: userId
            })
        }
    } else { // tell the client to redirect to the login page
        return {
            statusCode: 300,
            body: JSON.stringify({
                errorMessage: errorMessage
            })
        }
    }
}