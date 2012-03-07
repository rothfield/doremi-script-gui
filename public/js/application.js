$(document).ready(function() {
  var app, debug, initialData, setup_downloadify;
  debug = false;
  window.doremi_script_gui_app = {};
  app = window.doremi_script_gui_app;
  app.setup_context_menu = function() {
    var composition, fun;
    composition = app.the_composition;
    if (composition.disable_context_menu()) {
      return false;
    }
    if (debug) {
      console.log('setup_context_menu');
    }
    fun = function(action, el, pos) {
      var found, line, _i, _len, _ref;
      found = null;
      _ref = app.the_composition.lines();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line.stave_id() === $(el).attr('id')) {
          found = line;
        }
      }
      if (debug) {
        console.log(action, el, pos);
      }
      if (debug) {
        console.log("found is", found);
      }
      if (action === "delete") {
        if (confirm("Are you sure you want to delete this line:\n\n" + (found.source()) + "?")) {
          app.the_composition.delete_line(found);
        }
        return;
      }
      if (action === "edit") {
        found.edit();
        return;
      }
      if (action === "insert") {
        app.the_composition.composition_insert_line(found);
        return;
      }
      if (action === "append") {
        app.the_composition.composition_append_line(found);
      }
    };
    return $(".stave_wrapper").contextMenu({
      menu: 'my_menu'
    }, fun);
  };
  app.sanitize = function(name) {
    return name.replace(/[^0-9A-Za-z.\-]/g, '_').toLowerCase();
  };
  setup_downloadify = function() {
    if (debug) {
      console.log("entering setup_downloadify");
    }
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
      swf: './js/downloadify/downloadify.swf',
      downloadImage: './images/save.png',
      height: 19,
      width: 76,
      transparent: false,
      append: false,
      onComplete: function() {
        return alert("Your file was saved");
      }
    };
    app.params_for_download_sargam = _.clone(app.params_for_download_lilypond);
    app.params_for_download_sargam.data = function() {
      if (app.the_composition.composition_parse_failed()) {
        alert("Please fix errors before saving");
        return "";
      }
      return app.the_composition.doremi_source();
    };
    app.params_for_download_sargam.onError = function() {};
    app.params_for_download_sargam.filename = function() {
      return "" + (app.sanitize(app.the_composition.title())) + ".doremi_script.txt";
    };
    $("#download_lilypond").downloadify(app.params_for_download_lilypond);
    return $("#save").downloadify(app.params_for_download_sargam);
  };
  initialData = "Title: testing\nAuthor: anon\nApplyHyphenatedLyrics: true\nmany words aren't hyphenated\n\n| SRG- m-m-\n. \n\n|PDNS";
  initialData = "";
  debug = false;
  app.message_box = function(str) {
    return alert(str);
  };
  app.full_url_helper = function(fname) {
    var loc;
    loc = document.location;
    return "" + loc.protocol + "//" + loc.host + fname;
  };
  window.the_composition = new CompositionViewModel();
  app.the_composition = window.the_composition;
  window.the_composition.help_visible(false);
  ko.applyBindings(window.the_composition, $('html')[0]);
  $(window).resize(function() {
    console.log("resize");
    window.the_composition.composition_stave_width(window.the_composition.calculate_stave_width());
    return window.the_composition.composition_textarea_width(window.the_composition.calculate_textarea_width());
  });
  setup_downloadify();
  $('#composition_title').focus();
  console.log("before get_css");
  app.the_composition.get_application_css();
  app.the_composition.get_styles_css();
  app.the_composition.get_doremi_css();
  app.the_composition.get_zepto();
  return app.the_composition.get_dom_fixer();
});