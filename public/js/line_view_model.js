var Logger, debug, handleFileSelect, unique_id;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
debug = false;
unique_id = 1000;
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
  self.close_edit = function(my_model, event) {
    var index;
    index = my_model.index();
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
    var $textarea, dom_id, line, selector, val, _i, _len, _ref;
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
    if (debug) {
      console.log("dom_id is " + dom_id);
    }
    $("textarea#" + dom_id).focus();
    val = self.source();
    selector = "textarea#" + dom_id;
    $textarea = $(selector);
    $textarea.select_range(val.length, val.length);
    if (!window.elementInViewport($textarea[0])) {
      $.scrollTo($textarea, 500, {
        offset: -50
      });
    }
    return true;
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
handleFileSelect = __bind(function(evt) {
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
}, this);
document.getElementById('file').addEventListener('change', handleFileSelect, false);