/*
 * Helpers for various tasks
 *
 */

var https = require('https');

// Dependencies
var config = require('./config');
var crypto = require('crypto');
var querystring = require('querystring');

// Container for all the helpers
var helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

//Create a randomized token
helpers.createToken = function(){
    let collection = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*(){}';
    let sum = '';
    for (let i=0; i<46;i++){
        sum+= collection[Math.floor(Math.random()*47)];
    }
    return sum;
}

helpers.httpsRequestToStripe = function(price, email, callback){

  var payload = {
    "amount": price,
   "currency": "usd",
   "source": "tok_visa",
   "receipt_email": email
  };

  var stringPayload = querystring.stringify(payload);
  var options = {
      'protocol' : 'https:',
      'hostname': 'api.stripe.com',
      'path': '/v1/charges',
      'method': 'POST',
      'auth': 'sk_test_c19rUb2NODMLdqQiy0ZN6NQD:',
      'headers' : {
          'Content-Type' : 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload)
        }
    };
    
    var req = https.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));

      if (res.statusCode === 200 || res.statusCode === 201 ){
        callback();
      }

      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });

    });

    req.on('error',function(e){
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();
    
}

helpers.createOrderId = function(){
  let letters = 'abcdefghijklmnopqrstuvwxyz';
  let numbers = '1234567890';
  let sum = '';
  for (let i=0; i<3;i++){
      sum+= letters[Math.floor(Math.random()*27)];
  }
  for (let i=0; i<3;i++){
    sum+= numbers[Math.floor(Math.random()*11)];
}
  return sum;
}

helpers.sendEmail = function(email){
  var payload = {
    "from": "Mailgun Sandbox <postmaster@sandbox432075e0c1484ae5aa8a08650740f394.mailgun.org>",
    "to": "Praneet Bhave <praneet.bhave@gmail.com>", //to be replaced by actual email in params in production 
    "subject": "Hello Praneet Bhave",
    "text": "Congratulations Praneet Bhave, you just sent an email with Mailgun!  You are truly awesome!"};

  var stringPayload = querystring.stringify(payload);
  var options = {
      'protocol' : 'https:',
      'hostname': 'api.mailgun.net',
      'path': 'v3/sandbox432075e0c1484ae5aa8a08650740f394.mailgun.org/messages',
      'method': 'POST',
      'auth': 'api:c89ba432738898369632dddac958d91a-9525e19d-19195f60',
      'headers' : {
          'Content-Type' : 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload)
        }
    };

  var req = https.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));

      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });

    });

    req.on('error',function(e){
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();
};


// Export the module
module.exports = helpers;