var root;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
};
root = typeof exports !== "undefined" && exports !== null ? exports : this;
$(document).ready(function() {
  var LineViewModel, Logger, NONE_URL, compositions_in_local_storage, handleFileSelect, id, initialData;
  NONE_URL = "/images/none.png";
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
      zappend_line: function(my_model, event) {
        console.log("append_line");
        return true;
      },
      insert_line: function(my_model, event) {
        console.log("insert_line");
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
  compositions_in_local_storage = function() {
    var Item, ctr, items, key;
    Item = function(key, doremi_script) {
      var ary;
      this.key = key;
      ary = /Title: ([^\n]+)\n/.exec(doremi_script);
      this.title = !(ary != null) ? "untitled" : ary[1];
      return this;
    };
    items = [];
    ctr = 0;
    if (localStorage.length > 0) {
      while (ctr < localStorage.length) {
        key = localStorage.key(ctr);
        if (key.indexOf("composition_") === 0) {
          items.push(new Item(key, localStorage[key]));
        }
        ctr++;
      }
    }
    return items;
  };
  Logger = _console.constructor;
  _console.level = Logger.WARN;
  _.mixin(_console.toObject());
  initialData = "Title: sample_composition\n\n   .\n|: S - - -  :|\n\n|| R - - - ||\n   hi\n";
  handleFileSelect = __bind(function(evt) {
    var file, reader;
    file = document.getElementById('file').files[0];
    reader = new FileReader();
    reader.onload = function(evt) {
      window.the_composition.my_init(evt.target.result);
      return window.the_composition.open_file_visible(false);
    };
    return reader.readAsText(file, "");
  }, this);
  document.getElementById('file').addEventListener('change', handleFileSelect, false);
  window.CompositionViewModel = function(my_doremi_script_source) {
    var self;
    self = this;
    self.selected_composition = ko.observable();
    self.composition_parse_tree_text = ko.observable("");
    self.doremi_script_source = ko.observable(my_doremi_script_source);
    self.open_file_visible = ko.observable(false);
    self.composition_info_visible = ko.observable(false);
    self.composition_parse_failed = ko.observable(false);
    self.calculate_stave_width = function() {
      return "" + ($('div.composition_body').width() - 50) + "px";
    };
    self.composition_stave_width = ko.observable(self.calculate_stave_width());
    self.composition_lilypond_source_visible = ko.observable(false);
    self.composition_musicxml_source_visible = ko.observable(false);
    self.parsed_doremi_script_visible = ko.observable(false);
    self.composition_lilypond_output_visible = ko.observable(false);
    self.composition_lilypond_output = ko.observable(false);
    self.doremi_script_source_visible = ko.observable(false);
    self.composition_handle_resize = function(my_model) {
      return console.log("handle_resize");
    };
    self.toggle_open_file_visible = function() {
      return self.open_file_visible(!self.open_file_visible());
    };
    self.toggle_parsed_doremi_script_visible = function() {
      return self.parsed_doremi_script_visible(!self.parsed_doremi_script_visible());
    };
    self.toggle_staff_notation_visible = function() {
      return self.staff_notation_visible(!self.staff_notation_visible());
    };
    self.toggle_composition_musicxml_source_visible = function() {
      return self.composition_musicxml_source_visible(!self.composition_musicxml_source_visible());
    };
    self.toggle_composition_lilypond_source_visible = function() {
      return self.composition_lilypond_source_visible(!self.composition_lilypond_source_visible());
    };
    self.parse_composition = function() {
      var parsed, result;
      self.refresh_doremi_script_source();
      console.log("parse_composition");
      try {
        parsed = DoremiScriptParser.parse(self.doremi_script_source());
        self.composition_parsed_doremi_script(parsed);
        self.composition_parse_tree_text("Parsing completed with no errors \n" + JSON.stringify(result, null, "  "));
        return self.composition_parse_failed(false);
      } catch (err) {
        result = "failed";
        console.log("parse_composition, ERROR=", err);
        self.composition_parsed_doremi_script(null);
        self.composition_parse_failed(true);
        return self.composition_parse_tree_text("Parsing failed");
      } finally {

      }
    };
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
    self.staff_notation_visible = ko.observable(false);
    self.source = ko.observable("");
    self.filename = ko.observable("");
    self.time_signature = ko.observable("");
    self.notes_used = ko.observable("");
    self.title = ko.observable("");
    self.generating_staff_notation = ko.observable(false);
    self.composition_musicxml_source = ko.observable("");
    self.composition_lilypond_source = ko.observable("");
    self.composition_parsed_doremi_script = ko.observable();
    self.staff_notation_url = ko.observable(NONE_URL);
    self.keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Db", "Eb", "Gb", "Ab", "Bb"];
    self.key = ko.observable("");
    self.staff_notation_url_with_time_stamp = ko.computed(function() {
      var time_stamp;
      if (self.staff_notation_url() === NONE_URL) {
        return self.staff_notation_url();
      }
      time_stamp = new Date().getTime();
      return "" + (self.staff_notation_url()) + "?ts=" + time_stamp;
    });
    self.modes = ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"];
    self.mode = ko.observable("");
    self.lines = ko.observableArray([]);
    self.generate_staff_notation = function(my_model) {
      var lilypond_source, my_data, obj, timeout_in_seconds, ts, url;
      console.log("entering generate_staff_notation");
      self.generating_staff_notation(true);
      self.refresh_doremi_script_source();
      self.parse_composition();
      self.refresh_composition_lilypond_source();
      self.staff_notation_url(NONE_URL);
      lilypond_source = self.composition_lilypond_source();
      console.log("lilypond_source", lilypond_source);
      ts = new Date().getTime();
      url = 'http://ragapedia.com:9292/lilypond_to_jpg';
      timeout_in_seconds = 60;
      my_data = {
        fname: "composition_" + (self.id()),
        lilypond: lilypond_source,
        doremi_script_source: self.doremi_script_source()
      };
      obj = {
        dataType: "jsonp",
        timeout: timeout_in_seconds * 1000,
        type: 'GET',
        url: url,
        data: my_data,
        error: function(some_data) {
          self.generating_staff_notation(false);
          self.staff_notation_url(NONE_URL);
          return alert("Couldn't connect to staff notation generator server at " + url);
        },
        success: function(some_data, text_status) {
          self.generating_staff_notation(false);
          self.composition_lilypond_output(some_data.lilypond_output);
          if (some_data.error) {
            self.staff_notation_url(NONE_URL);
            self.composition_lilypond_output_visible(true);
            return;
          }
          self.staff_notation_url(some_data.fname);
          self.staff_notation_visible(true);
          return self.composition_lilypond_output_visible(false);
        }
      };
      $.ajax(obj);
      return true;
    };
    self.parse = function(doremi_script_source_param) {
      var ret_val;
      ret_val = null;
      try {
        ret_val = DoremiScriptParser.parse(doremi_script_source_param);
      } catch (err) {
        console.log(err);
        ret_val = null;
      } finally {

      }
      return ret_val;
    };
    self.attribute_keys = ["id", "filename", "raga", "author", "source", "time_signature", "notes_used", "title", "key", "mode", "staff_notation_url"];
    self.my_init = function(doremi_script_source_param) {
      var key, list, parsed, _i, _len, _ref;
      console.log("Entering CompositionViewModel.init, source is", doremi_script_source_param);
      list = compositions_in_local_storage();
      self.available_compositions = ko.observableArray(list);
      parsed = self.parse(doremi_script_source_param);
      console.log("parsed", parsed);
      if (!parsed) {
        alert("Something bad happened, parse failed");
        return;
      }
      self.composition_parsed_doremi_script(parsed);
      if (!(parsed.id != null)) {
        parsed.id = new Date().getTime();
      }
      _ref = self.attribute_keys;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        self[key](parsed[key]);
      }
      return self.lines(ko.utils.arrayMap(parsed.lines, LineViewModel));
    };
    self.add_line = function() {
      var x;
      self.lines.push(x = new LineViewModel());
      x.parse();
      return ko.applyBindings(x);
    };
    self.re_index_lines = function() {
      var ctr, line, _i, _len, _ref, _results;
      ctr = 0;
      _ref = self.lines();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _results.push(line.index(ctr++));
      }
      return _results;
    };
    self.composition_insert_line = function(line_model, event) {
      var index, number_of_elements_to_remove;
      console.log("insert_line");
      index = line_model.index();
      number_of_elements_to_remove = 0;
      self.lines.splice(index, number_of_elements_to_remove, new LineViewModel());
      self.re_index_lines();
      return true;
    };
    self.composition_append_line = function(line_model, event) {
      var index, number_of_elements_to_remove;
      index = line_model.index();
      number_of_elements_to_remove = 0;
      self.lines.splice(index + 1, number_of_elements_to_remove, new LineViewModel());
      self.re_index_lines();
      return true;
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
      var key;
      if (!this.selected_composition()) {
        return;
      }
      key = this.selected_composition().key;
      self.composition_info_visible(true);
      return self.load_locally(key);
    };
    self.refresh_composition_musicxml_source = function(my_model) {
      return self.composition_musicxml_source(self.get_musicxml_source());
    };
    self.refresh_doremi_script_source = function(my_model) {
      return self.doremi_script_source(self.get_doremi_script_source());
    };
    self.refresh_parsed_doremi_script = function(my_model) {
      return self.parse_composition();
    };
    self.refresh_composition_lilypond_source = function(my_model) {
      var options, parsed;
      console.log("refresh_composition_lilypond_source");
      parsed = self.composition_parsed_doremi_script();
      options = {
        omit_header: true
      };
      return self.composition_lilypond_source(window.to_lilypond(parsed, options));
    };
    self.new_composition = function() {
      initialData = "Title: Untitled\n\n|S";
      window.the_composition.my_init(initialData);
      return self.add_line();
    };
    self.load_locally = function(key) {
      var source;
      console.log("load_locally");
      if (key === ("composition_" + (window.the_composition.id()))) {
        alert("This is the file you are currently editing");
        return;
      }
      source = localStorage[key];
      return window.the_composition.my_init(source);
    };
    self.get_musicxml_source = function() {
      return window.to_musicxml(self.composition_parsed_doremi_script());
    };
    self.get_doremi_script_source = function() {
      var att, atts, atts_str, json_object, json_str, keys_to_use, line, lines, lines_str, value;
      keys_to_use = self.attribute_keys;
      json_str = JSON.stringify(ko.toJS(self), null, 2);
      json_object = $.parseJSON(json_str);
      atts = (function() {
        var _results;
        _results = [];
        for (att in json_object) {
          value = json_object[att];
          if (__indexOf.call(keys_to_use, att) < 0) {
            continue;
          }
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
  ko.applyBindings(window.the_composition, $('html')[0]);
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
  $(window).resize(function() {
    return window.the_composition.composition_stave_width(window.the_composition.calculate_stave_width());
  });
  return window.timed_count();
});