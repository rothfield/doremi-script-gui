// Generated by CoffeeScript 1.3.3
(function() {
  var add_left_margin_to_notes_with_left_superscripts, add_right_margin_to_notes_with_pitch_signs, add_right_margin_to_notes_with_right_superscripts, adjust_slurs_in_dom, dom_fixes, expand_note_widths_to_accomodate_syllables, fallback_if_utf8_characters_not_supported, fix_before_ornaments, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  add_right_margin_to_notes_with_pitch_signs = function(context) {
    if (context == null) {
      context = null;
    }
    return $('span.note_wrapper *.pitch_sign', context).each(function(index) {
      var current_margin_right, parent;
      parent = $(this).parent();
      current_margin_right = parseInt($(parent).css('margin-right').replace('px', ''));
      return $(parent).css('margin-right', current_margin_right + $(this).width());
    });
  };

  add_left_margin_to_notes_with_left_superscripts = function(context) {
    if (context == null) {
      context = null;
    }
    return $('span.note_wrapper *.ornament.placement_before', context).each(function(index) {
      var current_margin_left, parent;
      parent = $(this).parent();
      current_margin_left = parseInt($(parent).css('margin-left').replace('px', ''));
      return $(parent).css('margin-left', current_margin_left + $(this).width());
    });
  };

  add_right_margin_to_notes_with_right_superscripts = function(context) {
    if (context == null) {
      context = null;
    }
    return $('span.note_wrapper *.ornament.placement_after', context).each(function(index) {
      var current_margin_right, parent;
      parent = $(this).parent();
      current_margin_right = parseInt($(parent).css('margin-right').replace('px', ''));
      return $(parent).css('margin-right', current_margin_right + $(this).width());
    });
  };

  expand_note_widths_to_accomodate_syllables = function(context) {
    var $next, $note, $par, $syllable, existing_margin_right, extra, extra2, index, is_word_end, left, len, margin_right, next_left, syl_right, syl_str, syllable, syllables, width, _i, _len, _results;
    if (context == null) {
      context = null;
    }
    /*
           Example:
       RS S
       yes-ter-day
    
       The html renderer blindly lays out the syllables underneath
       the corresponding notes without regard to the syllables colliding
       with each other. Examine each syllable, and if the next syllable
       collides, then adjust the width of the NOTE accordingly
    */

    syllables = $('span.syllable', context).get();
    len = syllables.length;
    _results = [];
    for (index = _i = 0, _len = syllables.length; _i < _len; index = ++_i) {
      syllable = syllables[index];
      if (index === (len - 1)) {
        continue;
      }
      $syllable = $(syllable);
      syl_str = syllable.textContent || syllable.innerText;
      is_word_end = syl_str[syl_str.length - 1] !== "-";
      extra2 = is_word_end ? 5 : 0;
      $next = $(syllables[index + 1]);
      width = $syllable.width();
      left = $next.offset().left;
      if ($next.offset().top !== $syllable.offset().top) {
        continue;
      }
      next_left = $next.offset().left;
      syl_right = $syllable.offset().left + width;
      if ((syl_right + extra2) > next_left) {
        $par = $syllable.parent();
        $note = $('span.note', $par);
        margin_right = $note.css("margin-right");
        existing_margin_right = 0;
        extra = 5;
        _results.push($note.css("margin-right", "" + (existing_margin_right + syl_right - next_left + extra + extra2) + "px"));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  fallback_if_utf8_characters_not_supported = function(context) {
    var tag, width1, width2;
    if (context == null) {
      context = null;
    }
    if (!(window.ok_to_use_utf8_music_characters != null)) {
      width1 = $('#utf_left_repeat').show().width();
      width2 = $('#utf_single_barline').show().width();
      $('#utf_left_repeat').hide();
      $('#utf_single_barline').hide();
      window.ok_to_use_utf8_music_characters = width1 !== width2;
    }
    if (!window.ok_to_use_utf8_music_characters) {
      tag = "data-fallback-if-no-utf8-chars";
      $("span[" + tag + "]", context).addClass('dont_use_utf8_chars');
      return $("span[" + tag + "]", context).each(function(index) {
        var attr, obj;
        obj = $(this);
        attr = obj.attr(tag);
        return obj.html(attr);
      });
    }
  };

  adjust_slurs_in_dom = function(context) {
    if (context == null) {
      context = null;
    }
    return $('span[data-begin-slur-id]', context).each(function(index) {
      var attr, pos1, pos2, slur, val;
      pos2 = $(this).offset();
      attr = $(this).attr("data-begin-slur-id");
      slur = $("#" + attr);
      if (slur.length === 0) {
        return;
      }
      pos1 = $(slur).offset();
      val = pos2.left - pos1.left;
      if (val < 0) {
        _.error("adjust_slurs_in_dom, negative width");
        return;
      }
      return $(slur).css({
        width: pos2.left - pos1.left + $(this).width()
      });
    });
  };

  fix_before_ornaments = function(context) {
    if (context == null) {
      context = null;
    }
    return $('span.ornament.placement_before', context).each(function(index) {
      var el;
      el = $(this);
      return el.css('margin-left', "-" + (el.width()) + "px");
    });
  };

  dom_fixes = function(context) {
    if (context == null) {
      context = $('body');
    }
    fallback_if_utf8_characters_not_supported(context);
    fix_before_ornaments(context);
    add_left_margin_to_notes_with_left_superscripts(context);
    add_right_margin_to_notes_with_right_superscripts(context);
    add_right_margin_to_notes_with_pitch_signs(context);
    expand_note_widths_to_accomodate_syllables(context);
    return adjust_slurs_in_dom(context);
  };

  root.dom_fixes = dom_fixes;

}).call(this);
