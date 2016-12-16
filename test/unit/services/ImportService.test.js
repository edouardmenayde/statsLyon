const request       = require('supertest'),
      assert        = require('chai').assert,
      utils         = require('../../utils'),
      fixtures      = require('../../fixtures'),
      dataset       = fixtures.dataset,
      ImportService = require('../../../api/services/ImportService');

class StubService extends ImportService {

  getRequestObject(data) {
    return {
      index: fixtures.testIndex,
      type : 'velov_station',
      body : data
    }
  }

  getItemName(item) {
    return null;
  }

  getImportName() {
    return null;
  }

}

describe('ImportService', function () {

  before(function (done) {
    let stubService = new StubService();
    stubService.execute(dataset)
      .then(() => {
        done();
      })
      .catch(error => {
        done(error);
      });
  });

  before(utils.delay());

  describe('.execute(dataset)', function () {

    dataset.forEach(function (item) {

      it('Should have imported item correctly', function (done) {
        request(sails.hooks.http.app)
          .get(`/station/${item.stationID}`)
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .expect((response) => {
            assert.isObject(response.body);
            assert.property(response.body, '_source');
            assert.deepEqual(response.body._source, item);
          })
          .expect(200, done);
      });

    });

  });

});
