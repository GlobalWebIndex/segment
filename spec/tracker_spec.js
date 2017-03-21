var Tracker = require('../src/tracker');
var sinon = require('sinon')

describe('Tracker', function(){
  var userId, tracker, client, sandbox;

  beforeEach(function(){
    sandbox = sinon.sandbox.create();

    client = {
      identify: sandbox.stub(),
      track: sandbox.stub(),
      page: sandbox.stub()
    }

    userId = 'jon.snow@winterfell.got';

    tracker = Tracker.init(client, userId);
  });

  describe('#identify', function(){
    var traits;

    beforeEach(function(){
      traits = { foo: 'foo', bar: 'bar' };
      tracker.identify(traits);
    });

    it('should call client.identify', function(){
      sinon.assert.calledWith(client.identify, sinon.match(userId, traits));
    });
  });

  describe('#track', function(){
    var event, properties;

    beforeEach(function(){
      event = "Left Winterfell";
      properties = { foo: 'foo', bar: 'bar' };

      tracker.track(event, properties);
    });

    it('should call client.track', function(){
      sinon.assert.calledWith(client.track, sinon.match(userId, event, properties));
    });
  });

  describe('#page', function(){
    var name, properties;

    beforeEach(function(){
      name = "Something";
      properties = { foo: 'foo', bar: 'bar' };

      tracker.page(name, properties);
    });

    it('should call client.page', function(){
      sinon.assert.calledWith(client.page, sinon.match(userId, name, properties));
    });
  });
});
