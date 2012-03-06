(function() {
  exports.test_something = function(test) {
    test.equal(2, 2);
    test.equal(3, 2);
    return test.done();
  };
}).call(this);
