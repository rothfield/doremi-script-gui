var root;
var __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
root = typeof exports !== "undefined" && exports !== null ? exports : this;
$(document).ready(function() {
  var LineViewModel, Logger, composition, compositions, ctr, id, initialData, key, my_stave_width;
  my_stave_width = $('div.composition_body').width() - 50;
  id = 1000;
  LineViewModel = function(line) {
    if (line == null) {
      line = {
        source: "",
        rendered_in_html: "(Empty Line)"
      };
    }
    return {
      id: "" + (id++),
      parse_failed: ko.observable(false),
      parse_warnings: ko.observable(false),
      parse_tree_visible: ko.observable(false),
      parse_tree_text: ko.observable("parse tree text here"),
      warnings: ko.observable(""),
      checkbox_name: ko.observable("checkbox_" + line.index),
      radio_group_name: ko.observable("group_" + line.index),
      editing: ko.observable(false),
      last_value_rendered: "",
      stave_width: ko.observable("" + my_stave_width + "px"),
      stave_height: ko.observable("161px"),
      index: ko.observable(line.index),
      source: line.source,
      rendered_in_html: ko.observable(line.rendered_in_html),
      line_wrapper_click: function(my_model, event) {
        var current_target, text_area;
        console.log("line_wrapper_click", event);
        if (!this.editing()) {
          this.editing(true);
          current_target = event.currentTarget;
          text_area = $(current_target).parent().find("textarea");
          $(text_area).focus();
        }
        return true;
      },
      close_edit: function(my_model, event) {
        console.log("close_edit");
        this.editing(false);
        dom_fixes();
        return true;
      },
      toggle_parse_tree_visible: function(event) {
        this.parse_tree_visible(!this.parse_tree_visible());
        return true;
      },
      handle_blur: function(event) {},
      edit: function(my_model, event) {
        var current_target, height, text_area;
        this.editing(true);
        current_target = event.currentTarget;
        text_area = $(current_target).parent().find("textarea");
        $(text_area).focus();
        return true;
        console.log(arguments);
        console.log("edit");
        console.log("this is", this);
        height = $(current_target).height();
        text_area = $(current_target).find("textarea");
        console.log("text_area", text_area);
        return $(text_area).height(height);
      },
      line_wrapper_id: function() {
        return "line_wrapper_" + this.id;
      },
      show_parse_tree_click: function() {
        console.log("you clicked show parse tree");
        return false;
      },
      handle_key_press: function(current_line, event) {
        var let_default_action_proceed;
        let_default_action_proceed = true;
        return let_default_action_proceed;
      },
      parse: function() {
        var result;
        if (this.source === "" || this.source === null) {
          this.rendered_in_html("(empty line)<br/><br/><br/><br/>");
          this.parse_tree_text("");
          return;
        }
        try {
          result = DoremiScriptLineParser.parse(this.source);
          this.rendered_in_html(line_to_html(result));
          this.parse_tree_text("Parsing completed with no errors \n" + JSON.stringify(result, null, "  "));
          this.parse_failed(false);
          return dom_fixes();
        } catch (err) {
          result = "failed";
          this.parse_failed(true);
          this.parse_tree_text("Parsing failed");
          return this.rendered_in_html("<pre>Didn't parse\n\n" + this.source + "</pre>");
        } finally {
          this.last_value_rendered = this.source;
        }
      }
    };
  };
  composition = function(key, doremi_script) {
    var ary;
    console.log("composition-local storage", doremi_script);
    this.key = key;
    ary = /Title: ([^\n]+)\n/.exec(doremi_script);
    this.title = ary[1];
    return this;
  };
  compositions = [];
  ctr = 0;
  if (localStorage.length > 0) {
    while (ctr < localStorage.length) {
      key = localStorage.key(ctr);
      if (key.indexOf("composition_") === 0) {
        compositions.push(new composition(key, localStorage[key]));
      }
      ctr++;
    }
  }
  console.log("compositions", compositions);
  Logger = _console.constructor;
  _console.level = Logger.WARN;
  _.mixin(_console.toObject());
  initialData = "Title: sample_composition\nid: 1326030518658\n\n  .\n| S - - - |\n\n| R - - - |\n  hi\n";
  window.CompositionViewModel = function(my_doremi_script_source) {
    var my_compositions, self;
    self = this;
    my_compositions = compositions;
    self.selected_composition = ko.observable();
    self.doremi_script_source = ko.observable(my_doremi_script_source);
    self.composition_info_visible = ko.observable(false);
    self.doremi_script_source_visible = ko.observable(false);
    self.toggle_doremi_script_source_visible = function() {
      self.doremi_script_source_visible(!self.doremi_script_source_visible());
      if (self.doremi_script_source_visible()) {
        return self.doremi_script_source(self.get_doremi_script_source());
      }
    };
    self.toggle_composition_info_visible = function() {
      return self.composition_info_visible(!self.composition_info_visible());
    };
    self.id = ko.observable("");
    self.raga = ko.observable("");
    self.author = ko.observable("");
    self.source = ko.observable("");
    self.filename = ko.observable("");
    self.time_signature = ko.observable("");
    self.notes_used = ko.observable("");
    self.title = ko.observable("");
    self.lilypond = ko.observable("");
    self.keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Db", "Eb", "Gb", "Ab", "Bb"];
    self.key = ko.observable("");
    self.modes = ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"];
    self.mode = ko.observable("");
    self.lines = ko.observableArray([]);
    self.to_lilypond = function() {
      var parsed_obj, str;
      console.log("entering self.to_lilypond");
      str = self.get_doremi_script_source();
      parsed_obj = DoremiScriptParser.parse(str);
      this.lilypond(to_lilypond(parsed_obj));
      return console.log("this.lilypond()", this.lilypond());
    };
    self.my_init = function(doremi_script_source_param) {
      var key, keys, parsed_obj, _i, _len;
      console.log("Entering CompositionViewModel.init, source is", doremi_script_source_param);
      self.available_compositions = ko.observableArray(my_compositions);
      parsed_obj = DoremiScriptParser.parse(doremi_script_source_param);
      if (!(parsed_obj.id != null)) {
        parsed_obj.id = new Date().getTime();
      }
      keys = ["id", "filename", "raga", "author", "source", "time_signature", "notes_used", "title", "key", "mode"];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        self[key](parsed_obj[key]);
      }
      return self.lines(ko.utils.arrayMap(parsed_obj.lines, LineViewModel));
    };
    self.add_line = function() {
      var x;
      self.lines.push(x = new LineViewModel());
      x.parse();
      return ko.applyBindings(x);
    };
    self.remove_line = function(line) {
      var res;
      res = confirm("Are you sure?");
      if (!res) {
        return;
      }
      return self.lines.remove(line);
    };
    self.composition_select = function(my_model, event) {
      if (!this.selected_composition()) {
        return;
      }
      key = this.selected_composition().key;
      self.composition_info_visible(true);
      return self.load_locally(key);
    };
    self.new_composition = function() {
      initialData = "Title: Untitled\nid: " + (new Date().getTime()) + "\n\n|S";
      window.the_composition.my_init(initialData);
      return self.add_line();
    };
    self.load_locally = function(key) {
      var source;
      if (key === ("composition_" + (window.the_composition.id()))) {
        alert("This is the file you are currently editing");
        return;
      }
      source = localStorage[key];
      return window.the_composition.my_init(source);
    };
    self.get_doremi_script_source = function() {
      var att, atts, atts_str, ignore, json_object, json_str, line, lines, lines_str, value;
      ignore = ["lilypond", "doremi_script_source", "doremi_script_source_visible", "available_compositions", "selected_composition", "keys", "modes", "lines", "composition_info_visible"];
      json_str = JSON.stringify(ko.toJS(self), null, 2);
      json_object = $.parseJSON(json_str);
      atts = (function() {
        var _results;
        _results = [];
        for (att in json_object) {
          value = json_object[att];
          if (att === "filename") {
            att = "Filename";
          }
          if (att === "title") {
            att = "Title";
          }
          if (att === "raga") {
            att = "Raga";
          }
          if (att === "key") {
            att = "Key";
          }
          if (att === "mode") {
            att = "Mode";
          }
          if (att === "author") {
            att = "Author";
          }
          if (att === "source") {
            att = "Source";
          }
          if (att === "time_signature") {
            att = "TimeSignature";
          }
          if (__indexOf.call(ignore, att) >= 0) {
            continue;
          }
          if (value === "") {
            continue;
          }
          if (!value) {
            continue;
          }
          _results.push("" + att + ": " + value);
        }
        return _results;
      })();
      atts_str = atts.join("\n");
      lines = (function() {
        var _i, _len, _ref, _results;
        _ref = self.lines();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          line = _ref[_i];
          _results.push(line.source);
        }
        return _results;
      })();
      lines_str = lines.join("\n\n");
      return atts_str + "\n\n" + lines_str;
    };
    self.save_locally = function() {
      console.log("save_locally");
      self.doremi_script_source(self.get_doremi_script_source());
      console.log('self.doremi_script_source()', self.doremi_script_source());
      return localStorage.setItem("composition_" + (self.id()), self.doremi_script_source());
    };
    if (my_doremi_script_source != null) {
      self.my_init(my_doremi_script_source);
    }
    return self;
  };
  window.the_composition = new CompositionViewModel();
  window.the_composition.my_init(initialData);
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