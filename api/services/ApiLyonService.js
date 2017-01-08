"use strict";

const ApiLyon = require('api-lyon');

module.exports = {
  /**
   * Returns an instance of ApiLyon.
   *
   * @returns {ApiLyon}
   */
  get instance() {
    if (!this._instance) {

      let options = null;

      if (sails.config.grandlyon) {
        options = {
          auth: {
            login   : sails.config.grandlyon.login,
            password: sails.config.grandlyon.password
          }
        }
      }

      this._instance = new ApiLyon(options);
    }

    return this._instance;
  }
};
