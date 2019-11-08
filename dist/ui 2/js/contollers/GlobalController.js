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
controllers.controller('GlobalController', ['$scope', '$rootScope', '$http', '$location', 'tokenService', 'configService', GlobalController]);

function GlobalController(scope, rootScope, http, $location, tokenService, configService) {
    var gc = this;
    var config = configService.getConfig();
    gc.isLoading = false;

    var config = configService.getConfig();

    rootScope.$on('startLoading', function () {
        gc.isLoading = true;
    });
    rootScope.$on('stopLoading', function () {
        gc.isLoading = false;
    });
    rootScope.$on('userAuthenticated', function () {
        gc.isAuthenticated = true;
    });
    rootScope.$on('userUnAuthenticated', function () {
        gc.isAuthenticated = false;
    });

    gc.isAuthenticated = tokenService.getToken() ? true : false;
    gc.logout = function () {
        tokenService.clearToken();
        rootScope.$emit('userUnAuthenticated');
        $location.path('/');
    }

    return gc;
}
