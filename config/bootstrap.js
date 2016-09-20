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

module.exports.bootstrap = function (cb) {

  sails.on('lifted', () => {

    const elasticSearch = ElasticSearchService.instance;
    const mappings      = sails.config.mappings;

    for (let mappingName in mappings) {
      (function () {

        if (!mappings.hasOwnProperty(mappingName)) {
          return;
        }

        var mapping = sails.config.mappings[mappingName];

        elasticSearch
          .indices
          .create(mapping, (error, response) => {

            if (error) {
              sails.log.verbose(error);
            }

            sails.log.verbose(response);

            elasticSearch
              .indices
              .putMapping(mapping)
              .then((response) => {
                sails.log.verbose(response);
              })
              .catch(error => {
                sails.log.error(error);
              });
          })
      })();
    }

  });

  cb();
};
