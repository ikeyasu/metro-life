'use strict';

var ACCESS_TOKEN = process.env.TOKYOMETRO_ACCESS_TOKEN;
var BASE_URL = "https://api.tokyometroapp.jp/api/v2/datapoints";

var request = require('request');
var querystring = require('querystring');
var config = require('../../config/environment');

exports.request = function(param, callback) {
  if (!param)
    throw("Specify a param argument.");
  if (!callback)
    throw("Specify a callback argument.");


  if (config.usingMock) {
    var mock = require("./tokyometro.mock");
    var query = querystring.stringify(param);
    callback(null, mock.mockData[query]);
    return;
  }

  param["acl:consumerKey"] = ACCESS_TOKEN;

  request(BASE_URL + "?" + querystring.stringify(param),
          function (error, response, body) {
    if (error) callbackAsError(callback);
    if (response.headers["content-type"] !== "application/json")
      callbackAsError(callback);

    callback(null, JSON.parse(body));
  });
}

exports.requestTrains = function(callback) {
  return exports.request({"rdf:type": "odpt:Train"}, callback);
}

exports.requestStation = function(id, callback) {
  return exports.request({"rdf:type": "odpt:Station", "@id": id}, callback);
}

function callbackAsError(callback) {
  callback(true, null);
}
