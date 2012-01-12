(function() {
  var adjust_slurs_in_dom, dom_fixes, expand_note_widths_to_accomodate_syllables, fallback_if_utf8_characters_not_supported, fix_before_ornaments, root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  expand_note_widths_to_accomodate_syllables = function() {
    /*
           Example:
       RS S
       yes-ter-day
    
       The html renderer blindly lays out the syllables underneath
       the corresponding notes without regard to the syllables colliding
       with each other. Examine each syllable, and if the next syllable
       collides, then adjust the width of the NOTE accordingly     
      */
    var $next, $note, $par, $syllable, existing_margin_right, extra, extra2, index, is_word_end, left, len, margin_right, next_left, syl_right, syl_str, syllable, syllables, width, _len, _results;
    syllables = $('span.syllable').get();
    len = syllables.length;
    _results = [];
    for (index = 0, _len = syllables.length; index < _len; index++) {
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
      _results.push((syl_right + extra2) > next_left ? ($par = $syllable.parent(), $note = $('span.note', $par), margin_right = $note.css("margin-right"), existing_margin_right = 0, extra = 5, $note.css("margin-right", "" + (existing_margin_right + syl_right - next_left + extra + extra2) + "px")) : void 0);
    }
    return _results;
  };
  fallback_if_utf8_characters_not_supported = function() {
    var tag, x;
    if (!(window.left_repeat_width != null)) {
      x = $('#testing_utf_support');
      x.show();
      window.left_repeat_width = $(x).width();
      if (!(window.left_repeat_width != null)) {
        window.left_repeat_width = 0;
      }
      x.hide();
    }
    if ((window.left_repeat_width === 0) || (window.left_repeat_width > 20)) {
      tag = "data-fallback-if-no-utf8-chars";
      return $("span[" + tag + "]").each(function(index) {
        var attr, obj;
        obj = $(this);
        attr = obj.attr(tag);
        return obj.html(attr);
      });
    }
  };
  adjust_slurs_in_dom = function() {
    return $('span[data-begin-slur-id]').each(function(index) {
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
  fix_before_ornaments = function() {
    return $('span.ornament.placement_before').each(function(index) {
      var el;
      el = $(this);
      return el.css('margin-left', "-" + (el.width()) + "px");
    });
  };
  dom_fixes = function() {
    adjust_slurs_in_dom();
    fallback_if_utf8_characters_not_supported();
    fix_before_ornaments();
    return expand_note_widths_to_accomodate_syllables();
  };
  root.dom_fixes = dom_fixes;
}).call(this);
