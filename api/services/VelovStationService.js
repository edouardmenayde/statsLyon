"use strict";

const async = require('async');

class VelovStationService {

  get config () {
    return sails.config.mappings.velovStation;
  }

  get api() {
    return ApiLyonService.instance.velov.stations;
  }

  getRequestObject(item) {
    return {
      index: this.config.index,
      type : this.config.type,
      body : {
        stationID   : item.properties.idstation,
        name        : item.properties.nom,
        address     : item.properties.addresse1,
        location    : item.geometry.coordinates,
        locationHint: item.properties.adresse2,
        division    : item.properties.pole,
        commune     : item.properties.commune,
        bonus       : item.properties.stationbonus,
        stands      : item.properties.nbbornettes,
        achievement : item.properties.achevement
      }
    };
  }

  doImport() {
    return new Promise((resolve, reject) => {
      this.api
        .get('wfs')
        .then(stations => {
          ImportService.execute(stations.features, this);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = new VelovStationService();
