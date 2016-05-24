'use strict';

var async = require('async');

class StatusService {
  get api () {
    return ApiLyonService.instance.velov.status;
  }

  importStationsStatus () {
    this.importedStationsStatus = 0;
    return new Promise((resolve, reject) => {
      this.api.get()
        .then(stationsStatus => {
          async.each(
            stationsStatus.values,
            (stationStatus, callback) => {
              Station.findOne({station_id: stationStatus.number})
                .then(stationFound => {
                  Status.create({
                    station         : stationFound.id,
                    last_update     : stationStatus.last_update,
                    last_update_fme : stationStatus.last_update_fme,
                    stands          : stationStatus.bike_stands,
                    available_stands: stationStatus.available_bike_stands,
                    available_bikes : stationStatus.available_bikes,
                    banking         : stationStatus.banking
                  }).then(() => {
                    this.importedStationsStatus += 1;
                    sails.log.debug(`Added live status for station "${stationFound.name}" imported`);
                    return callback();
                  }).catch(error => {
                    sails.log.error(`An error occurred after ${this.importedStationsStatus} were imported`);
                    sails.log.error(error);
                    return callback(error);
                  });
                })
                .catch(error => {
                  return callback(error);
                });
            },
            (error) => {
              if (error) {
                sails.log.error(`An error occurred after ${this.importedStationsStatus} were imported`);
                sails.log.error(error);
                return reject(error);
              }
              sails.log.info(`${this.importedStationsStatus} stations imported successfully`);
              return resolve();
            });
        })
        .catch(error => {
          return error;
        });
    });
  }
}

module.exports = new StatusService();
