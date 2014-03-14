// Generated by CoffeeScript 1.3.3
var Logger, debug, handleFileSelect, unique_id,
  _this = this;

debug = false;

unique_id = 1000;

window.LineViewModel = function(line_param) {
  var self;
  if (line_param == null) {
    line_param = DoremiScriptLineParser.parse("| ");
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
  self.zparsed_line = ko.observable(line_param);
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
  self.revert_edit = function(my_model, event) {
    return true;
  };
  self.get_current_line_of_text_area = function(obj) {
    return self.get_current_line_of(obj.value, obj.selectionStart, obj.selectionEnd);
  };
  self.get_current_line_of = function(val, sel_start, sel_end) {
    var index_of_end_of_line, line, pos_of_start_of_line, start_of_line_to_end, to_left_of_cursor, to_right_of_cursor;
    to_left_of_cursor = val.slice(0, sel_start);
    to_right_of_cursor = val.slice(sel_end);
    pos_of_start_of_line = to_left_of_cursor.lastIndexOf('\n');
    if (pos_of_start_of_line === -1) {
      start_of_line_to_end = val;
    } else {
      start_of_line_to_end = val.slice(pos_of_start_of_line + 1);
    }
    index_of_end_of_line = start_of_line_to_end.indexOf('\n');
    if (index_of_end_of_line === -1) {
      line = start_of_line_to_end;
    } else {
      line = start_of_line_to_end.slice(0, index_of_end_of_line);
    }
    return line;
  };
  self.handle_keypress = function(my_model, event) {
    var char, char2, do_filtering, el, hash, index_of_end_of_line, let_default_action_proceed, line, parent, parent_parsed, pos_of_start_of_line, sel_end, sel_start, start_of_line_to_end, to_left_of_cursor, to_right_of_cursor, val, _ref;
    let_default_action_proceed = true;
    if (debug) {
      console.log("in handle_keypress", my_model, event);
    }
    el = event.srcElement;
    val = el.value;
    sel_start = el.selectionStart;
    sel_end = el.selectionEnd;
    to_left_of_cursor = val.slice(0, sel_start);
    to_right_of_cursor = val.slice(sel_end);
    pos_of_start_of_line = to_left_of_cursor.lastIndexOf('\n');
    if (pos_of_start_of_line === -1) {
      start_of_line_to_end = val;
    } else {
      start_of_line_to_end = val.slice(pos_of_start_of_line + 1);
    }
    index_of_end_of_line = start_of_line_to_end.indexOf('\n');
    if (index_of_end_of_line === -1) {
      line = start_of_line_to_end;
    } else {
      line = start_of_line_to_end.slice(0, index_of_end_of_line);
    }
    line = self.get_current_line_of_text_area(el);
    do_filtering = true;
    char = String.fromCharCode(event.which);
    if ((self.parsed_line() != null) && self.parsed_line().kind !== "latin_sargam") {
      do_filtering = false;
    }
    if (do_filtering) {
      if ((_ref = event.which) === 115 || _ref === 112) {
        if (line.indexOf('|') > -1) {
          hash = {
            112: "P",
            115: "S"
          };
          char = hash[event.which];
        }
      }
      console.log("debug here");
      parent = window.the_composition;
      parent_parsed = parent.composition_parsed_doremi_script();
      if ((parent_parsed != null) && parent_parsed.force_notes_used) {
        hash = parent_parsed.force_notes_used_hash;
        char2 = hash[String.fromCharCode(event.which)];
        char = char2 || char;
      }
    }
    event.preventDefault();
    el.value = "" + to_left_of_cursor + char + to_right_of_cursor;
    self.source(el.value);
    el.setSelectionRange(sel_start + 1, sel_start + 1);
    el.focus();
    return true;
  };
  self.close_edit = function(my_model, event) {
    var $textarea, dom_id, index;
    index = my_model.index();
    dom_id = self.entry_area_id();
    $textarea = $("textarea#" + dom_id);
    self.source($textarea.val());
    self.editing(false);
    self.not_editing(true);
    window.the_composition.editing_a_line(false);
    window.the_composition.not_editing_a_line(true);
    window.the_composition.last_line_opened = my_model.index();
    window.the_composition.redraw();
    $(".stave_wrapper").enableContextMenu();
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
    var $textarea, dom_id, line, _i, _len, _ref;
    $(".stave_wrapper").disableContextMenu();
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
      line.not_editing(true);
    }
    self.editing(true);
    self.not_editing(false);
    window.the_composition.editing_a_line(true);
    window.the_composition.not_editing_a_line(false);
    window.the_composition.edit_line_open(true);
    dom_id = self.entry_area_id();
    $textarea = $("textarea#" + dom_id);
    self.set_edit_cursor($textarea);
    if (!window.elementInViewport($textarea[0])) {
      $.scrollTo($textarea, 500, {
        offset: -50
      });
    }
    return true;
  };
  self.parsed_line = ko.computed(function() {
    self.source();
    try {
      return DoremiScriptLineParser.parse(self.source());
    } catch (err) {
      self.line_parse_failed(true);
      self.line_has_warnings(false);
      self.line_warnings([]);
      return {};
    }
  });
  self.set_edit_cursor = function($textarea) {
    var column, index, regular_expression_to_find_line_with_barline, result, source, where;
    if (!($textarea != null)) {
      return;
    }
    source = self.source();
    regular_expression_to_find_line_with_barline = /^.*\|.*$/m;
    result = source.match(regular_expression_to_find_line_with_barline);
    index = 0;
    if (result) {
      index = result.index;
    }
    if (typeof event !== "undefined" && event !== null) {
      column = $(event.srcElement).data("column");
    }
    if (!(column != null) && (result != null)) {
      where = index + result.input.length;
    } else {
      where = index + column + 1;
    }
    $textarea.select_range(where, where);
    return null;
  };
  self.entry_area_id = ko.observable("entry_area_" + unique_id);
  self.stave_id = ko.observable("stave_" + unique_id);
  self.context_menu_id = ko.observable("context_menu_" + unique_id);
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

handleFileSelect = function(evt) {
  var file, reader, x;
  if (debug) {
    console.log("handle_file_select");
  }
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
    if (debug) {
      console.log("onload");
    }
    $('#file').val('');
    window.the_composition.last_doremi_source = new Date().getTime();
    window.the_composition.my_init(evt.target.result);
    window.the_composition.editing_composition(true);
    window.the_composition.open_file_visible(false);
    window.the_composition.help_visible(false);
    return window.the_composition.composition_info_visible(false);
  };
  return reader.readAsText(file, "");
};

document.getElementById('file').addEventListener('change', handleFileSelect, false);
