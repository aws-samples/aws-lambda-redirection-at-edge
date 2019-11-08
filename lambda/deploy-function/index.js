'use strict';

const AWS = require("aws-sdk");
const S3 = new AWS.S3({
 signatureVersion: 'v4',
});

const path = require('path');
const AdmZip = require('adm-zip');
const mime = require('mime/lite');
const https = require("https");
const url = require("url");
const generator = require('generate-password');

const RuleBucket = process.env.RuleBucket;
const UIPrefix = process.env.UIPrefix;
const SourceUIFileBucket = process.env.SourceUIFileBucket;
const SourceUIFilePath = process.env.SourceUIFilePath;

exports.handler = function(event, context) {

 console.log("REQUEST RECEIVED: %j", event);
 console.log("UI bucket :%s", RuleBucket);

 // For Delete requests, immediately send a SUCCESS response.
 if (event.RequestType == "Delete") {
  sendResponse(event, context, "SUCCESS");
  return;
 }

 let responseStatus = "SUCCESS";
 let responseData = {};

 if (event.RequestType == "Create") {
  let userPool = event.ResourceProperties.UserPool;
  let userName = event.ResourceProperties.UserName;
  let temporaryPassword = generatePassword();
  let jobs = Promise.all([uploadUIAssets(event), createRedirectRuleFile(),
   createUser(userPool, userName, temporaryPassword)
  ]);

  jobs.then(args => {
   // console.log("Args 2 :%j",args[2]);
   responseData.UserName = userName;
   responseData.Password = temporaryPassword;
   sendResponse(event, context, responseStatus, responseData);
  });
 }
 else {
  sendResponse(event, context, responseStatus, responseData);
 }
};

//generate a random password
function generatePassword() {
 return generator.generate({
  length: 10,
  numbers: true,
  uppercase: true,
  strict: true,
  symbols: true
 });
}

//creates the user
function createUser(userPool, userName, password) {
 console.log("password :%s", password);
 let params = {
  UserPoolId: userPool,
  /* required */
  Username: userName,
  /* required */
  MessageAction: 'SUPPRESS',
  TemporaryPassword: password,
 };

 let cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

 return cognitoidentityserviceprovider.adminCreateUser(params).promise()
  .catch(err => console.log("Error in createUser :%j", err));
}

//upload the UI assets. Also modifies the 'js/services/configService.js' file to
//configure the deployment specific resources
// - BUCKET_URL : the S3 bucket where the redirector.json and User interface is deployed.
// - USER_POOL_ID, CLIENT_ID, IDENTITY_POOL_ID - the Cognito resources for authro
function uploadUIAssets(event) {
 console.log("In uploadUIAssets :%s", SourceUIFilePath);

 return S3.getObject({ Bucket: SourceUIFileBucket, Key: SourceUIFilePath }).promise()
  .then(data => {
   // console.log("Buffer ", data);
   // var zip = new AdmZip("/tmp/test.zip");
   let zip = new AdmZip(data.Body);
   let zipEntries = zip.getEntries();
   // console.log("In zip ",zipEntries);

   zipEntries.forEach(function(zipEntry) {
    //console.log(zipEntry.toString());

    if (!zipEntry.isDirectory) {
     let mimeType = mime.getType(zipEntry.name.substring(zipEntry.name.lastIndexOf(".")));
     let fileContents = zipEntry.getData();
     // console.log('File Name: ', zipEntry.entryName);

     if (zipEntry.entryName == "js/services/configService.js") {
      // console.log(zipEntry.packHeader);
      // console.log('File Name: ', zipEntry.entryName);
      // console.log("User pool id :%s",event.ResourceProperties.UserPoolClient);

      fileContents = fileContents.toString().replace('BUCKET_URL', RuleBucket);
      fileContents = fileContents.toString().replace('USER_POOL_ID', event.ResourceProperties.UserPool);
      fileContents = fileContents.toString().replace('CLIENT_ID', event.ResourceProperties.UserPoolClient);
      fileContents = fileContents.toString().replace('IDENTITY_POOL_ID', event.ResourceProperties.IdentityPool);
      console.log(fileContents);
     }

     S3.putObject({
       ACL: 'public-read',
       Body: fileContents,
       Bucket: RuleBucket,
       Key: UIPrefix + "/" + zipEntry.entryName,
       ContentType: mimeType
      }).promise()
      .catch(() => { console.log("Exception while uploading the file into S3 bucket") });
    }
   });
   return new Promise((resolve, reject) => { // (*)
    resolve('Done uploading');
   });
  });
}

function createRedirectRuleFile() {
 var ruleFile = {};
 ruleFile.rules = [];
 ruleFile.wildcards = [];
 ruleFile.querystrings = [];
 ruleFile.refreshTime = 60;

 S3.putObject({
   Body: JSON.stringify(ruleFile),
   Bucket: RuleBucket,
   Key: 'redirector.json',
   ContentType: mime.getType('json')
  }).promise()
  .catch(() => { console.log("Exception while uploading the file redirector.json file to S3 bucket") });
}

// Send response to the pre-signed S3 URL
function sendResponse(event, context, responseStatus, responseData) {

 let responseBody = JSON.stringify({
  Status: responseStatus,
  Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
  PhysicalResourceId: context.logStreamName,
  StackId: event.StackId,
  RequestId: event.RequestId,
  LogicalResourceId: event.LogicalResourceId,
  Data: responseData
 });

 console.log("RESPONSE BODY:\n", responseBody);

 let parsedUrl = url.parse(event.ResponseURL);
 let options = {
  hostname: parsedUrl.hostname,
  port: 443,
  path: parsedUrl.path,
  method: "PUT",
  headers: {
   "content-type": "",
   "content-length": responseBody.length
  }
 };

 console.log("SENDING RESPONSE...\n");

 let request = https.request(options, function(response) {
  console.log("STATUS: " + response.statusCode);
  console.log("HEADERS: " + JSON.stringify(response.headers));
  // Tell AWS Lambda that the function execution is done
  // context.done();
 });

 request.on("error", function(error) {
  console.log("sendResponse Error:" + error);
  // Tell AWS Lambda that the function execution is done
  // context.done();
 });

 // write data to request body
 request.write(responseBody);
 request.end();
}
