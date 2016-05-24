/**
 * Station.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    station_id    : {
      type: 'integer'
    },
    name          : {
      type: 'string'
    },
    address       : {
      type: 'string'
    },
    location_hint : {
      type: 'string'
    },
    commune       : {
      model: 'commune'
    },
    num_in_commune: {
      type: 'integer'
    },
    stands        : {
      type: 'integer'
    },
    bonus         : {
      type: 'boolean'
    },
    division      : {
      type: 'string'
    },
    location      : {
      type: 'array'
    },
    achievement   : {
      type: 'string'
    },
    status        : {
      collection: 'status',
      via       : 'station'
    }
  }

};
