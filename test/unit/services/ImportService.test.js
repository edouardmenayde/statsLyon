const request  = require('supertest'),
      assert   = require('chai').assert,
      utils    = require('../../utils'),
      fixtures = require('../../fixtures'),
      dataset  = fixtures.dataset;

describe('ImportService', function () {

  before(function (done) {
    let importService = new ImportService({
      getImportName() {
        return 'velov_station';
      },
      getRequestObject(data) {
        return {
          index: fixtures.testIndex,
          type : 'velov_station',
          body : data
        }
      },
      getItemName() {
        return null;
      }
    });
    importService.execute(dataset)
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
