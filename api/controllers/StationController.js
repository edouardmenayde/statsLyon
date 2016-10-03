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
   * Handle stat for stations.
   *
   * @param req
   * @param res
   */
  stat: function (req, res) {

    const velovStation = sails.config.mappings.velovStation;

    const elasticSearch = ElasticSearchService.instance;

    const toSearch = {
      ['aggs_for_lyon1']         : 'Lyon 1 er',
      ['aggs_for_lyon2']         : 'Lyon 2 ème',
      ['aggs_for_lyon3']         : 'Lyon 3 ème',
      ['aggs_for_lyon4']         : 'Lyon 4 ème',
      ['aggs_for_lyon5']         : 'Lyon 5 ème',
      ['aggs_for_lyon6']         : 'Lyon 6 ème',
      ['aggs_for_lyon7']         : 'Lyon 7 ème',
      ['aggs_for_lyon8']         : 'Lyon 8 ème',
      ['aggs_for_lyon9']         : 'Lyon 9 ème',
      ['aggs_for_villeurbanne']  : 'Villeurbanne',
      ['aggs_for_venissieux']    : 'Venissieux',
      ['aggs_for_vaulxenvelin']  : 'Vaulx En Velin',
      ['aggs_for_caluireetcuire']: 'Caluire Et Cuire'
    };

    const aggregations = {};

    Object.keys(toSearch).forEach(key => {
      let matchTerm     = toSearch[key];
      aggregations[key] = {
        filter      : {
          match_phrase: {
            town: matchTerm
          }
        },
        aggregations: {
          sum: {
            sum: {
              field: 'stands'
            }
          }
        }
      }
    });

    elasticSearch.search({
      index: 'lyon',
      type : velovStation.type,
      size : 0,
      body : {
        aggregations: aggregations
      }
    })
      .then(response => {
        res.ok(response.aggregations);
      })
      .catch(error => {
        sails.log.error(error);
        res.serverError(500, error);
      })
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
