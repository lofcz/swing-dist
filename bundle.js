(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
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
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
(function (global){(function (){
var swing = require('@brugarolas/swing').default
global.window.swingLib = swing
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"@brugarolas/swing":36}],4:[function(require,module,exports){
module.exports = require("core-js-pure/stable/array/from");
},{"core-js-pure/stable/array/from":265}],5:[function(require,module,exports){
module.exports = require("core-js-pure/stable/instance/filter");
},{"core-js-pure/stable/instance/filter":268}],6:[function(require,module,exports){
module.exports = require("core-js-pure/stable/instance/find-index");
},{"core-js-pure/stable/instance/find-index":269}],7:[function(require,module,exports){
module.exports = require("core-js-pure/stable/instance/find");
},{"core-js-pure/stable/instance/find":270}],8:[function(require,module,exports){
module.exports = require("core-js-pure/stable/instance/for-each");
},{"core-js-pure/stable/instance/for-each":271}],9:[function(require,module,exports){
module.exports = require("core-js-pure/stable/instance/includes");
},{"core-js-pure/stable/instance/includes":272}],10:[function(require,module,exports){
module.exports = require("core-js-pure/stable/instance/index-of");
},{"core-js-pure/stable/instance/index-of":273}],11:[function(require,module,exports){
module.exports = require("core-js-pure/stable/instance/splice");
},{"core-js-pure/stable/instance/splice":275}],12:[function(require,module,exports){
module.exports = require("core-js-pure/stable/object/define-properties");
},{"core-js-pure/stable/object/define-properties":277}],13:[function(require,module,exports){
module.exports = require("core-js-pure/stable/object/define-property");
},{"core-js-pure/stable/object/define-property":278}],14:[function(require,module,exports){
module.exports = require("core-js-pure/stable/object/get-own-property-descriptor");
},{"core-js-pure/stable/object/get-own-property-descriptor":279}],15:[function(require,module,exports){
module.exports = require("core-js-pure/stable/object/get-own-property-descriptors");
},{"core-js-pure/stable/object/get-own-property-descriptors":280}],16:[function(require,module,exports){
module.exports = require("core-js-pure/stable/object/get-own-property-symbols");
},{"core-js-pure/stable/object/get-own-property-symbols":281}],17:[function(require,module,exports){
module.exports = require("core-js-pure/stable/object/keys");
},{"core-js-pure/stable/object/keys":282}],18:[function(require,module,exports){
module.exports = require("core-js-pure/stable/symbol");
},{"core-js-pure/stable/symbol":283}],19:[function(require,module,exports){
module.exports = require("core-js-pure/features/array/from");
},{"core-js-pure/features/array/from":70}],20:[function(require,module,exports){
module.exports = require("core-js-pure/features/array/is-array");
},{"core-js-pure/features/array/is-array":71}],21:[function(require,module,exports){
module.exports = require("core-js-pure/features/instance/slice");
},{"core-js-pure/features/instance/slice":72}],22:[function(require,module,exports){
module.exports = require("core-js-pure/features/is-iterable");
},{"core-js-pure/features/is-iterable":73}],23:[function(require,module,exports){
module.exports = require("core-js-pure/features/object/define-property");
},{"core-js-pure/features/object/define-property":74}],24:[function(require,module,exports){
module.exports = require("core-js-pure/features/symbol");
},{"core-js-pure/features/symbol":75}],25:[function(require,module,exports){
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;
},{}],26:[function(require,module,exports){
var _Array$isArray = require("../core-js/array/is-array");

var arrayLikeToArray = require("./arrayLikeToArray");

function _arrayWithoutHoles(arr) {
  if (_Array$isArray(arr)) return arrayLikeToArray(arr);
}

module.exports = _arrayWithoutHoles;
},{"../core-js/array/is-array":20,"./arrayLikeToArray":25}],27:[function(require,module,exports){
var _Object$defineProperty = require("../core-js/object/define-property");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    _Object$defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
},{"../core-js/object/define-property":23}],28:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],29:[function(require,module,exports){
var _Array$from = require("../core-js/array/from");

var _isIterable = require("../core-js/is-iterable");

var _Symbol = require("../core-js/symbol");

function _iterableToArray(iter) {
  if (typeof _Symbol !== "undefined" && _isIterable(Object(iter))) return _Array$from(iter);
}

module.exports = _iterableToArray;
},{"../core-js/array/from":19,"../core-js/is-iterable":22,"../core-js/symbol":24}],30:[function(require,module,exports){
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableSpread;
},{}],31:[function(require,module,exports){
var arrayWithoutHoles = require("./arrayWithoutHoles");

var iterableToArray = require("./iterableToArray");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

var nonIterableSpread = require("./nonIterableSpread");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
},{"./arrayWithoutHoles":26,"./iterableToArray":29,"./nonIterableSpread":30,"./unsupportedIterableToArray":32}],32:[function(require,module,exports){
var _Array$from = require("../core-js/array/from");

var _sliceInstanceProperty = require("../core-js/instance/slice");

var arrayLikeToArray = require("./arrayLikeToArray");

function _unsupportedIterableToArray(o, minLen) {
  var _context;

  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);

  var n = _sliceInstanceProperty(_context = Object.prototype.toString.call(o)).call(_context, 8, -1);

  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return _Array$from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray;
},{"../core-js/array/from":19,"../core-js/instance/slice":21,"./arrayLikeToArray":25}],33:[function(require,module,exports){
(function (global){(function (){
"use strict";var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault"),_Object$defineProperty2=require("@babel/runtime-corejs3/core-js-stable/object/define-property");require("core-js/modules/web.timers"),_Object$defineProperty2(exports,"__esModule",{value:!0}),exports["default"]=void 0;var _defineProperty2=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/define-property")),_defineProperties=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/define-properties")),_getOwnPropertyDescriptors=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptors")),_forEach=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each")),_getOwnPropertyDescriptor=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptor")),_filter=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter")),_getOwnPropertySymbols=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-symbols")),_keys=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys")),_indexOf=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of")),_defineProperty3=_interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty")),_includes=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes")),_sister=_interopRequireDefault(require("sister")),_hammerjs=_interopRequireDefault(require("hammerjs")),_rebound=_interopRequireDefault(require("rebound")),_prefix=_interopRequireDefault(require("prefix")),_Direction=_interopRequireDefault(require("./Direction")),_utilities=require("./utilities");function ownKeys(a,b){var c=(0,_keys["default"])(a);if(_getOwnPropertySymbols["default"]){var d=(0,_getOwnPropertySymbols["default"])(a);b&&(d=(0,_filter["default"])(d).call(d,function(b){return(0,_getOwnPropertyDescriptor["default"])(a,b).enumerable})),c.push.apply(c,d)}return c}function _objectSpread(a){for(var b,c=1;c<arguments.length;c++)if(b=null==arguments[c]?{}:arguments[c],c%2){var d;(0,_forEach["default"])(d=ownKeys(Object(b),!0)).call(d,function(c){(0,_defineProperty3["default"])(a,c,b[c])})}else if(_getOwnPropertyDescriptors["default"])(0,_defineProperties["default"])(a,(0,_getOwnPropertyDescriptors["default"])(b));else{var e;(0,_forEach["default"])(e=ownKeys(Object(b))).call(e,function(c){(0,_defineProperty2["default"])(a,c,(0,_getOwnPropertyDescriptor["default"])(b,c))})}return a}var slowRafIE9=function(a){window.setInterval(a,25)},raf=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||slowRafIE9,computeDirection=function(a,b,c){var e,d=Math.abs,f=d(a)>d(b);return e=f?0>a?_Direction["default"].LEFT:_Direction["default"].RIGHT:0>b?_Direction["default"].UP:_Direction["default"].DOWN,(0,_includes["default"])(c).call(c,e)?e:_Direction["default"].INVALID},computeHammerDirections=function(a){return a.vertical&&a.lateral?_hammerjs["default"].DIRECTION_ALL:a.vertical?_hammerjs["default"].DIRECTION_VERTICAL:a.lateral?_hammerjs["default"].DIRECTION_HORIZONTAL:_hammerjs["default"].DIRECTION_NONE},Card=function(a,b,c){var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y=function(a){return a.lateral&&!a.vertical?function(a){f=a.deltaX}:a.vertical&&!a.lateral?function(a){f=a.deltaX}:function(a){f=a.deltaX,g=a.deltaY}},z=function(){d={},e=Card.makeConfig(a.getConfig()),i=(0,_sister["default"])(),r=a.getSpringSystem(),s=r.createSpring(250,10),t=r.createSpring(500,20),l={},m={coordinateX:0,coordinateY:0},n=0,o=0,u={},u[_Direction["default"].LEFT]="throwoutleft",u[_Direction["default"].RIGHT]="throwoutright",u[_Direction["default"].UP]="throwoutup",u[_Direction["default"].DOWN]="throwoutdown",s.setRestSpeedThreshold(.05),s.setRestDisplacementThreshold(.05),t.setRestSpeedThreshold(.05),t.setRestDisplacementThreshold(.05),v=e.throwOutDistance(e.minThrowOutDistance,e.maxThrowOutDistance),p=new _hammerjs["default"].Manager(b,{recognizers:[[_hammerjs["default"].Pan,{direction:computeHammerDirections(e),threshold:2}]]}),c?Card.prependToParent(b):Card.appendToParent(b),i.on("panstart",function(){Card.appendToParent(b),i.trigger("dragstart",{target:b}),f=0,g=0,j=!0,function a(){j&&(h(),raf(a))}()}),x=y(e),i.on("panmove",x),i.on("panend",function(a){j=!1;var c=m.coordinateX+a.deltaX,f=m.coordinateY+a.deltaY,g=e.isThrowOut(c,f,b,e.throwOutConfidence(c,f,b)),h=computeDirection(c,f,e.allowedDirections);g&&h!==_Direction["default"].INVALID?d.throwOut(c,f,h):d.throwIn(c,f,h),i.trigger("dragend",{target:b})}),(0,_utilities.isTouchDevice)()?(b.addEventListener("touchstart",function(){e.allowMovement(event,(0,_utilities.isTouchDevice)())&&i.trigger("panstart")}),b.addEventListener("touchend",function(){j&&!k&&i.trigger("dragend",{target:b})}),function(){var a;b.addEventListener("touchstart",function(){a=!0}),b.addEventListener("touchend",function(){a=!1}),global.addEventListener("touchmove",function(b){a&&e.allowMovement(b,(0,_utilities.isTouchDevice)())&&b.preventDefault()})}()):(b.addEventListener("mousedown",function(){i.trigger("panstart")}),b.addEventListener("mouseup",function(){j&&!k&&i.trigger("dragend",{target:b})})),p.on("panstart",function(a){k=!0,i.trigger("panstart",a)}),p.on("panmove",function(a){e.allowMovement(a,(0,_utilities.isTouchDevice)())&&i.trigger("panmove",a)}),p.on("panend",function(a){e.allowMovement(a,(0,_utilities.isTouchDevice)())&&(k=!1,i.trigger("panend",a))}),s.addListener({onSpringAtRest:function onSpringAtRest(){i.trigger("throwinend",{target:b})},onSpringUpdate:function onSpringUpdate(a){var b=a.getCurrentValue(),c=_rebound["default"].MathUtil.mapValueInRange(b,0,1,l.fromX,0),d=_rebound["default"].MathUtil.mapValueInRange(b,0,1,l.fromY,0);q(c,d)}}),t.addListener({onSpringAtRest:function onSpringAtRest(){i.trigger("throwoutend",{target:b})},onSpringUpdate:function onSpringUpdate(a){var b,c,d,e=a.getCurrentValue();l.direction===_Direction["default"].RIGHT||l.direction===_Direction["default"].LEFT?(d=l.direction===_Direction["default"].RIGHT?1:-1,b=_rebound["default"].MathUtil.mapValueInRange(e,0,1,l.fromX,v*d),c=l.fromY):(l.direction===_Direction["default"].UP||l.direction===_Direction["default"].DOWN)&&(d=l.direction===_Direction["default"].DOWN?1:-1,b=l.fromX,c=_rebound["default"].MathUtil.mapValueInRange(e,0,1,l.fromY,v*d)),q(b,c)}}),h=function(){if(f!==n||g!==o){n=f,o=g;var a=m.coordinateX+f,c=m.coordinateY+g,d=e.rotation(a,c,b,e.maxRotation);e.transform(b,a,c,d),i.trigger("dragmove",{offset:a,target:b,throwDirection:computeDirection(a,c,e.allowedDirections),throwOutConfidence:e.throwOutConfidence(a,c,b)})}},q=function(a,c){var d=e.rotation(a,c,b,e.maxRotation);m.coordinateX=a||0,m.coordinateY=c||0,e.transform(b,a,c,d)},w=function(a,c,d,f){if(l.fromX=e.lateral?c:0,l.fromY=e.vertical?d:0,l.direction=f||computeDirection(c,d,e.allowedDirections),a===Card.THROW_IN)Card.appendToParent(b),s.setCurrentValue(0).setAtRest().setEndValue(1),i.trigger("throwin",{target:b,throwDirection:l.direction});else if(a===Card.THROW_OUT)Card.appendToParent(b),t.setCurrentValue(0).setAtRest().setVelocity(e.velocity).setEndValue(1),i.trigger("throwout",{target:b,throwDirection:l.direction}),i.trigger(u[l.direction],{target:b,throwDirection:l.direction});else throw new Error("Invalid throw event.")}};return z(),d.on=i.on,d.off=i.off,d.trigger=i.trigger,d.throwIn=function(a,b,c){w(Card.THROW_IN,a,b,c)},d.throwOut=function(a,b,c){w(Card.THROW_OUT,a,b,c)},d.unbindListeners=function(){p.destroy(),s.destroy(),t.destroy()},d.destroy=function(){d.unbindListeners(),a.destroyCard(d)},d};Card.makeConfig=function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},b={allowedDirections:[_Direction["default"].RIGHT,_Direction["default"].LEFT,_Direction["default"].UP],allowMovement:function allowMovement(){return!0},isThrowOut:Card.isThrowOut,lateral:!0,maxRotation:20,maxThrowOutDistance:500,minThrowOutDistance:400,rotation:Card.rotation,throwOutConfidence:Card.throwOutConfidence,throwOutDistance:Card.throwOutDistance,transform:Card.transform,velocity:100,vertical:!0};return _objectSpread(_objectSpread({},b),a)},Card.transform=function(a,b,c,d){a.style[(0,_prefix["default"])("transform")]="translate3d(0, 0, 0) translate("+b+"px, "+c+"px) rotate("+d+"deg)"},Card.appendToParent=function(a){var b=a.parentNode,c=(0,_utilities.elementChildren)(b),d=(0,_indexOf["default"])(c).call(c,a),e=d+1!==c.length;return e&&(a.remove(),b.append(a)),e},Card.prependToParent=function(a){var b=a.parentNode;a.remove(),b.insertBefore(a,b.firstChild)},Card.throwOutConfidence=function(a,b,c){var d=Math.min,e=Math.abs,f=d(e(a)/c.offsetWidth,1),g=d(e(b)/c.offsetHeight,1);return Math.max(f,g)},Card.isThrowOut=function(a,b,c,d){return 1===d},Card.throwOutDistance=function(a,b){return Math.floor(Math.random()*(b+1-a))+a},Card.rotation=function(a,b,c,d){var e=Math.min,f=e(Math.max(a/c.offsetWidth,-1),1),g=(0<b?1:-1)*e(Math.abs(b)/100,1);return f*g*d},Card.THROW_IN="in",Card.THROW_OUT="out";var _default=Card;exports["default"]=_default;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Direction":34,"./utilities":37,"@babel/runtime-corejs3/core-js-stable/instance/filter":5,"@babel/runtime-corejs3/core-js-stable/instance/for-each":8,"@babel/runtime-corejs3/core-js-stable/instance/includes":9,"@babel/runtime-corejs3/core-js-stable/instance/index-of":10,"@babel/runtime-corejs3/core-js-stable/object/define-properties":12,"@babel/runtime-corejs3/core-js-stable/object/define-property":13,"@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptor":14,"@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptors":15,"@babel/runtime-corejs3/core-js-stable/object/get-own-property-symbols":16,"@babel/runtime-corejs3/core-js-stable/object/keys":17,"@babel/runtime-corejs3/helpers/defineProperty":27,"@babel/runtime-corejs3/helpers/interopRequireDefault":28,"core-js/modules/web.timers":328,"hammerjs":329,"prefix":330,"rebound":331,"sister":332}],34:[function(require,module,exports){
"use strict";var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault"),_Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:!0}),exports["default"]=void 0;var _symbol=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/symbol")),Direction={DOWN:(0,_symbol["default"])("DOWN"),INVALID:(0,_symbol["default"])("INVALID"),LEFT:(0,_symbol["default"])("LEFT"),RIGHT:(0,_symbol["default"])("RIGHT"),UP:(0,_symbol["default"])("UP")},_default=Direction;exports["default"]=_default;
},{"@babel/runtime-corejs3/core-js-stable/object/define-property":13,"@babel/runtime-corejs3/core-js-stable/symbol":18,"@babel/runtime-corejs3/helpers/interopRequireDefault":28}],35:[function(require,module,exports){
"use strict";var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault"),_Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:!0}),exports["default"]=void 0;var _splice=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/splice")),_findIndex=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/find-index")),_toConsumableArray2=_interopRequireDefault(require("@babel/runtime-corejs3/helpers/toConsumableArray")),_find=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/find")),_forEach=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each")),_sister=_interopRequireDefault(require("sister")),_rebound=_interopRequireDefault(require("rebound")),_Card=_interopRequireDefault(require("./Card")),Stack=function(a){var b,c,d,e;return function construct(){e={},d=new _rebound["default"].SpringSystem,b=(0,_sister["default"])(),c=[]}(),e.on=b.on,e.off=b.off,e.getConfig=function(){return a},e.getSpringSystem=function(){return d},e.createCard=function(a,d){var f=(0,_Card["default"])(e,a,d),g=["throwout","throwoutend","throwoutleft","throwoutright","throwoutup","throwoutdown","throwin","throwinend","dragstart","dragmove","dragend"];return(0,_forEach["default"])(g).call(g,function(a){f.on(a,function(c){b.trigger(a,c)})}),c.push({card:f,element:a}),f},e.getCard=function(a){var b=(0,_find["default"])(c).call(c,function(b){return b===a||b.element===a});return b?b.card:null},e.getCards=function(){return(0,_toConsumableArray2["default"])(c)},e.destroyCard=function(a){var d=(0,_findIndex["default"])(c).call(c,function(b){return b===a||b.card===a}),e=-1!==d;return e&&((0,_splice["default"])(c).call(c,d,1),b.trigger("destroyCard",a)),e},e.destroyAll=function(){var a=c.length;return(0,_forEach["default"])(c).call(c,function(a){a.card.unbindListeners(),b.trigger("destroyCard",a.card)}),c.length=0,a},e},_default=Stack;exports["default"]=_default;
},{"./Card":33,"@babel/runtime-corejs3/core-js-stable/instance/find":7,"@babel/runtime-corejs3/core-js-stable/instance/find-index":6,"@babel/runtime-corejs3/core-js-stable/instance/for-each":8,"@babel/runtime-corejs3/core-js-stable/instance/splice":11,"@babel/runtime-corejs3/core-js-stable/object/define-property":13,"@babel/runtime-corejs3/helpers/interopRequireDefault":28,"@babel/runtime-corejs3/helpers/toConsumableArray":31,"rebound":331,"sister":332}],36:[function(require,module,exports){
"use strict";var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault"),_Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:!0}),exports["default"]=void 0;var _Card=_interopRequireDefault(require("./Card")),_Direction=_interopRequireDefault(require("./Direction")),_Stack=_interopRequireDefault(require("./Stack")),_default={Card:_Card["default"],Direction:_Direction["default"],Stack:_Stack["default"]};exports["default"]=_default;
},{"./Card":33,"./Direction":34,"./Stack":35,"@babel/runtime-corejs3/core-js-stable/object/define-property":13,"@babel/runtime-corejs3/helpers/interopRequireDefault":28}],37:[function(require,module,exports){
"use strict";var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault"),_Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:!0}),exports.isTouchDevice=exports.elementChildren=void 0;var _filter=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter")),_from=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/from")),elementChildren=function(a){var b=(0,_from["default"])(a.childNodes);return(0,_filter["default"])(b).call(b,function(a){return 1===a.nodeType})};exports.elementChildren=elementChildren;var touchDevide="ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch||navigator.maxTouchPoints||navigator.msMaxTouchPoints,isTouchDevice=function(){return touchDevide};exports.isTouchDevice=isTouchDevice;
},{"@babel/runtime-corejs3/core-js-stable/array/from":4,"@babel/runtime-corejs3/core-js-stable/instance/filter":5,"@babel/runtime-corejs3/core-js-stable/object/define-property":13,"@babel/runtime-corejs3/helpers/interopRequireDefault":28}],38:[function(require,module,exports){
'use strict';
var parent = require('../../stable/array/from');

module.exports = parent;

},{"../../stable/array/from":265}],39:[function(require,module,exports){
'use strict';
var parent = require('../../stable/array/is-array');

module.exports = parent;

},{"../../stable/array/is-array":266}],40:[function(require,module,exports){
'use strict';
var parent = require('../../stable/instance/slice');

module.exports = parent;

},{"../../stable/instance/slice":274}],41:[function(require,module,exports){
'use strict';
var parent = require('../stable/is-iterable');

module.exports = parent;

},{"../stable/is-iterable":276}],42:[function(require,module,exports){
'use strict';
var parent = require('../../stable/object/define-property');

module.exports = parent;

},{"../../stable/object/define-property":278}],43:[function(require,module,exports){
'use strict';
var parent = require('../../stable/symbol');

require('../../modules/esnext.function.metadata');
require('../../modules/esnext.symbol.async-dispose');
require('../../modules/esnext.symbol.dispose');
require('../../modules/esnext.symbol.metadata');

module.exports = parent;

},{"../../modules/esnext.function.metadata":250,"../../modules/esnext.symbol.async-dispose":251,"../../modules/esnext.symbol.dispose":252,"../../modules/esnext.symbol.metadata":259,"../../stable/symbol":283}],44:[function(require,module,exports){
'use strict';
require('../../modules/es.string.iterator');
require('../../modules/es.array.from');
var path = require('../../internals/path');

module.exports = path.Array.from;

},{"../../internals/path":178,"../../modules/es.array.from":212,"../../modules/es.string.iterator":231}],45:[function(require,module,exports){
'use strict';
require('../../modules/es.array.is-array');
var path = require('../../internals/path');

module.exports = path.Array.isArray;

},{"../../internals/path":178,"../../modules/es.array.is-array":215}],46:[function(require,module,exports){
'use strict';
require('../../../modules/es.array.filter');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'filter');

},{"../../../internals/get-built-in-prototype-method":129,"../../../modules/es.array.filter":208}],47:[function(require,module,exports){
'use strict';
require('../../../modules/es.array.find-index');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'findIndex');

},{"../../../internals/get-built-in-prototype-method":129,"../../../modules/es.array.find-index":209}],48:[function(require,module,exports){
'use strict';
require('../../../modules/es.array.find');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'find');

},{"../../../internals/get-built-in-prototype-method":129,"../../../modules/es.array.find":210}],49:[function(require,module,exports){
'use strict';
require('../../../modules/es.array.for-each');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'forEach');

},{"../../../internals/get-built-in-prototype-method":129,"../../../modules/es.array.for-each":211}],50:[function(require,module,exports){
'use strict';
require('../../../modules/es.array.includes');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'includes');

},{"../../../internals/get-built-in-prototype-method":129,"../../../modules/es.array.includes":213}],51:[function(require,module,exports){
'use strict';
require('../../../modules/es.array.index-of');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'indexOf');

},{"../../../internals/get-built-in-prototype-method":129,"../../../modules/es.array.index-of":214}],52:[function(require,module,exports){
'use strict';
require('../../../modules/es.array.slice');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'slice');

},{"../../../internals/get-built-in-prototype-method":129,"../../../modules/es.array.slice":217}],53:[function(require,module,exports){
'use strict';
require('../../../modules/es.array.splice');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'splice');

},{"../../../internals/get-built-in-prototype-method":129,"../../../modules/es.array.splice":218}],54:[function(require,module,exports){
'use strict';
var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/filter');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.filter;
  return it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.filter) ? method : own;
};

},{"../../internals/object-is-prototype-of":170,"../array/virtual/filter":46}],55:[function(require,module,exports){
'use strict';
var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/find-index');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.findIndex;
  return it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.findIndex) ? method : own;
};

},{"../../internals/object-is-prototype-of":170,"../array/virtual/find-index":47}],56:[function(require,module,exports){
'use strict';
var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/find');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.find;
  return it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.find) ? method : own;
};

},{"../../internals/object-is-prototype-of":170,"../array/virtual/find":48}],57:[function(require,module,exports){
'use strict';
var isPrototypeOf = require('../../internals/object-is-prototype-of');
var arrayMethod = require('../array/virtual/includes');
var stringMethod = require('../string/virtual/includes');

var ArrayPrototype = Array.prototype;
var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.includes;
  if (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.includes)) return arrayMethod;
  if (typeof it == 'string' || it === StringPrototype || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.includes)) {
    return stringMethod;
  } return own;
};

},{"../../internals/object-is-prototype-of":170,"../array/virtual/includes":50,"../string/virtual/includes":68}],58:[function(require,module,exports){
'use strict';
var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/index-of');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.indexOf;
  return it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.indexOf) ? method : own;
};

},{"../../internals/object-is-prototype-of":170,"../array/virtual/index-of":51}],59:[function(require,module,exports){
'use strict';
var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/slice');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.slice;
  return it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.slice) ? method : own;
};

},{"../../internals/object-is-prototype-of":170,"../array/virtual/slice":52}],60:[function(require,module,exports){
'use strict';
var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/splice');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.splice;
  return it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.splice) ? method : own;
};

},{"../../internals/object-is-prototype-of":170,"../array/virtual/splice":53}],61:[function(require,module,exports){
'use strict';
require('../modules/es.array.iterator');
require('../modules/es.string.iterator');
var isIterable = require('../internals/is-iterable');

module.exports = isIterable;

},{"../internals/is-iterable":148,"../modules/es.array.iterator":216,"../modules/es.string.iterator":231}],62:[function(require,module,exports){
'use strict';
require('../../modules/es.object.define-properties');
var path = require('../../internals/path');

var Object = path.Object;

var defineProperties = module.exports = function defineProperties(T, D) {
  return Object.defineProperties(T, D);
};

if (Object.defineProperties.sham) defineProperties.sham = true;

},{"../../internals/path":178,"../../modules/es.object.define-properties":222}],63:[function(require,module,exports){
'use strict';
require('../../modules/es.object.define-property');
var path = require('../../internals/path');

var Object = path.Object;

var defineProperty = module.exports = function defineProperty(it, key, desc) {
  return Object.defineProperty(it, key, desc);
};

if (Object.defineProperty.sham) defineProperty.sham = true;

},{"../../internals/path":178,"../../modules/es.object.define-property":223}],64:[function(require,module,exports){
'use strict';
require('../../modules/es.object.get-own-property-descriptor');
var path = require('../../internals/path');

var Object = path.Object;

var getOwnPropertyDescriptor = module.exports = function getOwnPropertyDescriptor(it, key) {
  return Object.getOwnPropertyDescriptor(it, key);
};

if (Object.getOwnPropertyDescriptor.sham) getOwnPropertyDescriptor.sham = true;

},{"../../internals/path":178,"../../modules/es.object.get-own-property-descriptor":224}],65:[function(require,module,exports){
'use strict';
require('../../modules/es.object.get-own-property-descriptors');
var path = require('../../internals/path');

module.exports = path.Object.getOwnPropertyDescriptors;

},{"../../internals/path":178,"../../modules/es.object.get-own-property-descriptors":225}],66:[function(require,module,exports){
'use strict';
require('../../modules/es.symbol');
var path = require('../../internals/path');

module.exports = path.Object.getOwnPropertySymbols;

},{"../../internals/path":178,"../../modules/es.symbol":239}],67:[function(require,module,exports){
'use strict';
require('../../modules/es.object.keys');
var path = require('../../internals/path');

module.exports = path.Object.keys;

},{"../../internals/path":178,"../../modules/es.object.keys":227}],68:[function(require,module,exports){
'use strict';
require('../../../modules/es.string.includes');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('String', 'includes');

},{"../../../internals/get-built-in-prototype-method":129,"../../../modules/es.string.includes":230}],69:[function(require,module,exports){
'use strict';
require('../../modules/es.array.concat');
require('../../modules/es.object.to-string');
require('../../modules/es.symbol');
require('../../modules/es.symbol.async-iterator');
require('../../modules/es.symbol.description');
require('../../modules/es.symbol.has-instance');
require('../../modules/es.symbol.is-concat-spreadable');
require('../../modules/es.symbol.iterator');
require('../../modules/es.symbol.match');
require('../../modules/es.symbol.match-all');
require('../../modules/es.symbol.replace');
require('../../modules/es.symbol.search');
require('../../modules/es.symbol.species');
require('../../modules/es.symbol.split');
require('../../modules/es.symbol.to-primitive');
require('../../modules/es.symbol.to-string-tag');
require('../../modules/es.symbol.unscopables');
require('../../modules/es.json.to-string-tag');
require('../../modules/es.math.to-string-tag');
require('../../modules/es.reflect.to-string-tag');
var path = require('../../internals/path');

module.exports = path.Symbol;

},{"../../internals/path":178,"../../modules/es.array.concat":207,"../../modules/es.json.to-string-tag":220,"../../modules/es.math.to-string-tag":221,"../../modules/es.object.to-string":228,"../../modules/es.reflect.to-string-tag":229,"../../modules/es.symbol":239,"../../modules/es.symbol.async-iterator":232,"../../modules/es.symbol.description":234,"../../modules/es.symbol.has-instance":236,"../../modules/es.symbol.is-concat-spreadable":237,"../../modules/es.symbol.iterator":238,"../../modules/es.symbol.match":242,"../../modules/es.symbol.match-all":241,"../../modules/es.symbol.replace":243,"../../modules/es.symbol.search":244,"../../modules/es.symbol.species":245,"../../modules/es.symbol.split":246,"../../modules/es.symbol.to-primitive":247,"../../modules/es.symbol.to-string-tag":248,"../../modules/es.symbol.unscopables":249}],70:[function(require,module,exports){
'use strict';
module.exports = require('../../full/array/from');

},{"../../full/array/from":76}],71:[function(require,module,exports){
'use strict';
module.exports = require('../../full/array/is-array');

},{"../../full/array/is-array":77}],72:[function(require,module,exports){
'use strict';
module.exports = require('../../full/instance/slice');

},{"../../full/instance/slice":78}],73:[function(require,module,exports){
'use strict';
module.exports = require('../full/is-iterable');

},{"../full/is-iterable":79}],74:[function(require,module,exports){
'use strict';
module.exports = require('../../full/object/define-property');

},{"../../full/object/define-property":80}],75:[function(require,module,exports){
'use strict';
module.exports = require('../../full/symbol');

},{"../../full/symbol":81}],76:[function(require,module,exports){
'use strict';
var parent = require('../../actual/array/from');

module.exports = parent;

},{"../../actual/array/from":38}],77:[function(require,module,exports){
'use strict';
var parent = require('../../actual/array/is-array');

module.exports = parent;

},{"../../actual/array/is-array":39}],78:[function(require,module,exports){
'use strict';
var parent = require('../../actual/instance/slice');

module.exports = parent;

},{"../../actual/instance/slice":40}],79:[function(require,module,exports){
'use strict';
var parent = require('../actual/is-iterable');

module.exports = parent;

},{"../actual/is-iterable":41}],80:[function(require,module,exports){
'use strict';
var parent = require('../../actual/object/define-property');

module.exports = parent;

},{"../../actual/object/define-property":42}],81:[function(require,module,exports){
'use strict';
var parent = require('../../actual/symbol');
require('../../modules/esnext.symbol.is-registered-symbol');
require('../../modules/esnext.symbol.is-well-known-symbol');
require('../../modules/esnext.symbol.matcher');
require('../../modules/esnext.symbol.observable');
// TODO: Remove from `core-js@4`
require('../../modules/esnext.symbol.is-registered');
require('../../modules/esnext.symbol.is-well-known');
require('../../modules/esnext.symbol.metadata-key');
require('../../modules/esnext.symbol.pattern-match');
require('../../modules/esnext.symbol.replace-all');

module.exports = parent;

},{"../../actual/symbol":43,"../../modules/esnext.symbol.is-registered":254,"../../modules/esnext.symbol.is-registered-symbol":253,"../../modules/esnext.symbol.is-well-known":256,"../../modules/esnext.symbol.is-well-known-symbol":255,"../../modules/esnext.symbol.matcher":257,"../../modules/esnext.symbol.metadata-key":258,"../../modules/esnext.symbol.observable":260,"../../modules/esnext.symbol.pattern-match":261,"../../modules/esnext.symbol.replace-all":262}],82:[function(require,module,exports){
'use strict';
var isCallable = require('../internals/is-callable');
var tryToString = require('../internals/try-to-string');

var $TypeError = TypeError;

// `Assert: IsCallable(argument) is true`
module.exports = function (argument) {
  if (isCallable(argument)) return argument;
  throw new $TypeError(tryToString(argument) + ' is not a function');
};

},{"../internals/is-callable":145,"../internals/try-to-string":199}],83:[function(require,module,exports){
'use strict';
var isCallable = require('../internals/is-callable');

var $String = String;
var $TypeError = TypeError;

module.exports = function (argument) {
  if (typeof argument == 'object' || isCallable(argument)) return argument;
  throw new $TypeError("Can't set " + $String(argument) + ' as a prototype');
};

},{"../internals/is-callable":145}],84:[function(require,module,exports){
'use strict';
module.exports = function () { /* empty */ };

},{}],85:[function(require,module,exports){
'use strict';
var isObject = require('../internals/is-object');

var $String = String;
var $TypeError = TypeError;

// `Assert: Type(argument) is Object`
module.exports = function (argument) {
  if (isObject(argument)) return argument;
  throw new $TypeError($String(argument) + ' is not an object');
};

},{"../internals/is-object":150}],86:[function(require,module,exports){
'use strict';
var $forEach = require('../internals/array-iteration').forEach;
var arrayMethodIsStrict = require('../internals/array-method-is-strict');

var STRICT_METHOD = arrayMethodIsStrict('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
module.exports = !STRICT_METHOD ? function forEach(callbackfn /* , thisArg */) {
  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
} : [].forEach;

},{"../internals/array-iteration":89,"../internals/array-method-is-strict":91}],87:[function(require,module,exports){
'use strict';
var bind = require('../internals/function-bind-context');
var call = require('../internals/function-call');
var toObject = require('../internals/to-object');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var isArrayIteratorMethod = require('../internals/is-array-iterator-method');
var isConstructor = require('../internals/is-constructor');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var createProperty = require('../internals/create-property');
var getIterator = require('../internals/get-iterator');
var getIteratorMethod = require('../internals/get-iterator-method');

var $Array = Array;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
module.exports = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var IS_CONSTRUCTOR = isConstructor(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod && !(this === $Array && isArrayIteratorMethod(iteratorMethod))) {
    iterator = getIterator(O, iteratorMethod);
    next = iterator.next;
    result = IS_CONSTRUCTOR ? new this() : [];
    for (;!(step = call(next, iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty(result, index, value);
    }
  } else {
    length = lengthOfArrayLike(O);
    result = IS_CONSTRUCTOR ? new this(length) : $Array(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty(result, index, value);
    }
  }
  result.length = index;
  return result;
};

},{"../internals/call-with-safe-iteration-closing":97,"../internals/create-property":106,"../internals/function-bind-context":122,"../internals/function-call":124,"../internals/get-iterator":132,"../internals/get-iterator-method":131,"../internals/is-array-iterator-method":143,"../internals/is-constructor":146,"../internals/length-of-array-like":159,"../internals/to-object":194}],88:[function(require,module,exports){
'use strict';
var toIndexedObject = require('../internals/to-indexed-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var lengthOfArrayLike = require('../internals/length-of-array-like');

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el !== el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value !== value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

},{"../internals/length-of-array-like":159,"../internals/to-absolute-index":190,"../internals/to-indexed-object":191}],89:[function(require,module,exports){
'use strict';
var bind = require('../internals/function-bind-context');
var uncurryThis = require('../internals/function-uncurry-this');
var IndexedObject = require('../internals/indexed-object');
var toObject = require('../internals/to-object');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var arraySpeciesCreate = require('../internals/array-species-create');

var push = uncurryThis([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod = function (TYPE) {
  var IS_MAP = TYPE === 1;
  var IS_FILTER = TYPE === 2;
  var IS_SOME = TYPE === 3;
  var IS_EVERY = TYPE === 4;
  var IS_FIND_INDEX = TYPE === 6;
  var IS_FILTER_REJECT = TYPE === 7;
  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = IndexedObject(O);
    var boundFunction = bind(callbackfn, that);
    var length = lengthOfArrayLike(self);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

module.exports = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod(7)
};

},{"../internals/array-species-create":96,"../internals/function-bind-context":122,"../internals/function-uncurry-this":128,"../internals/indexed-object":140,"../internals/length-of-array-like":159,"../internals/to-object":194}],90:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');
var wellKnownSymbol = require('../internals/well-known-symbol');
var V8_VERSION = require('../internals/engine-v8-version');

var SPECIES = wellKnownSymbol('species');

module.exports = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

},{"../internals/engine-v8-version":117,"../internals/fails":120,"../internals/well-known-symbol":206}],91:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

module.exports = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};

},{"../internals/fails":120}],92:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var isArray = require('../internals/is-array');

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Safari < 13 does not throw an error in this case
var SILENT_ON_NON_WRITABLE_LENGTH_SET = DESCRIPTORS && !function () {
  // makes no sense without proper strict mode support
  if (this !== undefined) return true;
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).length = 1;
  } catch (error) {
    return error instanceof TypeError;
  }
}();

module.exports = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function (O, length) {
  if (isArray(O) && !getOwnPropertyDescriptor(O, 'length').writable) {
    throw new $TypeError('Cannot set read only .length');
  } return O.length = length;
} : function (O, length) {
  return O.length = length;
};

},{"../internals/descriptors":111,"../internals/is-array":144}],93:[function(require,module,exports){
'use strict';
var toAbsoluteIndex = require('../internals/to-absolute-index');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var createProperty = require('../internals/create-property');

var $Array = Array;
var max = Math.max;

module.exports = function (O, start, end) {
  var length = lengthOfArrayLike(O);
  var k = toAbsoluteIndex(start, length);
  var fin = toAbsoluteIndex(end === undefined ? length : end, length);
  var result = $Array(max(fin - k, 0));
  var n = 0;
  for (; k < fin; k++, n++) createProperty(result, n, O[k]);
  result.length = n;
  return result;
};

},{"../internals/create-property":106,"../internals/length-of-array-like":159,"../internals/to-absolute-index":190}],94:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

module.exports = uncurryThis([].slice);

},{"../internals/function-uncurry-this":128}],95:[function(require,module,exports){
'use strict';
var isArray = require('../internals/is-array');
var isConstructor = require('../internals/is-constructor');
var isObject = require('../internals/is-object');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');
var $Array = Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor(C) && (C === $Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? $Array : C;
};

},{"../internals/is-array":144,"../internals/is-constructor":146,"../internals/is-object":150,"../internals/well-known-symbol":206}],96:[function(require,module,exports){
'use strict';
var arraySpeciesConstructor = require('../internals/array-species-constructor');

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};

},{"../internals/array-species-constructor":95}],97:[function(require,module,exports){
'use strict';
var anObject = require('../internals/an-object');
var iteratorClose = require('../internals/iterator-close');

// call something on iterator step with safe closing on error
module.exports = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose(iterator, 'throw', error);
  }
};

},{"../internals/an-object":85,"../internals/iterator-close":154}],98:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR] = function () {
    return this;
  };
  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

module.exports = function (exec, SKIP_CLOSING) {
  try {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  } catch (error) { return false; } // workaround of old WebKit + `eval` bug
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

},{"../internals/well-known-symbol":206}],99:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

var toString = uncurryThis({}.toString);
var stringSlice = uncurryThis(''.slice);

module.exports = function (it) {
  return stringSlice(toString(it), 8, -1);
};

},{"../internals/function-uncurry-this":128}],100:[function(require,module,exports){
'use strict';
var TO_STRING_TAG_SUPPORT = require('../internals/to-string-tag-support');
var isCallable = require('../internals/is-callable');
var classofRaw = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var $Object = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
};

},{"../internals/classof-raw":99,"../internals/is-callable":145,"../internals/to-string-tag-support":197,"../internals/well-known-symbol":206}],101:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');

var MATCH = wellKnownSymbol('match');

module.exports = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (error1) {
    try {
      regexp[MATCH] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (error2) { /* empty */ }
  } return false;
};

},{"../internals/well-known-symbol":206}],102:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

},{"../internals/fails":120}],103:[function(require,module,exports){
'use strict';
// `CreateIterResultObject` abstract operation
// https://tc39.es/ecma262/#sec-createiterresultobject
module.exports = function (value, done) {
  return { value: value, done: done };
};

},{}],104:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"../internals/create-property-descriptor":105,"../internals/descriptors":111,"../internals/object-define-property":164}],105:[function(require,module,exports){
'use strict';
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],106:[function(require,module,exports){
'use strict';
var toPropertyKey = require('../internals/to-property-key');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = function (object, key, value) {
  var propertyKey = toPropertyKey(key);
  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};

},{"../internals/create-property-descriptor":105,"../internals/object-define-property":164,"../internals/to-property-key":196}],107:[function(require,module,exports){
'use strict';
var defineProperty = require('../internals/object-define-property');

module.exports = function (target, name, descriptor) {
  return defineProperty.f(target, name, descriptor);
};

},{"../internals/object-define-property":164}],108:[function(require,module,exports){
'use strict';
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');

module.exports = function (target, key, value, options) {
  if (options && options.enumerable) target[key] = value;
  else createNonEnumerableProperty(target, key, value);
  return target;
};

},{"../internals/create-non-enumerable-property":104}],109:[function(require,module,exports){
'use strict';
var global = require('../internals/global');

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;

module.exports = function (key, value) {
  try {
    defineProperty(global, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global[key] = value;
  } return value;
};

},{"../internals/global":135}],110:[function(require,module,exports){
'use strict';
var tryToString = require('../internals/try-to-string');

var $TypeError = TypeError;

module.exports = function (O, P) {
  if (!delete O[P]) throw new $TypeError('Cannot delete property ' + tryToString(P) + ' of ' + tryToString(O));
};

},{"../internals/try-to-string":199}],111:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

// Detect IE8's incomplete defineProperty implementation
module.exports = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});

},{"../internals/fails":120}],112:[function(require,module,exports){
'use strict';
var documentAll = typeof document == 'object' && document.all;

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
var IS_HTMLDDA = typeof documentAll == 'undefined' && documentAll !== undefined;

module.exports = {
  all: documentAll,
  IS_HTMLDDA: IS_HTMLDDA
};

},{}],113:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var isObject = require('../internals/is-object');

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};

},{"../internals/global":135,"../internals/is-object":150}],114:[function(require,module,exports){
'use strict';
var $TypeError = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

module.exports = function (it) {
  if (it > MAX_SAFE_INTEGER) throw $TypeError('Maximum allowed index exceeded');
  return it;
};

},{}],115:[function(require,module,exports){
'use strict';
// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
module.exports = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

},{}],116:[function(require,module,exports){
'use strict';
module.exports = typeof navigator != 'undefined' && String(navigator.userAgent) || '';

},{}],117:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var userAgent = require('../internals/engine-user-agent');

var process = global.process;
var Deno = global.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

module.exports = version;

},{"../internals/engine-user-agent":116,"../internals/global":135}],118:[function(require,module,exports){
'use strict';
// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

},{}],119:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var apply = require('../internals/function-apply');
var uncurryThis = require('../internals/function-uncurry-this-clause');
var isCallable = require('../internals/is-callable');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var isForced = require('../internals/is-forced');
var path = require('../internals/path');
var bind = require('../internals/function-bind-context');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var hasOwn = require('../internals/has-own-property');

var wrapConstructor = function (NativeConstructor) {
  var Wrapper = function (a, b, c) {
    if (this instanceof Wrapper) {
      switch (arguments.length) {
        case 0: return new NativeConstructor();
        case 1: return new NativeConstructor(a);
        case 2: return new NativeConstructor(a, b);
      } return new NativeConstructor(a, b, c);
    } return apply(NativeConstructor, this, arguments);
  };
  Wrapper.prototype = NativeConstructor.prototype;
  return Wrapper;
};

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var PROTO = options.proto;

  var nativeSource = GLOBAL ? global : STATIC ? global[TARGET] : (global[TARGET] || {}).prototype;

  var target = GLOBAL ? path : path[TARGET] || createNonEnumerableProperty(path, TARGET, {})[TARGET];
  var targetPrototype = target.prototype;

  var FORCED, USE_NATIVE, VIRTUAL_PROTOTYPE;
  var key, sourceProperty, targetProperty, nativeProperty, resultProperty, descriptor;

  for (key in source) {
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contains in native
    USE_NATIVE = !FORCED && nativeSource && hasOwn(nativeSource, key);

    targetProperty = target[key];

    if (USE_NATIVE) if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor(nativeSource, key);
      nativeProperty = descriptor && descriptor.value;
    } else nativeProperty = nativeSource[key];

    // export native or implementation
    sourceProperty = (USE_NATIVE && nativeProperty) ? nativeProperty : source[key];

    if (USE_NATIVE && typeof targetProperty == typeof sourceProperty) continue;

    // bind methods to global for calling from export context
    if (options.bind && USE_NATIVE) resultProperty = bind(sourceProperty, global);
    // wrap global constructors for prevent changes in this version
    else if (options.wrap && USE_NATIVE) resultProperty = wrapConstructor(sourceProperty);
    // make static versions for prototype methods
    else if (PROTO && isCallable(sourceProperty)) resultProperty = uncurryThis(sourceProperty);
    // default case
    else resultProperty = sourceProperty;

    // add a flag to not completely full polyfills
    if (options.sham || (sourceProperty && sourceProperty.sham) || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(resultProperty, 'sham', true);
    }

    createNonEnumerableProperty(target, key, resultProperty);

    if (PROTO) {
      VIRTUAL_PROTOTYPE = TARGET + 'Prototype';
      if (!hasOwn(path, VIRTUAL_PROTOTYPE)) {
        createNonEnumerableProperty(path, VIRTUAL_PROTOTYPE, {});
      }
      // export virtual prototype methods
      createNonEnumerableProperty(path[VIRTUAL_PROTOTYPE], key, sourceProperty);
      // export real prototype methods
      if (options.real && targetPrototype && (FORCED || !targetPrototype[key])) {
        createNonEnumerableProperty(targetPrototype, key, sourceProperty);
      }
    }
  }
};

},{"../internals/create-non-enumerable-property":104,"../internals/function-apply":121,"../internals/function-bind-context":122,"../internals/function-uncurry-this-clause":127,"../internals/global":135,"../internals/has-own-property":136,"../internals/is-callable":145,"../internals/is-forced":147,"../internals/object-get-own-property-descriptor":165,"../internals/path":178}],120:[function(require,module,exports){
'use strict';
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

},{}],121:[function(require,module,exports){
'use strict';
var NATIVE_BIND = require('../internals/function-bind-native');

var FunctionPrototype = Function.prototype;
var apply = FunctionPrototype.apply;
var call = FunctionPrototype.call;

// eslint-disable-next-line es/no-reflect -- safe
module.exports = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function () {
  return call.apply(apply, arguments);
});

},{"../internals/function-bind-native":123}],122:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this-clause');
var aCallable = require('../internals/a-callable');
var NATIVE_BIND = require('../internals/function-bind-native');

var bind = uncurryThis(uncurryThis.bind);

// optional / simple context binding
module.exports = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : NATIVE_BIND ? bind(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"../internals/a-callable":82,"../internals/function-bind-native":123,"../internals/function-uncurry-this-clause":127}],123:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

module.exports = !fails(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

},{"../internals/fails":120}],124:[function(require,module,exports){
'use strict';
var NATIVE_BIND = require('../internals/function-bind-native');

var call = Function.prototype.call;

module.exports = NATIVE_BIND ? call.bind(call) : function () {
  return call.apply(call, arguments);
};

},{"../internals/function-bind-native":123}],125:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var hasOwn = require('../internals/has-own-property');

var FunctionPrototype = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn(FunctionPrototype, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS || (DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable));

module.exports = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};

},{"../internals/descriptors":111,"../internals/has-own-property":136}],126:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var aCallable = require('../internals/a-callable');

module.exports = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};

},{"../internals/a-callable":82,"../internals/function-uncurry-this":128}],127:[function(require,module,exports){
'use strict';
var classofRaw = require('../internals/classof-raw');
var uncurryThis = require('../internals/function-uncurry-this');

module.exports = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (classofRaw(fn) === 'Function') return uncurryThis(fn);
};

},{"../internals/classof-raw":99,"../internals/function-uncurry-this":128}],128:[function(require,module,exports){
'use strict';
var NATIVE_BIND = require('../internals/function-bind-native');

var FunctionPrototype = Function.prototype;
var call = FunctionPrototype.call;
var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);

module.exports = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
  return function () {
    return call.apply(fn, arguments);
  };
};

},{"../internals/function-bind-native":123}],129:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var path = require('../internals/path');

module.exports = function (CONSTRUCTOR, METHOD) {
  var $namespace = path[CONSTRUCTOR + 'Prototype'];
  return $namespace && $namespace[METHOD] || global[CONSTRUCTOR].prototype[METHOD];
};

},{"../internals/global":135,"../internals/path":178}],130:[function(require,module,exports){
'use strict';
var path = require('../internals/path');
var global = require('../internals/global');
var isCallable = require('../internals/is-callable');

var aFunction = function (variable) {
  return isCallable(variable) ? variable : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
    : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
};

},{"../internals/global":135,"../internals/is-callable":145,"../internals/path":178}],131:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof');
var getMethod = require('../internals/get-method');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var Iterators = require('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR)
    || getMethod(it, '@@iterator')
    || Iterators[classof(it)];
};

},{"../internals/classof":100,"../internals/get-method":134,"../internals/is-null-or-undefined":149,"../internals/iterators":158,"../internals/well-known-symbol":206}],132:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');
var getIteratorMethod = require('../internals/get-iterator-method');

var $TypeError = TypeError;

module.exports = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
  if (aCallable(iteratorMethod)) return anObject(call(iteratorMethod, argument));
  throw new $TypeError(tryToString(argument) + ' is not iterable');
};

},{"../internals/a-callable":82,"../internals/an-object":85,"../internals/function-call":124,"../internals/get-iterator-method":131,"../internals/try-to-string":199}],133:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var isArray = require('../internals/is-array');
var isCallable = require('../internals/is-callable');
var classof = require('../internals/classof-raw');
var toString = require('../internals/to-string');

var push = uncurryThis([].push);

module.exports = function (replacer) {
  if (isCallable(replacer)) return replacer;
  if (!isArray(replacer)) return;
  var rawLength = replacer.length;
  var keys = [];
  for (var i = 0; i < rawLength; i++) {
    var element = replacer[i];
    if (typeof element == 'string') push(keys, element);
    else if (typeof element == 'number' || classof(element) === 'Number' || classof(element) === 'String') push(keys, toString(element));
  }
  var keysLength = keys.length;
  var root = true;
  return function (key, value) {
    if (root) {
      root = false;
      return value;
    }
    if (isArray(this)) return value;
    for (var j = 0; j < keysLength; j++) if (keys[j] === key) return value;
  };
};

},{"../internals/classof-raw":99,"../internals/function-uncurry-this":128,"../internals/is-array":144,"../internals/is-callable":145,"../internals/to-string":198}],134:[function(require,module,exports){
'use strict';
var aCallable = require('../internals/a-callable');
var isNullOrUndefined = require('../internals/is-null-or-undefined');

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
module.exports = function (V, P) {
  var func = V[P];
  return isNullOrUndefined(func) ? undefined : aCallable(func);
};

},{"../internals/a-callable":82,"../internals/is-null-or-undefined":149}],135:[function(require,module,exports){
(function (global){(function (){
'use strict';
var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || this || Function('return this')();

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],136:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var toObject = require('../internals/to-object');

var hasOwnProperty = uncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
module.exports = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};

},{"../internals/function-uncurry-this":128,"../internals/to-object":194}],137:[function(require,module,exports){
'use strict';
module.exports = {};

},{}],138:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');

module.exports = getBuiltIn('document', 'documentElement');

},{"../internals/get-built-in":130}],139:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var createElement = require('../internals/document-create-element');

// Thanks to IE8 for its funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});

},{"../internals/descriptors":111,"../internals/document-create-element":113,"../internals/fails":120}],140:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var classof = require('../internals/classof-raw');

var $Object = Object;
var split = uncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) === 'String' ? split(it, '') : $Object(it);
} : $Object;

},{"../internals/classof-raw":99,"../internals/fails":120,"../internals/function-uncurry-this":128}],141:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var isCallable = require('../internals/is-callable');
var store = require('../internals/shared-store');

var functionToString = uncurryThis(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(store.inspectSource)) {
  store.inspectSource = function (it) {
    return functionToString(it);
  };
}

module.exports = store.inspectSource;

},{"../internals/function-uncurry-this":128,"../internals/is-callable":145,"../internals/shared-store":182}],142:[function(require,module,exports){
'use strict';
var NATIVE_WEAK_MAP = require('../internals/weak-map-basic-detection');
var global = require('../internals/global');
var isObject = require('../internals/is-object');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var hasOwn = require('../internals/has-own-property');
var shared = require('../internals/shared-store');
var sharedKey = require('../internals/shared-key');
var hiddenKeys = require('../internals/hidden-keys');

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError = global.TypeError;
var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw new TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP || shared.state) {
  var store = shared.state || (shared.state = new WeakMap());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set = function (it, metadata) {
    if (store.has(it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get = function (it) {
    return store.get(it) || {};
  };
  has = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

},{"../internals/create-non-enumerable-property":104,"../internals/global":135,"../internals/has-own-property":136,"../internals/hidden-keys":137,"../internals/is-object":150,"../internals/shared-key":181,"../internals/shared-store":182,"../internals/weak-map-basic-detection":203}],143:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');
var Iterators = require('../internals/iterators');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};

},{"../internals/iterators":158,"../internals/well-known-symbol":206}],144:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof-raw');

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
module.exports = Array.isArray || function isArray(argument) {
  return classof(argument) === 'Array';
};

},{"../internals/classof-raw":99}],145:[function(require,module,exports){
'use strict';
var $documentAll = require('../internals/document-all');

var documentAll = $documentAll.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
module.exports = $documentAll.IS_HTMLDDA ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};

},{"../internals/document-all":112}],146:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');
var classof = require('../internals/classof');
var getBuiltIn = require('../internals/get-built-in');
var inspectSource = require('../internals/inspect-source');

var noop = function () { /* empty */ };
var empty = [];
var construct = getBuiltIn('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec = uncurryThis(constructorRegExp.exec);
var INCORRECT_TO_STRING = !constructorRegExp.test(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  try {
    construct(noop, empty, argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  switch (classof(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
module.exports = !construct || fails(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;

},{"../internals/classof":100,"../internals/fails":120,"../internals/function-uncurry-this":128,"../internals/get-built-in":130,"../internals/inspect-source":141,"../internals/is-callable":145}],147:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;

},{"../internals/fails":120,"../internals/is-callable":145}],148:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof');
var hasOwn = require('../internals/has-own-property');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var wellKnownSymbol = require('../internals/well-known-symbol');
var Iterators = require('../internals/iterators');

var ITERATOR = wellKnownSymbol('iterator');
var $Object = Object;

module.exports = function (it) {
  if (isNullOrUndefined(it)) return false;
  var O = $Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    || hasOwn(Iterators, classof(O));
};

},{"../internals/classof":100,"../internals/has-own-property":136,"../internals/is-null-or-undefined":149,"../internals/iterators":158,"../internals/well-known-symbol":206}],149:[function(require,module,exports){
'use strict';
// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
module.exports = function (it) {
  return it === null || it === undefined;
};

},{}],150:[function(require,module,exports){
'use strict';
var isCallable = require('../internals/is-callable');
var $documentAll = require('../internals/document-all');

var documentAll = $documentAll.all;

module.exports = $documentAll.IS_HTMLDDA ? function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it) || it === documentAll;
} : function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};

},{"../internals/document-all":112,"../internals/is-callable":145}],151:[function(require,module,exports){
'use strict';
module.exports = true;

},{}],152:[function(require,module,exports){
'use strict';
var isObject = require('../internals/is-object');
var classof = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classof(it) === 'RegExp');
};

},{"../internals/classof-raw":99,"../internals/is-object":150,"../internals/well-known-symbol":206}],153:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');
var isCallable = require('../internals/is-callable');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');

var $Object = Object;

module.exports = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
};

},{"../internals/get-built-in":130,"../internals/is-callable":145,"../internals/object-is-prototype-of":170,"../internals/use-symbol-as-uid":201}],154:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var getMethod = require('../internals/get-method');

module.exports = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject(iterator);
  try {
    innerResult = getMethod(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = call(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject(innerResult);
  return value;
};

},{"../internals/an-object":85,"../internals/function-call":124,"../internals/get-method":134}],155:[function(require,module,exports){
'use strict';
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var create = require('../internals/object-create');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var setToStringTag = require('../internals/set-to-string-tag');
var Iterators = require('../internals/iterators');

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};

},{"../internals/create-property-descriptor":105,"../internals/iterators":158,"../internals/iterators-core":157,"../internals/object-create":162,"../internals/set-to-string-tag":180}],156:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var IS_PURE = require('../internals/is-pure');
var FunctionName = require('../internals/function-name');
var isCallable = require('../internals/is-callable');
var createIteratorConstructor = require('../internals/iterator-create-constructor');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var setToStringTag = require('../internals/set-to-string-tag');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIn = require('../internals/define-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');
var Iterators = require('../internals/iterators');
var IteratorsCore = require('../internals/iterators-core');

var PROPER_FUNCTION_NAME = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    }

    return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (!isCallable(CurrentIteratorPrototype[ITERATOR])) {
          defineBuiltIn(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if (!IS_PURE && CONFIGURABLE_FUNCTION_NAME) {
      createNonEnumerableProperty(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return call(nativeIterator, this); };
    }
  }

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        defineBuiltIn(IterablePrototype, KEY, methods[KEY]);
      }
    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    defineBuiltIn(IterablePrototype, ITERATOR, defaultIterator, { name: DEFAULT });
  }
  Iterators[NAME] = defaultIterator;

  return methods;
};

},{"../internals/create-non-enumerable-property":104,"../internals/define-built-in":108,"../internals/export":119,"../internals/function-call":124,"../internals/function-name":125,"../internals/is-callable":145,"../internals/is-pure":151,"../internals/iterator-create-constructor":155,"../internals/iterators":158,"../internals/iterators-core":157,"../internals/object-get-prototype-of":169,"../internals/object-set-prototype-of":174,"../internals/set-to-string-tag":180,"../internals/well-known-symbol":206}],157:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');
var isObject = require('../internals/is-object');
var create = require('../internals/object-create');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var defineBuiltIn = require('../internals/define-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IS_PURE = require('../internals/is-pure');

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = !isObject(IteratorPrototype) || fails(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype[ITERATOR].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};
else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable(IteratorPrototype[ITERATOR])) {
  defineBuiltIn(IteratorPrototype, ITERATOR, function () {
    return this;
  });
}

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

},{"../internals/define-built-in":108,"../internals/fails":120,"../internals/is-callable":145,"../internals/is-object":150,"../internals/is-pure":151,"../internals/object-create":162,"../internals/object-get-prototype-of":169,"../internals/well-known-symbol":206}],158:[function(require,module,exports){
arguments[4][137][0].apply(exports,arguments)
},{"dup":137}],159:[function(require,module,exports){
'use strict';
var toLength = require('../internals/to-length');

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
module.exports = function (obj) {
  return toLength(obj.length);
};

},{"../internals/to-length":193}],160:[function(require,module,exports){
'use strict';
var ceil = Math.ceil;
var floor = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
module.exports = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor : ceil)(n);
};

},{}],161:[function(require,module,exports){
'use strict';
var isRegExp = require('../internals/is-regexp');

var $TypeError = TypeError;

module.exports = function (it) {
  if (isRegExp(it)) {
    throw new $TypeError("The method doesn't accept regular expressions");
  } return it;
};

},{"../internals/is-regexp":152}],162:[function(require,module,exports){
'use strict';
/* global ActiveXObject -- old IE, WSH */
var anObject = require('../internals/an-object');
var definePropertiesModule = require('../internals/object-define-properties');
var enumBugKeys = require('../internals/enum-bug-keys');
var hiddenKeys = require('../internals/hidden-keys');
var html = require('../internals/html');
var documentCreateElement = require('../internals/document-create-element');
var sharedKey = require('../internals/shared-key');

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
};

},{"../internals/an-object":85,"../internals/document-create-element":113,"../internals/enum-bug-keys":118,"../internals/hidden-keys":137,"../internals/html":138,"../internals/object-define-properties":163,"../internals/shared-key":181}],163:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var V8_PROTOTYPE_DEFINE_BUG = require('../internals/v8-prototype-define-bug');
var definePropertyModule = require('../internals/object-define-property');
var anObject = require('../internals/an-object');
var toIndexedObject = require('../internals/to-indexed-object');
var objectKeys = require('../internals/object-keys');

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
exports.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var props = toIndexedObject(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
  return O;
};

},{"../internals/an-object":85,"../internals/descriptors":111,"../internals/object-define-property":164,"../internals/object-keys":172,"../internals/to-indexed-object":191,"../internals/v8-prototype-define-bug":202}],164:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');
var V8_PROTOTYPE_DEFINE_BUG = require('../internals/v8-prototype-define-bug');
var anObject = require('../internals/an-object');
var toPropertyKey = require('../internals/to-property-key');

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"../internals/an-object":85,"../internals/descriptors":111,"../internals/ie8-dom-define":139,"../internals/to-property-key":196,"../internals/v8-prototype-define-bug":202}],165:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var call = require('../internals/function-call');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var toIndexedObject = require('../internals/to-indexed-object');
var toPropertyKey = require('../internals/to-property-key');
var hasOwn = require('../internals/has-own-property');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (IE8_DOM_DEFINE) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
};

},{"../internals/create-property-descriptor":105,"../internals/descriptors":111,"../internals/function-call":124,"../internals/has-own-property":136,"../internals/ie8-dom-define":139,"../internals/object-property-is-enumerable":173,"../internals/to-indexed-object":191,"../internals/to-property-key":196}],166:[function(require,module,exports){
'use strict';
/* eslint-disable es/no-object-getownpropertynames -- safe */
var classof = require('../internals/classof-raw');
var toIndexedObject = require('../internals/to-indexed-object');
var $getOwnPropertyNames = require('../internals/object-get-own-property-names').f;
var arraySlice = require('../internals/array-slice-simple');

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return $getOwnPropertyNames(it);
  } catch (error) {
    return arraySlice(windowNames);
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && classof(it) === 'Window'
    ? getWindowNames(it)
    : $getOwnPropertyNames(toIndexedObject(it));
};

},{"../internals/array-slice-simple":93,"../internals/classof-raw":99,"../internals/object-get-own-property-names":167,"../internals/to-indexed-object":191}],167:[function(require,module,exports){
'use strict';
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};

},{"../internals/enum-bug-keys":118,"../internals/object-keys-internal":171}],168:[function(require,module,exports){
'use strict';
// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
exports.f = Object.getOwnPropertySymbols;

},{}],169:[function(require,module,exports){
'use strict';
var hasOwn = require('../internals/has-own-property');
var isCallable = require('../internals/is-callable');
var toObject = require('../internals/to-object');
var sharedKey = require('../internals/shared-key');
var CORRECT_PROTOTYPE_GETTER = require('../internals/correct-prototype-getter');

var IE_PROTO = sharedKey('IE_PROTO');
var $Object = Object;
var ObjectPrototype = $Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
module.exports = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
  var object = toObject(O);
  if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object ? ObjectPrototype : null;
};

},{"../internals/correct-prototype-getter":102,"../internals/has-own-property":136,"../internals/is-callable":145,"../internals/shared-key":181,"../internals/to-object":194}],170:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

module.exports = uncurryThis({}.isPrototypeOf);

},{"../internals/function-uncurry-this":128}],171:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var hasOwn = require('../internals/has-own-property');
var toIndexedObject = require('../internals/to-indexed-object');
var indexOf = require('../internals/array-includes').indexOf;
var hiddenKeys = require('../internals/hidden-keys');

var push = uncurryThis([].push);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn(O, key = names[i++])) {
    ~indexOf(result, key) || push(result, key);
  }
  return result;
};

},{"../internals/array-includes":88,"../internals/function-uncurry-this":128,"../internals/has-own-property":136,"../internals/hidden-keys":137,"../internals/to-indexed-object":191}],172:[function(require,module,exports){
'use strict';
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};

},{"../internals/enum-bug-keys":118,"../internals/object-keys-internal":171}],173:[function(require,module,exports){
'use strict';
var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;

},{}],174:[function(require,module,exports){
'use strict';
/* eslint-disable no-proto -- safe */
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var anObject = require('../internals/an-object');
var aPossiblePrototype = require('../internals/a-possible-prototype');

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = uncurryThisAccessor(Object.prototype, '__proto__', 'set');
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

},{"../internals/a-possible-prototype":83,"../internals/an-object":85,"../internals/function-uncurry-this-accessor":126}],175:[function(require,module,exports){
'use strict';
var TO_STRING_TAG_SUPPORT = require('../internals/to-string-tag-support');
var classof = require('../internals/classof');

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
module.exports = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
  return '[object ' + classof(this) + ']';
};

},{"../internals/classof":100,"../internals/to-string-tag-support":197}],176:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var isCallable = require('../internals/is-callable');
var isObject = require('../internals/is-object');

var $TypeError = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
module.exports = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  throw new $TypeError("Can't convert object to primitive value");
};

},{"../internals/function-call":124,"../internals/is-callable":145,"../internals/is-object":150}],177:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');
var getOwnPropertyNamesModule = require('../internals/object-get-own-property-names');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var anObject = require('../internals/an-object');

var concat = uncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};

},{"../internals/an-object":85,"../internals/function-uncurry-this":128,"../internals/get-built-in":130,"../internals/object-get-own-property-names":167,"../internals/object-get-own-property-symbols":168}],178:[function(require,module,exports){
arguments[4][137][0].apply(exports,arguments)
},{"dup":137}],179:[function(require,module,exports){
'use strict';
var isNullOrUndefined = require('../internals/is-null-or-undefined');

var $TypeError = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
  return it;
};

},{"../internals/is-null-or-undefined":149}],180:[function(require,module,exports){
'use strict';
var TO_STRING_TAG_SUPPORT = require('../internals/to-string-tag-support');
var defineProperty = require('../internals/object-define-property').f;
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var hasOwn = require('../internals/has-own-property');
var toString = require('../internals/object-to-string');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (it, TAG, STATIC, SET_METHOD) {
  if (it) {
    var target = STATIC ? it : it.prototype;
    if (!hasOwn(target, TO_STRING_TAG)) {
      defineProperty(target, TO_STRING_TAG, { configurable: true, value: TAG });
    }
    if (SET_METHOD && !TO_STRING_TAG_SUPPORT) {
      createNonEnumerableProperty(target, 'toString', toString);
    }
  }
};

},{"../internals/create-non-enumerable-property":104,"../internals/has-own-property":136,"../internals/object-define-property":164,"../internals/object-to-string":175,"../internals/to-string-tag-support":197,"../internals/well-known-symbol":206}],181:[function(require,module,exports){
'use strict';
var shared = require('../internals/shared');
var uid = require('../internals/uid');

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

},{"../internals/shared":183,"../internals/uid":200}],182:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var defineGlobalProperty = require('../internals/define-global-property');

var SHARED = '__core-js_shared__';
var store = global[SHARED] || defineGlobalProperty(SHARED, {});

module.exports = store;

},{"../internals/define-global-property":109,"../internals/global":135}],183:[function(require,module,exports){
'use strict';
var IS_PURE = require('../internals/is-pure');
var store = require('../internals/shared-store');

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.33.1',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2014-2023 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.33.1/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});

},{"../internals/is-pure":151,"../internals/shared-store":182}],184:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var toString = require('../internals/to-string');
var requireObjectCoercible = require('../internals/require-object-coercible');

var charAt = uncurryThis(''.charAt);
var charCodeAt = uncurryThis(''.charCodeAt);
var stringSlice = uncurryThis(''.slice);

var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString(requireObjectCoercible($this));
    var position = toIntegerOrInfinity(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

module.exports = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};

},{"../internals/function-uncurry-this":128,"../internals/require-object-coercible":179,"../internals/to-integer-or-infinity":192,"../internals/to-string":198}],185:[function(require,module,exports){
'use strict';
/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION = require('../internals/engine-v8-version');
var fails = require('../internals/fails');
var global = require('../internals/global');

var $String = global.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});

},{"../internals/engine-v8-version":117,"../internals/fails":120,"../internals/global":135}],186:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var getBuiltIn = require('../internals/get-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');
var defineBuiltIn = require('../internals/define-built-in');

module.exports = function () {
  var Symbol = getBuiltIn('Symbol');
  var SymbolPrototype = Symbol && Symbol.prototype;
  var valueOf = SymbolPrototype && SymbolPrototype.valueOf;
  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

  if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
    // `Symbol.prototype[@@toPrimitive]` method
    // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
    // eslint-disable-next-line no-unused-vars -- required for .length
    defineBuiltIn(SymbolPrototype, TO_PRIMITIVE, function (hint) {
      return call(valueOf, this);
    }, { arity: 1 });
  }
};

},{"../internals/define-built-in":108,"../internals/function-call":124,"../internals/get-built-in":130,"../internals/well-known-symbol":206}],187:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');

var Symbol = getBuiltIn('Symbol');
var keyFor = Symbol.keyFor;
var thisSymbolValue = uncurryThis(Symbol.prototype.valueOf);

// `Symbol.isRegisteredSymbol` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
module.exports = Symbol.isRegisteredSymbol || function isRegisteredSymbol(value) {
  try {
    return keyFor(thisSymbolValue(value)) !== undefined;
  } catch (error) {
    return false;
  }
};

},{"../internals/function-uncurry-this":128,"../internals/get-built-in":130}],188:[function(require,module,exports){
'use strict';
var shared = require('../internals/shared');
var getBuiltIn = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');
var isSymbol = require('../internals/is-symbol');
var wellKnownSymbol = require('../internals/well-known-symbol');

var Symbol = getBuiltIn('Symbol');
var $isWellKnownSymbol = Symbol.isWellKnownSymbol;
var getOwnPropertyNames = getBuiltIn('Object', 'getOwnPropertyNames');
var thisSymbolValue = uncurryThis(Symbol.prototype.valueOf);
var WellKnownSymbolsStore = shared('wks');

for (var i = 0, symbolKeys = getOwnPropertyNames(Symbol), symbolKeysLength = symbolKeys.length; i < symbolKeysLength; i++) {
  // some old engines throws on access to some keys like `arguments` or `caller`
  try {
    var symbolKey = symbolKeys[i];
    if (isSymbol(Symbol[symbolKey])) wellKnownSymbol(symbolKey);
  } catch (error) { /* empty */ }
}

// `Symbol.isWellKnownSymbol` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
module.exports = function isWellKnownSymbol(value) {
  if ($isWellKnownSymbol && $isWellKnownSymbol(value)) return true;
  try {
    var symbol = thisSymbolValue(value);
    for (var j = 0, keys = getOwnPropertyNames(WellKnownSymbolsStore), keysLength = keys.length; j < keysLength; j++) {
      // eslint-disable-next-line eqeqeq -- polyfilled symbols case
      if (WellKnownSymbolsStore[keys[j]] == symbol) return true;
    }
  } catch (error) { /* empty */ }
  return false;
};

},{"../internals/function-uncurry-this":128,"../internals/get-built-in":130,"../internals/is-symbol":153,"../internals/shared":183,"../internals/well-known-symbol":206}],189:[function(require,module,exports){
'use strict';
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');

/* eslint-disable es/no-symbol -- safe */
module.exports = NATIVE_SYMBOL && !!Symbol['for'] && !!Symbol.keyFor;

},{"../internals/symbol-constructor-detection":185}],190:[function(require,module,exports){
'use strict';
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toIntegerOrInfinity(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};

},{"../internals/to-integer-or-infinity":192}],191:[function(require,module,exports){
'use strict';
// toObject with fallback for non-array-like ES3 strings
var IndexedObject = require('../internals/indexed-object');
var requireObjectCoercible = require('../internals/require-object-coercible');

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};

},{"../internals/indexed-object":140,"../internals/require-object-coercible":179}],192:[function(require,module,exports){
'use strict';
var trunc = require('../internals/math-trunc');

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
module.exports = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc(number);
};

},{"../internals/math-trunc":160}],193:[function(require,module,exports){
'use strict';
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

},{"../internals/to-integer-or-infinity":192}],194:[function(require,module,exports){
'use strict';
var requireObjectCoercible = require('../internals/require-object-coercible');

var $Object = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
module.exports = function (argument) {
  return $Object(requireObjectCoercible(argument));
};

},{"../internals/require-object-coercible":179}],195:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var isObject = require('../internals/is-object');
var isSymbol = require('../internals/is-symbol');
var getMethod = require('../internals/get-method');
var ordinaryToPrimitive = require('../internals/ordinary-to-primitive');
var wellKnownSymbol = require('../internals/well-known-symbol');

var $TypeError = TypeError;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
module.exports = function (input, pref) {
  if (!isObject(input) || isSymbol(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call(exoticToPrim, input, pref);
    if (!isObject(result) || isSymbol(result)) return result;
    throw new $TypeError("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};

},{"../internals/function-call":124,"../internals/get-method":134,"../internals/is-object":150,"../internals/is-symbol":153,"../internals/ordinary-to-primitive":176,"../internals/well-known-symbol":206}],196:[function(require,module,exports){
'use strict';
var toPrimitive = require('../internals/to-primitive');
var isSymbol = require('../internals/is-symbol');

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
module.exports = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};

},{"../internals/is-symbol":153,"../internals/to-primitive":195}],197:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';

},{"../internals/well-known-symbol":206}],198:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof');

var $String = String;

module.exports = function (argument) {
  if (classof(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
  return $String(argument);
};

},{"../internals/classof":100}],199:[function(require,module,exports){
'use strict';
var $String = String;

module.exports = function (argument) {
  try {
    return $String(argument);
  } catch (error) {
    return 'Object';
  }
};

},{}],200:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

var id = 0;
var postfix = Math.random();
var toString = uncurryThis(1.0.toString);

module.exports = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
};

},{"../internals/function-uncurry-this":128}],201:[function(require,module,exports){
'use strict';
/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');

module.exports = NATIVE_SYMBOL
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

},{"../internals/symbol-constructor-detection":185}],202:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
module.exports = DESCRIPTORS && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});

},{"../internals/descriptors":111,"../internals/fails":120}],203:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var isCallable = require('../internals/is-callable');

var WeakMap = global.WeakMap;

module.exports = isCallable(WeakMap) && /native code/.test(String(WeakMap));

},{"../internals/global":135,"../internals/is-callable":145}],204:[function(require,module,exports){
'use strict';
var path = require('../internals/path');
var hasOwn = require('../internals/has-own-property');
var wrappedWellKnownSymbolModule = require('../internals/well-known-symbol-wrapped');
var defineProperty = require('../internals/object-define-property').f;

module.exports = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!hasOwn(Symbol, NAME)) defineProperty(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule.f(NAME)
  });
};

},{"../internals/has-own-property":136,"../internals/object-define-property":164,"../internals/path":178,"../internals/well-known-symbol-wrapped":205}],205:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');

exports.f = wellKnownSymbol;

},{"../internals/well-known-symbol":206}],206:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var shared = require('../internals/shared');
var hasOwn = require('../internals/has-own-property');
var uid = require('../internals/uid');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');

var Symbol = global.Symbol;
var WellKnownSymbolsStore = shared('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol['for'] || Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!hasOwn(WellKnownSymbolsStore, name)) {
    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol, name)
      ? Symbol[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};

},{"../internals/global":135,"../internals/has-own-property":136,"../internals/shared":183,"../internals/symbol-constructor-detection":185,"../internals/uid":200,"../internals/use-symbol-as-uid":201}],207:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var fails = require('../internals/fails');
var isArray = require('../internals/is-array');
var isObject = require('../internals/is-object');
var toObject = require('../internals/to-object');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var doesNotExceedSafeInteger = require('../internals/does-not-exceed-safe-integer');
var createProperty = require('../internals/create-property');
var arraySpeciesCreate = require('../internals/array-species-create');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var wellKnownSymbol = require('../internals/well-known-symbol');
var V8_VERSION = require('../internals/engine-v8-version');

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport('concat');

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$({ target: 'Array', proto: true, arity: 1, forced: FORCED }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = lengthOfArrayLike(E);
        doesNotExceedSafeInteger(n + len);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        doesNotExceedSafeInteger(n + 1);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

},{"../internals/array-method-has-species-support":90,"../internals/array-species-create":96,"../internals/create-property":106,"../internals/does-not-exceed-safe-integer":114,"../internals/engine-v8-version":117,"../internals/export":119,"../internals/fails":120,"../internals/is-array":144,"../internals/is-object":150,"../internals/length-of-array-like":159,"../internals/to-object":194,"../internals/well-known-symbol":206}],208:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $filter = require('../internals/array-iteration').filter;
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"../internals/array-iteration":89,"../internals/array-method-has-species-support":90,"../internals/export":119}],209:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $findIndex = require('../internals/array-iteration').findIndex;
var addToUnscopables = require('../internals/add-to-unscopables');

var FIND_INDEX = 'findIndex';
var SKIPS_HOLES = true;

// Shouldn't skip holes
// eslint-disable-next-line es/no-array-prototype-findindex -- testing
if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

// `Array.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findindex
$({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables(FIND_INDEX);

},{"../internals/add-to-unscopables":84,"../internals/array-iteration":89,"../internals/export":119}],210:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $find = require('../internals/array-iteration').find;
var addToUnscopables = require('../internals/add-to-unscopables');

var FIND = 'find';
var SKIPS_HOLES = true;

// Shouldn't skip holes
// eslint-disable-next-line es/no-array-prototype-find -- testing
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

// `Array.prototype.find` method
// https://tc39.es/ecma262/#sec-array.prototype.find
$({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables(FIND);

},{"../internals/add-to-unscopables":84,"../internals/array-iteration":89,"../internals/export":119}],211:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var forEach = require('../internals/array-for-each');

// `Array.prototype.forEach` method
// https://tc39.es/ecma262/#sec-array.prototype.foreach
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
$({ target: 'Array', proto: true, forced: [].forEach !== forEach }, {
  forEach: forEach
});

},{"../internals/array-for-each":86,"../internals/export":119}],212:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var from = require('../internals/array-from');
var checkCorrectnessOfIteration = require('../internals/check-correctness-of-iteration');

var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
  // eslint-disable-next-line es/no-array-from -- required for testing
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
$({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from
});

},{"../internals/array-from":87,"../internals/check-correctness-of-iteration":98,"../internals/export":119}],213:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $includes = require('../internals/array-includes').includes;
var fails = require('../internals/fails');
var addToUnscopables = require('../internals/add-to-unscopables');

// FF99+ bug
var BROKEN_ON_SPARSE = fails(function () {
  // eslint-disable-next-line es/no-array-prototype-includes -- detection
  return !Array(1).includes();
});

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');

},{"../internals/add-to-unscopables":84,"../internals/array-includes":88,"../internals/export":119,"../internals/fails":120}],214:[function(require,module,exports){
'use strict';
/* eslint-disable es/no-array-prototype-indexof -- required for testing */
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this-clause');
var $indexOf = require('../internals/array-includes').indexOf;
var arrayMethodIsStrict = require('../internals/array-method-is-strict');

var nativeIndexOf = uncurryThis([].indexOf);

var NEGATIVE_ZERO = !!nativeIndexOf && 1 / nativeIndexOf([1], 1, -0) < 0;
var FORCED = NEGATIVE_ZERO || !arrayMethodIsStrict('indexOf');

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
$({ target: 'Array', proto: true, forced: FORCED }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? nativeIndexOf(this, searchElement, fromIndex) || 0
      : $indexOf(this, searchElement, fromIndex);
  }
});

},{"../internals/array-includes":88,"../internals/array-method-is-strict":91,"../internals/export":119,"../internals/function-uncurry-this-clause":127}],215:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var isArray = require('../internals/is-array');

// `Array.isArray` method
// https://tc39.es/ecma262/#sec-array.isarray
$({ target: 'Array', stat: true }, {
  isArray: isArray
});

},{"../internals/export":119,"../internals/is-array":144}],216:[function(require,module,exports){
'use strict';
var toIndexedObject = require('../internals/to-indexed-object');
var addToUnscopables = require('../internals/add-to-unscopables');
var Iterators = require('../internals/iterators');
var InternalStateModule = require('../internals/internal-state');
var defineProperty = require('../internals/object-define-property').f;
var defineIterator = require('../internals/iterator-define');
var createIterResultObject = require('../internals/create-iter-result-object');
var IS_PURE = require('../internals/is-pure');
var DESCRIPTORS = require('../internals/descriptors');

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.es/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.es/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.es/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.es/ecma262/#sec-createarrayiterator
module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState(this);
  var target = state.target;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return createIterResultObject(undefined, true);
  }
  switch (state.kind) {
    case 'keys': return createIterResultObject(index, false);
    case 'values': return createIterResultObject(target[index], false);
  } return createIterResultObject([index, target[index]], false);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
var values = Iterators.Arguments = Iterators.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

// V8 ~ Chrome 45- bug
if (!IS_PURE && DESCRIPTORS && values.name !== 'values') try {
  defineProperty(values, 'name', { value: 'values' });
} catch (error) { /* empty */ }

},{"../internals/add-to-unscopables":84,"../internals/create-iter-result-object":103,"../internals/descriptors":111,"../internals/internal-state":142,"../internals/is-pure":151,"../internals/iterator-define":156,"../internals/iterators":158,"../internals/object-define-property":164,"../internals/to-indexed-object":191}],217:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var isArray = require('../internals/is-array');
var isConstructor = require('../internals/is-constructor');
var isObject = require('../internals/is-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var toIndexedObject = require('../internals/to-indexed-object');
var createProperty = require('../internals/create-property');
var wellKnownSymbol = require('../internals/well-known-symbol');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var nativeSlice = require('../internals/array-slice');

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');

var SPECIES = wellKnownSymbol('species');
var $Array = Array;
var max = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = lengthOfArrayLike(O);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (isConstructor(Constructor) && (Constructor === $Array || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === $Array || Constructor === undefined) {
        return nativeSlice(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? $Array : Constructor)(max(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  }
});

},{"../internals/array-method-has-species-support":90,"../internals/array-slice":94,"../internals/create-property":106,"../internals/export":119,"../internals/is-array":144,"../internals/is-constructor":146,"../internals/is-object":150,"../internals/length-of-array-like":159,"../internals/to-absolute-index":190,"../internals/to-indexed-object":191,"../internals/well-known-symbol":206}],218:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var toObject = require('../internals/to-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var setArrayLength = require('../internals/array-set-length');
var doesNotExceedSafeInteger = require('../internals/does-not-exceed-safe-integer');
var arraySpeciesCreate = require('../internals/array-species-create');
var createProperty = require('../internals/create-property');
var deletePropertyOrThrow = require('../internals/delete-property-or-throw');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

var max = Math.max;
var min = Math.min;

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject(this);
    var len = lengthOfArrayLike(O);
    var actualStart = toAbsoluteIndex(start, len);
    var argumentsLength = arguments.length;
    var insertCount, actualDeleteCount, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
    }
    doesNotExceedSafeInteger(len + insertCount - actualDeleteCount);
    A = arraySpeciesCreate(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty(A, k, O[from]);
    }
    A.length = actualDeleteCount;
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (from in O) O[to] = O[from];
        else deletePropertyOrThrow(O, to);
      }
      for (k = len; k > len - actualDeleteCount + insertCount; k--) deletePropertyOrThrow(O, k - 1);
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (from in O) O[to] = O[from];
        else deletePropertyOrThrow(O, to);
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    setArrayLength(O, len - actualDeleteCount + insertCount);
    return A;
  }
});

},{"../internals/array-method-has-species-support":90,"../internals/array-set-length":92,"../internals/array-species-create":96,"../internals/create-property":106,"../internals/delete-property-or-throw":110,"../internals/does-not-exceed-safe-integer":114,"../internals/export":119,"../internals/length-of-array-like":159,"../internals/to-absolute-index":190,"../internals/to-integer-or-infinity":192,"../internals/to-object":194}],219:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var apply = require('../internals/function-apply');
var call = require('../internals/function-call');
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');
var isSymbol = require('../internals/is-symbol');
var arraySlice = require('../internals/array-slice');
var getReplacerFunction = require('../internals/get-json-replacer-function');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');

var $String = String;
var $stringify = getBuiltIn('JSON', 'stringify');
var exec = uncurryThis(/./.exec);
var charAt = uncurryThis(''.charAt);
var charCodeAt = uncurryThis(''.charCodeAt);
var replace = uncurryThis(''.replace);
var numberToString = uncurryThis(1.0.toString);

var tester = /[\uD800-\uDFFF]/g;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var WRONG_SYMBOLS_CONVERSION = !NATIVE_SYMBOL || fails(function () {
  var symbol = getBuiltIn('Symbol')('stringify detection');
  // MS Edge converts symbol values to JSON as {}
  return $stringify([symbol]) !== '[null]'
    // WebKit converts symbol values to JSON as null
    || $stringify({ a: symbol }) !== '{}'
    // V8 throws on boxed symbols
    || $stringify(Object(symbol)) !== '{}';
});

// https://github.com/tc39/proposal-well-formed-stringify
var ILL_FORMED_UNICODE = fails(function () {
  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify('\uDEAD') !== '"\\udead"';
});

var stringifyWithSymbolsFix = function (it, replacer) {
  var args = arraySlice(arguments);
  var $replacer = getReplacerFunction(replacer);
  if (!isCallable($replacer) && (it === undefined || isSymbol(it))) return; // IE8 returns string on undefined
  args[1] = function (key, value) {
    // some old implementations (like WebKit) could pass numbers as keys
    if (isCallable($replacer)) value = call($replacer, this, $String(key), value);
    if (!isSymbol(value)) return value;
  };
  return apply($stringify, null, args);
};

var fixIllFormed = function (match, offset, string) {
  var prev = charAt(string, offset - 1);
  var next = charAt(string, offset + 1);
  if ((exec(low, match) && !exec(hi, next)) || (exec(hi, match) && !exec(low, prev))) {
    return '\\u' + numberToString(charCodeAt(match, 0), 16);
  } return match;
};

if ($stringify) {
  // `JSON.stringify` method
  // https://tc39.es/ecma262/#sec-json.stringify
  $({ target: 'JSON', stat: true, arity: 3, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      var args = arraySlice(arguments);
      var result = apply(WRONG_SYMBOLS_CONVERSION ? stringifyWithSymbolsFix : $stringify, null, args);
      return ILL_FORMED_UNICODE && typeof result == 'string' ? replace(result, tester, fixIllFormed) : result;
    }
  });
}

},{"../internals/array-slice":94,"../internals/export":119,"../internals/fails":120,"../internals/function-apply":121,"../internals/function-call":124,"../internals/function-uncurry-this":128,"../internals/get-built-in":130,"../internals/get-json-replacer-function":133,"../internals/is-callable":145,"../internals/is-symbol":153,"../internals/symbol-constructor-detection":185}],220:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var setToStringTag = require('../internals/set-to-string-tag');

// JSON[@@toStringTag] property
// https://tc39.es/ecma262/#sec-json-@@tostringtag
setToStringTag(global.JSON, 'JSON', true);

},{"../internals/global":135,"../internals/set-to-string-tag":180}],221:[function(require,module,exports){
// empty

},{}],222:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var defineProperties = require('../internals/object-define-properties').f;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
$({ target: 'Object', stat: true, forced: Object.defineProperties !== defineProperties, sham: !DESCRIPTORS }, {
  defineProperties: defineProperties
});

},{"../internals/descriptors":111,"../internals/export":119,"../internals/object-define-properties":163}],223:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var defineProperty = require('../internals/object-define-property').f;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
// eslint-disable-next-line es/no-object-defineproperty -- safe
$({ target: 'Object', stat: true, forced: Object.defineProperty !== defineProperty, sham: !DESCRIPTORS }, {
  defineProperty: defineProperty
});

},{"../internals/descriptors":111,"../internals/export":119,"../internals/object-define-property":164}],224:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var fails = require('../internals/fails');
var toIndexedObject = require('../internals/to-indexed-object');
var nativeGetOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var DESCRIPTORS = require('../internals/descriptors');

var FORCED = !DESCRIPTORS || fails(function () { nativeGetOwnPropertyDescriptor(1); });

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
$({ target: 'Object', stat: true, forced: FORCED, sham: !DESCRIPTORS }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
  }
});

},{"../internals/descriptors":111,"../internals/export":119,"../internals/fails":120,"../internals/object-get-own-property-descriptor":165,"../internals/to-indexed-object":191}],225:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var ownKeys = require('../internals/own-keys');
var toIndexedObject = require('../internals/to-indexed-object');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var createProperty = require('../internals/create-property');

// `Object.getOwnPropertyDescriptors` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
$({ target: 'Object', stat: true, sham: !DESCRIPTORS }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject(object);
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
    var keys = ownKeys(O);
    var result = {};
    var index = 0;
    var key, descriptor;
    while (keys.length > index) {
      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
      if (descriptor !== undefined) createProperty(result, key, descriptor);
    }
    return result;
  }
});

},{"../internals/create-property":106,"../internals/descriptors":111,"../internals/export":119,"../internals/object-get-own-property-descriptor":165,"../internals/own-keys":177,"../internals/to-indexed-object":191}],226:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');
var fails = require('../internals/fails');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var toObject = require('../internals/to-object');

// V8 ~ Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FORCED = !NATIVE_SYMBOL || fails(function () { getOwnPropertySymbolsModule.f(1); });

// `Object.getOwnPropertySymbols` method
// https://tc39.es/ecma262/#sec-object.getownpropertysymbols
$({ target: 'Object', stat: true, forced: FORCED }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    var $getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
    return $getOwnPropertySymbols ? $getOwnPropertySymbols(toObject(it)) : [];
  }
});

},{"../internals/export":119,"../internals/fails":120,"../internals/object-get-own-property-symbols":168,"../internals/symbol-constructor-detection":185,"../internals/to-object":194}],227:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var toObject = require('../internals/to-object');
var nativeKeys = require('../internals/object-keys');
var fails = require('../internals/fails');

var FAILS_ON_PRIMITIVES = fails(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return nativeKeys(toObject(it));
  }
});

},{"../internals/export":119,"../internals/fails":120,"../internals/object-keys":172,"../internals/to-object":194}],228:[function(require,module,exports){
arguments[4][221][0].apply(exports,arguments)
},{"dup":221}],229:[function(require,module,exports){
arguments[4][221][0].apply(exports,arguments)
},{"dup":221}],230:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var notARegExp = require('../internals/not-a-regexp');
var requireObjectCoercible = require('../internals/require-object-coercible');
var toString = require('../internals/to-string');
var correctIsRegExpLogic = require('../internals/correct-is-regexp-logic');

var stringIndexOf = uncurryThis(''.indexOf);

// `String.prototype.includes` method
// https://tc39.es/ecma262/#sec-string.prototype.includes
$({ target: 'String', proto: true, forced: !correctIsRegExpLogic('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~stringIndexOf(
      toString(requireObjectCoercible(this)),
      toString(notARegExp(searchString)),
      arguments.length > 1 ? arguments[1] : undefined
    );
  }
});

},{"../internals/correct-is-regexp-logic":101,"../internals/export":119,"../internals/function-uncurry-this":128,"../internals/not-a-regexp":161,"../internals/require-object-coercible":179,"../internals/to-string":198}],231:[function(require,module,exports){
'use strict';
var charAt = require('../internals/string-multibyte').charAt;
var toString = require('../internals/to-string');
var InternalStateModule = require('../internals/internal-state');
var defineIterator = require('../internals/iterator-define');
var createIterResultObject = require('../internals/create-iter-result-object');

var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: toString(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject(undefined, true);
  point = charAt(string, index);
  state.index += point.length;
  return createIterResultObject(point, false);
});

},{"../internals/create-iter-result-object":103,"../internals/internal-state":142,"../internals/iterator-define":156,"../internals/string-multibyte":184,"../internals/to-string":198}],232:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.asyncIterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.asynciterator
defineWellKnownSymbol('asyncIterator');

},{"../internals/well-known-symbol-define":204}],233:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var call = require('../internals/function-call');
var uncurryThis = require('../internals/function-uncurry-this');
var IS_PURE = require('../internals/is-pure');
var DESCRIPTORS = require('../internals/descriptors');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');
var fails = require('../internals/fails');
var hasOwn = require('../internals/has-own-property');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var anObject = require('../internals/an-object');
var toIndexedObject = require('../internals/to-indexed-object');
var toPropertyKey = require('../internals/to-property-key');
var $toString = require('../internals/to-string');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var nativeObjectCreate = require('../internals/object-create');
var objectKeys = require('../internals/object-keys');
var getOwnPropertyNamesModule = require('../internals/object-get-own-property-names');
var getOwnPropertyNamesExternal = require('../internals/object-get-own-property-names-external');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var definePropertyModule = require('../internals/object-define-property');
var definePropertiesModule = require('../internals/object-define-properties');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var defineBuiltIn = require('../internals/define-built-in');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var shared = require('../internals/shared');
var sharedKey = require('../internals/shared-key');
var hiddenKeys = require('../internals/hidden-keys');
var uid = require('../internals/uid');
var wellKnownSymbol = require('../internals/well-known-symbol');
var wrappedWellKnownSymbolModule = require('../internals/well-known-symbol-wrapped');
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');
var defineSymbolToPrimitive = require('../internals/symbol-define-to-primitive');
var setToStringTag = require('../internals/set-to-string-tag');
var InternalStateModule = require('../internals/internal-state');
var $forEach = require('../internals/array-iteration').forEach;

var HIDDEN = sharedKey('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE = 'prototype';

var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(SYMBOL);

var ObjectPrototype = Object[PROTOTYPE];
var $Symbol = global.Symbol;
var SymbolPrototype = $Symbol && $Symbol[PROTOTYPE];
var RangeError = global.RangeError;
var TypeError = global.TypeError;
var QObject = global.QObject;
var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
var nativeDefineProperty = definePropertyModule.f;
var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
var push = uncurryThis([].push);

var AllSymbols = shared('symbols');
var ObjectPrototypeSymbols = shared('op-symbols');
var WellKnownSymbolsStore = shared('wks');

// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var fallbackDefineProperty = function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
  nativeDefineProperty(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
    nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
  }
};

var setSymbolDescriptor = DESCRIPTORS && fails(function () {
  return nativeObjectCreate(nativeDefineProperty({}, 'a', {
    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
  })).a !== 7;
}) ? fallbackDefineProperty : nativeDefineProperty;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = nativeObjectCreate(SymbolPrototype);
  setInternalState(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!DESCRIPTORS) symbol.description = description;
  return symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject(O);
  var key = toPropertyKey(P);
  anObject(Attributes);
  if (hasOwn(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!hasOwn(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (hasOwn(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject(O);
  var properties = toIndexedObject(Properties);
  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
  $forEach(keys, function (key) {
    if (!DESCRIPTORS || call($propertyIsEnumerable, properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
};

var $propertyIsEnumerable = function propertyIsEnumerable(V) {
  var P = toPropertyKey(V);
  var enumerable = call(nativePropertyIsEnumerable, this, P);
  if (this === ObjectPrototype && hasOwn(AllSymbols, P) && !hasOwn(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !hasOwn(this, P) || !hasOwn(AllSymbols, P) || hasOwn(this, HIDDEN) && this[HIDDEN][P]
    ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject(O);
  var key = toPropertyKey(P);
  if (it === ObjectPrototype && hasOwn(AllSymbols, key) && !hasOwn(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor(it, key);
  if (descriptor && hasOwn(AllSymbols, key) && !(hasOwn(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (!hasOwn(AllSymbols, key) && !hasOwn(hiddenKeys, key)) push(result, key);
  });
  return result;
};

var $getOwnPropertySymbols = function (O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (hasOwn(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwn(ObjectPrototype, key))) {
      push(result, AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.es/ecma262/#sec-symbol-constructor
if (!NATIVE_SYMBOL) {
  $Symbol = function Symbol() {
    if (isPrototypeOf(SymbolPrototype, this)) throw new TypeError('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : $toString(arguments[0]);
    var tag = uid(description);
    var setter = function (value) {
      var $this = this === undefined ? global : this;
      if ($this === ObjectPrototype) call(setter, ObjectPrototypeSymbols, value);
      if (hasOwn($this, HIDDEN) && hasOwn($this[HIDDEN], tag)) $this[HIDDEN][tag] = false;
      var descriptor = createPropertyDescriptor(1, value);
      try {
        setSymbolDescriptor($this, tag, descriptor);
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
        fallbackDefineProperty($this, tag, descriptor);
      }
    };
    if (DESCRIPTORS && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  SymbolPrototype = $Symbol[PROTOTYPE];

  defineBuiltIn(SymbolPrototype, 'toString', function toString() {
    return getInternalState(this).tag;
  });

  defineBuiltIn($Symbol, 'withoutSetter', function (description) {
    return wrap(uid(description), description);
  });

  propertyIsEnumerableModule.f = $propertyIsEnumerable;
  definePropertyModule.f = $defineProperty;
  definePropertiesModule.f = $defineProperties;
  getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule.f = function (name) {
    return wrap(wellKnownSymbol(name), name);
  };

  if (DESCRIPTORS) {
    // https://github.com/tc39/proposal-Symbol-description
    defineBuiltInAccessor(SymbolPrototype, 'description', {
      configurable: true,
      get: function description() {
        return getInternalState(this).description;
      }
    });
    if (!IS_PURE) {
      defineBuiltIn(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
    }
  }
}

$({ global: true, constructor: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
  Symbol: $Symbol
});

$forEach(objectKeys(WellKnownSymbolsStore), function (name) {
  defineWellKnownSymbol(name);
});

$({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS }, {
  // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty,
  // `Object.defineProperties` method
  // https://tc39.es/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames
});

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
defineSymbolToPrimitive();

// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag($Symbol, SYMBOL);

hiddenKeys[HIDDEN] = true;

},{"../internals/an-object":85,"../internals/array-iteration":89,"../internals/create-property-descriptor":105,"../internals/define-built-in":108,"../internals/define-built-in-accessor":107,"../internals/descriptors":111,"../internals/export":119,"../internals/fails":120,"../internals/function-call":124,"../internals/function-uncurry-this":128,"../internals/global":135,"../internals/has-own-property":136,"../internals/hidden-keys":137,"../internals/internal-state":142,"../internals/is-pure":151,"../internals/object-create":162,"../internals/object-define-properties":163,"../internals/object-define-property":164,"../internals/object-get-own-property-descriptor":165,"../internals/object-get-own-property-names":167,"../internals/object-get-own-property-names-external":166,"../internals/object-get-own-property-symbols":168,"../internals/object-is-prototype-of":170,"../internals/object-keys":172,"../internals/object-property-is-enumerable":173,"../internals/set-to-string-tag":180,"../internals/shared":183,"../internals/shared-key":181,"../internals/symbol-constructor-detection":185,"../internals/symbol-define-to-primitive":186,"../internals/to-indexed-object":191,"../internals/to-property-key":196,"../internals/to-string":198,"../internals/uid":200,"../internals/well-known-symbol":206,"../internals/well-known-symbol-define":204,"../internals/well-known-symbol-wrapped":205}],234:[function(require,module,exports){
arguments[4][221][0].apply(exports,arguments)
},{"dup":221}],235:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var hasOwn = require('../internals/has-own-property');
var toString = require('../internals/to-string');
var shared = require('../internals/shared');
var NATIVE_SYMBOL_REGISTRY = require('../internals/symbol-registry-detection');

var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');

// `Symbol.for` method
// https://tc39.es/ecma262/#sec-symbol.for
$({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
  'for': function (key) {
    var string = toString(key);
    if (hasOwn(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = getBuiltIn('Symbol')(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  }
});

},{"../internals/export":119,"../internals/get-built-in":130,"../internals/has-own-property":136,"../internals/shared":183,"../internals/symbol-registry-detection":189,"../internals/to-string":198}],236:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.hasInstance` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.hasinstance
defineWellKnownSymbol('hasInstance');

},{"../internals/well-known-symbol-define":204}],237:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.isConcatSpreadable` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.isconcatspreadable
defineWellKnownSymbol('isConcatSpreadable');

},{"../internals/well-known-symbol-define":204}],238:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
defineWellKnownSymbol('iterator');

},{"../internals/well-known-symbol-define":204}],239:[function(require,module,exports){
'use strict';
// TODO: Remove this module from `core-js@4` since it's split to modules listed below
require('../modules/es.symbol.constructor');
require('../modules/es.symbol.for');
require('../modules/es.symbol.key-for');
require('../modules/es.json.stringify');
require('../modules/es.object.get-own-property-symbols');

},{"../modules/es.json.stringify":219,"../modules/es.object.get-own-property-symbols":226,"../modules/es.symbol.constructor":233,"../modules/es.symbol.for":235,"../modules/es.symbol.key-for":240}],240:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var hasOwn = require('../internals/has-own-property');
var isSymbol = require('../internals/is-symbol');
var tryToString = require('../internals/try-to-string');
var shared = require('../internals/shared');
var NATIVE_SYMBOL_REGISTRY = require('../internals/symbol-registry-detection');

var SymbolToStringRegistry = shared('symbol-to-string-registry');

// `Symbol.keyFor` method
// https://tc39.es/ecma262/#sec-symbol.keyfor
$({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw new TypeError(tryToString(sym) + ' is not a symbol');
    if (hasOwn(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  }
});

},{"../internals/export":119,"../internals/has-own-property":136,"../internals/is-symbol":153,"../internals/shared":183,"../internals/symbol-registry-detection":189,"../internals/try-to-string":199}],241:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.matchAll` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.matchall
defineWellKnownSymbol('matchAll');

},{"../internals/well-known-symbol-define":204}],242:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.match` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.match
defineWellKnownSymbol('match');

},{"../internals/well-known-symbol-define":204}],243:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.replace` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.replace
defineWellKnownSymbol('replace');

},{"../internals/well-known-symbol-define":204}],244:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.search` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.search
defineWellKnownSymbol('search');

},{"../internals/well-known-symbol-define":204}],245:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.species` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.species
defineWellKnownSymbol('species');

},{"../internals/well-known-symbol-define":204}],246:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.split` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.split
defineWellKnownSymbol('split');

},{"../internals/well-known-symbol-define":204}],247:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');
var defineSymbolToPrimitive = require('../internals/symbol-define-to-primitive');

// `Symbol.toPrimitive` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.toprimitive
defineWellKnownSymbol('toPrimitive');

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
defineSymbolToPrimitive();

},{"../internals/symbol-define-to-primitive":186,"../internals/well-known-symbol-define":204}],248:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');
var setToStringTag = require('../internals/set-to-string-tag');

// `Symbol.toStringTag` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.tostringtag
defineWellKnownSymbol('toStringTag');

// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag(getBuiltIn('Symbol'), 'Symbol');

},{"../internals/get-built-in":130,"../internals/set-to-string-tag":180,"../internals/well-known-symbol-define":204}],249:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.unscopables` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.unscopables
defineWellKnownSymbol('unscopables');

},{"../internals/well-known-symbol-define":204}],250:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');
var defineProperty = require('../internals/object-define-property').f;

var METADATA = wellKnownSymbol('metadata');
var FunctionPrototype = Function.prototype;

// Function.prototype[@@metadata]
// https://github.com/tc39/proposal-decorator-metadata
if (FunctionPrototype[METADATA] === undefined) {
  defineProperty(FunctionPrototype, METADATA, {
    value: null
  });
}

},{"../internals/object-define-property":164,"../internals/well-known-symbol":206}],251:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.asyncDispose` well-known symbol
// https://github.com/tc39/proposal-async-explicit-resource-management
defineWellKnownSymbol('asyncDispose');

},{"../internals/well-known-symbol-define":204}],252:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.dispose` well-known symbol
// https://github.com/tc39/proposal-explicit-resource-management
defineWellKnownSymbol('dispose');

},{"../internals/well-known-symbol-define":204}],253:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var isRegisteredSymbol = require('../internals/symbol-is-registered');

// `Symbol.isRegisteredSymbol` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
$({ target: 'Symbol', stat: true }, {
  isRegisteredSymbol: isRegisteredSymbol
});

},{"../internals/export":119,"../internals/symbol-is-registered":187}],254:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var isRegisteredSymbol = require('../internals/symbol-is-registered');

// `Symbol.isRegistered` method
// obsolete version of https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
$({ target: 'Symbol', stat: true, name: 'isRegisteredSymbol' }, {
  isRegistered: isRegisteredSymbol
});

},{"../internals/export":119,"../internals/symbol-is-registered":187}],255:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var isWellKnownSymbol = require('../internals/symbol-is-well-known');

// `Symbol.isWellKnownSymbol` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
$({ target: 'Symbol', stat: true, forced: true }, {
  isWellKnownSymbol: isWellKnownSymbol
});

},{"../internals/export":119,"../internals/symbol-is-well-known":188}],256:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var isWellKnownSymbol = require('../internals/symbol-is-well-known');

// `Symbol.isWellKnown` method
// obsolete version of https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
$({ target: 'Symbol', stat: true, name: 'isWellKnownSymbol', forced: true }, {
  isWellKnown: isWellKnownSymbol
});

},{"../internals/export":119,"../internals/symbol-is-well-known":188}],257:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.matcher` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol('matcher');

},{"../internals/well-known-symbol-define":204}],258:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4`
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.metadataKey` well-known symbol
// https://github.com/tc39/proposal-decorator-metadata
defineWellKnownSymbol('metadataKey');

},{"../internals/well-known-symbol-define":204}],259:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.metadata` well-known symbol
// https://github.com/tc39/proposal-decorators
defineWellKnownSymbol('metadata');

},{"../internals/well-known-symbol-define":204}],260:[function(require,module,exports){
'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.observable` well-known symbol
// https://github.com/tc39/proposal-observable
defineWellKnownSymbol('observable');

},{"../internals/well-known-symbol-define":204}],261:[function(require,module,exports){
'use strict';
// TODO: remove from `core-js@4`
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.patternMatch` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol('patternMatch');

},{"../internals/well-known-symbol-define":204}],262:[function(require,module,exports){
'use strict';
// TODO: remove from `core-js@4`
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

defineWellKnownSymbol('replaceAll');

},{"../internals/well-known-symbol-define":204}],263:[function(require,module,exports){
arguments[4][221][0].apply(exports,arguments)
},{"dup":221}],264:[function(require,module,exports){
'use strict';
require('../modules/es.array.iterator');
var DOMIterables = require('../internals/dom-iterables');
var global = require('../internals/global');
var classof = require('../internals/classof');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var Iterators = require('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype && classof(CollectionPrototype) !== TO_STRING_TAG) {
    createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
  }
  Iterators[COLLECTION_NAME] = Iterators.Array;
}

},{"../internals/classof":100,"../internals/create-non-enumerable-property":104,"../internals/dom-iterables":115,"../internals/global":135,"../internals/iterators":158,"../internals/well-known-symbol":206,"../modules/es.array.iterator":216}],265:[function(require,module,exports){
'use strict';
var parent = require('../../es/array/from');

module.exports = parent;

},{"../../es/array/from":44}],266:[function(require,module,exports){
'use strict';
var parent = require('../../es/array/is-array');

module.exports = parent;

},{"../../es/array/is-array":45}],267:[function(require,module,exports){
'use strict';
var parent = require('../../../es/array/virtual/for-each');

module.exports = parent;

},{"../../../es/array/virtual/for-each":49}],268:[function(require,module,exports){
'use strict';
var parent = require('../../es/instance/filter');

module.exports = parent;

},{"../../es/instance/filter":54}],269:[function(require,module,exports){
'use strict';
var parent = require('../../es/instance/find-index');

module.exports = parent;

},{"../../es/instance/find-index":55}],270:[function(require,module,exports){
'use strict';
var parent = require('../../es/instance/find');

module.exports = parent;

},{"../../es/instance/find":56}],271:[function(require,module,exports){
'use strict';
var classof = require('../../internals/classof');
var hasOwn = require('../../internals/has-own-property');
var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/for-each');
require('../../modules/web.dom-collections.for-each');

var ArrayPrototype = Array.prototype;

var DOMIterables = {
  DOMTokenList: true,
  NodeList: true
};

module.exports = function (it) {
  var own = it.forEach;
  return it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.forEach)
    || hasOwn(DOMIterables, classof(it)) ? method : own;
};

},{"../../internals/classof":100,"../../internals/has-own-property":136,"../../internals/object-is-prototype-of":170,"../../modules/web.dom-collections.for-each":263,"../array/virtual/for-each":267}],272:[function(require,module,exports){
'use strict';
var parent = require('../../es/instance/includes');

module.exports = parent;

},{"../../es/instance/includes":57}],273:[function(require,module,exports){
'use strict';
var parent = require('../../es/instance/index-of');

module.exports = parent;

},{"../../es/instance/index-of":58}],274:[function(require,module,exports){
'use strict';
var parent = require('../../es/instance/slice');

module.exports = parent;

},{"../../es/instance/slice":59}],275:[function(require,module,exports){
'use strict';
var parent = require('../../es/instance/splice');

module.exports = parent;

},{"../../es/instance/splice":60}],276:[function(require,module,exports){
'use strict';
var parent = require('../es/is-iterable');
require('../modules/web.dom-collections.iterator');

module.exports = parent;

},{"../es/is-iterable":61,"../modules/web.dom-collections.iterator":264}],277:[function(require,module,exports){
'use strict';
var parent = require('../../es/object/define-properties');

module.exports = parent;

},{"../../es/object/define-properties":62}],278:[function(require,module,exports){
'use strict';
var parent = require('../../es/object/define-property');

module.exports = parent;

},{"../../es/object/define-property":63}],279:[function(require,module,exports){
'use strict';
var parent = require('../../es/object/get-own-property-descriptor');

module.exports = parent;

},{"../../es/object/get-own-property-descriptor":64}],280:[function(require,module,exports){
'use strict';
var parent = require('../../es/object/get-own-property-descriptors');

module.exports = parent;

},{"../../es/object/get-own-property-descriptors":65}],281:[function(require,module,exports){
'use strict';
var parent = require('../../es/object/get-own-property-symbols');

module.exports = parent;

},{"../../es/object/get-own-property-symbols":66}],282:[function(require,module,exports){
'use strict';
var parent = require('../../es/object/keys');

module.exports = parent;

},{"../../es/object/keys":67}],283:[function(require,module,exports){
'use strict';
var parent = require('../../es/symbol');
require('../../modules/web.dom-collections.iterator');

module.exports = parent;

},{"../../es/symbol":69,"../../modules/web.dom-collections.iterator":264}],284:[function(require,module,exports){
var isObject = require('../internals/is-object');

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};

},{"../internals/is-object":305}],285:[function(require,module,exports){
var toIndexedObject = require('../internals/to-indexed-object');
var toLength = require('../internals/to-length');
var toAbsoluteIndex = require('../internals/to-absolute-index');

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

},{"../internals/to-absolute-index":322,"../internals/to-indexed-object":323,"../internals/to-length":325}],286:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],287:[function(require,module,exports){
var has = require('../internals/has');
var ownKeys = require('../internals/own-keys');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var definePropertyModule = require('../internals/object-define-property');

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

},{"../internals/has":298,"../internals/object-define-property":308,"../internals/object-get-own-property-descriptor":309,"../internals/own-keys":314}],288:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"../internals/create-property-descriptor":289,"../internals/descriptors":290,"../internals/object-define-property":308}],289:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],290:[function(require,module,exports){
var fails = require('../internals/fails');

// Thank's IE8 for his funny defineProperty
module.exports = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

},{"../internals/fails":295}],291:[function(require,module,exports){
var global = require('../internals/global');
var isObject = require('../internals/is-object');

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};

},{"../internals/global":297,"../internals/is-object":305}],292:[function(require,module,exports){
var getBuiltIn = require('../internals/get-built-in');

module.exports = getBuiltIn('navigator', 'userAgent') || '';

},{"../internals/get-built-in":296}],293:[function(require,module,exports){
// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

},{}],294:[function(require,module,exports){
var global = require('../internals/global');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var redefine = require('../internals/redefine');
var setGlobal = require('../internals/set-global');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var isForced = require('../internals/is-forced');

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};

},{"../internals/copy-constructor-properties":287,"../internals/create-non-enumerable-property":288,"../internals/global":297,"../internals/is-forced":304,"../internals/object-get-own-property-descriptor":309,"../internals/redefine":316,"../internals/set-global":318}],295:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

},{}],296:[function(require,module,exports){
var path = require('../internals/path');
var global = require('../internals/global');

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
    : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
};

},{"../internals/global":297,"../internals/path":315}],297:[function(require,module,exports){
(function (global){(function (){
var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],298:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],299:[function(require,module,exports){
module.exports = {};

},{}],300:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var createElement = require('../internals/document-create-element');

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

},{"../internals/descriptors":290,"../internals/document-create-element":291,"../internals/fails":295}],301:[function(require,module,exports){
var fails = require('../internals/fails');
var classof = require('../internals/classof-raw');

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

},{"../internals/classof-raw":286,"../internals/fails":295}],302:[function(require,module,exports){
var store = require('../internals/shared-store');

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof store.inspectSource != 'function') {
  store.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

module.exports = store.inspectSource;

},{"../internals/shared-store":320}],303:[function(require,module,exports){
var NATIVE_WEAK_MAP = require('../internals/native-weak-map');
var global = require('../internals/global');
var isObject = require('../internals/is-object');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var objectHas = require('../internals/has');
var sharedKey = require('../internals/shared-key');
var hiddenKeys = require('../internals/hidden-keys');

var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

},{"../internals/create-non-enumerable-property":288,"../internals/global":297,"../internals/has":298,"../internals/hidden-keys":299,"../internals/is-object":305,"../internals/native-weak-map":307,"../internals/shared-key":319}],304:[function(require,module,exports){
var fails = require('../internals/fails');

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;

},{"../internals/fails":295}],305:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],306:[function(require,module,exports){
module.exports = false;

},{}],307:[function(require,module,exports){
var global = require('../internals/global');
var inspectSource = require('../internals/inspect-source');

var WeakMap = global.WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

},{"../internals/global":297,"../internals/inspect-source":302}],308:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');
var anObject = require('../internals/an-object');
var toPrimitive = require('../internals/to-primitive');

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"../internals/an-object":284,"../internals/descriptors":290,"../internals/ie8-dom-define":300,"../internals/to-primitive":326}],309:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var toIndexedObject = require('../internals/to-indexed-object');
var toPrimitive = require('../internals/to-primitive');
var has = require('../internals/has');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};

},{"../internals/create-property-descriptor":289,"../internals/descriptors":290,"../internals/has":298,"../internals/ie8-dom-define":300,"../internals/object-property-is-enumerable":313,"../internals/to-indexed-object":323,"../internals/to-primitive":326}],310:[function(require,module,exports){
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};

},{"../internals/enum-bug-keys":293,"../internals/object-keys-internal":312}],311:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],312:[function(require,module,exports){
var has = require('../internals/has');
var toIndexedObject = require('../internals/to-indexed-object');
var indexOf = require('../internals/array-includes').indexOf;
var hiddenKeys = require('../internals/hidden-keys');

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};

},{"../internals/array-includes":285,"../internals/has":298,"../internals/hidden-keys":299,"../internals/to-indexed-object":323}],313:[function(require,module,exports){
'use strict';
var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;

},{}],314:[function(require,module,exports){
var getBuiltIn = require('../internals/get-built-in');
var getOwnPropertyNamesModule = require('../internals/object-get-own-property-names');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var anObject = require('../internals/an-object');

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

},{"../internals/an-object":284,"../internals/get-built-in":296,"../internals/object-get-own-property-names":310,"../internals/object-get-own-property-symbols":311}],315:[function(require,module,exports){
var global = require('../internals/global');

module.exports = global;

},{"../internals/global":297}],316:[function(require,module,exports){
var global = require('../internals/global');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var has = require('../internals/has');
var setGlobal = require('../internals/set-global');
var inspectSource = require('../internals/inspect-source');
var InternalStateModule = require('../internals/internal-state');

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(String).split('String');

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
});

},{"../internals/create-non-enumerable-property":288,"../internals/global":297,"../internals/has":298,"../internals/inspect-source":302,"../internals/internal-state":303,"../internals/set-global":318}],317:[function(require,module,exports){
// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

},{}],318:[function(require,module,exports){
var global = require('../internals/global');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');

module.exports = function (key, value) {
  try {
    createNonEnumerableProperty(global, key, value);
  } catch (error) {
    global[key] = value;
  } return value;
};

},{"../internals/create-non-enumerable-property":288,"../internals/global":297}],319:[function(require,module,exports){
var shared = require('../internals/shared');
var uid = require('../internals/uid');

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

},{"../internals/shared":321,"../internals/uid":327}],320:[function(require,module,exports){
var global = require('../internals/global');
var setGlobal = require('../internals/set-global');

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

module.exports = store;

},{"../internals/global":297,"../internals/set-global":318}],321:[function(require,module,exports){
var IS_PURE = require('../internals/is-pure');
var store = require('../internals/shared-store');

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.6.5',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});

},{"../internals/is-pure":306,"../internals/shared-store":320}],322:[function(require,module,exports){
var toInteger = require('../internals/to-integer');

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};

},{"../internals/to-integer":324}],323:[function(require,module,exports){
// toObject with fallback for non-array-like ES3 strings
var IndexedObject = require('../internals/indexed-object');
var requireObjectCoercible = require('../internals/require-object-coercible');

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};

},{"../internals/indexed-object":301,"../internals/require-object-coercible":317}],324:[function(require,module,exports){
var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

},{}],325:[function(require,module,exports){
var toInteger = require('../internals/to-integer');

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

},{"../internals/to-integer":324}],326:[function(require,module,exports){
var isObject = require('../internals/is-object');

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"../internals/is-object":305}],327:[function(require,module,exports){
var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};

},{}],328:[function(require,module,exports){
var $ = require('../internals/export');
var global = require('../internals/global');
var userAgent = require('../internals/engine-user-agent');

var slice = [].slice;
var MSIE = /MSIE .\./.test(userAgent); // <- dirty ie9- check

var wrap = function (scheduler) {
  return function (handler, timeout /* , ...arguments */) {
    var boundArgs = arguments.length > 2;
    var args = boundArgs ? slice.call(arguments, 2) : undefined;
    return scheduler(boundArgs ? function () {
      // eslint-disable-next-line no-new-func
      (typeof handler == 'function' ? handler : Function(handler)).apply(this, args);
    } : handler, timeout);
  };
};

// ie9- setTimeout & setInterval additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
$({ global: true, bind: true, forced: MSIE }, {
  // `setTimeout` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
  setTimeout: wrap(global.setTimeout),
  // `setInterval` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
  setInterval: wrap(global.setInterval)
});

},{"../internals/engine-user-agent":292,"../internals/export":294,"../internals/global":297}],329:[function(require,module,exports){
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

},{}],330:[function(require,module,exports){
// check document first so it doesn't error in node.js
var style = typeof document != 'undefined'
  ? document.createElement('p').style
  : {}

var prefixes = ['O', 'ms', 'Moz', 'Webkit']
var upper = /([A-Z])/g
var memo = {}

/**
 * prefix `key`
 *
 *   prefix('transform') // => WebkitTransform
 *
 * @param {String} key
 * @return {String}
 * @api public
 */
function prefix(key){
  // Camel case
  key = key.replace(/-([a-z])/g, function(_, char){
    return char.toUpperCase()
  })

  // Without prefix
  if (style[key] !== undefined) return key

  // With prefix
  var Key = key.charAt(0).toUpperCase() + key.slice(1)
  var i = prefixes.length
  while (i--) {
    var name = prefixes[i] + Key
    if (style[name] !== undefined) return name
  }

  return key
}

/**
 * Memoized version of `prefix`
 *
 * @param {String} key
 * @return {String}
 * @api public
 */
function prefixMemozied(key){
  return key in memo
    ? memo[key]
    : memo[key] = prefix(key)
}

/**
 * Create a dashed prefix
 *
 * @param {String} key
 * @return {String}
 * @api public
 */
function prefixDashed(key){
  key = prefix(key)
  if (upper.test(key)) {
    key = '-' + key.replace(upper, '-$1')
    upper.lastIndex = 0
  }
  return key.toLowerCase()
}

module.exports = prefixMemozied
module.exports.dash = prefixDashed

},{}],331:[function(require,module,exports){
(function (process,setImmediate){(function (){
/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.rebound = factory());
}(this, (function () { 'use strict';

var _onFrame = void 0;
if (typeof window !== 'undefined') {
  _onFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
}

if (!_onFrame && typeof process !== 'undefined' && process.title === 'node') {
  _onFrame = setImmediate;
}

_onFrame = _onFrame || function (callback) {
  window.setTimeout(callback, 1000 / 60);
};

var _onFrame$1 = _onFrame;

/* eslint-disable flowtype/no-weak-types */

var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

// Bind a function to a context object.
function bind(func, context) {
  for (var _len = arguments.length, outerArgs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    outerArgs[_key - 2] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, innerArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      innerArgs[_key2] = arguments[_key2];
    }

    func.apply(context, concat.call(outerArgs, slice.call(innerArgs)));
  };
}

// Add all the properties in the source to the target.
function extend(target, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}

// Cross browser/node timer functions.
function onFrame(func) {
  return _onFrame$1(func);
}

// Lop off the first occurence of the reference in the Array.
function removeFirst(array, item) {
  var idx = array.indexOf(item);
  idx !== -1 && array.splice(idx, 1);
}

var colorCache = {};
/**
 * Converts a hex-formatted color string to its rgb-formatted equivalent. Handy
 * when performing color tweening animations
 * @public
 * @param colorString A hex-formatted color string
 * @return An rgb-formatted color string
 */
function hexToRGB(colorString) {
  if (colorCache[colorString]) {
    return colorCache[colorString];
  }
  var normalizedColor = colorString.replace('#', '');
  if (normalizedColor.length === 3) {
    normalizedColor = normalizedColor[0] + normalizedColor[0] + normalizedColor[1] + normalizedColor[1] + normalizedColor[2] + normalizedColor[2];
  }
  var parts = normalizedColor.match(/.{2}/g);
  if (!parts || parts.length < 3) {
    throw new Error('Expected a color string of format #rrggbb');
  }

  var ret = {
    r: parseInt(parts[0], 16),
    g: parseInt(parts[1], 16),
    b: parseInt(parts[2], 16)
  };

  colorCache[colorString] = ret;
  return ret;
}

/**
 * Converts a rgb-formatted color string to its hex-formatted equivalent. Handy
 * when performing color tweening animations
 * @public
 * @param colorString An rgb-formatted color string
 * @return A hex-formatted color string
 */
function rgbToHex(rNum, gNum, bNum) {
  var r = rNum.toString(16);
  var g = gNum.toString(16);
  var b = bNum.toString(16);
  r = r.length < 2 ? '0' + r : r;
  g = g.length < 2 ? '0' + g : g;
  b = b.length < 2 ? '0' + b : b;
  return '#' + r + g + b;
}

var util = Object.freeze({
	bind: bind,
	extend: extend,
	onFrame: onFrame,
	removeFirst: removeFirst,
	hexToRGB: hexToRGB,
	rgbToHex: rgbToHex
});

/**
 * This helper function does a linear interpolation of a value from
 * one range to another. This can be very useful for converting the
 * motion of a Spring to a range of UI property values. For example a
 * spring moving from position 0 to 1 could be interpolated to move a
 * view from pixel 300 to 350 and scale it from 0.5 to 1. The current
 * position of the `Spring` just needs to be run through this method
 * taking its input range in the _from_ parameters with the property
 * animation range in the _to_ parameters.
 * @public
 */
function mapValueInRange(value, fromLow, fromHigh, toLow, toHigh) {
  var fromRangeSize = fromHigh - fromLow;
  var toRangeSize = toHigh - toLow;
  var valueScale = (value - fromLow) / fromRangeSize;
  return toLow + valueScale * toRangeSize;
}

/**
 * Interpolate two hex colors in a 0 - 1 range or optionally provide a
 * custom range with fromLow,fromHight. The output will be in hex by default
 * unless asRGB is true in which case it will be returned as an rgb string.
 *
 * @public
 * @param asRGB Whether to return an rgb-style string
 * @return A string in hex color format unless asRGB is true, in which case a string in rgb format
 */
function interpolateColor(val, startColorStr, endColorStr) {
  var fromLow = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var fromHigh = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var asRGB = arguments[5];

  var startColor = hexToRGB(startColorStr);
  var endColor = hexToRGB(endColorStr);
  var r = Math.floor(mapValueInRange(val, fromLow, fromHigh, startColor.r, endColor.r));
  var g = Math.floor(mapValueInRange(val, fromLow, fromHigh, startColor.g, endColor.g));
  var b = Math.floor(mapValueInRange(val, fromLow, fromHigh, startColor.b, endColor.b));
  if (asRGB) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  } else {
    return rgbToHex(r, g, b);
  }
}

function degreesToRadians(deg) {
  return deg * Math.PI / 180;
}

function radiansToDegrees(rad) {
  return rad * 180 / Math.PI;
}

var MathUtil = Object.freeze({
	mapValueInRange: mapValueInRange,
	interpolateColor: interpolateColor,
	degreesToRadians: degreesToRadians,
	radiansToDegrees: radiansToDegrees
});

// Math for converting from
// [Origami](http://facebook.github.io/origami/) to
// [Rebound](http://facebook.github.io/rebound).
// You mostly don't need to worry about this, just use
// SpringConfig.fromOrigamiTensionAndFriction(v, v);

function tensionFromOrigamiValue(oValue) {
  return (oValue - 30.0) * 3.62 + 194.0;
}

function origamiValueFromTension(tension) {
  return (tension - 194.0) / 3.62 + 30.0;
}

function frictionFromOrigamiValue(oValue) {
  return (oValue - 8.0) * 3.0 + 25.0;
}

function origamiFromFriction(friction) {
  return (friction - 25.0) / 3.0 + 8.0;
}

var OrigamiValueConverter = Object.freeze({
	tensionFromOrigamiValue: tensionFromOrigamiValue,
	origamiValueFromTension: origamiValueFromTension,
	frictionFromOrigamiValue: frictionFromOrigamiValue,
	origamiFromFriction: origamiFromFriction
});

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Plays each frame of the SpringSystem on animation
 * timing loop. This is the default type of looper for a new spring system
 * as it is the most common when developing UI.
 * @public
 */
/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

var AnimationLooper = function () {
  function AnimationLooper() {
    classCallCheck(this, AnimationLooper);
    this.springSystem = null;
  }

  AnimationLooper.prototype.run = function run() {
    var springSystem = getSpringSystem.call(this);

    onFrame(function () {
      springSystem.loop(Date.now());
    });
  };

  return AnimationLooper;
}();

/**
 * Resolves the SpringSystem to a resting state in a
 * tight and blocking loop. This is useful for synchronously generating
 * pre-recorded animations that can then be played on a timing loop later.
 * Sometimes this lead to better performance to pre-record a single spring
 * curve and use it to drive many animations; however, it can make dynamic
 * response to user input a bit trickier to implement.
 * @public
 */
var SimulationLooper = function () {
  function SimulationLooper(timestep) {
    classCallCheck(this, SimulationLooper);
    this.springSystem = null;
    this.time = 0;
    this.running = false;

    this.timestep = timestep || 16.667;
  }

  SimulationLooper.prototype.run = function run() {
    var springSystem = getSpringSystem.call(this);

    if (this.running) {
      return;
    }
    this.running = true;
    while (!springSystem.getIsIdle()) {
      springSystem.loop(this.time += this.timestep);
    }
    this.running = false;
  };

  return SimulationLooper;
}();

/**
 * Resolves the SpringSystem one step at a
 * time controlled by an outside loop. This is useful for testing and
 * verifying the behavior of a SpringSystem or if you want to control your own
 * timing loop for some reason e.g. slowing down or speeding up the
 * simulation.
 * @public
 */
var SteppingSimulationLooper = function () {
  function SteppingSimulationLooper() {
    classCallCheck(this, SteppingSimulationLooper);
    this.springSystem = null;
    this.time = 0;
    this.running = false;
  }

  SteppingSimulationLooper.prototype.run = function run() {}
  // this.run is NOOP'd here to allow control from the outside using
  // this.step.


  // Perform one step toward resolving the SpringSystem.
  ;

  SteppingSimulationLooper.prototype.step = function step(timestep) {
    var springSystem = getSpringSystem.call(this);
    springSystem.loop(this.time += timestep);
  };

  return SteppingSimulationLooper;
}();

function getSpringSystem() {
  if (this.springSystem == null) {
    throw new Error('cannot run looper without a springSystem');
  }
  return this.springSystem;
}



var Loopers = Object.freeze({
	AnimationLooper: AnimationLooper,
	SimulationLooper: SimulationLooper,
	SteppingSimulationLooper: SteppingSimulationLooper
});

/**
 * Provides math for converting from Origami PopAnimation
 * config values to regular Origami tension and friction values. If you are
 * trying to replicate prototypes made with PopAnimation patches in Origami,
 * then you should create your springs with
 * SpringSystem.createSpringWithBouncinessAndSpeed, which uses this Math
 * internally to create a spring to match the provided PopAnimation
 * configuration from Origami.
 */
var BouncyConversion = function () {
  function BouncyConversion(bounciness, speed) {
    classCallCheck(this, BouncyConversion);

    this.bounciness = bounciness;
    this.speed = speed;

    var b = this.normalize(bounciness / 1.7, 0, 20.0);
    b = this.projectNormal(b, 0.0, 0.8);
    var s = this.normalize(speed / 1.7, 0, 20.0);

    this.bouncyTension = this.projectNormal(s, 0.5, 200);
    this.bouncyFriction = this.quadraticOutInterpolation(b, this.b3Nobounce(this.bouncyTension), 0.01);
  }

  BouncyConversion.prototype.normalize = function normalize(value, startValue, endValue) {
    return (value - startValue) / (endValue - startValue);
  };

  BouncyConversion.prototype.projectNormal = function projectNormal(n, start, end) {
    return start + n * (end - start);
  };

  BouncyConversion.prototype.linearInterpolation = function linearInterpolation(t, start, end) {
    return t * end + (1.0 - t) * start;
  };

  BouncyConversion.prototype.quadraticOutInterpolation = function quadraticOutInterpolation(t, start, end) {
    return this.linearInterpolation(2 * t - t * t, start, end);
  };

  BouncyConversion.prototype.b3Friction1 = function b3Friction1(x) {
    return 0.0007 * Math.pow(x, 3) - 0.031 * Math.pow(x, 2) + 0.64 * x + 1.28;
  };

  BouncyConversion.prototype.b3Friction2 = function b3Friction2(x) {
    return 0.000044 * Math.pow(x, 3) - 0.006 * Math.pow(x, 2) + 0.36 * x + 2;
  };

  BouncyConversion.prototype.b3Friction3 = function b3Friction3(x) {
    return 0.00000045 * Math.pow(x, 3) - 0.000332 * Math.pow(x, 2) + 0.1078 * x + 5.84;
  };

  BouncyConversion.prototype.b3Nobounce = function b3Nobounce(tension) {
    var friction = 0;
    if (tension <= 18) {
      friction = this.b3Friction1(tension);
    } else if (tension > 18 && tension <= 44) {
      friction = this.b3Friction2(tension);
    } else {
      friction = this.b3Friction3(tension);
    }
    return friction;
  };

  return BouncyConversion;
}();

/**
 * Maintains a set of tension and friction constants
 * for a Spring. You can use fromOrigamiTensionAndFriction to convert
 * values from the [Origami](http://facebook.github.io/origami/)
 * design tool directly to Rebound spring constants.
 * @public
 */

var SpringConfig = function () {

  /**
   * Convert an origami Spring tension and friction to Rebound spring
   * constants. If you are prototyping a design with Origami, this
   * makes it easy to make your springs behave exactly the same in
   * Rebound.
   * @public
   */
  SpringConfig.fromOrigamiTensionAndFriction = function fromOrigamiTensionAndFriction(tension, friction) {
    return new SpringConfig(tensionFromOrigamiValue(tension), frictionFromOrigamiValue(friction));
  };

  /**
   * Convert an origami PopAnimation Spring bounciness and speed to Rebound
   * spring constants. If you are using PopAnimation patches in Origami, this
   * utility will provide springs that match your prototype.
   * @public
   */


  SpringConfig.fromBouncinessAndSpeed = function fromBouncinessAndSpeed(bounciness, speed) {
    var bouncyConversion = new BouncyConversion(bounciness, speed);
    return SpringConfig.fromOrigamiTensionAndFriction(bouncyConversion.bouncyTension, bouncyConversion.bouncyFriction);
  };

  /**
   * Create a SpringConfig with no tension or a coasting spring with some
   * amount of Friction so that it does not coast infininitely.
   * @public
   */


  SpringConfig.coastingConfigWithOrigamiFriction = function coastingConfigWithOrigamiFriction(friction) {
    return new SpringConfig(0, frictionFromOrigamiValue(friction));
  };

  function SpringConfig(tension, friction) {
    classCallCheck(this, SpringConfig);

    this.tension = tension;
    this.friction = friction;
  }

  return SpringConfig;
}();

SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG = SpringConfig.fromOrigamiTensionAndFriction(40, 7);

/**
 * Consists of a position and velocity. A Spring uses
 * this internally to keep track of its current and prior position and
 * velocity values.
 */
var PhysicsState = function PhysicsState() {
  classCallCheck(this, PhysicsState);
  this.position = 0;
  this.velocity = 0;
};

/**
 * Provides a model of a classical spring acting to
 * resolve a body to equilibrium. Springs have configurable
 * tension which is a force multipler on the displacement of the
 * spring from its rest point or `endValue` as defined by [Hooke's
 * law](http://en.wikipedia.org/wiki/Hooke's_law). Springs also have
 * configurable friction, which ensures that they do not oscillate
 * infinitely. When a Spring is displaced by updating it's resting
 * or `currentValue`, the SpringSystems that contain that Spring
 * will automatically start looping to solve for equilibrium. As each
 * timestep passes, `SpringListener` objects attached to the Spring
 * will be notified of the updates providing a way to drive an
 * animation off of the spring's resolution curve.
 * @public
 */

var Spring = function () {
  function Spring(springSystem) {
    classCallCheck(this, Spring);
    this.listeners = [];
    this._startValue = 0;
    this._currentState = new PhysicsState();
    this._displacementFromRestThreshold = 0.001;
    this._endValue = 0;
    this._overshootClampingEnabled = false;
    this._previousState = new PhysicsState();
    this._restSpeedThreshold = 0.001;
    this._tempState = new PhysicsState();
    this._timeAccumulator = 0;
    this._wasAtRest = true;

    this._id = 's' + Spring._ID++;
    this._springSystem = springSystem;
  }

  /**
   * Remove a Spring from simulation and clear its listeners.
   * @public
   */


  Spring.prototype.destroy = function destroy() {
    this.listeners = [];
    this._springSystem.deregisterSpring(this);
  };

  /**
   * Get the id of the spring, which can be used to retrieve it from
   * the SpringSystems it participates in later.
   * @public
   */


  Spring.prototype.getId = function getId() {
    return this._id;
  };

  /**
   * Set the configuration values for this Spring. A SpringConfig
   * contains the tension and friction values used to solve for the
   * equilibrium of the Spring in the physics loop.
   * @public
   */


  Spring.prototype.setSpringConfig = function setSpringConfig(springConfig) {
    this._springConfig = springConfig;
    return this;
  };

  /**
   * Retrieve the SpringConfig used by this Spring.
   * @public
   */


  Spring.prototype.getSpringConfig = function getSpringConfig() {
    return this._springConfig;
  };

  /**
   * Set the current position of this Spring. Listeners will be updated
   * with this value immediately. If the rest or `endValue` is not
   * updated to match this value, then the spring will be dispalced and
   * the SpringSystem will start to loop to restore the spring to the
   * `endValue`.
   *
   * A common pattern is to move a Spring around without animation by
   * calling.
   *
   * ```
   * spring.setCurrentValue(n).setAtRest();
   * ```
   *
   * This moves the Spring to a new position `n`, sets the endValue
   * to `n`, and removes any velocity from the `Spring`. By doing
   * this you can allow the `SpringListener` to manage the position
   * of UI elements attached to the spring even when moving without
   * animation. For example, when dragging an element you can
   * update the position of an attached view through a spring
   * by calling `spring.setCurrentValue(x)`. When
   * the gesture ends you can update the Springs
   * velocity and endValue
   * `spring.setVelocity(gestureEndVelocity).setEndValue(flingTarget)`
   * to cause it to naturally animate the UI element to the resting
   * position taking into account existing velocity. The codepaths for
   * synchronous movement and spring driven animation can
   * be unified using this technique.
   * @public
   */


  Spring.prototype.setCurrentValue = function setCurrentValue(currentValue, skipSetAtRest) {
    this._startValue = currentValue;
    this._currentState.position = currentValue;
    if (!skipSetAtRest) {
      this.setAtRest();
    }
    this.notifyPositionUpdated(false, false);
    return this;
  };

  /**
   * Get the position that the most recent animation started at. This
   * can be useful for determining the number off oscillations that
   * have occurred.
   * @public
   */


  Spring.prototype.getStartValue = function getStartValue() {
    return this._startValue;
  };

  /**
   * Retrieve the current value of the Spring.
   * @public
   */


  Spring.prototype.getCurrentValue = function getCurrentValue() {
    return this._currentState.position;
  };

  /**
   * Get the absolute distance of the Spring from its resting endValue
   * position.
   * @public
   */


  Spring.prototype.getCurrentDisplacementDistance = function getCurrentDisplacementDistance() {
    return this.getDisplacementDistanceForState(this._currentState);
  };

  /**
   * Get the absolute distance of the Spring from a given state value
   */


  Spring.prototype.getDisplacementDistanceForState = function getDisplacementDistanceForState(state) {
    return Math.abs(this._endValue - state.position);
  };

  /**
   * Set the endValue or resting position of the spring. If this
   * value is different than the current value, the SpringSystem will
   * be notified and will begin running its solver loop to resolve
   * the Spring to equilibrium. Any listeners that are registered
   * for onSpringEndStateChange will also be notified of this update
   * immediately.
   * @public
   */


  Spring.prototype.setEndValue = function setEndValue(endValue) {
    if (this._endValue === endValue && this.isAtRest()) {
      return this;
    }
    this._startValue = this.getCurrentValue();
    this._endValue = endValue;
    this._springSystem.activateSpring(this.getId());
    for (var i = 0, len = this.listeners.length; i < len; i++) {
      var listener = this.listeners[i];
      var onChange = listener.onSpringEndStateChange;
      onChange && onChange(this);
    }
    return this;
  };

  /**
   * Retrieve the endValue or resting position of this spring.
   * @public
   */


  Spring.prototype.getEndValue = function getEndValue() {
    return this._endValue;
  };

  /**
   * Set the current velocity of the Spring, in pixels per second. As
   * previously mentioned, this can be useful when you are performing
   * a direct manipulation gesture. When a UI element is released you
   * may call setVelocity on its animation Spring so that the Spring
   * continues with the same velocity as the gesture ended with. The
   * friction, tension, and displacement of the Spring will then
   * govern its motion to return to rest on a natural feeling curve.
   * @public
   */


  Spring.prototype.setVelocity = function setVelocity(velocity) {
    if (velocity === this._currentState.velocity) {
      return this;
    }
    this._currentState.velocity = velocity;
    this._springSystem.activateSpring(this.getId());
    return this;
  };

  /**
   * Get the current velocity of the Spring, in pixels per second.
   * @public
   */


  Spring.prototype.getVelocity = function getVelocity() {
    return this._currentState.velocity;
  };

  /**
   * Set a threshold value for the movement speed of the Spring below
   * which it will be considered to be not moving or resting.
   * @public
   */


  Spring.prototype.setRestSpeedThreshold = function setRestSpeedThreshold(restSpeedThreshold) {
    this._restSpeedThreshold = restSpeedThreshold;
    return this;
  };

  /**
   * Retrieve the rest speed threshold for this Spring.
   * @public
   */


  Spring.prototype.getRestSpeedThreshold = function getRestSpeedThreshold() {
    return this._restSpeedThreshold;
  };

  /**
   * Set a threshold value for displacement below which the Spring
   * will be considered to be not displaced i.e. at its resting
   * `endValue`.
   * @public
   */


  Spring.prototype.setRestDisplacementThreshold = function setRestDisplacementThreshold(displacementFromRestThreshold) {
    this._displacementFromRestThreshold = displacementFromRestThreshold;
  };

  /**
   * Retrieve the rest displacement threshold for this spring.
   * @public
   */


  Spring.prototype.getRestDisplacementThreshold = function getRestDisplacementThreshold() {
    return this._displacementFromRestThreshold;
  };

  /**
   * Enable overshoot clamping. This means that the Spring will stop
   * immediately when it reaches its resting position regardless of
   * any existing momentum it may have. This can be useful for certain
   * types of animations that should not oscillate such as a scale
   * down to 0 or alpha fade.
   * @public
   */


  Spring.prototype.setOvershootClampingEnabled = function setOvershootClampingEnabled(enabled) {
    this._overshootClampingEnabled = enabled;
    return this;
  };

  /**
   * Check if overshoot clamping is enabled for this spring.
   * @public
   */


  Spring.prototype.isOvershootClampingEnabled = function isOvershootClampingEnabled() {
    return this._overshootClampingEnabled;
  };

  /**
   * Check if the Spring has gone past its end point by comparing
   * the direction it was moving in when it started to the current
   * position and end value.
   * @public
   */


  Spring.prototype.isOvershooting = function isOvershooting() {
    var start = this._startValue;
    var end = this._endValue;
    return this._springConfig.tension > 0 && (start < end && this.getCurrentValue() > end || start > end && this.getCurrentValue() < end);
  };

  /**
   * The main solver method for the Spring. It takes
   * the current time and delta since the last time step and performs
   * an RK4 integration to get the new position and velocity state
   * for the Spring based on the tension, friction, velocity, and
   * displacement of the Spring.
   * @public
   */


  Spring.prototype.advance = function advance(time, realDeltaTime) {
    var isAtRest = this.isAtRest();

    if (isAtRest && this._wasAtRest) {
      return;
    }

    var adjustedDeltaTime = realDeltaTime;
    if (realDeltaTime > Spring.MAX_DELTA_TIME_SEC) {
      adjustedDeltaTime = Spring.MAX_DELTA_TIME_SEC;
    }

    this._timeAccumulator += adjustedDeltaTime;

    var tension = this._springConfig.tension;
    var friction = this._springConfig.friction;
    var position = this._currentState.position;
    var velocity = this._currentState.velocity;
    var tempPosition = this._tempState.position;
    var tempVelocity = this._tempState.velocity;
    var aVelocity = void 0;
    var aAcceleration = void 0;
    var bVelocity = void 0;
    var bAcceleration = void 0;
    var cVelocity = void 0;
    var cAcceleration = void 0;
    var dVelocity = void 0;
    var dAcceleration = void 0;
    var dxdt = void 0;
    var dvdt = void 0;

    while (this._timeAccumulator >= Spring.SOLVER_TIMESTEP_SEC) {
      this._timeAccumulator -= Spring.SOLVER_TIMESTEP_SEC;

      if (this._timeAccumulator < Spring.SOLVER_TIMESTEP_SEC) {
        this._previousState.position = position;
        this._previousState.velocity = velocity;
      }

      aVelocity = velocity;
      aAcceleration = tension * (this._endValue - tempPosition) - friction * velocity;

      tempPosition = position + aVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      tempVelocity = velocity + aAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      bVelocity = tempVelocity;
      bAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

      tempPosition = position + bVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      tempVelocity = velocity + bAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      cVelocity = tempVelocity;
      cAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

      tempPosition = position + cVelocity * Spring.SOLVER_TIMESTEP_SEC;
      tempVelocity = velocity + cAcceleration * Spring.SOLVER_TIMESTEP_SEC;
      dVelocity = tempVelocity;
      dAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

      dxdt = 1.0 / 6.0 * (aVelocity + 2.0 * (bVelocity + cVelocity) + dVelocity);
      dvdt = 1.0 / 6.0 * (aAcceleration + 2.0 * (bAcceleration + cAcceleration) + dAcceleration);

      position += dxdt * Spring.SOLVER_TIMESTEP_SEC;
      velocity += dvdt * Spring.SOLVER_TIMESTEP_SEC;
    }

    this._tempState.position = tempPosition;
    this._tempState.velocity = tempVelocity;

    this._currentState.position = position;
    this._currentState.velocity = velocity;

    if (this._timeAccumulator > 0) {
      this._interpolate(this._timeAccumulator / Spring.SOLVER_TIMESTEP_SEC);
    }

    if (this.isAtRest() || this._overshootClampingEnabled && this.isOvershooting()) {
      if (this._springConfig.tension > 0) {
        this._startValue = this._endValue;
        this._currentState.position = this._endValue;
      } else {
        this._endValue = this._currentState.position;
        this._startValue = this._endValue;
      }
      this.setVelocity(0);
      isAtRest = true;
    }

    var notifyActivate = false;
    if (this._wasAtRest) {
      this._wasAtRest = false;
      notifyActivate = true;
    }

    var notifyAtRest = false;
    if (isAtRest) {
      this._wasAtRest = true;
      notifyAtRest = true;
    }

    this.notifyPositionUpdated(notifyActivate, notifyAtRest);
  };

  Spring.prototype.notifyPositionUpdated = function notifyPositionUpdated(notifyActivate, notifyAtRest) {
    for (var i = 0, len = this.listeners.length; i < len; i++) {
      var listener = this.listeners[i];
      if (notifyActivate && listener.onSpringActivate) {
        listener.onSpringActivate(this);
      }

      if (listener.onSpringUpdate) {
        listener.onSpringUpdate(this);
      }

      if (notifyAtRest && listener.onSpringAtRest) {
        listener.onSpringAtRest(this);
      }
    }
  };

  /**
   * Check if the SpringSystem should advance. Springs are advanced
   * a final frame after they reach equilibrium to ensure that the
   * currentValue is exactly the requested endValue regardless of the
   * displacement threshold.
   * @public
   */


  Spring.prototype.systemShouldAdvance = function systemShouldAdvance() {
    return !this.isAtRest() || !this.wasAtRest();
  };

  Spring.prototype.wasAtRest = function wasAtRest() {
    return this._wasAtRest;
  };

  /**
   * Check if the Spring is atRest meaning that it's currentValue and
   * endValue are the same and that it has no velocity. The previously
   * described thresholds for speed and displacement define the bounds
   * of this equivalence check. If the Spring has 0 tension, then it will
   * be considered at rest whenever its absolute velocity drops below the
   * restSpeedThreshold.
   * @public
   */


  Spring.prototype.isAtRest = function isAtRest() {
    return Math.abs(this._currentState.velocity) < this._restSpeedThreshold && (this.getDisplacementDistanceForState(this._currentState) <= this._displacementFromRestThreshold || this._springConfig.tension === 0);
  };

  /**
   * Force the spring to be at rest at its current position. As
   * described in the documentation for setCurrentValue, this method
   * makes it easy to do synchronous non-animated updates to ui
   * elements that are attached to springs via SpringListeners.
   * @public
   */


  Spring.prototype.setAtRest = function setAtRest() {
    this._endValue = this._currentState.position;
    this._tempState.position = this._currentState.position;
    this._currentState.velocity = 0;
    return this;
  };

  Spring.prototype._interpolate = function _interpolate(alpha) {
    this._currentState.position = this._currentState.position * alpha + this._previousState.position * (1 - alpha);
    this._currentState.velocity = this._currentState.velocity * alpha + this._previousState.velocity * (1 - alpha);
  };

  Spring.prototype.getListeners = function getListeners() {
    return this.listeners;
  };

  Spring.prototype.addListener = function addListener(newListener) {
    this.listeners.push(newListener);
    return this;
  };

  Spring.prototype.removeListener = function removeListener(listenerToRemove) {
    removeFirst(this.listeners, listenerToRemove);
    return this;
  };

  Spring.prototype.removeAllListeners = function removeAllListeners() {
    this.listeners = [];
    return this;
  };

  Spring.prototype.currentValueIsApproximately = function currentValueIsApproximately(value) {
    return Math.abs(this.getCurrentValue() - value) <= this.getRestDisplacementThreshold();
  };

  return Spring;
}();

Spring._ID = 0;
Spring.MAX_DELTA_TIME_SEC = 0.064;
Spring.SOLVER_TIMESTEP_SEC = 0.001;

/**
 * A set of Springs that all run on the same physics
 * timing loop. To get started with a Rebound animation, first
 * create a new SpringSystem and then add springs to it.
 * @public
 */

var SpringSystem = function () {
  function SpringSystem(looper) {
    classCallCheck(this, SpringSystem);
    this.listeners = [];
    this._activeSprings = [];
    this._idleSpringIndices = [];
    this._isIdle = true;
    this._lastTimeMillis = -1;
    this._springRegistry = {};

    this.looper = looper || new AnimationLooper();
    this.looper.springSystem = this;
  }

  /**
   * A SpringSystem is iterated by a looper. The looper is responsible
   * for executing each frame as the SpringSystem is resolved to idle.
   * There are three types of Loopers described below AnimationLooper,
   * SimulationLooper, and SteppingSimulationLooper. AnimationLooper is
   * the default as it is the most useful for common UI animations.
   * @public
   */


  SpringSystem.prototype.setLooper = function setLooper(looper) {
    this.looper = looper;
    looper.springSystem = this;
  };

  /**
   * Add a new spring to this SpringSystem. This Spring will now be solved for
   * during the physics iteration loop. By default the spring will use the
   * default Origami spring config with 40 tension and 7 friction, but you can
   * also provide your own values here.
   * @public
   */


  SpringSystem.prototype.createSpring = function createSpring(tension, friction) {
    var springConfig = void 0;
    if (tension === undefined || friction === undefined) {
      springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
    } else {
      springConfig = SpringConfig.fromOrigamiTensionAndFriction(tension, friction);
    }
    return this.createSpringWithConfig(springConfig);
  };

  /**
   * Add a spring with a specified bounciness and speed. To replicate Origami
   * compositions based on PopAnimation patches, use this factory method to
   * create matching springs.
   * @public
   */


  SpringSystem.prototype.createSpringWithBouncinessAndSpeed = function createSpringWithBouncinessAndSpeed(bounciness, speed) {
    var springConfig = void 0;
    if (bounciness === undefined || speed === undefined) {
      springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
    } else {
      springConfig = SpringConfig.fromBouncinessAndSpeed(bounciness, speed);
    }
    return this.createSpringWithConfig(springConfig);
  };

  /**
   * Add a spring with the provided SpringConfig.
   * @public
   */


  SpringSystem.prototype.createSpringWithConfig = function createSpringWithConfig(springConfig) {
    var spring = new Spring(this);
    this.registerSpring(spring);
    spring.setSpringConfig(springConfig);
    return spring;
  };

  /**
   * Check if a SpringSystem is idle or active. If all of the Springs in the
   * SpringSystem are at rest, i.e. the physics forces have reached equilibrium,
   * then this method will return true.
   * @public
   */


  SpringSystem.prototype.getIsIdle = function getIsIdle() {
    return this._isIdle;
  };

  /**
   * Retrieve a specific Spring from the SpringSystem by id. This
   * can be useful for inspecting the state of a spring before
   * or after an integration loop in the SpringSystem executes.
   * @public
   */


  SpringSystem.prototype.getSpringById = function getSpringById(id) {
    return this._springRegistry[id];
  };

  /**
   * Get a listing of all the springs registered with this
   * SpringSystem.
   * @public
   */


  SpringSystem.prototype.getAllSprings = function getAllSprings() {
    var vals = [];
    for (var _id in this._springRegistry) {
      if (this._springRegistry.hasOwnProperty(_id)) {
        vals.push(this._springRegistry[_id]);
      }
    }
    return vals;
  };

  /**
   * Manually add a spring to this system. This is called automatically
   * if a Spring is created with SpringSystem#createSpring.
   *
   * This method sets the spring up in the registry so that it can be solved
   * in the solver loop.
   * @public
   */


  SpringSystem.prototype.registerSpring = function registerSpring(spring) {
    this._springRegistry[spring.getId()] = spring;
  };

  /**
   * Deregister a spring with this SpringSystem. The SpringSystem will
   * no longer consider this Spring during its integration loop once
   * this is called. This is normally done automatically for you when
   * you call Spring#destroy.
   * @public
   */


  SpringSystem.prototype.deregisterSpring = function deregisterSpring(spring) {
    removeFirst(this._activeSprings, spring);
    delete this._springRegistry[spring.getId()];
  };

  SpringSystem.prototype.advance = function advance(time, deltaTime) {
    while (this._idleSpringIndices.length > 0) {
      this._idleSpringIndices.pop();
    }
    for (var i = 0, len = this._activeSprings.length; i < len; i++) {
      var spring = this._activeSprings[i];
      if (spring.systemShouldAdvance()) {
        spring.advance(time / 1000.0, deltaTime / 1000.0);
      } else {
        this._idleSpringIndices.push(this._activeSprings.indexOf(spring));
      }
    }
    while (this._idleSpringIndices.length > 0) {
      var idx = this._idleSpringIndices.pop();
      idx >= 0 && this._activeSprings.splice(idx, 1);
    }
  };

  /**
   * This is the main solver loop called to move the simulation
   * forward through time. Before each pass in the solver loop
   * onBeforeIntegrate is called on an any listeners that have
   * registered themeselves with the SpringSystem. This gives you
   * an opportunity to apply any constraints or adjustments to
   * the springs that should be enforced before each iteration
   * loop. Next the advance method is called to move each Spring in
   * the systemShouldAdvance forward to the current time. After the
   * integration step runs in advance, onAfterIntegrate is called
   * on any listeners that have registered themselves with the
   * SpringSystem. This gives you an opportunity to run any post
   * integration constraints or adjustments on the Springs in the
   * SpringSystem.
   * @public
   */


  SpringSystem.prototype.loop = function loop(currentTimeMillis) {
    var listener = void 0;
    if (this._lastTimeMillis === -1) {
      this._lastTimeMillis = currentTimeMillis - 1;
    }
    var ellapsedMillis = currentTimeMillis - this._lastTimeMillis;
    this._lastTimeMillis = currentTimeMillis;

    var i = 0;
    var len = this.listeners.length;
    for (i = 0; i < len; i++) {
      listener = this.listeners[i];
      listener.onBeforeIntegrate && listener.onBeforeIntegrate(this);
    }

    this.advance(currentTimeMillis, ellapsedMillis);
    if (this._activeSprings.length === 0) {
      this._isIdle = true;
      this._lastTimeMillis = -1;
    }

    for (i = 0; i < len; i++) {
      listener = this.listeners[i];
      listener.onAfterIntegrate && listener.onAfterIntegrate(this);
    }

    if (!this._isIdle) {
      this.looper.run();
    }
  };

  /**
   * Used to notify the SpringSystem that a Spring has become displaced.
   * The system responds by starting its solver loop up if it is currently idle.
   */


  SpringSystem.prototype.activateSpring = function activateSpring(springId) {
    var spring = this._springRegistry[springId];
    if (this._activeSprings.indexOf(spring) === -1) {
      this._activeSprings.push(spring);
    }
    if (this.getIsIdle()) {
      this._isIdle = false;
      this.looper.run();
    }
  };

  /**
   * Add a listener to the SpringSystem to receive before/after integration
   * notifications allowing Springs to be constrained or adjusted.
   * @public
   */


  SpringSystem.prototype.addListener = function addListener(listener) {
    this.listeners.push(listener);
  };

  /**
   * Remove a previously added listener on the SpringSystem.
   * @public
   */


  SpringSystem.prototype.removeListener = function removeListener(listener) {
    removeFirst(this.listeners, listener);
  };

  /**
   * Remove all previously added listeners on the SpringSystem.
   * @public
   */


  SpringSystem.prototype.removeAllListeners = function removeAllListeners() {
    this.listeners = [];
  };

  return SpringSystem;
}();

var index = _extends({}, Loopers, {
  OrigamiValueConverter: OrigamiValueConverter,
  MathUtil: MathUtil,
  Spring: Spring,
  SpringConfig: SpringConfig,
  SpringSystem: SpringSystem,
  util: _extends({}, util, MathUtil)
});

return index;

})));

}).call(this)}).call(this,require('_process'),require("timers").setImmediate)
},{"_process":1,"timers":2}],332:[function(require,module,exports){
'use strict';

var Sister;

/**
* @link https://github.com/gajus/sister for the canonical source repository
* @license https://github.com/gajus/sister/blob/master/LICENSE BSD 3-Clause
*/
Sister = function () {
    var sister = {},
        events = {};

    /**
     * @name handler
     * @function
     * @param {Object} data Event data.
     */

    /**
     * @param {String} name Event name.
     * @param {handler} handler
     * @return {listener}
     */
    sister.on = function (name, handler) {
        var listener = {name: name, handler: handler};
        events[name] = events[name] || [];
        events[name].unshift(listener);
        return listener;
    };

    /**
     * @param {listener}
     */
    sister.off = function (listener) {
        var index = events[listener.name].indexOf(listener);

        if (index !== -1) {
            events[listener.name].splice(index, 1);
        }
    };

    /**
     * @param {String} name Event name.
     * @param {Object} data Event data.
     */
    sister.trigger = function (name, data) {
        var listeners = events[name],
            i;

        if (listeners) {
            i = listeners.length;
            while (i--) {
                listeners[i].handler(data);
            }
        }
    };

    return sister;
};

module.exports = Sister;

},{}]},{},[3]);
