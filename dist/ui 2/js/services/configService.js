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
