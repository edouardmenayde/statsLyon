/**
 * Status.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    station         : {
      model: 'station'
    },
    last_update     : {
      type: 'date'
    },
    last_update_fme : {
      type: 'date'
    },
    stands          : {
      type: 'integer'
    },
    available_stands: {
      type: 'integer'
    },
    available_bikes : {
      type: 'integer'
    },
    banking         : {
      type: 'boolean'
    }
  }

};
