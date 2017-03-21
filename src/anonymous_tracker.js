var getArgs = require('./utils').getArgs;

var publicMethods = {
  init: function(client, anonymousId) {
    var userId = userId;

    return {
      anonymousTrack: function() {
        var args = getArgs(anonymousId, arguments);
        return client.anonymousTrack.apply(this, args);
      },
      anonymousPage: function() {
        var args = getArgs(anonymousId, arguments);
        return client.anonymousPage.apply(this, args);
      }
    }
  }
}

module.exports = publicMethods;

