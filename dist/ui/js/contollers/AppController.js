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

controllers.controller('AppController', ['$scope', '$rootScope', '$http', '$window', 'awsService', 'configService', '$mdToast', AppController]);

function AppController(scope, rootScope, http, window, awsService, configService, mdToast) {
    var vm = this;
    var config = configService.getConfig();
    var aws = new(awsService.AWSService())();
    vm.rules = {};
    vm.sectionKeys = {};
    vm.refreshTime = 300;

    vm.codes = config.statusCodes;
    vm.sections = config.sections;

    aws.listVersions().then(function (versions) {
        vm.versions = versions;
        try {
            var latest = vm.versions.filter(x => {
                x.displatDate = "Modified on " + formatDate(x.LastModified) + " at " + new Date(x.LastModified).toLocaleTimeString();
                return x.isLatest;
            });
            vm.getRules(latest.VersionId);
        } catch (err) {
            alert(err);
        }
    });

    vm.getRules = function (versionId) {
        try {
            aws.getRules(versionId).then(function (rules) {
                vm.refreshTime = rules.refreshTime;
                delete(rules.refreshTime);
                vm.rules = rules;
                scope.$apply();
            });
        } catch (err) {
            alert(err);
        }
    }

    vm.saveVersion = function () {
        showSimpleToast("Saving Rules ...");
        aws.publishRules(vm.rules,vm.refreshTime).then(function (result) {
            showSimpleToast("Save Successsful! New version created. Reloading content..");
            window.location.reload();
        });
    }

    vm.addRule = function (type) {
        vm.rules[type].push({});
        vm.isEnabled = type + (vm.rules[type].length - 1);
        vm.sectionKeys[type] = true;
    }

    vm.moveUpRule = function (rule,type) {
      let rules = vm.rules[type];
      let index = rules.indexOf(rule);
      if(index>0){
        rules.splice(index, 1);
        rules.splice(index-1,0,rule);
      }
      vm.sectionKeys[type] = true;
    }

    vm.moveDownRule = function (rule,type) {
      let rules = vm.rules[type];
      let length = rules.length;
      let index = rules.indexOf(rule);
      if(index < length-1){
        rules.splice(index, 1);
        rules.splice(index+1,0,rule);
      }
      vm.sectionKeys[type] = true;
    }
    vm.deleteRule = function (rule, type) {
        let rules = vm.rules[type];
        let index = rules.indexOf(rule);
        rules.splice(index, 1);
        showSimpleToast("Rules removed from list. Save Version to make deletes persistent.");
    }

    vm.saveRule = function () {
        vm.isEnabled = 0;
        showSimpleToast("Rules saved in list. Save Version to make changes persistent.");
    }

    var formatDate = function (date) {
        let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let day = date.getDate();
        let monthIndex = date.getMonth();
        let year = date.getFullYear();
        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }

    var showSimpleToast = function (text) {
        mdToast.show(
            mdToast.simple()
            .textContent(text)
            .position("bottom right")
            .hideDelay(3000)
        );
    };

    vm.addSection = function (section) {
        if (section && section != "default") {
            if (vm.rules.hasOwnProperty(section)) {
                showSimpleToast("Section \"" + section + "\" already exists")
            } else {
                vm.rules[section] = [];
                vm.addRule(section);
            }
            vm.sectionKeys[section] = true;
            vm.sectionName = "default";
        }
    };
    return vm;
}
