var AnonymousTracker = require('../src/anonymous_tracker');
var sinon = require('sinon')

describe('AnonymousTracker', function(){
  var userId, tracker, client, sandbox;

  beforeEach(function(){
    sandbox = sinon.sandbox.create();

    client = {
      anonymousTrack: sandbox.stub(),
      anonymousPage: sandbox.stub()
    }

    anonymousId = '1234-abcd';

    tracker = AnonymousTracker.init(client, anonymousId);
  });

  describe('#anonymousTrack', function(){
    var event, properties;

    beforeEach(function(){
      event = "Left Winterfell";
      properties = { foo: 'foo', bar: 'bar' };

      tracker.anonymousTrack(event, properties);
    });

    it('should call client.track', function(){
      sinon.assert.calledWith(client.anonymousTrack, sinon.match(anonymousId, event, properties));
    });
  });

  describe('#anonymousPage', function(){
    var name, properties;

    beforeEach(function(){
      name = "Something";
      properties = { foo: 'foo', bar: 'bar' };

      tracker.anonymousPage(name, properties);
    });

    it('should call client.page', function(){
      sinon.assert.calledWith(client.anonymousPage, sinon.match(anonymousId, name, properties));
    });
  });
});

