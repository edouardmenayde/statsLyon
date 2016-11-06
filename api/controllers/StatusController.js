/**
 * StatusController
 *
 * @description :: Server-side logic for managing Statuses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const requestHelpers = require('request-helpers');
const velovStationStatus = sails.config.mappings.indexes.lyon.types.velovStationStatus;

module.exports = {

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
            bool: {
              must: [
                {
                  range: {
                    createdAt: {
                      gte: parameters.from,
                      lt : parameters.to
                    }
                  }
                },
                {
                  match: {
                    stationID: parameters.id
                  }
                }
              ]
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

  availability: function (req, res) {
    const elasticSearch = ElasticSearchService.instance;

    const aggregationName = 'overall_average_stands_availability';

    elasticSearch.search({
      index: 'lyon',
      type : velovStationStatus.type,
      body : {
        aggregations: {
          [aggregationName]: {
            avg: {
              field: 'available'
            }
          }
        }
      }
    })
      .then(response => {
        res.ok(response.aggregations[aggregationName]);
      })
      .catch(error => {
        sails.log.error(error);
        res.serverError(500, error);
      })
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
          term: {
            stationID: parameters.id
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
