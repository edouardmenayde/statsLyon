"use strict";

const ImportService = require('./ImportService');

class VelovStationService extends ImportService {

  get config() {
    return sails.config.mappings.indexes.lyon.types.velovStation;
  }

  get api() {
    return ApiLyonService.instance.velov.stations;
  }

  getRequestObject(item) {
    return {
      index: this.config.index,
      type : this.config.type,
      body : {
        createdAt   : new Date(),
        stationID   : parseInt(item.properties.idstation, 10),
        name        : item.properties.nom,
        address     : item.properties.addresse1,
        location    : {
          lat: parseFloat(item.geometry.coordinates[1]),
          lon: parseFloat(item.geometry.coordinates[0])
        },
        locationHint: item.properties.adresse2,
        division    : item.properties.pole,
        town        : item.properties.commune,
        bonus       : item.properties.stationbonus,
        stands      : item.properties.nbbornettes,
        achievement : item.properties.achevement
      }
    };
  }

  getItemName(item) {
    return item.properties.nom;
  }

  getImportName() {
    return 'VelovStation';
  }

  doImport() {
    return new Promise((resolve, reject) => {
      this.api
        .get('wfs')
        .then(stations => {
          this.execute(stations.features)
            .then(() => {
              resolve();
            })
            .catch(error => {
              sails.log.error(error);
              reject(error);
            });
        })
        .catch(error => {
          sails.log.error(error);
          reject(error);
        });
    });
  }
}

module.exports = new VelovStationService();
