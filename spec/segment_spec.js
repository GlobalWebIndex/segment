var Segment = require('../src/segment');
var fetchMock = require('fetch-mock');
var btoa = require('btoa');

function matchSegmentCall(actualData, expectedData) {
  expect(Object.keys(actualData)).toEqual(['method', 'headers', 'body']);

  var
    method = actualData.method,
    headers = actualData.headers,
    body = JSON.parse(actualData.body);

  expect(method).toEqual(expectedData.method);
  expect(headers).toEqual(expectedData.headers);
  expect(body).toEqual(expectedData.body);
}

describe('Segment', function() {
  var segment, key;
  var batchUrl;

  beforeEach(function() {
    key = '123';

    batchUrl = 'https://api.segment.io/v1/batch';

    fetchMock
      .mock(batchUrl, 200);
  });

  afterEach(function() {
    fetchMock.reset();
  });

  describe('without custom context', function(){
    beforeEach(function() {
      segment = Segment.getClient(key, { timeout: -1 });
    });

    describe('user events', function() {

      describe('#identify', function() {
        var traits;

        beforeEach(function(done) {
          userId = 'jon.snow';
          traits = {
            swordsman: true
          };

          segment.identify(userId, traits).then(done);
        });

        it('should call identify', function() {
          var calls = fetchMock._calls[batchUrl];

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              batch: [
                {
                  userId: userId,
                  type: 'identify',
                  traits: traits
                }
              ],
              context: {
                library: {
                  name: segment.name,
                  version: segment.version
                }
              },
            }
          });
        });
      });

      describe('#track', function() {
        var event, properties;

        beforeEach(function(done){
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.identify(userId);
          segment.track(event, properties).then(done);
        });

        it('should call track', function() {
          var calls = fetchMock._calls[batchUrl];

          expect(calls.length).toEqual(2);

          matchSegmentCall(calls[1][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              batch: [
                {
                  event: event,
                  properties: properties,
                  userId: userId,
                  type: 'track',
                }
              ],
              context: {
                library: {
                  name: segment.name,
                  version: segment.version
                }
              }
            }
          });
        });
      });

      describe('#page', function() {
        var name, properties;

        beforeEach(function(done){
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.identify(userId);
          segment.page(name, properties).then(done);
        });

        it('should call page', function() {
          var calls = fetchMock._calls[batchUrl];

          expect(calls.length).toEqual(2);

          matchSegmentCall(calls[1][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              batch: [
                {
                  name: name,
                  type: 'page',
                  userId: userId,
                  properties: properties,
                }
              ],
              context: {
                library: {
                  name: segment.name,
                  version: segment.version
                }
              }
            }
          });
        });
      });
    });

    describe('anonymous events', function() {
      var anonymousId;

      beforeEach(function(){
        anonymousId = 'abcdxyz';
      });

      describe('#anonymousTrack', function() {
        var event, properties;

        beforeEach(function(done) {
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.anonymousTrack(anonymousId, event, properties).then(done);
        });

        it('should call track', function() {
          var calls = fetchMock._calls[batchUrl];

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              batch: [
                {
                  anonymousId: anonymousId,
                  event: event,
                  type: 'track',
                  properties: properties,
                }
              ],
              context: {
                library: {
                  name: segment.name,
                  version: segment.version
                }
              }
            }
          });
        });
      });

      describe('#anonymousPage', function() {
        var name, properties;

        beforeEach(function(done) {
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.anonymousPage(anonymousId, name, properties).then(done);
        });

        it('should call page', function() {
          var calls = fetchMock._calls[batchUrl];

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              batch: [
                {
                  anonymousId: anonymousId,
                  name: name,
                  type: 'page',
                  properties: properties,
                }
              ],
              context: {
                library: {
                  name: segment.name,
                  version: segment.version
                }
              }
            }
          });
        });
      });
    });
  });

  describe('with custom context', function() {
    var app, libraryName, libraryVersion, context;

    beforeEach(function(){
      app = 'my-supreme-app';
      libraryName = 'some-custom-name';
      libraryVersion = '-1.1.1';

      context = {
        app: app,
        library: {
          name: libraryName,
          version: libraryVersion
        }
      }

      segment = Segment.getClient(key, { timeout: -1, context: context });
    });

    describe('user events', function() {
      var userId;

      beforeEach(function() {
        userId = 'jon.snow';
      });

      describe('#identify', function() {
        var traits;

        beforeEach(function(done) {
          traits = {
            swordsman: true
          };

          segment.identify(userId, traits).then(done);
        });

        it('should call identify', function() {
          var calls = fetchMock._calls[batchUrl];

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              batch: [
                {
                  userId: userId,
                  traits: traits,
                  type: 'identify',
                }
              ],
              context: {
                app: app,
                library: {
                  name: segment.name,        // Does not allow overwriting these
                  version: segment.version   // Does not allow overwriting these
                }
              }
            }
          });
        });
      });

      describe('#track', function() {
        var event, properties;

        beforeEach(function(done) {
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.identify(userId);
          segment.track(event, properties).then(done);
        });

        it('should call track', function() {
          var calls = fetchMock._calls[batchUrl];

          expect(calls.length).toEqual(2);

          matchSegmentCall(calls[1][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              batch: [
                {
                  userId: userId,
                  event: event,
                  properties: properties,
                  type: 'track'
                }
              ],
              context: {
                app: app,
                library: {
                  name: segment.name,        // Does not allow overwriting these
                  version: segment.version   // Does not allow overwriting these
                }
              }
            }
          });
        });
      });

      describe('#page', function() {
        var name, properties;

        beforeEach(function(done) {
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.identify(userId);
          segment.page(name, properties).then(done);
        });

        it('should call page', function() {
          var calls = fetchMock._calls[batchUrl];

          expect(calls.length).toEqual(2);

          matchSegmentCall(calls[1][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              batch: [
                {
                  userId: userId,
                  name: name,
                  properties: properties,
                  type: 'page'
                }
              ],
              context: {
                app: app,
                library: {
                  name: segment.name,        // Does not allow overwriting these
                  version: segment.version   // Does not allow overwriting these
                }
              }
            }
          });
        });
      });
    });

    describe('anonymous events', function() {
      var anonymousId;

      beforeEach(function() {
        anonymousId = 'abcdxyz';
      });

      describe('#anonymousTrack', function() {
        var event, properties;

        beforeEach(function(done) {
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.anonymousTrack(anonymousId, event, properties).then(done);
        });

        it('should call track', function() {
          var calls = fetchMock._calls[batchUrl];

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              batch: [
                {
                  anonymousId: anonymousId,
                  event: event,
                  properties: properties,
                  type: 'track'
                }
              ],
              context: {
                app: app,
                library: {
                  name: segment.name,        // Does not allow overwriting these
                  version: segment.version   // Does not allow overwriting these
                }
              }
            }
          });
        });
      });

      describe('#anonymousPage', function() {
        var name, properties;

        beforeEach(function(done) {
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.anonymousPage(anonymousId, name, properties).then(done);
        });

        it('should call page', function() {
          var calls = fetchMock._calls[batchUrl];

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              batch: [
                {
                  anonymousId: anonymousId,
                  name: name,
                  properties: properties,
                  type: 'page'
                }
              ],
              context: {
                app: app,
                library: {
                  name: segment.name,        // Does not allow overwriting these
                  version: segment.version   // Does not allow overwriting these
                }
              }
            }
          });
        });
      });
    });
  });

  describe('Promise API', function() {
    var properties;

    beforeEach(function() {
      segment = Segment.getClient(key, { timeout: -1 });

      properties = {
        location: 'here'
      };
    });

    it('should resolve promises in right order', function(done) {
      var resolved = [];

      segment.track('first', properties).then(() => {
        resolved.push(0);
      });

      segment.track('second', properties).then(() => {
        resolved.push(1);
      });

      segment.track('third', properties).then(() => {
        resolved.push(2);

        expect(resolved).toEqual([0,1,2], 'Tracked in right order');

        // track all data
        var calls = fetchMock._calls[batchUrl];

        expect(calls.length).toEqual(4);

        matchSegmentCall(calls[0][1], {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + btoa(key + ':'),
            'Content-Type': 'application/json'
          },
          body: {
            batch: [
              {
                userId: userId,
                event: 'first',
                properties: properties,
                type: 'track'
              }
            ],
            context: {
              library: {
                name: segment.name,
                version: segment.version
              }
            }
          }
        });

        done();
      });

      // identify called after tracks
      segment.identify(userId);
    });
  });

  describe('batching works as expected', function() {
    var userId;

    beforeEach(function(done) {
      userId = 'jon.show'
      segment = Segment.getClient(key);

      segment.identify(userId);
      segment.page('home');
      segment.track('first');
      segment.track('second').then(done);
    });

    it('should send all requests in batch', function() {
      var calls = fetchMock._calls[batchUrl];

      expect(calls.length).toEqual(1);

      matchSegmentCall(calls[0][1], {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(key + ':'),
          'Content-Type': 'application/json'
        },
        body: {
          batch: [
            {
              userId: userId,
              type: 'identify'
            },
            {
              userId: userId,
              type: 'page',
              name: 'home'
            },
            {
              userId: userId,
              event: 'first',
              type: 'track'
            },
            {
              userId: userId,
              event: 'second',
              type: 'track'
            }
          ],
          context: {
            library: {
              name: segment.name,
              version: segment.version
            }
          }
        }
      });
    });
  });
});

describe('test mock', function() {
  var segment;

  beforeEach(function() {
    segment = Segment.getTestMockClient('');
  });

  afterEach(function() {
    segment.inspect.clearEvents();
  });

  describe('#inspect', function() {
    if ('should be object', function() {
      expect(typeof segment.inspect).toEqual('object');
    });

    describe("#allEvents", function() {
      it('should include indentify and track', function() {
        segment.identify('test');
        segment.track('hi')

        const events = segment.inspect.allEvents().map(i => i.type);
        expect(events).toEqual(['identify', 'track']);
      });

      it('should include indentify and track in right order', function() {
        segment.track('hi');
        segment.identify('test');

        const events = segment.inspect.allEvents().map(i => i.type);
        expect(events).toEqual(['track', 'identify']);
      });

      it('should be empty before identify is called', function() {
        segment.track('hi');

        expect(segment.inspect.allEvents()).toEqual([]);
      });
    });

    describe('#lastEvent', function() {
      beforeEach(function() {
        segment.identify('test');
      });

      it('should contain track', function() {
        segment.track('event', { foo: 'bar' });

        var result = segment.inspect.lastEvent();

        expect(result.type).toEqual('track');
        expect(result.event).toEqual('event');
        expect(result.properties.foo).toEqual('bar');
      });

      it('should be really last', function() {
        segment.track('first', { foo: 'bar' });
        segment.track('second', { bar: 'baz' });

        var result = segment.inspect.lastEvent();

        expect(result.type).toEqual('track');
        expect(result.event).toEqual('second');
        expect(result.properties.bar).toEqual('baz');
      });
    });

    describe('#clearEvents', function() {
      beforeEach(function() {
        segment.identify('test');
        segment.track('first');
        segment.track('second');
        segment.inspect.clearEvents();
      });

      it('should be empty', function() {
        expect(segment.inspect.allEvents()).toEqual([]);
        expect(segment.inspect.lastEvent()).toEqual(undefined);
      });
    });
  });
});
