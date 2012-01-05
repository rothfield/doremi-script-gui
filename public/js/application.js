var root;
var __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
root = typeof exports !== "undefined" && exports !== null ? exports : this;
$(document).ready(function() {
  var Logger, composition, compositions, ctr, initialData, key, old_initialData;
  composition = function(name, doremi_script) {
    this.compositionName = name;
    this.composition_doremi_script = doremi_script;
    return this;
  };
  compositions = [];
  ctr = 0;
  while (ctr < localStorage.length) {
    key = localStorage.key(ctr);
    if (key.indexOf("composition_") === 0) {
      compositions.push(new composition(key, localStorage[key]));
    }
    ctr++;
  }
  console.log("compositions", compositions);
  Logger = _console.constructor;
  _console.level = Logger.WARN;
  _.mixin(_console.toObject());
  old_initialData = [
    {
      source: "| S - - - |",
      rendered_in_html: "<em>S</em>"
    }, {
      source: "| r - - - |",
      rendered_in_html: "<em>r</em>"
    }
  ];
  initialData = "Title: test\n\n  .\n| S - - - |\n\n| R - - - |\n  hi\n";
  window.CompositionModel = function(doremi_script_source) {
    var fun, parsed_obj, self;
    parsed_obj = DoremiScriptParser.parse(doremi_script_source);
    if (!(parsed_obj.id != null)) {
      parsed_obj.id = new Date().getTime();
    }
    self = this;
    self.availableCountries = ko.observableArray(compositions);
    self.selectedCountry = ko.observable();
    self.composition_info_visible = ko.observable(true);
    self.toggle_composition_info_visibility = function() {
      console.log("in toggle");
      return self.composition_info_visible(!self.composition_info_visible());
    };
    self.id = ko.observable(parsed_obj.id);
    self.raga = ko.observable("");
    self.author = ko.observable("");
    self.source = ko.observable("");
    self.filename = ko.observable(parsed_obj.filename);
    self.time_signature = ko.observable(parsed_obj.time_signature);
    self.notes_used = ko.observable(parsed_obj.notes_used);
    self.title = ko.observable(parsed_obj.title);
    self.keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Db", "Eb", "Gb", "Ab", "Bb"];
    self.key = ko.observable(parsed_obj.key);
    self.modes = ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"];
    self.mode = ko.observable(parsed_obj.mode);
    fun = function(line) {
      return {
        parse_failed: ko.observable(false),
        parse_tree_visible: ko.observable(false),
        parse_tree_text: ko.observable("parse tree text here"),
        radio_group_name: ko.observable("group_" + line.index),
        source_radio_id: "source_radio_" + line.index,
        html_radio_id: "html_radio_" + line.index,
        edit_mode: ko.observable("source"),
        in_source_edit_mode: function() {
          return this.edit_mode() === "source";
        },
        in_html_edit_mode: function() {
          return this.edit_mode() === "html";
        },
        last_value_rendered: "",
        index: ko.observable(line.index),
        source: line.source,
        rendered_in_html: ko.observable(line.rendered_in_html),
        show_parse_tree_click: function() {
          console.log("you clicked show parse tree");
          this.parse_tree_visible(!this.parse_tree_visible());
          return false;
        },
        handle_key_press: function(current_line, event) {
          var let_default_action_proceed;
          let_default_action_proceed = true;
          return let_default_action_proceed;
        },
        parse: function() {
          var result;
          console.log("in parse, this is", this);
          try {
            result = DoremiScriptLineParser.parse(this.source);
            this.rendered_in_html(line_to_html(result));
            this.parse_tree_text("Parsing completed with no errors \n" + JSON.stringify(result, null, "  "));
            return dom_fixes();
          } catch (err) {
            result = "failed";
            this.parse_failed(true);
            this.parse_tree_text("Parsing failed");
            return this.rendered_in_html("parsing failed");
          } finally {
            this.last_value_rendered = this.source;
          }
        }
      };
    };
    self.lines = ko.observableArray(ko.utils.arrayMap(parsed_obj.lines, fun));
    self.addLine = function() {
      return self.lines.push(fun({
        source: "",
        rendered_in_html: ""
      }));
    };
    self.removeLine = function(line) {
      var res;
      res = confirm("Are you sure?");
      if (!res) {
        return;
      }
      return self.lines.remove(line);
    };
    self.save_locally = function() {
      var all, att, atts, ignore, json_object, json_str, line, str, value;
      ignore = ["keys", "modes", "lines", "lastSavedJson", "composition_info_visible"];
      json_str = JSON.stringify(ko.toJS(self), null, 2);
      json_object = $.parseJSON(json_str);
      console.log("json_obj", json_object);
      atts = (function() {
        var _results;
        _results = [];
        for (att in json_object) {
          value = json_object[att];
          if (__indexOf.call(ignore, att) >= 0) {
            continue;
          }
          _results.push("" + att + ": " + value);
        }
        return _results;
      })();
      all = atts.concat((function() {
        var _i, _len, _ref, _results;
        _ref = self.lines();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          line = _ref[_i];
          _results.push(line.source);
        }
        return _results;
      })());
      console.log("all", all);
      str = all.join("\n\n");
      console.log('str', str);
      return localStorage.setItem("composition_" + (self.id()), str);
    };
    self.save = function() {
      self.lastSavedJson(JSON.stringify(ko.toJS(self), null, 2));
      return self.lastSavedJson(JSON.stringify(ko.toJS(self), null, 2));
    };
    self.lastSavedJson = ko.observable("");
    return self;
  };
  window.the_composition = new CompositionModel(initialData);
  ko.applyBindings(window.the_composition);
  window.timed_count = __bind(function() {
    var line, src, t, which_line, _i, _len, _ref;
    which_line = null;
    src = null;
    _ref = window.the_composition.lines();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      if (line.last_value_rendered !== line.source) {
        which_line = line;
      }
      if (which_line) {
        break;
      }
    }
    if (which_line != null) {
      which_line.parse();
    }
    return t = setTimeout("timed_count()", 1000);
  }, this);
  window.zdo_timer = __bind(function() {
    if (!window.timer_is_on) {
      window.timer_is_on = 1;
      return window.timed_count();
    }
  }, this);
  return window.timed_count();
});