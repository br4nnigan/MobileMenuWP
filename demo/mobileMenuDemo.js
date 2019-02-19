(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Static = function(){};
	Static.version = "0.2.4";
	Static.debug = 0;

Static.each = function (elements, callbackFN) {
	if ( Static.isArrayLike(elements) ) {
		for (var i = 0; i < elements.length; i++) {
			if ( callbackFN(elements[i], i, elements)) {
				break;
			}
		}
	} else if ( elements !== null && typeof elements == "object" && !Array.isArray(elements) && Object.keys(elements).length ) {

		for (key in elements) {
			if (elements.hasOwnProperty(key)) {
				callbackFN( elements[key], key, elements );
			}
		}
	}
}
Static.map = function (elements, callbackFN) {
	if (  Static.isArrayLike(elements) ) {
		return Array.prototype.map.call(elements, callbackFN);
	}
	return [];
}
Static.isIterable = function (obj) {
	if (obj === null || typeof obj != "object") {
		return false;
	}
	if ( typeof Symbol == "undefined" ) {
		return "length" in obj;
	}
	return typeof obj[Symbol.iterator] === "function";
}
Static.isArrayLike = function(item) {
	return (
		Array.isArray(item) ||
		( !!item &&
		  typeof item === "object" &&
		  typeof (item.length) === "number" &&
		  (item.length === 0 ||
			 (item.length > 0 &&
			 (item.length - 1) in item)
		  )
		)
	);
}

Static.loadStyle = function (url) {
	return new Promise(function (resolve, reject) {
		var element = document.createElement("link");
			element.setAttribute("type", "text/css");
			element.setAttribute("rel", "stylesheet");
			element.onload = function () {
				if ( Static.debug ) {
					console.log("Static.loadStyle loaded", url);
				}
				resolve(url);
			};
			element.onerror = function () {
				reject(url);
			};
		document.head.appendChild(element);
		element.setAttribute("href", url);
	});
}
Static.loadScript = function (url) {
	return new Promise(function (resolve, reject) {
		var element = document.createElement("script");
			element.setAttribute("async", "");
			element.onload = function () {
				if ( Static.debug ) {
					console.log("Static.loadScript loaded", url);
				}
				resolve(url);
			};
			element.onerror = function () {
				reject(url);
			};
		document.body.appendChild(element);
		element.setAttribute("src", url);
	});
}
Static.doWhen = function (callback, conditionalCallback, interval) {

	var privateWrapper = interval ? function (callback) {
		setTimeout(callback, interval);
	} : requestAnimationFrame;

	var onInterval = function () {
		!conditionalCallback() && privateWrapper(onInterval) || callback();
	}
	onInterval();
}
Static.matches = function (string, regex) {

	return string.match(regex) || [];
}
Static.parseJSON = function( string ) {
	var data;
	try{
		data = JSON.parse(string);
	} catch (e) {
		console.error(e);
	}
	return data;
}
Static.preventDefault = function (event) {
	event.preventDefault();
}
Static.http = {};
Static.http.getUrlParams = function() {

	var params = {};
	var query = document.location.search;

	if ( query.length ){

		query = query.replace(/^\?/,"");
		query = query.replace(/#.*/,"");
		var keyValues = query.split("&");

		for (var i = 0, keyValue; i < keyValues.length; i++) {

			keyValue = keyValues[i].split("=");

			if ( keyValue.length == 2 ){

				params[ decodeURIComponent(keyValue[0]) ] = decodeURIComponent(keyValue[1]);
			}
		}
	}
	return params;
}
Static.http.request = function (url, onSuccess, onError, options) {

	var xhr = new XMLHttpRequest();

	options = options || {};

	options.method = options.method || "GET";
	xhr.open( options.method, url );

	for (var prop in options) {
		if (options.hasOwnProperty(prop)) {
			xhr[prop] = options[prop];
		}
	}

	xhr.onload = function () {
		if ( Static.debug ) console.log('Static.requestUrl.onload', xhr);

		var response = xhr.response;

		if ( xhr.responseType == "json" && typeof response != "object" ) {
			if ( Static.debug ) console.error( "Static.request not getting json...")
			try{
				response = JSON.parse(xhr.responseText);
			} catch(e){
				if ( Static.debug ) console.error( "Static.request error parsing json", e)
			}
		}
		onSuccess(response);
	}
	xhr.onerror = function () {
		if ( Static.debug ) console.log('Static.requestUrl.onerror', xhr);
		onError(xhr);
	}
	xhr.send( options.data );
}
Static.http.isSamePath = function(href1, href2) {

	href1 = href1.replace(/#.*$/, "").replace(/\/$/, ""); // remove hash and trailing slash
	href2 = href2.replace(/#.*$/, "").replace(/\/$/, "");

	if ( href1.length > href2.length ) {

		if (href1.lastIndexOf(href2) != (href1.length - href2.length)) {

			return false;
		}
	} else if (href2.lastIndexOf(href1) != (href2.length - href1.length)) {

		return false;
	}
	return true;
}
Static.http.requestDom = function (url, onSuccess, onError, options) {

	var xhr = new XMLHttpRequest();

	options = options || {};
	options.method = options.method || "GET";

	xhr.open( options.method, url );
	xhr.responseType = "document";
	xhr.onload = function () {
		if ( Static.debug ) console.log('Static.requestUrl.onload', xhr);
		onSuccess(xhr.response);
	}
	xhr.onerror = function () {
		if ( Static.debug ) console.log('Static.requestUrl.onerror', xhr);
		onError(xhr);
	}
	xhr.send( options.data );
}

Static.dom = {};

Static.dom._ready = function () {
	var r = document.readyState;
	return (r == "complete" || r == "interactive");
}
Static.dom.ready = function (callback) {
	if ( Static.dom._ready() ) {
		callback();
	} else {
		var e;
		e = function () {
			if ( Static.dom._ready() ) {
				callback();
				document.removeEventListener("readystatechange", e);
			}
		}
		document.addEventListener("readystatechange", e);
	}
}
Static.dom.style = function (element, properties, value) {
	if ( typeof properties == "object" ) {
		for (prop in properties) {
			if (properties.hasOwnProperty(prop)) {
				element.style[prop] = properties[prop];
			}
		}
	} else if ( typeof properties == "string" && value ) {
		element.style[properties] = value;
	}
}
Static.dom.swapChildren = function(el1, el2) {

	if ( el1.parentNode != el2.parentNode ) return false;

	var parent = el1.parentNode;
	var i1, i2;

	for (var i = 0; i < parent.children.length; i++) {

		if (parent.children[i].isEqualNode(el1)) {
			i1 = i;
		} else if (parent.children[i].isEqualNode(el2)) {
			i2 = i;
		}
	}

	parent.insertBefore(el1, el2);

	if (i1 < i2){

		parent.insertBefore(el2, parent.children[i1 - 1]);
		parent.insertBefore(document.createTextNode(" "), parent.children[i1 - 1]);
	} else {

		parent.insertBefore(el2, parent.children[i1 + 1]);
		parent.insertBefore(document.createTextNode(" "), parent.children[i1 + 1]);
	}
}
Static.dom.insertAt = function ( element, parent, index ) {

	var referenceElementAfter = parent.children[index - 1];
	if ( referenceElementAfter ) {
		if ( element == referenceElementAfter ) {
			return;
		}
		return Static.dom.insertAfter( element, parent.children[index - 1])
	}

	var referenceElementBefore = parent.children[index];
	if ( referenceElementBefore ) {
		if ( element == referenceElementBefore ) {
			return;
		}
		return Static.dom.insertBefore( element, parent.children[0] )
	}

	parent.appendChild( element );
}
Static.dom.insertAfter = function ( element, referenceElement ) {
	if ( referenceElement.nextElementSibling ) {
		return Static.dom.insertBefore( element, referenceElement.nextElementSibling );
	} else {
		var p = referenceElement.parentNode;
		if ( p ) {
			return p.appendChild( element );
		}
	}
}
Static.dom.insertBefore = function ( element, referenceElement ) {
	var p = referenceElement.parentNode;
	if ( p ) {
		return p.insertBefore( element, referenceElement );
	}
}
Static.dom.removeNode = function ( node ) {

	var parent = node.parentNode;
	if ( parent ) {
		parent.removeChild( node );
	}
}
Static.dom.closest = function (el, selector) {

	var closest;
	var parent = el.parentNode;
	while ( parent && !(closest = queryParent(parent, selector)) ){
		parent = parent.parentNode;
	}

	function queryParent(parent, selector) {
		var all = parent.querySelectorAll(selector);
		all = Array.prototype.filter.call(all, isElementParentOrElement);
		return all.length > 0 && all[0];
	}

	function isElementParentOrElement(parent) {
		var child = el;
		while ( child && child.parentNode != parent && child != parent ) {
			child = child.parentNode;
		}
		return child;
	}

	return closest;
}
Static.dom.indexOf = function (child, nodeList) {

	for (var i = 0; i < nodeList.length; i++) {
		if ( child == nodeList[i] ) return i;
	}
	return -1;
}
Static.dom.closestOf = function (el, elements) {

	while ( el != null ) {

		if ( Static.dom.contains(elements, el) ) {
			return el;
		}
		el = el.parentNode;
	}
}
Static.dom.contains = function(nodeList, node){

	if ( typeof nodeList.contains == "function" ) {

		return nodeList.contains( node );
	}
	if ( !isNaN(nodeList.length) ) {

		for (var i = 0; i < nodeList.length; i++) {
			if ( node == nodeList[i] ) return true;
		}
	}
	return false;
}

Static.dom.listeners = [];
// features:
// once parameter
// resizeend even
Static.dom.attachListener = function (element, type, callback, capture, once) {

	var callbackWrapper = function ( event ) {
		if ( once ) {
			element.removeEventListener( type, callbackWrapper, capture );
		}
		callback.call( event.target, event );
	}
	Static.dom.listeners.push({
		element: element,
		type: type,
		callback: callback,
		callbackWrapper: callbackWrapper,
		capture: capture
	});
	element.addEventListener( type, callbackWrapper, capture );

	if ( type == "resizeend" && !Static._onWindowResize ) {

		var timeout = 0;

		Static._onWindowResize = function (e) {

			clearTimeout(timeout);
			timeout = setTimeout(Static.dom._onResizeEnd, Static.dom.onResizeEndDelay)
		}
		Static.dom.attachListener(window, "resize", Static._onWindowResize);
	}
}
Static.dom.detachListener = function ( element, type, callback, capture ) {

	Static.dom.listeners = (Static.dom.listeners || []).map(function (listener) {

		var remove = true;

		if ( element && element !== listener.element ) {
			remove = false;
		}

		if ( type && type !== listener.type ) {
			remove = false;
		}

		if ( callback && callback !== listener.callback ) {
			remove = false;
		}

		if ( remove ) {
			listener.element.removeEventListener( listener.type, listener.callbackWrapper, listener.capture );
		}
		return remove;
	});
}

Static.dom.onResizeEnd = function (callback) {
	if ( Static.debug ) console.warn("Static.dom.onResizeEnd is deprecated, use Static.dom.attachListener");
	Static.dom.attachListener( "resizeend", callback );
}
Static.dom.onResizeEndDelay = 250;
Static.dom._onResizeEnd = function () {
	Static.each(Static.dom.listeners, function (listener) {
		if ( listener.type == "resizeend" ) {
			listener.callback();
		}
	});
}
Static.dom.createEvent = function ( properties ) {
	var event = null;
	var type = (typeof properties == "object" ? properties.type : properties )
	if ( type ) {
		if ( typeof(Event) === "function" ) {
			event = new Event(type);
		} else {
			event = document.createEvent("Event");
			event.initEvent(type, true, true);
		}
		if ( typeof properties == "object" ) {
			for (prop in properties) {
				if (properties.hasOwnProperty(prop)) {
					if ( prop != "type" ) {
						Object.defineProperty(event, prop, {value: properties[prop], enumerable: true});
					}
				}
			}
		}
	}
	return event;
}

if ( typeof module == "object" ) {
	module.exports = Static;
}
},{}],2:[function(require,module,exports){
module.exports = function(element, targetAttributes, time, easing, cb){

  var Promise = require("promise-polyfill");
  var args = arguments;

  return new Promise(function (resolve, reject) {

    element = args[0];
    targetAttributes = args[1];
    time = args[2];
    easing = args[3];
    cb = args[4];

    if (typeof easing == 'function'){
      cb = easing
      easing = null
    }

    if (!('transition' in element.style)){
      // crappy fallback
      set(element, targetAttributes)
      if ( cb ) cb();
      resolve();
    }

    var targetAttributes = normalize(element, targetAttributes)

    var startAttributes = getStart(element, targetAttributes)
    var endAttributes = getEnd(element, startAttributes, targetAttributes)
    var finalAttributes = getFinal(element, endAttributes, targetAttributes)

    var transition = Object.keys(endAttributes).map(function(key){
      return dasherize(key) + ' ' + time + 'ms ' + (easing || '')
    }).join(', ')

    if (Object.keys(endAttributes).length){
      set(element, startAttributes)
      setTimeout(function(){
        element.style.transition = transition
        set(element, endAttributes)

        // using transitionend is unreliable - it only fires
        // if a transition actually took place, so we'll use setTimeout

        setTimeout(function(){
          element.style.transition = ''
          set(element, finalAttributes)
          if ( cb ) cb();
          resolve();
        }, time)
      }, 15)


    } else {
      if ( cb ) cb();
      resolve();
    }

  });

}

function set(element, attributes){
  Object.keys(attributes).forEach(function(key){
    element.style[key] = attributes[key]
  })
}

function getStart(element, targetAttributes){
  var currentStyle = window.getComputedStyle(element)
  var result = {}

  Object.keys(targetAttributes).forEach(function(key){
    result[key] = currentStyle[key]
  })

  // handle absolute position transition
  if (targetAttributes['position']){
    if (currentStyle['position'] != targetAttributes['position']){


      result['position'] = 'relative'
      result['top'] = '0'
      result['left'] = '0'
      result['right'] = 'auto'
      result['bottom'] = 'auto'
      result['width'] = currentStyle['width']
      result['height'] = currentStyle['height']

      if (currentStyle['position'] == 'fixed'){
        var offset = getDestinationOffset(element)
        result['top'] = (element.offsetTop + offset.top) + 'px'
        result['left'] = (element.offsetLeft + offset.left) + 'px'
      }

      if (targetAttributes['position'] == 'static'){
        result['marginBottom'] = (parsePx(currentStyle['marginBottom']) - element.offsetHeight) + 'px'
      } else if (currentStyle['position'] == 'static') {
        result['marginBottom'] = currentStyle['marginBottom']
      }
    }
  }

  return result
}

function getEnd(element, startAttributes, targetAttributes){

  var result = {}
  var originals = {}

  var offsetTop = element.offsetTop
  var offsetLeft = element.offsetLeft
  var originalPosition = window.getComputedStyle(element)['position']

  // simulate new attributes to resolve autos
  Object.keys(targetAttributes).forEach(function(key){
    originals[key] = element.style[key]
    element.style[key] = targetAttributes[key]
  })
  var targetStyle = window.getComputedStyle(element)
  Object.keys(targetAttributes).forEach(function(key){
    if (startAttributes[key] != targetStyle[key]){
      result[key] = targetStyle[key]
    }
  })


  // handle absolute position transition
  if (targetAttributes['position'] && startAttributes['position'] != targetAttributes['position']){
    result['position'] = 'relative'
    result['top'] = (element.offsetTop - offsetTop) + 'px'
    result['left'] = (element.offsetLeft - offsetLeft) + 'px'
    result['right'] = 'auto'
    result['bottom'] = 'auto'

    if (targetAttributes['position'] == 'static'){
      result['top'] = '0px'
      result['left'] = '0px'
      result['marginBottom'] = element.style['marginBottom']
    } else if (originalPosition == 'static' && !result['marginBottom']){
      result['marginBottom'] = (parsePx(startAttributes['marginBottom']) - element.offsetHeight) + 'px'
    }
  }

  // revert attribute change
  Object.keys(originals).forEach(function(key){
    element.style[key] = originals[key]
  })

  return result
}

function getFinal(element, endAttributes, targetAttributes){
  var result = {}
  Object.keys(endAttributes).forEach(function(key){
    result[key] = element.style[key]
  })
  Object.keys(targetAttributes).forEach(function(key){
    result[key] = targetAttributes[key]
  })
  return result
}

function normalize(element, attributes){
  var result = {}
  Object.keys(attributes).forEach(function(key){
    result[camelize(key)] = attributes[key]
  })
  return result
}

function getOffset(element){
  var result = {
    top: 0,
    left: 0
  }

  while (element){
    result.top += element.offsetTop
    result.left += element.offsetLeft
    element = element.offsetParent
  }

  return result
}

function getDestinationOffset(element){
  var revert = element.style.position
  element.style.position = 'static'

  var parent = element.offsetParent
  var value = getOffset(element)

  element.style.position = revert
  return {
    top: -value.top + document.body.scrollTop,
    left: -value.left + document.body.scrollLeft
  }
}

function parsePx(px){
  return parseInt(px, 10) || 0
}

function camelize(str) {
  return str.replace(/[_.-](\w|$)/g, function (_,x) {
    return x.toUpperCase()
  })
}

function dasherize(str){
  return str.trim().replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
}

},{"promise-polyfill":4}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
(function (setImmediate){
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (!(this instanceof Promise)) throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    return new Promise(function (resolve, reject) {
      if (!arr || typeof arr.length === 'undefined') throw new TypeError('Promise.all accepts an array');
      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

}).call(this,require("timers").setImmediate)
},{"timers":5}],5:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":3,"timers":5}],6:[function(require,module,exports){
var MobileMenu = require("./modules/MobileMenu.js");

var mobileMenu = new MobileMenu();
},{"./modules/MobileMenu.js":7}],7:[function(require,module,exports){
var Static = require("Static.js");
var MobileSubMenuButton = require("./MobileSubMenuButton");
var TriggerButton = require("./TriggerButton");

function MobileMenu() {

	var api = {
		destroy: destroy
	};

	var nav = null;
	var subcomponents = [];

	function initialize() {

		subcomponents.push(Static.map(document.querySelectorAll(".nav-button-more"), function (element) {
			return new MobileSubMenuButton( element );
		}));

		nav = document.querySelector(".nav-container nav");

		subcomponents.push(Static.map(document.querySelectorAll(".menu-button"), function (element) {
			return new TriggerButton({
				element: element,
				onTrigger: function (event) {
					nav.classList.toggle( "nav--open" );
				}
			});
		}));

		window.addEventListener("resize", onResize);
	}

	function onResize() {

		nav.classList.remove( "nav--open" );
	}

	function destroy() {

		window.removeEventListener("resize", onResize);

		Static.each(subcomponents, function (subcomponent) {
			if ( subcomponent.destroy ) {
				subcomponent.destroy();
			}
		});
	}

	return initialize(), api;
}
if ( typeof module == "object" ) {
	module.exports = MobileMenu;
}


},{"./MobileSubMenuButton":8,"./TriggerButton":9,"Static.js":1}],8:[function(require,module,exports){
var transition = require("css-transition");
var Static = require("Static.js");

function MobileSubMenuButton( buttonElement ) {

	var api = {
		open: open,
		close: close,
		destroy: destroy
	};

	var isOpen = null;

	// var menu = null;
	var menuItem = null;
	var menuItemA = null;
	var button = null;

	var transitioning = null;

	var classes = {
		OPEN: "nav-button-more--open"
	};

	function initialize() {

		if ( !(buttonElement instanceof Element) ) {
			return false;
		}
		button = buttonElement;

		menuItem = Static.dom.closest( buttonElement, ".menu-item" );
		if (!menuItem) {
			return false;
		}

		menuItemA = menuItem.querySelector("a");
		if (!menuItemA) {
			return false;
		}

		isOpen = false;
		buttonElement.addEventListener("click", onButtonClick);

		document.addEventListener( "onBeforeDomChange", close );
		document.addEventListener( "MobileSubMenuButtonOpen", MobileSubMenuButtonOpen );

		window.addEventListener("resize", function () {
			if ( isOpen ) {
				close(0);
			}
		});
	}

	function destroy() {

		buttonElement.removeEventListener("click", onButtonClick);
		document.removeEventListener( "onAfterDomChange", close );
	}

	function open( duration ) {

		if ( transitioning ) {
			return;
		}

		document.dispatchEvent(Static.dom.createEvent({
			type: "MobileSubMenuButtonOpen",
			detail: button
		}));

		transitioning = true;
		transition(menuItem, {
			height: menuItem.scrollHeight + "px"
		}, duration || 170, "ease", onTransitionEnd);
		isOpen = true;
		button.classList.add( classes.OPEN );
	}

	function close( duration ) {
		if ( transitioning ) {
			return;
		}
		transitioning = true;
		transition(menuItem, {
			height: menuItemA.offsetHeight + "px"
		}, duration || 170, "", onTransitionEnd);
		isOpen = false;
		button.classList.remove( classes.OPEN );
	}

	function MobileSubMenuButtonOpen(e) {
		if ( e.detail != button ) {
			close();
		}
	}

	function onTransitionEnd() {
		transitioning = false;
	}

	function onButtonClick(event) {

		return isOpen ? close() : open();
	}

	return initialize(), api;
}
if ( typeof module == "object" ) {
	module.exports = MobileSubMenuButton;
}


},{"Static.js":1,"css-transition":2}],9:[function(require,module,exports){
function TriggerButton( options ) {

	this.isTriggered = false;

	this.destroy = function() {

		if ( !(options.element instanceof Element) ) {
			return false;
		}
		options.element.removeEventListener("click", onTrigger);
	};

	function initialize() {

		options = options || {};

		if ( !(options.element instanceof Element) ) {
			return false;
		}
		options.element.addEventListener("click", onTrigger);
	}

	function onTrigger( event ) {

		this.isTriggered = !this.isTriggered;
		if ( typeof options.onTrigger == "function" ) {

			options.onTrigger.call( this, event );
		}
	}

	initialize();
}
if ( typeof module == "object" ) {
	module.exports = TriggerButton;
}


},{}]},{},[6]);
