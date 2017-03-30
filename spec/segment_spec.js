var Segment = require('../src/segment');
var fetchMock = require('fetch-mock');
var btoa = require('btoa');
var toEqualObject = require('./support/toEqualObject.js');

function matchSegmentCall(actualData, expectedData) {
  expect(Object.keys(actualData)).toEqual(['method', 'headers', 'body']);

  var
    method = actualData.method,
    headers = actualData.headers,
    body = JSON.parse(actualData.body);

  expect(method).toEqual(expectedData.method);
  expect(headers).toEqualObject(expectedData.headers);
  expect(body).toEqualObject(expectedData.body);
}

beforeEach(function(){
  jasmine.addMatchers(toEqualObject);
})

describe('Segment', function(){
  var segment, key;
  var identifyUrl, trackUrl, pageUrl;

  beforeEach(function(){
    key = '123';

    identifyUrl = 'https://api.segment.io/v1/identify';
    trackUrl = 'https://api.segment.io/v1/track';
    pageUrl = 'https://api.segment.io/v1/page';

    fetchMock
      .mock(identifyUrl, 200)
      .mock(trackUrl, 200)
      .mock(pageUrl, 200)
  });

  afterEach(function(){
    fetchMock.reset();
  });

  describe('without custom context', function(){
    beforeEach(function(){
      segment = Segment.getClient(key, null, btoa);
    });

    describe('user events', function(){
      var userId;

      beforeEach(function(){
        userId = 'jon.snow';
      });

      describe('#identify', function(){
        var traits;

        beforeEach(function(){
          traits = {
            swordsman: true
          };

          segment.identify(userId, traits);
        });

        it('should call identify', function(){
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

      describe('#track', function(){
        var event, properties;

        beforeEach(function(){
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.track(userId, event, properties);
        });

        it('should call track', function(){
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

      describe('#page', function(){
        var name, properties;

        beforeEach(function(){
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.page(userId, name, properties);
        });

        it('should call page', function(){
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

    describe('anonymous events', function(){
      var anonymousId;

      beforeEach(function(){
        anonymousId = 'abcdxyz';
      });

      describe('#anonymousTrack', function(){
        var event, properties;

        beforeEach(function(){
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.anonymousTrack(anonymousId, event, properties);
        });

        it('should call track', function(){
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

      describe('#anonymousPage', function(){
        var name, properties;

        beforeEach(function(){
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.anonymousPage(anonymousId, name, properties);
        });

        it('should call page', function(){
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

  describe('with custom context', function(){
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

    describe('user events', function(){
      var userId;

      beforeEach(function(){
        userId = 'jon.snow';
      });

      describe('#identify', function(){
        var traits;

        beforeEach(function(){
          traits = {
            swordsman: true
          };

          segment.identify(userId, traits);
        });

        it('should call identify', function(){
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

      describe('#track', function(){
        var event, properties;

        beforeEach(function(){
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.track(userId, event, properties);
        });

        it('should call track', function(){
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

      describe('#page', function(){
        var name, properties;

        beforeEach(function(){
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.page(userId, name, properties);
        });

        it('should call page', function(){
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

    describe('anonymous events', function(){
      var anonymousId;

      beforeEach(function(){
        anonymousId = 'abcdxyz';
      });

      describe('#anonymousTrack', function(){
        var event, properties;

        beforeEach(function(){
          event = 'Something happened';

          properties = {
            location: 'here'
          };

          segment.anonymousTrack(anonymousId, event, properties);
        });

        it('should call track', function(){
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

      describe('#anonymousPage', function(){
        var name, properties;

        beforeEach(function(){
          name = 'Index page';
          properties = {
            search: 'for something'
          }

          segment.anonymousPage(anonymousId, name, properties);
        });

        it('should call page', function(){
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
});
