(function() {
  var Logger, aux1, debug, first_line, first_sargam_line, my_inspect, parse_without_reporting_error, parser, root, should_not_parse, sys, test_parses, utils, _;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  debug = false;
  if (typeof global !== "undefined" && global !== null) {
    global._console || (global._console = require('./underscore.logger.js'));
  }
  Logger = global._console.constructor;
  _console.level = Logger.INFO;
  if (typeof require !== "undefined" && require !== null) {
    _ = require("underscore")._;
  }
  require('./doremi_script_parser.js');
  sys = require('util');
  utils = require('./tree_iterators.js');
  _.mixin(_console.toObject());
  _.mixin({
  each_slice: function(obj, slice_size, iterator, context) {
    var collection = obj.map(function(item) { return item; });
    
    if (typeof collection.slice !== 'undefined') {
      for (var i = 0, s = Math.ceil(collection.length/slice_size); i < s; i++) {
        iterator.call(context, _(collection).slice(i*slice_size, (i*slice_size)+slice_size), obj);
      }
    }
    return; 
  }
});;
  my_inspect = function(x) {
    var arg, _i, _len, _results;
    if (!(debug != null)) {
      return;
    }
    console.log("debug is " + debug);
    if (!debug) {
      return;
    }
    if (!(typeof JSON !== "undefined" && JSON !== null)) {
      return;
    }
    _results = [];
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      _results.push(console.log(JSON.stringify(arg, null, " ")));
    }
    return _results;
  };
  _.mixin({
    my_inspect: my_inspect
  });
  parser = DoremiScriptParser;
  aux1 = function(str, result) {
    if (!sys) {
      return;
    }
    _.debug("Result of parsing <<" + str + ">> is");
    return _.debug(sys.inspect(result, true, null));
  };
  should_not_parse = function(str, test, msg) {
    _.debug(str);
    _.debug("Testing that <<" + str + ">> does NOT parse");
    return test.throws((function() {
      return parser.parse(str);
    }), "<<\n" + str + "\n>> should not parse!. " + msg);
  };
  parse_without_reporting_error = function(str) {
    _.debug("Entering parse_without_reporting_error");
    _.debug("Parsing <<\n" + str + ">>");
    try {
      return parser.parse(str);
    } catch (error) {
      return _.debug("Didn't parse");
    }
  };
  first_sargam_line = function(composition_data) {
    return composition_data.lines[0];
  };
  first_line = function(composition_data) {
    return composition_data.lines[0];
  };
  test_parses = function(str, test, msg) {
    var composition;
    if (msg == null) {
      msg = "";
    }
    _.debug("Entering test_parses, str is " + str);
    composition = parser.parse(str);
    _.debug("in test_parses,composition is " + composition);
    return composition;
    /*
      test.doesNotThrow(-> result=parser.parse(str))
      test.ok(result?,"didn't parse")
      _.debug(sys.inspect(result,false,null))
      */
  };
  exports.test_bad_input = function(test) {
    var str;
    str = ':';
    should_not_parse(str, test);
    return test.done();
  };
  exports.test_does_not_accept_single_barline = function(test) {
    var str;
    str = '|';
    should_not_parse(str, test);
    return test.done();
  };
  exports.test_accepts_various_eols = function(test) {
    var str, _i, _len, _ref;
    _ref = ["| SS\n\n| RR", "| SS\r\r | SS", "| SS\r\n\n| RR", "| SS\n\r| SS"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      str = _ref[_i];
      test_parses(str, test);
    }
    return test.done();
  };
  exports.test_does_not_accepts_single_left_repeat = function(test) {
    var str;
    str = '|:';
    should_not_parse(str, test);
    return test.done();
  };
  exports.test_accepts_five_octaves_of_chromatic_notes = function(test) {
    var str;
    str = '                                                      .  .... .... .... : \n1) SrRg GmMP dDnN S | SrRg GmMP dDnN S | SrRg GmMP dDnN S| SrRg GmMP dDnN S |\n   :::: :::: :::: .   .... .... ....\n\n                     .  .... .... .... :   :::: :::: ::::\n2)  | SrRg GmMP dDnN S| SrRg GmMP dDnN S | SrRg GmMP dDnN ---- |';
    test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_right_repeat = function(test) {
    var str;
    str = '|: :|';
    test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_chords = function(test) {
    var str;
    str = ' V  i IVm\n|SR\n';
    test_parses(str, test);
    return test.done();
  };
  exports.test_eof_ends_beat = function(test) {
    var composition, line, measure, second_item, str;
    str = '|SR';
    composition = test_parses(str, test);
    _.debug(composition);
    line = first_sargam_line(composition);
    measure = line.items[0];
    second_item = measure.items[1];
    _.debug(second_item);
    test.equal(second_item.my_type, "beat", "second item of " + str + " should be a beat containing SR");
    test.equal(second_item.subdivisions, 2);
    return test.done();
  };
  exports.test_barline_ends_beat = function(test) {
    var composition, line, measure, second_item, str;
    str = '|SR|S';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    measure = line.items[0];
    second_item = measure.items[1];
    _.debug(second_item);
    test.equal(second_item.my_type, "beat", "second item of " + str + " should be a beat containing SR");
    test.equal(second_item.subdivisions, 2);
    return test.done();
  };
  exports.test_dashes_inside_beat = function(test) {
    var composition, line, measure, second_item, str, x;
    str = '|S--R|';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    measure = line.items[0];
    second_item = measure.items[1];
    _.debug(second_item);
    test.equal(second_item.my_type, "beat", "second item of " + str + " should be a beat containing S--R");
    test.equal(second_item.subdivisions, x = 4, "subdivisions of beat " + str + " should be " + x);
    return test.done();
  };
  exports.test_lines = function(test) {
    var composition, second_item, str, third_item;
    str = '| S- |\n\n';
    composition = test_parses(str, test);
    _.debug(composition);
    test.done();
    return;
    second_item = composition.lines[0].items[1];
    _.debug(second_item);
    test.equal(second_item.my_type, "beat", "second item of " + str + " should be a beat");
    test.equal(second_item.items.length, 2, "the beat's length should be 2");
    test.equal(second_item.items[0].my_type, "dash", "dash should be first item");
    third_item = composition.lines[0].items[2];
    _.debug(third_item);
    test.equal(third_item.my_type, "barline", "third item of " + str + " should be a barline");
    return test.done();
  };
  exports.test_dash_starts_beat = function(test) {
    var composition, line, measure, second_item, str;
    str = '|-R|';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    measure = line.items[0];
    second_item = measure.items[1];
    _.debug(second_item);
    test.equal(second_item.my_type, "beat", "second item of " + str + " should be a beat");
    test.equal(second_item.items.length, 2, "the beat's length should be 2");
    test.equal(second_item.items[0].my_type, "dash", "dash should be first item");
    return test.done();
  };
  exports.test_recognizes_upper_octave_line = function(test) {
    var composition, str;
    str = ' .:~*\n|SRGR';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_recognizes_lower_octave_line = function(test) {
    var composition, str;
    str = '|SRG  R\n .:   *';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_stray_right_slur_doesnt_parse = function(test) {
    var composition, str;
    str = '| (S  R  )\n  .\n';
    composition = should_not_parse(str, test);
    return test.done();
  };
  exports.test_stray_left_slur_doesnt_parse = function(test) {
    var composition, str;
    str = '| ( S  R)\n  .\n';
    composition = should_not_parse(str, test);
    return test.done();
  };
  exports.test_recognizes_slurs = function(test) {
    var composition, str;
    str = '| (S  R)\n .\n';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_delimited_beat = function(test) {
    var composition, str;
    str = '| <SR>\n';
    composition = test_parses(str, test);
    _.debug(composition);
    return test.done();
  };
  exports.test_accepts_spaces_in_delimited_beat = function(test) {
    var composition, str;
    str = '| <S R>\n';
    composition = test_parses(str, test);
    _.debug(composition);
    return test.done();
  };
  exports.test_accepts_delimited_beat = function(test) {
    var composition, str;
    str = '| <SR>\n';
    composition = test_parses(str, test);
    _.debug(composition);
    return test.done();
  };
  exports.test_recognizes_ornament_symbol = function(test) {
    var composition, str;
    str = '  ~\n| S  R';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_attributes = function(test) {
    var composition, str;
    str = 'Rag:Bhairavi\n\n| SRG';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_line_can_come_right_after_header_line = function(test) {
    var composition, str;
    str = 'Rag:Kafi\n  | S';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_leading_spaces_in_upper_octave_line = function(test) {
    var composition, str;
    str = 'Rag:Kafi\n\n          .\n|   SRGmPDNS';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_leading_spaces_in_sargam_line = function(test) {
    var composition, str;
    str = 'Rag:Kafi\n\n|   Sr';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_gives_warning_if_misplaced_upper_octave_indicator = function(test) {
    var composition, str, z;
    str = 'Rag:Kafi\n  .\n|   r';
    composition = test_parses(str, test);
    test.ok(composition.warnings.length > 0, "expected warnings");
    test.ok(composition.warnings[0].indexOf(z = "upper_octave_indicator") > -1, "Expected warning to include " + z + ". Warning was " + composition.warnings[0]);
    return test.done();
  };
  exports.test_gives_warning_if_unmatched_parens_for_slurs = function(test) {
    var composition, str, z;
    str = '| (Pm';
    composition = test_parses(str, test);
    test.ok(composition.warnings.length > 0, "expected warnings");
    test.ok(composition.warnings[0].indexOf(z = "unbalanced parens") > -1, "Expected warning to include " + z + ". Warning was " + composition.warnings[0]);
    return test.done();
  };
  exports.test_syllable_assigned_using_melismas = function(test) {
    var composition, line, my_pitch, str;
    str = '| (SR G)m P\nhe-llo     john \n';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    my_pitch = utils.tree_find(line, function(item) {
      return item.syllable === "llo";
    });
    test.equal("m", my_pitch.source);
    my_pitch = utils.tree_find(line, function(item) {
      return item.source === "R";
    });
    test.ok(!(my_pitch.syllable != null), "R is part of a slur SRG an should not be assigned a syllable");
    return test.done();
  };
  exports.test_upper_octave_assigned_to_note_below_it = function(test) {
    var composition, ga, ma, re, sa, str;
    str = '  .*::\n| Srgm';
    composition = test_parses(str, test);
    sa = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "S";
    });
    re = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "r";
    });
    ga = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "g";
    });
    ma = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "m";
    });
    test.equal(sa.octave, 1, "" + str + " should have octave 1 for S");
    test.equal(re.octave, 1, "" + str + " should have octave 1 for r");
    test.equal(ga.octave, 2, "" + str + " should have octave 1 for g");
    test.equal(ma.octave, 2, "" + str + " should have octave 1 for m");
    return test.done();
  };
  exports.test_recognizes_ornament_to_right_of_pitch2 = function(test) {
    var composition, item, orn, str;
    str = ' DSnDn\nn---';
    composition = test_parses(str, test);
    item = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "n";
    });
    orn = _.detect(item.attributes, function(attr) {
      return attr.my_type === "ornament";
    });
    _.debug("orn " + orn.my_inspect);
    test.ok(orn);
    test.ok(orn.source === "DSnDn");
    return test.done();
  };
  exports.test_recognizes_ornament_to_right_of_pitch = function(test) {
    var composition, item, orn, str;
    str = '   NRSNS  \n| S';
    composition = test_parses(str, test);
    item = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "S";
    });
    orn = _.detect(item.attributes, function(attr) {
      return attr.my_type === "ornament";
    });
    _.debug("orn " + orn.my_inspect);
    test.ok(orn);
    test.ok(orn.source === "NRSNS");
    return test.done();
  };
  exports.test_lower_octave_assigned_to_note_above_it = function(test) {
    var composition, ga, ma, re, sa, str;
    str = '|Srgm\n .*::';
    composition = test_parses(str, test);
    sa = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "S";
    });
    re = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "r";
    });
    ga = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "g";
    });
    ma = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "m";
    });
    test.equal(sa.octave, -1, "" + str + " should have octave -1 for S");
    test.equal(re.octave, -1, "" + str + " should have octave -1 for r");
    test.equal(ga.octave, -2, "" + str + " should have octave -2 for g");
    test.equal(ma.octave, -2, "" + str + " should have octave -2 for m");
    return test.done();
  };
  exports.test_all = function(test) {
    var composition, first_sargam_source, line, str, strzz, x;
    x = 'dog';
    _.debug("x=" + x);
    str = 'Rag:Bhairavi\nTal:Tintal\nTitle:Bansuri\nSource:AAK\n\n          3                   +            2         .\n1) |: (Sr | n) S   (gm Pd) || P - P  P   | P - D  <(nDSn)> |\n            .\n       ban-    su-  ri        ba- ja ra-   hi  dhu- na\n\n0                 3                     +     .    *  .\n| P  d   P   d    | <(Pm>   PmnP) (g m) || PdnS -- g  S |\n  ma-dhu-ra  kan-     nai-         ya      khe-    la-ta\n\n2              0     ~\n|  d-Pm g P  m | r - S :| %\n   ga-    wa-ta  ho- ri\n\n     +                     2    0     3\n2)  [| Srgm PdnS SndP mgrS | %    | %   | S--S --S- ---- R-G-     |]\n';
    strzz = 'Rag:Bhairavi\nTal:Tintal\nTitle:Bansuri\nSource:AAK\n\n          3                   +            2         .\n1) |: (Sr | n) S   (gm Pd) || P - P  P   | P - D  <(nDSn)> |\n            .\n       ban-    su-  ri        ba- ja ra-   hi  dhu- na\n0                 3                     +     .    *  .\n| P  d   P   d    | <(Pm>   PmnP) (g m) || PdnS -- g  S |\n  ma-dhu-ra  kan-     nai-         ya      khe-    la-ta\n\n2              0     ~\n|  d-Pm g P  m | r - S :| %\n   ga-    wa-ta  ho- ri\n\n     +                     2    0     3\n2)  [| Srgm PdnS SndP mgrS | %    | %   | S--S --S- ---- R-G-     |]';
    composition = test_parses(str, test);
    first_sargam_source = str.split('\n')[6];
    line = first_sargam_line(composition);
    test.equal(line.source, first_sargam_source, "sanity check, expected first line's source to be " + first_sargam_source);
    return test.done();
  };
  exports.test_parses_measure_at_beginning_of_line = function(test) {
    var composition, measure, str;
    str = 'Sr\nban-';
    str = '|Sr\n ban-';
    composition = test_parses(str, test);
    measure = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "measure";
    });
    test.equal(measure.items[1].my_type, "beat", "<<" + str + ">> should be parsed as a measure with beat " + str);
    return test.done();
  };
  exports.test_parses_lyrics_line_without_leading_and_trailing_spaces = function(test) {
    var composition, str;
    str = '|Srgm|  S\n he-llo john';
    composition = test_parses(str, test);
    return test.done();
    /*
      test.equal(lyrics.items[0].source,"he-","he- source should be he-")
      test.equal(lyrics.items[0].syllable,"he-","he- should be parsed as a syllable")
      test.equal(lyrics.items[1].syllable,"llo","llo should be parsed as a syllable")
      
      test.equal(lyrics.items[1].source,"llo","source for syllable should NOT include trailing white space!")
      test.equal(lyrics.items[3].source,"john","source for john should john")
      test.equal(lyrics.items[3].syllable,"john","john should be parsed as a syllable")
      aux1(str,composition)
      test.done()
      */
  };
  exports.test_collects_sargam_line_source = function(test) {
    var composition, expect, str;
    str = '|Sr  g    m    |';
    composition = test_parses(str, test);
    expect = "|Sr  g    m    |";
    test.equal(first_sargam_line(composition).source, "|Sr  g    m    |", "should collect source, expected " + expect + " . Note that eol is not included");
    return test.done();
  };
  exports.test_parses_lyrics_line_with_leading_and_trailing_spaces = function(test) {
    var composition, first, str;
    str = '|Sr  g    m    |\n he- llo  john   ';
    /*
      Note that whitespace is included.
      lyric items are parsed something like:
         items: 
                 [ { my_type: 'whitespace', source: ' ' },
                   { my_type: 'syllable', syllable: 'he-', source: 'he-' },
                   { my_type: 'whitespace', source: ' ' },
                   { my_type: 'syllable', syllable: 'llo', source: 'llo' },
                   { my_type: 'whitespace', source: '  ' },
                   { my_type: 'syllable',
                     syllable: 'john',
                     source: 'john' },
                   { my_type: 'whitespace', source: '   ' } ] 
       */
    composition = test_parses(str, test);
    test.ok(composition.lines != null, "parsed composition should have a lines attribute");
    test.equal(composition.lines.length, 1, "<<\n" + str + "\n>> should have 1 line");
    first = first_line(composition);
    return test.done();
  };
  exports.test_column_assignment = function(test) {
    var composition, my_pitch, str;
    str = '|Sr';
    composition = test_parses(str, test);
    my_pitch = utils.tree_find(composition.lines[0], function(item) {
      return item.source === "S";
    });
    test.equal(1, my_pitch.column);
    return test.done();
  };
  exports.test_parses_lines = function(test) {
    var composition, str;
    str = '|S\n\n|R';
    composition = test_parses(str, test);
    _.debug("test_parses_lines, after test_parses");
    _.debug(composition.toString());
    _.debug("z");
    test.ok(composition.lines != null, "parsed composition should have a lines attribute");
    test.equal(composition.lines.length, 2, "Should have 2 lines");
    aux1(str, composition);
    return test.done();
  };
  exports.test_position_counting = function(test) {
    var composition, str;
    str = '|Sr';
    composition = test_parses(str, test);
    aux1(str, composition);
    return test.done();
  };
  /*
  [ { my_type: 'sargam_line',
      items: 
           [ { my_type: 'pitch', source: 'S', octave: 0 },
                  { my_type: 'pitch', source: 'r', octave: 0 } ],
                      aux1: 'hi' } ]
  */
  exports.test_accepts_attributes = function(test) {
    var str;
    str = "hi:john\n";
    test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_attributes2 = function(test) {
    var str;
    str = "hi:john\nhi:jane\n";
    test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_attributes3 = function(test) {
    var str;
    str = "hi:john\nhi:jane\n\n\n\n   \n";
    test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_double_barline = function(test) {
    var str;
    str = '|| S';
    test_parses(str, test, "should parse as a single measure with a single S");
    return test.done();
  };
  exports.test_accepts_mordent = function(test) {
    var str;
    str = '  ~\n| S';
    test_parses(str, test);
    return test.done();
  };
  exports.test_parses_one_as_tala = function(test) {
    var composition, line, str, x;
    str = '   1\n|  S';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('tala') > -1, "" + x + " -1st line should have tala object");
    return test.done();
  };
  exports.test_ending_one_dot = function(test) {
    var composition, line, str, x;
    str = '  1.\n| S';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('ending') > -1, "" + x + " -line should have ending object");
    return test.done();
  };
  exports.test_chord_iv = function(test) {
    var composition, line, str, x;
    str = '  iv\n| S';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('chord_symbol') > -1, "" + x + " -line should have chord object");
    return test.done();
  };
  exports.test_ending_one_dot_underscores = function(test) {
    var composition, line, str, x;
    str = '  1.__\n| S';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('ending') > -1, "" + x + " -line should have ending object");
    return test.done();
  };
  exports.test_ending_two_underscores = function(test) {
    var composition, line, str, x;
    str = '  2______\n| S';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('ending') > -1, "" + x + " -line should have ending object");
    return test.done();
  };
  exports.test_tivra_ma_devanagri = function(test) {
    var composition, line, str, x;
    str = '|म\'\n tivrama';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf("source: 'म\\'") > -1, "" + x + " -line should have tivra ma");
    return test.done();
  };
  exports.test_devanagri_and_latin_sargam_together_should_fail = function(test) {
    var composition, str;
    str = '       .\n| सरग़मपधऩस SrRgGmMPdDnN\n  SRGmPDNS';
    composition = should_not_parse(str, test);
    return test.done();
  };
  exports.test_devanagri = function(test) {
    var composition, line, str, x, z;
    str = '       .\nसरग़मपधऩस\nSRGmPDNS';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('स') > -1, "" + x + " -line should have स");
    test.ok(x.indexOf('denominator: 8') > -1, "" + x + " -line should have 8 pitches");
    test.equal(line.kind, z = "devanagri", "line.kind should be " + z);
    return test.done();
  };
  exports.test_kommal_indicator = function(test) {
    var composition, line, str, x;
    str = 'र\n_';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('kommal_indicator') > -1, "" + x + " -line should have kommal indicator");
    return test.done();
  };
  exports.test_abc = function(test) {
    var composition, line, str, x;
    str = 'C#D#F#G#A#B#DbEbGbAbBbCC#DbDD#EbEFF#GbGAbAA#BbBB# ';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    return test.done();
  };
  exports.test_title = function(test) {
    var composition, str;
    str = 'Title: The entertainer \n  \n| S';
    composition = test_parses(str, test);
    test.equal(composition.title, "The entertainer");
    return test.done();
  };
  exports.test_filename = function(test) {
    var composition, str;
    str = 'Filename: the_entertainer \n\n|  S';
    composition = test_parses(str, test);
    test.equal(composition.filename, "the_entertainer");
    return test.done();
  };
  exports.test_empty_lines_with_blanks = function(test) {
    var composition, str;
    str = '    --S- ---- --r-\n \n\n   |         S';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_simple_line = function(test) {
    var composition, str;
    str = "| S\n\n|R\n\n|G\n\n|m";
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_recognizes_number_notation = function(test) {
    var composition, str;
    str = '| 1234567 1#2#3#4#5#6#7#-   1b2b3b4b5b6b7b- \n  hello';
    composition = test_parses(str, test);
    test.equal(composition.lines[0].kind, "number", "should set composition kind to number");
    return test.done();
  };
  exports.test_recognizes_sa = function(test) {
    var composition, str, z;
    str = 'S';
    composition = test_parses(str, test);
    test.equal(composition.lines[0].kind, z = "latin_sargam", "should set composition kind to " + z);
    return test.done();
  };
  exports.test_slurred = function(test) {
    var composition, item, str;
    str = "(SR)";
    str = " SR";
    composition = test_parses(str, test);
    item = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "S";
    });
    test.equal(1, item.column);
    item = utils.tree_find(composition.lines[0], function(item) {
      return item.my_type === "pitch" && item.source === "R";
    });
    test.equal(2, item.column);
    return test.done();
  };
  exports.test_two_blank_lines_case = function(test) {
    var composition, str;
    str = "S\n\n\nR";
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_measure_pitch_durations = function(test) {
    var composition, line, my_pitch, str;
    str = '--S- ---- --r-';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    my_pitch = utils.tree_find(line, function(item) {
      return item.source === "S";
    });
    return test.done();
  };
  exports.test_zzz = function(test) {
    var str;
    str = '                    ..\nCDbDEb EFF#G AbABbB CD\n\n            ..\nSrGmMP dDnN SR \n\n            \nसररग़ग़ मम\'पधधऩऩ\n_ _      _ __\n';
    return test.done();
  };
  exports.test_ornament_item = function(test) {
    var composition, str;
    str = "     S\n|(Sr  n)";
    composition = test_parses(str, test, "");
    test.ok((composition.toString()).indexOf("ornament_item") > -1);
    return test.done();
  };
}).call(this);
