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

describe('SearchController', function () {

  before(addStation());

  before(utils.delay());

  describe('.search(q) : /search', function () {
    it('Should return stations', function (done) {
      request(sails.hooks.http.app)
        .get(`/search?q=${station.stationID}`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect((response) => {
          assert.isArray(response.body);
          assert.property(response.body[0], '_source');
          assert.deepEqual(response.body[0]._source, station);
        })
        .expect(200, done);
    });
  });

  describe('.search() : /search', function () {
    it('Should return an error', function (done) {
      request(sails.hooks.http.app)
        .get(`/search/`)
        .set('Content-Type', 'application/json')
        .expect((response) => {
          assert.isArray(response.body);
          assert.deepEqual(response.body, []);
        })
        .expect(200, done);
    });
  });

});
