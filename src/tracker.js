var Utils = require('./utils');
var Promise = require('es6-promise').Promise;

var staticMethods = {
  init: function(client, userId) {
    var userId = userId;
    var isIdentified = false;

    var delegatedMethods = ['track', 'page'];
    var publicMethods = {};

    for(var i = 0; i < delegatedMethods.length; i++) {
      var method = delegatedMethods[i];

      publicMethods[method] = function(m) {
        return function() {
          var args = Utils.getArgs(userId, arguments);
          return client[m].apply(this, args);
        };
      }(method)
    }

    publicMethods['identify'] = function(){
      var args = Utils.getArgs(userId, arguments);

      return client.identify
        .apply(this, args)
        .then(function(){
          isIdentified = true;
        });
    }

    publicMethods['identifyOnce'] = function(){
      if(isIdentified) {
        return new Promise(function(resolve){
          resolve();
        });
      }
      else {
        return publicMethods.identify(Utils.transformArguments(arguments));
      }
    }

    publicMethods['getIsIdentified'] = function(){
      return isIdentified;
    };

    return publicMethods;
  }
}

module.exports = staticMethods;
