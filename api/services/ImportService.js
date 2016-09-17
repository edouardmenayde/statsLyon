"use strict";

const async = require('async');

class ImportService {

  get elasticSearch() {
    return ElasticSearchService.instance;
  }

  /**
   * Execute a single data import.
   *
   * @param {Object} data
   * @param {Function} callback
   */
  doSingleImport(data, callback) {
    this.elasticSearch
      .index(this.caller.getRequestObject(data))
      .then(() => {
        sails.log.info(`Imported an item`);
        callback();
      })
      .catch(error => {
        sails.log.error(error);
        callback(error);
      });
  }

  /**
   * Commit import over data set to specified elastic search index and type.
   *
   * @param {Array} dataset
   * @param {Object} caller
   */
  execute(dataset, caller) {
    this.caller = caller; // might not be ideal ?

    async.each(dataset, this.doSingleImport.bind(this), (error) => {
      if (error) {
        return sails.log.error(`Error during import of items.`);
      }
      sails.log.info(`Done importing.`)
    });
  }

}

module.exports = new ImportService();
