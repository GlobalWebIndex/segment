var Promise = require('es6-promise');

function Merger(mainResolve) {
  mainResolve = mainResolve || function(result) { return result };

  // initial state
  var state = [];

  // debouncing
  var timeout = null;
  var callBacks = [];

  function later() {
    timeout = null;
    var result = mainResolve(state);
    callBacks.forEach(function(cb) {
      cb(result);
    });

    callBacks = [];
    state = [];
  }

  function resetDebounce(callBack) {
    clearTimeout(timeout);
    callBacks.push(callBack);

    if (publicApi.timeout >= 0) {
      timeout = setTimeout(later, publicApi.timeout);
    } else {
      later();
    }
  }

  var publicApi = {
    timeout: 100,

    add: function(thing) {
      state.push(thing);

      return new Promise(function(resolve) {
        resetDebounce(function() {
          resolve(state);
        });
      });
    },

    force: later
  };

  return publicApi;
};

module.exports = Merger;
