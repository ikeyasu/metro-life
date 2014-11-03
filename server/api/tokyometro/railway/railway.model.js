'use strict';

var _ = require('lodash');
var Tokyometro = require("../tokyometro.model");
var Station = require("../station/station.model");

var Q = require('q');

exports.request = function(callback) {
  return Tokyometro.request({"rdf:type": "odpt:Railway"}, callback);
};

exports.requestWithJapaneseName = function(callback) {
  var deferred = Q.defer();
  exports.request()
    .then(function(railways) {
      railways.forEach(function(railway) {
        railway['odpt:stationOrder'].forEach(function(station) {
          station['dc:title'] = Station.convertToJapaneseName(station['odpt:station']);
        });
      });
      deferred.resolve(railways);
    });
  return deferred.promise;
};
