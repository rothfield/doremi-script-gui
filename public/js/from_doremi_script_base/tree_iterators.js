// Generated by CoffeeScript 1.3.3
(function() {
  var root, tree_each, tree_filter, tree_find, _;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  if (typeof require !== 'undefined') {
    global.all_items = require('./all_items.js').all_items;
    _ = require("underscore")._;
  }

  tree_filter = function(tree, my_function) {
    return _.select(all_items(tree), my_function);
  };

  tree_find = function(tree, my_function) {
    return _.find(all_items(tree), my_function);
  };

  tree_each = function(tree, fun) {};

  root.tree_each = tree_each;

  root.tree_filter = tree_filter;

  root.tree_select = tree_filter;

  root.tree_find = tree_find;

  root.tree_detect = tree_find;

}).call(this);
