// Mutable Queue implementation with subscriber
// Please be aware of fact that even though this implementation supports
// multiple subscribers `dequeue` method is actually mutating state
// therefore calling `dequeue` in multiple subscribers causes that race condition in state!

function Queue() {
  // initial state
  var state = [];
  var callbacks = [];

  var publicMethods = {
    subscribe: function(callback) {
      if (typeof callback !== 'function') {
        throw('Subcribe requires function');
      }
      callbacks.push(callback);

      return publicMethods;
    },
    unSubscribe: function(callback) {
      var index = callbacks.indexOf(callback);
      callbacks.splice(index, 1);

      return publicMethods;
    },
    enqueue: function(item) {
      state.push(item);

      // call subscribers
      callbacks.forEach(function(cb) {
        cb(publicMethods);
      });

      return publicMethods;
    },
    dequeue: function() {
      return {
        value: state.shift(),
        next: state.length > 0 ? publicMethods : null
      }
    },
    size: function() {
      return state.length;
    }
  }

  return publicMethods;
}

module.exports = Queue;
