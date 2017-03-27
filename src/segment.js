require('es6-promise').polyfill();
require('isomorphic-fetch');
var Queue = require('./utils/queue');

// library meta
var library = {
  name: 'gwi',
  version: '2.0.0-alpha1'
}

// constructor
module.exports = {
  getClient: function(key, context, btoa) {
    var userId = 'anonymous';
    var queue = Queue();
    btoa = btoa || window.btoa;

    // meta
    context = context || {};
    context.library = context.library || {};
    context.library.name = library.name;
    context.library.version = library.version;

    // api settings
    var baseUrl = 'https://api.segment.io/v1/';
    var method = 'POST';
    var headers = {
      'Authorization': 'Basic ' + btoa(key + ':'),
      'Content-Type': 'application/json'
    };

    // api request
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
    }

    function lazyApiCall(type, body) {
      return new Promise(function(resolve) {
        queue.enqueue(function() {
          body.userId = userId; // set userId

          apiCall(type, body).then(function(result) {
            resolve(result);
          });
        });
      });
    }

    // user tracks
    queue.subscribe(function(queue) {
      if (userId === 'anonymous') return;

      while(queue) {
        var lastEvent = queue.dequeue();
        lastEvent.value();
        queue = lastEvent.next;
      }
    });

    // public interface
    return {
      identify: function(id, traits){
        userId = id;

        return lazyApiCall('identify', {
          traits: traits
        });
      },

      track: function(event, properties){
        return lazyApiCall('track', {
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

      page: function(name, properties) {
        return lazyApiCall('page', {
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
