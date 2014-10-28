'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');
var config = require('../../../config/environment');
var Train = require('./train.model');

describe('GET /api/tokyometro/trains', function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/trains')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('GET /api/tokyometro/trains/delayed', function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/trains/delayed')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        if (config.usingMock)
          res.body.length.should.be.equal(2);
        done();
      });
  });
});

describe('/api/train/train.model#requestTrainsNearBy', function() {
  it('should respond with JSON object with trains near by specified station',
  function(done) {
    Train.requestTrainsNearBy(
      "odpt.Station:TokyoMetro.Tozai.Urayasu",
      "odpt.Railway:TokyoMetro.Tozai",
    function(err, res) {
      should.not.exist(err);
      res.should.be.instanceof(Object)
      if (config.usingMock) {
        var toNakano = res["odpt.Station:TokyoMetro.Tozai.Nakano"];
        toNakano.length.should.equal(3);
        toNakano[0]["odpt:fromStation"].should.equal("odpt.Station:TokyoMetro.Tozai.BarakiNakayama");
        toNakano[0]["odpt:toStation"].should.equal("odpt.Station:TokyoMetro.Tozai.Myoden");
        toNakano[1]["odpt:fromStation"].should.equal("odpt.Station:TokyoMetro.Tozai.NishiFunabashi");
        should.not.exist(toNakano[1]["odpt:toStation"]);
        toNakano[2]["odpt:fromStation"].should.equal("odpt.Station:TokyoMetro.Tozai.NishiFunabashi");
        toNakano[2]["odpt:toStation"].should.equal("odpt.Station:TokyoMetro.Tozai.BarakiNakayama");
        var toNishiFuna = res["odpt.Station:TokyoMetro.Tozai.NishiFunabashi"];
        toNishiFuna.length.should.equal(8);
        toNishiFuna[0]["odpt:fromStation"].should.equal("odpt.Station:TokyoMetro.Tozai.Kasai");
        should.not.exist(toNishiFuna[0]["odpt:toStation"]);
        toNishiFuna[1]["odpt:fromStation"].should.equal("odpt.Station:TokyoMetro.Tozai.MinamiSunamachi");
        should.not.exist(toNishiFuna[1]["odpt:toStation"]);
      }
      res["odpt.Station:TokyoMetro.Tozai.Nakano"].forEach(function(train) {
        train["odpt:railDirection"].should.equal("odpt.RailDirection:TokyoMetro.Nakano");
      });
      res["odpt.Station:TokyoMetro.Tozai.NishiFunabashi"].forEach(function(train) {
        train["odpt:railDirection"].should.equal("odpt.RailDirection:TokyoMetro.NishiFunabashi");
      });
      done();
    });
  });
});

describe('GET /api/tokyometro/trains/nearby/odpt.Station:TokyoMetro.Tozai.Urayasu',
function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/trains/nearby/odpt.Station:TokyoMetro.Tozai.Urayasu')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      });
  });
});

describe('GET /api/tokyometro/trains/timetable/A0819',
function() {
  it('should respond with JSON array and try to get at sametime', function(done) {
    var countdown = 2;
    request(app)
      .get('/api/tokyometro/trains/timetable/A0819')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body["odpt:trainNumber"].should.equal("A0819");
        countdown--;
        if (countdown === 0) done();
      });
    request(app)
      .get('/api/tokyometro/trains/timetable/A1658T ')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body["odpt:trainNumber"].should.equal("A1658T");
        countdown--;
        if (countdown === 0) done();
      });
  });
});
