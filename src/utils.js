var publicMethods = {
  transformArguments: function(_arguments) {
    return Array.prototype.slice.call(_arguments);
  },
  getArgs: function(userId, _arguments) {
    var args = publicMethods.transformArguments(_arguments);
    args.unshift(userId);

    return args;
  },
};

module.exports = publicMethods;

