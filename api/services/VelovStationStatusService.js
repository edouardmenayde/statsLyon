"use strict";

const ImportService = require('./ImportService');

class VelovStationStatusService extends ImportService {

  get config() {
    return sails.config.mappings.indexes.lyon.types.velovStationStatus;
  }

  get api() {
    return ApiLyonService.instance.velov.status;
  }

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

  getItemName(item) {
    return item.name;
  }

  getImportName() {
    return 'VelovStationStatus';
  }

  getData(data) {
    return data.values;
  }

  doImport() {
    return new Promise((resolve, reject) => {
      this.api
        .get()
        .then(stationsStatus => {
          this.execute(stationsStatus.values)
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
        })
    });
  }
}

module.exports = new VelovStationStatusService();
