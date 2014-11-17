'use strict';

var ACCESS_TOKEN = process.env.TOKYOMETRO_ACCESS_TOKEN;
var BASE_URL = "https://api.tokyometroapp.jp/api/v2/datapoints";

var _ = require('lodash');
var request = require('request');
var Q = require('q');
var querystring = require('querystring');
var config = require('../../config/environment');
var crypto = require('crypto');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var memjs = require('memjs');

var DEFAULT_REQUEST_FREQUENCY = 90; //sec
var MAX_RETRY = 10;
var RETRY_INTERVAL = 110; //msec

if (process.env.MEMCACHEDCLOUD_SERVERS) {
  var client = memjs.Client.create(
      process.env.MEMCACHEDCLOUD_SERVERS, {
        username: process.env.MEMCACHEDCLOUD_USERNAME,
        password: process.env.MEMCACHEDCLOUD_PASSWORD
      });
} else {
  var client = memjs.Client.create();
}

function createDigest(str) {
  var shasum = crypto.createHash('sha512');
  shasum.update(str);
  var digest = shasum.digest('hex');
  return digest;
}

function requestJsonOrGetCache(url, callback, frequencyResolver, counter) {
  client.get(createDigest(url), function(err, val) {
    if (val) {
      runCallback(callback, JSON.parse(val.toString()));
      return;
    }
    request(url, function(error, response, body) {
      if (error && _.isFunction(callback)) {
        callback(error, body);
      }

      if (/application\/json/.exec(response.headers["content-type"]) === null) {
        setTimeout(function() {
          if (counter === undefined)
            counter = 0;
          if (counter >= MAX_RETRY) {
            callbackAsError(callback);
            return;
          }
          requestJsonOrGetCache(url, callback, frequencyResolver, counter);
        }, RETRY_INTERVAL);
        return;
      }

      var json = JSON.parse(body);
      var frequency = frequencyResolver(json);

      client.set(createDigest(url), body, function(err, val) {
        // ignore error of memcache because callback must be called anytime.
        if (_.isFunction(callback)) callback(error, json);
      }, frequency);
    });
  });
}
exports.requestJsonOrGetCache = requestJsonOrGetCache;

exports.request = function(param, callback) {
  if (!param)
    throw("Specify a param argument.");

  var deferred = Q.defer();

  if (config.usingMock) {
    var mock = require("./tokyometro.mock");
    var query = querystring.stringify(param);
    var data = mock.mockData[query];
    if (!data) {
      console.log("Cannot find mock data: " + querystring.stringify(param));
    }
    runCallback(callback, data);
    setTimeout(function() {
      deferred.resolve(data);
    }, 0);
    return deferred.promise;
  }

  param["acl:consumerKey"] = ACCESS_TOKEN;

  requestJsonOrGetCache(BASE_URL + "?" + querystring.stringify(param),
          function (error, json) {
    if (error) {
      callbackAsError(callback);
      setTimeout(function() {
        deferred.reject(null);
      }, 0);
      return;
    }

    // ignore error of memcache because callback must be called anytime.
    runCallback(callback, json);
    setTimeout(function() {
      deferred.resolve(json);
    }, 0);
  }, frequencyResolver);
  return deferred.promise;
}

function frequencyResolver(json) {
  if (json["@context"] === "https://vocab.tokyometroapp.jp/context_odpt_TrainTimetable.jsonld")
    return 86400; // 1 day
  if (json["@context"] === "http://vocab.tokyometroapp.jp/context_odpt_StationTimetable.jsonld")
    return 86400; // 1 day

  return json.reduce(
      function(prev, cur) {
        if (cur["odpt:frequency"])
          return Math.min(cur["odpt:frequency"], prev);
        return prev;
      }, DEFAULT_REQUEST_FREQUENCY);
}
exports.frequencyResolver = frequencyResolver;

exports.requestTrains = function(callback) {
  return exports.request({"rdf:type": "odpt:Train"}, callback);
}

exports.requestStation = function(station, callback) {
  return exports.request({"rdf:type": "odpt:Station", "owl:sameAs": station}, callback);
}

exports.requestStationsFromRailway = function(railway, callback) {
  return exports.request({"rdf:type": "odpt:Railway", "owl:sameAs": railway}, callback);
}

function runCallback(callback, res) {
  if (_.isFunction(callback)) callback(null, res);
}

function callbackAsError(callback) {
  if (_.isFunction(callback)) callback(true, null);
}

