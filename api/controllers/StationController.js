/**
 * StationController
 *
 * @description :: Server-side logic for managing Stations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const requestHelpers = require('request-helpers');
const removeAccents  = require('remove-accents');
const velovStation   = sails.config.mappings.indexes.lyon.types.velovStation;

module.exports = {


  findAll: function (req, res) {
    const elasticSearch = ElasticSearchService.instance;

    elasticSearch.search({
      index: 'lyon',
      type : velovStation.type,
      size : 400
    })
      .then(response => {
        res.ok(response.hits.hits);
      })
      .catch(res.negotiate);
  },

  index: function (req, res) {

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

    const elasticSearch = ElasticSearchService.instance;

    return elasticSearch.search({
      index: 'lyon',
      type : velovStation.type,
      size : 1,
      body : {
        query: {
          match: {
            stationID: parameters.id
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
  },

  town: function (req, res) {
    const elasticSearch = ElasticSearchService.instance;

    elasticSearch.search({
      index: 'lyon',
      type : velovStation.type,
      size : 0,
      body : {
        aggregations: {
          towns: {
            terms: {
              field: 'town.untouched',
              size : 50
            }
          }
        }
      }
    })
      .then(response => {
        const buckets = response.aggregations.towns.buckets;
        const towns   = buckets.map(bucket => bucket.key);
        res.ok(towns);
      })
      .catch(error => {
        res.serverError(500, error);
      });
  },

  stat: function (req, res) {

    const parametersBlueprint = [
      {
        param   : 'query',
        required: true
      }
    ];

    let parameters = requestHelpers.secureParameters(parametersBlueprint, req);

    if (!parameters.isValid()) {
      return res.badRequest('No valid parameters.')
    }

    parameters = parameters.asObject();

    const towns = parameters.query.split(',');

    if (!Array.isArray(towns)) {
      return res.badRequest('No valid parameters.')
    }

    const elasticSearch = ElasticSearchService.instance;

    const aggregations = {};

    towns.forEach(town => {
      const usableTownName         = removeAccents(town).replace(/ /g, '').toLowerCase();
      aggregations[usableTownName] = {
        filter      : {
          match_phrase: {
            'town.folded': town
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
