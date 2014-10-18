'use strict';

var should = require('should');
var app = require('../../app');
var Tokyometro = require('./tokyometro.model');

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
  it('should respond with JSON array', function(done) {
    Tokyometro.requestStation("odpt.Station:TokyoMetro.Ginza.AoyamaItchome", function(err, res) {
      should.not.exist(err);
      res.should.be.instanceof(Array)
      res[0]["@context"].should.equal("http://vocab.tokyometroapp.jp/context_odpt_Station.jsonld");
      res[0]["dc:title"].should.equal("青山一丁目");
      done();
    });
  });
});
