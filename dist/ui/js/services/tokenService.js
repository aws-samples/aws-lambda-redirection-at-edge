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
services.factory('tokenService', ['$window', function ($window) {
    var service = {
        getToken: function () {
            return this.getStorage('token');
        },
        setToken: function (token) {
            this.setStorage('token', token);
        },
        setAttr: function (data) {
            this.setStorage('userDetails', JSON.stringify(data));
        },
        getAttr: function (data) {
            var userAttributes = this.getStorage('userDetails');
            return userAttributes ? JSON.parse(userAttributes) : userAttributes;

        },
        clearToken: function () {
            this.clearStorage('token');
            this.clearStorage('userDetails');
        },
        setStorage: function (key, value) {
            $window.localStorage.setItem(key, value);
        },
        getStorage: function (key) {
            return $window.localStorage.getItem(key);
        },
        clearStorage: function (key) {
            $window.localStorage.removeItem(key);
        }
    }
    return service;
}]);
