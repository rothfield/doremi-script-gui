var EMPTY_LINE_SOURCE, NONE_URL, unique_id;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
NONE_URL = "images/none.png";
unique_id = 1000;
EMPTY_LINE_SOURCE = "| ";
window.CompositionViewModel = function(my_doremi_source) {
  var app, help_visible_fun, links_enabled, self;
  app = window.doremi_script_gui_app;
  self = this;
  self.last_line_opened = null;
  self.help_visible = ko.observable(false);
  self.disable_context_menu = ko.observable(false);
  self.toggle_disable_context_menu = function(event) {
    self.disable_context_menu(!this.disable_context_menu());
    return self.my_init(self.doremi_source());
  };
  self.toggle_help_visible = function(event) {
    if (debug) {
      console.log("toggle_help_visible");
    }
    self.help_visible(!this.help_visible());
    if (self.help_visible()) {
      return $('#help_content').html($('#help-tpl').html());
    } else {
      return $('#help_content').html('');
    }
  };
  self.help_visible_action = ko.computed(help_visible_fun = function() {
    if (debug) {
      console.log("help_visible_action");
    }
    if (self.document != null) {
      return;
    }
    if (self.help_visible()) {
      return $("#help_button").text("Hide Help");
    } else {
      return $("#help_button").text("Help");
    }
  });
  self.editing_a_line = ko.observable(false);
  self.not_editing_a_line = ko.observable(true);
  self.editing_composition = ko.observable(false);
  self.last_doremi_source = "";
  self.lines = ko.observableArray([]);
  self.selected_composition = ko.observable();
  self.staff_notation_url = ko.observable(NONE_URL);
  self.apply_hyphenated_lyrics = ko.observable(false);
  self.apply_hyphenated_lyrics.subscribe(function(newValue) {
    return setTimeout("window.the_composition.redraw()", 1000);
  });
  self.toggle_apply_hyphenated_lyrics = function(x) {
    return self.apply_hyphenated_lyrics(!self.apply_hyphenated_lyrics());
  };
  self.composition_parse_tree_text = ko.observable("");
  self.open_file_visible = ko.observable(false);
  self.composition_info_visible = ko.observable(true);
  self.show_title = ko.observable(false);
  self.show_hyphenated_lyrics = ko.observable(false);
  self.hide_show_hyphenated_lyrics = function() {
    if (self.show_hyphenated_lyrics()) {
      return $('.lyrics_section.hyphenated').show();
    } else {
      return $('.lyrics_section.hyphenated').hide();
    }
  };
  self.hide_hyphenated_lyrics = ko.computed(function() {
    !self.show_hyphenated_lyrics();
    return self.hide_show_hyphenated_lyrics();
  });
  self.hide_title = ko.computed(function() {
    return !self.show_title();
  });
  self.composition_parse_failed = ko.observable(false);
  self.calculate_stave_width = function() {
    var width;
    width = $('div.composition_body').width();
    return "" + (width - 150) + "px";
  };
  self.calculate_textarea_width = function() {
    var width;
    width = $('div.composition_body').width();
    return "" + (width - 150) + "px";
  };
  self.composition_stave_width = ko.observable(self.calculate_stave_width());
  self.composition_textarea_width = ko.observable(self.calculate_textarea_width());
  self.base_url = ko.observable(null);
  self.links_enabled = ko.computed(links_enabled = function() {
    var url;
    if (debug) {
      console.log("links_enabled");
    }
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
  self.toggle_hyphenated_lyrics_visible = function(event) {
    return self.show_hyphenated_lyrics(!this.show_hyphenated_lyrics());
  };
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
    var time_stamp, x;
    if (self.staff_notation_url() === NONE_URL) {
      return self.staff_notation_url();
    }
    time_stamp = new Date().getTime();
    x = "" + (self.staff_notation_url()) + "?ts=" + time_stamp;
    return self.staff_notation_url_with_time_stamp(x);
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
        if (debug) {
          console.log(base_url);
        }
        self.base_url(base_url);
        self.staff_notation_url(app.app.full_url_helper(some_data.fname));
        self.staff_notation_visible(true);
        return self.composition_lilypond_output_visible(false);
      }
    };
    return $.ajax(obj);
  };
  self.generate_all_but_staff_notation = function(my_model) {
    return self.generate_staff_notation_aux(my_model, "true");
  };
  self.generate_staff_notation = function(my_model) {
    return self.generate_staff_notation_aux(my_model);
  };
  self.generate_staff_notation_aux = function(my_model, dont) {
    var lilypond_source, my_data, obj, src, timeout_in_seconds, ts, url;
    if (dont == null) {
      dont = "false";
    }
    console.log("generate_staff_notation");
    self.redraw();
    self.generating_staff_notation(true);
    lilypond_source = self.composition_lilypond_source();
    ts = new Date().getTime();
    url = '/lilypond_server/lilypond_to_jpg';
    timeout_in_seconds = 60;
    src = self.doremi_source();
    my_data = {
      fname: app.sanitize(self.title()),
      lilypond: lilypond_source,
      html_doc: self.generate_html_page_aux(),
      doremi_source: src,
      musicxml_source: self.get_musicxml_source(),
      dont_generate_staff_notation: dont
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
        self.generating_staff_notation(false);
        self.composition_lilypond_output(some_data.lilypond_output);
        if (some_data.error) {
          self.staff_notation_url(NONE_URL);
          self.composition_lilypond_output_visible(true);
          alert("An error occurred: " + some_data.lilypond_output);
          return;
        }
        fname = some_data.fname;
        base_url = fname.slice(0, fname.lastIndexOf('.'));
        if (debug) {
          console.log(base_url);
        }
        self.base_url(base_url);
        self.staff_notation_url(app.full_url_helper(some_data.fname));
        self.calculate_staff_notation_url_with_time_stamp();
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
    if (debug) {
      console.log("compute_doremi_source");
    }
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
          console.log("486--");
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
      if (debug) {
        console.log("composition.parse- error is " + err);
      }
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
    $('img.staff_notation').attr('src', NONE_URL);
    self.staff_notation_url(NONE_URL);
    self.calculate_staff_notation_url_with_time_stamp();
    if (debug) {
      console.log("composition.my_init", doremi_source_param);
    }
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
    if (debug) {
      console.log("Loading lines");
    }
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
    self.calculate_staff_notation_url_with_time_stamp();
    return self.redraw();
  };
  self.delete_line = function(which_line) {
    which_line.source("");
    return self.redraw();
  };
  self.add_line = function() {
    var x;
    if (debug) {
      console.log("add_line");
    }
    self.lines.push(x = new LineViewModel({
      source: EMPTY_LINE_SOURCE
    }));
    if (debug) {
      console.log('add line x is', x);
    }
    self.re_index_lines();
    self.redraw();
    if (debug) {
      console.log("add_line before x.edit()");
    }
    x.edit();
    return true;
  };
  self.edit_line_open = ko.observable(false);
  self.no_edit_line_open = ko.computed(function() {
    return !self.edit_line_open();
  });
  self.composition_insert_line = function(line_model, event) {
    var index, number_of_elements_to_remove, x;
    if (debug) {
      console.log("composition_insert_line");
    }
    index = line_model.index();
    if (debug) {
      console.log("insert_line, line_model,index", line_model, index);
    }
    number_of_elements_to_remove = 0;
    self.lines.splice(index, number_of_elements_to_remove, x = new LineViewModel({
      source: EMPTY_LINE_SOURCE
    }));
    self.re_index_lines();
    x.edit();
    return true;
  };
  self.re_index_lines = function() {
    var ctr, line, _i, _len, _ref, _results;
    ctr = 0;
    if (debug) {
      console.log("re_index_lines");
    }
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
    if (debug) {
      console.log("composition_append_line");
    }
    index = line_model.index();
    number_of_elements_to_remove = 0;
    self.lines.splice(index + 1, number_of_elements_to_remove, x = new LineViewModel({
      source: EMPTY_LINE_SOURCE
    }));
    self.re_index_lines();
    x.edit();
    return true;
  };
  self.composition_select_visible = ko.observable(false);
  self.saveable = ko.computed(function() {
    if (debug) {
      console.log("in saveable");
    }
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
    if (debug) {
      console.log("in close");
    }
    self.last_doremi_source = "";
    self.lines.remove(function() {
      return true;
    });
    if (debug) {
      return console.log("after close, lines are", self.lines());
    }
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
    var initialData;
    if (self.ask_user_if_they_want_to_save()) {
      return;
    }
    initialData = "";
    window.the_composition.my_init(initialData);
    app.message_box("An untitled composition was created with a new id. Please enter a title");
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
        if (debug) {
          console.log("key is", key);
        }
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
    console.log('a');
    if (self.editing_a_line()) {
      return true;
    }
    console.log('a');
    if (self.composition_parse_failed()) {
      return true;
    }
    console.log('a');
    if (self.title() === "") {
      return true;
    }
    console.log('a');
    if (self.lines().length === 0) {
      return true;
    }
    console.log('a');
    return false;
  });
  self.generate_html_page_aux = function() {
    var a, all_js, b, c, composition, css, full_url, js, js2;
    console.log("generate_html_page_aux");
    a = $('#styles_for_html_doc').html();
    b = $('#doremi_for_html_doc').html();
    c = $('#application_for_html_doc').html();
    css = a + b + c;
    console.log("in generate_html_page_aux, css is " + css);
    js = $('#zepto_for_html_doc').html();
    js2 = $('#dom_fixer_for_html_doc').html();
    all_js = js + js2;
    composition = window.the_composition;
    full_url = document.location.origin;
    return to_html_doc(self.composition_parsed_doremi_script(), full_url, css, all_js);
  };
  self.get_dom_fixer = function() {
    var params;
    params = {
      type: 'GET',
      url: '/doremi-script-gui/js/from_doremi_script_base/dom_fixer.js',
      dataType: 'text',
      success: function(data) {
        $('#dom_fixer_for_html_doc').html(data);
        return window.generate_html_doc_ctr--;
      }
    };
    return $.ajax(params);
  };
  self.get_zepto = function() {
    var params;
    params = {
      type: 'GET',
      url: '/doremi-script-gui/js/from_doremi_script_base/third_party/zepto.unminified.js',
      dataType: 'text',
      success: function(data) {
        $('#zepto_for_html_doc').html(data);
        return window.generate_html_doc_ctr--;
      }
    };
    return $.ajax(params);
  };
  self.get_styles_css = function() {
    var params;
    params = {
      type: 'GET',
      url: '/doremi-script-gui/css/styles.css',
      dataType: 'text',
      success: function(data) {
        return $('#styles_for_html_doc').html(data);
      }
    };
    return $.ajax(params);
  };
  self.get_doremi_css = function() {
    var params;
    params = {
      type: 'GET',
      url: '/doremi-script-gui/css/doremi.css',
      dataType: 'text',
      success: function(data) {
        return $('#doremi_for_html_doc').html(data);
      }
    };
    return $.ajax(params);
  };
  self.get_application_css = function() {
    var params;
    params = {
      type: 'GET',
      url: '/doremi-script-gui/css/application.css',
      dataType: 'text',
      success: function(data) {
        $('#application_for_html_doc').html(data);
        return window.generate_html_doc_ctr--;
      }
    };
    return $.ajax(params);
  };
  self.redraw = __bind(function() {
    var composition_view, count_before, ctr, debug, doremi_source, fun, parsed, parsed_line, parsed_lines, source, view_line, view_lines, warnings, _i, _j, _len, _len2, _ref, _results, _results2;
    try {
      debug = false;
      doremi_source = self.compute_doremi_source();
      count_before = self.lines().length;
      if (debug) {
        console.log("redraw after compute_do_remi_source");
      }
      composition_view = self;
      self.edit_line_open(false);
      composition_view.last_doremi_source = composition_view.doremi_source();
      parsed = composition_view.composition_parse();
      if ((parsed != null) && parsed.lines.length !== count_before) {
        if (debug) {
          console.log("# of items changed!!");
        }
      }
      if (!(parsed != null)) {
        if (debug) {
          console.log("Parse failed");
        }
        composition_view.composition_parse_failed(true);
        _ref = composition_view.lines();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          view_line = _ref[_i];
          console.log("composition parse failed, checking " + (view_line.source()));
          try {
            source = view_line.source();
            if (/^\s*$/.test(source) || source === "") {
              view_line.rendered_in_html('(empty line)');
              continue;
            }
            parsed_line = DoremiScriptLineParser.parse(source);
            view_line.rendered_in_html(line_to_html(parsed_line));
            view_line.line_parse_failed(false);
          } catch (err) {
            view_line.line_parse_failed(true);
            view_line.line_has_warnings(false);
            view_line.line_warnings([]);
            view_line.rendered_in_html("<pre>Didn't parse\n" + (view_line.source()) + "</pre>");
            console.log(view_line.rendered_in_html());
          }
        }
        return _results;
      } else {
        composition_view.composition_parse_failed(false);
        composition_view.composition_parsed_doremi_script(parsed);
        parsed_lines = parsed.lines;
        view_lines = composition_view.lines();
        ctr = 0;
        if (parsed_lines.length !== view_lines.length) {
          console.log("Info:assertion failed parsed_lines.length isnt view_lines.length");
          self.my_init(doremi_source);
          return;
        }
        _results2 = [];
        for (_j = 0, _len2 = parsed_lines.length; _j < _len2; _j++) {
          parsed_line = parsed_lines[_j];
          view_line = view_lines[ctr];
          if (/^\s*$/.test(view_line.source())) {
            view_line.rendered_in_html('(empty line)');
            continue;
          }
          view_line.line_parse_failed(false);
          view_line.rendered_in_html(line_to_html(parsed_line));
          warnings = parsed_line.line_warnings;
          view_line.line_warnings(warnings);
          view_line.line_has_warnings(warnings.length > 0);
          _results2.push(ctr++);
        }
        return _results2;
      }
    } catch (err) {
      return console.log("Error in redraw " + err);
    } finally {
      self.hide_show_hyphenated_lyrics();
      fun = function() {
        return dom_fixes();
      };
      setTimeout(fun, 300);
      app.setup_context_menu();
    }
  }, this);
  if (my_doremi_source != null) {
    self.my_init(my_doremi_source);
  }
  return self;
};