module.exports = {
  testIndex    : 'test_lyon_v2',
  station      : {
    createdAt   : (new Date()).toJSON(),
    stationID   : 20100,
    name        : 'Test',
    address     : '14 rue de la garde',
    locationHint: "En face de l'hopital",
    town        : 'Lyon 4eme',
    stands      : 30,
    bonus       : true,
    division    : 'Test',
    location    : {
      lat: 45.78473625802337,
      lon: 4.852215476117999
    },
    achievement : ''
  },
  stationStatus: {
    createdAt      : (new Date()).toJSON(),
    stationID      : 20100,
    available      : true,
    town           : 'Lyon 4eme',
    name           : 'Test',
    bonus          : true,
    lastUpdate     : (new Date()).toJSON(),
    lastUpdateFme  : (new Date()).toJSON(),
    stands         : 30,
    availableStands: 15,
    availableBikes : 14,
    banking        : true,
    address        : '14 rue de la garde',
    locationHint   : 'En face de l\'hopital',
    location       : {
      lat: 45.78473625802337,
      lon: 4.852215476117999
    }
  },
  dataset      : [
    {
      createdAt   : (new Date()).toJSON(),
      stationID   : 20000,
      name        : 'Test2',
      address     : '24 rue de la garde',
      locationHint: "En face de l'hopital",
      town        : 'Lyon 4eme',
      stands      : 30,
      bonus       : true,
      division    : 'Test',
      location    : {
        lat: 45.78473625802337,
        lon: 4.852215476117999
      },
      achievement : ''
    }, {
      createdAt   : (new Date()).toJSON(),
      stationID   : 19200,
      name        : 'Test2',
      address     : '01 rue de la garde',
      locationHint: "En face",
      town        : 'Lyon 4eme',
      stands      : 30,
      bonus       : true,
      division    : 'Test',
      location    : {
        lat: 45.78473625802337,
        lon: 4.852215476117999
      },
      achievement : ''
    }
  ]
};
