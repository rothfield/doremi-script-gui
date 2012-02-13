var $, root;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$ = jQuery;
root = typeof exports !== "undefined" && exports !== null ? exports : this;
$(document).ready(function() {
  var debug, handleFileSelect, long_composition, my_url, params_for_download_lilypond, params_for_download_sargam, parser, renderer, str, str1, str_simple;
  handleFileSelect = __bind(function(evt) {
    var file, reader;
    if (debug) {
      console.log("in handleFileSelect");
    }
    file = document.getElementById('file').files[0];
    if (debug) {
      console.log("in handleFileSelect,file is", file);
    }
    reader = new FileReader();
    reader.onload = function(evt) {
      $('#entry_area').val(evt.target.result);
      return $('#lilypond_png').attr('src', "");
    };
    return reader.readAsText(file, "");
  }, this);
  document.getElementById('file').addEventListener('change', handleFileSelect, false);
  root.debug = false;
  debug = false;
  window.timer_is_on = 0;
  window.last_val = str;
  window.timed_count = __bind(function() {
    var cur_val, t;
    if (debug) {
      console.log("entering timed_count");
    }
    cur_val = $('#entry_area').val();
    if (debug) {
      console.log("Entering timed_count, cur_val = " + cur_val);
    }
    if (window.last_val !== cur_val) {
      if (debug) {
        console.log("timed_count- runnng parser since val changed");
      }
      $('#run_parser').trigger('click');
    }
    return t = setTimeout("timed_count()", 1000);
  }, this);
  window.do_timer = __bind(function() {
    if (debug) {
      console.log("entering do_timer");
    }
    if (!window.timer_is_on) {
      if (debug) {
        console.log("window.timer wasnt on");
      }
      window.timer_is_on = 1;
      return window.timed_count();
    }
  }, this);
  long_composition = 'Rag:Bhairavi\nTal:Tintal\nTitle:Bansuri\nSource:AAK\nMode: phrygian\n           . .\n[| Srgm PdnS SndP mgrS |]\n\n           I  IV            V   V7 ii    iii7 \n               3                  +            2          .\n1)|: S S S (Sr | n) S   (gm Pd) | P - P  P   | P - D  <(nDSn)>) |\n                 .\n            ban-    su-  ri       ba- ja ra-   hi  dhu- na\n\n  0  ~                3               ~       +  .     *  *   \n| P  d   P       d    |  (Pm   PmnP) (g m) | (PdnS) -- g  S |\n     ma- dhu-ra  kan-     nai-        ya      khe-     la-ta\n\n    2              0     \n                   ~\n| (d-Pm  g) P  m | r - S :|\n   ga-      wa-ta  ho- ri\n';
  str = "S";
  str1 = '                          I   IV       V   V7 ii  iii7 \n       3                  +            2          .\n|: (Sr | n) S   (gm Pd) | P - P  P   | P - D  (<nDSn>) |\n         .\n    ban-    su-  ri       ba- ja ra-   hi  dhu- na\n\n  0  ~                3           ~       +  .     *  .\n| P  d   P   d    |  (Pm   PmnP) (g m) | (PdnS) -- g  S |\n  ma-dhu-ra  kan-     nai-        ya      khe-     la-ta';
  str = '    I                       IV             V\n                 .  .   .    . ..\n|: (SNRSNS) N    S--S --S- | SNRS N D P || mm GG RR S-SS :|  \n    .   .   .\n    he-     llo';
  str = 'Rag:Bhairavi\nTal:Tintal\nTitle:Bansuri\nSource:AAK\n\n          3             ~    +            2         .\n1) |: (Sr | n) S   (gm Pd)|| P - P  P   | P - D  (<nDSn>) |\n            .\n       ban-    su-  ri       ba- ja ra-   hi  dhu- na\n\n0                 3                    +     .    *  .\n| P  d   P   d    | <(Pm>   PmnP) (g m)|| PdnS -- g  S |\n  ma-dhu-ra  kan-     nai-         ya     khe-    la-ta\n\n2              0     ~\n|  d-Pm g P  m | r - S :|\n   ga-    wa-ta  ho- ri\n\n      I                     IV\n              . .                   . .\n2)  [| Srgm PdnS SndP mgrS | Srgm PdnS SndP mgrS | % | % |]';
  str_simple = '   + \n   .\n|<(S--  r)>  (r---  g-m) | S\n   test-ing';
  str = str1;
  str = "S--R --G- | -m-- P";
  $('#entry_area').val(str);
  parser = SargamParser;
  renderer = new SargamHtmlRenderer;
  window.parse_errors = "";
  params_for_download_lilypond = {
    filename: function() {
      return "" + window.the_composition.filename + ".ly";
    },
    data: function() {
      return window.the_composition.lilypond;
    },
    onComplete: function() {
      if (debug) {
        return console.log('Your File Has Been Saved!');
      }
    },
    swf: 'js/third_party/downloadify/media/downloadify.swf',
    downloadImage: 'images/download.png',
    height: 30,
    width: 100,
    transparent: true,
    append: false,
    onComplete: function() {
      return alert("Your file was saved");
    }
  };
  params_for_download_sargam = _.clone(params_for_download_lilypond);
  params_for_download_sargam.data = function() {
    return $('#entry_area').val();
  };
  params_for_download_sargam.filename = function() {
    return "" + window.the_composition.filename + ".txt";
  };
  /*
  	  onComplete: () ->
        console.log 'Your File Has Been Saved!'
      swf: 'js/third_party/downloadify/swfobject.js'
      downloadImage: 'images/download.png'
      height:30
      width:100
      transparent:true
      append:false
    Downloadify 'download_lilypond',params_for_downloadify
    */
  $("#download_lilypond").downloadify(params_for_download_lilypond);
  $("#download_sargam_source").downloadify(params_for_download_sargam);
  $('#load_long_composition').click(function() {
    return $('#entry_area').val(long_composition);
  });
  $('#load_sample_composition').click(function() {
    return $('#entry_area').val(str);
  });
  $('#show_parse_tree').click(function() {
    return $('#parse_tree').toggle();
  });
  my_url = "lilypond.txt";
  $('.generate_staff_notation').click(__bind(function() {
    var my_response_func, obj;
    if (debug) {
      console.log("my_url is " + my_url);
    }
    my_response_func = function(resp) {
      if (debug) {
        return console.log("resp is " + resp);
      }
    };
    obj = {
      type: 'POST',
      url: my_url,
      data: {
        data: window.the_composition.lilypond
      },
      error: function() {
        alert("Generating staff notation failed");
        return $('#lilypond_png').attr('src', 'none.jpg');
      },
      success: function(some_data, text_status) {
        if (debug) {
          console.log("in success,data.length is", some_data.length);
        }
        $('#lilypond_png').attr('src', some_data);
        window.location.hash = "staff_notation";
        return $('#staff_notation_link').trigger('click');
      },
      dataType: "text"
    };
    return $.ajax(obj);
  }, this));
  $('#show_lilypond_source').click(function() {
    $('#lilypond_source').show();
    return $('#lilypond_source').text(window.the_composition.lilypond);
  });
  $('#run_parser').click(function() {
    var canvas, obj;
    if (parser.is_parsing) {
      return;
    }
    window.parse_errors = "";
    $('#parse_tree').text('parsing...');
    try {
      parser.is_parsing = true;
      obj = parser.parse($('#entry_area').val());
      window.the_composition = obj;
      if (debug) {
        console.log("result of parser.parse(str)", obj);
      }
      $('#parse_tree').text("Parsing completed with no errors \n" + JSON.stringify(obj, null, "  "));
      $('#parse_tree').hide();
      $('#rendered_sargam').html(renderer.to_html(obj));
      $('span[data-begin-slur-id]').each(function(index) {
        var attr, pos1, pos2, slur;
        if (debug) {
          console.log("this is", $(this).text());
        }
        pos2 = $(this).offset();
        if (debug) {
          console.log("pos2", pos2);
        }
        attr = $(this).attr("data-begin-slur-id");
        if (debug) {
          console.log("attr", attr);
        }
        slur = $("#" + attr);
        if (debug) {
          console.log("slur", slur);
        }
        pos1 = $(slur).offset();
        if (debug) {
          console.log("pos1", pos1);
        }
        return $(slur).css({
          width: pos2.left - pos1.left + $(this).width()
        });
      });
      canvas = $("#rendered_in_staff_notation")[0];
      if (debug) {
        return console.log("canvas is", canvas);
      }
    } catch (err) {
      console.log(err);
      window.parse_errors = window.parse_errors + "\n" + err;
      $('#parse_tree').text(window.parse_errors);
      return $('#parse_tree').show();
    } finally {
      window.last_val = $('#entry_area').val();
      parser.is_parsing = false;
    }
  });
  $('#run_parser').trigger('click');
  $('#parse_tree').hide();
  return window.do_timer();
});