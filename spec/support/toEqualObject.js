module.exports = {
  toEqualObject: function(util, customEqualityTesters) {
    function propertyWithPrefix(prefix, property) {
      if(prefix) {
        return prefix + "." + property;
      }
      else {
        return "." + property;
      }
    }

    function getObjectDiff(actual, expected, prefix) {
      var diffs = {}

      for (var property in actual) {
        if (actual.hasOwnProperty(property)) {
          if(actual[property] != expected[property]) {
            var prefixedProperty = propertyWithPrefix(prefix, property);

            if(typeof actual[property] == 'object') {
              if(typeof expected[property] == 'object') {
                Object.assign(
                  diffs,
                  getObjectDiff(
                    actual[property],
                    expected[property],
                    prefixedProperty
                  )
                );
              }
              else {
                diffs[prefixedProperty] = {
                  expected: expected[property] || null,
                  actual: JSON.stringify(actual[property])
                }
              }
            }
            else {
              diffs[prefixedProperty] = {
                expected: expected[property] || null,
                actual: actual[property]
              }
            }
          }
        }
      }

      for (var property in expected) {
        if (expected.hasOwnProperty(property)) {
          if(actual[property] != expected[property]) {
            var prefixedProperty = propertyWithPrefix(prefix, property);

            if(diffs[prefixedProperty]) {
              continue;
            }

            if(typeof expected[property] == 'object') {
              if(typeof actual[property] == 'object') {
                Object.assign(
                  diffs,
                  getObjectDiff(
                    actual[property],
                    expected[property],
                    prefixedProperty
                  )
                );
              }
              else {
                diffs[prefixedProperty] = {
                  expected: JSON.stringify(expected[property]),
                  actual: actual[property] || null
                }
              }
            }
            else {
              diffs[prefixedProperty] = {
                expected: expected[property],
                actual: actual[property] || null
              }
            }
          }
        }
      }

      return diffs;
    }

    return {
      compare: function(actual, expected) {
        const result = {};

        result.pass = util.equals(actual, expected);

        if(result.pass) {
          result.message = 'Expected objects to not be equal';
        }
        else {
          var diff = getObjectDiff(actual, expected);
          var message = "Expected objects to be equal. The following properties differ: \n"

          for (var property in diff) {
            if (diff.hasOwnProperty(property)) {
              message += "  " + property + "\n    should be: \"" + diff[property].expected + "\"\n    is         \"" + diff[property].actual + "\"\n"
            }
          }

          result.message = message;
        }

        return result;
      }
    };
  }
}
