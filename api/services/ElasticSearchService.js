"use strict";

const ElasticSearch = require('elasticsearch');

module.exports = {
  /**
   * Returns an elasticSearch instance configured from file.
   *
   * @returns {ElasticSearch}
   */
  get instance() {
    if (!this._instance) {
      this._instance = new ElasticSearch.Client(sails.config.connections.ES);
    }

    return this._instance;
  }
};
