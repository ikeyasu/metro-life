'use strict';

var ACCESS_TOKEN = process.env.TOKYOMETRO_ACCESS_TOKEN;
var BASE_URL = "https://api.tokyometroapp.jp/api/v2/datapoints";

var request = require('request');
var querystring = require('querystring');
var config = require('../../config/environment');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var memjs = require('memjs');

var DEFAULT_REQUEST_FREQUENCY = 90; //sec

if (process.env.MEMCACHEDCLOUD_SERVERS) {
  var client = memjs.Client.create(
      process.env.MEMCACHEDCLOUD_SERVERS, {
        username: process.env.MEMCACHEDCLOUD_USERNAME,
        password: process.env.MEMCACHEDCLOUD_PASSWORD
      });
} else {
  var client = memjs.Client.create();
}

function requestJsonOrGetCache(url, callback, frequencyResolver) {
  client.get(url, function(err, val) {
    if (val) {
      callback(null, JSON.parse(val.toString()));
      return;
    }
    request(url, function(error, response, body) {
      if (error) {
        callback(error, JSON.parse(body));
      }

      if (response.headers["content-type"] !== "application/json") {
        callback(true, null);
        return;
      }

      var json = JSON.parse(body);
      var frequency = frequencyResolver(json);

      client.set(url, body, function(err, val) {
        // ignore error of memcache because callback must be called anytime.
        callback(error, json);
      }, frequency);
    });
  });
}

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

   var frequencyResolver = function(json) {
     json.reduce(
         function(prev, cur) {
           if (cur["odpt:frequency"])
             return Math.min(cur["odpt:frequency"], prev);
           return prev;
         }, DEFAULT_REQUEST_FREQUENCY);
   };
  requestJsonOrGetCache(BASE_URL + "?" + querystring.stringify(param),
          function (error, json) {
    if (error) {
      callbackAsError(callback);
      return;
    }

    // ignore error of memcache because callback must be called anytime.
    callback(null, json);
  }, frequencyResolver);
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
