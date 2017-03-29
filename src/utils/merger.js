var Promise = require('es6-promise');

function Merger(mainResolve) {
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
  var timeout;
  var callBacks = [];
  function resetDebounce(callBack) {
    clearTimeout(timeout);
    callBacks.push(callBack);

    timeout = setTimeout(function() {
      var result = mainResolve(state);
      callBacks.forEach(function(cb) {
        cb(result);
      });

      callBacks = [];
      state = [];
    }, publicApi.timeout);
  }

  return publicApi;
};

module.exports = Merger;
