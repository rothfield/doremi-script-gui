(function() {
  var debug, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  debug = false;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  root.all_items = function(tree, items) {
    var an_item, _fn, _i, _len, _ref;
    if (items == null) {
      items = [];
    }
    if (!tree.items) {
      return [tree];
    }
    _ref = tree.items;
    _fn = __bind(function(an_item) {
      items.push(an_item);
      return items.concat(root.all_items(an_item, items));
    }, this);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      an_item = _ref[_i];
      _fn(an_item);
    }
    return [tree].concat(items);
  };
}).call(this);
