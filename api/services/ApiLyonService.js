'use strict';

const ApiLyon = require('api-lyon');

module.exports = {
  get instance() {
    if (!this._instance) {
      this._instance = new ApiLyon();
    }

    return this._instance;
  }
};
