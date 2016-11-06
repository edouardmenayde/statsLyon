"use strict";

const async = require('async');

class VelovStationStatusService {

  /**
   * @returns {Object}
   */
  get config() {
    return sails.config.mappings.indexes.lyon.types.velovStationStatus;
  }

  /**
   * @returns {Object}
   */
  get api() {
    return ApiLyonService.instance.velov.status;
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
        createdAt      : new Date(),
        stationID      : parseInt(item.number),
        name           : item.name,
        address        : item.addresse1,
        location       : {
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lng)
        },
        locationHint   : item.adresse2,
        town           : item.commune,
        bonus          : item.bonus,
        available      : item.status == 'OPEN',
        stands         : parseInt(item.bike_stands),
        availableStands: parseInt(item.available_bike_stands),
        availableBikes : parseInt(item.available_bikes),
        banking        : item.banking,
        lastUpdate     : new Date(item.last_update),
        lastUpdateFme  : new Date(item.last_update_fme)
      }
    }
  }

  /**
   * Returns name of the item.
   *
   * @param {Object} item
   * @returns {string}
   */
  getItemName(item) {
    return item.name;
  }

  /**
   * Returns name of the import.
   *
   * @returns {string}
   */
  getImportName() {
    return 'VelovStationStatus';
  }

  /**
   * Execute the import using the importService.
   *
   * @returns {Promise}
   */
  doImport() {
    return new Promise((resolve, reject) => {
      this.api
        .get()
        .then(stationsStatus => {
          const importService = new ImportService(this);
          importService
            .execute(stationsStatus.values)
            .then(() => {
              resolve();
            })
            .catch(error => {
              sails.log.error(error);
              reject();
            });
        })
        .catch(error => {
          sails.log.error(error);
          reject(error);
        })
    });
  }
}

module.exports = new VelovStationStatusService();
