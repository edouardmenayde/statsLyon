const request  = require('supertest'),
      assert   = require('chai').assert,
      utils    = require('../../utils'),
      fixtures = require('../../fixtures'),
      station  = fixtures.station;

function addStation() {
  return function (done) {
    ElasticSearchService
      .instance
      .index({
        index: fixtures.testIndex,
        type : sails.config.mappings.indexes.lyon.types.velovStation.type,
        id   : 1,
        body : station
      }, (error) => {

        if (error) {
          return done(error);
        }

        done();
      });
  }
}

describe('StationController', function () {

  before(addStation());

  before(utils.delay());

  describe('.station(id): GET /station/:id', function () {

    it('Should return a station', function (done) {
      request(sails.hooks.http.app)
        .get(`/station/${station.stationID}`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect((response) => {
          assert.isObject(response.body);
          assert.property(response.body, '_source');
          assert.deepEqual(response.body._source, station);
        })
        .expect(200, done);
    });

    it('Should return an empty station', function (done) {
      request(sails.hooks.http.app)
        .get('/station/2')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect((response) => {
          assert.isObject(response.body);
          assert.deepEqual(response.body, {});
        })
        .expect(200, done);
    });

  });

  describe('.station(): GET /station', function () {
    it('Should return an error', function (done) {
      request(sails.hooks.http.app)
        .get('/station/')
        .set('Content-Type', 'application/json')
        .expect(400, done);
    });
  });

  describe('.town(): GET /station/town', function () {
    it('Should return towns', function (done) {
      request(sails.hooks.http.app)
        .get('/station/town')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect((response) => {
          assert.isArray(response.body);
        })
        .expect(200, done);
    });
  });

});
