var Tracker = require('../src/tracker');
var sinon = require('sinon');
var Promise = require('es6-promise').Promise;

describe('Tracker', function(){
  var userId, tracker, client, sandbox;

  beforeEach(function(){
    sandbox = sinon.sandbox.create();

    var p = new Promise(function(resolve){
      resolve();
    });

    client = {
      identify: sandbox.stub().returns(p),
      track: sandbox.stub(),
      page: sandbox.stub()
    }

    userId = 'jon.snow@winterfell.got';

    tracker = Tracker.init(client, userId);
  });

  describe('#identify', function(){
    var traits;

    beforeEach(function(done){
      traits = { foo: 'foo', bar: 'bar' };

      tracker.identify(traits).then(function(){
        done();
      });
    });

    it('calls client.identify', function(){
      sinon.assert.calledWith(client.identify, sinon.match(userId, traits));
    });

    it('sets the isIdentified flag', function(){
      expect(tracker.getIsIdentified()).toEqual(true);
    });
  });

  describe('#identifyOnce', function(){
    var traits;

    beforeEach(function(done){
      traits = { foo: 'foo', bar: 'bar' };

      tracker.identifyOnce(traits)
        .then(function(){
          tracker.identifyOnce(traits);
        })
        .then(function(){
          done();
        });
    });

    it('calls client.identify only once', function(){
      sinon.assert.calledOnce(client.identify);
      sinon.assert.calledWith(client.identify, sinon.match(userId, traits));
    });

    it('sets the isIdentified flag', function(){
      expect(tracker.getIsIdentified()).toEqual(true);
    });
  });

  describe('#track', function(){
    var event, properties;

    beforeEach(function(){
      event = "Left Winterfell";
      properties = { foo: 'foo', bar: 'bar' };

      tracker.track(event, properties);
    });

    it('calls client.track', function(){
      sinon.assert.calledWith(client.track, sinon.match(userId, event, properties));
    });
  });

  describe('#identifiedTrack', function(){
    var event, properties, traits;

    beforeEach(function(done){
      event = "Left Winterfell";
      properties = { foo: 'foo', bar: 'bar' };
      traits = { god: 'true' };

      tracker.identifiedTrack(event, properties, traits)
        .then(function(){
          tracker.identifiedTrack(event, properties, traits);
        })
        .then(function(){
          done();
        });
    });

    it('calls client.identify once', function(){
      sinon.assert.calledOnce(client.identify);
      sinon.assert.calledWith(client.identify, sinon.match(userId, traits));
    });

    it('calls client.track twice', function(){
      sinon.assert.calledTwice(client.track);
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

    it('calls client.page', function(){
      sinon.assert.calledWith(client.page, sinon.match(userId, name, properties));
    });
  });

  describe('#identifiedPage', function(){
    var name, properties, traits;

    beforeEach(function(done){
      name = "Something";
      properties = { foo: 'foo', bar: 'bar' };
      traits = { god: 'true' };

      tracker.identifiedPage(name, properties, traits)
        .then(function(){
          tracker.identifiedPage(name, properties, traits);
        })
        .then(function(){
          done();
        });
    });

    it('calls client.identify once', function(){
      sinon.assert.calledOnce(client.identify);
      sinon.assert.calledWith(client.identify, sinon.match(userId, traits));
    });

    it('calls client.page twice', function(){
      sinon.assert.calledTwice(client.page);
      sinon.assert.calledWith(client.page, sinon.match(userId, name, properties));
    });
  });
});
