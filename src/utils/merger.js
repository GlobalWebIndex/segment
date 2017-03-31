var Promise = require('es6-promise');

function Merger(mainResolve) {
  mainResolve = mainResolve || function(result) { return result };

  // initial state
  var state = [];

  var publicApi = {
    timeout: 100,

    add: function(thing) {
      state.push(thing);

      return new Promise(function(resolve) {
        resetDebounce(function() {
          resolve(state);
        });
      });
    }
  };

  // debouncing
  var timeout = null;
  var callBacks = [];

  function resetDebounce(callBack) {
    clearTimeout(timeout);
    callBacks.push(callBack);

    function later() {
      timeout = null;
      var result = mainResolve(state);
      callBacks.forEach(function(cb) {
        cb(result);
      });

      callBacks = [];
      state = [];
    }

    if (publicApi.timeout >= 0) {
      timeout = setTimeout(later, publicApi.timeout);
    } else {
      later();
    }
  }

  return publicApi;
};

module.exports = Merger;
