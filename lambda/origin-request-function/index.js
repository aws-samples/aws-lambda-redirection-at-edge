'use strict';

const utils = require('./utils');
const http = require('https');
const rules = require('./rules');
const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});

//initialize the rules engine
const R = rules.init();

let redirectorJson = null;
let lastUpdatedTime = 0;

//no of seconds before updating the redirection rules file.
let intervalBetweenUpdates = 60;

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  console.log("Request :%j",request);
  const uri = request.uri;

  const headers = request.headers;
  const querystring = request.querystring;
  const originHost = headers['host'][0].value;

  const customHeaders = request.origin.s3?request.origin.s3.customHeaders:request.origin.custom.customHeaders;
  //read the bucket which holds the redirection rule
  const rulesBucket = customHeaders.rules_bucket[0].value;
  //read the redirection file name
  const rulesFile = customHeaders.rules_file[0].value;

  //clear the custom headers before sending to origin
  // delete request.origin.s3.customHeaders.rules_bucket;
  // delete request.origin.s3.customHeaders.rules_file;

  syncRedirectionRule(rulesBucket,rulesFile)
    .then(() => {

      // if no redirection rules are defined, then simply pass on the request.
      if (!redirectorJson) {
        console.log("No redirection rule exists..:%j",request);
        callback(null, request);
        return;
      }

      //define common variables
      let redirectUrl;
      let statusCode;
      let response;

      //fact variable contains attributes needed to evaluate if an active rule exist
      let fact = {
        "host": originHost,
        "uri": uri,
        "querystring": querystring,
        "ruleset": redirectorJson
      };

      //Now pass the fact on to the rule engine for results
      R.execute(fact, function(result) {
        //if a match is found
        if (result.result) {
          //calculate the Cache-Control max-age header value
          let maxAge = utils.calculateMaxAge(result.redirectRule.endTime);
          //generate response
          callback(null, utils.generateResponse(result.redirectRule.redirect,
            result.redirectRule.statusCode, maxAge));
        }
        else {
          console.log("no redirect present..:%j",request);
          callback(null, request);
        }
      });
    })
    .catch(err => {
      console.log("Error in OriginRequestFunction :%j", err);
      //if there is an error we simply allow the request to pass to origin
      callback(null, request);
    });
}

// the function loads and refreshes the redirector.json file periodically
// to fetch the rule definitions.
function syncRedirectionRule(ruleHost,ruleFile) {

  return new Promise((resolve, reject) => {

    // if last updated time is present, then check the file was not recently retrieved to reduce
    // latency
    let currentTime = new Date().getTime();
    if (lastUpdatedTime && (currentTime - lastUpdatedTime) < (intervalBetweenUpdates * 1000)) {
      resolve(redirectorJson);
      return;
    }

    console.log("Synchronizing rules from bucket :%s with key :%s", ruleHost,ruleFile);

    let json = null;
    let time1 = new Date().getTime();

    S3.getObject({ Bucket: ruleHost, Key: ruleFile }).promise()
    .then(data => {
      redirectorJson = JSON.parse(data.Body);
      intervalBetweenUpdates = redirectorJson.refreshTime;
      lastUpdatedTime = currentTime;
      resolve(redirectorJson);
    })
    .catch(err => {
      console.log("Error while fetching the rules file :%j", err);
      redirectorJson = null;
      lastUpdatedTime = currentTime;
      resolve(null);
    });
  });
}
