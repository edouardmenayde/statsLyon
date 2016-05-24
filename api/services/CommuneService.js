'use strict';

class CommuneService {
  importCommune (communeName) {
    return new Promise((resolve, reject) => {
      return Commune.find({
        name: communeName
      }).then(communeFound => {

        if (communeFound.length > 0) {
          return resolve(communeFound[0]);
        }

        return Commune.create({
          name: communeName
        }).then(communeCreated => {
          sails.log.debug(`Commune ${communeCreated.id} created`);
          return resolve(communeCreated);
        }).catch(error => {
          return reject(error)
        });

      }).catch(error => {
        return reject(error);
      });
    });
  }
}

module.exports = new CommuneService();
