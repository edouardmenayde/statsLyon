'use strict';

const ElasticSearch = require('elasticsearch');

module.exports = {
  get instance() {
    if (!this._instance) {
      this._instance = new ElasticSearch.Client(sails.config.connections.ES);
    }

    return this._instance;
  }
};
