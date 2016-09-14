'use strict';

const async = require('async');

class StatusService {

  get elasticsearch() {
    return ElasticSearchService.instance;
  }

  get api() {
    return ApiLyonService.instance.velov.status;
  }

  importStationsStatus() {
    this.importedStationsStatus = 0;
    return new Promise((resolve, reject) => {
      this.api.get()
        .then(stationsStatus => {
          async.each(
            stationsStatus.values,
            (stationStatus, callback) => {
              this.elasticsearch.index({
                index: 'stationsstatus',
                type : 'stationstatus',
                body : {
                  name           : stationStatus.name,
                  commune        : stationStatus.commune,
                  bonus          : stationStatus.bonus,
                  address        : stationStatus.addresse1,
                  location       : {
                    lat: stationStatus.lat,
                    lon: stationStatus.lng
                  },
                  locationHint   : stationStatus.adresse2,
                  stationID      : stationStatus.number,
                  available      : stationStatus.status == 'OPEN',
                  lastUpdate     : new Date(stationStatus.last_update),
                  lastUpdateFme  : new Date(stationStatus.last_update_fme),
                  stands         : stationStatus.bike_stands,
                  availableStands: stationStatus.available_bike_stands,
                  availableBikes : stationStatus.available_bikes,
                  banking        : stationStatus.banking
                }
              })
                .then(() => {
                  this.importedStationsStatus += 1;
                  sails.log.debug(`Added live status for station "${stationStatus.name}" imported`);
                  callback();
                })
                .catch(error => {
                  callback(error);
                });
            },
            (error) => {
              if (error) {
                sails.log.error(`An error occurred after ${this.importedStationsStatus} were imported`);
                sails.log.error(error);
                reject(error);
              }
              sails.log.info(`${this.importedStationsStatus} stations imported successfully`);
              resolve();
            });
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = new StatusService();
