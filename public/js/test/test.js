$(document).ready(function() {
  var generate_staff_notation_aux, helper, html, img, index, my_escape, parsed, record, recs, src, test_data;
  my_escape = function(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };
  generate_staff_notation_aux = function(doremi_source, index, dont) {
    var my_data, obj, timeout_in_seconds, ts, url;
    if (index == null) {
      index = 0;
    }
    if (dont == null) {
      dont = "false";
    }
    if (debug) {
      console.log("generate_staff_notation");
    }
    ts = new Date().getTime();
    url = '/lilypond_server/lilypond_to_jpg';
    timeout_in_seconds = 60;
    my_data = {
      fname: "test_case_" + index,
      html_doc: "stub",
      doremi_source: doremi_source,
      musicxml_source: "",
      dont_generate_staff_notation: dont
    };
    obj = {
      dataType: "json",
      async: false,
      timeout: timeout_in_seconds * 1000,
      type: 'POST',
      url: url,
      data: my_data,
      error: function(some_data) {
        return alert("Couldn't connect to staff notation generator server at " + url);
      },
      success: function(some_data, text_status) {
        var base_url, fname;
        console.log("in success, index is ", index);
        if (some_data.error) {
          $('h1.progress').text("Error: Regenerating image " + index);
          return;
        }
        fname = some_data.fname;
        base_url = fname.slice(0, fname.lastIndexOf('.'));
        if (debug) {
          return console.log(base_url);
        }
      }
    };
    return $.ajax(obj);
  };
  _.debug = function() {};
  test_data = [];
  helper = function(doremi_source, comments) {
    if (comments == null) {
      comments = "";
    }
    return test_data.push({
      id: "test_" + test_data.length,
      doremi_source: doremi_source,
      comments: comments
    });
  };
  helper("S", "");
  helper("Sr", "");
  helper("Srg", "");
  helper("Sr-g", "");
  helper("<S R >", "");
  helper("Happy birthday\n\n PP DP\n", "");
  helper("Key: D\nMode: Major\n\nHappy birthday\n\n PP DP\n", "");
  helper("   NRSNS\n   .  .\n| S \n", "");
  console.log(test_data);
  recs = (function() {
    var _len, _results;
    _results = [];
    for (index = 0, _len = test_data.length; index < _len; index++) {
      record = test_data[index];
      parsed = DoremiScriptParser.parse(record.doremi_source);
      console.log("parsed", parsed);
      img = "<img alt=\"staff notation\" class=\"staff_notation\" src=\"/compositions/test_case_" + index + ".jpg\">";
      html = to_html(parsed);
      src = "<pre>" + (my_escape(record.doremi_source)) + "</pre>";
      _results.push("" + src + "<hr/>" + html + "<hr/>" + img);
    }
    return _results;
  })();
  $('content').html(recs.join("<hr style='height:4px;background-color:black;' />"));
  $('button#regenerate_images').click(function() {
    var fun;
    $('h1.progress').text("Please wait");
    fun = function() {
      var index, record, _len;
      for (index = 0, _len = test_data.length; index < _len; index++) {
        record = test_data[index];
        parsed = DoremiScriptParser.parse(record.doremi_source);
        generate_staff_notation_aux(record.doremi_source, index);
      }
      return $('h1.progress').text("Finished regenerating images");
    };
    return setTimeout(fun, 1000);
  });
  return dom_fixes();
});