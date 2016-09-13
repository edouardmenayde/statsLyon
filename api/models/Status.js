/**
 * Status.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    station        : {
      model: 'station'
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
    banking        : {
      type: 'boolean'
    }
  }

};
