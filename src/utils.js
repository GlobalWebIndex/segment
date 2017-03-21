var publicMethods = {
  getArgs: function(userId, _arguments) {
    var args = Array.prototype.slice.call(_arguments);
    args.unshift(userId);
    return args;
  }
};

module.exports = publicMethods;

