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
        cognitoUser.forgotPassword({
            onSuccess: function(data) {
                resolve(console.log("Sent email with verification code."))
            },
            onFailure: function(error) {
                reject(console.log(error.message))
            }
        })
    })


    return {
        'statusCode': 200
    }
}