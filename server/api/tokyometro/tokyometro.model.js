'use strict';

var ACCESS_TOKEN = process.env.TOKYOMETRO_ACCESS_TOKEN;
var BASE_URL = "https://api.tokyometroapp.jp/api/v2/datapoints";

var request = require('request');
var querystring = require('querystring');
var config = require('../../config/environment');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.request = function(param, callback) {
  if (!param)
    throw("Specify a param argument.");
  if (!callback)
    throw("Specify a callback argument.");


  if (config.usingMock) {
    var mock = require("./tokyometro.mock");
    var query = querystring.stringify(param);
    var data = mock.mockData[query];
    if (!data) {
      console.log("Cannot find mock data: " + querystring.stringify(param));
    }
    callback(null, data);
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

exports.requestStation = function(station, callback) {
  return exports.request({"rdf:type": "odpt:Station", "owl:sameAs": station}, callback);
}

exports.requestStationsFromRailway = function(railway, callback) {
  return exports.request({"rdf:type": "odpt:Railway", "owl:sameAs": railway}, callback);
}

function callbackAsError(callback) {
  callback(true, null);
}

var ImportLogSchema = new Schema({
  tableName: String,
  source: String,
  updated: Date
});

exports.ImportLog = mongoose.model('ImportLog', ImportLogSchema);
