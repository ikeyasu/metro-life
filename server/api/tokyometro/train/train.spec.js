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
        res["odpt.Station:TokyoMetro.Tozai.Nakano"].length.should.equal(2);
      }
      res["odpt.Station:TokyoMetro.Tozai.Nakano"].forEach(function(trains) {
        trains.forEach(function(train) {
          train["odpt:railDirection"].should.equal("odpt.RailDirection:TokyoMetro.Nakano");
        });
      });
      res["odpt.Station:TokyoMetro.Tozai.NishiFunabashi"].forEach(function(trains) {
        trains.forEach(function(train) {
          train["odpt:railDirection"].should.equal("odpt.RailDirection:TokyoMetro.NishiFunabashi");
        });
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

describe('/api/train/train.model#TrainTimetable', function() {
  it('should store the timetable of train', function(done) {
    Train.TrainTimetable.findOne({trainNumber: "A0819"}, function(err, doc) {
      doc.trainNumber.should.equal("A0819");
      done();
    });
  });
});

describe('GET /api/tokyometro/trains/timetable/A0819',
function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/trains/timetable/A0819')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body["odpt:trainNumber"].should.equal("A0819");
        done();
      });
  });
});
