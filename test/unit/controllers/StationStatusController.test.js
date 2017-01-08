const request       = require('supertest'),
      assert        = require('chai').assert,
      utils         = require('../../utils'),
      fixtures      = require('../../fixtures'),
      stationStatus = fixtures.stationStatus,
      moment        = require('moment');

function addStationStatus() {
  return function (done) {
    ElasticSearchService
      .instance
      .index({
        index: fixtures.testIndex,
        type : sails.config.mappings.indexes.lyon.types.velovStationStatus.type,
        id   : 2,
        body : stationStatus
      }, (error) => {

        if (error) {
          done(error);
        }

        done();
      });
  }
}

describe('StationStatusController', function () {

  before(addStationStatus());

  before(utils.delay());

  describe('.status(from, to): GET /status', function () {
    it('Should return all stations for given range', function (done) {
      request(sails.hooks.http.app)
        .get(`/status?from=${moment().subtract(1, 'hours').utc().format()}&to=${moment().utc().format()}`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect((response) => {
          assert.isArray(response.body);
          assert(response.body.length >= 1);
          const firstRecord = response.body[0].docs.hits.hits[0]._source;
          assert.property(firstRecord, 'availableStands');
          assert.property(firstRecord, 'location');
          assert.property(firstRecord, 'name');
          assert.property(firstRecord, 'stationID');
        })
        .expect(200, done);
    });
  });

  describe('.status(id, from, to): GET /status/:id', function () {
    it('Should return stations status', function (done) {
      request(sails.hooks.http.app)
        .get(`/status/${stationStatus.stationID}?from=${stationStatus.createdAt}&to=${stationStatus.createdAt}`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect((response) => {
          assert.isArray(response.body);
        })
        .expect(200, done);
    });
  });

  describe('.status(): GET /status', function () {
    it('Should return an error', function (done) {
      request(sails.hooks.http.app)
        .get(`/status/`)
        .set('Content-Type', 'application/json')
        .expect(400, done);
    });
  });

  describe('.status(id): GET /status/:id', function () {
    it('Should return an error', function (done) {
      request(sails.hooks.http.app)
        .get(`/status/47`)
        .set('Content-Type', 'application/json')
        .expect(400, done);
    });
  });

  describe('.status(id, from): GET /status/:id', function () {
    it('Should return an error', function (done) {
      request(sails.hooks.http.app)
        .get(`/status/47?from=${new Date()}`)
        .set('Content-Type', 'application/json')
        .expect(400, done);
    });
  });

  describe('.status(id, to): GET /status/:id', function () {
    it('Should return an error', function (done) {
      request(sails.hooks.http.app)
        .get(`/status/47?to=${new Date()}`)
        .set('Content-Type', 'application/json')
        .expect(400, done);
    });
  });

  describe('.availability(): GET /status/availability', function () {
    it('Should return an availability', function (done) {
      request(sails.hooks.http.app)
        .get(`/status/availability`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect((response) => {
          assert.property(response.body, 'value');
          assert.isObject(response.body);
        })
        .expect(200, done);
    });
  });

  describe('.availableStands(id): GET /status/:id/available-stands', function () {
    it('Should return stats about available stands for a station', function (done) {
      request(sails.hooks.http.app)
        .get(`/status/${stationStatus.stationID}/available-stands/`)
        .set('Content-Type', 'application/json')
        .expect((response) => {
          assert.isObject(response.body);
        })
        .expect(200, done);
    });
  });

});
