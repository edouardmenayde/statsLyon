"use strict";

const async  = require('async');
const moment = require('moment');

class ImportService {

  /**
   * Construct an import service instance with given resource.
   *
   * @param {Object} resource
   */
  constructor(resource) {
    this.resource = resource;
  }

  /**
   * @returns {Object} ElasticSearch
   */
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
      .index(this.resource.getRequestObject(data))
      .then(() => {
        sails.log.verbose(`[${moment(new Date()).format('DD/MM')}] [${this.resource.getImportName()}] Imported an item named ${this.resource.getItemName(data)}`);
        callback();
      })
      .catch(error => {
        sails.log.error(error);
        callback(error);
      });
  }

  /**
   * Handle callback of async function.
   *
   * @param {Object} error
   * @param {Function} resolve
   * @param {Function} reject
   * @returns {Function}
   */
  handleCallback(error, resolve, reject) {
    const header = `[${moment(new Date()).format('DD/MM')}] [${this.resource.getImportName()}]`;

    if (error) {
      sails.log.error(`${header} Error during import of items at ${moment(new Date()).format('h:mm:ss a')}.`);
      return reject();
    }

    sails.log.info(`${header} Done importing at ${moment(new Date()).format('h:mm:ss a')}.`);
    resolve();
  }

  /**
   * Commit import over dataSet.
   *
   * @param {Array} dataSet
   */
  execute(dataSet) {
    return new Promise((resolve, reject) => {
      const header = `[${moment(new Date()).format('DD/MM')}] [${this.resource.getImportName()}]`;
      sails.log.info(`${header} Started importing at ${moment(new Date()).format('h:mm:ss a')}.`);
      async.each(dataSet, this.doSingleImport.bind(this), (error) => {
        this.handleCallback.call(this, error, resolve, reject);
      });
    });
  }

}

module.exports = ImportService;
