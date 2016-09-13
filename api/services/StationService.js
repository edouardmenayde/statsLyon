'use strict';

class StationService {

  get api() {
    return ApiLyonService.instance.velov.stations;
  }

  *doImportStations(stations) {
    for (let index = 0; index < stations.length; index++) {
      yield [this.importStation, stations[index]];
    }
  }

  importStations() {
    sails.log.debug('Starting an importStation job');
    this.importedStations = 0;
    return new Promise((resolve, reject) => {
      this.api.get('wfs')
        .then(stations => {

          if (!stations) {
            sails.log.error(`No station were retrieved from the api call.`);
            return reject();
          }

          WaitService(this.doImportStations, this, (error) => {
            if (error) {
              sails.log.error(`An error occurred after ${this.importedStations} were imported`);
              sails.log.error(error);
              return reject(error);
            }
            sails.log.info(`${this.importedStations} stations imported successfully`);
            return resolve();
          }, stations.features);
        }).catch(error => {
        return reject(error);
      });
    });
  }

  importStation(station, callback) {
    let stationId = station.properties.idstation;
    return Station.count({
      stationId: stationId
    }).then(count => {
      if (count > 0) {
        sails.log.debug(`Station "${station.properties.nom}" already exist`);
        return callback();
      }

      let numInCommune = station.properties.numdansarrondissement ? station.properties.numdansarrondissement : null;

      return Station.create({
        stationId   : station.properties.idstation,
        name        : station.properties.nom,
        address     : station.properties.adresse1,
        locationHint: station.properties.adresse2,
        numInCommune: numInCommune,
        stands      : station.properties.nbbornettes,
        bonus       : station.properties.stationbonus,
        division    : station.properties.pole,
        achievement : station.properties.achevement,
        location    : station.geometry.coordinates
      }).then(newStation => {
        return CommuneService.importCommune(station.properties.commune)
          .then(commune => {
            Station.update({
              id: newStation.id
            }, {
              commune: commune.id
            }).then(() => {
              sails.log.debug(`Station "${newStation.name}" imported`);
              this.importedStations += 1;
              return callback();
            }).catch(error => {
              return callback(error);
            });
          }).catch(error => {
            return callback(error);
          });
      }).catch(error => {
        return callback(error);
      });

    }).catch(error => {
      return callback(error);
    });
  }
}

module.exports = new StationService();
