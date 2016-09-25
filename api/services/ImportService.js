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
   * Returns logging time.
   *
   * @returns {string}
   */
  getLoggingTime() {
    return moment(new Date()).format('h:mm:ss a');
  }

  /**
   * Returns logging date in format day/month.
   *
   * @returns {string}
   */
  getLoggingDate() {
    return moment(new Date()).format('DD/MM');
  }

  /**
   * Returns logging headers composed of day and resource name.
   *
   * @returns {string}
   */
  getLoggingHeader() {
    return `[${this.getLoggingDate()}] [${this.resource.getImportName()}]`;
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
        sails.log.verbose(`${this.getLoggingHeader()} Imported an item named ${this.resource.getItemName(data)}`);
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
    if (error) {
      sails.log.error(`${this.getLoggingHeader()} Error during import of items at ${this.getLoggingTime()}.`);
      return reject(error);
    }

    sails.log.info(`${this.getLoggingHeader()} Done importing at ${this.getLoggingTime()}.`);
    resolve();
  }

  /**
   * Commit import over dataSet.
   *
   * @param {Array} dataSet
   */
  execute(dataSet) {
    return new Promise((resolve, reject) => {

      sails.log.info(`${this.getLoggingHeader()} Started importing at ${this.getLoggingTime()}.`);

      async.each(dataSet, this.doSingleImport.bind(this), (error) => {
        this.handleCallback(error, resolve, reject);
      });

    });
  }

}

module.exports = ImportService;
