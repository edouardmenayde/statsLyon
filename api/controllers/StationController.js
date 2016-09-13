/**
 * StationController
 *
 * @description :: Server-side logic for managing Stations.
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  import: function (req, res) {
    StationService.importStations()
      .then(() => {
        return res.json(200);
      })
      .catch(error => {
        return res.serverError(error);
      });
  }
};
