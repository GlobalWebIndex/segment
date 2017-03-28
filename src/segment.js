require('es6-promise').polyfill();
require('isomorphic-fetch');
var Queue = require('./utils/queue');

// library meta
var library = {
  name: 'gwi',
  version: '2.0.0-alpha2'
}

function constructAdapter(mockQueue, key, btoa) {
  // api settings
  btoa = btoa || window.btoa;
  var baseUrl = 'https://api.segment.io/v1/';
  var method = 'POST';
  var headers = {
    'Authorization': 'Basic ' + btoa(key + ':'),
    'Content-Type': 'application/json'
  };

  return function(type, body) {
    // test mock adapter
    if (mockQueue) {
      return new Promise(function(resolve) {
        setTimeout(function() {
          mockQueue.enqueue({
            type: type,
            body: body
          });

          resolve({ status: 200, body: { success: true } });
        }, 0);
      });
    }

    // reqular segment adapter
    return fetch(
      baseUrl + type,
      {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
      }
    );
  }
}

function Constructor(adapter, context) {
  var userId = 'anonymous';
  var queue = Queue();

  // meta
  context = context || {};
  context.library = context.library || {};
  context.library.name = library.name;
  context.library.version = library.version;

  function apiCall(type, body) {
    body.context = context;
    return adapter(type, body);
  }

  function lazyApiCall(type, body) {
    return new Promise(function(resolve, reject) {
      queue.enqueue(function() {
        body.userId = userId; // set userId

        apiCall(type, body)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  // user tracks
  queue.onEnqueue(function(queue) {
    if (userId === 'anonymous') return;

    while(queue) {
      var lastEvent = queue.dequeue();
      lastEvent.value();
      queue = lastEvent.next;
    }
  });

  // public interface
  return {
    identify: function(id, traits) {
      userId = id;

      return lazyApiCall('identify', {
        traits: traits
      });
    },

    track: function(event, properties) {
      return lazyApiCall('track', {
        event: event,
        properties: properties
      });
    },

    anonymousTrack: function(anonymousId, event, properties) {
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

// constructor
module.exports = {
  getClient: function(key, context, btoa) {
    return Constructor(constructAdapter(false, key, btoa), context);
  },

  getTestMockClient: function(key, context, btoa) {
    mockQueue = Queue();

    mockQueue.onEnqueue(function(queue, event) {
      console.info('Segment.io event tracked', event);
    });

    var publicApi = Constructor(constructAdapter(mockQueue, key, btoa), context);

    // set simple flag
    publicApi.mock = true;

    // mock inspect API
    publicApi.inspect = {
      allEvents: function() {
        return mockQueue.toArray();
      },

      lastEvent: function() {
        var array = mockQueue.toArray();
        return array[0];
      },

      clearEvents: function() {
        while(mockQueue) {
          var lastEvent = queue.dequeue();
          lastEvent.value();
          mockQueue = lastEvent.next;
        }
      }
    }

    return publicApi;
  }
};
