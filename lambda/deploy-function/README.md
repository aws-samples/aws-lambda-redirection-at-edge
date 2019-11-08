# Deploy Lambda Function

The utility function below is invoked as part of custom resource definition from CloudFormation template. This helper function is used to create the Cognito user credentials (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminCreateUser-property) and deploy the user interface.

The Deploy function uses the AdmZip (https://www.npmjs.com/package/adm-zip) module to unzip and extract the user interface bundle and upload it to the S3 bucket. During this process, it also modify the *'js/services/configService.js'* file for resource level configurations needed to enable secure access to the rules console. This settings include the S3 bucket name & Cognito settings as shown below.

```javascript
(function () {
    services.factory('configService', [function () {

        var config = {
            s3: {
                bucket: 'BUCKET_URL',
                filename: 'redirector.json'
            },
            poolData: {
                UserPoolId: 'USER_POOL_ID',
                ClientId: 'CLIENT_ID'
            },
            IdentityPoolId: 'IDENTITY_POOL_ID',
            awsconfig: {
                region: 'us-east-1',
                credentials: {}
            },
            statusCodes: [301, 302],
            sections: ["rules", "wildcards", "querystrings"]
        }
        var service = {
            getConfig: function () {
                return config;
            }
        }
        return service;
    }]);

})();
```
