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
  var identifyUrl, trackUrl, pageUrl;

  beforeEach(function() {
    key = '123';

    identifyUrl = 'https://api.segment.io/v1/identify';
    trackUrl = 'https://api.segment.io/v1/track';
    pageUrl = 'https://api.segment.io/v1/page';

    fetchMock
      .mock(identifyUrl, 200)
      .mock(trackUrl, 200)
      .mock(pageUrl, 200)
  });

  afterEach(function() {
    fetchMock.reset();
  });

  describe('without custom context', function(){
    beforeEach(function() {
      segment = Segment.getClient(key, null, btoa);
    });

    describe('user events', function() {

      describe('#identify', function() {
        var traits;

        beforeEach(function() {
          userId = 'jon.snow';
          traits = {
            swordsman: true
          };

          segment.identify(userId, traits);
        });

        it('should call identify', function() {
          var calls = fetchMock._calls[identifyUrl]

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              userId: userId,
              traits: traits,
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

      describe('#track', function() {
        var event, properties;

        beforeEach(function(){
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.identify(userId);
          segment.track(event, properties);
        });

        it('should call track', function() {
          var calls = fetchMock._calls[trackUrl]

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              userId: userId,
              event: event,
              properties: properties,
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

        beforeEach(function(){
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.identify(userId);
          segment.page(name, properties);
        });

        it('should call page', function() {
          var calls = fetchMock._calls[pageUrl]

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              userId: userId,
              name: name,
              properties: properties,
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

        beforeEach(function() {
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.anonymousTrack(anonymousId, event, properties);
        });

        it('should call track', function() {
          var calls = fetchMock._calls[trackUrl]

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              anonymousId: anonymousId,
              event: event,
              properties: properties,
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

        beforeEach(function() {
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.anonymousPage(anonymousId, name, properties);
        });

        it('should call page', function() {
          var calls = fetchMock._calls[pageUrl]

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              anonymousId: anonymousId,
              name: name,
              properties: properties,
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

      segment = Segment.getClient(key, context, btoa);
    });

    describe('user events', function() {
      var userId;

      beforeEach(function() {
        userId = 'jon.snow';
      });

      describe('#identify', function() {
        var traits;

        beforeEach(function() {
          traits = {
            swordsman: true
          };

          segment.identify(userId, traits);
        });

        it('should call identify', function() {
          var calls = fetchMock._calls[identifyUrl]

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              userId: userId,
              traits: traits,
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

        beforeEach(function() {
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.identify(userId);
          segment.track(event, properties);
        });

        it('should call track', function() {
          var calls = fetchMock._calls[trackUrl]

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              userId: userId,
              event: event,
              properties: properties,
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

        beforeEach(function() {
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.identify(userId);
          segment.page(name, properties);
        });

        it('should call page', function() {
          var calls = fetchMock._calls[pageUrl]

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              userId: userId,
              name: name,
              properties: properties,
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

        beforeEach(function() {
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.anonymousTrack(anonymousId, event, properties);
        });

        it('should call track', function() {
          var calls = fetchMock._calls[trackUrl]

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              anonymousId: anonymousId,
              event: event,
              properties: properties,
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

        beforeEach(function() {
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.anonymousPage(anonymousId, name, properties);
        });

        it('should call page', function() {
          var calls = fetchMock._calls[pageUrl]

          expect(calls.length).toEqual(1);

          matchSegmentCall(calls[0][1], {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + btoa(key + ':'),
              'Content-Type': 'application/json'
            },
            body: {
              anonymousId: anonymousId,
              name: name,
              properties: properties,
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
      segment = Segment.getClient(key, null, btoa);

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
        done();
      });

      // identify called after tracks
      segment.identify(userId);

      // track all data
      var calls = fetchMock._calls[trackUrl]

      expect(calls.length).toEqual(3);

      matchSegmentCall(calls[0][1], {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(key + ':'),
          'Content-Type': 'application/json'
        },
        body: {
          userId: userId,
          event: 'first',
          properties: properties,
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
    segment = Segment.getTestMockClient('', null, btoa);
  });

  describe('#inspect', function() {
    if ('should be object', function() {
      expect(typeof segment.inspect).toEqual('object');
    });

    describe("#allEvents", function() {
      it('should include indentify and track', function(done) {
        segment.identify('test');
        segment.track('hi').then(() => {
          const events = segment.inspect.allEvents().map(i => i.type);
          expect(events).toEqual(['identify', 'track']);
          done();
        });
      });

      it('should include indentify and track in right order', function(done) {
        segment.track('hi');
        segment.identify('test').then(() => {
          const events = segment.inspect.allEvents().map(i => i.type);
          expect(events).toEqual(['track', 'identify']);
          done();
        });
      });
    });
  });
});
