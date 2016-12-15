const SailsApp = require('sails').Sails,
      config   = require('./config'),
      fixtures = require('./fixtures');

var sails;

before((done) => {

  sails = new SailsApp();
  sails.load(config, (error, sails) => {

    if (error) {
      return done(error);
    }

    sails.config.mappings.indexes.lyon.types.velovStation.index =
      sails.config.mappings.indexes.lyon.types.velovStationStatus.index =
        sails.config.mappings.indexes.lyon.lyon.index = fixtures.testIndex;

    const elasticSearch = ElasticSearchService.instance;

    elasticSearch
      .indices
      .delete({
        index: fixtures.testIndex
      }, function (error) {

        if (error) {
          return done(error);
        }

        ElasticSearchService
          .bootstrap()
          .then(() => {
            done();
          });
      });


  });

});

after((done) => {
  sails.lower(done);
});
