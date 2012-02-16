var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$(document).ready(function() {
  var EMPTY_LINE_SOURCE, Logger, NONE_URL, app, debug, full_url_helper, handleFileSelect, initialData, message_box, setup_downloadify, unique_id;
  window.doremi_script_gui_app = {};
  app = window.doremi_script_gui_app;
  app.sanitize = function(name) {
    return name.replace(/[^0-9A-Za-z.\-]/g, '_').toLowerCase();
  };
  app.scroll_to_element = function(element_to_scroll_to_id) {
    var $el;
    $el = $("#" + element_to_scroll_to_id);
    console.log("$el is", $el);
    return $('html, body').animate({
      scrollTop: $("#" + element_to_scroll_to_id).position().top
    }, 'slow');
  };
  setup_downloadify = function() {
    console.log("entering setup_downloadify");
    app.params_for_download_lilypond = {
      filename: function() {
        return "" + (app.the_composition.filename()) + ".ly";
      },
      data: function() {
        return app.the_composition.composition_lilypond_source();
      },
      onComplete: function() {
        if (debug) {
          return console.log('Your File Has Been Saved!');
        }
      },
      swf: './js/doremi-script/third_party/downloadify/downloadify.swf',
      downloadImage: './images/save.png',
      height: 19,
      width: 76,
      transparent: true,
      append: false,
      onComplete: function() {
        return alert("Your file was saved");
      }
    };
    app.params_for_download_sargam = _.clone(app.params_for_download_lilypond);
    app.params_for_download_sargam.data = function() {
      return app.the_composition.doremi_source();
    };
    app.params_for_download_sargam.filename = function() {
      return "" + (app.sanitize(app.the_composition.title())) + ".doremi_script.txt";
    };
    $("#download_lilypond").downloadify(app.params_for_download_lilypond);
    return $("#save").downloadify(app.params_for_download_sargam);
  };
  initialData = "Title: testing\nAuthor: anon\nApplyHyphenatedLyrics: true\nmany words aren't hyphenated\n\n| SRG- m-m-\n. \n\n|PDNS";
  initialData = "";
  debug = false;
  NONE_URL = "images/none.png";
  unique_id = 1000;
  EMPTY_LINE_SOURCE = "| ";
  message_box = function(str) {
    return alert(str);
  };
  full_url_helper = function(fname) {
    var loc;
    loc = document.location;
    return "" + loc.protocol + "//" + loc.host + fname;
  };
  window.LineViewModel = function(line_param) {
    var self;
    if (line_param == null) {
      line_param = {
        source: EMPTY_LINE_SOURCE,
        rendered_in_html: "(Empty Line)"
      };
    }
    self = this;
    self.line_id = ko.observable(unique_id++);
    self.index = ko.observable(line_param.index);
    self.div_line_id = ko.computed(function() {
      return "div_line_" + (self.index());
    });
    if (debug) {
      console.log("LineViewModel");
    }
    self.line_parsed_doremi_script = ko.observable(null);
    self.line_parse_failed = ko.observable(false);
    self.line_warnings = ko.observable([]);
    self.line_has_warnings = ko.observable(false);
    self.line_warnings_visible = ko.observable(false);
    self.parse_tree_visible = ko.observable(false);
    self.parse_tree_text = ko.observable("parse tree text here");
    self.editing = ko.observable(false);
    self.not_editing = ko.observable(true);
    self.last_html_rendered = "";
    self.stave_height = ko.observable("161px");
    self.source = ko.observable(line_param.source);
    self.rendered_in_html = ko.observable(line_param.rendered_in_html);
    self.line_wrapper_click = function(my_model, event) {
      var current_target, text_area;
      if (winodw.the_composition.editing_a_line()) {
        return;
      }
      window.the_composition.compute_doremi_source();
      window.the_composition.edit_line_open(true);
      if (debug) {
        console.log("line_wrapper_click", event);
      }
      if (!self.editing()) {
        self.editing(true);
        self.not_editing(false);
        current_target = event.currentTarget;
        text_area = $(current_target).parent().find("textarea");
        $(text_area).focus();
      }
      return true;
    };
    self.close_edit = function(my_model, event) {
      var index;
      index = my_model.index();
      self.editing(false);
      self.not_editing(true);
      window.the_composition.last_line_opened = my_model.index();
      window.the_composition.redraw();
      return true;
    };
    self.toggle_line_warnings_visible = function(event) {
      return self.line_warnings_visible(!self.line_warnings_visible());
    };
    self.toggle_parse_tree_visible = function(event) {
      self.parse_tree_visible(!self.parse_tree_visible());
      return true;
    };
    self.edit = function(my_model, event) {
      var dom_id, line, val, _i, _len, _ref;
      if (window.the_composition.editing_a_line()) {
        return false;
      }
      if (self.editing()) {
        return false;
      }
      _ref = window.the_composition.lines();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        line.editing(false);
      }
      self.editing(true);
      window.the_composition.edit_line_open(true);
      self.not_editing(false);
      dom_id = self.entry_area_id();
      console.log("dom_id is " + dom_id);
      $("textarea#" + dom_id).focus();
      val = self.source();
      $("textarea#" + dom_id).select_range(val.length, val.length);
      return true;
    };
    self.entry_area_id = ko.observable("entry_area_" + unique_id);
    self.handle_key_press = function(current_line, event) {
      var let_default_action_proceed;
      let_default_action_proceed = true;
      return let_default_action_proceed;
    };
    return self;
  };
  Logger = _console.constructor;
  _console.level = Logger.WARN;
  _.mixin(_console.toObject());
  handleFileSelect = __bind(function(evt) {
    var file, reader, x;
    console.log("handle_file_select");
    if (window.the_composition.editing_composition()) {
      x = confirm("Save current composition?");
      if (x) {
        $('#file').val('');
        alert("use save button");
        return;
      }
    }
    file = document.getElementById('file').files[0];
    reader = new FileReader();
    reader.onload = function(evt) {
      var val;
      val = $('#file').val();
      $('#file').val('');
      console.log("onload");
      $('#file').val('');
      window.the_composition.last_doremi_source = new Date().getTime();
      window.the_composition.my_init(evt.target.result);
      window.the_composition.editing_composition(true);
      window.the_composition.open_file_visible(false);
      window.the_composition.help_visible(false);
      return window.the_composition.composition_info_visible(false);
    };
    return reader.readAsText(file, "");
  }, this);
  document.getElementById('file').addEventListener('change', handleFileSelect, false);
  window.CompositionViewModel = function(my_doremi_source) {
    var help_visible_fun, links_enabled, self;
    self = this;
    self.last_line_opened = null;
    self.help_visible = ko.observable(false);
    self.toggle_help_visible = function(event) {
      return self.help_visible(!this.help_visible());
    };
    self.help_visible_action = ko.computed(help_visible_fun = function() {
      console.log("help_visible_action");
      if (self.document != null) {
        return;
      }
      if (self.help_visible()) {
        return $("#help_button").text("Hide Help");
      } else {
        return $("#help_button").text("Help");
      }
    });
    self.not_editing_a_line = function() {
      return !self.editing_a_line();
    };
    self.editing_a_line = function() {
      var line, val, _i, _len, _ref;
      val = false;
      _ref = this.lines();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line.editing()) {
          val = true;
        }
      }
      return val;
    };
    self.editing_composition = ko.observable(false);
    self.last_doremi_source = "";
    self.lines = ko.observableArray([]);
    self.selected_composition = ko.observable();
    self.staff_notation_url = ko.observable(NONE_URL);
    self.apply_hyphenated_lyrics = ko.observable(false);
    self.composition_parse_tree_text = ko.observable("");
    self.open_file_visible = ko.observable(false);
    self.composition_info_visible = ko.observable(true);
    self.show_title = ko.observable(false);
    self.composition_parse_failed = ko.observable(false);
    self.calculate_stave_width = function() {
      var width;
      width = $('div.composition_body').width();
      return "" + (width - 50) + "px";
    };
    self.calculate_textarea_width = function() {
      var width;
      width = $('div.composition_body').width();
      return "" + ((width - 50) / 2) + "px";
    };
    self.composition_stave_width = ko.observable(self.calculate_stave_width());
    self.composition_textarea_width = ko.observable(self.calculate_textarea_width());
    self.base_url = ko.observable(null);
    self.links_enabled = ko.computed(links_enabled = function() {
      var url;
      console.log("links_enabled");
      url = self.base_url();
      return (url != null) && url !== "";
    });
    self.lilypond_url = ko.computed(function() {
      var base_url;
      base_url = self.base_url();
      if (!base_url) {
        return "/#";
      }
      return "" + base_url + ".ly";
    });
    self.music_xml_url = ko.computed(function() {
      var base_url;
      base_url = self.base_url();
      if (!base_url) {
        return "/#";
      }
      return "" + base_url + ".xml";
    });
    self.html_url = ko.computed(function() {
      var base_url;
      base_url = self.base_url();
      if (!base_url) {
        return "/#";
      }
      return "" + base_url + ".html";
    });
    self.jpg_url = ko.computed(function() {
      var base_url;
      base_url = self.base_url();
      if (!base_url) {
        return "/#";
      }
      return "" + base_url + ".jpg";
    });
    self.pdf_url = ko.computed(function() {
      var base_url;
      base_url = self.base_url();
      if (!base_url) {
        return "/#";
      }
      return "" + base_url + ".pdf";
    });
    self.midi_url = ko.computed(function() {
      var base_url;
      base_url = self.base_url();
      if (!base_url) {
        return "/#";
      }
      return "" + base_url + ".mid";
    });
    self.doremi_source_url = ko.computed(function() {
      var base_url;
      base_url = self.base_url();
      if (!base_url) {
        return "/#";
      }
      return "" + base_url + ".doremi_script.txt";
    });
    self.composition_lilypond_source_visible = ko.observable(false);
    self.composition_musicxml_source_visible = ko.observable(false);
    self.parsed_doremi_script_visible = ko.observable(false);
    self.composition_lilypond_output_visible = ko.observable(false);
    self.composition_lilypond_output = ko.observable(false);
    self.doremi_source_visible = ko.observable(false);
    self.toggle_title_visible = function(event) {
      return self.show_title(!this.show_title());
    };
    self.toggle_composition_select_visible = function(event) {
      self.composition_select_visible(!this.composition_select_visible());
      return self.refresh_compositions_in_local_storage();
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
      var parsed;
      self.composition_lilypond_source_visible(!self.composition_lilypond_source_visible());
      return;
      if (self.composition_lilypond_source_visible) {
        parsed = self.composition_parsed_doremi_script();
        if (parsed != null) {
          return self.composition_lilypond_source(to_lilypond(parsed));
        } else {
          return self.composition_lilypond_source("");
        }
      }
    };
    self.composition_as_html = ko.observable("");
    self.toggle_doremi_source_visible = function() {
      return self.doremi_source_visible(!self.doremi_source_visible());
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
    self.staff_notation_url = ko.observable(NONE_URL);
    self.keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Db", "Eb", "Gb", "Ab", "Bb"];
    self.key = ko.observable("");
    self.staff_notation_url_with_time_stamp = ko.observable();
    self.calculate_staff_notation_url_with_time_stamp = function() {
      var time_stamp;
      if (self.staff_notation_url() === NONE_URL) {
        return self.staff_notation_url();
      }
      time_stamp = new Date().getTime();
      return "" + (self.staff_notation_url()) + "?ts=" + time_stamp;
    };
    self.modes = ["ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"];
    self.mode = ko.observable("");
    self.download_doremi_source_file = function(my_model) {
      var lilypond_source, my_data, obj, src, timeout_in_seconds, url;
      url = '/doremi_script_server/save_to_server';
      lilypond_source = self.composition_lilypond_source();
      timeout_in_seconds = 60;
      src = self.doremi_source();
      my_data = {
        lilypond: self.composition_lilypond_source(),
        fname: "" + (self.title()) + "_" + (self.author()) + "_" + (self.id()),
        doremi_source: src
      };
      obj = {
        dataType: "json",
        timeout: timeout_in_seconds * 1000,
        type: 'POST',
        url: url,
        data: my_data,
        error: function(some_data) {
          self.generating_staff_notation(false);
          self.staff_notation_url(NONE_URL);
          return alert("Couldn't connect to staff notation generator server at " + url);
        },
        success: function(some_data, text_status) {
          var base_url, fname;
          if (some_data.error) {
            alert("An error occurred: " + some_data.error);
            return;
          }
          fname = some_data.fname;
          base_url = fname.slice(0, fname.lastIndexOf('.'));
          console.log(base_url);
          self.base_url(base_url);
          self.staff_notation_url(full_url_helper(some_data.fname));
          self.staff_notation_visible(true);
          return self.composition_lilypond_output_visible(false);
        }
      };
      return $.ajax(obj);
    };
    self.generate_staff_notation = function(my_model) {
      var lilypond_source, my_data, obj, src, timeout_in_seconds, ts, url;
      self.generating_staff_notation(true);
      lilypond_source = self.composition_lilypond_source();
      ts = new Date().getTime();
      url = '/lilypond_server/lilypond_to_jpg';
      timeout_in_seconds = 60;
      src = self.doremi_source();
      my_data = {
        fname: app.sanitize(self.title()),
        lilypond: lilypond_source,
        doremi_source: src
      };
      obj = {
        dataType: "json",
        timeout: timeout_in_seconds * 1000,
        type: 'POST',
        url: url,
        data: my_data,
        error: function(some_data) {
          self.generating_staff_notation(false);
          self.staff_notation_url(NONE_URL);
          return alert("Couldn't connect to staff notation generator server at " + url);
        },
        success: function(some_data, text_status) {
          var base_url, fname, x;
          self.generating_staff_notation(false);
          self.composition_lilypond_output(some_data.lilypond_output);
          if (some_data.error) {
            self.staff_notation_url(NONE_URL);
            self.composition_lilypond_output_visible(true);
            alert("An error occurred: " + some_data.error);
            return;
          }
          fname = some_data.fname;
          base_url = fname.slice(0, fname.lastIndexOf('.'));
          console.log(base_url);
          self.base_url(base_url);
          self.staff_notation_url(full_url_helper(some_data.fname));
          x = self.calculate_staff_notation_url_with_time_stamp();
          self.staff_notation_url_with_time_stamp(x);
          self.staff_notation_visible(true);
          return self.composition_lilypond_output_visible(false);
        }
      };
      $.ajax(obj);
      return true;
    };
    self.attribute_keys = ["id", "filename", "raga", "author", "source", "time_signature", "notes_used", "title", "key", "mode", "staff_notation_url", "apply_hyphenated_lyrics"];
    self.compute_doremi_source = function() {
      var att, atts, atts_str, keys, keys_to_use, line, lines, lines_str, value;
      console.log("compute_doremi_source");
      self.id();
      self.title();
      self.filename();
      self.raga();
      self.key();
      self.mode();
      self.author();
      self.source();
      self.time_signature();
      self.apply_hyphenated_lyrics();
      self.staff_notation_url();
      self.lines();
      keys_to_use = self.attribute_keys;
      keys = ["id", "title", "filename", "raga", "key", "mode", "author", "source", "time_signature", "apply_hyphenated_lyrics", "staff_notation_url"];
      atts = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = keys.length; _i < _len; _i++) {
          att = keys[_i];
          value = self[att]();
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
          if (att === "apply_hyphenated_lyrics") {
            att = "ApplyHyphenatedLyrics";
          }
          if (att === "staff_notation_url") {
            att = "StaffNotationURL";
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
          _results.push(line.source());
        }
        return _results;
      })();
      lines_str = lines.join("\n\n");
      return atts_str + "\n\n" + lines_str;
    };
    self.doremi_source = ko.computed(self.compute_doremi_source);
    self.composition_parse = function() {
      var ret_val, source;
      ret_val = null;
      try {
        source = self.doremi_source();
        ret_val = DoremiScriptParser.parse(source);
      } catch (err) {
        console.log("composition.parse- error is " + err);
        ret_val = null;
      } finally {

      }
      return ret_val;
    };
    self.composition_parsed_doremi_script = ko.observable(null);
    self.composition_musicxml_source = ko.computed(function() {
      var parsed;
      parsed = self.composition_parsed_doremi_script();
      if (!(parsed != null)) {
        return "";
      }
      return to_musicxml(parsed);
    });
    self.composition_lilypond_source = ko.computed(function() {
      var parsed;
      parsed = self.composition_parsed_doremi_script();
      if (!(parsed != null)) {
        return "";
      }
      return to_lilypond(parsed);
    });
    self.composition_parse_warnings = ko.computed(function() {
      var parse_tree;
      parse_tree = self.composition_parsed_doremi_script();
      if (!(parse_tree != null)) {
        return false;
      }
      if (!(parse_tree.warnings != null)) {
        return false;
      }
      return parse_tree.warnings.length > 0;
    });
    self.my_init = function(doremi_source_param) {
      var fct, key, my_lines, parsed, parsed_line, val, _i, _len, _ref;
      console.log("composition.my_init", doremi_source_param);
      parsed = DoremiScriptParser.parse(doremi_source_param);
      self.composition_parsed_doremi_script(parsed);
      self.last_doremi_source = "";
      if (!parsed) {
        alert("Something bad happened, parse failed");
        return;
      }
      if (!(parsed.id != null)) {
        parsed.id = new Date().getTime();
      }
      _ref = self.attribute_keys;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        val = parsed[key];
        fct = self[key];
        fct(val);
      }
      console.log("Loading lines");
      my_lines = (function() {
        var _j, _len2, _ref2, _results;
        _ref2 = parsed.lines;
        _results = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          parsed_line = _ref2[_j];
          _results.push(new LineViewModel(parsed_line));
        }
        return _results;
      })();
      self.lines(my_lines);
      return self.redraw();
    };
    self.add_line = function() {
      var x;
      console.log("add_line");
      self.lines.push(x = new LineViewModel({
        source: EMPTY_LINE_SOURCE
      }));
      console.log('add line x is', x);
      return self.redraw();
    };
    self.edit_line_open = ko.observable(false);
    self.no_edit_line_open = ko.computed(function() {
      return !self.edit_line_open();
    });
    self.composition_insert_line = function(line_model, event) {
      var index, number_of_elements_to_remove, x;
      console.log("composition_insert_line");
      index = line_model.index();
      console.log("insert_line, line_model,index", line_model, index);
      number_of_elements_to_remove = 0;
      self.lines.splice(index, number_of_elements_to_remove, x = new LineViewModel({
        source: EMPTY_LINE_SOURCE
      }));
      self.redraw();
      return true;
    };
    self.re_index_lines = function() {
      var ctr, line, _i, _len, _ref, _results;
      ctr = 0;
      console.log("re_index_lines");
      _ref = self.lines();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        line.index(ctr);
        _results.push(ctr = ctr + 1);
      }
      return _results;
    };
    self.composition_append_line = function(line_model, event) {
      var index, number_of_elements_to_remove, x;
      console.log("composition_append_line");
      index = line_model.index();
      number_of_elements_to_remove = 0;
      self.lines.splice(index + 1, number_of_elements_to_remove, x = new LineViewModel({
        source: EMPTY_LINE_SOURCE
      }));
      self.redraw();
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
    self.composition_select_visible = ko.observable(false);
    self.saveable = ko.computed(function() {
      console.log("in saveable");
      return self.title() !== "";
    });
    self.ask_user_if_they_want_to_save = function() {
      if (self.editing_composition()) {
        if (self.saveable()) {
          if (confirm("Save current composition before continuing?")) {
            alert("Click the Save button to save your composition");
            return true;
          }
        }
      }
    };
    self.initial_help_display = ko.observable(false);
    self.close = function() {
      self.editing_composition(false);
      console.log("in close");
      self.last_doremi_source = "";
      self.lines.remove(function() {
        return true;
      });
      return console.log("after close, lines are", self.lines());
    };
    self.gui_close = function() {
      if (self.ask_user_if_they_want_to_save()) {
        return;
      }
      return self.close();
    };
    self.print_composition = function() {
      var line, _i, _len, _ref;
      _ref = self.lines();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        line.editing(false);
      }
      return window.print();
    };
    self.new_composition = function() {
      self.ask_user_if_they_want_to_save();
      if (self.ask_user_if_they_want_to_save()) {
        return;
      }
      initialData = "";
      window.the_composition.my_init(initialData);
      message_box("An untitled composition was created with a new id. Please enter a title");
      self.composition_info_visible(true);
      self.editing_composition(true);
      self.help_visible(false);
      return $('#composition_title').focus();
    };
    self.refresh_compositions_in_local_storage = function() {
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
          console.log("key is", key);
          if (key.indexOf("composition_") === 0) {
            items.push(new Item(key, localStorage[key]));
          }
          ctr++;
        }
      }
      items;
      return self.compositions_in_local_storage(items);
    };
    self.compositions_in_local_storage = ko.observable([]);
    self.get_musicxml_source = function() {
      return window.to_musicxml(self.composition_parsed_doremi_script());
    };
    self.disable_generate_staff_notation = ko.computed(function() {
      if (self.composition_parse_failed()) {
        return true;
      }
      if (self.title() === "") {
        return true;
      }
      if (self.lines().size === 0) {
        return true;
      }
      return false;
    });
    self.redraw = __bind(function() {
      var composition_view, ctr, html, parsed, parsed_line, parsed_lines, source, view_line, view_lines, warnings, _i, _j, _len, _len2, _ref;
      debug = true;
      self.compute_doremi_source();
      composition_view = self;
      self.edit_line_open(false);
      if (true) {
        composition_view.last_doremi_source = composition_view.doremi_source();
        parsed = composition_view.composition_parse();
        if (!(parsed != null)) {
          if (debug) {
            console.log("Parse failed");
          }
          composition_view.composition_parse_failed(true);
          _ref = composition_view.lines();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            view_line = _ref[_i];
            console.log("composition parse failed, checking " + (view_line.source()));
            try {
              source = view_line.source();
              if (/^\s*$/.test(source)) {
                view_line.rendered_in_html('(empty line)');
                continue;
              }
              parsed_line = DoremiScriptLineParser.parse(source);
              html = line_to_html(parsed_line);
              view_line.rendered_in_html(html);
              view_line.line_parse_failed(false);
            } catch (err) {
              view_line.line_parse_failed(true);
              view_line.line_has_warnings(false);
              view_line.line_warnings([]);
              view_line.rendered_in_html("<pre>Didn't parse\n" + (view_line.source()) + "</pre>");
            }
          }
        } else {
          composition_view.composition_parse_failed(false);
          composition_view.composition_parsed_doremi_script(parsed);
          if (composition_view.composition_musicxml_source_visible()) {
            composition_view.composition_musicxml_source(to_musicxml(parsed));
          }
          parsed_lines = parsed.lines;
          view_lines = composition_view.lines();
          ctr = 0;
          if (parsed_lines.length !== view_lines.length) {
            console.log("Info:assertion failed parsed_lines.length isnt view_lines.length");
          }
          for (_j = 0, _len2 = parsed_lines.length; _j < _len2; _j++) {
            parsed_line = parsed_lines[_j];
            view_line = view_lines[ctr];
            if (/^\s*$/.test(view_line.source())) {
              view_line.rendered_in_html('(empty line)');
              continue;
            }
            html = line_to_html(parsed_line);
            view_line.line_parse_failed(false);
            view_line.rendered_in_html(html);
            warnings = parsed_line.line_warnings;
            view_line.line_warnings(warnings);
            view_line.line_has_warnings(warnings.length > 0);
            ctr++;
          }
          dom_fixes();
        }
      } else {
        dom_fixes();
      }
      return debug = false;
    }, this);
    self.save_locally = function() {
      if (self.composition_parse_failed() === true) {
        alert("Can't save because there are syntax errors. Please fix the lines outlined in red first");
        return true;
      }
      localStorage.setItem("composition_" + (self.id()), self.doremi_source());
      return message_box("" + (self.title()) + " was saved in your browser's localStorage");
    };
    if (my_doremi_source != null) {
      self.my_init(my_doremi_source);
    }
    return self;
  };
  window.the_composition = new CompositionViewModel();
  app.the_composition = window.the_composition;
  window.the_composition.help_visible(false);
  ko.applyBindings(window.the_composition, $('html')[0]);
  $(window).resize(function() {
    console.log("info:resize");
    return window.the_composition.composition_stave_width(window.the_composition.calculate_stave_width());
  });
  setup_downloadify();
  return $('#composition_title').focus();
});