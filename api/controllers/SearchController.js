/**
 * SearchController
 *
 * @description :: Server-side logic for managing Search
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const requestHelpers = require('request-helpers');
const velovStation = sails.config.mappings.indexes.lyon.types.velovStation;

module.exports = {

  index: function (req, res) {
    const parametersBlueprint = [
      {
        param   : 'q',
        cast    : 'string',
        required: true
      }
    ];

    let parameters = requestHelpers.secureParameters(parametersBlueprint, req);

    if (!parameters.valid) {
      return res.ok([]);
    }

    parameters = parameters.asObject();

    const elasticSearch = ElasticSearchService.instance;

    const fields = ['name.folded', 'town.folded'];

    if (Number.isInteger(parseInt(parameters.q))) {
      fields.push('stationID.whitespaced');
    }

    elasticSearch.search({
      index: 'lyon',
      type : velovStation.type,
      size : 10,
      body : {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  type  : 'most_fields',
                  query : parameters.q,
                  fields: fields
                }
              },
              {
                multi_match: {
                  type  : 'phrase_prefix',
                  query : parameters.q,
                  fields: fields
                }
              }
            ]
          }
        }
      }
    })
      .then(response => {
        res.ok(response.hits.hits);
      })
      .catch(error => {
        sails.log.error(error);
        res.serverError(500, error);
      });
  }

};
