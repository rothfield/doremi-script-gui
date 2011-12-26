(function() {
  var Logger, contains_word_helper, debug, parser, root, sys, test_to_musicxml, to_musicxml, utils, _;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  debug = false;
  if (typeof global !== "undefined" && global !== null) {
    global._console || (global._console = require('./underscore.logger.js'));
  }
  Logger = global._console.constructor;
  if (typeof require !== "undefined" && require !== null) {
    _ = require("underscore")._;
  }
  require('./doremi_script_parser.js');
  sys = require('util');
  utils = require('./tree_iterators.js');
  _console.level = Logger.INFO;
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
  to_musicxml = require('./to_musicxml.js').to_musicxml;
  parser = DoremiScriptParser;
  test_to_musicxml = function(str, test, msg) {
    var composition;
    if (msg == null) {
      msg = "";
    }
    composition = parser.parse(str);
    _.debug("test_to_musicxml:composition is " + composition);
    composition.source = str;
    _.debug("test_to_musicxml, str is \n" + str + "\n");
    return to_musicxml(composition);
  };
  exports.ztest_single_note = function(test) {
    var input, musicxml, words;
    input = "S";
    musicxml = test_to_musicxml(input, test);
    "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n                <!DOCTYPE score-partwise PUBLIC\n    \"-//Recordare//DTD MusicXML 3.0 Partwise//EN\"\n    \"http://www.musicxml.org/dtds/partwise.dtd\">\n                        <score-partwise version=\"3.0\">\n            <score-header>\n<work>\n  <work-number></work-number>\n    <work-title>null</work-title>\n    </work>\n\n            </score-header>\n\n  <part-list>\n    <score-part id=\"P1\">\n      <part-name>Music</part-name>\n    </score-part>\n  </part-list>\n  <part id=\"P1\">\n   \n<measure number=\"1\">\n    <attributes>\n    <divisions>1</divisions>\n    <key>\n      <fifths>0</fifths>\n    </key>\n    <clef>\n  <sign>C</sign>\n  <line>2</line>\n</clef>\n    <time>\n      <beats>4</beats>\n      <beat-type>4</beat-type>\n    </time>\n  </attributes>\n  <note>\n    <pitch>\n      <step>C</step>\n      <octave>4</octave>\n    </pitch>\n    <duration>4</duration>\n    <type>whole</type>\n  </note>\n</measure>\n  </part>\n</score-partwise>\n";
    words = ["score-partwise", "</score-partwise>", "<part id=", "</part>", "<note>", "</note"];
    contains_word_helper(test, input, musicxml, words);
    return test.done();
  };
  exports.test_title = function(test) {
    var input, musicxml, title;
    title = "The Entertainer";
    input = "Title: " + title + "\n\n\nS";
    musicxml = test_to_musicxml(input, test);
    contains_word_helper(test, input, musicxml, [title]);
    return test.done();
  };
  contains_word_helper = function(test, input, musicxml, words) {
    var failure_msg, msg, success_msg, word, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = words.length; _i < _len; _i++) {
      word = words[_i];
      msg = "" + input + " --> (musicxml output) should include " + word;
      failure_msg = "" + msg + "\n output was:\n" + musicxml;
      success_msg = "✔ " + msg;
      test.ok(musicxml.indexOf(word) > -1, failure_msg);
      _results.push(console.log(success_msg));
    }
    return _results;
  };
  exports.test_pitches = function(test) {
    var find, input, list, musicxml, words, x;
    input = "SRGmPDN";
    find = "CDEFGAB";
    input = "S";
    find = "C";
    list = find.split('');
    words = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        x = list[_i];
        _results.push("<step>" + x + "</step>");
      }
      return _results;
    })();
    musicxml = test_to_musicxml(input, test);
    contains_word_helper(test, input, musicxml, words);
    return test.done();
  };
}).call(this);
