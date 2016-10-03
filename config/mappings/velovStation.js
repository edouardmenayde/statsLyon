module.exports = {
  mappings: {
    velovStation: {
      index: 'lyon_v2',
      type : 'velov_station',
      body : {
        properties: {
          createdAt    : {
            type: 'date'
          },
          stationID    : {
            type: 'integer'
          },
          name         : {
            type    : 'string',
            analyzer: 'standard',
            fields  : {
              folded: {
                type    : 'string',
                analyzer: 'folding'
              }
            }
          },
          address      : {
            type: 'string'
          },
          locationHint: {
            type: 'string'
          },
          town           : {
            type    : 'string',
            analyzer: 'standard',
            fields  : {
              folded: {
                type    : 'string',
                analyzer: 'folding'
              }
            }
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
