require('es6-promise').polyfill();
require('isomorphic-fetch');
var Queue = require('./utils/queue');
var Merger = require('./utils/merger');

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
        mockQueue.enqueue({
          type: type,
          body: body
        });

        resolve({ status: 200, body: { success: true } });
      });
    }

    // reqular segment adapter

    var merger = Merger(function(events) {
      return fetch(
        baseUrl + 'bulk',
        {
          method: method,
          headers: headers,
          body: JSON.stringify({ batch: events })
        }
      )
    });

    body.type = type;
    return merger.add(body).then();
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

    var publicApi = Constructor(constructAdapter(mockQueue, key, btoa), context);

    // set simple flag
    publicApi.mock = true;
    publicApi.logger = false;

    // mock inspect API
    publicApi.inspect = {
      allEvents: function() {
        return mockQueue.toArray();
      },

      lastEvent: function() {
        var array = mockQueue.toArray();
        return array[array.length - 1];
      },

      clearEvents: function() {
        var result = mockQueue.dequeue();
        while(result.next) {
          mockQueue = result.next;
          result = result.next.dequeue();
        }
      }
    }

    mockQueue.onEnqueue(function(queue, event) {
      if (publicApi.logger) {
        console.info('Segment.io event tracked', event);
      }
    });

    return publicApi;
  }
};
