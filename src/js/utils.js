var nativeForEach = Array.prototype.forEach,
    nativeKeys = Object.keys;

var breaker = {};

var isArray = Array.isArray || function(obj) {
    //copypasted from underscore.js
    return toString.call(obj) == '[object Array]';
};

var isObject = function(obj) {
    return obj === Object(obj);
};

var has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
};

var keys = function(obj) {
    if (!isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj)
        if (has(obj, key)) keys.push(key);
    return keys;
};

var each = function(obj, iterator, context) {
    //copypasted from underscore.js
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, length = obj.length; i < length; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) return;
        }
    } else {
        var k = keys(obj);
        for (var i = 0, length = k.length; i < length; i++) {
            if (iterator.call(context, obj[k[i]], k[i], obj) === breaker) return;
        }
    }
    return obj;
};

var newEl = function(tagname, className, innerHTML) {
    var el = document.createElement(tagname);
    if (className) {
        el.className = className;
    }
    if (innerHTML) {
        el.innerHTML = innerHTML;
    }
    return el;
};

var assembleElements = function(parent, hierarchy) {
    var current,
        previous = parent;

    each(hierarchy, function(current) {
        if (current) {
            if (isArray(current)) {
                assembleElements(previous, current);
            } else {
                parent.appendChild(current);
                previous = current;
            }
        }
    });

    return parent;
};
