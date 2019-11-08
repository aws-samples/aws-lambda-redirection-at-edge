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
controllers.controller('LoginController', ['$scope', '$rootScope', '$http', '$location', 'tokenService', 'configService', LoginController]);

function LoginController(scope, rootScope, http, $location, tokenService, configService) {
    var lc = this;

    var config = configService.getConfig();

    lc.login = function (username, password) {
        rootScope.$broadcast('startLoading');

        var authenticationData = {
            Username: username,
            Password: password,
        };
        var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
        var poolData = config.poolData;
        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                var user = result.idToken;
                var idToken = user.jwtToken;
                var groups = result.idToken.payload["cognito:groups"];
                user.isAdmin = groups && groups.length > 0 ? true : false;
                tokenService.setToken(idToken);
                tokenService.setAttr(user);
                rootScope.$emit('userAuthenticated');
                rootScope.$broadcast('stopLoading');
                $location.path("/rule");
                rootScope.$apply();
            },
            newPasswordRequired: function (userAttributes, requiredAttributes) {
                var attributesData = {};
                requiredAttributes.forEach(function (attr) {
                    attributesData[attr] = prompt("Please enter your " + attr);
                });
                var newPassword = prompt("Please enter a new password");
                cognitoUser.completeNewPasswordChallenge(newPassword, attributesData, this)
                rootScope.$broadcast('stopLoading');
            },
            onFailure: function (err) {
                alert(err);
                tokenService.clearToken(true);
                rootScope.$broadcast('stopLoading');
            },

        });
    }
    return lc;
}
