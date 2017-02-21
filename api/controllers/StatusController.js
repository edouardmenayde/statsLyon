/**
 * StatusController
 *
 * @description :: Server-side logic for managing Statuses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const requestHelpers     = require('request-helpers');
const velovStationStatus = sails.config.mappings.indexes.lyon.types.velovStationStatus;
const velovStation       = sails.config.mappings.indexes.lyon.types.velovStation;

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
                          'name',
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

  mostUsedStations: function (req, res) {

    const parametersBlueprint = [
      {
        param   : 'from',
        cast    : 'string',
        required: true
      },
      {
        param   : 'to',
        cast    : 'string',
        required: true
      },
      {
        param   : 'max',
        cast    : 'int',
        required: false,
        default : 6
      }
    ];

    let parameters = requestHelpers.secureParameters(parametersBlueprint, req);

    if (!parameters.isValid()) {
      return res.badRequest('No valid parameters.')
    }

    parameters = parameters.asObject();

    const elasticSearch = ElasticSearchService.instance;

    elasticSearch.search({
      index: 'lyon',
      type : velovStation.type,
      size : 400
    })
      .then(stations => {
        const mostUsedStationsPromise = [];

        stations.hits.hits.forEach(hit => {
          mostUsedStationsPromise.push(
            elasticSearch.search({
              index: 'lyon',
              type : velovStationStatus.type,
              size : 0,
              body : {
                query: {
                  bool: {
                    must: [
                      {
                        term: {
                          stationID: hit._source.stationID
                        }
                      },
                      {
                        range: {
                          createdAt: {
                            gte: parameters.from,
                            lt : parameters.to
                          }
                        }
                      }
                    ]
                  }
                },
                aggs : {
                  stats_of_available_stands: {
                    extended_stats: {
                      field: 'availableStands'
                    }
                  }
                }
              }
            })
          );
        });

        Promise
          .all(mostUsedStationsPromise)
          .then(results => {

            for (let i = 0; i < results.length; i++) {
              results[i].hits.hits[0] = stations.hits.hits[i];
            }

            let sortedResult = results.sort((current, next) => {

              let currentVariance = current.aggregations.stats_of_available_stands.variance / current.hits.hits[0]._source.stands;
              let nextVariance    = next.aggregations.stats_of_available_stands.variance / next.hits.hits[0]._source.stands;

              if (currentVariance > nextVariance) {
                return -1; // Current result will be come first
              }

              if (currentVariance < nextVariance) {
                return 1; // Next result will come last
              }
              return 0; // Current and next won't affect each other

            });

            sortedResult.splice(parameters.max); // delete all non needed result according to required maximum

            res.ok(sortedResult);
          })
          .catch(error => {
            res.negotiate(error);
          })
      })
      .catch(error => {
        res.negotiate(error);
      })
  },

  update: function (req, res) {
    VelovStationStatusService.doImport()
      .then(() => {
        res.ok();
      })
      .catch(error => {
        res.serverError(500, error);
      });
  },

};
