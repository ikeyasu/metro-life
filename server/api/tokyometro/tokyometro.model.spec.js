'use strict';

var should = require('should');
var app = require('../../app');
var Tokyometro = require('./tokyometro.model');
var config = require('../../config/environment');
var memjs = require('memjs');

describe('/api/tokyometro.model#request', function() {
  it('should respond with JSON array', function(done) {
    Tokyometro.request({"rdf:type": "odpt:Train"},
    function(err, res) {
      should.not.exist(err);
      res.should.be.instanceof(Array)
      res[0]["@context"].should.equal("http://vocab.tokyometroapp.jp/context_odpt_Train.jsonld");
      done();
    });
  });
  it('should works with promise', function(done) {
    Tokyometro.request({"rdf:type": "odpt:Train"}).then(function(res) {
      res.should.be.instanceof(Array)
      res[0]["@context"].should.equal("http://vocab.tokyometroapp.jp/context_odpt_Train.jsonld");
      done();
    });
  });
});

describe('/api/tokyometro.model#requestTrains', function() {
  it('should respond with JSON array', function(done) {
    Tokyometro.requestTrains(function(err, res) {
      should.not.exist(err);
      res.should.be.instanceof(Array)
      res[0]["@context"].should.equal("http://vocab.tokyometroapp.jp/context_odpt_Train.jsonld");
      done();
    });
  });
});

describe('/api/tokyometro.model#requestStation', function() {
  it('should respond with JSON array and AoyamaIchome', function(done) {
    Tokyometro.requestStation("odpt.Station:TokyoMetro.Ginza.AoyamaItchome",
    function(err, res) {
      should.not.exist(err);
      res.should.be.instanceof(Array)
      res[0]["@context"].should.equal("http://vocab.tokyometroapp.jp/context_odpt_Station.jsonld");
      res[0]["dc:title"].should.equal("青山一丁目");
      done();
    });
  });
});

describe('/api/tokyometro.model#requestStationsFromRailway', function() {
  it('should respond with JSON array', function(done) {
    Tokyometro.requestStationsFromRailway("odpt.Railway:TokyoMetro.Tozai",
    function(err, res) {
      should.not.exist(err);
      res.should.be.instanceof(Array)
      res[0]["@context"].should.equal("http://vocab.tokyometroapp.jp/context_odpt_Railway.jsonld");
      res[0]["dc:title"].should.equal("東西");
      res[0]["odpt:stationOrder"][0]["odpt:station"].should.equal("odpt.Station:TokyoMetro.Tozai.Nakano");
      done();
    });
  });
});

describe('/api/tokyometro.model#requestJsonOrGetCache', function() {
  if (config.usingMock) return; // should not test on offlinemode

  it('should expire the cache', function(done) {
    var client = memjs.Client.create();
    var url = "http://ip.jsontest.com/";

    Tokyometro.requestJsonOrGetCache(url,
        function (error, json) {
          setTimeout(function() {
            client.get(url, function(err, val) {
              should.exist(val);
              JSON.parse(val.toString()).ip.should.equal(json.ip);
            });
          }, 0 /* msec */);

          setTimeout(function() {
            client.get(url, function(err, val) {
              should.not.exist(val);
              done();
            });
          }, 1010 /* msec */);
        }, function(json) { return 1; });

  });
});

describe('/api/tokyometro.model#frequencyResolver', function() {
  it('should expire the cache', function(done) {
    var mock = require("./tokyometro.mock").mockData["rdf%3Atype=odpt%3ATrain"];
    Tokyometro.frequencyResolver(mock).should.equal(90);
    done();
  });
});
