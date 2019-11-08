'use strict';
const RuleEngine = require('node-rules');
const utils = require('./utils');
var _ = require('underscore');

module.exports = rules;
rules.init = init;

function rules() {
  var self = this;
  return self;
}

//define the rules
/*
Order of checking for redirect rules,
 1) check if a host match exists for redirect. Host name is available in event object
 headers.Host name is the cloudfront distribution domain name
 2) check if a path match exists for redirect. Path is available in event object
 'request.uri' attribute
 3) check if a querystring match exists for redirect. Query string is available in
 event object 'request.querystring' attribute
*/
var config = [{
    //rule to check if a path match exists?
    "priority": 9,
    "Id": "match-path",
    "condition": function(R) {
      console.log("In condition path :%s", this.uri);

      let ruleFound = _.find(this.ruleset.rules, function(rule) {
        let tempRule = rule.original.match(this.uri);
        //if there is a match check if time is valid
        if (tempRule && !utils.isRuleValid(rule.startTime, rule.endTime))
          return false;

        //additional condition exist for path match
        if (tempRule && rule.and_condition) {
          let pathPresent = _.find(rule.and_condition, function(andCondition) {
            return andCondition.original.match(this.uri);
          }, this);
          console.log("and condition present :%j", pathPresent);
          if (pathPresent)
            return rule;
          else
            return false;
        }
        //no additional condition exist for path match
        else if (tempRule) {
          return rule;
        }
      }, this);

      if (ruleFound) {
        console.log("path rule found :%j", ruleFound);
        this.redirectRule = ruleFound;
      }
      R.when(ruleFound);
      // R.when((this.redirectRule = this.ruleset.hosts[this.host]) &&
      //     utils.isTimeValid(this.redirectRule.startTime,this.redirectRule.endTime));
    },
    "consequence": function(R) {
      //console.log("calling next of host :%j",this.redirectRule);
      this.result = true;
      R.stop();
    },
  },
  {
    //rule to check if a path match exists?
    "priority": 8,
    "Id": "match-wildcard",
    "condition": function(R) {
      console.log("In condition wildcard :%s", this.uri);
      let ruleFound = _.find(this.ruleset.wildcards, function(rule) {
        //regex to match path starts with..case-insensitive
        let regex = new RegExp('^' + rule.original.replace("*", ".*"), 'i');
        let tempRule = regex.test(this.uri);
        //if there is a match check if time is valid
        if (tempRule && !utils.isRuleValid(rule.startTime, rule.endTime))
          return false;

        console.log("match found :%j", tempRule);
        //additional condition exist for path match
        if (tempRule && rule.and_condition) {
          let pathPresent = _.find(rule.and_condition, function(andCondition) {
            return andCondition.original.match(this.uri);
          }, this);
          console.log("and condition present :%j", pathPresent);
          if (pathPresent)
            return rule;
          else
            return false;
        }
        //no additional condition exist for path match
        else if (tempRule) {
          return rule;
        }
      }, this);

      if (ruleFound) {
        let matchedRule = {};
        matchedRule.original = ruleFound.original;
        matchedRule.redirect = ruleFound.redirect;
        matchedRule.statusCode = ruleFound.statusCode;
        console.log("wildcard rule found :%j", matchedRule);
        if (ruleFound.redirect.endsWith("*")) {
          let regex = new RegExp('^' + matchedRule.original, 'i');
          let match = this.uri.match(regex);
          console.log("match :", match);
          matchedRule.redirect = matchedRule.redirect.replace("*", this.uri.replace(match, ""));
        }
        this.redirectRule = matchedRule;
      }
      R.when(ruleFound);
      // R.when((this.redirectRule = this.ruleset.hosts[this.host]) &&
      //     utils.isTimeValid(this.redirectRule.startTime,this.redirectRule.endTime));
    },
    "consequence": function(R) {
      //console.log("calling next of host :%j",this.redirectRule);
      this.result = true;
      R.stop();
    },
  },
  {
    //rule to check if a path match exists?
    "priority": 7,
    "Id": "match-querystring",
    "condition": function(R) {
      console.log("In condition querystring :%s", this.querystring);

      let ruleFound = _.find(this.ruleset.querystrings, function(rule) {
        let tempRule = this.querystring.includes(rule.original);
        if (tempRule && utils.isRuleValid(rule.startTime, rule.endTime))
          return tempRule;
        //additional condition exist for path match
      }, this);

      if (ruleFound) {
        console.log("querystring rule found :%j", ruleFound);
        this.redirectRule = ruleFound;
      }

      R.when(ruleFound);
      // R.when((this.redirectRule = this.ruleset.hosts[this.host]) &&
      //     utils.isTimeValid(this.redirectRule.startTime,this.redirectRule.endTime));
    },
    "consequence": function(R) {
      //console.log("calling next of host :%j",this.redirectRule);
      this.result = true;
      R.stop();
    },
  },
  {
    //rule to check if a uri match exists?
    "priority": 6,
    "Id": "match-default",
    "condition": function(R) {
      console.log("In condition norule");
      R.when(true);
    },
    "consequence": function(R) {
      this.result = false;
      this.redirectRule = null;
      R.stop();
    },
  }
];

//initialize the rule engine
function init() {
  console.log("rule set :%j", config);
  return new RuleEngine(config, { ignoreFactChanges: true });
}
