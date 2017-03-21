var getArgs = require('./utils').getArgs;

var publicMethods = {
  init: function(client, userId) {
    var userId = userId;

    return {
      identify: function() {
        var args = getArgs(userId, arguments);
        return client.identify.apply(this, args);
      },
      track: function() {
        var args = getArgs(userId, arguments);
        return client.track.apply(this, args);
      },
      page: function() {
        var args = getArgs(userId, arguments);
        return client.page.apply(this, args);
      }
    }
  }
}

module.exports = publicMethods;
