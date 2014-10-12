'use strict';


var ACCSS_TOKEN = process.env.TOKYOMETRO_ACCESS_TOKEN;

var BASE_URL = "https://api.tokyometroapp.jp/api/v2/datapoints";

var request = require('request');

exports.request = function(type, callback) {
  if (!type)
    throw("Specify a type argument.");
  if (!callback)
    throw("Specify a callback argument.");

  var url = BASE_URL + "?rdf:type=" + type +
          "&acl:consumerKey=" + ACCSS_TOKEN;

  request(url,
          function (error, response, body) {
    if (error) callbackAsError(callback);
    if (response.headers["content-type"] != "application/json")
      callbackAsError(callback);

    callback(null, JSON.parse(body));
  });
}

exports.requestTrains = function(callback) {
  return exports.request("odpt:Train", callback);
}

function callbackAsError(callback) {
  callback(true, null);
}
