'use strict';

module.exports = function (givenFunction, instance, callback) {

  if (typeof givenFunction !== 'function') {
    throw new Error(`First argument must be a function* instead of a ${typeof givenFunction}`);
  }

  if (!instance || typeof instance !== 'object') {
    throw new Error('You must pass an instance.');
  }

  if (typeof callback !== 'function') {
    throw new Error(`Callback must a function instead of a ${typeof callback}`);
  }

  function callAsyncFunction (yieldedValue) {
    if (typeof yieldedValue[0] !== 'function') {
      throw new Error('First yielded argument must be a function.');
    }

    let asyncFunction    = yieldedValue[0];
    let argumentsToApply = Array.prototype.slice.call(yieldedValue, 1);
    argumentsToApply.push(iterator.callback);
    asyncFunction.apply(instance, argumentsToApply);
  }

  var argumentsToApply = Array.prototype.slice.call(arguments, 3);
  var iterator         = givenFunction.apply(instance, argumentsToApply);

  iterator.callback = function (error, data) {
    if (error) {
      return callback(error);
    }

    let yielded = iterator.next(data);
    if (yielded.done) {
      if (callback) {
        callback(null, yielded.value);
      }

      return;
    }

    callAsyncFunction(yielded.value);
  };

  iterator.callback();

  return iterator;
};
