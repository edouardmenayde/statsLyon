module.exports = {
  mappings: {
    indexes: {
      lyon: {
        types: {
          velovStation: {
            index: 'lyon_v2',
            type : 'velov_station',
            body : {
              properties: {
                createdAt   : {
                  type: 'date'
                },
                stationID   : {
                  type  : 'integer',
                  fields: {
                    whitespaced: {
                      type    : 'string',
                      analyzer: 'whitespace'
                    }
                  }
                },
                name        : {
                  type    : 'string',
                  analyzer: 'standard',
                  fields  : {
                    folded   : {
                      type    : 'string',
                      analyzer: 'folding'
                    },
                    untouched: {
                      type : 'string',
                      index: 'not_analyzed'
                    }
                  }
                },
                address     : {
                  type: 'string'
                },
                locationHint: {
                  type: 'string'
                },
                town        : {
                  type    : 'string',
                  analyzer: 'standard',
                  fields  : {
                    folded   : {
                      type    : 'string',
                      analyzer: 'folding'
                    },
                    untouched: {
                      type : 'string',
                      index: 'not_analyzed'
                    }
                  }
                },
                stands      : {
                  type: 'integer'
                },
                bonus       : {
                  type: 'boolean'
                },
                division    : {
                  type: 'string'
                },
                location    : {
                  type: 'geo_point'
                },
                achievement : {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  }
};
