/**
 * StatusController
 *
 * @description :: Server-side logic for managing Statuses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const requestHelpers = require('request-helpers');

module.exports = {

  /**
   * Handle get request.
   *
   * @param {Object} req
   * @param {Object} res
   *
   * @returns {Function}
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
      },
      {
        param   : 'from',
        cast    : 'string',
        required: false,
      },
      {
        param   : 'to',
        cast    : 'string',
        required: false,
      }
    ];

    var parameters = requestHelpers.secureParameters(parametersBlueprint, req);

    if (!parameters.isValid()) {
      return res.badRequest('No valid parameters.')
    }

    parameters = parameters.asObject();

    const velovStationStatus = sails.config.mappings.velovStationStatus;

    const elasticSearch = ElasticSearchService.instance;

    if (parameters.id > 0 && parameters.from && parameters.to) {
      return elasticSearch.search({
        index: 'lyon',
        type : velovStationStatus.type,
        size : 288, // (60 / 5) * 24
        body : {
          sort : [
            {
              createdAt: {
                order: 'asc'
              }
            }
          ],
          query: {
            filtered: {
              query : {
                range: {
                  createdAt: {
                    gte: parameters.from,
                    lt : parameters.to
                  }
                }
              },
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
          res.ok(response.hits.hits || []);
        })
        .catch(error => {
          sails.log.error(error);
          res.serverError(500, error);
        })
    }

    elasticSearch.search({
      index: 'lyon',
      type : velovStationStatus.type,
      size : 50,
      q    : parameters.query // lastUpdate:[2016-09-14T14:00:00 TO 2016-09-14T15:05:00] AND stationID=7062
    })
      .then(response => {
        res.ok(response);
      })
      .catch(error => {
        sails.log.error(error);
        res.serverError(500, error);
      });
  },

  stat: function (req, res) {
    const parametersBlueprint = [
      {
        param   : 'field',
        cast    : 'string',
        required: true
      },
      {
        param   : 'id',
        cast    : 'integer',
        required: true
      },
      {
        param   : 'statType',
        cast    : 'string',
        required: false
      }
    ];

    var parameters = requestHelpers.secureParameters(parametersBlueprint, req);

    if (!parameters.isValid()) {
      return res.badRequest('No valid parameters.')
    }

    parameters = parameters.asObject();

    const velovStationStatus = sails.config.mappings.velovStationStatus;

    const elasticSearch = ElasticSearchService.instance;

    const aggregations = {};

    const aggregationName = `extended_stats_for_${parameters.id}_with_field_${parameters.field}`;

    switch (parameters.statType) {
      case 'extendedStats':
        aggregations[aggregationName] = {
          extended_stats: {
            field: parameters.field
          }
        };
        break;
      case 'stats':
      default:
        aggregations[aggregationName] = {
          extended_stats: {
            field: parameters.field
          }
        };
        break;
    }

    const searchQuery = {
      index: 'lyon',
      type : velovStationStatus.type,
      size : 0,
      body : {
        query       : {
          filtered: {
            filter: {
              term: {
                stationID: parameters.id
              }
            }
          }
        },
        aggregations: aggregations
      }
    };

    elasticSearch.search(searchQuery)
      .then(response => {
        res.ok(response.aggregations[aggregationName]);
      })
      .catch(error => {
        sails.log.error(error);
        res.serverError(500, error);
      });
  },

  /**
   * Fire up import for velov station status.
   *
   * @param {Object} req
   * @param {Object} res
   */
  update: function (req, res) {
    VelovStationStatusService.doImport()
      .then(() => {
        res.ok();
      })
      .catch(error => {
        res.serverError(500, error);
      });
  }

};
