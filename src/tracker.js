var getArgs = require('./utils').getArgs;

var staticMethods = {
  init: function(client, userId) {
    var userId = userId;

    var delegatedMethods = ['identify', 'track', 'page'];
    var publicMethods = {};

    for(var i = 0; i < delegatedMethods.length; i++) {
      var method = delegatedMethods[i];

      publicMethods[method] = function(m) {
        return function() {
          var args = getArgs(userId, arguments);
          return client[m].apply(this, args);
        };
      }(method)
    }

    return publicMethods;
  }
}

module.exports = staticMethods;
