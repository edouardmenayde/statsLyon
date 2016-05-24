/**
 * StatusController
 *
 * @description :: Server-side logic for managing Statuses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  update: function (req, res) {
    StatusService.importStationsStatus()
      .then(() => {
        return res.json(200);
      })
      .catch(error => {
        return res.serverError(error);
      })
  }

};
