var JSON2 = (function () {
    var json = {};

    var objectProto = Object.prototype;

    var hasOwnProperty = objectProto.hasOwnProperty,
        objectToString = objectProto.toString;

    var meta = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' };

    var rx_one = /^[\],:{}\s]*$/,
        rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rx_four = /(?:^|:|,)(?:\s*\[)+/g,
        rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        rx_has_escapable = RegExp(rx_escapable.source),
        rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        rx_has_dangerous = RegExp(rx_dangerous.source);

    var gap, indent, rep;

    function quote(string) {
        return rx_has_escapable.test(string)
            ? '"' +
                  string.replace(rx_escapable, function (a) {
                      var c = meta[a];
                      return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                  }) +
                  '"'
            : '"' + string + '"';
    }

    function str(key, holder) {
        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key];

        if (value && typeof value === 'object') {
            value = value instanceof Date ? value.toString() : value.valueOf();
        }

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }

                gap += indent;
                partial = [];

                if (objectToString.apply(value) === '[object Array]') {
                    length = value.length;

                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    if (partial.length === 0) {
                        v = '[]';
                    } else if (gap) {
                        v = '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']';
                    } else {
                        v = '[' + partial.join(',') + ']';
                    }

                    gap = mind;

                    return v;
                }

                if (rep && typeof rep === 'object') {
                    length = rep.length;

                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                if (partial.length === 0) {
                    v = '{}';
                } else if (gap) {
                    v = '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}';
                } else {
                    v = '{' + partial.join(',') + '}';
                }

                gap = mind;
                return v;
        }
    }

    json.stringify = function (value, replacer, space) {
        var i;
        gap = '';
        indent = '';

        if (typeof space === 'number') {
            for (i = 0; i < space; i += 1) {
                indent += ' ';
            }
        } else if (typeof space === 'string') {
            indent = space;
        }

        rep = replacer;

        if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
            throw new Error('JSON.stringify');
        }

        return str('', { '': value });
    };

    json.parse = function (text, reviver) {
        var j;

        function walk(holder, key) {
            var k,
                v,
                value = holder[key];

            if (value && typeof value === 'object') {
                for (k in value) {
                    if (hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v === undefined) {
                            delete value[k];
                        } else {
                            value[k] = v;
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }

        text = String(text);

        if (rx_has_dangerous.test(text)) {
            text = text.replace(rx_dangerous, function (a) {
                return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            });
        }

        if (rx_one.test(text.replace(rx_two, '@').replace(rx_three, ']').replace(rx_four, ''))) {
            j = eval('(' + text + ')');
            return typeof reviver === 'function' ? walk({ '': j }, '') : j;
        }

        throw new SyntaxError('JSON.parse');
    };

    return json;
})();
