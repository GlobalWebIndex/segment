var Queue = require('../../src/utils/queue');

describe('Queue', function() {
  describe('#enque / #dequeue', function() {
    var queue = Queue();

    it('Should enqueue 1', function() {
      queue.enqueue(1);
      expect(queue.size()).toEqual(1);
    });

    it('Should keep a state', function() {
      queue.enqueue(2);
      expect(queue.size()).toEqual(2);
    });

    it('should deque with resukt', function() {
      var result = queue.dequeue();
      expect(result.value).toEqual(1);
      expect(result.next).toEqual(queue);
      expect(queue.size()).toEqual(1);
    });

    it('should deque to empty', function() {
      var result = queue.dequeue();
      expect(result.value).toEqual(2);
      expect(result.next).toEqual(null);
      expect(queue.size()).toEqual(0);
    });
  });

  describe('#subscribe', function() {
    var queue = Queue();
    var result;

    describe('simple case', function() {
      beforeEach(function(done) {
        queue.subscribe(function(res) {
          result = res;
          done();
        });

        queue.enqueue(0);
      });

      it('should call subscriber', function() {
        var dequeue = result.dequeue();
        expect(dequeue.value).toEqual(0);
        expect(dequeue.next).toEqual(null);
      });
    });

    describe('subscribe to enqued queue', function() {
      beforeEach(function(done) {
        queue.enqueue(0);

        queue.subscribe(function(res) {
          result = res;
          done();
        });

        queue.enqueue(1);
      });

      it('should call subscriber', function() {
        var dequeue = result.dequeue();
        expect(dequeue.value).toEqual(0);
        expect(dequeue.next).toEqual(queue);
        expect(queue.size()).toEqual(1);

        var dequeue2 = dequeue.next.dequeue();
        expect(dequeue2.value).toEqual(1)
        expect(dequeue2.next).toEqual(null);
        expect(queue.size()).toEqual(0);
      });
    });
  });

  describe('#unSubscribe', function() {
    var queue = Queue();

    it('should not call calback after unsubscription', function(done) {
      var result;

      function callback(res) {
        result = res;
      }

      queue.subscribe(callback);
      queue.unSubscribe(callback);
      queue.enqueue(1);

      setTimeout(function() {
        expect(result).toEqual(undefined);
        done();
      }, 10);
    });
  });
});
