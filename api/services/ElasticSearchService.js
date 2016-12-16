"use strict";

const ElasticSearch = require('elasticsearch');
const async         = require('async');

module.exports = {

  get instance() {
    if (!this._instance) {
      this._instance = new ElasticSearch.Client(sails.config.connections.ES);
    }

    return this._instance;
  },

  bootstrap() {

    const index    = sails.config.mappings.indexes.lyon.lyon;
    const mappings = sails.config.mappings.indexes.lyon.types;

    return new Promise((resolve, reject) => {
      this.instance
        .indices
        .create(index, (error, response) => {

          if (error) {
            sails.log.verbose(error);
          }

          sails.log.verbose(response);

          async.each(mappings, (mapping, callback) => {
            this.instance
              .indices
              .putMapping(mapping, (error, response) => {

                if (error) {
                  sails.log.verbose(error);
                }

                sails.log.verbose(response);

                callback();
              });
          }, (error) => {
            // if (error) {
            //   reject(error);
            // }

            resolve();
          });
        });
    });


  }

};
