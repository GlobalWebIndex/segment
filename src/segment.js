require('es6-promise').polyfill();
require('isomorphic-fetch');
var Queue = require('./utils/queue');
var Merger = require('./utils/merger');

// library meta
var library = {
  name: 'gwi',
  version: '2.0.0-alpha3'
}

function buildContext(context) {
  // meta
  context = context || {};
  context.library = context.library || {};
  context.library.name = library.name;
  context.library.version = library.version;

  return context;
}

function withDefaultOptions(options) {
  options = options || {}
  options.timeout = options.timeout !== undefined ? options.timeout : 100;
  options.context = buildContext(options.context);

  return options;
}

function constructAdapter(mockQueue, key, btoa, options) {
  options = withDefaultOptions(options);

  // api settings
  btoa = btoa || window.btoa;

  var baseUrl = 'https://api.segment.io/v1/';
  var method = 'POST';
  var headers = {
    'Authorization': 'Basic ' + btoa(key + ':'),
    'Content-Type': 'application/json'
  };

  // Batch request merging
  var merger = Merger(function(events) {
    return fetch(
      baseUrl + 'batch',
      {
        method: method,
        headers: headers,
        body: JSON.stringify({ batch: events, context: options.context })
      }
    );
  });

  merger.timeout = options.timeout;

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
    body.type = type;
    return merger.add(body);
  }
}

function Constructor(adapter) {
  var userId = 'anonymous';
  var queue = Queue();

  var apiCall = adapter;

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
  getClient: function(key, btoa, options) {
    return Constructor(constructAdapter(false, key, btoa, options));
  },

  getTestMockClient: function(key, btoa, options) {
    mockQueue = Queue();

    var publicApi = Constructor(constructAdapter(mockQueue, key, btoa, options));

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
