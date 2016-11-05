/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

const async = require('async');

module.exports.bootstrap = (cb) => {

  sails.on('lifted', () => {

    const elasticSearch = ElasticSearchService.instance;
    const index         = sails.config.mappings.indexes.lyon;
    const mappings      = sails.config.mappings.indexes.lyon.types;

    elasticSearch
      .indices
      .create(index, (error, response) => {

        if (error) {
          sails.log.verbose(error);
        }

        sails.log.verbose(response);

        async.each(mappings, (mapping, callback) => {
          elasticSearch
            .indices
            .putMapping(mapping, (error, response) => {

              if (error) {
                sails.log.verbose(error);
              }

              sails.log.verbose(response);

              callback();
            });
        });
      });

  });

  cb();
};
