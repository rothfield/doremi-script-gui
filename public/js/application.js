var CompositionModel, Logger, initialData, zzzinitialData;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Logger = _console.constructor;
_console.level = Logger.WARN;
_.mixin(_console.toObject());
initialData = [
  {
    source: "| S - - - |",
    rendered_in_html: "<em>S</em>"
  }, {
    source: "| r - - - |",
    rendered_in_html: "<em>r</em>"
  }
];
zzzinitialData = "Title: test\n\n| S - - - |\n\n| R - - - |\nhi\n";
CompositionModel = function(lines) {
  var fun, self;
  self = this;
  self.raga = ko.observable("");
  self.author = ko.observable("");
  self.source = ko.observable("");
  self.time = ko.observable("");
  self.filename = ko.observable("");
  self.title = ko.observable("untitled");
  self.keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Db", "Eb", "Gb", "Ab", "Bb"];
  self.key = ko.observable("C");
  self.modes = ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"];
  self.mode = ko.observable("Ionian");
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
    return self.lines.push(fun({
      source: "",
      rendered_in_html: ""
    }));
  };
  self.removeLine = function(line) {
    return self.lines.remove(line);
  };
  self.save = function() {
    return self.lastSavedJson(JSON.stringify(ko.toJS(self), null, 2));
  };
  self.lastSavedJson = ko.observable("");
  return self;
};
window.the_composition = new CompositionModel(initialData);
ko.applyBindings(window.the_composition);
window.timed_count = __bind(function() {
  var found, line, result, src, t, _i, _len, _ref;
  found = null;
  src = null;
  _ref = window.the_composition.lines();
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
    try {
      result = DoremiScriptLineParser.parse(src);
      found.rendered_in_html(line_to_html(result));
      dom_fixes();
    } catch (err) {
      result = "failed";
      found.rendered_in_html("parsing failed");
    } finally {
      found.last_value_rendered = src;
    }
  }
  return t = setTimeout("timed_count()", 1000);
}, this);
window.zdo_timer = __bind(function() {
  if (!window.timer_is_on) {
    window.timer_is_on = 1;
    return window.timed_count();
  }
}, this);
window.timed_count();