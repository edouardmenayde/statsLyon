/**
 * StatusController
 *
 * @description :: Server-side logic for managing Statuses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const requestHelpers     = require('request-helpers');
const velovStationStatus = sails.config.mappings.indexes.lyon.types.velovStationStatus;

module.exports = {

  findAll: function (req, res) {
    const parametersBlueprint = [
      {
        param   : 'from',
        cast    : 'string',
        required: true,
      },
      {
        param   : 'to',
        cast    : 'string',
        required: true,
      }
    ];

    let parameters = requestHelpers.secureParameters(parametersBlueprint, req);

    if (!parameters.isValid()) {
      return res.badRequest('No valid parameters.')
    }

    parameters = parameters.asObject();

    const elasticSearch = ElasticSearchService.instance;

    return elasticSearch.search({
      index: 'lyon',
      type : velovStationStatus.type,
      size : 0,
      body : {
        aggregations: {
          last_x_minutes: {
            filter      : {
              range: {
                createdAt: {
                  gte: parameters.from,
                  lt : parameters.to
                }
              }
            },
            aggregations: {
              date_histogram: {
                date_histogram: {
                  field   : 'createdAt',
                  interval: '5m',
                  order   : {
                    _key: 'asc'
                  }
                },
                aggregations  : {
                  docs: {
                    top_hits: {
                      size   : 400,
                      _source: {
                        includes: [
                          'availableStands',
                          'location',
                          'stationID'
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
      .then(response => {
        res.ok(response.aggregations.last_x_minutes.date_histogram.buckets);
      })
      .catch(error => {
        sails.log.error(error);
        res.serverError(500, error);
      });
  },

  index: function (req, res) {
    const parametersBlueprint = [
      {
        param   : 'id',
        cast    : 'integer',
        required: true
      },
      {
        param   : 'from',
        cast    : 'string',
        required: true,
      },
      {
        param   : 'to',
        cast    : 'string',
        required: true,
      }
    ];

    let parameters = requestHelpers.secureParameters(parametersBlueprint, req);

    if (!parameters.isValid()) {
      return res.badRequest('No valid parameters.')
    }

    parameters = parameters.asObject();

    const elasticSearch = ElasticSearchService.instance;

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

  availableStands: function (req, res) {
    const parametersBlueprint = [
      {
        param   : 'id',
        cast    : 'integer',
        required: true
      }
    ];

    let parameters = requestHelpers.secureParameters(parametersBlueprint, req);

    if (!parameters.isValid()) {
      return res.badRequest('No valid parameters.')
    }

    parameters = parameters.asObject();

    const aggregationName = `extended_stats_for_${parameters.id}_with_field_${parameters.field}`;

    const aggregations = {
      [aggregationName]: {
        extended_stats: {
          field: 'availableStands'
        }
      }
    };

    const elasticSearch = ElasticSearchService.instance;

    elasticSearch.search({
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
    })
      .then((response) => {
        res.ok(response.aggregations[aggregationName]);
      })
      .catch(error => {
        sails.log.error(error);
        res.send(500, error);
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
