"use strict";

const async = require('async');

class VelovStationStatusService {

  get config() {
    return sails.config.mappings.velovStationStatus;
  }

  get api() {
    return ApiLyonService.instance.velov.status;
  }

  getRequestObject(item) {
    return {
      index: this.config.index,
      type : this.config.type,
      body : {
        stationID      : item.number,
        name           : item.name,
        address        : item.addresse1,
        location       : {
          lat: item.lat,
          lon: item.lng
        },
        locationHint   : item.adresse2,
        commune        : item.commune,
        bonus          : item.bonus,
        available      : item.status == 'OPEN',
        stands         : item.bike_stands,
        availableStands: item.available_bike_stands,
        availableBikes : item.available_bikes,
        banking        : item.banking,
        lastUpdate     : new Date(item.last_update),
        lastUpdateFme  : new Date(item.last_update_fme)
      }
    }
  }

  doImport() {
    return new Promise((resolve, reject) => {
      this.api
        .get()
        .then(stationsStatus => {
          ImportService.execute(stationsStatus.values, this);
          resolve();
        })
        .catch(error => {
          reject(error);
        })
    });
  }
}

module.exports = new VelovStationStatusService();
