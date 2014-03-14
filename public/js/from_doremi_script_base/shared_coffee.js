// Generated by CoffeeScript 1.3.3
(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.get_composition_attribute = function(composition, key) {
    var att;
    if (!composition.attributes) {
      return null;
    }
    if (composition.attributes.items != null) {
      att = _.detect(composition.attributes.items, function(item) {
        return item.key === key;
      });
      if (!att) {
        return null;
      }
      return att.value;
    }
  };

  root.log = function(x) {
    if (!(this.debug != null)) {
      return;
    }
    if (!this.debug) {
      return;
    }
    if (console) {
      return console.log.apply(console, arguments);
    }
  };

  root.running_under_node = function() {
    return (typeof module !== "undefined" && module !== null) && module.exports;
  };

  root.trim = function(val) {
    if (String.prototype.trim != null) {
      return val.trim();
    } else {
      return val.replace(/^\s+|\s+$/g, "");
    }
  };

  root.my_inspect = function(obj) {
    if (!(typeof debug !== "undefined" && debug !== null)) {
      return;
    }
    if (!debug) {
      return;
    }
    if (!(typeof console !== "undefined" && console !== null)) {
      return;
    }
    if (running_under_node()) {
      console.log(util.inspect(obj, false, null));
      return;
    }
    return console.log(obj);
  };

  root.valid_abc_pitch = function(str) {
    return str === "C" || str === "C#" || str === "Db" || str === "D" || str === "D#" || str === "Eb" || str === "E" || str === "F" || str === "F#" || str === "Gb" || str === "G" || str === "G#" || str === "Ab" || str === "A" || str === "A#" || str === "Bb" || str === "B";
  };

  root.item_has_attribute = function(item, attr_name) {
    if (!(item.attributes != null)) {
      return false;
    }
    return _.detect(item.attributes, function(attr) {
      if (!(attr.my_type != null)) {
        return false;
      }
      return attr.my_type === attr_name;
    });
  };

  root.my_clone = function(obj) {
    var key, newInstance;
    if (!(obj != null) || typeof obj !== 'object') {
      return obj;
    }
    newInstance = new obj.constructor();
    for (key in obj) {
      newInstance[key] = root.my_clone(obj[key]);
    }
    return newInstance;
  };

  root.get_title = function(composition) {
    return get_composition_attribute(composition, "Title");
  };

  root.get_mode = function(composition) {
    var mode;
    mode = get_composition_attribute(composition, 'Mode');
    return mode || (mode = "major");
  };

  root.get_time = function(composition) {
    return get_composition_attribute(composition, "TimeSignature");
  };

  root.get_ornament = function(pitch) {
    if (!(pitch.attributes != null)) {
      return null;
    }
    return _.detect(pitch.attributes, function(attribute) {
      return attribute.my_type === "ornament";
    });
  };

  root.get_item_attribute = function(item, key) {
    if (!(item.attributes != null)) {
      return null;
    }
    return _.detect(item.attributes, function(attribute) {
      return attribute.my_type === key;
    });
  };

  root.has_mordent = function(pitch) {
    if (!(pitch.attributes != null)) {
      return false;
    }
    return _.detect(pitch.attributes, function(attribute) {
      return attribute.my_type === "mordent";
    });
  };

  root.get_chord = function(item) {
    var e;
    if (e = _.detect(item.attributes, function(x) {
      return x.my_type === "chord_symbol";
    })) {
      return "^\"" + e.source + "\"";
    }
    return "";
  };

  root.get_ending = function(item) {
    var e;
    if (e = _.detect(item.attributes, function(x) {
      return x.my_type === "ending";
    })) {
      return "^\"" + e.source + "\"";
    }
    return "";
  };

  root.is_sargam_line = function(line) {
    if (!(line.kind != null)) {
      return false;
    }
    return line.kind.indexOf('sargam') > -1;
  };

  root.notation_is_in_sargam = function(composition) {
    this.log("in notation_is_in_sargam");
    return _.detect(composition.lines, function(line) {
      return is_sargam_line(line);
    });
  };

  root.all_items = function(tree, items) {
    var an_item, _fn, _i, _len, _ref,
      _this = this;
    if (items == null) {
      items = [];
    }
    if (!tree.items) {
      return [tree];
    }
    _ref = tree.items;
    _fn = function(an_item) {
      items.push(an_item);
      return items.concat(root.all_items(an_item, items));
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      an_item = _ref[_i];
      _fn(an_item);
    }
    return [tree].concat(items);
  };

}).call(this);
