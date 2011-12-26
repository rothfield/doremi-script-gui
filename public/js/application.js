var LinesModel, initialData;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
initialData = [
  {
    source: "| S - - - |",
    rendered_in_html: "<em>S</em>"
  }, {
    source: "| r - - - |",
    rendered_in_html: "<em>r</em>"
  }
];
LinesModel = function(lines) {
  var fun, self;
  self = this;
  fun = function(line) {
    return {
      last_value_rendered: "",
      source: line.source,
      rendered_in_html: ko.observable(line.rendered_in_html),
      handle_key_press: function(current_line, event) {
        var let_default_action_proceed;
        let_default_action_proceed = true;
        return let_default_action_proceed;
      }
    };
  };
  self.lines = ko.observableArray(ko.utils.arrayMap(lines, fun));
  self.addLine = function() {
    return self.lines.push({
      source: "",
      rendered_in_html: ""
    });
  };
  self.removeLine = function(line) {
    return self.lines.remove(line);
  };
  self.save = function() {
    return self.lastSavedJson(JSON.stringify(ko.toJS(self.lines), null, 2));
  };
  self.lastSavedJson = ko.observable("");
  return self;
};
window.the_lines = new LinesModel(initialData);
ko.applyBindings(window.the_lines);
window.timed_count = __bind(function() {
  var cur_val, found, line, src, t, _i, _len, _ref;
  found = null;
  src = null;
  _ref = window.the_lines.lines();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    line = _ref[_i];
    if (line.last_value_rendered !== (src = line.source)) {
      found = line;
    }
    if (found) {
      break;
    }
  }
  if (found != null) {
    found.rendered_in_html("<em>" + src + "</em>");
    found.last_value_rendered = src;
  }
  t = setTimeout("timed_count()", 1000);
  return;
  cur_val = $('#entry_area').val();
  if (window.last_val !== cur_val) {
    $('#run_parser').trigger('click');
    return window.last_val = cur_val;
  }
}, this);
window.zdo_timer = __bind(function() {
  if (!window.timer_is_on) {
    window.timer_is_on = 1;
    return window.timed_count();
  }
}, this);
window.timed_count();