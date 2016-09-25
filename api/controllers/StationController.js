/**
 * StationController
 *
 * @description :: Server-side logic for managing Stations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const requestHelpers = require('request-helpers');

module.exports = {

  /**
   * Handle get request.
   *
   * @param req
   * @param res
   * @returns {*}
   */
  index: function (req, res) {
    const parametersBlueprint = [
      {
        param   : 'query',
        cast    : 'string',
        required: false
      },
      {
        param   : 'id',
        cast    : 'integer',
        required: false
      }
    ];

    var parameters = requestHelpers.secureParameters(parametersBlueprint, req);

    if (!parameters.isValid()) {
      return res.badRequest('No valid parameters.')
    }

    parameters = parameters.asObject();

    const velovStation = sails.config.mappings.velovStation;

    const elasticSearch = ElasticSearchService.instance;

    if (parameters.id > 0) {
      return elasticSearch.search({
        index: 'lyon',
        type : velovStation.type,
        size : 1,
        body : {
          query: {
            filtered: {
              filter: {
                match: {
                  stationID: parameters.id
                }
              }
            }
          }
        }
      })
        .then(response => {
          if (response.hits.hits[0]) {
            return res.ok(response.hits.hits[0]);
          }
          res.ok({});
        })
        .catch(error => {
          sails.log.error(error);
          res.serverError(500, error);
        });
    }

    elasticSearch.search({
      index: 'lyon',
      type : velovStation.type,
      size : 10,
      body : {
        query: {
          multi_match: {
            type  : 'most_fields',
            query : parameters.query,
            fields: ['name', 'name.folded', 'id']
          }
        }// lastUpdate:[2016-09-14T14:00:00 TO 2016-09-14T15:05:00] AND stationID=7062
      }
    })
      .then(response => {
        res.ok(response.hits.hits);
      })
      .catch(error => {
        sails.log.error(error);
        res.serverError(500, error);
      });
  },

  /**
   * Fire up import for velov stations.
   *
   * @param {Object} req
   * @param {Object} res
   */
  import: function (req, res) {
    VelovStationService.doImport()
      .then(() => {
        res.ok();
      })
      .catch(error => {
        res.serverError(500, error);
      });
  }

};
