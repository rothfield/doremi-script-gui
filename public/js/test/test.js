$(document).ready(function() {
  var generate_staff_notation_aux, helper, hr, html, index, my_escape, parsed, record, recs, str, strzzz, template, test_data, zzstr;
  test_data = [];
  helper = function(doremi_source, comments) {
    var item, md5, result;
    if (comments == null) {
      comments = "";
    }
    md5 = MD5(doremi_source);
    result = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = test_data.length; _i < _len; _i++) {
        item = test_data[_i];
        if (item.md5 === md5) {
          _results.push(item);
        }
      }
      return _results;
    })();
    if (result.length > 0) {
      alert("duplicate source " + test_data.length + ": " + doremi_source);
    }
    return test_data.push({
      md5: md5,
      id: "test_" + test_data.length,
      doremi_source: doremi_source,
      comments: comments
    });
  };
  helper("| S-S-S- | ", "Should result in triplet");
  helper("| S-S-S- SSS S--S--S-- S---S---S---  | ", "Different ways of writing triplets. Should all result in same staff notation. 1/3 === 2/6== 3/9 == 4/12");
  str = 'Key: F \nMode: Major\n\nGeorgia georgia no peace I find\nJust an\n\n  C          E         Am            F   Fm\n| E G - -  | E D - - | -- EA -- ED | - - - CD | \n';
  zzstr = 'Key: F\nMode: Ionian\n\nGeorgia georgia no peace I find\nJust an\n  C          E         Am            F   Fm\n| E G - -  | E D - - | -- EA -- ED | - - - CD | \n';
  strzzz = '| E G - -  | E D - - | -- EA -- ED | - - - CD | \n';
  helper(str, "", "Lead sheet with chord symbols in C");
  helper("Hello world\n\n| (SRG)- R- S  | ", "sargam-with hyphenated lyrics and melisma. Should put he-llo world under proper notes");
  helper("Hello world\n\n| (CDE)- D- C-  | ", "abc-with hyphenated lyrics and melisma. Should put he-llo world under proper notes");
  helper("| S \n  john ", "sargam-with syllable");
  helper("| C \n  john ", "abc-with syllable");
  helper("| म' ", "sharp ma in devenagri (F#) is indicated by tick following ma");
  helper("| र \n  _", "flat second in devanagri (Db) indicated by an underscore");
  helper("| ग़\n  _", "flat third in devanagri (Eb) indicated by an underscore");
  helper("| ध\n  _", "flat sixth in devanagri (Ab) indicated by an underscore");
  helper("| ऩ\n  _", "flat seventh in devanagri (Bb) indicated by an underscore");
  helper("| स \n  john ", "devanagri-with syllable");
  helper("SSS ", "sargam-should generate a triplet");
  helper("CCC ", "abc-should generate a triplet");
  helper("ससस ", "devanagri-should generate a triplet");
  helper("SSSSS", "should generate a quintuplet");
  helper("CCCCC ", "should generate a quintuplet");
  helper("ससससस ", "devanagri-should generate a quintuplet");
  helper("                                   . .\n| SS#rR R#gGm mMPbP P#dDD#  | DnNN S S# S |", "sargam chromatic sargam notes");
  helper("                                        . .\n| CC#DbD D#EbEF FF#GbG G#AbAA# | ABbBB# C C# C |", "abc chromatic sargam notes");
  helper("S");
  helper("C");
  helper("1");
  helper("          . .\n| SRGM PDNS SndP mgrS | ");
  helper("           . .\n| 1234# 5671 1765 4321");
  helper("           . .\n| CDEF# GABC CBbAbG FEbDbC");
  helper("Sr");
  helper("CDb");
  helper("12b");
  helper("Sr-g");
  helper("CDb-Eb");
  helper("12b-3b");
  helper("<S R >");
  helper("<C D >");
  helper("<1 2 >");
  helper("Happy birthday\n\n PP DP\n");
  helper("Key: D\nMode: Major\n\nHappy birthday\n\n PP DP\n");
  helper("   NRSNS\n   .  .\n| S \n", "ornament after main note");
  helper("  SNRSN\n   .  .\n|      S \n", "ornament prior to main note should be slurred");
  helper("    NRSNS\n    .  .\n| (S       N) \n           . ", "ornament after main note, within a slur. Ornament should not be slurred");
  helper("|: S :| ");
  helper("                        1.__        2.___\n|: - - - mm | G S R - | G - - -  :| S - -  |", "endings");
  helper("S - - -", "should generate whole note rather than 4 tied quarters");
  my_escape = function(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };
  generate_staff_notation_aux = function(doremi_source, index, async) {
    var md5, my_data, obj, selector, selector3, timeout_in_seconds, ts, url;
    if (index == null) {
      index = 0;
    }
    if (async == null) {
      async = true;
    }
    md5 = MD5(doremi_source);
    selector = "img#staff_notation_jpg_" + index;
    selector3 = "span#staff_notation_jpg_span_" + index;
    $(selector3).show();
    $(selector).css('visibility', 'hidden');
    if (debug) {
      console.log("generate_staff_notation");
    }
    ts = new Date().getTime();
    url = '/lilypond_server/lilypond_to_jpg';
    timeout_in_seconds = 60;
    my_data = {
      fname: "test_case_" + md5,
      html_doc: "stub",
      doremi_source: doremi_source,
      musicxml_source: "",
      dont_generate_staff_notation: false
    };
    obj = {
      dataType: "json",
      async: async,
      timeout: timeout_in_seconds * 1000,
      type: 'POST',
      url: url,
      data: my_data,
      error: function(some_data) {
        return alert("Couldn't connect to staff notation generator server at " + url);
      },
      success: function(some_data, text_status) {
        var base_url, fname, img, selector2;
        $(selector3).hide();
        $(selector).css('visibility', 'visible');
        console.log("in success, index is ", index);
        if (some_data.error) {
          $('h1.progress').text("Error: Regenerating image " + index);
          return;
        }
        selector = "img#staff_notation_jpg_" + index;
        selector2 = "div#staff_notation_jpg_div_" + index;
        img = $(selector)[0];
        ts = new Date().getTime();
        img.setAttribute('src', "" + (img.getAttribute('src')) + "_" + ts);
        $(selector2).effect("highlight", {}, 1000);
        fname = some_data.fname;
        base_url = fname.slice(0, fname.lastIndexOf('.'));
        return console.log(base_url, fname);
      }
    };
    return $.ajax(obj);
  };
  _.debug = function() {};
  console.log(test_data);
  _.templateSettings = {
    evaluate: /\{\[([\s\S]+?)\]\}/g,
    interpolate: /\{\{([\s\S]+?)\}\}/g
  };
  template = _.template("<table class='test_results'>\n  <tr>\n<td>\nTest Case {{index}}</td>\n<td>\n{{comments}}\n</td>\n</tr>\n<tr>\n<td>Doremi source</td>\n<td>\n<div class='like_pre' title=\"doremi-script source\">{{doremi_source}}</div>\n</td>\n<tr>\n<td>Rendered in html:</td>\n<td>\n<div title=\"doremi-script rendered in html\">\n{{html}}\n</div>\n</td>\n<tr>\n<td>Lilypond source</td>\n<td>\n<div class='like_pre' title=\"lilypond source\">{{lilypond_source}}</div>\n</td>\n</tr>\n<tr>\n<td>Staff notation generated by Lilypond</td>\n<td>\n<div title=\"Staff notation generated by Lilypond\" id=\"staff_notation_jpg_div_{{index}}\">\n  <img id=\"staff_notation_jpg_{{index}}\" alt=\"staff notation\" \n  class=\"staff_notation\"\n  src=\"/compositions/test_case_{{md5}}.jpg?ts=\">\n<span style=\"display:none\" id=\"staff_notation_jpg_span_{{index}}\">\nPlease wait...\n </span> \n</div>\n</td>\n</tr>\n<tr><td></td><td>\n<button class='generate_staff_notation' data-index='{{index}}'>Regenerate staff notation</button>\n</td>\n</tr>\n</table>");
  recs = (function() {
    var _len, _results;
    _results = [];
    for (index = 0, _len = test_data.length; index < _len; index++) {
      record = test_data[index];
      try {
        parsed = DoremiScriptParser.parse(record.doremi_source);
        html = to_html(parsed);
        record = {
          comments: record.comments,
          html: html,
          doremi_source: my_escape(record.doremi_source),
          lilypond_source: my_escape(line_to_lilypond(parsed.lines[0])),
          index: index,
          md5: record.md5
        };
        template(record);
      } catch (err) {
        record = {
          comments: record.comments,
          html: "Parse failed",
          doremi_source: my_escape(record.doremi_source),
          index: index,
          md5: "error"
        };
      }
      _results.push(template(record));
    }
    return _results;
  })();
  hr = "";
  $('content').html(hr + recs.join(hr));
  $('button.generate_staff_notation').click(function(btn) {
    var $btn;
    $btn = $(this);
    index = parseInt($btn.data('index'));
    console.log("index", index);
    record = test_data[index];
    parsed = DoremiScriptParser.parse(record.doremi_source);
    return generate_staff_notation_aux(record.doremi_source, index, true);
  });
  $('button#regenerate_images').click(function() {
    var fun;
    $('h1.progress').text("Please wait");
    fun = function() {
      var index, record, _len;
      for (index = 0, _len = test_data.length; index < _len; index++) {
        record = test_data[index];
        parsed = DoremiScriptParser.parse(record.doremi_source);
        generate_staff_notation_aux(record.doremi_source, index, false);
      }
      return $('h1.progress').text("Finished regenerating images");
    };
    return setTimeout(fun, 1000);
  });
  dom_fixes();
  return $('div.hyphenated').hide();
});