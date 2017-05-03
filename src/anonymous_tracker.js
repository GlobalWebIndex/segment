var getArgs = require('./utils').getArgs;

var staticMethods = {
  init: function(client, anonymousId) {
    var userId = userId;

    var delegatedMethods = ['anonymousTrack', 'anonymousPage'];
    var publicMethods = {};

    for(var i = 0; i < delegatedMethods.length; i++) {
      var method = delegatedMethods[i];

      publicMethods[method] = function(m) {
        return function() {
          var args = getArgs(anonymousId, arguments);
          return client[m].apply(this, args);
        };
      }(method)
    }

    return publicMethods;
  }
}

module.exports = staticMethods;

