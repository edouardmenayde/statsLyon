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
      this._instance = new ApiLyon();
    }

    return this._instance;
  }
};
