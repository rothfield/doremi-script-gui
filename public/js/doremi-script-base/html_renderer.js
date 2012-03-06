(function() {
  var class_for_octave, draw_attributes, draw_beat, draw_item, draw_line, draw_lower_octave_symbol, draw_lyrics_section, draw_measure, draw_ornament, draw_ornament_item, draw_pitch, draw_pitch_sign, draw_syllable, draw_upper_octave_symbol, id_ctr, last_slur_id, line_to_html, lookup_html_entity, lookup_simple, root, to_html, to_html_doc;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  id_ctr = new Date().getTime() - 1326011100000;
  last_slur_id = -1;
  lookup_simple = function(str) {
    var LOOKUP;
    LOOKUP = {
      "b": "b",
      "#": "#",
      ".": "&bull;",
      "*": "&bull;",
      "|:": "|:",
      "~": "~",
      ":|": ":|",
      "|": "|",
      "||": "||",
      "%": "%",
      "|]": "|",
      "[|": "|"
    };
    return LOOKUP[str];
  };
  lookup_html_entity = function(str) {
    var LOOKUP;
    LOOKUP = {
      "b": "&#9837;",
      "#": "&#9839;",
      ".": "&bull;",
      "*": "&bull;",
      "|:": "&#x1d106",
      "~": "&#x1D19D&#x1D19D",
      ":|": "&#x1d107",
      "|": "&#x1d100",
      "||": "&#x1d101",
      "%": "&#x1d10E",
      "|]": "&#x1d102",
      "[|": "&#x1d103"
    };
    return LOOKUP[str];
  };
  draw_lyrics_section = function(lyrics_section) {
    var without_dashes;
    without_dashes = lyrics_section.source.replace(/-/g, '');
    return "<div title='Lyrics Section' class='stave lyrics_section'>" + without_dashes + "</div>";
  };
  draw_line = function(line) {
    var item, x;
    if (line.my_type === 'lyrics_section') {
      return draw_lyrics_section(line);
    }
    x = ((function() {
      var _i, _len, _ref, _results;
      _ref = line.items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(draw_item(item));
      }
      return _results;
    })()).join('');
    return "<div class='stave sargam_line'>" + x + "</div>";
  };
  draw_measure = function(measure) {
    var item;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = measure.items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(draw_item(item));
      }
      return _results;
    })()).join('');
  };
  draw_upper_octave_symbol = function(item) {
    var bull, upper_sym;
    if (!(item.octave != null)) {
      return "";
    }
    if (item.octave === 0) {
      return "";
    }
    bull = lookup_html_entity(".");
    if (item.octave < 1) {
      return "";
    }
    if (item.octave > 2) {
      return "";
    }
    if (item.octave === 1) {
      upper_sym = bull;
    }
    if (item.octave === 2) {
      upper_sym = ":";
    }
    return "<span class=\"" + (class_for_octave(item.octave)) + " upper_octave_indicator\">" + upper_sym + "</span>";
  };
  draw_syllable = function(item) {
    if (!(item.syllable != null)) {
      return '';
    }
    if (item.syllable === '') {
      return '';
    }
    return "<span class=\"syllable\">" + item.syllable + "</span>";
  };
  draw_lower_octave_symbol = function(item) {
    var bull, lower_sym;
    if (!(item.octave != null)) {
      return "";
    }
    if (item.octave === 0) {
      return "";
    }
    if (item.octave > -1) {
      return "";
    }
    if (item.octave < -2) {
      return "";
    }
    bull = lookup_html_entity(".");
    if (item.octave === -1) {
      lower_sym = bull;
    }
    if (item.octave === -2) {
      lower_sym = ":";
    }
    return "<span class=\"" + (class_for_octave(item.octave)) + "\">" + lower_sym + "</span>";
  };
  class_for_octave = function(octave_num) {
    if (!(octave_num != null)) {
      return "octave0";
    }
    if (octave_num < 0) {
      return "lower_octave_" + (octave_num * -1);
    }
    if (octave_num > 0) {
      return "upper_octave_" + octave_num;
    }
    return "octave0";
  };
  draw_ornament_item = function(item) {
    return "<span class=\"ornament_item " + (class_for_octave(item.octave)) + "\">" + item.source + "</span>";
  };
  draw_ornament = function(ornament) {
    var orn_item, x;
    x = ((function() {
      var _i, _len, _ref, _results;
      _ref = ornament.ornament_items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        orn_item = _ref[_i];
        _results.push(draw_ornament_item(orn_item));
      }
      return _results;
    })()).join('');
    id_ctr++;
    return "<span id=\"" + id_ctr + "\" class=\"upper_attribute ornament placement_" + ornament.placement + "\">" + x + "</span>";
  };
  draw_pitch_sign = function(my_source) {
    var simple, snip;
    snip = "";
    if (my_source.length === 1) {
      snip = "";
    }
    if (my_source[1] === "#") {
      simple = lookup_simple("#");
      my_source = my_source[0];
      snip = "<span data-fallback-if-no-utf8-chars='" + simple + "' class='pitch_sign sharp'>" + (lookup_html_entity('#')) + "</span>";
    }
    if (my_source[1] === "b") {
      my_source = my_source[0];
      simple = lookup_simple("b");
      snip = "<span data-fallback-if-no-utf8-chars='" + simple + "' class='pitch_sign flat'>" + (lookup_html_entity('b')) + "</span>";
    }
    return [snip, my_source];
  };
  draw_pitch = function(pitch) {
    var attribute, data1, has_pitch_sign, lower_octave_symbol_html, my_source, pitch_sign, syl_html, title, upper_attributes_html, upper_octave_symbol_html, _ref;
    my_source = pitch.source;
    if (pitch.pitch_source != null) {
      my_source = pitch.pitch_source;
    }
    title = "";
    if (pitch.numerator != null) {
      title = "" + pitch.numerator + "/" + pitch.denominator + " of a beat";
    }
    _ref = draw_pitch_sign(my_source), pitch_sign = _ref[0], my_source = _ref[1];
    has_pitch_sign = (pitch_sign !== '' ? "has_pitch_sign" : "");
    upper_octave_symbol_html = draw_upper_octave_symbol(pitch);
    lower_octave_symbol_html = draw_lower_octave_symbol(pitch);
    syl_html = draw_syllable(pitch);
    upper_attributes_html = "";
    data1 = "";
    if (pitch.attributes) {
      upper_attributes_html = ((function() {
        var _i, _len, _ref2, _results;
        _ref2 = pitch.attributes;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          attribute = _ref2[_i];
          _results.push(__bind(function(attribute) {
            var data, my_item, my_source2, simple;
            if (attribute.my_type === "upper_octave_indicator") {
              return "";
            }
            if (attribute.my_type === "begin_slur") {
              id_ctr++;
              last_slur_id = id_ctr;
              return "<span id=\"" + id_ctr + "\" class=\"slur\">&nbsp;&nbsp;</span>";
            }
            if (attribute.my_type === "end_slur") {
              data1 = "data-begin-slur-id='" + last_slur_id + "'";
              return "";
            }
            if (attribute.my_type === "ornament") {
              return draw_ornament(attribute);
            }
            my_item = attribute;
            my_source2 = lookup_html_entity(my_item.source);
            data = "";
            simple = lookup_simple(my_item.source);
            if (my_source2 != null) {
              data = "data-fallback-if-no-utf8-chars='" + simple + "'";
            }
            if (!my_source2) {
              my_source2 = my_item.source;
            }
            return "<span " + data + " class=\"upper_attribute " + my_item.my_type + "\">" + my_source2 + "</span>";
          }, this)(attribute));
        }
        return _results;
      }).call(this)).join('');
    }
    return "<span title=\"" + title + "\" class=\"note_wrapper\" " + data1 + ">" + upper_attributes_html + upper_octave_symbol_html + lower_octave_symbol_html + syl_html + pitch_sign + "<span class=\"note " + has_pitch_sign + " " + pitch.my_type + "\">" + my_source + "</span></span>";
  };
  draw_item = function(item) {
    var attribute, data1, fallback, my_source, simple, source2, title, upper_attributes_html;
    if (item.my_type === "pitch") {
      return draw_pitch(item);
    }
    if (item.my_type === "begin_beat") {
      return "";
    }
    if (item.my_type === "end_beat") {
      return "";
    }
    if (item.my_type === "beat") {
      return draw_beat(item);
    }
    if (item.my_type === "measure") {
      return draw_measure(item);
    }
    my_source = "";
    source2 = lookup_html_entity(item.source);
    fallback = "";
    if (source2 != null) {
      simple = lookup_simple(item.source);
      fallback = "data-fallback-if-no-utf8-chars='" + simple + "'";
    }
    my_source = source2 != null ? source2 : item.source;
    if (item.my_type === "whitespace") {
      my_source = "&nbsp;";
    }
    if (!(my_source != null)) {
      my_source = "";
    }
    title = "";
    upper_attributes_html = "";
    data1 = "";
    if (item.attributes) {
      upper_attributes_html = ((function() {
        var _i, _len, _ref, _results;
        _ref = item.attributes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attribute = _ref[_i];
          _results.push(__bind(function(attribute) {
            var data, my_item, my_source2;
            if (attribute.my_type === "upper_octave_indicator") {
              return "";
            }
            if (attribute.my_type === "begin_slur") {
              console.log("begin slur");
              id_ctr++;
              last_slur_id = id_ctr;
              return "<span id=\"" + id_ctr + "\" class=\"slur\">&nbsp;&nbsp;</span>";
            }
            if (attribute.my_type === "end_slur") {
              data1 = "data-begin-slur-id='" + last_slur_id + "'";
              return "";
            }
            if (attribute.my_type === "ornament") {
              return draw_ornament(attribute);
            }
            my_item = attribute;
            data = "";
            simple = lookup_simple(my_item.source);
            my_source2 = lookup_html_entity(my_item.source);
            if (simple != null) {
              data = "data-fallback-if-no-utf8-chars='" + simple + "'";
            }
            if (!my_source2) {
              my_source2 = my_item.source;
            }
            return "<span " + data + " class=\"upper_attribute " + my_item.my_type + "\">" + my_source2 + "</span>";
          }, this)(attribute));
        }
        return _results;
      }).call(this)).join('');
    }
    return "<span title=\"" + title + "\" class=\"note_wrapper\" " + data1 + ">" + upper_attributes_html + "<span " + fallback + " class=\"note " + item.my_type + "\" >" + my_source + "</span></span>";
  };
  draw_beat = function(beat) {
    var extra, item, looped_class, x;
    looped_class = beat.subdivisions > 1 ? "looped" : "";
    x = ((function() {
      var _i, _len, _ref, _results;
      _ref = beat.items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(draw_item(item));
      }
      return _results;
    })()).join('');
    extra = "";
    if (beat.subdivisions > 1) {
      extra = "data-subdivisions=" + beat.subdivisions + " ";
    }
    return "<span " + extra + "class='beat " + looped_class + "'>" + x + "</span>";
  };
  to_html_doc = function(composition, full_url, css, js) {
    var rendered_composition;
    if (full_url == null) {
      full_url = "http://ragapedia.com";
    }
    if (css == null) {
      css = "";
    }
    if (js == null) {
      js = "";
    }
    rendered_composition = to_html(composition);
    return "<html>\n  <head>\n  <style type=\"text/css\">\n    " + css + "\n  </style>\n    <title>" + composition.title + "</title>\n    <!--\n    <link media=\"all\" type=\"text/css\" href=\"" + full_url + "/css/application.css\" rel=\"stylesheet\">\n     -->\n    <meta content=\"text/html;charset=utf-8\" http-equiv=\"Content-Type\">\n  </head>\n<body>\n  <div id=\"rendered_sargam\">\n    " + rendered_composition + "\n  </div>\n<span id=\"testing_utf_support\" style=\"display:none\" class=\"note left_repeat\">&#x1d106;</span>\n<script type=\"text/javascript\">\n" + js + "\n$(document).ready(function() {\n    return dom_fixes()\n})\n</script>\n<script id=\"source\" type=\"text/html\">\n" + composition.source + "\n</script>\n</body>\n</html>";
  };
  draw_attributes = function(attributes) {
    var attribute, attrs;
    if (!(attributes != null)) {
      return "";
    }
    attrs = ((function() {
      var _i, _len, _ref, _results;
      _ref = attributes.items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attribute = _ref[_i];
        _results.push("<div class=\"attribute\"><span class=\"attribute_key\">" + attribute.key + "\n</span>:<span class=\"attribute_value\">" + attribute.value + "\n</span></div>");
      }
      return _results;
    })()).join('\n');
    return "<div class='attribute_section'>" + attrs + "</div>";
  };
  line_to_html = function(line) {
    return draw_line(line);
  };
  to_html = function(composition) {
    var attrs, item, lines;
    attrs = draw_attributes(composition.attributes);
    lines = ((function() {
      var _i, _len, _ref, _results;
      _ref = composition.lines;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(draw_line(item));
      }
      return _results;
    })()).join('\n');
    return "<div class='composition'>" + attrs + lines + "</div>";
  };
  root.to_html = to_html;
  root.line_to_html = line_to_html;
  root.to_html_doc = to_html_doc;
}).call(this);
