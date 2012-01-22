(function() {
  var Hypher, debug, english, hypher, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  debug = false;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  if (typeof exports !== "undefined" && exports !== null) {
    Hypher = require('./third_party/hypher/hypher.js');
    english = require('./third_party/hyphenation_patterns/en-us.js');
  } else {
    english = window.english;
    Hypher = window.Hypher;
  }
  hypher = new Hypher(english, {
    minLength: 1
  });
  root.ParserHelper = {
    hypher: hypher,
    sa_helper: function(source, normalized) {
      var obj;
      obj = {
        source: source,
        normalized_pitch: normalized
      };
      return obj;
    },
    assign_lyrics: function(sargam, lyrics) {
      var item, slurring_state, syls, _i, _len, _ref, _results;
      if (!(lyrics != null)) {
        return;
      }
      if (lyrics === "") {
        return;
      }
      slurring_state = false;
      syls = (function() {
        var _i, _len, _ref, _results;
        _ref = lyrics.items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item.my_type === "syllable") {
            _results.push(item.syllable);
          }
        }
        return _results;
      })();
      _ref = this.all_items(sargam);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(__bind(function(item) {
          if (item.my_type !== "pitch") {
            return;
          }
          if (syls.length === 0) {
            return;
          }
          if (!slurring_state) {
            item.syllable = syls.shift();
          }
          if (item_has_attribute(item, 'begin_slur')) {
            slurring_state = true;
          }
          if (item_has_attribute(item, 'end_slur')) {
            return slurring_state = false;
          }
        }, this)(item));
      }
      return _results;
    },
    parse_lyrics_section: function(lyrics_lines) {
      var all_words, hy_ary, hyphenated_words, item, line, result, soft_hyphen, source, word;
      console.log("parse_lyrics_section");
      if (lyrics_lines === "") {
        source = "";
      } else {
        source = ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = lyrics_lines.length; _i < _len; _i++) {
            line = lyrics_lines[_i];
            _results.push(line.source);
          }
          return _results;
        })()).join("\n");
      }
      all_words = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = lyrics_lines.length; _i < _len; _i++) {
          line = lyrics_lines[_i];
          _results.push((function() {
            var _j, _len2, _ref, _results2;
            _ref = line.items;
            _results2 = [];
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              item = _ref[_j];
              if (item.my_type === "syllable") {
                _results2.push(item.syllable);
              }
            }
            return _results2;
          })());
        }
        return _results;
      })();
      all_words = _.flatten(all_words);
      hy_ary = [];
      hyphenated_words = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = all_words.length; _i < _len; _i++) {
          word = all_words[_i];
          _results.push(result = hypher.hyphenate(word.toLowerCase()));
        }
        return _results;
      })();
      hyphenated_words = _.flatten(hyphenated_words);
      hyphenated_words = hypher.hyphenateText(all_words.join(' '));
      soft_hyphen = "\u00AD";
      hyphenated_words = hyphenated_words.split(soft_hyphen).join('-');
      return {
        my_type: "lyrics_section",
        source: source,
        lyrics_lines: lyrics_lines,
        line_warnings: [],
        items: [],
        all_words: all_words,
        hyphenated_words: hyphenated_words
      };
    },
    parse_line: function(uppers, sargam, lowers, lyrics) {
      var attribute_lines, ctr, item, lower, lyric, my_items, my_items2, my_line, my_lowers, my_uppers, upper, x, _i, _j, _k, _l, _len, _len2, _len3, _len4;
      this.line_warnings = [];
      if (lyrics.length === 0) {
        lyrics = '';
      }
      if (lowers.length === 0) {
        lowers = '';
      }
      if (uppers.length === 0) {
        uppers = '';
      }
      my_items = _.flatten(_.compact([uppers, sargam, lowers]));
      my_items2 = _.flatten(_.compact([uppers, sargam, lowers, lyrics]));
      sargam.source = (x = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = my_items2.length; _i < _len; _i++) {
          item = my_items2[_i];
          _results.push(item.source);
        }
        return _results;
      })()).join("\n");
      ctr = 0;
      for (_i = 0, _len = uppers.length; _i < _len; _i++) {
        upper = uppers[_i];
        upper.group_line_no = ctr;
        ctr = ctr + 1;
        sargam.group_line_no = ctr;
        ctr = ctr + 1;
      }
      for (_j = 0, _len2 = lowers.length; _j < _len2; _j++) {
        lower = lowers[_j];
        lower.group_line_no = ctr;
        ctr = ctr + 1;
      }
      for (_k = 0, _len3 = lyrics.length; _k < _len3; _k++) {
        lyric = lyrics[_k];
        lyric.group_line_no = ctr;
      }
      for (_l = 0, _len4 = my_items.length; _l < _len4; _l++) {
        my_line = my_items[_l];
        this.measure_columns(my_line.items, 0);
      }
      my_uppers = _.flatten(_.compact([uppers]));
      my_lowers = _.flatten(_.compact([lowers]));
      attribute_lines = _.flatten(_.compact([uppers, lowers, lyrics]));
      this.assign_attributes(sargam, attribute_lines);
      this.assign_lyrics(sargam, lyrics);
      sargam.line_warnings = this.line_warnings;
      return sargam;
    },
    assign_syllables_from_lyrics_sections: function(composition) {
      var line, syls, _i, _len, _ref, _results;
      console.log("assign_syllables_from_lyrics_sections");
      syls = [];
      _ref = composition.lines;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _results.push(line.my_type === "lyrics_section" ? syls.concat(line.all_syllables) : void 0);
      }
      return _results;
    },
    parse_composition: function(attributes, lines) {
      var char, ctr, hash, line, lower, split_chars, to_string, valid, x, _i, _j, _len, _len2;
      ctr = 0;
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        line.index = ctr++;
      }
      if (attributes === "") {
        attributes = null;
      }
      this.log("in composition, attributes is");
      this.my_inspect(attributes);
      to_string = function() {
        var str, zz;
        zz = this.to_string;
        delete this.to_string;
        str = JSON.stringify(this, null, " ");
        this.to_string = zz;
        return "\n" + str;
      };
      this.composition_data = {
        my_type: "composition",
        title: "",
        filename: "",
        attributes: attributes,
        lines: _.flatten(lines),
        warnings: this.warnings,
        source: "",
        toString: to_string
      };
      x = get_composition_attribute(this.composition_data, "NotesUsed");
      valid = true;
      if ((x != null) && (/^[sSrRgGmMpPdDnN]*$/.test(x) === false)) {
        this.warnings.push("ForceSargamChars should be all sargam characters, for example 'SrGmMdN'");
        valid = false;
      }
      this.composition_data.notes_used = x || "";
      hash = {};
      if (x && valid) {
        split_chars = this.composition_data.force_sargam_chars.split('');
        for (_j = 0, _len2 = split_chars.length; _j < _len2; _j++) {
          char = split_chars[_j];
          lower = char.toLowerCase(char);
          if (char === 'S' || char === 'R' || char === 'G' || char === 'M' || char === 'P' || char === 'D' || char === 'N') {
            if ((__indexOf.call(split_chars, lower) < 0)) {
              hash[char.toLowerCase(char)] = char;
            }
          }
        }
      }
      this.composition_data.force_sargam_chars_hash = hash;
      x = get_composition_attribute(this.composition_data, "TimeSignature");
      this.composition_data.time_signature = x || "4/4";
      x = get_composition_attribute(this.composition_data, "id");
      if (x != null) {
        this.composition_data.id = x;
      } else {
        this.composition_data.id = new Date().getTime();
      }
      x = get_composition_attribute(this.composition_data, "Mode");
      if (x != null) {
        x = x.toLowerCase();
      }
      this.composition_data.mode = x || "major";
      x = get_composition_attribute(this.composition_data, "Key");
      if ((x != null) && !valid_abc_pitch(x)) {
        this.warnings.push("Invalid key " + x + ". Valid keys are C,D,Eb,F# etc");
        x = "C";
      }
      this.composition_data.key = x || "C";
      x = get_composition_attribute(this.composition_data, "Filename");
      if ((x != null) && x !== "") {
        if (/^[a-zA-Z0-9_]+$/.test(x) === false) {
          this.warnings.push("Filename must consist of alphanumeric characters plus underscores only");
          x = "untitled";
        }
      }
      this.composition_data.filename = x || "untitled";
      x = get_composition_attribute(this.composition_data, "Title");
      this.composition_data.title = x || "";
      x = get_composition_attribute(this.composition_data, "Source");
      this.composition_data.source = x || "";
      x = get_composition_attribute(this.composition_data, "Author");
      this.composition_data.author = x || "";
      x = get_composition_attribute(this.composition_data, "Raga");
      if (x != null) {
        this.composition_data.raga = x;
      }
      x = get_composition_attribute(this.composition_data, "staff_notation_url");
      if (x != null) {
        this.composition_data.staff_notation_url = x;
      }
      this.mark_partial_measures();
      ({
        assign_syllables_from_lyrics_sections: this.composition_data
      });
      return this.composition_data;
    },
    parse_sargam_pitch: function(begin_slur, musical_char, end_slur) {
      var attributes, column_offset, source;
      source = '';
      attributes = [];
      column_offset = 0;
      if (begin_slur !== '') {
        column_offset = 1;
        attributes.push(begin_slur);
        source = source + begin_slur.source;
      }
      source = source + musical_char.source;
      if (end_slur !== '') {
        attributes.push(end_slur);
        source = source + end_slur.source;
      }
      return {
        my_type: "pitch",
        normalized_pitch: musical_char.normalized_pitch,
        attributes: attributes,
        pitch_source: musical_char.source,
        source: source,
        column_offset: column_offset,
        octave: 0
      };
    },
    parse_beat_delimited: function(begin_symbol, beat_items, end_symbol) {
      var my_beat;
      beat_items.unshift(begin_symbol);
      beat_items.push(end_symbol);
      my_beat = {
        my_type: "beat",
        source: this.get_source_for_items(beat_items),
        items: beat_items
      };
      my_beat.subdivisions = this.count_beat_subdivisions(my_beat);
      this.log("count_beat_subdivisions returned", my_beat.subdivisions, "my beat was", my_beat);
      this.measure_note_durations(my_beat);
      return my_beat;
    },
    parse_beat_undelimited: function(beat_items) {
      var my_beat;
      beat_items = _.flatten(beat_items);
      my_beat = {
        my_type: "beat",
        source: this.get_source_for_items(beat_items),
        items: beat_items
      };
      my_beat.subdivisions = this.count_beat_subdivisions(my_beat);
      this.measure_note_durations(my_beat);
      return my_beat;
    },
    parse_ornament: function(left_delim, items, right_delim) {
      var column_offset, ornament, source, usable_source, z;
      if (left_delim == null) {
        left_delim = "";
      }
      if (right_delim == null) {
        right_delim = "";
      }
      if (left_delim.length > 0) {
        column_offset = 1;
      }
      source = "" + left_delim + (z = get_source_for_items(items)) + right_delim;
      usable_source = z;
      ornament = {
        my_type: "ornament",
        id: ++this.id_ctr,
        column_offset: column_offset,
        source: source,
        usable_source: usable_source,
        ornament_items: items
      };
      return ornament;
    },
    parse_sargam_line: function(line_number, items, kind) {
      var my_items, my_line, source;
      if (line_number !== '') {
        items.unshift(line_number);
      }
      source = this.get_source_for_items(items);
      my_items = _.flatten(items);
      my_line = {
        line_number: line_number,
        my_type: "sargam_line",
        id: ++this.id_ctr,
        source: source,
        items: my_items,
        kind: kind
      };
      if (this.parens_unbalanced(my_line)) {
        this.log("unbalanced parens");
      }
      this.measure_dashes_at_beginning_of_beats(my_line);
      this.measure_pitch_durations(my_line);
      return my_line;
    },
    parse_measure: function(start_obs, items, end_obs) {
      var obj, source;
      if (start_obs !== "") {
        items.unshift(start_obs);
      }
      this.log("end.length is" + end_obs.length);
      if (end_obs !== "") {
        items.push(end_obs);
      }
      source = this.get_source_for_items(items);
      return obj = {
        my_type: "measure",
        id: ++this.id_ctr,
        source: source,
        items: items
      };
    },
    extract_lyrics: function() {
      var ary, item, sargam_line, _i, _j, _len, _len2, _ref, _ref2;
      ary = [];
      _ref = this.composition_data.lines;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sargam_line = _ref[_i];
        _ref2 = this.all_items(sargam_line, []);
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          item = _ref2[_j];
          this.log("extract_lyrics-item is", item);
          if (item.syllable) {
            ary.push(item.syllable);
          }
        }
      }
      return ary;
    },
    mark_partial_measures: function() {
      var beats, item, measure, measures, sargam_line, _i, _len, _ref, _results;
      _ref = this.composition_data.lines;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sargam_line = _ref[_i];
        if (sargam_line.my_type === 'lyrics_section') {
          continue;
        }
        this.log("processing " + sargam_line.source);
        measures = (function() {
          var _j, _len2, _ref2, _results2;
          _ref2 = sargam_line.items;
          _results2 = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            item = _ref2[_j];
            if (item.my_type === "measure") {
              _results2.push(item);
            }
          }
          return _results2;
        })();
        this.log('mark_partial_measures: measures', measures);
        _results.push((function() {
          var _j, _len2, _results2;
          _results2 = [];
          for (_j = 0, _len2 = measures.length; _j < _len2; _j++) {
            measure = measures[_j];
            beats = (function() {
              var _k, _len3, _ref2, _results3;
              _ref2 = measure.items;
              _results3 = [];
              for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
                item = _ref2[_k];
                if (item.my_type === "beat") {
                  _results3.push(item);
                }
              }
              return _results3;
            })();
            this.log('mark_partial_measures: beats is', beats);
            this.log('mark_partial_measures: beats.length ', beats.length);
            measure.beat_count = beats.length;
            _results2.push(measure.beat_count < 4 ? (this.log("setting is_partial true"), this.log("inside if"), measure.is_partial = true) : void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    },
    measure_pitch_durations: function(line) {
      var frac, item, last_pitch, my_funct, _i, _len, _ref, _results;
      this.log("measure_pitch_durations line is", line);
      last_pitch = null;
      _ref = all_items(line);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        this.log("***measure_pitch_durations:item.my_type is", item.my_type);
        if (item.my_type === "measure") {
          this.log("***going into measure");
        }
        if (item.my_type === "pitch") {
          if (!(item.fraction_array != null)) {
            item.fraction_array = [];
          }
          frac = new Fraction(item.numerator, item.denominator);
          item.fraction_array.push(frac);
          last_pitch = item;
          this.my_inspect(item);
        }
        _results.push(item.my_type === "dash" && item.dash_to_tie ? (frac = new Fraction(item.numerator, item.denominator), last_pitch.fraction_array.push(frac), my_funct = function(memo, frac) {
          if (!(memo != null)) {
            return frac;
          } else {
            return frac.add(memo);
          }
        }, last_pitch.fraction_total = _.reduce(last_pitch.fraction_array, my_funct, null)) : void 0);
      }
      return _results;
    },
    measure_dashes_at_beginning_of_beats: function(line) {
      var all, beats, beats_with_dashes_at_start_of_beat, ctr, denominator, done, first_dash, item, last_pitch, m_beats, measure, measures, my_beat, _fn, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2;
      this.log("measure_dashes line is", line);
      measures = (function() {
        var _i, _len, _ref, _results;
        _ref = line.items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item.my_type === "measure") {
            _results.push(item);
          }
        }
        return _results;
      })();
      this.log("measure_dashes measures is", measures);
      beats = [];
      for (_i = 0, _len = measures.length; _i < _len; _i++) {
        measure = measures[_i];
        m_beats = (function() {
          var _j, _len2, _ref, _results;
          _ref = measure.items;
          _results = [];
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            item = _ref[_j];
            if (item.my_type === 'beat') {
              _results.push(item);
            }
          }
          return _results;
        })();
        beats = beats.concat(m_beats);
      }
      this.log("measure_dashes - beasts is", beats);
      beats_with_dashes_at_start_of_beat = _.select(beats, __bind(function(beat) {
        var item, pitch_dashes;
        pitch_dashes = (function() {
          var _j, _len2, _ref, _results;
          _ref = beat.items;
          _results = [];
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            item = _ref[_j];
            if (item.my_type === "dash" || item.my_type === "pitch") {
              _results.push(item);
            }
          }
          return _results;
        })();
        this.log("pitch_dashes", pitch_dashes);
        if (pitch_dashes.length === 0) {
          return false;
        }
        if (pitch_dashes[0].my_type === "dash") {
          return true;
        }
      }, this));
      this.log("measure_dashes ;beats_with_dashes_at_start_of_beat =", beats_with_dashes_at_start_of_beat);
      for (_j = 0, _len2 = beats_with_dashes_at_start_of_beat.length; _j < _len2; _j++) {
        my_beat = beats_with_dashes_at_start_of_beat[_j];
        denominator = my_beat.subdivisions;
        done = false;
        ctr = 0;
        first_dash = null;
        _ref = my_beat.items;
        _fn = __bind(function(item) {
          if (done) {
            return;
          }
          done = item.my_type === "pitch";
          if (item.my_type === "dash") {
            ctr++;
            if (ctr === 1) {
              return first_dash = item;
            }
          }
        }, this);
        for (_k = 0, _len3 = _ref.length; _k < _len3; _k++) {
          item = _ref[_k];
          _fn(item);
        }
        first_dash.numerator = ctr;
        first_dash.denominator = denominator;
        first_dash.dash_to_tie = true;
      }
      this.log("looping through items");
      last_pitch = null;
      all = [];
      _ref2 = this.all_items(line, all);
      for (_l = 0, _len4 = _ref2.length; _l < _len4; _l++) {
        item = _ref2[_l];
        this.log("in loop,item is", item);
        if (item.my_type === "pitch") {
          last_pitch = item;
        }
        if (item.dash_to_tie && (last_pitch != null)) {
          last_pitch.tied = true;
          item.pitch_to_use_for_tie = last_pitch;
          last_pitch = item;
        }
        if (item.dash_to_tie && !(last_pitch != null)) {
          item.rest = true;
          item.dash_to_tie = false;
        }
      }
    },
    measure_note_durations: function(beat) {
      var ctr, denominator, len, microbeats, _results;
      denominator = beat.subdivisions;
      microbeats = 0;
      len = beat.items.length;
      ctr = 0;
      _results = [];
      for (ctr = 0; 0 <= len ? ctr < len : ctr > len; 0 <= len ? ctr++ : ctr--) {
        _results.push(__bind(function(ctr) {
          var done, item, numerator, x, _fn, _ref, _ref2;
          item = beat.items[ctr];
          this.log("in do loop, item is " + item.source);
          this.log("in do loop, ctr is " + ctr);
          if (item.my_type !== "pitch") {
            return;
          }
          this.log("setting denominator for " + item.source);
          numerator = 1;
          done = false;
          if (ctr < len) {
            _fn = __bind(function(x) {
              var my_item;
              if (x < len) {
                this.log('x is' + x);
                if (!done) {
                  my_item = beat.items[x];
                  if (my_item.my_type === "dash") {
                    numerator++;
                  }
                  if (my_item.my_type === "pitch") {
                    done = true;
                  }
                  this.log("in inner loop, my_item is" + my_item.source);
                  return this.log("in inner loop, x is" + x);
                }
              }
            }, this);
            for (x = _ref = ctr + 1, _ref2 = len - 1; _ref <= _ref2 ? x <= _ref2 : x >= _ref2; _ref <= _ref2 ? x++ : x--) {
              _fn(x);
            }
          }
          this.log("setting numerator,denominator for " + item.source);
          item.numerator = numerator;
          return item.denominator = denominator;
        }, this)(ctr));
      }
      return _results;
    },
    count_beat_subdivisions: function(beat) {
      this.log("all_items", all_items(beat));
      return (_.select(all_items(beat), function(item) {
        return item.my_type === "pitch" || item.my_type === "dash";
      })).length;
    },
    parens_unbalanced: function(line) {
      var ary, x, y;
      this.log("entering parens_unbalanced");
      ary = this.collect_nodes(line, []);
      this.log("ary is");
      this.my_inspect(ary);
      x = _.select(ary, __bind(function(item) {
        return item_has_attribute(item, 'begin_slur');
      }, this));
      y = _.select(ary, __bind(function(item) {
        return item_has_attribute(item, 'end_slur');
      }, this));
      if (x.length !== y.length) {
        this.push_warning("Error on line ? unbalanced parens, line was " + line.source + " Note that parens are used for slurs and should bracket pitches as so (S--- R)--- and NOT  (S--) ");
        return true;
      }
      return false;
    },
    get_source_for_items: function(items) {
      var item, str, _i, _len;
      str = '';
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        if (item.source != null) {
          str = str + item.source;
        }
      }
      return str;
    },
    measure_columns: function(items, pos) {
      var item, _i, _len;
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        item.column = pos;
        if ((item.my_type === "ornament") && (item.source[0] === "<")) {
          item.column = item.column + 1;
        }
        if ((item.my_type === "pitch") && (item.source[0] === "(")) {
          item.column = item.column + 1;
        }
        if (item.items != null) {
          pos = this.measure_columns(item.items, pos);
        }
        if (!(item.items != null)) {
          pos = pos + item.source.length;
        }
      }
      return pos;
    },
    handle_ornament: function(sargam, sarg_obj, ornament, sargam_nodes) {
      var s, target_column;
      _.debug("handle_ornament");
      target_column = ornament.column + ornament.ornament_items.length;
      s = sargam_nodes[target_column];
      if ((s != null) && (s.my_type === "pitch")) {
        _.debug("handle_ornament, before case, s is " + s);
        ornament.placement = "before";
        if (!(s.attributes != null)) {
          s.attributes = [];
        }
        s.attributes.push(ornament);
        return;
      }
      s = sargam_nodes[ornament.column - 1];
      if ((s != null) && (s.my_type === "pitch")) {
        ornament.placement = "after";
        if (!(s.attributes != null)) {
          s.attributes = [];
        }
        s.attributes.push(ornament);
        return;
      }
      return this.push_warning(("" + ornament.my_type + " (" + ornament.source + ") not to right ") + ("or left of pitch , column is " + ornament.column));
    },
    push_warning: function(str) {
      this.warnings.push(str);
      return this.line_warnings.push(str);
    },
    check_semantics: function(sargam, sarg_obj, attribute, sargam_nodes) {
      var srgmpdn_in_devanagri;
      if (attribute.my_type === "whitespace") {
        return false;
      }
      if (attribute.my_type === "ornament") {
        handle_ornament(sargam, sarg_obj, attribute, sargam_nodes);
        return false;
      }
      if (!sarg_obj) {
        push_warning("Attribute " + attribute.my_type + " (" + attribute.source + ") above/below nothing, column is " + attribute.column);
        return false;
      }
      if (attribute.my_type === "kommal_indicator") {
        srgmpdn_in_devanagri = "\u0938\u0930\u095A\u092E\u092a\u0927";
        if (srgmpdn_in_devanagri.indexOf(sarg_obj.source) > -1) {
          sarg_obj.normalized_pitch = sarg_obj.normalized_pitch + "b";
          return true;
        }
        push_warning("Error on line ?, column " + sarg_obj.column + ("kommal indicator below non-devanagri pitch. Type of obj was " + sarg_obj.my_type + ". sargam line was:") + sargam.source);
        return false;
      }
      if (attribute.octave != null) {
        if (sarg_obj.my_type !== 'pitch') {
          push_warning("Error on line ?, column " + sarg_obj.column + ("" + attribute.my_type + " below non-pitch. Type of obj was " + sarg_obj.my_type + ". sargam line was:") + sargam.source);
          return false;
        }
        sarg_obj.octave = attribute.octave;
        return false;
      }
      if (attribute.syllable != null) {
        if (sarg_obj.my_type !== 'pitch') {
          push_warning("Error on line ?, column " + sarg_obj.column + ("syllable " + attribute.syllable + " below non-pitch. Type of obj was " + sarg_obj.my_type + ". sargam line was:") + sargam.source);
          return false;
        }
        sarg_obj.syllable = attribute.syllable;
        return false;
      }
      return true;
    },
    find_ornaments: function(attribute_lines) {
      var item, line, orn_item, orns, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
      orns = [];
      for (_i = 0, _len = attribute_lines.length; _i < _len; _i++) {
        line = attribute_lines[_i];
        _ref = line.items;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          item = _ref[_j];
          if (item.my_type === "ornament") {
            item.group_line_no = line.group_line_no;
            _ref2 = item.ornament_items;
            for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
              orn_item = _ref2[_k];
              orn_item.group_line_no = line.group_line_no;
            }
            orns.push(item);
          }
        }
      }
      return orns;
    },
    map_ornaments: function(ornaments) {
      var column, map, orn, ornament_item, _i, _j, _len, _len2, _ref;
      map = {};
      for (_i = 0, _len = ornaments.length; _i < _len; _i++) {
        orn = ornaments[_i];
        _.debug(orn);
        column = orn.column;
        _ref = orn.ornament_items;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          ornament_item = _ref[_j];
          map[column] = ornament_item;
          column = column + 1;
        }
      }
      return map;
    },
    assign_attributes: function(sargam, attribute_lines) {
      var attribute, attribute_line, attribute_map, attribute_nodes, column, ornament_nodes, ornaments, sargam_nodes, _i, _len, _results;
      this.log("entering assign_attributes=sargam,attribute_lines", sargam, attribute_lines);
      sargam_nodes = this.map_nodes(sargam);
      ornaments = this.find_ornaments(attribute_lines);
      _.debug("assign_attributes:ornaments are: " + ornaments);
      ornament_nodes = this.map_ornaments(ornaments);
      _.debug("in assign_attributes ornament nodes: " + ornament_nodes);
      _results = [];
      for (_i = 0, _len = attribute_lines.length; _i < _len; _i++) {
        attribute_line = attribute_lines[_i];
        this.log("processing", attribute_line);
        attribute_map = {};
        attribute_nodes = this.map_nodes(attribute_line);
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (column in attribute_nodes) {
            attribute = attribute_nodes[column];
            _results2.push(__bind(function(column, attribute) {
              var orn_obj, sarg_obj;
              this.log("processing column,attribute", column, attribute);
              sarg_obj = sargam_nodes[column];
              orn_obj = ornament_nodes[column];
              if (orn_obj != null) {
                if (attribute.my_type === "upper_octave_indicator") {
                  orn_obj.octave = 1;
                  _.debug("assign_attributes:upper_octave_indicator case", attribute);
                  if (orn_obj.group_line_no < attribute_line.group_line_no) {
                    attribute.my_type = "lower_octave_indicator";
                    orn_obj.octave = orn_obj.octave * -1;
                  }
                  if (!(orn_obj.attributes != null)) {
                    orn_obj.attributes = [];
                  }
                  orn_obj.attributes.push(attribute);
                  return;
                }
              }
              if (this.check_semantics(sargam, sarg_obj, attribute, sargam_nodes) === !false) {
                if (!(sarg_obj.attributes != null)) {
                  sarg_obj.attributes = [];
                }
                return sarg_obj.attributes.push(attribute);
              }
            }, this)(column, attribute));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    },
    collect_nodes: function(obj, ary) {
      var my_obj, _i, _len, _ref;
      if ((obj.my_type != null) && !(obj.items != null)) {
        ary.push(obj);
      }
      if (obj.items != null) {
        _ref = obj.items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          my_obj = _ref[_i];
          if (my_obj.my_type != null) {
            ary.push(my_obj);
          }
          if (my_obj.items != null) {
            this.collect_nodes(my_obj, ary);
          }
        }
      }
      this.my_inspect("leaving collect_nodes, ary is ");
      this.my_inspect(ary);
      return ary;
    },
    map_nodes: function(obj, map) {
      var my_obj, _i, _len, _ref;
      if (map == null) {
        map = {};
      }
      this.my_inspect("Entering map_nodes, map is ");
      this.my_inspect(map);
      this.log("obj.column is ");
      this.my_inspect(obj.column);
      if (obj.column != null) {
        map[obj.column] = obj;
      }
      if (obj.items != null) {
        _ref = obj.items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          my_obj = _ref[_i];
          this.log("my_obj.column is ");
          if (my_obj.column != null) {
            map[my_obj.column] = my_obj;
          }
          if (my_obj.items != null) {
            this.map_nodes(my_obj, map);
          }
        }
      }
      return map;
    },
    log: function(x) {
      var arg, _i, _len, _results;
      if (!(this.debug != null)) {
        return;
      }
      if (!this.debug) {
        return;
      }
      if (!(typeof console !== "undefined" && console !== null)) {
        return;
      }
      if (!(console.log != null)) {
        return;
      }
      _results = [];
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        arg = arguments[_i];
        _results.push(console ? console.log(arg) : void 0);
      }
      return _results;
    },
    running_under_node: function() {
      return (typeof module !== "undefined" && module !== null) && module.exports;
    },
    my_inspect: function(obj) {
      if (!(debug != null)) {
        return;
      }
      if (!debug) {
        return;
      }
      if (!(typeof console !== "undefined" && console !== null)) {
        return;
      }
      if (!(console.log != null)) {
        return;
      }
      if (typeof util !== "undefined" && util !== null) {
        console.log(util.inspect(obj, false, null));
        return;
      }
      return console.log(obj);
    }
  };
}).call(this);
