/**
 * TrafficController
 *
 * @description :: Server-side logic for managing Traffic
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  index: function (req, res) {
    const api = ApiLyonService.instance.criter.traffic;

    api.get()
      .then(response => {
        res.json(response);
      })
      .catch(error => {
        sails.log.error(error);
        res.serverError(500, error);
      });
  }

};
