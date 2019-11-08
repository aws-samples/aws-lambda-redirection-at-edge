'use strict';
module.exports = utils;
utils.generateResponse = generateResponse;
utils.isRuleValid = isRuleValid;
utils.calculateMaxAge = calculateMaxAge;

//initialize
function utils() {
  var self = this;
  return self;
}

//helper function to generate a response with appropriate response code, URL and
//cache-control headers
function generateResponse(redirectUrl, statusCode = "302", age = "86400") {
  const response = {
    status: statusCode,
    statusDescription: 'Found',
    headers: {
      'location': [{
        key: 'Location',
        value: redirectUrl,
      }],
      'cache-control': [{
        key: 'Cache-Control',
        value: "max-age=" + age
      }],
    },
  };
  console.log("Response generated :%j", response);
  return response;
}

//checks whether a particular matched rule is time valid
function isRuleValid(startTime, endTime) {
  var currentDt = new Date();
  console.log("start | current | end |: %s | %s | %s", startTime, currentDt, endTime);
  //if start time is not defined,
  if (!startTime) {
    console.log("no start time ");
    //if end time is also not defined, then rule is always valid
    if (!endTime)
      return true;
    return (currentDt < new Date(endTime));
  }
  //if endtime is not defined, but starttime is defined
  if (!endTime)
    return (new Date(startTime) <= currentDt);

  let isValid = (new Date(startTime) <= currentDt) && (currentDt < new Date(endTime));

  //if both start and end time are defined
  console.log("Utils.isRuleValid :%s", isValid);
  return isValid;
}

//calculate the remaining time left before the rule expires if an end date is specified.
//used to set the correct cache-control headers for downstream caching.
function calculateMaxAge(endTime) {
  //if no endtime then set max-age to 1 day(86400 sec)
  if (!endTime)
    return 86400;
  var currentDt = new Date();
  var endDt = new Date(endTime);
  return Math.round((endDt - currentDt) / 1000);
}
