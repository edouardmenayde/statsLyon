"use strict";

const async                = require('async');
const moment               = require('moment');

class ImportService {

  get elasticSearch() {
    return ElasticSearchService.instance;
  }

  getLoggingTime() {
    return moment(new Date()).format('h:mm:ss a');
  }

  getLoggingDate() {
    return moment(new Date()).format('DD/MM');
  }

  getLoggingHeader() {
    return `[${this.getLoggingDate()}] [${this.getImportName()}]`;
  }

  doSingleImport(data, callback) {
    this.elasticSearch
      .index(this.getRequestObject(data))
      .then(() => {
        sails.log.verbose(`${this.getLoggingHeader()} Imported an item named ${this.getItemName(data)}`);
        callback();
      })
      .catch(error => {
        sails.log.error(error);
        callback(error);
      });
  }

  handleCallback(error, resolve, reject) {
    if (error) {
      sails.log.error(`${this.getLoggingHeader()} Error during import of items at ${this.getLoggingTime()}.`);
      return reject(error);
    }

    sails.log.info(`${this.getLoggingHeader()} Done importing at ${this.getLoggingTime()}.`);
    resolve();
  }

  execute(dataset) {
    return new Promise((resolve, reject) => {

      sails.log.info(`${this.getLoggingHeader()} Started importing at ${this.getLoggingTime()}.`);

      async.each(dataset, this.doSingleImport.bind(this), (error) => {
        this.handleCallback(error, resolve, reject);
      });

    });
  }

}

module.exports = ImportService;
