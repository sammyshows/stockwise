import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js"


exports.handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    let userPool = new CognitoUserPool({
        UserPoolId : process.env.AWS_POOL_ID,
        ClientId : process.env.AWS_CLIENT_ID
    })

    const userData = {
        Username: eventBody.email,
        Pool: userPool
    }

    let cognitoUser = new CognitoUser(userData)

    await new Promise((resolve, reject) => {
        cognitoUser.confirmPassword(eventBody.verificationCode, eventBody.newPassword, {
            onSuccess() {
                resolve(console.log('Password saved.'))
            },
            onFailure() {
                reject(console.log('Error, password not saved.'))
            }
        })
    })


    return {
        'statusCode': 200
    }
}