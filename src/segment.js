require('es6-promise').polyfill();
require('isomorphic-fetch');

var library = {
  name: 'gwi',
  version: '1.0.0'
}

module.exports = {
  getClient: function(key, context, btoa){
    btoa = btoa || window.btoa;

    context = context || {};
    context.library = context.library || {};
    context.library.name = library.name;
    context.library.version = library.version;

    var baseUrl = 'https://api.segment.io/v1/';
    var method = 'POST';
    var headers = {
      'Authorization': 'Basic ' + btoa(key + ':'),
      'Content-Type': 'application/json'
    };

    function apiCall(type, body) {
      body['context'] = context;

      return fetch(
        baseUrl + type,
        {
          method: method,
          headers: headers,
          body: JSON.stringify(body)
        }
      );
    };

    return {
      identify: function(userId, traits){
        return apiCall('identify', {
          userId: userId,
          traits: traits
        });
      },

      track: function(userId, event, properties){
        return apiCall('track', {
          userId: userId,
          event: event,
          properties: properties
        });
      },

      anonymousTrack: function(anonymousId, event, properties){
        return apiCall('track', {
          anonymousId: anonymousId,
          event: event,
          properties: properties
        });
      },

      page: function(userId, name, properties) {
        return apiCall('page', {
          userId: userId,
          name: name,
          properties: properties
        });
      },

      anonymousPage: function(anonymousId, name, properties) {
        return apiCall('page', {
          anonymousId: anonymousId,
          name: name,
          properties: properties
        });
      },

      version: library.version,
      name: library.name
    }
  }
};

