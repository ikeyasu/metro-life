'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');
var Railway = require('./railway.model.js');
var Station = require("../station/station.model");

describe('/api/tokyometro/railway#request', function() {
  it('should respond with JSON array', function(done) {
    Railway.request()
      .then(function(res) {
        res.should.be.instanceof(Array);
        done();
      });
  });
});

describe('/api/tokyometro/railway#requestWithJapaneseName', function() {
  this.timeout(15000);
  it('should respond with JSON array with JapaneseName', function(done) {
    Railway.requestWithJapaneseName()
      .then(function(res) {
        res.should.be.instanceof(Array);
        res[0]['odpt:stationOrder'][0]['dc:title'].should.equal('方南町');
        done();
      });
  });
});

describe('GET /api/tokyometro/railways', function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/railways')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.length.should.equal(10);
        done();
      });
  });
});

