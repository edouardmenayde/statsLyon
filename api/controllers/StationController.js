/**
 * StationController
 *
 * @description :: Server-side logic for managing Stations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const requestHelpers = require('request-helpers');

module.exports = {

  // index: function (req, res) {
  //   const parametersBlueprint = [
  //     {
  //       param   : 'query',
  //       cast    : 'string',
  //       required: false
  //     }
  //   ];
  //
  //   var parameters = requestHelpers.secureParameters(parametersBlueprint, req);
  //
  //   if (!parameters.isValid()) {
  //     sails.log.debug('No valid parameters.');
  //     return res.json(500, 'No valid paramters.')
  //   }
  //
  //   parameters = parameters.asObject();
  //
  //   ElasticSearchService.instance.search({
  //     index: 'stationsstatus',
  //     type : 'stationstatus',
  //     size : 50,
  //     q    : parameters.query // lastUpdate:[2016-09-14T14:00:00 TO 2016-09-14T15:05:00] AND stationID=7062
  //   })
  //     .then(response => {
  //       res.json(response);
  //     })
  //     .catch(error => {
  //       sails.log.error(error);
  //       res.json(500, error);
  //     });
  // },
  //
  // stat: function (req, res) {
  //   const parametersBlueprint = [
  //     {
  //       param   : 'query',
  //       cast    : 'string',
  //       required: false
  //     }
  //   ];
  //
  //   var parameters = requestHelpers.secureParameters(parametersBlueprint, req);
  //
  //   // if (!parameters.isValid()) {
  //   //   sails.log.debug('No valid parameters.');
  //   //   return res.json(500, 'No valid paramters.')
  //   // }
  //
  //   parameters = parameters.asObject();
  //
  //   ElasticSearchService.instance.search({
  //     index: 'stationsstatus',
  //     type : 'stationstatus',
  //     size : 0,
  //     body: {
  //
  //     }
  //   })
  //     .then(response => {
  //       res.json(response);
  //     })
  //     .catch(error => {
  //       sails.log.error(error);
  //       res.json(500, error);
  //     });
  // },

  import: function (req, res) {
    VelovStationService.doImport()
      .then(() => {
        res.json(200);
      })
      .catch(error => {
        res.json(500, error);
      })
  }

};
