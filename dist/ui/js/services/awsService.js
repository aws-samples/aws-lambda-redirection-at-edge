/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
    services.factory('awsService', ['configService', 'tokenService', '$rootScope', function (configService, tokenService, rootScope) {
        var config = configService.getConfig(),
            bucket = config.s3.bucket,
            ruleFile = config.s3.filename,
            region = config.awsconfig.region;

        var awsService = {};
        awsService.AWSService = function () {
            var AWSService = function () {
                this.region = config.awsconfig.region;
                this.IdentityPoolId = config.IdentityPoolId;
                this.bucket = bucket;
                AWS.config.region = this.region;
                var cognitoCredentails = {
                    IdentityPoolId: config.IdentityPoolId,
                    Logins: {}
                };
                var loginAttr = 'cognito-idp.' + config.awsconfig.region + '.amazonaws.com/' + config.poolData.UserPoolId;
                cognitoCredentails.Logins[loginAttr] = tokenService.getToken();
                AWS.config.update({
                    region: this.region,
                    credentials: new AWS.CognitoIdentityCredentials(cognitoCredentails)
                });
            };
            AWSService.prototype.getS3 = function () {
                var clientParams = {
                    region: this.region,
                    apiVersion: '2006-03-01',
                    params: {
                        Bucket: this.bucket
                    }
                };
                var s3 = new AWS.S3(clientParams);
                return s3;
            };
            AWSService.prototype.getRules = function (versionId) {
                console.log("In getRules with versionId", versionId);
                rootScope.$emit('startLoading');
                let params = {};
                params.Key = config.s3.filename;
                if(versionId)
                params.VersionId = versionId;

                return this.getS3().getObject(params).
                promise().
                then(function (data) {
                    rootScope.$emit('stopLoading');
                    return JSON.parse(data.Body);
                });
            };
            AWSService.prototype.listVersions = function () {
                console.log("In listVersions");
                rootScope.$emit('startLoading');
                return this.getS3().listObjectVersions({
                        Bucket: this.bucket,
                        Prefix: ruleFile
                    })
                    .promise()
                    .then(function (data) {
                        rootScope.$emit('stopLoading');
                        return data.Versions;
                    });
            };
            AWSService.prototype.publishRules = function (rules,refreshTime) {
                rules.refreshTime = refreshTime;
                var payload = JSON.stringify(rules);
                return this.getS3().putObject({
                    Body: payload,
                    ContentType: 'application/json',
                    ContentLength: payload.length,
                    Key: 'redirector.json',
                }).promise();
            };
            return AWSService;
        };
        return awsService;
    }]);
})();
