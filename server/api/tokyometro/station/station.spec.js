'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');
var Station = require('./station.model');

describe('GET /api/tokyometro/stations/odpt.Station:TokyoMetro.Ginza.AoyamaItchome', function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/stations/odpt.Station:TokyoMetro.Ginza.AoyamaItchome')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body[0]["dc:title"].should.equal("青山一丁目");
        done();
      });
  });
});

describe('/api/station/station.model#requestStationsNearBy', function() {
  it('should respond with JSON object with stations near by specified station',
  function(done) {
    Station.requestStationsNearBy(
      "odpt.Station:TokyoMetro.Tozai.Urayasu",
      "odpt.Railway:TokyoMetro.Tozai",
    function(err, res) {
      should.not.exist(err);
      res.should.be.instanceof(Object)
      res["odpt.Station:TokyoMetro.Tozai.Nakano"].length.should.equal(5);
      res["odpt.Station:TokyoMetro.Tozai.NishiFunabashi"].length.should.equal(5);

      res["odpt.Station:TokyoMetro.Tozai.NishiFunabashi"][0]
        .should.equal("odpt.Station:TokyoMetro.Tozai.Kasai");
      res["odpt.Station:TokyoMetro.Tozai.NishiFunabashi"][4]
        .should.equal("odpt.Station:TokyoMetro.Tozai.Kiba");

      res["odpt.Station:TokyoMetro.Tozai.Nakano"][0]
        .should.equal("odpt.Station:TokyoMetro.Tozai.MinamiGyotoku");
      res["odpt.Station:TokyoMetro.Tozai.Nakano"][4]
        .should.equal("odpt.Station:TokyoMetro.Tozai.NishiFunabashi");
      done();
    });
  });
});

describe('/api/station/station.model#convertToRailway', function() {
  it('should respond with railway name',
  function(done) {
    Station.convertToRailway("odpt.Station:TokyoMetro.Tozai.Urayasu")
      .should.equal("odpt.Railway:TokyoMetro.Tozai");
    done();
  });
});

describe('/api/station/station.model#convertToRailDirection', function() {
  it('should respond with railway name',
  function(done) {
    Station.convertToRailDirection("odpt.Station:TokyoMetro.Tozai.NishiFunabashi")
      .should.equal("odpt.RailDirection:TokyoMetro.NishiFunabashi");
    done();
  });
});

describe('GET /api/tokyometro/stations/nearby/odpt.Station:TokyoMetro.Tozai.Urayasu',
  function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/stations/nearby/odpt.Station:TokyoMetro.Tozai.Urayasu')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        var body = res.body;
        body.should.be.instanceof(Object)
        body["odpt.Station:TokyoMetro.Tozai.Nakano"].length.should.equal(5);
        body["odpt.Station:TokyoMetro.Tozai.NishiFunabashi"].length.should.equal(5);

        body["odpt.Station:TokyoMetro.Tozai.NishiFunabashi"][0]
          .should.equal("odpt.Station:TokyoMetro.Tozai.Kasai");
        body["odpt.Station:TokyoMetro.Tozai.NishiFunabashi"][4]
          .should.equal("odpt.Station:TokyoMetro.Tozai.Kiba");

        body["odpt.Station:TokyoMetro.Tozai.Nakano"][0]
          .should.equal("odpt.Station:TokyoMetro.Tozai.MinamiGyotoku");
        body["odpt.Station:TokyoMetro.Tozai.Nakano"][4]
          .should.equal("odpt.Station:TokyoMetro.Tozai.NishiFunabashi");
        done();
      });
  });
});
