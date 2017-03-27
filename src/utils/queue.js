function Queue() {
  // initial state
  var state = [];
  var callback;

  var publicMethods = {
    onEnqueue: function(cb) {
      callback = cb
      return publicMethods;
    },

    enqueue: function(item) {
      state.push(item);

      // call subscribers
      if (callback) {
        callback(publicMethods, item)
      }

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
