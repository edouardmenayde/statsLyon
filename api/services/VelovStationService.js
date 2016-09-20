"use strict";

const async = require('async');

class VelovStationService {

  /**
   * @returns {Object}
   */
  get config() {
    return sails.config.mappings.velovStation;
  }

  /**
   * @returns {Object}
   */
  get api() {
    return ApiLyonService.instance.velov.stations;
  }

  /**
   * Returns friendly mapping for ElasticSearch.
   *
   * @param {Object} item
   * @returns {Object}
   */
  getRequestObject(item) {
    return {
      index: this.config.index,
      type : this.config.type,
      body : {
        createdAt   : new Date(),
        stationID   : parseInt(item.properties.idstation),
        name        : item.properties.nom,
        address     : item.properties.addresse1,
        location    : {
          lat: parseFloat(item.geometry.coordinates[1]),
          lon: parseFloat(item.geometry.coordinates[0])
        },
        locationHint: item.properties.adresse2,
        division    : item.properties.pole,
        commune     : item.properties.commune,
        bonus       : item.properties.stationbonus,
        stands      : item.properties.nbbornettes,
        achievement : item.properties.achevement
      }
    };
  }

  /**
   * Returns name of the item.
   *
   * @param {Object} item
   * @returns {string}
   */
  static getItemName(item) {
    return item.properties.nom;
  }

  /**
   * Returns name of the import.
   *
   * @returns {string}
   */
  static getImportName () {
    return 'VelovStation';
  }

  /**
   * Execute the import using the importService.
   *
   * @returns {Promise}
   */
  doImport() {
    return new Promise((resolve, reject) => {
      this.api
        .get('wfs')
        .then(stations => {
          const importService = ImportService(this);
          importService
            .execute(stations.features)
            .then(() => {
              resolve();
            })
            .catch(() => {
              reject();
            });
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = new VelovStationService();
