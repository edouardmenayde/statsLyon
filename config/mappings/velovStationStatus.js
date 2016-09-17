module.exports = {
  mappings: {
    velovStationStatus: {
      index: 'lyon',
      type : 'velovstationstatus',
      body : {
        properties: {
          // ID of the station
          stationID      : {
            type: 'integer'
          },
          // Whether station is available or not
          available      : {
            type: 'boolean'
          },
          // Commune in where the station is located
          commune        : {
            type: 'string'
          },
          // Name of the station
          name           : {
            type: 'string'
          },
          // Whether you get time bonus when riding a bike from a downhill station to a uphill station
          bonus          : {
            type: 'boolean'
          },
          lastUpdate     : {
            type: 'date'
          },
          lastUpdateFme  : {
            type: 'date'
          },
          stands         : {
            type: 'integer'
          },
          availableStands: {
            type: 'integer'
          },
          availableBikes : {
            type: 'integer'
          },
          // Whether it is possible to directly buy transport ticket there
          banking        : {
            type: 'boolean'
          },
          // Address you can see
          address        : {
            type: 'string'
          },
          // Visual hint of the station location
          locationHint   : {
            type: 'string'
          },
          // Precise location
          location       : {
            type: 'geo_point'
          }
        }
      }
    }
  }
};
