module.exports = {
  mappings: {
    velovStation: {
      index: 'lyon',
      type : 'velovstation',
      body : {
        properties: {
          stationID    : {
            type: 'integer'
          },
          name         : {
            type: 'string'
          },
          address      : {
            type: 'string'
          },
          location_hint: {
            type: 'string'
          },
          commune      : {
            type: 'string'
          },
          stands       : {
            type: 'integer'
          },
          bonus        : {
            type: 'boolean'
          },
          division     : {
            type: 'string'
          },
          location     : {
            type: 'geo_point'
          },
          achievement  : {
            type: 'string'
          }
        }
      }
    }
  }
};
