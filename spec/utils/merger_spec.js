var Merger = require('../../src/utils/merger');

describe('Merger', function() {
  var merger;

  describe('Basic functionality', function() {
    var result;

    beforeEach(function(done) {
      merger = Merger(function(merged) {
        result = merged;
        done();
      });

      merger.add(1);
      merger.add(2);
      merger.add(3);
    });

    it('should contain all 3 entries', function() {
      expect(result).toEqual([1,2,3]);
    });
  });

  describe('Promisses API', function() {
    var result = [];

    beforeEach(function(done) {
      merger = Merger(function(merged) {
        setTimeout(done, 0);
        return merged;
      });

      merger.add(1).then(function(r) {
        result.push(r);
      });
      merger.add(2).then(function(r) {
        result.push(r);
      });
      merger.add(3).then(function(r) {
        result.push(r);
      });
    });


    it('should return promises and resolve them', function() {
      expect(result).toEqual([[1,2,3], [1,2,3], [1,2,3]]);
    });
  });

  describe('State issolation', function() {
    var result1, result2, callbacks = [];

    beforeEach(function(done) {
      merger = Merger(function(merged) {
        if (!result1) {
          result1 = merged;
        } else {
          result2 = merged;
        }
      });

      merger.add(1).then(() => callbacks.push(1));
      merger.add(2).then(() => {
        merger.add(3).then(() => callbacks.push(3));
        merger.add(4).then(() => {
          callbacks.push(4);
          done();
        });
        callbacks.push(2);
      });
    });

    it('should isolate state of first and secont sequence', function() {
      expect(result1).toEqual([1,2]);
      expect(result2).toEqual([3,4]);
      expect(callbacks).toEqual([1,2,3,4]);
    });
  });
});
