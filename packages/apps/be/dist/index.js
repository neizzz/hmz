import { listen } from '@colyseus/tools';
import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';
import { createProxyMiddleware } from 'http-proxy-middleware';
import require$$1$1 from 'node:tty';
import require$$1$2 from 'node:util';
import require$$0$1 from 'node:os';
import { createRequire } from 'node:module';
import require$$5 from 'node:crypto';
import require$$0$4, { EventEmitter as EventEmitter$2 } from 'node:events';
import require$$1$3 from 'node:https';
import require$$2 from 'node:http';
import require$$3 from 'node:net';
import require$$4 from 'node:tls';
import require$$7 from 'node:url';
import require$$0$2 from 'node:zlib';
import require$$0$3 from 'node:stream';
import path from 'node:path';
import Matter from 'matter-js';
import decomp from 'poly-decomp-es';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var lib = {};

var Delayed$1 = {};

Object.defineProperty(Delayed$1, "__esModule", { value: true });
Delayed$1.Delayed = Delayed$1.Type = void 0;
var Type;
(function (Type) {
    Type[Type["Interval"] = 0] = "Interval";
    Type[Type["Timeout"] = 1] = "Timeout";
    Type[Type["Async"] = 2] = "Async";
})(Type || (Delayed$1.Type = Type = {}));
class Delayed {
    constructor(handler, args, time, type) {
        this.active = true;
        this.paused = false;
        this.elapsedTime = 0;
        this.handler = handler;
        this.args = args;
        this.time = time;
        this.type = type;
    }
    tick(deltaTime) {
        if (this.paused) {
            return;
        }
        this.elapsedTime += deltaTime;
        if (this.elapsedTime >= this.time) {
            this.execute();
        }
    }
    execute() {
        this.handler.apply(this, this.args);
        switch (this.type) {
            case Type.Timeout:
            case Type.Async:
                this.active = false;
                break;
            case Type.Interval:
                this.elapsedTime -= this.time;
                break;
        }
    }
    reset() {
        this.elapsedTime = 0;
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
    }
    clear() {
        this.active = false;
    }
}
Delayed$1.Delayed = Delayed;

var TimerClearedError$1 = {};

Object.defineProperty(TimerClearedError$1, "__esModule", { value: true });
TimerClearedError$1.TimerClearedError = void 0;
/**
 * An error that occurs when the promise of a {@link Clock.duration} is rejected because the timer has been cleared by the clock instance.
 */
class TimerClearedError extends Error {
    constructor() {
        super("Timer has been cleared");
    }
}
TimerClearedError$1.TimerClearedError = TimerClearedError;

var ClockTimer$1 = {};

var Clock$1 = (function () {
    function Clock(useInterval) {
        if (useInterval === void 0) { useInterval = false; }
        this.running = false;
        this.now = (typeof (window) !== "undefined" && window.performance && window.performance.now && (window.performance.now).bind(window.performance)) || Date.now;
        this.start(useInterval);
    }
    Clock.prototype.start = function (useInterval) {
        if (useInterval === void 0) { useInterval = false; }
        this.deltaTime = 0;
        this.currentTime = this.now();
        this.elapsedTime = 0;
        this.running = true;
        if (useInterval) {
            // auto set interval to 60 ticks per second
            this._interval = setInterval(this.tick.bind(this), 1000 / 60);
        }
    };
    Clock.prototype.stop = function () {
        this.running = false;
        if (this._interval) {
            clearInterval(this._interval);
        }
    };
    Clock.prototype.tick = function (newTime) {
        if (newTime === void 0) { newTime = this.now(); }
        this.deltaTime = newTime - this.currentTime;
        this.currentTime = newTime;
        this.elapsedTime += this.deltaTime;
    };
    return Clock;
}());
var dist = Clock$1;

var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ClockTimer$1, "__esModule", { value: true });
ClockTimer$1.ClockTimer = void 0;
const clock_1 = __importDefault(dist);
const Delayed_1 = Delayed$1;
const TimerClearedError_1 = TimerClearedError$1;
class ClockTimer extends clock_1.default {
    constructor(autoStart = false) {
        super(autoStart);
        /**
         * An array of all the scheduled timeouts and intervals.
         * @private For compatibility it's public but avoid modifying it directly.
         */
        this.delayed = [];
    }
    /**
     * Re-evaluate all the scheduled timeouts and intervals and execute appropriate handlers.
     * Use this in your own context or not if your passed `autoStart` as `true` in the constructor.
     */
    tick() {
        super.tick();
        let delayedList = this.delayed;
        let i = delayedList.length;
        while (i--) {
            const delayed = delayedList[i];
            if (delayed.active) {
                delayed.tick(this.deltaTime);
            }
            else {
                delayedList.splice(i, 1);
                continue;
            }
        }
    }
    /**
     * Schedule a function to be called every `time` milliseconds.
     * This `time` minimum value will be tied to the `tick` method of the clock. This means if you use the default `autoStart` value from the constructor, the minimum value will be 16ms. Otherwise it will depend on your `tick` method call.
     *
     * Returns a {@link Delayed} object that can be used to clear the timeout or play around with it.
     */
    setInterval(handler, time, ...args) {
        const delayed = new Delayed_1.Delayed(handler, args, time, Delayed_1.Type.Interval);
        this.delayed.push(delayed);
        return delayed;
    }
    /**
     * Schedule a function to be called after a delay.
     *
     * This `time` minimum value will be tied to the `tick` method of the clock. This means if you use the default `autoStart` value from the constructor, the minimum value will be 16ms. Otherwise it will depend on your `tick` method call.
     *
     * Returns a {@link Delayed} object that can be used to clear the timeout or play around with it.
     */
    setTimeout(handler, time, ...args) {
        const delayed = new Delayed_1.Delayed(handler, args, time, Delayed_1.Type.Timeout);
        this.delayed.push(delayed);
        return delayed;
    }
    /**
     * A promise that schedule a timeout that will resolves after the given time.
     *
     * If the {@link Delayed} instance is cleared before the time, the promise will be rejected. This happens when the {@link ClockTimer.clear} method is called.
     *
     * For the sake of simplicity of this API, you can only cancel a timeout scheduled with this method with {@link ClockTimer.clear} method (which clears all scheduled timeouts and intervals).
     * If you need fine-tuned control over the timeout, use the {@link ClockTimer.setTimeout} method instead.
     *
     * @example **Inside an async function**
     * ```typescript
     * const timer = new Clock(true);
     * await timer.duration(1000);
     * console.log("1 second later");
     * ```
     *
     * @example **Using the promise**
     * ```typescript
     * const timer = new Clock(true);
     * timer.duration(1000).then(() => console.log("1 second later"));
     * ```
     *
     * @example **Using the promise with error**
     * ```typescript
     * const timer = new Clock(true);
     * timer.duration(1000).then(() => console.log("1 second later")).catch(() => console.log("Timer cleared"));
     * timer.clear();
     * ```
     *
     *
     * @param ms the duration in milliseconds in which the promise will be resolved
     */
    duration(ms) {
        return new Promise((resolve, reject) => {
            const delayed = new Delayed_1.Delayed(resolve, undefined, ms, Delayed_1.Type.Async);
            delayed.clear = () => {
                delayed.active = false;
                reject(new TimerClearedError_1.TimerClearedError()); // To be able to use instanceof in try / catch blocks
            };
            this.delayed.push(delayed);
        });
    }
    /**
     * Delete any scheduled timeout or interval. That will never be executed.
     *
     * If some of the timeouts/intervals are already executed, they will be removed from the list and callback will be garbage collected.
     * For timeout created with {@link ClockTimer.duration}, the promise will be rejected and therefore the unused resolving callback will be garbage collected.
     */
    clear() {
        let i = this.delayed.length;
        while (i--) {
            this.delayed[i].clear();
        }
        this.delayed = [];
    }
}
ClockTimer$1.ClockTimer = ClockTimer;

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TimerClearedError = exports.Type = exports.Delayed = void 0;
	var Delayed_1 = Delayed$1;
	Object.defineProperty(exports, "Delayed", { enumerable: true, get: function () { return Delayed_1.Delayed; } });
	Object.defineProperty(exports, "Type", { enumerable: true, get: function () { return Delayed_1.Type; } });
	var TimerClearedError_1 = TimerClearedError$1;
	Object.defineProperty(exports, "TimerClearedError", { enumerable: true, get: function () { return TimerClearedError_1.TimerClearedError; } });
	const ClockTimer_1 = ClockTimer$1;
	exports.default = ClockTimer_1.ClockTimer; 
} (lib));

const Clock = /*@__PURE__*/getDefaultExportFromCjs(lib);

process.env.COLYSEUS_CLOUD ? String.raw`
   ______      __                              ________                __
  / ____/___  / /_  __________  __  _______   / ____/ /___  __  ______/ /
 / /   / __ \/ / / / / ___/ _ \/ / / / ___/  / /   / / __ \/ / / / __  /
/ /___/ /_/ / / /_/ (__  )  __/ /_/ (__  )  / /___/ / /_/ / /_/ / /_/ /
\____/\____/_/\__, /____/\___/\__,_/____/   \____/_/\____/\__,_/\__,_/
             /____/

🚀 Thank you for using Colyseus Cloud
❓ If you need help please reach out on support@colyseus.io
` : String.raw`
       ___      _
      / __\___ | |_   _ ___  ___ _   _ ___
     / /  / _ \| | | | / __|/ _ \ | | / __|
    / /__| (_) | | |_| \__ \  __/ |_| \__ \
    \____/\___/|_|\__, |___/\___|\__,_|___/
                  |___/

Multiplayer Framework for Node.js · Open-source

💖 Sponsor Colyseus on GitHub → https://github.com/sponsors/endel
🌟 Give it a star on GitHub → https://github.com/colyseus/colyseus
☁️  Deploy and scale your project on Colyseus Cloud → https://cloud.colyseus.io
`;

var src$1 = {exports: {}};

var browser = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var common;
var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = requireMs();
		createDebug.destroy = destroy;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}

					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});

			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			return debug;
		}

		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;

			createDebug.names = [];
			createDebug.skips = [];

			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;

			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}

				namespaces = split[i].replace(/\*/g, '.*?');

				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}
		}

		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names.map(toNamespace),
				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}

			let i;
			let len;

			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}

			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Convert regexp to namespace
		*
		* @param {RegExp} regxep
		* @return {String} namespace
		* @api private
		*/
		function toNamespace(regexp) {
			return regexp.toString()
				.substring(2, regexp.toString().length - 2)
				.replace(/\.\*\?$/, '*');
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	common = setup;
	return common;
}

/* eslint-env browser */

var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser.exports;
	hasRequiredBrowser = 1;
	(function (module, exports) {
		/**
		 * This is the web browser implementation of `debug()`.
		 */

		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = localstorage();
		exports.destroy = (() => {
			let warned = false;

			return () => {
				if (!warned) {
					warned = true;
					console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
				}
			};
		})();

		/**
		 * Colors.
		 */

		exports.colors = [
			'#0000CC',
			'#0000FF',
			'#0033CC',
			'#0033FF',
			'#0066CC',
			'#0066FF',
			'#0099CC',
			'#0099FF',
			'#00CC00',
			'#00CC33',
			'#00CC66',
			'#00CC99',
			'#00CCCC',
			'#00CCFF',
			'#3300CC',
			'#3300FF',
			'#3333CC',
			'#3333FF',
			'#3366CC',
			'#3366FF',
			'#3399CC',
			'#3399FF',
			'#33CC00',
			'#33CC33',
			'#33CC66',
			'#33CC99',
			'#33CCCC',
			'#33CCFF',
			'#6600CC',
			'#6600FF',
			'#6633CC',
			'#6633FF',
			'#66CC00',
			'#66CC33',
			'#9900CC',
			'#9900FF',
			'#9933CC',
			'#9933FF',
			'#99CC00',
			'#99CC33',
			'#CC0000',
			'#CC0033',
			'#CC0066',
			'#CC0099',
			'#CC00CC',
			'#CC00FF',
			'#CC3300',
			'#CC3333',
			'#CC3366',
			'#CC3399',
			'#CC33CC',
			'#CC33FF',
			'#CC6600',
			'#CC6633',
			'#CC9900',
			'#CC9933',
			'#CCCC00',
			'#CCCC33',
			'#FF0000',
			'#FF0033',
			'#FF0066',
			'#FF0099',
			'#FF00CC',
			'#FF00FF',
			'#FF3300',
			'#FF3333',
			'#FF3366',
			'#FF3399',
			'#FF33CC',
			'#FF33FF',
			'#FF6600',
			'#FF6633',
			'#FF9900',
			'#FF9933',
			'#FFCC00',
			'#FFCC33'
		];

		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */

		// eslint-disable-next-line complexity
		function useColors() {
			// NB: In an Electron preload script, document will be defined but not fully
			// initialized. Since we know we're in Chrome, we'll just detect this case
			// explicitly
			if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
				return true;
			}

			// Internet Explorer and Edge do not support colors.
			if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
				return false;
			}

			// Is webkit? http://stackoverflow.com/a/16459606/376773
			// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
			return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
				// Is firebug? http://stackoverflow.com/a/398120/376773
				(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
				// Is firefox >= v31?
				// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
				// Double check webkit in userAgent just in case we are in a worker
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
		}

		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			args[0] = (this.useColors ? '%c' : '') +
				this.namespace +
				(this.useColors ? ' %c' : ' ') +
				args[0] +
				(this.useColors ? '%c ' : ' ') +
				'+' + module.exports.humanize(this.diff);

			if (!this.useColors) {
				return;
			}

			const c = 'color: ' + this.color;
			args.splice(1, 0, c, 'color: inherit');

			// The final "%c" is somewhat tricky, because there could be other
			// arguments passed either before or after the %c, so we need to
			// figure out the correct index to insert the CSS into
			let index = 0;
			let lastC = 0;
			args[0].replace(/%[a-zA-Z%]/g, match => {
				if (match === '%%') {
					return;
				}
				index++;
				if (match === '%c') {
					// We only are interested in the *last* %c
					// (the user may have provided their own)
					lastC = index;
				}
			});

			args.splice(lastC, 0, c);
		}

		/**
		 * Invokes `console.debug()` when available.
		 * No-op when `console.debug` is not a "function".
		 * If `console.debug` is not available, falls back
		 * to `console.log`.
		 *
		 * @api public
		 */
		exports.log = console.debug || console.log || (() => {});

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			try {
				if (namespaces) {
					exports.storage.setItem('debug', namespaces);
				} else {
					exports.storage.removeItem('debug');
				}
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */
		function load() {
			let r;
			try {
				r = exports.storage.getItem('debug');
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}

			// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
			if (!r && typeof process !== 'undefined' && 'env' in process) {
				r = process.env.DEBUG;
			}

			return r;
		}

		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */

		function localstorage() {
			try {
				// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
				// The Browser also has localStorage in the global context.
				return localStorage;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		formatters.j = function (v) {
			try {
				return JSON.stringify(v);
			} catch (error) {
				return '[UnexpectedJSONParseError]: ' + error.message;
			}
		}; 
	} (browser, browser.exports));
	return browser.exports;
}

var node = {exports: {}};

var hasFlag;
var hasRequiredHasFlag;

function requireHasFlag () {
	if (hasRequiredHasFlag) return hasFlag;
	hasRequiredHasFlag = 1;

	hasFlag = (flag, argv = process.argv) => {
		const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
		const position = argv.indexOf(prefix + flag);
		const terminatorPosition = argv.indexOf('--');
		return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
	};
	return hasFlag;
}

var supportsColor_1;
var hasRequiredSupportsColor;

function requireSupportsColor () {
	if (hasRequiredSupportsColor) return supportsColor_1;
	hasRequiredSupportsColor = 1;
	const os = require$$0$1;
	const tty = require$$1$1;
	const hasFlag = requireHasFlag();

	const {env} = process;

	let forceColor;
	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false') ||
		hasFlag('color=never')) {
		forceColor = 0;
	} else if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		forceColor = 1;
	}

	if ('FORCE_COLOR' in env) {
		if (env.FORCE_COLOR === 'true') {
			forceColor = 1;
		} else if (env.FORCE_COLOR === 'false') {
			forceColor = 0;
		} else {
			forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
		}
	}

	function translateLevel(level) {
		if (level === 0) {
			return false;
		}

		return {
			level,
			hasBasic: true,
			has256: level >= 2,
			has16m: level >= 3
		};
	}

	function supportsColor(haveStream, streamIsTTY) {
		if (forceColor === 0) {
			return 0;
		}

		if (hasFlag('color=16m') ||
			hasFlag('color=full') ||
			hasFlag('color=truecolor')) {
			return 3;
		}

		if (hasFlag('color=256')) {
			return 2;
		}

		if (haveStream && !streamIsTTY && forceColor === undefined) {
			return 0;
		}

		const min = forceColor || 0;

		if (env.TERM === 'dumb') {
			return min;
		}

		if (process.platform === 'win32') {
			// Windows 10 build 10586 is the first Windows release that supports 256 colors.
			// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
			const osRelease = os.release().split('.');
			if (
				Number(osRelease[0]) >= 10 &&
				Number(osRelease[2]) >= 10586
			) {
				return Number(osRelease[2]) >= 14931 ? 3 : 2;
			}

			return 1;
		}

		if ('CI' in env) {
			if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
				return 1;
			}

			return min;
		}

		if ('TEAMCITY_VERSION' in env) {
			return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
		}

		if (env.COLORTERM === 'truecolor') {
			return 3;
		}

		if ('TERM_PROGRAM' in env) {
			const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

			switch (env.TERM_PROGRAM) {
				case 'iTerm.app':
					return version >= 3 ? 3 : 2;
				case 'Apple_Terminal':
					return 2;
				// No default
			}
		}

		if (/-256(color)?$/i.test(env.TERM)) {
			return 2;
		}

		if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
			return 1;
		}

		if ('COLORTERM' in env) {
			return 1;
		}

		return min;
	}

	function getSupportLevel(stream) {
		const level = supportsColor(stream, stream && stream.isTTY);
		return translateLevel(level);
	}

	supportsColor_1 = {
		supportsColor: getSupportLevel,
		stdout: translateLevel(supportsColor(true, tty.isatty(1))),
		stderr: translateLevel(supportsColor(true, tty.isatty(2)))
	};
	return supportsColor_1;
}

/**
 * Module dependencies.
 */

var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node.exports;
	hasRequiredNode = 1;
	(function (module, exports) {
		const tty = require$$1$1;
		const util = require$$1$2;

		/**
		 * This is the Node.js implementation of `debug()`.
		 */

		exports.init = init;
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.destroy = util.deprecate(
			() => {},
			'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
		);

		/**
		 * Colors.
		 */

		exports.colors = [6, 2, 3, 4, 5, 1];

		try {
			// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
			// eslint-disable-next-line import/no-extraneous-dependencies
			const supportsColor = requireSupportsColor();

			if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
				exports.colors = [
					20,
					21,
					26,
					27,
					32,
					33,
					38,
					39,
					40,
					41,
					42,
					43,
					44,
					45,
					56,
					57,
					62,
					63,
					68,
					69,
					74,
					75,
					76,
					77,
					78,
					79,
					80,
					81,
					92,
					93,
					98,
					99,
					112,
					113,
					128,
					129,
					134,
					135,
					148,
					149,
					160,
					161,
					162,
					163,
					164,
					165,
					166,
					167,
					168,
					169,
					170,
					171,
					172,
					173,
					178,
					179,
					184,
					185,
					196,
					197,
					198,
					199,
					200,
					201,
					202,
					203,
					204,
					205,
					206,
					207,
					208,
					209,
					214,
					215,
					220,
					221
				];
			}
		} catch (error) {
			// Swallow - we only care if `supports-color` is available; it doesn't have to be.
		}

		/**
		 * Build up the default `inspectOpts` object from the environment variables.
		 *
		 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
		 */

		exports.inspectOpts = Object.keys(process.env).filter(key => {
			return /^debug_/i.test(key);
		}).reduce((obj, key) => {
			// Camel-case
			const prop = key
				.substring(6)
				.toLowerCase()
				.replace(/_([a-z])/g, (_, k) => {
					return k.toUpperCase();
				});

			// Coerce string value into JS value
			let val = process.env[key];
			if (/^(yes|on|true|enabled)$/i.test(val)) {
				val = true;
			} else if (/^(no|off|false|disabled)$/i.test(val)) {
				val = false;
			} else if (val === 'null') {
				val = null;
			} else {
				val = Number(val);
			}

			obj[prop] = val;
			return obj;
		}, {});

		/**
		 * Is stdout a TTY? Colored output is enabled when `true`.
		 */

		function useColors() {
			return 'colors' in exports.inspectOpts ?
				Boolean(exports.inspectOpts.colors) :
				tty.isatty(process.stderr.fd);
		}

		/**
		 * Adds ANSI color escape codes if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			const {namespace: name, useColors} = this;

			if (useColors) {
				const c = this.color;
				const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
				const prefix = `  ${colorCode};1m${name} \u001B[0m`;

				args[0] = prefix + args[0].split('\n').join('\n' + prefix);
				args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
			} else {
				args[0] = getDate() + name + ' ' + args[0];
			}
		}

		function getDate() {
			if (exports.inspectOpts.hideDate) {
				return '';
			}
			return new Date().toISOString() + ' ';
		}

		/**
		 * Invokes `util.format()` with the specified arguments and writes to stderr.
		 */

		function log(...args) {
			return process.stderr.write(util.format(...args) + '\n');
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			if (namespaces) {
				process.env.DEBUG = namespaces;
			} else {
				// If you set a process.env field to null or undefined, it gets cast to the
				// string 'null' or 'undefined'. Just delete instead.
				delete process.env.DEBUG;
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
			return process.env.DEBUG;
		}

		/**
		 * Init logic for `debug` instances.
		 *
		 * Create a new `inspectOpts` object in case `useColors` is set
		 * differently for a particular `debug` instance.
		 */

		function init(debug) {
			debug.inspectOpts = {};

			const keys = Object.keys(exports.inspectOpts);
			for (let i = 0; i < keys.length; i++) {
				debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %o to `util.inspect()`, all on a single line.
		 */

		formatters.o = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts)
				.split('\n')
				.map(str => str.trim())
				.join(' ');
		};

		/**
		 * Map %O to `util.inspect()`, allowing multiple lines if needed.
		 */

		formatters.O = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts);
		}; 
	} (node, node.exports));
	return node.exports;
}

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	src$1.exports = requireBrowser();
} else {
	src$1.exports = requireNode();
}

var srcExports = src$1.exports;
const debug = /*@__PURE__*/getDefaultExportFromCjs(srcExports);

let logger = console;

var decoder;
try {
	decoder = new TextDecoder();
} catch(error) {}
var src;
var srcEnd;
var position$1 = 0;
const EMPTY_ARRAY = [];
var strings = EMPTY_ARRAY;
var stringPosition = 0;
var currentUnpackr = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings$1;
var referenceMap;
var currentExtensions = [];
var dataView;
var defaultOptions = {
	useRecords: false,
	mapsAsObjects: true
};
class C1Type {}
const C1 = new C1Type();
C1.name = 'MessagePack 0xC1';
var sequentialMode = false;
var inlineObjectReadThreshold = 2;
var readStruct$1, onLoadedStructures$1, onSaveState;
// no-eval build
try {
	new Function('');
} catch(error) {
	// if eval variants are not supported, do not create inline object readers ever
	inlineObjectReadThreshold = Infinity;
}

class Unpackr {
	constructor(options) {
		if (options) {
			if (options.useRecords === false && options.mapsAsObjects === undefined)
				options.mapsAsObjects = true;
			if (options.sequential && options.trusted !== false) {
				options.trusted = true;
				if (!options.structures && options.useRecords != false) {
					options.structures = [];
					if (!options.maxSharedStructures)
						options.maxSharedStructures = 0;
				}
			}
			if (options.structures)
				options.structures.sharedLength = options.structures.length;
			else if (options.getStructures) {
				(options.structures = []).uninitialized = true; // this is what we use to denote an uninitialized structures
				options.structures.sharedLength = 0;
			}
			if (options.int64AsNumber) {
				options.int64AsType = 'number';
			}
		}
		Object.assign(this, options);
	}
	unpack(source, options) {
		if (src) {
			// re-entrant execution, save the state and restore it after we do this unpack
			return saveState$1(() => {
				clearSource();
				return this ? this.unpack(source, options) : Unpackr.prototype.unpack.call(defaultOptions, source, options)
			})
		}
		if (!source.buffer && source.constructor === ArrayBuffer)
			source = typeof Buffer !== 'undefined' ? Buffer.from(source) : new Uint8Array(source);
		if (typeof options === 'object') {
			srcEnd = options.end || source.length;
			position$1 = options.start || 0;
		} else {
			position$1 = 0;
			srcEnd = options > -1 ? options : source.length;
		}
		stringPosition = 0;
		srcStringEnd = 0;
		srcString = null;
		strings = EMPTY_ARRAY;
		bundledStrings$1 = null;
		src = source;
		// this provides cached access to the data view for a buffer if it is getting reused, which is a recommend
		// technique for getting data from a database where it can be copied into an existing buffer instead of creating
		// new ones
		try {
			dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
		} catch(error) {
			// if it doesn't have a buffer, maybe it is the wrong type of object
			src = null;
			if (source instanceof Uint8Array)
				throw error
			throw new Error('Source must be a Uint8Array or Buffer but was a ' + ((source && typeof source == 'object') ? source.constructor.name : typeof source))
		}
		if (this instanceof Unpackr) {
			currentUnpackr = this;
			if (this.structures) {
				currentStructures = this.structures;
				return checkedRead(options)
			} else if (!currentStructures || currentStructures.length > 0) {
				currentStructures = [];
			}
		} else {
			currentUnpackr = defaultOptions;
			if (!currentStructures || currentStructures.length > 0)
				currentStructures = [];
		}
		return checkedRead(options)
	}
	unpackMultiple(source, forEach) {
		let values, lastPosition = 0;
		try {
			sequentialMode = true;
			let size = source.length;
			let value = this ? this.unpack(source, size) : defaultUnpackr.unpack(source, size);
			if (forEach) {
				if (forEach(value, lastPosition, position$1) === false) return;
				while(position$1 < size) {
					lastPosition = position$1;
					if (forEach(checkedRead(), lastPosition, position$1) === false) {
						return
					}
				}
			}
			else {
				values = [ value ];
				while(position$1 < size) {
					lastPosition = position$1;
					values.push(checkedRead());
				}
				return values
			}
		} catch(error) {
			error.lastPosition = lastPosition;
			error.values = values;
			throw error
		} finally {
			sequentialMode = false;
			clearSource();
		}
	}
	_mergeStructures(loadedStructures, existingStructures) {
		if (onLoadedStructures$1)
			loadedStructures = onLoadedStructures$1.call(this, loadedStructures);
		loadedStructures = loadedStructures || [];
		if (Object.isFrozen(loadedStructures))
			loadedStructures = loadedStructures.map(structure => structure.slice(0));
		for (let i = 0, l = loadedStructures.length; i < l; i++) {
			let structure = loadedStructures[i];
			if (structure) {
				structure.isShared = true;
				if (i >= 32)
					structure.highByte = (i - 32) >> 5;
			}
		}
		loadedStructures.sharedLength = loadedStructures.length;
		for (let id in existingStructures || []) {
			if (id >= 0) {
				let structure = loadedStructures[id];
				let existing = existingStructures[id];
				if (existing) {
					if (structure)
						(loadedStructures.restoreStructures || (loadedStructures.restoreStructures = []))[id] = structure;
					loadedStructures[id] = existing;
				}
			}
		}
		return this.structures = loadedStructures
	}
	decode(source, options) {
		return this.unpack(source, options)
	}
}
function checkedRead(options) {
	try {
		if (!currentUnpackr.trusted && !sequentialMode) {
			let sharedLength = currentStructures.sharedLength || 0;
			if (sharedLength < currentStructures.length)
				currentStructures.length = sharedLength;
		}
		let result;
		if (currentUnpackr.randomAccessStructure && src[position$1] < 0x40 && src[position$1] >= 0x20 && readStruct$1) {
			result = readStruct$1(src, position$1, srcEnd, currentUnpackr);
			src = null; // dispose of this so that recursive unpack calls don't save state
			if (!(options && options.lazy) && result)
				result = result.toJSON();
			position$1 = srcEnd;
		} else
			result = read();
		if (bundledStrings$1) { // bundled strings to skip past
			position$1 = bundledStrings$1.postBundlePosition;
			bundledStrings$1 = null;
		}
		if (sequentialMode)
			// we only need to restore the structures if there was an error, but if we completed a read,
			// we can clear this out and keep the structures we read
			currentStructures.restoreStructures = null;

		if (position$1 == srcEnd) {
			// finished reading this source, cleanup references
			if (currentStructures && currentStructures.restoreStructures)
				restoreStructures();
			currentStructures = null;
			src = null;
			if (referenceMap)
				referenceMap = null;
		} else if (position$1 > srcEnd) {
			// over read
			throw new Error('Unexpected end of MessagePack data')
		} else if (!sequentialMode) {
			let jsonView;
			try {
				jsonView = JSON.stringify(result, (_, value) => typeof value === "bigint" ? `${value}n` : value).slice(0, 100);
			} catch(error) {
				jsonView = '(JSON view not available ' + error + ')';
			}
			throw new Error('Data read, but end of buffer not reached ' + jsonView)
		}
		// else more to read, but we are reading sequentially, so don't clear source yet
		return result
	} catch(error) {
		if (currentStructures && currentStructures.restoreStructures)
			restoreStructures();
		clearSource();
		if (error instanceof RangeError || error.message.startsWith('Unexpected end of buffer') || position$1 > srcEnd) {
			error.incomplete = true;
		}
		throw error
	}
}

function restoreStructures() {
	for (let id in currentStructures.restoreStructures) {
		currentStructures[id] = currentStructures.restoreStructures[id];
	}
	currentStructures.restoreStructures = null;
}

function read() {
	let token = src[position$1++];
	if (token < 0xa0) {
		if (token < 0x80) {
			if (token < 0x40)
				return token
			else {
				let structure = currentStructures[token & 0x3f] ||
					currentUnpackr.getStructures && loadStructures()[token & 0x3f];
				if (structure) {
					if (!structure.read) {
						structure.read = createStructureReader(structure, token & 0x3f);
					}
					return structure.read()
				} else
					return token
			}
		} else if (token < 0x90) {
			// map
			token -= 0x80;
			if (currentUnpackr.mapsAsObjects) {
				let object = {};
				for (let i = 0; i < token; i++) {
					let key = readKey();
					if (key === '__proto__')
						key = '__proto_';
					object[key] = read();
				}
				return object
			} else {
				let map = new Map();
				for (let i = 0; i < token; i++) {
					map.set(read(), read());
				}
				return map
			}
		} else {
			token -= 0x90;
			let array = new Array(token);
			for (let i = 0; i < token; i++) {
				array[i] = read();
			}
			if (currentUnpackr.freezeData)
				return Object.freeze(array)
			return array
		}
	} else if (token < 0xc0) {
		// fixstr
		let length = token - 0xa0;
		if (srcStringEnd >= position$1) {
			return srcString.slice(position$1 - srcStringStart, (position$1 += length) - srcStringStart)
		}
		if (srcStringEnd == 0 && srcEnd < 140) {
			// for small blocks, avoiding the overhead of the extract call is helpful
			let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
			if (string != null)
				return string
		}
		return readFixedString(length)
	} else {
		let value;
		switch (token) {
			case 0xc0: return null
			case 0xc1:
				if (bundledStrings$1) {
					value = read(); // followed by the length of the string in characters (not bytes!)
					if (value > 0)
						return bundledStrings$1[1].slice(bundledStrings$1.position1, bundledStrings$1.position1 += value)
					else
						return bundledStrings$1[0].slice(bundledStrings$1.position0, bundledStrings$1.position0 -= value)
				}
				return C1; // "never-used", return special object to denote that
			case 0xc2: return false
			case 0xc3: return true
			case 0xc4:
				// bin 8
				value = src[position$1++];
				if (value === undefined)
					throw new Error('Unexpected end of buffer')
				return readBin(value)
			case 0xc5:
				// bin 16
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readBin(value)
			case 0xc6:
				// bin 32
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readBin(value)
			case 0xc7:
				// ext 8
				return readExt(src[position$1++])
			case 0xc8:
				// ext 16
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readExt(value)
			case 0xc9:
				// ext 32
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readExt(value)
			case 0xca:
				value = dataView.getFloat32(position$1);
				if (currentUnpackr.useFloat32 > 2) {
					// this does rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
					let multiplier = mult10[((src[position$1] & 0x7f) << 1) | (src[position$1 + 1] >> 7)];
					position$1 += 4;
					return ((multiplier * value + (value > 0 ? 0.5 : -0.5)) >> 0) / multiplier
				}
				position$1 += 4;
				return value
			case 0xcb:
				value = dataView.getFloat64(position$1);
				position$1 += 8;
				return value
			// uint handlers
			case 0xcc:
				return src[position$1++]
			case 0xcd:
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return value
			case 0xce:
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return value
			case 0xcf:
				if (currentUnpackr.int64AsType === 'number') {
					value = dataView.getUint32(position$1) * 0x100000000;
					value += dataView.getUint32(position$1 + 4);
				} else if (currentUnpackr.int64AsType === 'string') {
					value = dataView.getBigUint64(position$1).toString();
				} else if (currentUnpackr.int64AsType === 'auto') {
					value = dataView.getBigUint64(position$1);
					if (value<=BigInt(2)<<BigInt(52)) value=Number(value);
				} else
					value = dataView.getBigUint64(position$1);
				position$1 += 8;
				return value

			// int handlers
			case 0xd0:
				return dataView.getInt8(position$1++)
			case 0xd1:
				value = dataView.getInt16(position$1);
				position$1 += 2;
				return value
			case 0xd2:
				value = dataView.getInt32(position$1);
				position$1 += 4;
				return value
			case 0xd3:
				if (currentUnpackr.int64AsType === 'number') {
					value = dataView.getInt32(position$1) * 0x100000000;
					value += dataView.getUint32(position$1 + 4);
				} else if (currentUnpackr.int64AsType === 'string') {
					value = dataView.getBigInt64(position$1).toString();
				} else if (currentUnpackr.int64AsType === 'auto') {
					value = dataView.getBigInt64(position$1);
					if (value>=BigInt(-2)<<BigInt(52)&&value<=BigInt(2)<<BigInt(52)) value=Number(value);
				} else
					value = dataView.getBigInt64(position$1);
				position$1 += 8;
				return value

			case 0xd4:
				// fixext 1
				value = src[position$1++];
				if (value == 0x72) {
					return recordDefinition(src[position$1++] & 0x3f)
				} else {
					let extension = currentExtensions[value];
					if (extension) {
						if (extension.read) {
							position$1++; // skip filler byte
							return extension.read(read())
						} else if (extension.noBuffer) {
							position$1++; // skip filler byte
							return extension()
						} else
							return extension(src.subarray(position$1, ++position$1))
					} else
						throw new Error('Unknown extension ' + value)
				}
			case 0xd5:
				// fixext 2
				value = src[position$1];
				if (value == 0x72) {
					position$1++;
					return recordDefinition(src[position$1++] & 0x3f, src[position$1++])
				} else
					return readExt(2)
			case 0xd6:
				// fixext 4
				return readExt(4)
			case 0xd7:
				// fixext 8
				return readExt(8)
			case 0xd8:
				// fixext 16
				return readExt(16)
			case 0xd9:
			// str 8
				value = src[position$1++];
				if (srcStringEnd >= position$1) {
					return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart)
				}
				return readString8(value)
			case 0xda:
			// str 16
				value = dataView.getUint16(position$1);
				position$1 += 2;
				if (srcStringEnd >= position$1) {
					return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart)
				}
				return readString16(value)
			case 0xdb:
			// str 32
				value = dataView.getUint32(position$1);
				position$1 += 4;
				if (srcStringEnd >= position$1) {
					return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart)
				}
				return readString32(value)
			case 0xdc:
			// array 16
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readArray(value)
			case 0xdd:
			// array 32
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readArray(value)
			case 0xde:
			// map 16
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readMap(value)
			case 0xdf:
			// map 32
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readMap(value)
			default: // negative int
				if (token >= 0xe0)
					return token - 0x100
				if (token === undefined) {
					let error = new Error('Unexpected end of MessagePack data');
					error.incomplete = true;
					throw error
				}
				throw new Error('Unknown MessagePack token ' + token)

		}
	}
}
const validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
function createStructureReader(structure, firstId) {
	function readObject() {
		// This initial function is quick to instantiate, but runs slower. After several iterations pay the cost to build the faster function
		if (readObject.count++ > inlineObjectReadThreshold) {
			let readObject = structure.read = (new Function('r', 'return function(){return ' + (currentUnpackr.freezeData ? 'Object.freeze' : '') +
				'({' + structure.map(key => key === '__proto__' ? '__proto_:r()' : validName.test(key) ? key + ':r()' : ('[' + JSON.stringify(key) + ']:r()')).join(',') + '})}'))(read);
			if (structure.highByte === 0)
				structure.read = createSecondByteReader(firstId, structure.read);
			return readObject() // second byte is already read, if there is one so immediately read object
		}
		let object = {};
		for (let i = 0, l = structure.length; i < l; i++) {
			let key = structure[i];
			if (key === '__proto__')
				key = '__proto_';
			object[key] = read();
		}
		if (currentUnpackr.freezeData)
			return Object.freeze(object);
		return object
	}
	readObject.count = 0;
	if (structure.highByte === 0) {
		return createSecondByteReader(firstId, readObject)
	}
	return readObject
}

const createSecondByteReader = (firstId, read0) => {
	return function() {
		let highByte = src[position$1++];
		if (highByte === 0)
			return read0()
		let id = firstId < 32 ? -(firstId + (highByte << 5)) : firstId + (highByte << 5);
		let structure = currentStructures[id] || loadStructures()[id];
		if (!structure) {
			throw new Error('Record id is not defined for ' + id)
		}
		if (!structure.read)
			structure.read = createStructureReader(structure, firstId);
		return structure.read()
	}
};

function loadStructures() {
	let loadedStructures = saveState$1(() => {
		// save the state in case getStructures modifies our buffer
		src = null;
		return currentUnpackr.getStructures()
	});
	return currentStructures = currentUnpackr._mergeStructures(loadedStructures, currentStructures)
}

var readFixedString = readStringJS;
var readString8 = readStringJS;
var readString16 = readStringJS;
var readString32 = readStringJS;

function setExtractor(extractStrings) {
	readFixedString = readString(1);
	readString8 = readString(2);
	readString16 = readString(3);
	readString32 = readString(5);
	function readString(headerLength) {
		return function readString(length) {
			let string = strings[stringPosition++];
			if (string == null) {
				if (bundledStrings$1)
					return readStringJS(length)
				let byteOffset = src.byteOffset;
				let extraction = extractStrings(position$1 - headerLength + byteOffset, srcEnd + byteOffset, src.buffer);
				if (typeof extraction == 'string') {
					string = extraction;
					strings = EMPTY_ARRAY;
				} else {
					strings = extraction;
					stringPosition = 1;
					srcStringEnd = 1; // even if a utf-8 string was decoded, must indicate we are in the midst of extracted strings and can't skip strings
					string = strings[0];
					if (string === undefined)
						throw new Error('Unexpected end of buffer')
				}
			}
			let srcStringLength = string.length;
			if (srcStringLength <= length) {
				position$1 += length;
				return string
			}
			srcString = string;
			srcStringStart = position$1;
			srcStringEnd = position$1 + srcStringLength;
			position$1 += length;
			return string.slice(0, length) // we know we just want the beginning
		}
	}
}
function readStringJS(length) {
	let result;
	if (length < 16) {
		if (result = shortStringInJS(length))
			return result
	}
	if (length > 64 && decoder)
		return decoder.decode(src.subarray(position$1, position$1 += length))
	const end = position$1 + length;
	const units = [];
	result = '';
	while (position$1 < end) {
		const byte1 = src[position$1++];
		if ((byte1 & 0x80) === 0) {
			// 1 byte
			units.push(byte1);
		} else if ((byte1 & 0xe0) === 0xc0) {
			// 2 bytes
			const byte2 = src[position$1++] & 0x3f;
			units.push(((byte1 & 0x1f) << 6) | byte2);
		} else if ((byte1 & 0xf0) === 0xe0) {
			// 3 bytes
			const byte2 = src[position$1++] & 0x3f;
			const byte3 = src[position$1++] & 0x3f;
			units.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);
		} else if ((byte1 & 0xf8) === 0xf0) {
			// 4 bytes
			const byte2 = src[position$1++] & 0x3f;
			const byte3 = src[position$1++] & 0x3f;
			const byte4 = src[position$1++] & 0x3f;
			let unit = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
			if (unit > 0xffff) {
				unit -= 0x10000;
				units.push(((unit >>> 10) & 0x3ff) | 0xd800);
				unit = 0xdc00 | (unit & 0x3ff);
			}
			units.push(unit);
		} else {
			units.push(byte1);
		}

		if (units.length >= 0x1000) {
			result += fromCharCode.apply(String, units);
			units.length = 0;
		}
	}

	if (units.length > 0) {
		result += fromCharCode.apply(String, units);
	}

	return result
}
function readString(source, start, length) {
	let existingSrc = src;
	src = source;
	position$1 = start;
	try {
		return readStringJS(length);
	} finally {
		src = existingSrc;
	}
}

function readArray(length) {
	let array = new Array(length);
	for (let i = 0; i < length; i++) {
		array[i] = read();
	}
	if (currentUnpackr.freezeData)
		return Object.freeze(array)
	return array
}

function readMap(length) {
	if (currentUnpackr.mapsAsObjects) {
		let object = {};
		for (let i = 0; i < length; i++) {
			let key = readKey();
			if (key === '__proto__')
				key = '__proto_';
			object[key] = read();
		}
		return object
	} else {
		let map = new Map();
		for (let i = 0; i < length; i++) {
			map.set(read(), read());
		}
		return map
	}
}

var fromCharCode = String.fromCharCode;
function longStringInJS(length) {
	let start = position$1;
	let bytes = new Array(length);
	for (let i = 0; i < length; i++) {
		const byte = src[position$1++];
		if ((byte & 0x80) > 0) {
				position$1 = start;
				return
			}
			bytes[i] = byte;
		}
		return fromCharCode.apply(String, bytes)
}
function shortStringInJS(length) {
	if (length < 4) {
		if (length < 2) {
			if (length === 0)
				return ''
			else {
				let a = src[position$1++];
				if ((a & 0x80) > 1) {
					position$1 -= 1;
					return
				}
				return fromCharCode(a)
			}
		} else {
			let a = src[position$1++];
			let b = src[position$1++];
			if ((a & 0x80) > 0 || (b & 0x80) > 0) {
				position$1 -= 2;
				return
			}
			if (length < 3)
				return fromCharCode(a, b)
			let c = src[position$1++];
			if ((c & 0x80) > 0) {
				position$1 -= 3;
				return
			}
			return fromCharCode(a, b, c)
		}
	} else {
		let a = src[position$1++];
		let b = src[position$1++];
		let c = src[position$1++];
		let d = src[position$1++];
		if ((a & 0x80) > 0 || (b & 0x80) > 0 || (c & 0x80) > 0 || (d & 0x80) > 0) {
			position$1 -= 4;
			return
		}
		if (length < 6) {
			if (length === 4)
				return fromCharCode(a, b, c, d)
			else {
				let e = src[position$1++];
				if ((e & 0x80) > 0) {
					position$1 -= 5;
					return
				}
				return fromCharCode(a, b, c, d, e)
			}
		} else if (length < 8) {
			let e = src[position$1++];
			let f = src[position$1++];
			if ((e & 0x80) > 0 || (f & 0x80) > 0) {
				position$1 -= 6;
				return
			}
			if (length < 7)
				return fromCharCode(a, b, c, d, e, f)
			let g = src[position$1++];
			if ((g & 0x80) > 0) {
				position$1 -= 7;
				return
			}
			return fromCharCode(a, b, c, d, e, f, g)
		} else {
			let e = src[position$1++];
			let f = src[position$1++];
			let g = src[position$1++];
			let h = src[position$1++];
			if ((e & 0x80) > 0 || (f & 0x80) > 0 || (g & 0x80) > 0 || (h & 0x80) > 0) {
				position$1 -= 8;
				return
			}
			if (length < 10) {
				if (length === 8)
					return fromCharCode(a, b, c, d, e, f, g, h)
				else {
					let i = src[position$1++];
					if ((i & 0x80) > 0) {
						position$1 -= 9;
						return
					}
					return fromCharCode(a, b, c, d, e, f, g, h, i)
				}
			} else if (length < 12) {
				let i = src[position$1++];
				let j = src[position$1++];
				if ((i & 0x80) > 0 || (j & 0x80) > 0) {
					position$1 -= 10;
					return
				}
				if (length < 11)
					return fromCharCode(a, b, c, d, e, f, g, h, i, j)
				let k = src[position$1++];
				if ((k & 0x80) > 0) {
					position$1 -= 11;
					return
				}
				return fromCharCode(a, b, c, d, e, f, g, h, i, j, k)
			} else {
				let i = src[position$1++];
				let j = src[position$1++];
				let k = src[position$1++];
				let l = src[position$1++];
				if ((i & 0x80) > 0 || (j & 0x80) > 0 || (k & 0x80) > 0 || (l & 0x80) > 0) {
					position$1 -= 12;
					return
				}
				if (length < 14) {
					if (length === 12)
						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l)
					else {
						let m = src[position$1++];
						if ((m & 0x80) > 0) {
							position$1 -= 13;
							return
						}
						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m)
					}
				} else {
					let m = src[position$1++];
					let n = src[position$1++];
					if ((m & 0x80) > 0 || (n & 0x80) > 0) {
						position$1 -= 14;
						return
					}
					if (length < 15)
						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n)
					let o = src[position$1++];
					if ((o & 0x80) > 0) {
						position$1 -= 15;
						return
					}
					return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
				}
			}
		}
	}
}

function readOnlyJSString() {
	let token = src[position$1++];
	let length;
	if (token < 0xc0) {
		// fixstr
		length = token - 0xa0;
	} else {
		switch(token) {
			case 0xd9:
			// str 8
				length = src[position$1++];
				break
			case 0xda:
			// str 16
				length = dataView.getUint16(position$1);
				position$1 += 2;
				break
			case 0xdb:
			// str 32
				length = dataView.getUint32(position$1);
				position$1 += 4;
				break
			default:
				throw new Error('Expected string')
		}
	}
	return readStringJS(length)
}


function readBin(length) {
	return currentUnpackr.copyBuffers ?
		// specifically use the copying slice (not the node one)
		Uint8Array.prototype.slice.call(src, position$1, position$1 += length) :
		src.subarray(position$1, position$1 += length)
}
function readExt(length) {
	let type = src[position$1++];
	if (currentExtensions[type]) {
		let end;
		return currentExtensions[type](src.subarray(position$1, end = (position$1 += length)), (readPosition) => {
			position$1 = readPosition;
			try {
				return read();
			} finally {
				position$1 = end;
			}
		})
	}
	else
		throw new Error('Unknown extension type ' + type)
}

var keyCache = new Array(4096);
function readKey() {
	let length = src[position$1++];
	if (length >= 0xa0 && length < 0xc0) {
		// fixstr, potentially use key cache
		length = length - 0xa0;
		if (srcStringEnd >= position$1) // if it has been extracted, must use it (and faster anyway)
			return srcString.slice(position$1 - srcStringStart, (position$1 += length) - srcStringStart)
		else if (!(srcStringEnd == 0 && srcEnd < 180))
			return readFixedString(length)
	} else { // not cacheable, go back and do a standard read
		position$1--;
		return asSafeString(read())
	}
	let key = ((length << 5) ^ (length > 1 ? dataView.getUint16(position$1) : length > 0 ? src[position$1] : 0)) & 0xfff;
	let entry = keyCache[key];
	let checkPosition = position$1;
	let end = position$1 + length - 3;
	let chunk;
	let i = 0;
	if (entry && entry.bytes == length) {
		while (checkPosition < end) {
			chunk = dataView.getUint32(checkPosition);
			if (chunk != entry[i++]) {
				checkPosition = 0x70000000;
				break
			}
			checkPosition += 4;
		}
		end += 3;
		while (checkPosition < end) {
			chunk = src[checkPosition++];
			if (chunk != entry[i++]) {
				checkPosition = 0x70000000;
				break
			}
		}
		if (checkPosition === end) {
			position$1 = checkPosition;
			return entry.string
		}
		end -= 3;
		checkPosition = position$1;
	}
	entry = [];
	keyCache[key] = entry;
	entry.bytes = length;
	while (checkPosition < end) {
		chunk = dataView.getUint32(checkPosition);
		entry.push(chunk);
		checkPosition += 4;
	}
	end += 3;
	while (checkPosition < end) {
		chunk = src[checkPosition++];
		entry.push(chunk);
	}
	// for small blocks, avoiding the overhead of the extract call is helpful
	let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
	if (string != null)
		return entry.string = string
	return entry.string = readFixedString(length)
}

function asSafeString(property) {
	if (typeof property === 'string') return property;
	if (typeof property === 'number') return property.toString();
	throw new Error('Invalid property type for record', typeof property);
}
// the registration of the record definition extension (as "r")
const recordDefinition = (id, highByte) => {
	let structure = read().map(asSafeString); // ensure that all keys are strings and
	// that the array is mutable
	let firstByte = id;
	if (highByte !== undefined) {
		id = id < 32 ? -((highByte << 5) + id) : ((highByte << 5) + id);
		structure.highByte = highByte;
	}
	let existingStructure = currentStructures[id];
	// If it is a shared structure, we need to restore any changes after reading.
	// Also in sequential mode, we may get incomplete reads and thus errors, and we need to restore
	// to the state prior to an incomplete read in order to properly resume.
	if (existingStructure && (existingStructure.isShared || sequentialMode)) {
		(currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
	}
	currentStructures[id] = structure;
	structure.read = createStructureReader(structure, firstByte);
	return structure.read()
};
currentExtensions[0] = () => {}; // notepack defines extension 0 to mean undefined, so use that as the default here
currentExtensions[0].noBuffer = true;

currentExtensions[0x42] = (data) => {
	// decode bigint
	let length = data.length;
	let value = BigInt(data[0] & 0x80 ? data[0] - 0x100 : data[0]);
	for (let i = 1; i < length; i++) {
		value <<= 8n;
		value += BigInt(data[i]);
	}
	return value;
};

let errors = { Error, TypeError, ReferenceError };
currentExtensions[0x65] = () => {
	let data = read();
	return (errors[data[0]] || Error)(data[1])
};

currentExtensions[0x69] = (data) => {
	// id extension (for structured clones)
	if (currentUnpackr.structuredClone === false) throw new Error('Structured clone extension is disabled')
	let id = dataView.getUint32(position$1 - 4);
	if (!referenceMap)
		referenceMap = new Map();
	let token = src[position$1];
	let target;
	// TODO: handle Maps, Sets, and other types that can cycle; this is complicated, because you potentially need to read
	// ahead past references to record structure definitions
	if (token >= 0x90 && token < 0xa0 || token == 0xdc || token == 0xdd)
		target = [];
	else
		target = {};

	let refEntry = { target }; // a placeholder object
	referenceMap.set(id, refEntry);
	let targetProperties = read(); // read the next value as the target object to id
	if (refEntry.used) // there is a cycle, so we have to assign properties to original target
		return Object.assign(target, targetProperties)
	refEntry.target = targetProperties; // the placeholder wasn't used, replace with the deserialized one
	return targetProperties // no cycle, can just use the returned read object
};

currentExtensions[0x70] = (data) => {
	// pointer extension (for structured clones)
	if (currentUnpackr.structuredClone === false) throw new Error('Structured clone extension is disabled')
	let id = dataView.getUint32(position$1 - 4);
	let refEntry = referenceMap.get(id);
	refEntry.used = true;
	return refEntry.target
};

currentExtensions[0x73] = () => new Set(read());

const typedArrays = ['Int8','Uint8','Uint8Clamped','Int16','Uint16','Int32','Uint32','Float32','Float64','BigInt64','BigUint64'].map(type => type + 'Array');

let glbl = typeof globalThis === 'object' ? globalThis : window;
currentExtensions[0x74] = (data) => {
	let typeCode = data[0];
	let typedArrayName = typedArrays[typeCode];
	if (!typedArrayName)
		throw new Error('Could not find typed array for code ' + typeCode)
	// we have to always slice/copy here to get a new ArrayBuffer that is word/byte aligned
	return new glbl[typedArrayName](Uint8Array.prototype.slice.call(data, 1).buffer)
};
currentExtensions[0x78] = () => {
	let data = read();
	return new RegExp(data[0], data[1])
};
const TEMP_BUNDLE = [];
currentExtensions[0x62] = (data) => {
	let dataSize = (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
	let dataPosition = position$1;
	position$1 += dataSize - data.length;
	bundledStrings$1 = TEMP_BUNDLE;
	bundledStrings$1 = [readOnlyJSString(), readOnlyJSString()];
	bundledStrings$1.position0 = 0;
	bundledStrings$1.position1 = 0;
	bundledStrings$1.postBundlePosition = position$1;
	position$1 = dataPosition;
	return read()
};

currentExtensions[0xff] = (data) => {
	// 32-bit date extension
	if (data.length == 4)
		return new Date((data[0] * 0x1000000 + (data[1] << 16) + (data[2] << 8) + data[3]) * 1000)
	else if (data.length == 8)
		return new Date(
			((data[0] << 22) + (data[1] << 14) + (data[2] << 6) + (data[3] >> 2)) / 1000000 +
			((data[3] & 0x3) * 0x100000000 + data[4] * 0x1000000 + (data[5] << 16) + (data[6] << 8) + data[7]) * 1000)
	else if (data.length == 12)// TODO: Implement support for negative
		return new Date(
			((data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3]) / 1000000 +
			(((data[4] & 0x80) ? -0x1000000000000 : 0) + data[6] * 0x10000000000 + data[7] * 0x100000000 + data[8] * 0x1000000 + (data[9] << 16) + (data[10] << 8) + data[11]) * 1000)
	else
		return new Date('invalid')
}; // notepack defines extension 0 to mean undefined, so use that as the default here
// registration of bulk record definition?
// currentExtensions[0x52] = () =>

function saveState$1(callback) {
	if (onSaveState)
		onSaveState();
	let savedSrcEnd = srcEnd;
	let savedPosition = position$1;
	let savedStringPosition = stringPosition;
	let savedSrcStringStart = srcStringStart;
	let savedSrcStringEnd = srcStringEnd;
	let savedSrcString = srcString;
	let savedStrings = strings;
	let savedReferenceMap = referenceMap;
	let savedBundledStrings = bundledStrings$1;

	// TODO: We may need to revisit this if we do more external calls to user code (since it could be slow)
	let savedSrc = new Uint8Array(src.slice(0, srcEnd)); // we copy the data in case it changes while external data is processed
	let savedStructures = currentStructures;
	let savedStructuresContents = currentStructures.slice(0, currentStructures.length);
	let savedPackr = currentUnpackr;
	let savedSequentialMode = sequentialMode;
	let value = callback();
	srcEnd = savedSrcEnd;
	position$1 = savedPosition;
	stringPosition = savedStringPosition;
	srcStringStart = savedSrcStringStart;
	srcStringEnd = savedSrcStringEnd;
	srcString = savedSrcString;
	strings = savedStrings;
	referenceMap = savedReferenceMap;
	bundledStrings$1 = savedBundledStrings;
	src = savedSrc;
	sequentialMode = savedSequentialMode;
	currentStructures = savedStructures;
	currentStructures.splice(0, currentStructures.length, ...savedStructuresContents);
	currentUnpackr = savedPackr;
	dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
	return value
}
function clearSource() {
	src = null;
	referenceMap = null;
	currentStructures = null;
}

function addExtension$1(extension) {
	if (extension.unpack)
		currentExtensions[extension.type] = extension.unpack;
	else
		currentExtensions[extension.type] = extension;
}

const mult10 = new Array(147); // this is a table matching binary exponents to the multiplier to determine significant digit rounding
for (let i = 0; i < 256; i++) {
	mult10[i] = +('1e' + Math.floor(45.15 - i * 0.30103));
}
var defaultUnpackr = new Unpackr({ useRecords: false });
const unpack = defaultUnpackr.unpack;
defaultUnpackr.unpackMultiple;
defaultUnpackr.unpack;
let f32Array = new Float32Array(1);
new Uint8Array(f32Array.buffer, 0, 4);
function setReadStruct(updatedReadStruct, loadedStructs, saveState) {
	readStruct$1 = updatedReadStruct;
	onLoadedStructures$1 = loadedStructs;
	onSaveState = saveState;
}

let textEncoder$1;
try {
	textEncoder$1 = new TextEncoder();
} catch (error) {}
let extensions, extensionClasses;
const hasNodeBuffer$1 = typeof Buffer !== 'undefined';
const ByteArrayAllocate = hasNodeBuffer$1 ?
	function(length) { return Buffer.allocUnsafeSlow(length) } : Uint8Array;
const ByteArray = hasNodeBuffer$1 ? Buffer : Uint8Array;
const MAX_BUFFER_SIZE = hasNodeBuffer$1 ? 0x100000000 : 0x7fd00000;
let target, keysTarget;
let targetView;
let position = 0;
let safeEnd;
let bundledStrings = null;
let writeStructSlots;
const MAX_BUNDLE_SIZE = 0x5500; // maximum characters such that the encoded bytes fits in 16 bits.
const hasNonLatin = /[\u0080-\uFFFF]/;
const RECORD_SYMBOL = Symbol('record-id');
class Packr extends Unpackr {
	constructor(options) {
		super(options);
		this.offset = 0;
		let start;
		let hasSharedUpdate;
		let structures;
		let referenceMap;
		let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position) {
			return target.utf8Write(string, position, 0xffffffff)
		} : (textEncoder$1 && textEncoder$1.encodeInto) ?
			function(string, position) {
				return textEncoder$1.encodeInto(string, target.subarray(position)).written
			} : false;

		let packr = this;
		if (!options)
			options = {};
		let isSequential = options && options.sequential;
		let hasSharedStructures = options.structures || options.saveStructures;
		let maxSharedStructures = options.maxSharedStructures;
		if (maxSharedStructures == null)
			maxSharedStructures = hasSharedStructures ? 32 : 0;
		if (maxSharedStructures > 8160)
			throw new Error('Maximum maxSharedStructure is 8160')
		if (options.structuredClone && options.moreTypes == undefined) {
			this.moreTypes = true;
		}
		let maxOwnStructures = options.maxOwnStructures;
		if (maxOwnStructures == null)
			maxOwnStructures = hasSharedStructures ? 32 : 64;
		if (!this.structures && options.useRecords != false)
			this.structures = [];
		// two byte record ids for shared structures
		let useTwoByteRecords = maxSharedStructures > 32 || (maxOwnStructures + maxSharedStructures > 64);		
		let sharedLimitId = maxSharedStructures + 0x40;
		let maxStructureId = maxSharedStructures + maxOwnStructures + 0x40;
		if (maxStructureId > 8256) {
			throw new Error('Maximum maxSharedStructure + maxOwnStructure is 8192')
		}
		let recordIdsToRemove = [];
		let transitionsCount = 0;
		let serializationsSinceTransitionRebuild = 0;

		this.pack = this.encode = function(value, encodeOptions) {
			if (!target) {
				target = new ByteArrayAllocate(8192);
				targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, 8192));
				position = 0;
			}
			safeEnd = target.length - 10;
			if (safeEnd - position < 0x800) {
				// don't start too close to the end, 
				target = new ByteArrayAllocate(target.length);
				targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, target.length));
				safeEnd = target.length - 10;
				position = 0;
			} else
				position = (position + 7) & 0x7ffffff8; // Word align to make any future copying of this buffer faster
			start = position;
			if (encodeOptions & RESERVE_START_SPACE) position += (encodeOptions & 0xff);
			referenceMap = packr.structuredClone ? new Map() : null;
			if (packr.bundleStrings && typeof value !== 'string') {
				bundledStrings = [];
				bundledStrings.size = Infinity; // force a new bundle start on first string
			} else
				bundledStrings = null;
			structures = packr.structures;
			if (structures) {
				if (structures.uninitialized)
					structures = packr._mergeStructures(packr.getStructures());
				let sharedLength = structures.sharedLength || 0;
				if (sharedLength > maxSharedStructures) {
					//if (maxSharedStructures <= 32 && structures.sharedLength > 32) // TODO: could support this, but would need to update the limit ids
					throw new Error('Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to ' + structures.sharedLength)
				}
				if (!structures.transitions) {
					// rebuild our structure transitions
					structures.transitions = Object.create(null);
					for (let i = 0; i < sharedLength; i++) {
						let keys = structures[i];
						if (!keys)
							continue
						let nextTransition, transition = structures.transitions;
						for (let j = 0, l = keys.length; j < l; j++) {
							let key = keys[j];
							nextTransition = transition[key];
							if (!nextTransition) {
								nextTransition = transition[key] = Object.create(null);
							}
							transition = nextTransition;
						}
						transition[RECORD_SYMBOL] = i + 0x40;
					}
					this.lastNamedStructuresLength = sharedLength;
				}
				if (!isSequential) {
					structures.nextId = sharedLength + 0x40;
				}
			}
			if (hasSharedUpdate)
				hasSharedUpdate = false;
			let encodingError;
			try {
				if (packr.randomAccessStructure && value && value.constructor && value.constructor === Object)
					writeStruct(value);
				else
					pack(value);
				let lastBundle = bundledStrings;
				if (bundledStrings)
					writeBundles(start, pack, 0);
				if (referenceMap && referenceMap.idsToInsert) {
					let idsToInsert = referenceMap.idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
					let i = idsToInsert.length;
					let incrementPosition = -1;
					while (lastBundle && i > 0) {
						let insertionPoint = idsToInsert[--i].offset + start;
						if (insertionPoint < (lastBundle.stringsPosition + start) && incrementPosition === -1)
							incrementPosition = 0;
						if (insertionPoint > (lastBundle.position + start)) {
							if (incrementPosition >= 0)
								incrementPosition += 6;
						} else {
							if (incrementPosition >= 0) {
								// update the bundle reference now
								targetView.setUint32(lastBundle.position + start,
									targetView.getUint32(lastBundle.position + start) + incrementPosition);
								incrementPosition = -1; // reset
							}
							lastBundle = lastBundle.previous;
							i++;
						}
					}
					if (incrementPosition >= 0 && lastBundle) {
						// update the bundle reference now
						targetView.setUint32(lastBundle.position + start,
							targetView.getUint32(lastBundle.position + start) + incrementPosition);
					}
					position += idsToInsert.length * 6;
					if (position > safeEnd)
						makeRoom(position);
					packr.offset = position;
					let serialized = insertIds(target.subarray(start, position), idsToInsert);
					referenceMap = null;
					return serialized
				}
				packr.offset = position; // update the offset so next serialization doesn't write over our buffer, but can continue writing to same buffer sequentially
				if (encodeOptions & REUSE_BUFFER_MODE) {
					target.start = start;
					target.end = position;
					return target
				}
				return target.subarray(start, position) // position can change if we call pack again in saveStructures, so we get the buffer now
			} catch(error) {
				encodingError = error;
				throw error;
			} finally {
				if (structures) {
					resetStructures();
					if (hasSharedUpdate && packr.saveStructures) {
						let sharedLength = structures.sharedLength || 0;
						// we can't rely on start/end with REUSE_BUFFER_MODE since they will (probably) change when we save
						let returnBuffer = target.subarray(start, position);
						let newSharedData = prepareStructures$1(structures, packr);
						if (!encodingError) { // TODO: If there is an encoding error, should make the structures as uninitialized so they get rebuilt next time
							if (packr.saveStructures(newSharedData, newSharedData.isCompatible) === false) {
								// get updated structures and try again if the update failed
								return packr.pack(value, encodeOptions)
							}
							packr.lastNamedStructuresLength = sharedLength;
							return returnBuffer
						}
					}
				}
				if (encodeOptions & RESET_BUFFER_MODE)
					position = start;
			}
		};
		const resetStructures = () => {
			if (serializationsSinceTransitionRebuild < 10)
				serializationsSinceTransitionRebuild++;
			let sharedLength = structures.sharedLength || 0;
			if (structures.length > sharedLength && !isSequential)
				structures.length = sharedLength;
			if (transitionsCount > 10000) {
				// force a rebuild occasionally after a lot of transitions so it can get cleaned up
				structures.transitions = null;
				serializationsSinceTransitionRebuild = 0;
				transitionsCount = 0;
				if (recordIdsToRemove.length > 0)
					recordIdsToRemove = [];
			} else if (recordIdsToRemove.length > 0 && !isSequential) {
				for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
					recordIdsToRemove[i][RECORD_SYMBOL] = 0;
				}
				recordIdsToRemove = [];
			}
		};
		const packArray = (value) => {
			var length = value.length;
			if (length < 0x10) {
				target[position++] = 0x90 | length;
			} else if (length < 0x10000) {
				target[position++] = 0xdc;
				target[position++] = length >> 8;
				target[position++] = length & 0xff;
			} else {
				target[position++] = 0xdd;
				targetView.setUint32(position, length);
				position += 4;
			}
			for (let i = 0; i < length; i++) {
				pack(value[i]);
			}
		};
		const pack = (value) => {
			if (position > safeEnd)
				target = makeRoom(position);

			var type = typeof value;
			var length;
			if (type === 'string') {
				let strLength = value.length;
				if (bundledStrings && strLength >= 4 && strLength < 0x1000) {
					if ((bundledStrings.size += strLength) > MAX_BUNDLE_SIZE) {
						let extStart;
						let maxBytes = (bundledStrings[0] ? bundledStrings[0].length * 3 + bundledStrings[1].length : 0) + 10;
						if (position + maxBytes > safeEnd)
							target = makeRoom(position + maxBytes);
						let lastBundle;
						if (bundledStrings.position) { // here we use the 0x62 extension to write the last bundle and reserve space for the reference pointer to the next/current bundle
							lastBundle = bundledStrings;
							target[position] = 0xc8; // ext 16
							position += 3; // reserve for the writing bundle size
							target[position++] = 0x62; // 'b'
							extStart = position - start;
							position += 4; // reserve for writing bundle reference
							writeBundles(start, pack, 0); // write the last bundles
							targetView.setUint16(extStart + start - 3, position - start - extStart);
						} else { // here we use the 0x62 extension just to reserve the space for the reference pointer to the bundle (will be updated once the bundle is written)
							target[position++] = 0xd6; // fixext 4
							target[position++] = 0x62; // 'b'
							extStart = position - start;
							position += 4; // reserve for writing bundle reference
						}
						bundledStrings = ['', '']; // create new ones
						bundledStrings.previous = lastBundle;
						bundledStrings.size = 0;
						bundledStrings.position = extStart;
					}
					let twoByte = hasNonLatin.test(value);
					bundledStrings[twoByte ? 0 : 1] += value;
					target[position++] = 0xc1;
					pack(twoByte ? -strLength : strLength);
					return
				}
				let headerSize;
				// first we estimate the header size, so we can write to the correct location
				if (strLength < 0x20) {
					headerSize = 1;
				} else if (strLength < 0x100) {
					headerSize = 2;
				} else if (strLength < 0x10000) {
					headerSize = 3;
				} else {
					headerSize = 5;
				}
				let maxBytes = strLength * 3;
				if (position + maxBytes > safeEnd)
					target = makeRoom(position + maxBytes);

				if (strLength < 0x40 || !encodeUtf8) {
					let i, c1, c2, strPosition = position + headerSize;
					for (i = 0; i < strLength; i++) {
						c1 = value.charCodeAt(i);
						if (c1 < 0x80) {
							target[strPosition++] = c1;
						} else if (c1 < 0x800) {
							target[strPosition++] = c1 >> 6 | 0xc0;
							target[strPosition++] = c1 & 0x3f | 0x80;
						} else if (
							(c1 & 0xfc00) === 0xd800 &&
							((c2 = value.charCodeAt(i + 1)) & 0xfc00) === 0xdc00
						) {
							c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
							i++;
							target[strPosition++] = c1 >> 18 | 0xf0;
							target[strPosition++] = c1 >> 12 & 0x3f | 0x80;
							target[strPosition++] = c1 >> 6 & 0x3f | 0x80;
							target[strPosition++] = c1 & 0x3f | 0x80;
						} else {
							target[strPosition++] = c1 >> 12 | 0xe0;
							target[strPosition++] = c1 >> 6 & 0x3f | 0x80;
							target[strPosition++] = c1 & 0x3f | 0x80;
						}
					}
					length = strPosition - position - headerSize;
				} else {
					length = encodeUtf8(value, position + headerSize);
				}

				if (length < 0x20) {
					target[position++] = 0xa0 | length;
				} else if (length < 0x100) {
					if (headerSize < 2) {
						target.copyWithin(position + 2, position + 1, position + 1 + length);
					}
					target[position++] = 0xd9;
					target[position++] = length;
				} else if (length < 0x10000) {
					if (headerSize < 3) {
						target.copyWithin(position + 3, position + 2, position + 2 + length);
					}
					target[position++] = 0xda;
					target[position++] = length >> 8;
					target[position++] = length & 0xff;
				} else {
					if (headerSize < 5) {
						target.copyWithin(position + 5, position + 3, position + 3 + length);
					}
					target[position++] = 0xdb;
					targetView.setUint32(position, length);
					position += 4;
				}
				position += length;
			} else if (type === 'number') {
				if (value >>> 0 === value) {// positive integer, 32-bit or less
					// positive uint
					if (value < 0x20 || (value < 0x80 && this.useRecords === false) || (value < 0x40 && !this.randomAccessStructure)) {
						target[position++] = value;
					} else if (value < 0x100) {
						target[position++] = 0xcc;
						target[position++] = value;
					} else if (value < 0x10000) {
						target[position++] = 0xcd;
						target[position++] = value >> 8;
						target[position++] = value & 0xff;
					} else {
						target[position++] = 0xce;
						targetView.setUint32(position, value);
						position += 4;
					}
				} else if (value >> 0 === value) { // negative integer
					if (value >= -0x20) {
						target[position++] = 0x100 + value;
					} else if (value >= -0x80) {
						target[position++] = 0xd0;
						target[position++] = value + 0x100;
					} else if (value >= -0x8000) {
						target[position++] = 0xd1;
						targetView.setInt16(position, value);
						position += 2;
					} else {
						target[position++] = 0xd2;
						targetView.setInt32(position, value);
						position += 4;
					}
				} else {
					let useFloat32;
					if ((useFloat32 = this.useFloat32) > 0 && value < 0x100000000 && value >= -0x80000000) {
						target[position++] = 0xca;
						targetView.setFloat32(position, value);
						let xShifted;
						if (useFloat32 < 4 ||
								// this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
								((xShifted = value * mult10[((target[position] & 0x7f) << 1) | (target[position + 1] >> 7)]) >> 0) === xShifted) {
							position += 4;
							return
						} else
							position--; // move back into position for writing a double
					}
					target[position++] = 0xcb;
					targetView.setFloat64(position, value);
					position += 8;
				}
			} else if (type === 'object' || type === 'function') {
				if (!value)
					target[position++] = 0xc0;
				else {
					if (referenceMap) {
						let referee = referenceMap.get(value);
						if (referee) {
							if (!referee.id) {
								let idsToInsert = referenceMap.idsToInsert || (referenceMap.idsToInsert = []);
								referee.id = idsToInsert.push(referee);
							}
							target[position++] = 0xd6; // fixext 4
							target[position++] = 0x70; // "p" for pointer
							targetView.setUint32(position, referee.id);
							position += 4;
							return
						} else 
							referenceMap.set(value, { offset: position - start });
					}
					let constructor = value.constructor;
					if (constructor === Object) {
						writeObject(value, true);
					} else if (constructor === Array) {
						packArray(value);
					} else if (constructor === Map) {
						if (this.mapAsEmptyObject) target[position++] = 0x80;
						else {
							length = value.size;
							if (length < 0x10) {
								target[position++] = 0x80 | length;
							} else if (length < 0x10000) {
								target[position++] = 0xde;
								target[position++] = length >> 8;
								target[position++] = length & 0xff;
							} else {
								target[position++] = 0xdf;
								targetView.setUint32(position, length);
								position += 4;
							}
							for (let [key, entryValue] of value) {
								pack(key);
								pack(entryValue);
							}
						}
					} else {	
						for (let i = 0, l = extensions.length; i < l; i++) {
							let extensionClass = extensionClasses[i];
							if (value instanceof extensionClass) {
								let extension = extensions[i];
								if (extension.write) {
									if (extension.type) {
										target[position++] = 0xd4; // one byte "tag" extension
										target[position++] = extension.type;
										target[position++] = 0;
									}
									let writeResult = extension.write.call(this, value);
									if (writeResult === value) { // avoid infinite recursion
										if (Array.isArray(value)) {
											packArray(value);
										} else {
											writeObject(value);
										}
									} else {
										pack(writeResult);
									}
									return
								}
								let currentTarget = target;
								let currentTargetView = targetView;
								let currentPosition = position;
								target = null;
								let result;
								try {
									result = extension.pack.call(this, value, (size) => {
										// restore target and use it
										target = currentTarget;
										currentTarget = null;
										position += size;
										if (position > safeEnd)
											makeRoom(position);
										return {
											target, targetView, position: position - size
										}
									}, pack);
								} finally {
									// restore current target information (unless already restored)
									if (currentTarget) {
										target = currentTarget;
										targetView = currentTargetView;
										position = currentPosition;
										safeEnd = target.length - 10;
									}
								}
								if (result) {
									if (result.length + position > safeEnd)
										makeRoom(result.length + position);
									position = writeExtensionData(result, target, position, extension.type);
								}
								return
							}
						}
						// check isArray after extensions, because extensions can extend Array
						if (Array.isArray(value)) {
							packArray(value);
						} else {
							// use this as an alternate mechanism for expressing how to serialize
							if (value.toJSON) {
								const json = value.toJSON();
								// if for some reason value.toJSON returns itself it'll loop forever
								if (json !== value)
									return pack(json)
							}
							
							// if there is a writeFunction, use it, otherwise just encode as undefined
							if (type === 'function')
								return pack(this.writeFunction && this.writeFunction(value));
							
							// no extension found, write as object
							writeObject(value, !value.hasOwnProperty); // if it doesn't have hasOwnProperty, don't do hasOwnProperty checks
						}
					}
				}
			} else if (type === 'boolean') {
				target[position++] = value ? 0xc3 : 0xc2;
			} else if (type === 'bigint') {
				if (value < (BigInt(1)<<BigInt(63)) && value >= -(BigInt(1)<<BigInt(63))) {
					// use a signed int as long as it fits
					target[position++] = 0xd3;
					targetView.setBigInt64(position, value);
				} else if (value < (BigInt(1)<<BigInt(64)) && value > 0) {
					// if we can fit an unsigned int, use that
					target[position++] = 0xcf;
					targetView.setBigUint64(position, value);
				} else {
					// overflow
					if (this.largeBigIntToFloat) {
						target[position++] = 0xcb;
						targetView.setFloat64(position, Number(value));
					} else if (this.useBigIntExtension && value < 2n**(1023n) && value > -(2n**(1023n))) {
						target[position++] = 0xc7;
						position++;
						target[position++] = 0x42; // "B" for BigInt
						let bytes = [];
						let alignedSign;
						do {
							let byte = value & 0xffn;
							alignedSign = (byte & 0x80n) === (value < 0n ? 0x80n : 0n);
							bytes.push(byte);
							value >>= 8n;
						} while (!((value === 0n || value === -1n) && alignedSign));
						target[position-2] = bytes.length;
						for (let i = bytes.length; i > 0;) {
							target[position++] = Number(bytes[--i]);
						}
						return
					} else {
						throw new RangeError(value + ' was too large to fit in MessagePack 64-bit integer format, use' +
							' useBigIntExtension or set largeBigIntToFloat to convert to float-64')
					}
				}
				position += 8;
			} else if (type === 'undefined') {
				if (this.encodeUndefinedAsNil)
					target[position++] = 0xc0;
				else {
					target[position++] = 0xd4; // a number of implementations use fixext1 with type 0, data 0 to denote undefined, so we follow suite
					target[position++] = 0;
					target[position++] = 0;
				}
			} else {
				throw new Error('Unknown type: ' + type)
			}
		};

		const writePlainObject = (this.variableMapSize || this.coercibleKeyAsNumber) ? (object) => {
			// this method is slightly slower, but generates "preferred serialization" (optimally small for smaller objects)
			let keys = Object.keys(object);
			let length = keys.length;
			if (length < 0x10) {
				target[position++] = 0x80 | length;
			} else if (length < 0x10000) {
				target[position++] = 0xde;
				target[position++] = length >> 8;
				target[position++] = length & 0xff;
			} else {
				target[position++] = 0xdf;
				targetView.setUint32(position, length);
				position += 4;
			}
			let key;
			if (this.coercibleKeyAsNumber) {
				for (let i = 0; i < length; i++) {
					key = keys[i];
					let num = Number(key);
					pack(isNaN(num) ? key : num);
					pack(object[key]);
				}

			} else {
				for (let i = 0; i < length; i++) {
					pack(key = keys[i]);
					pack(object[key]);
				}
			}
		} :
		(object, safePrototype) => {
			target[position++] = 0xde; // always using map 16, so we can preallocate and set the length afterwards
			let objectOffset = position - start;
			position += 2;
			let size = 0;
			for (let key in object) {
				if (safePrototype || object.hasOwnProperty(key)) {
					pack(key);
					pack(object[key]);
					size++;
				}
			}
			target[objectOffset++ + start] = size >> 8;
			target[objectOffset + start] = size & 0xff;
		};

		const writeRecord = this.useRecords === false ? writePlainObject :
		(options.progressiveRecords && !useTwoByteRecords) ?  // this is about 2% faster for highly stable structures, since it only requires one for-in loop (but much more expensive when new structure needs to be written)
		(object, safePrototype) => {
			let nextTransition, transition = structures.transitions || (structures.transitions = Object.create(null));
			let objectOffset = position++ - start;
			let wroteKeys;
			for (let key in object) {
				if (safePrototype || object.hasOwnProperty(key)) {
					nextTransition = transition[key];
					if (nextTransition)
						transition = nextTransition;
					else {
						// record doesn't exist, create full new record and insert it
						let keys = Object.keys(object);
						let lastTransition = transition;
						transition = structures.transitions;
						let newTransitions = 0;
						for (let i = 0, l = keys.length; i < l; i++) {
							let key = keys[i];
							nextTransition = transition[key];
							if (!nextTransition) {
								nextTransition = transition[key] = Object.create(null);
								newTransitions++;
							}
							transition = nextTransition;
						}
						if (objectOffset + start + 1 == position) {
							// first key, so we don't need to insert, we can just write record directly
							position--;
							newRecord(transition, keys, newTransitions);
						} else // otherwise we need to insert the record, moving existing data after the record
							insertNewRecord(transition, keys, objectOffset, newTransitions);
						wroteKeys = true;
						transition = lastTransition[key];
					}
					pack(object[key]);
				}
			}
			if (!wroteKeys) {
				let recordId = transition[RECORD_SYMBOL];
				if (recordId)
					target[objectOffset + start] = recordId;
				else
					insertNewRecord(transition, Object.keys(object), objectOffset, 0);
			}
		} :
		(object, safePrototype) => {
			let nextTransition, transition = structures.transitions || (structures.transitions = Object.create(null));
			let newTransitions = 0;
			for (let key in object) if (safePrototype || object.hasOwnProperty(key)) {
				nextTransition = transition[key];
				if (!nextTransition) {
					nextTransition = transition[key] = Object.create(null);
					newTransitions++;
				}
				transition = nextTransition;
			}
			let recordId = transition[RECORD_SYMBOL];
			if (recordId) {
				if (recordId >= 0x60 && useTwoByteRecords) {
					target[position++] = ((recordId -= 0x60) & 0x1f) + 0x60;
					target[position++] = recordId >> 5;
				} else
					target[position++] = recordId;
			} else {
				newRecord(transition, transition.__keys__ || Object.keys(object), newTransitions);
			}
			// now write the values
			for (let key in object)
				if (safePrototype || object.hasOwnProperty(key)) {
					pack(object[key]);
				}
		};

		// craete reference to useRecords if useRecords is a function
		const checkUseRecords = typeof this.useRecords == 'function' && this.useRecords;
		
		const writeObject = checkUseRecords ? (object, safePrototype) => {
			checkUseRecords(object) ? writeRecord(object,safePrototype) : writePlainObject(object,safePrototype);
		} : writeRecord;

		const makeRoom = (end) => {
			let newSize;
			if (end > 0x1000000) {
				// special handling for really large buffers
				if ((end - start) > MAX_BUFFER_SIZE)
					throw new Error('Packed buffer would be larger than maximum buffer size')
				newSize = Math.min(MAX_BUFFER_SIZE,
					Math.round(Math.max((end - start) * (end > 0x4000000 ? 1.25 : 2), 0x400000) / 0x1000) * 0x1000);
			} else // faster handling for smaller buffers
				newSize = ((Math.max((end - start) << 2, target.length - 1) >> 12) + 1) << 12;
			let newBuffer = new ByteArrayAllocate(newSize);
			targetView = newBuffer.dataView || (newBuffer.dataView = new DataView(newBuffer.buffer, 0, newSize));
			end = Math.min(end, target.length);
			if (target.copy)
				target.copy(newBuffer, 0, start, end);
			else
				newBuffer.set(target.slice(start, end));
			position -= start;
			start = 0;
			safeEnd = newBuffer.length - 10;
			return target = newBuffer
		};
		const newRecord = (transition, keys, newTransitions) => {
			let recordId = structures.nextId;
			if (!recordId)
				recordId = 0x40;
			if (recordId < sharedLimitId && this.shouldShareStructure && !this.shouldShareStructure(keys)) {
				recordId = structures.nextOwnId;
				if (!(recordId < maxStructureId))
					recordId = sharedLimitId;
				structures.nextOwnId = recordId + 1;
			} else {
				if (recordId >= maxStructureId)// cycle back around
					recordId = sharedLimitId;
				structures.nextId = recordId + 1;
			}
			let highByte = keys.highByte = recordId >= 0x60 && useTwoByteRecords ? (recordId - 0x60) >> 5 : -1;
			transition[RECORD_SYMBOL] = recordId;
			transition.__keys__ = keys;
			structures[recordId - 0x40] = keys;

			if (recordId < sharedLimitId) {
				keys.isShared = true;
				structures.sharedLength = recordId - 0x3f;
				hasSharedUpdate = true;
				if (highByte >= 0) {
					target[position++] = (recordId & 0x1f) + 0x60;
					target[position++] = highByte;
				} else {
					target[position++] = recordId;
				}
			} else {
				if (highByte >= 0) {
					target[position++] = 0xd5; // fixext 2
					target[position++] = 0x72; // "r" record defintion extension type
					target[position++] = (recordId & 0x1f) + 0x60;
					target[position++] = highByte;
				} else {
					target[position++] = 0xd4; // fixext 1
					target[position++] = 0x72; // "r" record defintion extension type
					target[position++] = recordId;
				}

				if (newTransitions)
					transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
				// record the removal of the id, we can maintain our shared structure
				if (recordIdsToRemove.length >= maxOwnStructures)
					recordIdsToRemove.shift()[RECORD_SYMBOL] = 0; // we are cycling back through, and have to remove old ones
				recordIdsToRemove.push(transition);
				pack(keys);
			}
		};
		const insertNewRecord = (transition, keys, insertionOffset, newTransitions) => {
			let mainTarget = target;
			let mainPosition = position;
			let mainSafeEnd = safeEnd;
			let mainStart = start;
			target = keysTarget;
			position = 0;
			start = 0;
			if (!target)
				keysTarget = target = new ByteArrayAllocate(8192);
			safeEnd = target.length - 10;
			newRecord(transition, keys, newTransitions);
			keysTarget = target;
			let keysPosition = position;
			target = mainTarget;
			position = mainPosition;
			safeEnd = mainSafeEnd;
			start = mainStart;
			if (keysPosition > 1) {
				let newEnd = position + keysPosition - 1;
				if (newEnd > safeEnd)
					makeRoom(newEnd);
				let insertionPosition = insertionOffset + start;
				target.copyWithin(insertionPosition + keysPosition, insertionPosition + 1, position);
				target.set(keysTarget.slice(0, keysPosition), insertionPosition);
				position = newEnd;
			} else {
				target[insertionOffset + start] = keysTarget[0];
			}
		};
		const writeStruct = (object, safePrototype) => {
			let newPosition = writeStructSlots(object, target, start, position, structures, makeRoom, (value, newPosition, notifySharedUpdate) => {
				if (notifySharedUpdate)
					return hasSharedUpdate = true;
				position = newPosition;
				let startTarget = target;
				pack(value);
				resetStructures();
				if (startTarget !== target) {
					return { position, targetView, target }; // indicate the buffer was re-allocated
				}
				return position;
			}, this);
			if (newPosition === 0) // bail and go to a msgpack object
				return writeObject(object, true);
			position = newPosition;
		};
	}
	useBuffer(buffer) {
		// this means we are finished using our own buffer and we can write over it safely
		target = buffer;
		targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
		position = 0;
	}
	clearSharedData() {
		if (this.structures)
			this.structures = [];
		if (this.typedStructs)
			this.typedStructs = [];
	}
}

extensionClasses = [ Date, Set, Error, RegExp, ArrayBuffer, Object.getPrototypeOf(Uint8Array.prototype).constructor /*TypedArray*/, C1Type ];
extensions = [{
	pack(date, allocateForWrite, pack) {
		let seconds = date.getTime() / 1000;
		if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 0x100000000) {
			// Timestamp 32
			let { target, targetView, position} = allocateForWrite(6);
			target[position++] = 0xd6;
			target[position++] = 0xff;
			targetView.setUint32(position, seconds);
		} else if (seconds > 0 && seconds < 0x100000000) {
			// Timestamp 64
			let { target, targetView, position} = allocateForWrite(10);
			target[position++] = 0xd7;
			target[position++] = 0xff;
			targetView.setUint32(position, date.getMilliseconds() * 4000000 + ((seconds / 1000 / 0x100000000) >> 0));
			targetView.setUint32(position + 4, seconds);
		} else if (isNaN(seconds)) {
			if (this.onInvalidDate) {
				allocateForWrite(0);
				return pack(this.onInvalidDate())
			}
			// Intentionally invalid timestamp
			let { target, targetView, position} = allocateForWrite(3);
			target[position++] = 0xd4;
			target[position++] = 0xff;
			target[position++] = 0xff;
		} else {
			// Timestamp 96
			let { target, targetView, position} = allocateForWrite(15);
			target[position++] = 0xc7;
			target[position++] = 12;
			target[position++] = 0xff;
			targetView.setUint32(position, date.getMilliseconds() * 1000000);
			targetView.setBigInt64(position + 4, BigInt(Math.floor(seconds)));
		}
	}
}, {
	pack(set, allocateForWrite, pack) {
		if (this.setAsEmptyObject) {
			allocateForWrite(0);
			return pack({})
		}
		let array = Array.from(set);
		let { target, position} = allocateForWrite(this.moreTypes ? 3 : 0);
		if (this.moreTypes) {
			target[position++] = 0xd4;
			target[position++] = 0x73; // 's' for Set
			target[position++] = 0;
		}
		pack(array);
	}
}, {
	pack(error, allocateForWrite, pack) {
		let { target, position} = allocateForWrite(this.moreTypes ? 3 : 0);
		if (this.moreTypes) {
			target[position++] = 0xd4;
			target[position++] = 0x65; // 'e' for error
			target[position++] = 0;
		}
		pack([ error.name, error.message ]);
	}
}, {
	pack(regex, allocateForWrite, pack) {
		let { target, position} = allocateForWrite(this.moreTypes ? 3 : 0);
		if (this.moreTypes) {
			target[position++] = 0xd4;
			target[position++] = 0x78; // 'x' for regeXp
			target[position++] = 0;
		}
		pack([ regex.source, regex.flags ]);
	}
}, {
	pack(arrayBuffer, allocateForWrite) {
		if (this.moreTypes)
			writeExtBuffer(arrayBuffer, 0x10, allocateForWrite);
		else
			writeBuffer(hasNodeBuffer$1 ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
	}
}, {
	pack(typedArray, allocateForWrite) {
		let constructor = typedArray.constructor;
		if (constructor !== ByteArray && this.moreTypes)
			writeExtBuffer(typedArray, typedArrays.indexOf(constructor.name), allocateForWrite);
		else
			writeBuffer(typedArray, allocateForWrite);
	}
}, {
	pack(c1, allocateForWrite) { // specific 0xC1 object
		let { target, position} = allocateForWrite(1);
		target[position] = 0xc1;
	}
}];

function writeExtBuffer(typedArray, type, allocateForWrite, encode) {
	let length = typedArray.byteLength;
	if (length + 1 < 0x100) {
		var { target, position } = allocateForWrite(4 + length);
		target[position++] = 0xc7;
		target[position++] = length + 1;
	} else if (length + 1 < 0x10000) {
		var { target, position } = allocateForWrite(5 + length);
		target[position++] = 0xc8;
		target[position++] = (length + 1) >> 8;
		target[position++] = (length + 1) & 0xff;
	} else {
		var { target, position, targetView } = allocateForWrite(7 + length);
		target[position++] = 0xc9;
		targetView.setUint32(position, length + 1); // plus one for the type byte
		position += 4;
	}
	target[position++] = 0x74; // "t" for typed array
	target[position++] = type;
	target.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength), position);
}
function writeBuffer(buffer, allocateForWrite) {
	let length = buffer.byteLength;
	var target, position;
	if (length < 0x100) {
		var { target, position } = allocateForWrite(length + 2);
		target[position++] = 0xc4;
		target[position++] = length;
	} else if (length < 0x10000) {
		var { target, position } = allocateForWrite(length + 3);
		target[position++] = 0xc5;
		target[position++] = length >> 8;
		target[position++] = length & 0xff;
	} else {
		var { target, position, targetView } = allocateForWrite(length + 5);
		target[position++] = 0xc6;
		targetView.setUint32(position, length);
		position += 4;
	}
	target.set(buffer, position);
}

function writeExtensionData(result, target, position, type) {
	let length = result.length;
	switch (length) {
		case 1:
			target[position++] = 0xd4;
			break
		case 2:
			target[position++] = 0xd5;
			break
		case 4:
			target[position++] = 0xd6;
			break
		case 8:
			target[position++] = 0xd7;
			break
		case 16:
			target[position++] = 0xd8;
			break
		default:
			if (length < 0x100) {
				target[position++] = 0xc7;
				target[position++] = length;
			} else if (length < 0x10000) {
				target[position++] = 0xc8;
				target[position++] = length >> 8;
				target[position++] = length & 0xff;
			} else {
				target[position++] = 0xc9;
				target[position++] = length >> 24;
				target[position++] = (length >> 16) & 0xff;
				target[position++] = (length >> 8) & 0xff;
				target[position++] = length & 0xff;
			}
	}
	target[position++] = type;
	target.set(result, position);
	position += length;
	return position
}

function insertIds(serialized, idsToInsert) {
	// insert the ids that need to be referenced for structured clones
	let nextId;
	let distanceToMove = idsToInsert.length * 6;
	let lastEnd = serialized.length - distanceToMove;
	while (nextId = idsToInsert.pop()) {
		let offset = nextId.offset;
		let id = nextId.id;
		serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
		distanceToMove -= 6;
		let position = offset + distanceToMove;
		serialized[position++] = 0xd6;
		serialized[position++] = 0x69; // 'i'
		serialized[position++] = id >> 24;
		serialized[position++] = (id >> 16) & 0xff;
		serialized[position++] = (id >> 8) & 0xff;
		serialized[position++] = id & 0xff;
		lastEnd = offset;
	}
	return serialized
}

function writeBundles(start, pack, incrementPosition) {
	if (bundledStrings.length > 0) {
		targetView.setUint32(bundledStrings.position + start, position + incrementPosition - bundledStrings.position - start);
		bundledStrings.stringsPosition = position - start;
		let writeStrings = bundledStrings;
		bundledStrings = null;
		pack(writeStrings[0]);
		pack(writeStrings[1]);
	}
}

function addExtension(extension) {
	if (extension.Class) {
		if (!extension.pack && !extension.write)
			throw new Error('Extension has no pack or write function')
		if (extension.pack && !extension.type)
			throw new Error('Extension has no type (numeric code to identify the extension)')
		extensionClasses.unshift(extension.Class);
		extensions.unshift(extension);
	}
	addExtension$1(extension);
}
function prepareStructures$1(structures, packr) {
	structures.isCompatible = (existingStructures) => {
		let compatible = !existingStructures || ((packr.lastNamedStructuresLength || 0) === existingStructures.length);
		if (!compatible) // we want to merge these existing structures immediately since we already have it and we are in the right transaction
			packr._mergeStructures(existingStructures);
		return compatible;
	};
	return structures
}
function setWriteStructSlots(writeSlots, makeStructures) {
	writeStructSlots = writeSlots;
	prepareStructures$1 = makeStructures;
}

let defaultPackr = new Packr({ useRecords: false });
const pack = defaultPackr.pack;
defaultPackr.pack;
const REUSE_BUFFER_MODE = 512;
const RESET_BUFFER_MODE = 1024;
const RESERVE_START_SPACE = 2048;

const ASCII = 3; // the MIBenum from https://www.iana.org/assignments/character-sets/character-sets.xhtml (and other character encodings could be referenced by MIBenum)
const NUMBER = 0;
const UTF8 = 2;
const OBJECT_DATA = 1;
const DATE = 16;
const TYPE_NAMES = ['num', 'object', 'string', 'ascii'];
TYPE_NAMES[DATE] = 'date';
const float32Headers = [false, true, true, false, false, true, true, false];
let evalSupported;
try {
	new Function('');
	evalSupported = true;
} catch(error) {
	// if eval variants are not supported, do not create inline object readers ever
}

let updatedPosition;
const hasNodeBuffer = typeof Buffer !== 'undefined';
let textEncoder, currentSource;
try {
	textEncoder = new TextEncoder();
} catch (error) {}
const encodeUtf8 = hasNodeBuffer ? function(target, string, position) {
	return target.utf8Write(string, position, 0xffffffff)
} : (textEncoder && textEncoder.encodeInto) ?
	function(target, string, position) {
		return textEncoder.encodeInto(string, target.subarray(position)).written
	} : false;
setWriteStructSlots(writeStruct, prepareStructures);
function writeStruct(object, target, encodingStart, position, structures, makeRoom, pack, packr) {
	let typedStructs = packr.typedStructs || (packr.typedStructs = []);
	// note that we rely on pack.js to load stored structures before we get to this point
	let targetView = target.dataView;
	let refsStartPosition = (typedStructs.lastStringStart || 100) + position;
	let safeEnd = target.length - 10;
	let start = position;
	if (position > safeEnd) {
		target = makeRoom(position);
		targetView = target.dataView;
		position -= encodingStart;
		start -= encodingStart;
		refsStartPosition -= encodingStart;
		encodingStart = 0;
		safeEnd = target.length - 10;
	}

	let refOffset, refPosition = refsStartPosition;

	let transition = typedStructs.transitions || (typedStructs.transitions = Object.create(null));
	let nextId = typedStructs.nextId || typedStructs.length;
	let headerSize =
		nextId < 0xf ? 1 :
			nextId < 0xf0 ? 2 :
				nextId < 0xf000 ? 3 :
					nextId < 0xf00000 ? 4 : 0;
	if (headerSize === 0)
		return 0;
	position += headerSize;
	let queuedReferences = [];
	let usedAscii0;
	let keyIndex = 0;
	for (let key in object) {
		let value = object[key];
		let nextTransition = transition[key];
		if (!nextTransition) {
			transition[key] = nextTransition = {
				key,
				parent: transition,
				enumerationOffset: 0,
				ascii0: null,
				ascii8: null,
				num8: null,
				string16: null,
				object16: null,
				num32: null,
				float64: null,
				date64: null
			};
		}
		if (position > safeEnd) {
			target = makeRoom(position);
			targetView = target.dataView;
			position -= encodingStart;
			start -= encodingStart;
			refsStartPosition -= encodingStart;
			refPosition -= encodingStart;
			encodingStart = 0;
			safeEnd = target.length - 10;
		}
		switch (typeof value) {
			case 'number':
				let number = value;
				// first check to see if we are using a lot of ids and should default to wide/common format
				if (nextId < 200 || !nextTransition.num64) {
					if (number >> 0 === number && number < 0x20000000 && number > -0x1f000000) {
						if (number < 0xf6 && number >= 0 && (nextTransition.num8 && !(nextId > 200 && nextTransition.num32) || number < 0x20 && !nextTransition.num32)) {
							transition = nextTransition.num8 || createTypeTransition(nextTransition, NUMBER, 1);
							target[position++] = number;
						} else {
							transition = nextTransition.num32 || createTypeTransition(nextTransition, NUMBER, 4);
							targetView.setUint32(position, number, true);
							position += 4;
						}
						break;
					} else if (number < 0x100000000 && number >= -0x80000000) {
						targetView.setFloat32(position, number, true);
						if (float32Headers[target[position + 3] >>> 5]) {
							let xShifted;
							// this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
							if (((xShifted = number * mult10[((target[position + 3] & 0x7f) << 1) | (target[position + 2] >> 7)]) >> 0) === xShifted) {
								transition = nextTransition.num32 || createTypeTransition(nextTransition, NUMBER, 4);
								position += 4;
								break;
							}
						}
					}
				}
				transition = nextTransition.num64 || createTypeTransition(nextTransition, NUMBER, 8);
				targetView.setFloat64(position, number, true);
				position += 8;
				break;
			case 'string':
				let strLength = value.length;
				refOffset = refPosition - refsStartPosition;
				if ((strLength << 2) + refPosition > safeEnd) {
					target = makeRoom((strLength << 2) + refPosition);
					targetView = target.dataView;
					position -= encodingStart;
					start -= encodingStart;
					refsStartPosition -= encodingStart;
					refPosition -= encodingStart;
					encodingStart = 0;
					safeEnd = target.length - 10;
				}
				if (strLength > ((0xff00 + refOffset) >> 2)) {
					queuedReferences.push(key, value, position - start);
					break;
				}
				let isNotAscii;
				let strStart = refPosition;
				if (strLength < 0x40) {
					let i, c1, c2;
					for (i = 0; i < strLength; i++) {
						c1 = value.charCodeAt(i);
						if (c1 < 0x80) {
							target[refPosition++] = c1;
						} else if (c1 < 0x800) {
							isNotAscii = true;
							target[refPosition++] = c1 >> 6 | 0xc0;
							target[refPosition++] = c1 & 0x3f | 0x80;
						} else if (
							(c1 & 0xfc00) === 0xd800 &&
							((c2 = value.charCodeAt(i + 1)) & 0xfc00) === 0xdc00
						) {
							isNotAscii = true;
							c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
							i++;
							target[refPosition++] = c1 >> 18 | 0xf0;
							target[refPosition++] = c1 >> 12 & 0x3f | 0x80;
							target[refPosition++] = c1 >> 6 & 0x3f | 0x80;
							target[refPosition++] = c1 & 0x3f | 0x80;
						} else {
							isNotAscii = true;
							target[refPosition++] = c1 >> 12 | 0xe0;
							target[refPosition++] = c1 >> 6 & 0x3f | 0x80;
							target[refPosition++] = c1 & 0x3f | 0x80;
						}
					}
				} else {
					refPosition += encodeUtf8(target, value, refPosition);
					isNotAscii = refPosition - strStart > strLength;
				}
				if (refOffset < 0xa0 || (refOffset < 0xf6 && (nextTransition.ascii8 || nextTransition.string8))) {
					// short strings
					if (isNotAscii) {
						if (!(transition = nextTransition.string8)) {
							if (typedStructs.length > 10 && (transition = nextTransition.ascii8)) {
								// we can safely change ascii to utf8 in place since they are compatible
								transition.__type = UTF8;
								nextTransition.ascii8 = null;
								nextTransition.string8 = transition;
								pack(null, 0, true); // special call to notify that structures have been updated
							} else {
								transition = createTypeTransition(nextTransition, UTF8, 1);
							}
						}
					} else if (refOffset === 0 && !usedAscii0) {
						usedAscii0 = true;
						transition = nextTransition.ascii0 || createTypeTransition(nextTransition, ASCII, 0);
						break; // don't increment position
					}// else ascii:
					else if (!(transition = nextTransition.ascii8) && !(typedStructs.length > 10 && (transition = nextTransition.string8)))
						transition = createTypeTransition(nextTransition, ASCII, 1);
					target[position++] = refOffset;
				} else {
					// TODO: Enable ascii16 at some point, but get the logic right
					//if (isNotAscii)
						transition = nextTransition.string16 || createTypeTransition(nextTransition, UTF8, 2);
					//else
						//transition = nextTransition.ascii16 || createTypeTransition(nextTransition, ASCII, 2);
					targetView.setUint16(position, refOffset, true);
					position += 2;
				}
				break;
			case 'object':
				if (value) {
					if (value.constructor === Date) {
						transition = nextTransition.date64 || createTypeTransition(nextTransition, DATE, 8);
						targetView.setFloat64(position, value.getTime(), true);
						position += 8;
					} else {
						queuedReferences.push(key, value, keyIndex);
					}
					break;
				} else { // null
					nextTransition = anyType(nextTransition, position, targetView, -10); // match CBOR with this
					if (nextTransition) {
						transition = nextTransition;
						position = updatedPosition;
					} else queuedReferences.push(key, value, keyIndex);
				}
				break;
			case 'boolean':
				transition = nextTransition.num8 || nextTransition.ascii8 || createTypeTransition(nextTransition, NUMBER, 1);
				target[position++] = value ? 0xf9 : 0xf8; // match CBOR with these
				break;
			case 'undefined':
				nextTransition = anyType(nextTransition, position, targetView, -9); // match CBOR with this
				if (nextTransition) {
					transition = nextTransition;
					position = updatedPosition;
				} else queuedReferences.push(key, value, keyIndex);
				break;
			default:
				queuedReferences.push(key, value, keyIndex);
		}
		keyIndex++;
	}

	for (let i = 0, l = queuedReferences.length; i < l;) {
		let key = queuedReferences[i++];
		let value = queuedReferences[i++];
		let propertyIndex = queuedReferences[i++];
		let nextTransition = transition[key];
		if (!nextTransition) {
			transition[key] = nextTransition = {
				key,
				parent: transition,
				enumerationOffset: propertyIndex - keyIndex,
				ascii0: null,
				ascii8: null,
				num8: null,
				string16: null,
				object16: null,
				num32: null,
				float64: null
			};
		}
		let newPosition;
		if (value) {
			/*if (typeof value === 'string') { // TODO: we could re-enable long strings
				if (position + value.length * 3 > safeEnd) {
					target = makeRoom(position + value.length * 3);
					position -= start;
					targetView = target.dataView;
					start = 0;
				}
				newPosition = position + target.utf8Write(value, position, 0xffffffff);
			} else { */
			let size;
			refOffset = refPosition - refsStartPosition;
			if (refOffset < 0xff00) {
				transition = nextTransition.object16;
				if (transition)
					size = 2;
				else if ((transition = nextTransition.object32))
					size = 4;
				else {
					transition = createTypeTransition(nextTransition, OBJECT_DATA, 2);
					size = 2;
				}
			} else {
				transition = nextTransition.object32 || createTypeTransition(nextTransition, OBJECT_DATA, 4);
				size = 4;
			}
			newPosition = pack(value, refPosition);
			//}
			if (typeof newPosition === 'object') {
				// re-allocated
				refPosition = newPosition.position;
				targetView = newPosition.targetView;
				target = newPosition.target;
				refsStartPosition -= encodingStart;
				position -= encodingStart;
				start -= encodingStart;
				encodingStart = 0;
			} else
				refPosition = newPosition;
			if (size === 2) {
				targetView.setUint16(position, refOffset, true);
				position += 2;
			} else {
				targetView.setUint32(position, refOffset, true);
				position += 4;
			}
		} else { // null or undefined
			transition = nextTransition.object16 || createTypeTransition(nextTransition, OBJECT_DATA, 2);
			targetView.setInt16(position, value === null ? -10 : -9, true);
			position += 2;
		}
		keyIndex++;
	}


	let recordId = transition[RECORD_SYMBOL];
	if (recordId == null) {
		recordId = packr.typedStructs.length;
		let structure = [];
		let nextTransition = transition;
		let key, type;
		while ((type = nextTransition.__type) !== undefined) {
			let size = nextTransition.__size;
			nextTransition = nextTransition.__parent;
			key = nextTransition.key;
			let property = [type, size, key];
			if (nextTransition.enumerationOffset)
				property.push(nextTransition.enumerationOffset);
			structure.push(property);
			nextTransition = nextTransition.parent;
		}
		structure.reverse();
		transition[RECORD_SYMBOL] = recordId;
		packr.typedStructs[recordId] = structure;
		pack(null, 0, true); // special call to notify that structures have been updated
	}


	switch (headerSize) {
		case 1:
			if (recordId >= 0x10) return 0;
			target[start] = recordId + 0x20;
			break;
		case 2:
			if (recordId >= 0x100) return 0;
			target[start] = 0x38;
			target[start + 1] = recordId;
			break;
		case 3:
			if (recordId >= 0x10000) return 0;
			target[start] = 0x39;
			targetView.setUint16(start + 1, recordId, true);
			break;
		case 4:
			if (recordId >= 0x1000000) return 0;
			targetView.setUint32(start, (recordId << 8) + 0x3a, true);
			break;
	}

	if (position < refsStartPosition) {
		if (refsStartPosition === refPosition)
			return position; // no refs
		// adjust positioning
		target.copyWithin(position, refsStartPosition, refPosition);
		refPosition += position - refsStartPosition;
		typedStructs.lastStringStart = position - start;
	} else if (position > refsStartPosition) {
		if (refsStartPosition === refPosition)
			return position; // no refs
		typedStructs.lastStringStart = position - start;
		return writeStruct(object, target, encodingStart, start, structures, makeRoom, pack, packr);
	}
	return refPosition;
}
function anyType(transition, position, targetView, value) {
	let nextTransition;
	if ((nextTransition = transition.ascii8 || transition.num8)) {
		targetView.setInt8(position, value, true);
		updatedPosition = position + 1;
		return nextTransition;
	}
	if ((nextTransition = transition.string16 || transition.object16)) {
		targetView.setInt16(position, value, true);
		updatedPosition = position + 2;
		return nextTransition;
	}
	if (nextTransition = transition.num32) {
		targetView.setUint32(position, 0xe0000100 + value, true);
		updatedPosition = position + 4;
		return nextTransition;
	}
	// transition.float64
	if (nextTransition = transition.num64) {
		targetView.setFloat64(position, NaN, true);
		targetView.setInt8(position, value);
		updatedPosition = position + 8;
		return nextTransition;
	}
	updatedPosition = position;
	// TODO: can we do an "any" type where we defer the decision?
	return;
}
function createTypeTransition(transition, type, size) {
	let typeName = TYPE_NAMES[type] + (size << 3);
	let newTransition = transition[typeName] || (transition[typeName] = Object.create(null));
	newTransition.__type = type;
	newTransition.__size = size;
	newTransition.__parent = transition;
	return newTransition;
}
function onLoadedStructures(sharedData) {
	if (!(sharedData instanceof Map))
		return sharedData;
	let typed = sharedData.get('typed') || [];
	if (Object.isFrozen(typed))
		typed = typed.map(structure => structure.slice(0));
	let named = sharedData.get('named');
	let transitions = Object.create(null);
	for (let i = 0, l = typed.length; i < l; i++) {
		let structure = typed[i];
		let transition = transitions;
		for (let [type, size, key] of structure) {
			let nextTransition = transition[key];
			if (!nextTransition) {
				transition[key] = nextTransition = {
					key,
					parent: transition,
					enumerationOffset: 0,
					ascii0: null,
					ascii8: null,
					num8: null,
					string16: null,
					object16: null,
					num32: null,
					float64: null,
					date64: null,
				};
			}
			transition = createTypeTransition(nextTransition, type, size);
		}
		transition[RECORD_SYMBOL] = i;
	}
	typed.transitions = transitions;
	this.typedStructs = typed;
	this.lastTypedStructuresLength = typed.length;
	return named;
}
var sourceSymbol = Symbol.for('source');
function readStruct(src, position, srcEnd, unpackr) {
	let recordId = src[position++] - 0x20;
	if (recordId >= 24) {
		switch(recordId) {
			case 24: recordId = src[position++]; break;
			// little endian:
			case 25: recordId = src[position++] + (src[position++] << 8); break;
			case 26: recordId = src[position++] + (src[position++] << 8) + (src[position++] << 16); break;
			case 27: recordId = src[position++] + (src[position++] << 8) + (src[position++] << 16) + (src[position++] << 24); break;
		}
	}
	let structure = unpackr.typedStructs && unpackr.typedStructs[recordId];
	if (!structure) {
		// copy src buffer because getStructures will override it
		src = Uint8Array.prototype.slice.call(src, position, srcEnd);
		srcEnd -= position;
		position = 0;
		unpackr._mergeStructures(unpackr.getStructures());
		if (!unpackr.typedStructs)
			throw new Error('Could not find any shared typed structures');
		unpackr.lastTypedStructuresLength = unpackr.typedStructs.length;
		structure = unpackr.typedStructs[recordId];
		if (!structure)
			throw new Error('Could not find typed structure ' + recordId);
	}
	var construct = structure.construct;
	if (!construct) {
		construct = structure.construct = function LazyObject() {
		};
		var prototype = construct.prototype;
		let properties = [];
		let currentOffset = 0;
		let lastRefProperty;
		for (let i = 0, l = structure.length; i < l; i++) {
			let definition = structure[i];
			let [ type, size, key, enumerationOffset ] = definition;
			if (key === '__proto__')
				key = '__proto_';
			let property = {
				key,
				offset: currentOffset,
			};
			if (enumerationOffset)
				properties.splice(i + enumerationOffset, 0, property);
			else
				properties.push(property);
			let getRef;
			switch(size) { // TODO: Move into a separate function
				case 0: getRef = () => 0; break;
				case 1:
					getRef = (source, position) => {
						let ref = source.bytes[position + property.offset];
						return ref >= 0xf6 ? toConstant(ref) : ref;
					};
					break;
				case 2:
					getRef = (source, position) => {
						let src = source.bytes;
						let dataView = src.dataView || (src.dataView = new DataView(src.buffer, src.byteOffset, src.byteLength));
						let ref = dataView.getUint16(position + property.offset, true);
						return ref >= 0xff00 ? toConstant(ref & 0xff) : ref;
					};
					break;
				case 4:
					getRef = (source, position) => {
						let src = source.bytes;
						let dataView = src.dataView || (src.dataView = new DataView(src.buffer, src.byteOffset, src.byteLength));
						let ref = dataView.getUint32(position + property.offset, true);
						return ref >= 0xffffff00 ? toConstant(ref & 0xff) : ref;
					};
					break;
			}
			property.getRef = getRef;
			currentOffset += size;
			let get;
			switch(type) {
				case ASCII:
					if (lastRefProperty && !lastRefProperty.next)
						lastRefProperty.next = property;
					lastRefProperty = property;
					property.multiGetCount = 0;
					get = function(source) {
						let src = source.bytes;
						let position = source.position;
						let refStart = currentOffset + position;
						let ref = getRef(source, position);
						if (typeof ref !== 'number') return ref;

						let end, next = property.next;
						while(next) {
							end = next.getRef(source, position);
							if (typeof end === 'number')
								break;
							else
								end = null;
							next = next.next;
						}
						if (end == null)
							end = source.bytesEnd - refStart;
						if (source.srcString) {
							return source.srcString.slice(ref, end);
						}
						/*if (property.multiGetCount > 0) {
							let asciiEnd;
							next = firstRefProperty;
							let dataView = src.dataView || (src.dataView = new DataView(src.buffer, src.byteOffset, src.byteLength));
							do {
								asciiEnd = dataView.getUint16(source.position + next.offset, true);
								if (asciiEnd < 0xff00)
									break;
								else
									asciiEnd = null;
							} while((next = next.next));
							if (asciiEnd == null)
								asciiEnd = source.bytesEnd - refStart
							source.srcString = src.toString('latin1', refStart, refStart + asciiEnd);
							return source.srcString.slice(ref, end);
						}
						if (source.prevStringGet) {
							source.prevStringGet.multiGetCount += 2;
						} else {
							source.prevStringGet = property;
							property.multiGetCount--;
						}*/
						return readString(src, ref + refStart, end - ref);
						//return src.toString('latin1', ref + refStart, end + refStart);
					};
					break;
				case UTF8: case OBJECT_DATA:
					if (lastRefProperty && !lastRefProperty.next)
						lastRefProperty.next = property;
					lastRefProperty = property;
					get = function(source) {
						let position = source.position;
						let refStart = currentOffset + position;
						let ref = getRef(source, position);
						if (typeof ref !== 'number') return ref;
						let src = source.bytes;
						let end, next = property.next;
						while(next) {
							end = next.getRef(source, position);
							if (typeof end === 'number')
								break;
							else
								end = null;
							next = next.next;
						}
						if (end == null)
							end = source.bytesEnd - refStart;
						if (type === UTF8) {
							return src.toString('utf8', ref + refStart, end + refStart);
						} else {
							currentSource = source;
							try {
								return unpackr.unpack(src, { start: ref + refStart, end: end + refStart });
							} finally {
								currentSource = null;
							}
						}
					};
					break;
				case NUMBER:
					switch(size) {
						case 4:
							get = function (source) {
								let src = source.bytes;
								let dataView = src.dataView || (src.dataView = new DataView(src.buffer, src.byteOffset, src.byteLength));
								let position = source.position + property.offset;
								let value = dataView.getInt32(position, true);
								if (value < 0x20000000) {
									if (value > -0x1f000000)
										return value;
									if (value > -0x20000000)
										return toConstant(value & 0xff);
								}
								let fValue = dataView.getFloat32(position, true);
								// this does rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
								let multiplier = mult10[((src[position + 3] & 0x7f) << 1) | (src[position + 2] >> 7)];
								return ((multiplier * fValue + (fValue > 0 ? 0.5 : -0.5)) >> 0) / multiplier;
							};
							break;
						case 8:
							get = function (source) {
								let src = source.bytes;
								let dataView = src.dataView || (src.dataView = new DataView(src.buffer, src.byteOffset, src.byteLength));
								let value = dataView.getFloat64(source.position + property.offset, true);
								if (isNaN(value)) {
									let byte = src[source.position + property.offset];
									if (byte >= 0xf6)
										return toConstant(byte);
								}
								return value;
							};
							break;
						case 1:
							get = function (source) {
								let src = source.bytes;
								let value = src[source.position + property.offset];
								return value < 0xf6 ? value : toConstant(value);
							};
							break;
					}
					break;
				case DATE:
					get = function (source) {
						let src = source.bytes;
						let dataView = src.dataView || (src.dataView = new DataView(src.buffer, src.byteOffset, src.byteLength));
						return new Date(dataView.getFloat64(source.position + property.offset, true));
					};
					break;

			}
			property.get = get;
		}
		// TODO: load the srcString for faster string decoding on toJSON
		if (evalSupported) {
			let objectLiteralProperties = [];
			let args = [];
			let i = 0;
			let hasInheritedProperties;
			for (let property of properties) { // assign in enumeration order
				if (unpackr.alwaysLazyProperty && unpackr.alwaysLazyProperty(property.key)) {
					// these properties are not eagerly evaluated and this can be used for creating properties
					// that are not serialized as JSON
					hasInheritedProperties = true;
					continue;
				}
				Object.defineProperty(prototype, property.key, { get: withSource(property.get), enumerable: true });
				let valueFunction = 'v' + i++;
				args.push(valueFunction);
				objectLiteralProperties.push('[' + JSON.stringify(property.key) + ']:' + valueFunction + '(s)');
			}
			if (hasInheritedProperties) {
				objectLiteralProperties.push('__proto__:this');
			}
			let toObject = (new Function(...args, 'return function(s){return{' + objectLiteralProperties.join(',') + '}}')).apply(null, properties.map(prop => prop.get));
			Object.defineProperty(prototype, 'toJSON', {
				value(omitUnderscoredProperties) {
					return toObject.call(this, this[sourceSymbol]);
				}
			});
		} else {
			Object.defineProperty(prototype, 'toJSON', {
				value(omitUnderscoredProperties) {
					// return an enumerable object with own properties to JSON stringify
					let resolved = {};
					for (let i = 0, l = properties.length; i < l; i++) {
						// TODO: check alwaysLazyProperty
						let key = properties[i].key;

						resolved[key] = this[key];
					}
					return resolved;
				},
				// not enumerable or anything
			});
		}
	}
	var instance = new construct();
	instance[sourceSymbol] = {
		bytes: src,
		position,
		srcString: '',
		bytesEnd: srcEnd
	};
	return instance;
}
function toConstant(code) {
	switch(code) {
		case 0xf6: return null;
		case 0xf7: return undefined;
		case 0xf8: return false;
		case 0xf9: return true;
	}
	throw new Error('Unknown constant');
}
function withSource(get) {
	return function() {
		return get(this[sourceSymbol]);
	}
}

function saveState() {
	if (currentSource) {
		currentSource.bytes = Uint8Array.prototype.slice.call(currentSource.bytes, currentSource.position, currentSource.bytesEnd);
		currentSource.position = 0;
		currentSource.bytesEnd = currentSource.bytes.length;
	}
}
function prepareStructures(structures, packr) {
	if (packr.typedStructs) {
		let structMap = new Map();
		structMap.set('named', structures);
		structMap.set('typed', packr.typedStructs);
		structures = structMap;
	}
	let lastTypedStructuresLength = packr.lastTypedStructuresLength || 0;
	structures.isCompatible = existing => {
		let compatible = true;
		if (existing instanceof Map) {
			let named = existing.get('named') || [];
			if (named.length !== (packr.lastNamedStructuresLength || 0))
				compatible = false;
			let typed = existing.get('typed') || [];
			if (typed.length !== lastTypedStructuresLength)
				compatible = false;
		} else if (existing instanceof Array || Array.isArray(existing)) {
			if (existing.length !== (packr.lastNamedStructuresLength || 0))
				compatible = false;
		}
		if (!compatible)
			packr._mergeStructures(existing);
		return compatible;
	};
	packr.lastTypedStructuresLength = packr.typedStructs && packr.typedStructs.length;
	return structures;
}

setReadStruct(readStruct, onLoadedStructures, saveState);

const nativeAccelerationDisabled = process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED !== undefined && process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED.toLowerCase() === 'true';

if (!nativeAccelerationDisabled) {
	let extractor;
	try {
		if (typeof require == 'function')
			extractor = require('msgpackr-extract');
		else
			extractor = createRequire(import.meta.url)('msgpackr-extract');
		if (extractor)
			setExtractor(extractor.extractStrings);
	} catch (error) {
		// native module is optional
	}
}

// export const SWITCH_TO_STRUCTURE = 193; (easily collides with DELETE_AND_ADD + fieldIndex = 2)
const SWITCH_TO_STRUCTURE = 255; // (decoding collides with DELETE_AND_ADD + fieldIndex = 63)
const TYPE_ID = 213;
/**
 * Encoding Schema field operations.
 */
var OPERATION;
(function (OPERATION) {
    // add new structure/primitive
    OPERATION[OPERATION["ADD"] = 128] = "ADD";
    // replace structure/primitive
    OPERATION[OPERATION["REPLACE"] = 0] = "REPLACE";
    // delete field
    OPERATION[OPERATION["DELETE"] = 64] = "DELETE";
    // DELETE field, followed by an ADD
    OPERATION[OPERATION["DELETE_AND_ADD"] = 192] = "DELETE_AND_ADD";
    // TOUCH is used to determine hierarchy of nested Schema structures during serialization.
    // touches are NOT encoded.
    OPERATION[OPERATION["TOUCH"] = 1] = "TOUCH";
    // MapSchema Operations
    OPERATION[OPERATION["CLEAR"] = 10] = "CLEAR";
})(OPERATION || (OPERATION = {}));
// export enum OPERATION {
//     // add new structure/primitive
//     // (128)
//     ADD = 128, // 10000000,
//     // replace structure/primitive
//     REPLACE = 1,// 00000001
//     // delete field
//     DELETE = 192, // 11000000
//     // DELETE field, followed by an ADD
//     DELETE_AND_ADD = 224, // 11100000
//     // TOUCH is used to determine hierarchy of nested Schema structures during serialization.
//     // touches are NOT encoded.
//     TOUCH = 0, // 00000000
//     // MapSchema Operations
//     CLEAR = 10,
// }

class ChangeTree {
    ref;
    refId;
    root;
    parent;
    parentIndex;
    indexes;
    changed = false;
    changes = new Map();
    allChanges = new Set();
    // cached indexes for filtering
    caches = {};
    currentCustomOperation = 0;
    constructor(ref, parent, root) {
        this.ref = ref;
        this.setParent(parent, root);
    }
    setParent(parent, root, parentIndex) {
        if (!this.indexes) {
            this.indexes = (this.ref instanceof Schema)
                ? this.ref['_definition'].indexes
                : {};
        }
        this.parent = parent;
        this.parentIndex = parentIndex;
        // avoid setting parents with empty `root`
        if (!root) {
            return;
        }
        this.root = root;
        //
        // assign same parent on child structures
        //
        if (this.ref instanceof Schema) {
            const definition = this.ref['_definition'];
            for (let field in definition.schema) {
                const value = this.ref[field];
                if (value && value['$changes']) {
                    const parentIndex = definition.indexes[field];
                    value['$changes'].setParent(this.ref, root, parentIndex);
                }
            }
        }
        else if (typeof (this.ref) === "object") {
            this.ref.forEach((value, key) => {
                if (value instanceof Schema) {
                    const changeTreee = value['$changes'];
                    const parentIndex = this.ref['$changes'].indexes[key];
                    changeTreee.setParent(this.ref, this.root, parentIndex);
                }
            });
        }
    }
    operation(op) {
        this.changes.set(--this.currentCustomOperation, op);
    }
    change(fieldName, operation = OPERATION.ADD) {
        const index = (typeof (fieldName) === "number")
            ? fieldName
            : this.indexes[fieldName];
        this.assertValidIndex(index, fieldName);
        const previousChange = this.changes.get(index);
        if (!previousChange ||
            previousChange.op === OPERATION.DELETE ||
            previousChange.op === OPERATION.TOUCH // (mazmorra.io's BattleAction issue)
        ) {
            this.changes.set(index, {
                op: (!previousChange)
                    ? operation
                    : (previousChange.op === OPERATION.DELETE)
                        ? OPERATION.DELETE_AND_ADD
                        : operation,
                // : OPERATION.REPLACE,
                index
            });
        }
        this.allChanges.add(index);
        this.changed = true;
        this.touchParents();
    }
    touch(fieldName) {
        const index = (typeof (fieldName) === "number")
            ? fieldName
            : this.indexes[fieldName];
        this.assertValidIndex(index, fieldName);
        if (!this.changes.has(index)) {
            this.changes.set(index, { op: OPERATION.TOUCH, index });
        }
        this.allChanges.add(index);
        // ensure touch is placed until the $root is found.
        this.touchParents();
    }
    touchParents() {
        if (this.parent) {
            this.parent['$changes'].touch(this.parentIndex);
        }
    }
    getType(index) {
        if (this.ref['_definition']) {
            const definition = this.ref['_definition'];
            return definition.schema[definition.fieldsByIndex[index]];
        }
        else {
            const definition = this.parent['_definition'];
            const parentType = definition.schema[definition.fieldsByIndex[this.parentIndex]];
            //
            // Get the child type from parent structure.
            // - ["string"] => "string"
            // - { map: "string" } => "string"
            // - { set: "string" } => "string"
            //
            return Object.values(parentType)[0];
        }
    }
    getChildrenFilter() {
        const childFilters = this.parent['_definition'].childFilters;
        return childFilters && childFilters[this.parentIndex];
    }
    //
    // used during `.encode()`
    //
    getValue(index) {
        return this.ref['getByIndex'](index);
    }
    delete(fieldName) {
        const index = (typeof (fieldName) === "number")
            ? fieldName
            : this.indexes[fieldName];
        if (index === undefined) {
            console.warn(`@colyseus/schema ${this.ref.constructor.name}: trying to delete non-existing index: ${fieldName} (${index})`);
            return;
        }
        const previousValue = this.getValue(index);
        // console.log("$changes.delete =>", { fieldName, index, previousValue });
        this.changes.set(index, { op: OPERATION.DELETE, index });
        this.allChanges.delete(index);
        // delete cache
        delete this.caches[index];
        // remove `root` reference
        if (previousValue && previousValue['$changes']) {
            previousValue['$changes'].parent = undefined;
        }
        this.changed = true;
        this.touchParents();
    }
    discard(changed = false, discardAll = false) {
        //
        // Map, Array, etc:
        // Remove cached key to ensure ADD operations is unsed instead of
        // REPLACE in case same key is used on next patches.
        //
        // TODO: refactor this. this is not relevant for Collection and Set.
        //
        if (!(this.ref instanceof Schema)) {
            this.changes.forEach((change) => {
                if (change.op === OPERATION.DELETE) {
                    const index = this.ref['getIndex'](change.index);
                    delete this.indexes[index];
                }
            });
        }
        this.changes.clear();
        this.changed = changed;
        if (discardAll) {
            this.allChanges.clear();
        }
        // re-set `currentCustomOperation`
        this.currentCustomOperation = 0;
    }
    /**
     * Recursively discard all changes from this, and child structures.
     */
    discardAll() {
        this.changes.forEach((change) => {
            const value = this.getValue(change.index);
            if (value && value['$changes']) {
                value['$changes'].discardAll();
            }
        });
        this.discard();
    }
    // cache(field: number, beginIndex: number, endIndex: number) {
    cache(field, cachedBytes) {
        this.caches[field] = cachedBytes;
    }
    clone() {
        return new ChangeTree(this.ref, this.parent, this.root);
    }
    ensureRefId() {
        // skip if refId is already set.
        if (this.refId !== undefined) {
            return;
        }
        this.refId = this.root.getNextUniqueId();
    }
    assertValidIndex(index, fieldName) {
        if (index === undefined) {
            throw new Error(`ChangeTree: missing index for field "${fieldName}"`);
        }
    }
}

function addCallback($callbacks, op, callback, existing) {
    // initialize list of callbacks
    if (!$callbacks[op]) {
        $callbacks[op] = [];
    }
    $callbacks[op].push(callback);
    //
    // Trigger callback for existing elements
    // - OPERATION.ADD
    // - OPERATION.REPLACE
    //
    existing?.forEach((item, key) => callback(item, key));
    return () => spliceOne$1($callbacks[op], $callbacks[op].indexOf(callback));
}
function removeChildRefs(changes) {
    const needRemoveRef = (typeof (this.$changes.getType()) !== "string");
    this.$items.forEach((item, key) => {
        changes.push({
            refId: this.$changes.refId,
            op: OPERATION.DELETE,
            field: key,
            value: undefined,
            previousValue: item
        });
        if (needRemoveRef) {
            this.$changes.root.removeRef(item['$changes'].refId);
        }
    });
}
function spliceOne$1(arr, index) {
    // manually splice an array
    if (index === -1 || index >= arr.length) {
        return false;
    }
    const len = arr.length - 1;
    for (let i = index; i < len; i++) {
        arr[i] = arr[i + 1];
    }
    arr.length = len;
    return true;
}

const DEFAULT_SORT = (a, b) => {
    const A = a.toString();
    const B = b.toString();
    if (A < B)
        return -1;
    else if (A > B)
        return 1;
    else
        return 0;
};
function getArrayProxy(value) {
    value['$proxy'] = true;
    //
    // compatibility with @colyseus/schema 0.5.x
    // - allow `map["key"]`
    // - allow `map["key"] = "xxx"`
    // - allow `delete map["key"]`
    //
    value = new Proxy(value, {
        get: (obj, prop) => {
            if (typeof (prop) !== "symbol" &&
                !isNaN(prop) // https://stackoverflow.com/a/175787/892698
            ) {
                return obj.at(prop);
            }
            else {
                return obj[prop];
            }
        },
        set: (obj, prop, setValue) => {
            if (typeof (prop) !== "symbol" &&
                !isNaN(prop)) {
                const indexes = Array.from(obj['$items'].keys());
                const key = parseInt(indexes[prop] || prop);
                if (setValue === undefined || setValue === null) {
                    obj.deleteAt(key);
                }
                else {
                    obj.setAt(key, setValue);
                }
            }
            else {
                obj[prop] = setValue;
            }
            return true;
        },
        deleteProperty: (obj, prop) => {
            if (typeof (prop) === "number") {
                obj.deleteAt(prop);
            }
            else {
                delete obj[prop];
            }
            return true;
        },
        has: (obj, key) => {
            if (typeof (key) !== "symbol" &&
                !isNaN(Number(key))) {
                return obj['$items'].has(Number(key));
            }
            return Reflect.has(obj, key);
        }
    });
    return value;
}
class ArraySchema {
    $changes = new ChangeTree(this);
    $items = new Map();
    $indexes = new Map();
    $refId = 0;
    //
    // Decoding callbacks
    //
    $callbacks;
    onAdd(callback, triggerAll = true) {
        return addCallback((this.$callbacks || (this.$callbacks = {})), OPERATION.ADD, callback, (triggerAll)
            ? this.$items
            : undefined);
    }
    onRemove(callback) { return addCallback(this.$callbacks || (this.$callbacks = {}), OPERATION.DELETE, callback); }
    onChange(callback) { return addCallback(this.$callbacks || (this.$callbacks = {}), OPERATION.REPLACE, callback); }
    static is(type) {
        return (
        // type format: ["string"]
        Array.isArray(type) ||
            // type format: { array: "string" }
            (type['array'] !== undefined));
    }
    constructor(...items) {
        this.push.apply(this, items);
    }
    set length(value) {
        if (value === 0) {
            this.clear();
        }
        else {
            this.splice(value, this.length - value);
        }
    }
    get length() {
        return this.$items.size;
    }
    push(...values) {
        let lastIndex;
        values.forEach(value => {
            // set "index" for reference.
            lastIndex = this.$refId++;
            this.setAt(lastIndex, value);
        });
        return lastIndex;
    }
    /**
     * Removes the last element from an array and returns it.
     */
    pop() {
        const key = Array.from(this.$indexes.values()).pop();
        if (key === undefined) {
            return undefined;
        }
        this.$changes.delete(key);
        this.$indexes.delete(key);
        const value = this.$items.get(key);
        this.$items.delete(key);
        return value;
    }
    at(index) {
        //
        // FIXME: this should be O(1)
        //
        const key = Array.from(this.$items.keys())[index];
        return this.$items.get(key);
    }
    setAt(index, value) {
        if (value === undefined || value === null) {
            console.error("ArraySchema items cannot be null nor undefined; Use `deleteAt(index)` instead.");
            return;
        }
        // skip if the value is the same as cached.
        if (this.$items.get(index) === value) {
            return;
        }
        if (value['$changes'] !== undefined) {
            value['$changes'].setParent(this, this.$changes.root, index);
        }
        const operation = this.$changes.indexes[index]?.op ?? OPERATION.ADD;
        this.$changes.indexes[index] = index;
        this.$indexes.set(index, index);
        this.$items.set(index, value);
        this.$changes.change(index, operation);
    }
    deleteAt(index) {
        const key = Array.from(this.$items.keys())[index];
        if (key === undefined) {
            return false;
        }
        return this.$deleteAt(key);
    }
    $deleteAt(index) {
        // delete at internal index
        this.$changes.delete(index);
        this.$indexes.delete(index);
        return this.$items.delete(index);
    }
    clear(changes) {
        // discard previous operations.
        this.$changes.discard(true, true);
        this.$changes.indexes = {};
        // clear previous indexes
        this.$indexes.clear();
        //
        // When decoding:
        // - enqueue items for DELETE callback.
        // - flag child items for garbage collection.
        //
        if (changes) {
            removeChildRefs.call(this, changes);
        }
        // clear items
        this.$items.clear();
        this.$changes.operation({ index: 0, op: OPERATION.CLEAR });
        // touch all structures until reach root
        this.$changes.touchParents();
    }
    /**
     * Combines two or more arrays.
     * @param items Additional items to add to the end of array1.
     */
    // @ts-ignore
    concat(...items) {
        return new ArraySchema(...Array.from(this.$items.values()).concat(...items));
    }
    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator) {
        return Array.from(this.$items.values()).join(separator);
    }
    /**
     * Reverses the elements in an Array.
     */
    // @ts-ignore
    reverse() {
        const indexes = Array.from(this.$items.keys());
        const reversedItems = Array.from(this.$items.values()).reverse();
        reversedItems.forEach((item, i) => {
            this.setAt(indexes[i], item);
        });
        return this;
    }
    /**
     * Removes the first element from an array and returns it.
     */
    shift() {
        const indexes = Array.from(this.$items.keys());
        const shiftAt = indexes.shift();
        if (shiftAt === undefined) {
            return undefined;
        }
        const value = this.$items.get(shiftAt);
        this.$deleteAt(shiftAt);
        return value;
    }
    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start, end) {
        const sliced = new ArraySchema();
        sliced.push(...Array.from(this.$items.values()).slice(start, end));
        return sliced;
    }
    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn = DEFAULT_SORT) {
        const indexes = Array.from(this.$items.keys());
        const sortedItems = Array.from(this.$items.values()).sort(compareFn);
        sortedItems.forEach((item, i) => {
            this.setAt(indexes[i], item);
        });
        return this;
    }
    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items Elements to insert into the array in place of the deleted elements.
     */
    splice(start, deleteCount = this.length - start, ...items) {
        const indexes = Array.from(this.$items.keys());
        const removedItems = [];
        for (let i = start; i < start + deleteCount; i++) {
            removedItems.push(this.$items.get(indexes[i]));
            this.$deleteAt(indexes[i]);
        }
        for (let i = 0; i < items.length; i++) {
            this.setAt(start + i, items[i]);
        }
        return removedItems;
    }
    /**
     * Inserts new elements at the start of an array.
     * @param items  Elements to insert at the start of the Array.
     */
    unshift(...items) {
        const length = this.length;
        const addedLength = items.length;
        // const indexes = Array.from(this.$items.keys());
        const previousValues = Array.from(this.$items.values());
        items.forEach((item, i) => {
            this.setAt(i, item);
        });
        previousValues.forEach((previousValue, i) => {
            this.setAt(addedLength + i, previousValue);
        });
        return length + addedLength;
    }
    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
     */
    indexOf(searchElement, fromIndex) {
        return Array.from(this.$items.values()).indexOf(searchElement, fromIndex);
    }
    /**
     * Returns the index of the last occurrence of a specified value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
     */
    lastIndexOf(searchElement, fromIndex = this.length - 1) {
        return Array.from(this.$items.values()).lastIndexOf(searchElement, fromIndex);
    }
    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param callbackfn A function that accepts up to three arguments. The every method calls
     * the callbackfn function for each element in the array until the callbackfn returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(callbackfn, thisArg) {
        return Array.from(this.$items.values()).every(callbackfn, thisArg);
    }
    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param callbackfn A function that accepts up to three arguments. The some method calls
     * the callbackfn function for each element in the array until the callbackfn returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(callbackfn, thisArg) {
        return Array.from(this.$items.values()).some(callbackfn, thisArg);
    }
    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn, thisArg) {
        Array.from(this.$items.values()).forEach(callbackfn, thisArg);
    }
    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn, thisArg) {
        return Array.from(this.$items.values()).map(callbackfn, thisArg);
    }
    filter(callbackfn, thisArg) {
        return Array.from(this.$items.values()).filter(callbackfn, thisArg);
    }
    /**
     * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduce(callbackfn, initialValue) {
        return Array.prototype.reduce.apply(Array.from(this.$items.values()), arguments);
    }
    /**
     * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduceRight(callbackfn, initialValue) {
        return Array.prototype.reduceRight.apply(Array.from(this.$items.values()), arguments);
    }
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate, thisArg) {
        return Array.from(this.$items.values()).find(predicate, thisArg);
    }
    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate, thisArg) {
        return Array.from(this.$items.values()).findIndex(predicate, thisArg);
    }
    /**
     * Returns the this object after filling the section identified by start and end with value
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value, start, end) {
        //
        // TODO
        //
        throw new Error("ArraySchema#fill() not implemented");
    }
    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target, start, end) {
        //
        // TODO
        //
        throw new Error("ArraySchema#copyWithin() not implemented");
    }
    /**
     * Returns a string representation of an array.
     */
    toString() { return this.$items.toString(); }
    /**
     * Returns a string representation of an array. The elements are converted to string using their toLocalString methods.
     */
    toLocaleString() { return this.$items.toLocaleString(); }
    ;
    /** Iterator */
    [Symbol.iterator]() {
        return Array.from(this.$items.values())[Symbol.iterator]();
    }
    static get [Symbol.species]() {
        return ArraySchema;
    }
    // WORKAROUND for compatibility
    // - TypeScript 4 defines @@unscopables as a function
    // - TypeScript 5 defines @@unscopables as an object
    [Symbol.unscopables];
    /**
     * Returns an iterable of key, value pairs for every entry in the array
     */
    entries() { return this.$items.entries(); }
    /**
     * Returns an iterable of keys in the array
     */
    keys() { return this.$items.keys(); }
    /**
     * Returns an iterable of values in the array
     */
    values() { return this.$items.values(); }
    /**
     * Determines whether an array includes a certain element, returning true or false as appropriate.
     * @param searchElement The element to search for.
     * @param fromIndex The position in this array at which to begin searching for searchElement.
     */
    includes(searchElement, fromIndex) {
        return Array.from(this.$items.values()).includes(searchElement, fromIndex);
    }
    //
    // ES2022
    //
    /**
     * Calls a defined callback function on each element of an array. Then, flattens the result into
     * a new array.
     * This is identical to a map followed by flat with depth 1.
     *
     * @param callback A function that accepts up to three arguments. The flatMap method calls the
     * callback function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callback function. If
     * thisArg is omitted, undefined is used as the this value.
     */
    // @ts-ignore
    flatMap(callback, thisArg) {
        // @ts-ignore
        throw new Error("ArraySchema#flatMap() is not supported.");
    }
    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the
     * specified depth.
     *
     * @param depth The maximum recursion depth
     */
    // @ts-ignore
    flat(depth) {
        throw new Error("ArraySchema#flat() is not supported.");
    }
    findLast() {
        const arr = Array.from(this.$items.values());
        // @ts-ignore
        return arr.findLast.apply(arr, arguments);
    }
    findLastIndex(...args) {
        const arr = Array.from(this.$items.values());
        // @ts-ignore
        return arr.findLastIndex.apply(arr, arguments);
    }
    //
    // ES2023
    //
    with(index, value) {
        const copy = Array.from(this.$items.values());
        copy[index] = value;
        return new ArraySchema(...copy);
    }
    toReversed() {
        return Array.from(this.$items.values()).reverse();
    }
    toSorted(compareFn) {
        return Array.from(this.$items.values()).sort(compareFn);
    }
    // @ts-ignore
    toSpliced(start, deleteCount, ...items) {
        const copy = Array.from(this.$items.values());
        // @ts-ignore
        return copy.toSpliced.apply(copy, arguments);
    }
    setIndex(index, key) {
        this.$indexes.set(index, key);
    }
    getIndex(index) {
        return this.$indexes.get(index);
    }
    getByIndex(index) {
        return this.$items.get(this.$indexes.get(index));
    }
    deleteByIndex(index) {
        const key = this.$indexes.get(index);
        this.$items.delete(key);
        this.$indexes.delete(index);
    }
    toArray() {
        return Array.from(this.$items.values());
    }
    toJSON() {
        return this.toArray().map((value) => {
            return (typeof (value['toJSON']) === "function")
                ? value['toJSON']()
                : value;
        });
    }
    //
    // Decoding utilities
    //
    clone(isDecoding) {
        let cloned;
        if (isDecoding) {
            cloned = new ArraySchema(...Array.from(this.$items.values()));
        }
        else {
            cloned = new ArraySchema(...this.map(item => ((item['$changes'])
                ? item.clone()
                : item)));
        }
        return cloned;
    }
    ;
}

function getMapProxy(value) {
    value['$proxy'] = true;
    value = new Proxy(value, {
        get: (obj, prop) => {
            if (typeof (prop) !== "symbol" && // accessing properties
                typeof (obj[prop]) === "undefined") {
                return obj.get(prop);
            }
            else {
                return obj[prop];
            }
        },
        set: (obj, prop, setValue) => {
            if (typeof (prop) !== "symbol" &&
                (prop.indexOf("$") === -1 &&
                    prop !== "onAdd" &&
                    prop !== "onRemove" &&
                    prop !== "onChange")) {
                obj.set(prop, setValue);
            }
            else {
                obj[prop] = setValue;
            }
            return true;
        },
        deleteProperty: (obj, prop) => {
            obj.delete(prop);
            return true;
        },
    });
    return value;
}
class MapSchema {
    $changes = new ChangeTree(this);
    $items = new Map();
    $indexes = new Map();
    $refId = 0;
    //
    // Decoding callbacks
    //
    $callbacks;
    onAdd(callback, triggerAll = true) {
        return addCallback((this.$callbacks || (this.$callbacks = {})), OPERATION.ADD, callback, (triggerAll)
            ? this.$items
            : undefined);
    }
    onRemove(callback) { return addCallback(this.$callbacks || (this.$callbacks = {}), OPERATION.DELETE, callback); }
    onChange(callback) { return addCallback(this.$callbacks || (this.$callbacks = {}), OPERATION.REPLACE, callback); }
    static is(type) {
        return type['map'] !== undefined;
    }
    constructor(initialValues) {
        if (initialValues) {
            if (initialValues instanceof Map ||
                initialValues instanceof MapSchema) {
                initialValues.forEach((v, k) => this.set(k, v));
            }
            else {
                for (const k in initialValues) {
                    this.set(k, initialValues[k]);
                }
            }
        }
    }
    /** Iterator */
    [Symbol.iterator]() { return this.$items[Symbol.iterator](); }
    get [Symbol.toStringTag]() { return this.$items[Symbol.toStringTag]; }
    static get [Symbol.species]() {
        return MapSchema;
    }
    set(key, value) {
        if (value === undefined || value === null) {
            throw new Error(`MapSchema#set('${key}', ${value}): trying to set ${value} value on '${key}'.`);
        }
        // Force "key" as string
        // See: https://github.com/colyseus/colyseus/issues/561#issuecomment-1646733468
        key = key.toString();
        // get "index" for this value.
        const hasIndex = typeof (this.$changes.indexes[key]) !== "undefined";
        const index = (hasIndex)
            ? this.$changes.indexes[key]
            : this.$refId++;
        let operation = (hasIndex)
            ? OPERATION.REPLACE
            : OPERATION.ADD;
        const isRef = (value['$changes']) !== undefined;
        if (isRef) {
            value['$changes'].setParent(this, this.$changes.root, index);
        }
        //
        // (encoding)
        // set a unique id to relate directly with this key/value.
        //
        if (!hasIndex) {
            this.$changes.indexes[key] = index;
            this.$indexes.set(index, key);
        }
        else if (!isRef &&
            this.$items.get(key) === value) {
            // if value is the same, avoid re-encoding it.
            return;
        }
        else if (isRef && // if is schema, force ADD operation if value differ from previous one.
            this.$items.get(key) !== value) {
            operation = OPERATION.ADD;
        }
        this.$items.set(key, value);
        this.$changes.change(key, operation);
        return this;
    }
    get(key) {
        return this.$items.get(key);
    }
    delete(key) {
        //
        // TODO: add a "purge" method after .encode() runs, to cleanup removed `$indexes`
        //
        // We don't remove $indexes to allow setting the same key in the same patch
        // (See "should allow to remove and set an item in the same place" test)
        //
        // // const index = this.$changes.indexes[key];
        // // this.$indexes.delete(index);
        this.$changes.delete(key.toString());
        return this.$items.delete(key);
    }
    clear(changes) {
        // discard previous operations.
        this.$changes.discard(true, true);
        this.$changes.indexes = {};
        // clear previous indexes
        this.$indexes.clear();
        //
        // When decoding:
        // - enqueue items for DELETE callback.
        // - flag child items for garbage collection.
        //
        if (changes) {
            removeChildRefs.call(this, changes);
        }
        // clear items
        this.$items.clear();
        this.$changes.operation({ index: 0, op: OPERATION.CLEAR });
        // touch all structures until reach root
        this.$changes.touchParents();
    }
    has(key) {
        return this.$items.has(key);
    }
    forEach(callbackfn) {
        this.$items.forEach(callbackfn);
    }
    entries() {
        return this.$items.entries();
    }
    keys() {
        return this.$items.keys();
    }
    values() {
        return this.$items.values();
    }
    get size() {
        return this.$items.size;
    }
    setIndex(index, key) {
        this.$indexes.set(index, key);
    }
    getIndex(index) {
        return this.$indexes.get(index);
    }
    getByIndex(index) {
        return this.$items.get(this.$indexes.get(index));
    }
    deleteByIndex(index) {
        const key = this.$indexes.get(index);
        this.$items.delete(key);
        this.$indexes.delete(index);
    }
    toJSON() {
        const map = {};
        this.forEach((value, key) => {
            map[key] = (typeof (value['toJSON']) === "function")
                ? value['toJSON']()
                : value;
        });
        return map;
    }
    //
    // Decoding utilities
    //
    clone(isDecoding) {
        let cloned;
        if (isDecoding) {
            // client-side
            cloned = Object.assign(new MapSchema(), this);
        }
        else {
            // server-side
            cloned = new MapSchema();
            this.forEach((value, key) => {
                if (value['$changes']) {
                    cloned.set(key, value['clone']());
                }
                else {
                    cloned.set(key, value);
                }
            });
        }
        return cloned;
    }
}

const registeredTypes = {};
function registerType(identifier, definition) {
    registeredTypes[identifier] = definition;
}
function getType(identifier) {
    return registeredTypes[identifier];
}

class SchemaDefinition {
    schema;
    //
    // TODO: use a "field" structure combining all these properties per-field.
    //
    indexes = {};
    fieldsByIndex = {};
    filters;
    indexesWithFilters;
    childFilters; // childFilters are used on Map, Array, Set items.
    deprecated = {};
    descriptors = {};
    static create(parent) {
        const definition = new SchemaDefinition();
        // support inheritance
        definition.schema = Object.assign({}, parent && parent.schema || {});
        definition.indexes = Object.assign({}, parent && parent.indexes || {});
        definition.fieldsByIndex = Object.assign({}, parent && parent.fieldsByIndex || {});
        definition.descriptors = Object.assign({}, parent && parent.descriptors || {});
        definition.deprecated = Object.assign({}, parent && parent.deprecated || {});
        return definition;
    }
    addField(field, type) {
        const index = this.getNextFieldIndex();
        this.fieldsByIndex[index] = field;
        this.indexes[field] = index;
        this.schema[field] = (Array.isArray(type))
            ? { array: type[0] }
            : type;
    }
    hasField(field) {
        return this.indexes[field] !== undefined;
    }
    addFilter(field, cb) {
        if (!this.filters) {
            this.filters = {};
            this.indexesWithFilters = [];
        }
        this.filters[this.indexes[field]] = cb;
        this.indexesWithFilters.push(this.indexes[field]);
        return true;
    }
    addChildrenFilter(field, cb) {
        const index = this.indexes[field];
        const type = this.schema[field];
        if (getType(Object.keys(type)[0])) {
            if (!this.childFilters) {
                this.childFilters = {};
            }
            this.childFilters[index] = cb;
            return true;
        }
        else {
            console.warn(`@filterChildren: field '${field}' can't have children. Ignoring filter.`);
        }
    }
    getChildrenFilter(field) {
        return this.childFilters && this.childFilters[this.indexes[field]];
    }
    getNextFieldIndex() {
        return Object.keys(this.schema || {}).length;
    }
}
function hasFilter(klass) {
    return klass._context && klass._context.useFilters;
}
class Context {
    types = {};
    schemas = new Map();
    useFilters = false;
    has(schema) {
        return this.schemas.has(schema);
    }
    get(typeid) {
        return this.types[typeid];
    }
    add(schema, typeid = this.schemas.size) {
        // FIXME: move this to somewhere else?
        // support inheritance
        schema._definition = SchemaDefinition.create(schema._definition);
        schema._typeid = typeid;
        this.types[typeid] = schema;
        this.schemas.set(schema, typeid);
    }
    static create(options = {}) {
        return function (definition) {
            if (!options.context) {
                options.context = new Context();
            }
            return type(definition, options);
        };
    }
}
const globalContext = new Context();
/**
 * [See documentation](https://docs.colyseus.io/state/schema/)
 *
 * Annotate a Schema property to be serializeable.
 * \@type()'d fields are automatically flagged as "dirty" for the next patch.
 *
 * @example Standard usage, with automatic change tracking.
 * ```
 * \@type("string") propertyName: string;
 * ```
 *
 * @example You can provide the "manual" option if you'd like to manually control your patches via .setDirty().
 * ```
 * \@type("string", { manual: true })
 * ```
 */
function type(type, options = {}) {
    return function (target, field) {
        const context = options.context || globalContext;
        const constructor = target.constructor;
        constructor._context = context;
        if (!type) {
            throw new Error(`${constructor.name}: @type() reference provided for "${field}" is undefined. Make sure you don't have any circular dependencies.`);
        }
        /*
         * static schema
         */
        if (!context.has(constructor)) {
            context.add(constructor);
        }
        const definition = constructor._definition;
        definition.addField(field, type);
        /**
         * skip if descriptor already exists for this field (`@deprecated()`)
         */
        if (definition.descriptors[field]) {
            if (definition.deprecated[field]) {
                // do not create accessors for deprecated properties.
                return;
            }
            else {
                // trying to define same property multiple times across inheritance.
                // https://github.com/colyseus/colyseus-unity3d/issues/131#issuecomment-814308572
                try {
                    throw new Error(`@colyseus/schema: Duplicate '${field}' definition on '${constructor.name}'.\nCheck @type() annotation`);
                }
                catch (e) {
                    const definitionAtLine = e.stack.split("\n")[4].trim();
                    throw new Error(`${e.message} ${definitionAtLine}`);
                }
            }
        }
        const isArray = ArraySchema.is(type);
        const isMap = !isArray && MapSchema.is(type);
        // TODO: refactor me.
        // Allow abstract intermediary classes with no fields to be serialized
        // (See "should support an inheritance with a Schema type without fields" test)
        if (typeof (type) !== "string" && !Schema.is(type)) {
            const childType = Object.values(type)[0];
            if (typeof (childType) !== "string" && !context.has(childType)) {
                context.add(childType);
            }
        }
        if (options.manual) {
            // do not declare getter/setter descriptor
            definition.descriptors[field] = {
                enumerable: true,
                configurable: true,
                writable: true,
            };
            return;
        }
        const fieldCached = `_${field}`;
        definition.descriptors[fieldCached] = {
            enumerable: false,
            configurable: false,
            writable: true,
        };
        definition.descriptors[field] = {
            get: function () {
                return this[fieldCached];
            },
            set: function (value) {
                /**
                 * Create Proxy for array or map items
                 */
                // skip if value is the same as cached.
                if (value === this[fieldCached]) {
                    return;
                }
                if (value !== undefined &&
                    value !== null) {
                    // automaticallty transform Array into ArraySchema
                    if (isArray && !(value instanceof ArraySchema)) {
                        value = new ArraySchema(...value);
                    }
                    // automaticallty transform Map into MapSchema
                    if (isMap && !(value instanceof MapSchema)) {
                        value = new MapSchema(value);
                    }
                    // try to turn provided structure into a Proxy
                    if (value['$proxy'] === undefined) {
                        if (isMap) {
                            value = getMapProxy(value);
                        }
                        else if (isArray) {
                            value = getArrayProxy(value);
                        }
                    }
                    // flag the change for encoding.
                    this.$changes.change(field);
                    //
                    // call setParent() recursively for this and its child
                    // structures.
                    //
                    if (value['$changes']) {
                        value['$changes'].setParent(this, this.$changes.root, this._definition.indexes[field]);
                    }
                }
                else if (this[fieldCached]) {
                    //
                    // Setting a field to `null` or `undefined` will delete it.
                    //
                    this.$changes.delete(field);
                }
                this[fieldCached] = value;
            },
            enumerable: true,
            configurable: true
        };
    };
}
function defineTypes(target, fields, options = {}) {
    if (!options.context) {
        options.context = target._context || options.context || globalContext;
    }
    for (let field in fields) {
        type(fields[field], options)(target.prototype, field);
    }
    return target;
}

/**
 * Copyright (c) 2018 Endel Dreyer
 * Copyright (c) 2014 Ion Drive Software Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE
 */
/**
 * msgpack implementation highly based on notepack.io
 * https://github.com/darrachequesne/notepack
 */
function utf8Length$1(str) {
    var c = 0, length = 0;
    for (var i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 0x80) {
            length += 1;
        }
        else if (c < 0x800) {
            length += 2;
        }
        else if (c < 0xd800 || c >= 0xe000) {
            length += 3;
        }
        else {
            i++;
            length += 4;
        }
    }
    return length;
}
function utf8Write$1(view, offset, str) {
    var c = 0;
    for (var i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 0x80) {
            view[offset++] = c;
        }
        else if (c < 0x800) {
            view[offset++] = 0xc0 | (c >> 6);
            view[offset++] = 0x80 | (c & 0x3f);
        }
        else if (c < 0xd800 || c >= 0xe000) {
            view[offset++] = 0xe0 | (c >> 12);
            view[offset++] = 0x80 | (c >> 6 & 0x3f);
            view[offset++] = 0x80 | (c & 0x3f);
        }
        else {
            i++;
            c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
            view[offset++] = 0xf0 | (c >> 18);
            view[offset++] = 0x80 | (c >> 12 & 0x3f);
            view[offset++] = 0x80 | (c >> 6 & 0x3f);
            view[offset++] = 0x80 | (c & 0x3f);
        }
    }
}
function int8$1(bytes, value) {
    bytes.push(value & 255);
}
function uint8$1(bytes, value) {
    bytes.push(value & 255);
}
function int16$1(bytes, value) {
    bytes.push(value & 255);
    bytes.push((value >> 8) & 255);
}
function uint16$1(bytes, value) {
    bytes.push(value & 255);
    bytes.push((value >> 8) & 255);
}
function int32$1(bytes, value) {
    bytes.push(value & 255);
    bytes.push((value >> 8) & 255);
    bytes.push((value >> 16) & 255);
    bytes.push((value >> 24) & 255);
}
function uint32$1(bytes, value) {
    const b4 = value >> 24;
    const b3 = value >> 16;
    const b2 = value >> 8;
    const b1 = value;
    bytes.push(b1 & 255);
    bytes.push(b2 & 255);
    bytes.push(b3 & 255);
    bytes.push(b4 & 255);
}
function int64$1(bytes, value) {
    const high = Math.floor(value / Math.pow(2, 32));
    const low = value >>> 0;
    uint32$1(bytes, low);
    uint32$1(bytes, high);
}
function uint64$1(bytes, value) {
    const high = (value / Math.pow(2, 32)) >> 0;
    const low = value >>> 0;
    uint32$1(bytes, low);
    uint32$1(bytes, high);
}
function float32$1(bytes, value) {
    writeFloat32(bytes, value);
}
function float64$1(bytes, value) {
    writeFloat64(bytes, value);
}
const _int32$1 = new Int32Array(2);
const _float32$1 = new Float32Array(_int32$1.buffer);
const _float64$1 = new Float64Array(_int32$1.buffer);
function writeFloat32(bytes, value) {
    _float32$1[0] = value;
    int32$1(bytes, _int32$1[0]);
}
function writeFloat64(bytes, value) {
    _float64$1[0] = value;
    int32$1(bytes, _int32$1[0 ]);
    int32$1(bytes, _int32$1[1 ]);
}
function boolean$1(bytes, value) {
    return uint8$1(bytes, value ? 1 : 0);
}
function string$1(bytes, value) {
    // encode `null` strings as empty.
    if (!value) {
        value = "";
    }
    let length = utf8Length$1(value);
    let size = 0;
    // fixstr
    if (length < 0x20) {
        bytes.push(length | 0xa0);
        size = 1;
    }
    // str 8
    else if (length < 0x100) {
        bytes.push(0xd9);
        uint8$1(bytes, length);
        size = 2;
    }
    // str 16
    else if (length < 0x10000) {
        bytes.push(0xda);
        uint16$1(bytes, length);
        size = 3;
    }
    // str 32
    else if (length < 0x100000000) {
        bytes.push(0xdb);
        uint32$1(bytes, length);
        size = 5;
    }
    else {
        throw new Error('String too long');
    }
    utf8Write$1(bytes, bytes.length, value);
    return size + length;
}
function number$1(bytes, value) {
    if (isNaN(value)) {
        return number$1(bytes, 0);
    }
    else if (!isFinite(value)) {
        return number$1(bytes, (value > 0) ? Number.MAX_SAFE_INTEGER : -Number.MAX_SAFE_INTEGER);
    }
    else if (value !== (value | 0)) {
        bytes.push(0xcb);
        writeFloat64(bytes, value);
        return 9;
        // TODO: encode float 32?
        // is it possible to differentiate between float32 / float64 here?
        // // float 32
        // bytes.push(0xca);
        // writeFloat32(bytes, value);
        // return 5;
    }
    if (value >= 0) {
        // positive fixnum
        if (value < 0x80) {
            uint8$1(bytes, value);
            return 1;
        }
        // uint 8
        if (value < 0x100) {
            bytes.push(0xcc);
            uint8$1(bytes, value);
            return 2;
        }
        // uint 16
        if (value < 0x10000) {
            bytes.push(0xcd);
            uint16$1(bytes, value);
            return 3;
        }
        // uint 32
        if (value < 0x100000000) {
            bytes.push(0xce);
            uint32$1(bytes, value);
            return 5;
        }
        // uint 64
        bytes.push(0xcf);
        uint64$1(bytes, value);
        return 9;
    }
    else {
        // negative fixnum
        if (value >= -0x20) {
            bytes.push(0xe0 | (value + 0x20));
            return 1;
        }
        // int 8
        if (value >= -0x80) {
            bytes.push(0xd0);
            int8$1(bytes, value);
            return 2;
        }
        // int 16
        if (value >= -0x8000) {
            bytes.push(0xd1);
            int16$1(bytes, value);
            return 3;
        }
        // int 32
        if (value >= -0x80000000) {
            bytes.push(0xd2);
            int32$1(bytes, value);
            return 5;
        }
        // int 64
        bytes.push(0xd3);
        int64$1(bytes, value);
        return 9;
    }
}

var encode = /*#__PURE__*/Object.freeze({
    __proto__: null,
    utf8Write: utf8Write$1,
    int8: int8$1,
    uint8: uint8$1,
    int16: int16$1,
    uint16: uint16$1,
    int32: int32$1,
    uint32: uint32$1,
    int64: int64$1,
    uint64: uint64$1,
    float32: float32$1,
    float64: float64$1,
    writeFloat32: writeFloat32,
    writeFloat64: writeFloat64,
    boolean: boolean$1,
    string: string$1,
    number: number$1
});

/**
 * Copyright (c) 2018 Endel Dreyer
 * Copyright (c) 2014 Ion Drive Software Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE
 */
function utf8Read(bytes, offset, length) {
    var string = '', chr = 0;
    for (var i = offset, end = offset + length; i < end; i++) {
        var byte = bytes[i];
        if ((byte & 0x80) === 0x00) {
            string += String.fromCharCode(byte);
            continue;
        }
        if ((byte & 0xe0) === 0xc0) {
            string += String.fromCharCode(((byte & 0x1f) << 6) |
                (bytes[++i] & 0x3f));
            continue;
        }
        if ((byte & 0xf0) === 0xe0) {
            string += String.fromCharCode(((byte & 0x0f) << 12) |
                ((bytes[++i] & 0x3f) << 6) |
                ((bytes[++i] & 0x3f) << 0));
            continue;
        }
        if ((byte & 0xf8) === 0xf0) {
            chr = ((byte & 0x07) << 18) |
                ((bytes[++i] & 0x3f) << 12) |
                ((bytes[++i] & 0x3f) << 6) |
                ((bytes[++i] & 0x3f) << 0);
            if (chr >= 0x010000) { // surrogate pair
                chr -= 0x010000;
                string += String.fromCharCode((chr >>> 10) + 0xD800, (chr & 0x3FF) + 0xDC00);
            }
            else {
                string += String.fromCharCode(chr);
            }
            continue;
        }
        console.error('Invalid byte ' + byte.toString(16));
        // (do not throw error to avoid server/client from crashing due to hack attemps)
        // throw new Error('Invalid byte ' + byte.toString(16));
    }
    return string;
}
function int8(bytes, it) {
    return uint8(bytes, it) << 24 >> 24;
}
function uint8(bytes, it) {
    return bytes[it.offset++];
}
function int16(bytes, it) {
    return uint16(bytes, it) << 16 >> 16;
}
function uint16(bytes, it) {
    return bytes[it.offset++] | bytes[it.offset++] << 8;
}
function int32(bytes, it) {
    return bytes[it.offset++] | bytes[it.offset++] << 8 | bytes[it.offset++] << 16 | bytes[it.offset++] << 24;
}
function uint32(bytes, it) {
    return int32(bytes, it) >>> 0;
}
function float32(bytes, it) {
    return readFloat32(bytes, it);
}
function float64(bytes, it) {
    return readFloat64(bytes, it);
}
function int64(bytes, it) {
    const low = uint32(bytes, it);
    const high = int32(bytes, it) * Math.pow(2, 32);
    return high + low;
}
function uint64(bytes, it) {
    const low = uint32(bytes, it);
    const high = uint32(bytes, it) * Math.pow(2, 32);
    return high + low;
}
const _int32 = new Int32Array(2);
const _float32 = new Float32Array(_int32.buffer);
const _float64 = new Float64Array(_int32.buffer);
function readFloat32(bytes, it) {
    _int32[0] = int32(bytes, it);
    return _float32[0];
}
function readFloat64(bytes, it) {
    _int32[0 ] = int32(bytes, it);
    _int32[1 ] = int32(bytes, it);
    return _float64[0];
}
function boolean(bytes, it) {
    return uint8(bytes, it) > 0;
}
function string(bytes, it) {
    const prefix = bytes[it.offset++];
    let length;
    if (prefix < 0xc0) {
        // fixstr
        length = prefix & 0x1f;
    }
    else if (prefix === 0xd9) {
        length = uint8(bytes, it);
    }
    else if (prefix === 0xda) {
        length = uint16(bytes, it);
    }
    else if (prefix === 0xdb) {
        length = uint32(bytes, it);
    }
    const value = utf8Read(bytes, it.offset, length);
    it.offset += length;
    return value;
}
function stringCheck(bytes, it) {
    const prefix = bytes[it.offset];
    return (
    // fixstr
    (prefix < 0xc0 && prefix > 0xa0) ||
        // str 8
        prefix === 0xd9 ||
        // str 16
        prefix === 0xda ||
        // str 32
        prefix === 0xdb);
}
function number(bytes, it) {
    const prefix = bytes[it.offset++];
    if (prefix < 0x80) {
        // positive fixint
        return prefix;
    }
    else if (prefix === 0xca) {
        // float 32
        return readFloat32(bytes, it);
    }
    else if (prefix === 0xcb) {
        // float 64
        return readFloat64(bytes, it);
    }
    else if (prefix === 0xcc) {
        // uint 8
        return uint8(bytes, it);
    }
    else if (prefix === 0xcd) {
        // uint 16
        return uint16(bytes, it);
    }
    else if (prefix === 0xce) {
        // uint 32
        return uint32(bytes, it);
    }
    else if (prefix === 0xcf) {
        // uint 64
        return uint64(bytes, it);
    }
    else if (prefix === 0xd0) {
        // int 8
        return int8(bytes, it);
    }
    else if (prefix === 0xd1) {
        // int 16
        return int16(bytes, it);
    }
    else if (prefix === 0xd2) {
        // int 32
        return int32(bytes, it);
    }
    else if (prefix === 0xd3) {
        // int 64
        return int64(bytes, it);
    }
    else if (prefix > 0xdf) {
        // negative fixint
        return (0xff - prefix + 1) * -1;
    }
}
function numberCheck(bytes, it) {
    const prefix = bytes[it.offset];
    // positive fixint - 0x00 - 0x7f
    // float 32        - 0xca
    // float 64        - 0xcb
    // uint 8          - 0xcc
    // uint 16         - 0xcd
    // uint 32         - 0xce
    // uint 64         - 0xcf
    // int 8           - 0xd0
    // int 16          - 0xd1
    // int 32          - 0xd2
    // int 64          - 0xd3
    return (prefix < 0x80 ||
        (prefix >= 0xca && prefix <= 0xd3));
}
function arrayCheck(bytes, it) {
    return bytes[it.offset] < 0xa0;
    // const prefix = bytes[it.offset] ;
    // if (prefix < 0xa0) {
    //   return prefix;
    // // array
    // } else if (prefix === 0xdc) {
    //   it.offset += 2;
    // } else if (0xdd) {
    //   it.offset += 4;
    // }
    // return prefix;
}
function switchStructureCheck(bytes, it) {
    return (
    // previous byte should be `SWITCH_TO_STRUCTURE`
    bytes[it.offset - 1] === SWITCH_TO_STRUCTURE &&
        // next byte should be a number
        (bytes[it.offset] < 0x80 || (bytes[it.offset] >= 0xca && bytes[it.offset] <= 0xd3)));
}

var decode = /*#__PURE__*/Object.freeze({
    __proto__: null,
    int8: int8,
    uint8: uint8,
    int16: int16,
    uint16: uint16,
    int32: int32,
    uint32: uint32,
    float32: float32,
    float64: float64,
    int64: int64,
    uint64: uint64,
    readFloat32: readFloat32,
    readFloat64: readFloat64,
    boolean: boolean,
    string: string,
    stringCheck: stringCheck,
    number: number,
    numberCheck: numberCheck,
    arrayCheck: arrayCheck,
    switchStructureCheck: switchStructureCheck
});

class CollectionSchema {
    $changes = new ChangeTree(this);
    $items = new Map();
    $indexes = new Map();
    $refId = 0;
    //
    // Decoding callbacks
    //
    $callbacks;
    onAdd(callback, triggerAll = true) {
        return addCallback((this.$callbacks || (this.$callbacks = [])), OPERATION.ADD, callback, (triggerAll)
            ? this.$items
            : undefined);
    }
    onRemove(callback) { return addCallback(this.$callbacks || (this.$callbacks = []), OPERATION.DELETE, callback); }
    onChange(callback) { return addCallback(this.$callbacks || (this.$callbacks = []), OPERATION.REPLACE, callback); }
    static is(type) {
        return type['collection'] !== undefined;
    }
    constructor(initialValues) {
        if (initialValues) {
            initialValues.forEach((v) => this.add(v));
        }
    }
    add(value) {
        // set "index" for reference.
        const index = this.$refId++;
        const isRef = (value['$changes']) !== undefined;
        if (isRef) {
            value['$changes'].setParent(this, this.$changes.root, index);
        }
        this.$changes.indexes[index] = index;
        this.$indexes.set(index, index);
        this.$items.set(index, value);
        this.$changes.change(index);
        return index;
    }
    at(index) {
        const key = Array.from(this.$items.keys())[index];
        return this.$items.get(key);
    }
    entries() {
        return this.$items.entries();
    }
    delete(item) {
        const entries = this.$items.entries();
        let index;
        let entry;
        while (entry = entries.next()) {
            if (entry.done) {
                break;
            }
            if (item === entry.value[1]) {
                index = entry.value[0];
                break;
            }
        }
        if (index === undefined) {
            return false;
        }
        this.$changes.delete(index);
        this.$indexes.delete(index);
        return this.$items.delete(index);
    }
    clear(changes) {
        // discard previous operations.
        this.$changes.discard(true, true);
        this.$changes.indexes = {};
        // clear previous indexes
        this.$indexes.clear();
        //
        // When decoding:
        // - enqueue items for DELETE callback.
        // - flag child items for garbage collection.
        //
        if (changes) {
            removeChildRefs.call(this, changes);
        }
        // clear items
        this.$items.clear();
        this.$changes.operation({ index: 0, op: OPERATION.CLEAR });
        // touch all structures until reach root
        this.$changes.touchParents();
    }
    has(value) {
        return Array.from(this.$items.values()).some((v) => v === value);
    }
    forEach(callbackfn) {
        this.$items.forEach((value, key, _) => callbackfn(value, key, this));
    }
    values() {
        return this.$items.values();
    }
    get size() {
        return this.$items.size;
    }
    setIndex(index, key) {
        this.$indexes.set(index, key);
    }
    getIndex(index) {
        return this.$indexes.get(index);
    }
    getByIndex(index) {
        return this.$items.get(this.$indexes.get(index));
    }
    deleteByIndex(index) {
        const key = this.$indexes.get(index);
        this.$items.delete(key);
        this.$indexes.delete(index);
    }
    toArray() {
        return Array.from(this.$items.values());
    }
    toJSON() {
        const values = [];
        this.forEach((value, key) => {
            values.push((typeof (value['toJSON']) === "function")
                ? value['toJSON']()
                : value);
        });
        return values;
    }
    //
    // Decoding utilities
    //
    clone(isDecoding) {
        let cloned;
        if (isDecoding) {
            // client-side
            cloned = Object.assign(new CollectionSchema(), this);
        }
        else {
            // server-side
            cloned = new CollectionSchema();
            this.forEach((value) => {
                if (value['$changes']) {
                    cloned.add(value['clone']());
                }
                else {
                    cloned.add(value);
                }
            });
        }
        return cloned;
    }
}

class SetSchema {
    $changes = new ChangeTree(this);
    $items = new Map();
    $indexes = new Map();
    $refId = 0;
    //
    // Decoding callbacks
    //
    $callbacks;
    onAdd(callback, triggerAll = true) {
        return addCallback((this.$callbacks || (this.$callbacks = [])), OPERATION.ADD, callback, (triggerAll)
            ? this.$items
            : undefined);
    }
    onRemove(callback) { return addCallback(this.$callbacks || (this.$callbacks = []), OPERATION.DELETE, callback); }
    onChange(callback) { return addCallback(this.$callbacks || (this.$callbacks = []), OPERATION.REPLACE, callback); }
    static is(type) {
        return type['set'] !== undefined;
    }
    constructor(initialValues) {
        if (initialValues) {
            initialValues.forEach((v) => this.add(v));
        }
    }
    add(value) {
        // immediatelly return false if value already added.
        if (this.has(value)) {
            return false;
        }
        // set "index" for reference.
        const index = this.$refId++;
        if ((value['$changes']) !== undefined) {
            value['$changes'].setParent(this, this.$changes.root, index);
        }
        const operation = this.$changes.indexes[index]?.op ?? OPERATION.ADD;
        this.$changes.indexes[index] = index;
        this.$indexes.set(index, index);
        this.$items.set(index, value);
        this.$changes.change(index, operation);
        return index;
    }
    entries() {
        return this.$items.entries();
    }
    delete(item) {
        const entries = this.$items.entries();
        let index;
        let entry;
        while (entry = entries.next()) {
            if (entry.done) {
                break;
            }
            if (item === entry.value[1]) {
                index = entry.value[0];
                break;
            }
        }
        if (index === undefined) {
            return false;
        }
        this.$changes.delete(index);
        this.$indexes.delete(index);
        return this.$items.delete(index);
    }
    clear(changes) {
        // discard previous operations.
        this.$changes.discard(true, true);
        this.$changes.indexes = {};
        // clear previous indexes
        this.$indexes.clear();
        //
        // When decoding:
        // - enqueue items for DELETE callback.
        // - flag child items for garbage collection.
        //
        if (changes) {
            removeChildRefs.call(this, changes);
        }
        // clear items
        this.$items.clear();
        this.$changes.operation({ index: 0, op: OPERATION.CLEAR });
        // touch all structures until reach root
        this.$changes.touchParents();
    }
    has(value) {
        const values = this.$items.values();
        let has = false;
        let entry;
        while (entry = values.next()) {
            if (entry.done) {
                break;
            }
            if (value === entry.value) {
                has = true;
                break;
            }
        }
        return has;
    }
    forEach(callbackfn) {
        this.$items.forEach((value, key, _) => callbackfn(value, key, this));
    }
    values() {
        return this.$items.values();
    }
    get size() {
        return this.$items.size;
    }
    setIndex(index, key) {
        this.$indexes.set(index, key);
    }
    getIndex(index) {
        return this.$indexes.get(index);
    }
    getByIndex(index) {
        return this.$items.get(this.$indexes.get(index));
    }
    deleteByIndex(index) {
        const key = this.$indexes.get(index);
        this.$items.delete(key);
        this.$indexes.delete(index);
    }
    toArray() {
        return Array.from(this.$items.values());
    }
    toJSON() {
        const values = [];
        this.forEach((value, key) => {
            values.push((typeof (value['toJSON']) === "function")
                ? value['toJSON']()
                : value);
        });
        return values;
    }
    //
    // Decoding utilities
    //
    clone(isDecoding) {
        let cloned;
        if (isDecoding) {
            // client-side
            cloned = Object.assign(new SetSchema(), this);
        }
        else {
            // server-side
            cloned = new SetSchema();
            this.forEach((value) => {
                if (value['$changes']) {
                    cloned.add(value['clone']());
                }
                else {
                    cloned.add(value);
                }
            });
        }
        return cloned;
    }
}

let ClientState$1 = class ClientState {
    refIds = new WeakSet();
    containerIndexes = new WeakMap();
    // containerIndexes = new Map<ChangeTree, Set<number>>();
    addRefId(changeTree) {
        if (!this.refIds.has(changeTree)) {
            this.refIds.add(changeTree);
            this.containerIndexes.set(changeTree, new Set());
        }
    }
    static get(client) {
        if (client.$filterState === undefined) {
            client.$filterState = new ClientState();
        }
        return client.$filterState;
    }
};

class ReferenceTracker {
    //
    // Relation of refId => Schema structure
    // For direct access of structures during decoding time.
    //
    refs = new Map();
    refCounts = {};
    deletedRefs = new Set();
    nextUniqueId = 0;
    getNextUniqueId() {
        return this.nextUniqueId++;
    }
    // for decoding
    addRef(refId, ref, incrementCount = true) {
        this.refs.set(refId, ref);
        if (incrementCount) {
            this.refCounts[refId] = (this.refCounts[refId] || 0) + 1;
        }
    }
    // for decoding
    removeRef(refId) {
        const refCount = this.refCounts[refId];
        if (refCount === undefined) {
            console.warn(`trying to remove reference ${refId} that doesn't exist`);
            return;
        }
        if (refCount === 0) {
            console.warn(`trying to remove reference ${refId} with 0 refCount`);
            return;
        }
        this.refCounts[refId] = refCount - 1;
        this.deletedRefs.add(refId);
    }
    clearRefs() {
        this.refs.clear();
        this.deletedRefs.clear();
        this.refCounts = {};
    }
    // for decoding
    garbageCollectDeletedRefs() {
        this.deletedRefs.forEach((refId) => {
            //
            // Skip active references.
            //
            if (this.refCounts[refId] > 0) {
                return;
            }
            const ref = this.refs.get(refId);
            //
            // Ensure child schema instances have their references removed as well.
            //
            if (ref instanceof Schema) {
                for (const fieldName in ref['_definition'].schema) {
                    if (typeof (ref['_definition'].schema[fieldName]) !== "string" &&
                        ref[fieldName] &&
                        ref[fieldName]['$changes']) {
                        this.removeRef(ref[fieldName]['$changes'].refId);
                    }
                }
            }
            else {
                const definition = ref['$changes'].parent._definition;
                const type = definition.schema[definition.fieldsByIndex[ref['$changes'].parentIndex]];
                if (typeof (Object.values(type)[0]) === "function") {
                    Array.from(ref.values())
                        .forEach((child) => this.removeRef(child['$changes'].refId));
                }
            }
            this.refs.delete(refId);
            delete this.refCounts[refId];
        });
        // clear deleted refs.
        this.deletedRefs.clear();
    }
}

class EncodeSchemaError extends Error {
}
function assertType(value, type, klass, field) {
    let typeofTarget;
    let allowNull = false;
    switch (type) {
        case "number":
        case "int8":
        case "uint8":
        case "int16":
        case "uint16":
        case "int32":
        case "uint32":
        case "int64":
        case "uint64":
        case "float32":
        case "float64":
            typeofTarget = "number";
            if (isNaN(value)) {
                console.log(`trying to encode "NaN" in ${klass.constructor.name}#${field}`);
            }
            break;
        case "string":
            typeofTarget = "string";
            allowNull = true;
            break;
        case "boolean":
            // boolean is always encoded as true/false based on truthiness
            return;
    }
    if (typeof (value) !== typeofTarget && (!allowNull || (allowNull && value !== null))) {
        let foundValue = `'${JSON.stringify(value)}'${(value && value.constructor && ` (${value.constructor.name})`) || ''}`;
        throw new EncodeSchemaError(`a '${typeofTarget}' was expected, but ${foundValue} was provided in ${klass.constructor.name}#${field}`);
    }
}
function assertInstanceType(value, type, klass, field) {
    if (!(value instanceof type)) {
        throw new EncodeSchemaError(`a '${type.name}' was expected, but '${value.constructor.name}' was provided in ${klass.constructor.name}#${field}`);
    }
}
function encodePrimitiveType(type, bytes, value, klass, field) {
    assertType(value, type, klass, field);
    const encodeFunc = encode[type];
    if (encodeFunc) {
        encodeFunc(bytes, value);
    }
    else {
        throw new EncodeSchemaError(`a '${type}' was expected, but ${value} was provided in ${klass.constructor.name}#${field}`);
    }
}
function decodePrimitiveType(type, bytes, it) {
    return decode[type](bytes, it);
}
/**
 * Schema encoder / decoder
 */
class Schema {
    static _typeid;
    static _context;
    static _definition = SchemaDefinition.create();
    static onError(e) {
        console.error(e);
    }
    static is(type) {
        return (type['_definition'] &&
            type['_definition'].schema !== undefined);
    }
    $changes;
    // TODO: refactor. this feature needs to be ported to other languages with potentially different API
    // protected $listeners: { [field: string]: Array<(value: any, previousValue: any) => void> };
    $callbacks;
    onChange(callback) {
        return addCallback((this.$callbacks || (this.$callbacks = {})), OPERATION.REPLACE, callback);
    }
    onRemove(callback) {
        return addCallback((this.$callbacks || (this.$callbacks = {})), OPERATION.DELETE, callback);
    }
    // allow inherited classes to have a constructor
    constructor(...args) {
        // fix enumerability of fields for end-user
        Object.defineProperties(this, {
            $changes: {
                value: new ChangeTree(this, undefined, new ReferenceTracker()),
                enumerable: false,
                writable: true
            },
            // $listeners: {
            //     value: undefined,
            //     enumerable: false,
            //     writable: true
            // },
            $callbacks: {
                value: undefined,
                enumerable: false,
                writable: true
            },
        });
        const descriptors = this._definition.descriptors;
        if (descriptors) {
            Object.defineProperties(this, descriptors);
        }
        //
        // Assign initial values
        //
        if (args[0]) {
            this.assign(args[0]);
        }
    }
    assign(props) {
        Object.assign(this, props);
        return this;
    }
    get _definition() { return this.constructor._definition; }
    /**
     * (Server-side): Flag a property to be encoded for the next patch.
     * @param instance Schema instance
     * @param property string representing the property name, or number representing the index of the property.
     * @param operation OPERATION to perform (detected automatically)
     */
    setDirty(property, operation) {
        this.$changes.change(property, operation);
    }
    /**
     * Client-side: listen for changes on property.
     * @param prop the property name
     * @param callback callback to be triggered on property change
     * @param immediate trigger immediatelly if property has been already set.
     */
    listen(prop, callback, immediate = true) {
        if (!this.$callbacks) {
            this.$callbacks = {};
        }
        if (!this.$callbacks[prop]) {
            this.$callbacks[prop] = [];
        }
        this.$callbacks[prop].push(callback);
        if (immediate && this[prop] !== undefined) {
            callback(this[prop], undefined);
        }
        // return un-register callback.
        return () => spliceOne$1(this.$callbacks[prop], this.$callbacks[prop].indexOf(callback));
    }
    decode(bytes, it = { offset: 0 }, ref = this) {
        const allChanges = [];
        const $root = this.$changes.root;
        const totalBytes = bytes.length;
        let refId = 0;
        $root.refs.set(refId, this);
        while (it.offset < totalBytes) {
            let byte = bytes[it.offset++];
            if (byte == SWITCH_TO_STRUCTURE) {
                refId = number(bytes, it);
                const nextRef = $root.refs.get(refId);
                //
                // Trying to access a reference that haven't been decoded yet.
                //
                if (!nextRef) {
                    throw new Error(`"refId" not found: ${refId}`);
                }
                ref = nextRef;
                continue;
            }
            const changeTree = ref['$changes'];
            const isSchema = (ref['_definition'] !== undefined);
            const operation = (isSchema)
                ? (byte >> 6) << 6 // "compressed" index + operation
                : byte; // "uncompressed" index + operation (array/map items)
            if (operation === OPERATION.CLEAR) {
                //
                // TODO: refactor me!
                // The `.clear()` method is calling `$root.removeRef(refId)` for
                // each item inside this collection
                //
                ref.clear(allChanges);
                continue;
            }
            const fieldIndex = (isSchema)
                ? byte % (operation || 255) // if "REPLACE" operation (0), use 255
                : number(bytes, it);
            const fieldName = (isSchema)
                ? (ref['_definition'].fieldsByIndex[fieldIndex])
                : "";
            let type = changeTree.getType(fieldIndex);
            let value;
            let previousValue;
            let dynamicIndex;
            if (!isSchema) {
                previousValue = ref['getByIndex'](fieldIndex);
                if ((operation & OPERATION.ADD) === OPERATION.ADD) { // ADD or DELETE_AND_ADD
                    dynamicIndex = (ref instanceof MapSchema)
                        ? string(bytes, it)
                        : fieldIndex;
                    ref['setIndex'](fieldIndex, dynamicIndex);
                }
                else {
                    // here
                    dynamicIndex = ref['getIndex'](fieldIndex);
                }
            }
            else {
                previousValue = ref[`_${fieldName}`];
            }
            //
            // Delete operations
            //
            if ((operation & OPERATION.DELETE) === OPERATION.DELETE) {
                if (operation !== OPERATION.DELETE_AND_ADD) {
                    ref['deleteByIndex'](fieldIndex);
                }
                // Flag `refId` for garbage collection.
                if (previousValue && previousValue['$changes']) {
                    $root.removeRef(previousValue['$changes'].refId);
                }
                value = null;
            }
            if (fieldName === undefined) {
                console.warn("@colyseus/schema: definition mismatch");
                //
                // keep skipping next bytes until reaches a known structure
                // by local decoder.
                //
                const nextIterator = { offset: it.offset };
                while (it.offset < totalBytes) {
                    if (switchStructureCheck(bytes, it)) {
                        nextIterator.offset = it.offset + 1;
                        if ($root.refs.has(number(bytes, nextIterator))) {
                            break;
                        }
                    }
                    it.offset++;
                }
                continue;
            }
            else if (operation === OPERATION.DELETE) ;
            else if (Schema.is(type)) {
                const refId = number(bytes, it);
                value = $root.refs.get(refId);
                if (operation !== OPERATION.REPLACE) {
                    const childType = this.getSchemaType(bytes, it, type);
                    if (!value) {
                        value = this.createTypeInstance(childType);
                        value.$changes.refId = refId;
                        if (previousValue) {
                            value.$callbacks = previousValue.$callbacks;
                            // value.$listeners = previousValue.$listeners;
                            if (previousValue['$changes'].refId &&
                                refId !== previousValue['$changes'].refId) {
                                $root.removeRef(previousValue['$changes'].refId);
                            }
                        }
                    }
                    $root.addRef(refId, value, (value !== previousValue));
                }
            }
            else if (typeof (type) === "string") {
                //
                // primitive value (number, string, boolean, etc)
                //
                value = decodePrimitiveType(type, bytes, it);
            }
            else {
                const typeDef = getType(Object.keys(type)[0]);
                const refId = number(bytes, it);
                const valueRef = ($root.refs.has(refId))
                    ? previousValue || $root.refs.get(refId)
                    : new typeDef.constructor();
                value = valueRef.clone(true);
                value.$changes.refId = refId;
                // preserve schema callbacks
                if (previousValue) {
                    value['$callbacks'] = previousValue['$callbacks'];
                    if (previousValue['$changes'].refId &&
                        refId !== previousValue['$changes'].refId) {
                        $root.removeRef(previousValue['$changes'].refId);
                        //
                        // Trigger onRemove if structure has been replaced.
                        //
                        const entries = previousValue.entries();
                        let iter;
                        while ((iter = entries.next()) && !iter.done) {
                            const [key, value] = iter.value;
                            allChanges.push({
                                refId,
                                op: OPERATION.DELETE,
                                field: key,
                                value: undefined,
                                previousValue: value,
                            });
                        }
                    }
                }
                $root.addRef(refId, value, (valueRef !== previousValue));
            }
            if (value !== null &&
                value !== undefined) {
                if (value['$changes']) {
                    value['$changes'].setParent(changeTree.ref, changeTree.root, fieldIndex);
                }
                if (ref instanceof Schema) {
                    ref[fieldName] = value;
                    // ref[`_${fieldName}`] = value;
                }
                else if (ref instanceof MapSchema) {
                    // const key = ref['$indexes'].get(field);
                    const key = dynamicIndex;
                    // ref.set(key, value);
                    ref['$items'].set(key, value);
                    ref['$changes'].allChanges.add(fieldIndex);
                }
                else if (ref instanceof ArraySchema) {
                    // const key = ref['$indexes'][field];
                    // console.log("SETTING FOR ArraySchema =>", { field, key, value });
                    // ref[key] = value;
                    ref.setAt(fieldIndex, value);
                }
                else if (ref instanceof CollectionSchema) {
                    const index = ref.add(value);
                    ref['setIndex'](fieldIndex, index);
                }
                else if (ref instanceof SetSchema) {
                    const index = ref.add(value);
                    if (index !== false) {
                        ref['setIndex'](fieldIndex, index);
                    }
                }
            }
            if (previousValue !== value) {
                allChanges.push({
                    refId,
                    op: operation,
                    field: fieldName,
                    dynamicIndex,
                    value,
                    previousValue,
                });
            }
        }
        this._triggerChanges(allChanges);
        // drop references of unused schemas
        $root.garbageCollectDeletedRefs();
        return allChanges;
    }
    encode(encodeAll = false, bytes = [], useFilters = false) {
        const rootChangeTree = this.$changes;
        const refIdsVisited = new WeakSet();
        const changeTrees = [rootChangeTree];
        let numChangeTrees = 1;
        for (let i = 0; i < numChangeTrees; i++) {
            const changeTree = changeTrees[i];
            const ref = changeTree.ref;
            const isSchema = (ref instanceof Schema);
            // Generate unique refId for the ChangeTree.
            changeTree.ensureRefId();
            // mark this ChangeTree as visited.
            refIdsVisited.add(changeTree);
            // root `refId` is skipped.
            if (changeTree !== rootChangeTree &&
                (changeTree.changed || encodeAll)) {
                uint8$1(bytes, SWITCH_TO_STRUCTURE);
                number$1(bytes, changeTree.refId);
            }
            const changes = (encodeAll)
                ? Array.from(changeTree.allChanges)
                : Array.from(changeTree.changes.values());
            for (let j = 0, cl = changes.length; j < cl; j++) {
                const operation = (encodeAll)
                    ? { op: OPERATION.ADD, index: changes[j] }
                    : changes[j];
                const fieldIndex = operation.index;
                const field = (isSchema)
                    ? ref['_definition'].fieldsByIndex && ref['_definition'].fieldsByIndex[fieldIndex]
                    : fieldIndex;
                // cache begin index if `useFilters`
                const beginIndex = bytes.length;
                // encode field index + operation
                if (operation.op !== OPERATION.TOUCH) {
                    if (isSchema) {
                        //
                        // Compress `fieldIndex` + `operation` into a single byte.
                        // This adds a limitaion of 64 fields per Schema structure
                        //
                        uint8$1(bytes, (fieldIndex | operation.op));
                    }
                    else {
                        uint8$1(bytes, operation.op);
                        // custom operations
                        if (operation.op === OPERATION.CLEAR) {
                            continue;
                        }
                        // indexed operations
                        number$1(bytes, fieldIndex);
                    }
                }
                //
                // encode "alias" for dynamic fields (maps)
                //
                if (!isSchema &&
                    (operation.op & OPERATION.ADD) == OPERATION.ADD // ADD or DELETE_AND_ADD
                ) {
                    if (ref instanceof MapSchema) {
                        //
                        // MapSchema dynamic key
                        //
                        const dynamicIndex = changeTree.ref['$indexes'].get(fieldIndex);
                        string$1(bytes, dynamicIndex);
                    }
                }
                if (operation.op === OPERATION.DELETE) {
                    //
                    // TODO: delete from filter cache data.
                    //
                    // if (useFilters) {
                    //     delete changeTree.caches[fieldIndex];
                    // }
                    continue;
                }
                // const type = changeTree.childType || ref._schema[field];
                const type = changeTree.getType(fieldIndex);
                // const type = changeTree.getType(fieldIndex);
                const value = changeTree.getValue(fieldIndex);
                // Enqueue ChangeTree to be visited
                if (value &&
                    value['$changes'] &&
                    !refIdsVisited.has(value['$changes'])) {
                    changeTrees.push(value['$changes']);
                    value['$changes'].ensureRefId();
                    numChangeTrees++;
                }
                if (operation.op === OPERATION.TOUCH) {
                    continue;
                }
                if (Schema.is(type)) {
                    assertInstanceType(value, type, ref, field);
                    //
                    // Encode refId for this instance.
                    // The actual instance is going to be encoded on next `changeTree` iteration.
                    //
                    number$1(bytes, value.$changes.refId);
                    // Try to encode inherited TYPE_ID if it's an ADD operation.
                    if ((operation.op & OPERATION.ADD) === OPERATION.ADD) {
                        this.tryEncodeTypeId(bytes, type, value.constructor);
                    }
                }
                else if (typeof (type) === "string") {
                    //
                    // Primitive values
                    //
                    encodePrimitiveType(type, bytes, value, ref, field);
                }
                else {
                    //
                    // Custom type (MapSchema, ArraySchema, etc)
                    //
                    const definition = getType(Object.keys(type)[0]);
                    //
                    // ensure a ArraySchema has been provided
                    //
                    assertInstanceType(ref[`_${field}`], definition.constructor, ref, field);
                    //
                    // Encode refId for this instance.
                    // The actual instance is going to be encoded on next `changeTree` iteration.
                    //
                    number$1(bytes, value.$changes.refId);
                }
                if (useFilters) {
                    // cache begin / end index
                    changeTree.cache(fieldIndex, bytes.slice(beginIndex));
                }
            }
            if (!encodeAll && !useFilters) {
                changeTree.discard();
            }
        }
        return bytes;
    }
    encodeAll(useFilters) {
        return this.encode(true, [], useFilters);
    }
    applyFilters(client, encodeAll = false) {
        const root = this;
        const refIdsDissallowed = new Set();
        const $filterState = ClientState$1.get(client);
        const changeTrees = [this.$changes];
        let numChangeTrees = 1;
        let filteredBytes = [];
        for (let i = 0; i < numChangeTrees; i++) {
            const changeTree = changeTrees[i];
            if (refIdsDissallowed.has(changeTree.refId)) {
                // console.log("REFID IS NOT ALLOWED. SKIP.", { refId: changeTree.refId })
                continue;
            }
            const ref = changeTree.ref;
            const isSchema = ref instanceof Schema;
            uint8$1(filteredBytes, SWITCH_TO_STRUCTURE);
            number$1(filteredBytes, changeTree.refId);
            const clientHasRefId = $filterState.refIds.has(changeTree);
            const isEncodeAll = (encodeAll || !clientHasRefId);
            // console.log("REF:", ref.constructor.name);
            // console.log("Encode all?", isEncodeAll);
            //
            // include `changeTree` on list of known refIds by this client.
            //
            $filterState.addRefId(changeTree);
            const containerIndexes = $filterState.containerIndexes.get(changeTree);
            const changes = (isEncodeAll)
                ? Array.from(changeTree.allChanges)
                : Array.from(changeTree.changes.values());
            //
            // WORKAROUND: tries to re-evaluate previously not included @filter() attributes
            // - see "DELETE a field of Schema" test case.
            //
            if (!encodeAll &&
                isSchema &&
                ref._definition.indexesWithFilters) {
                const indexesWithFilters = ref._definition.indexesWithFilters;
                indexesWithFilters.forEach(indexWithFilter => {
                    if (!containerIndexes.has(indexWithFilter) &&
                        changeTree.allChanges.has(indexWithFilter)) {
                        if (isEncodeAll) {
                            changes.push(indexWithFilter);
                        }
                        else {
                            changes.push({ op: OPERATION.ADD, index: indexWithFilter, });
                        }
                    }
                });
            }
            for (let j = 0, cl = changes.length; j < cl; j++) {
                const change = (isEncodeAll)
                    ? { op: OPERATION.ADD, index: changes[j] }
                    : changes[j];
                // custom operations
                if (change.op === OPERATION.CLEAR) {
                    uint8$1(filteredBytes, change.op);
                    continue;
                }
                const fieldIndex = change.index;
                //
                // Deleting fields: encode the operation + field index
                //
                if (change.op === OPERATION.DELETE) {
                    //
                    // DELETE operations also need to go through filtering.
                    //
                    // TODO: cache the previous value so we can access the value (primitive or `refId`)
                    // (check against `$filterState.refIds`)
                    //
                    if (isSchema) {
                        uint8$1(filteredBytes, change.op | fieldIndex);
                    }
                    else {
                        uint8$1(filteredBytes, change.op);
                        number$1(filteredBytes, fieldIndex);
                    }
                    continue;
                }
                // indexed operation
                const value = changeTree.getValue(fieldIndex);
                const type = changeTree.getType(fieldIndex);
                if (isSchema) {
                    // Is a Schema!
                    const filter = (ref._definition.filters &&
                        ref._definition.filters[fieldIndex]);
                    if (filter && !filter.call(ref, client, value, root)) {
                        if (value && value['$changes']) {
                            refIdsDissallowed.add(value['$changes'].refId);
                        }
                        continue;
                    }
                }
                else {
                    // Is a collection! (map, array, etc.)
                    const parent = changeTree.parent;
                    const filter = changeTree.getChildrenFilter();
                    if (filter && !filter.call(parent, client, ref['$indexes'].get(fieldIndex), value, root)) {
                        if (value && value['$changes']) {
                            refIdsDissallowed.add(value['$changes'].refId);
                        }
                        continue;
                    }
                }
                // visit child ChangeTree on further iteration.
                if (value['$changes']) {
                    changeTrees.push(value['$changes']);
                    numChangeTrees++;
                }
                //
                // Copy cached bytes
                //
                if (change.op !== OPERATION.TOUCH) {
                    //
                    // TODO: refactor me!
                    //
                    if (change.op === OPERATION.ADD || isSchema) {
                        //
                        // use cached bytes directly if is from Schema type.
                        //
                        filteredBytes.push.apply(filteredBytes, changeTree.caches[fieldIndex] ?? []);
                        containerIndexes.add(fieldIndex);
                    }
                    else {
                        if (containerIndexes.has(fieldIndex)) {
                            //
                            // use cached bytes if already has the field
                            //
                            filteredBytes.push.apply(filteredBytes, changeTree.caches[fieldIndex] ?? []);
                        }
                        else {
                            //
                            // force ADD operation if field is not known by this client.
                            //
                            containerIndexes.add(fieldIndex);
                            uint8$1(filteredBytes, OPERATION.ADD);
                            number$1(filteredBytes, fieldIndex);
                            if (ref instanceof MapSchema) {
                                //
                                // MapSchema dynamic key
                                //
                                const dynamicIndex = changeTree.ref['$indexes'].get(fieldIndex);
                                string$1(filteredBytes, dynamicIndex);
                            }
                            if (value['$changes']) {
                                number$1(filteredBytes, value['$changes'].refId);
                            }
                            else {
                                // "encodePrimitiveType" without type checking.
                                // the type checking has been done on the first .encode() call.
                                encode[type](filteredBytes, value);
                            }
                        }
                    }
                }
                else if (value['$changes'] && !isSchema) {
                    //
                    // TODO:
                    // - track ADD/REPLACE/DELETE instances on `$filterState`
                    // - do NOT always encode dynamicIndex for MapSchema.
                    //   (If client already has that key, only the first index is necessary.)
                    //
                    uint8$1(filteredBytes, OPERATION.ADD);
                    number$1(filteredBytes, fieldIndex);
                    if (ref instanceof MapSchema) {
                        //
                        // MapSchema dynamic key
                        //
                        const dynamicIndex = changeTree.ref['$indexes'].get(fieldIndex);
                        string$1(filteredBytes, dynamicIndex);
                    }
                    number$1(filteredBytes, value['$changes'].refId);
                }
            }
        }
        return filteredBytes;
    }
    clone() {
        const cloned = new (this.constructor);
        const schema = this._definition.schema;
        for (let field in schema) {
            if (typeof (this[field]) === "object" &&
                typeof (this[field]?.clone) === "function") {
                // deep clone
                cloned[field] = this[field].clone();
            }
            else {
                // primitive values
                cloned[field] = this[field];
            }
        }
        return cloned;
    }
    toJSON() {
        const schema = this._definition.schema;
        const deprecated = this._definition.deprecated;
        const obj = {};
        for (let field in schema) {
            if (!deprecated[field] && this[field] !== null && typeof (this[field]) !== "undefined") {
                obj[field] = (typeof (this[field]['toJSON']) === "function")
                    ? this[field]['toJSON']()
                    : this[`_${field}`];
            }
        }
        return obj;
    }
    discardAllChanges() {
        this.$changes.discardAll();
    }
    getByIndex(index) {
        return this[this._definition.fieldsByIndex[index]];
    }
    deleteByIndex(index) {
        this[this._definition.fieldsByIndex[index]] = undefined;
    }
    tryEncodeTypeId(bytes, type, targetType) {
        if (type._typeid !== targetType._typeid) {
            uint8$1(bytes, TYPE_ID);
            number$1(bytes, targetType._typeid);
        }
    }
    getSchemaType(bytes, it, defaultType) {
        let type;
        if (bytes[it.offset] === TYPE_ID) {
            it.offset++;
            type = this.constructor._context.get(number(bytes, it));
        }
        return type || defaultType;
    }
    createTypeInstance(type) {
        let instance = new type();
        // assign root on $changes
        instance.$changes.root = this.$changes.root;
        return instance;
    }
    _triggerChanges(changes) {
        const uniqueRefIds = new Set();
        const $refs = this.$changes.root.refs;
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            const refId = change.refId;
            const ref = $refs.get(refId);
            const $callbacks = ref['$callbacks'];
            //
            // trigger onRemove on child structure.
            //
            if ((change.op & OPERATION.DELETE) === OPERATION.DELETE &&
                change.previousValue instanceof Schema) {
                change.previousValue['$callbacks']?.[OPERATION.DELETE]?.forEach(callback => callback());
            }
            // no callbacks defined, skip this structure!
            if (!$callbacks) {
                continue;
            }
            if (ref instanceof Schema) {
                if (!uniqueRefIds.has(refId)) {
                    try {
                        // trigger onChange
                        $callbacks?.[OPERATION.REPLACE]?.forEach(callback => callback());
                    }
                    catch (e) {
                        Schema.onError(e);
                    }
                }
                try {
                    if ($callbacks.hasOwnProperty(change.field)) {
                        $callbacks[change.field]?.forEach((callback) => callback(change.value, change.previousValue));
                    }
                }
                catch (e) {
                    Schema.onError(e);
                }
            }
            else {
                // is a collection of items
                if (change.op === OPERATION.ADD && change.previousValue === undefined) {
                    // triger onAdd
                    $callbacks[OPERATION.ADD]?.forEach(callback => callback(change.value, change.dynamicIndex ?? change.field));
                }
                else if (change.op === OPERATION.DELETE) {
                    //
                    // FIXME: `previousValue` should always be available.
                    // ADD + DELETE operations are still encoding DELETE operation.
                    //
                    if (change.previousValue !== undefined) {
                        // triger onRemove
                        $callbacks[OPERATION.DELETE]?.forEach(callback => callback(change.previousValue, change.dynamicIndex ?? change.field));
                    }
                }
                else if (change.op === OPERATION.DELETE_AND_ADD) {
                    // triger onRemove
                    if (change.previousValue !== undefined) {
                        $callbacks[OPERATION.DELETE]?.forEach(callback => callback(change.previousValue, change.dynamicIndex ?? change.field));
                    }
                    // triger onAdd
                    $callbacks[OPERATION.ADD]?.forEach(callback => callback(change.value, change.dynamicIndex ?? change.field));
                }
                // trigger onChange
                if (change.value !== change.previousValue) {
                    $callbacks[OPERATION.REPLACE]?.forEach(callback => callback(change.value, change.dynamicIndex ?? change.field));
                }
            }
            uniqueRefIds.add(refId);
        }
    }
}

function dumpChanges(schema) {
    const changeTrees = [schema['$changes']];
    let numChangeTrees = 1;
    const dump = {};
    let currentStructure = dump;
    for (let i = 0; i < numChangeTrees; i++) {
        const changeTree = changeTrees[i];
        changeTree.changes.forEach((change) => {
            const ref = changeTree.ref;
            const fieldIndex = change.index;
            const field = (ref['_definition'])
                ? ref['_definition'].fieldsByIndex[fieldIndex]
                : ref['$indexes'].get(fieldIndex);
            currentStructure[field] = changeTree.getValue(fieldIndex);
        });
    }
    return dump;
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const reflectionContext = { context: new Context() };
/**
 * Reflection
 */
class ReflectionField extends Schema {
    name;
    type;
    referencedType;
}
__decorate([
    type("string", reflectionContext)
], ReflectionField.prototype, "name", void 0);
__decorate([
    type("string", reflectionContext)
], ReflectionField.prototype, "type", void 0);
__decorate([
    type("number", reflectionContext)
], ReflectionField.prototype, "referencedType", void 0);
class ReflectionType extends Schema {
    id;
    fields = new ArraySchema();
}
__decorate([
    type("number", reflectionContext)
], ReflectionType.prototype, "id", void 0);
__decorate([
    type([ReflectionField], reflectionContext)
], ReflectionType.prototype, "fields", void 0);
class Reflection extends Schema {
    types = new ArraySchema();
    rootType;
    static encode(instance) {
        const rootSchemaType = instance.constructor;
        const reflection = new Reflection();
        reflection.rootType = rootSchemaType._typeid;
        const buildType = (currentType, schema) => {
            for (let fieldName in schema) {
                const field = new ReflectionField();
                field.name = fieldName;
                let fieldType;
                if (typeof (schema[fieldName]) === "string") {
                    fieldType = schema[fieldName];
                }
                else {
                    const type = schema[fieldName];
                    let childTypeSchema;
                    //
                    // TODO: refactor below.
                    //
                    if (Schema.is(type)) {
                        fieldType = "ref";
                        childTypeSchema = schema[fieldName];
                    }
                    else {
                        fieldType = Object.keys(type)[0];
                        if (typeof (type[fieldType]) === "string") {
                            fieldType += ":" + type[fieldType]; // array:string
                        }
                        else {
                            childTypeSchema = type[fieldType];
                        }
                    }
                    field.referencedType = (childTypeSchema)
                        ? childTypeSchema._typeid
                        : -1;
                }
                field.type = fieldType;
                currentType.fields.push(field);
            }
            reflection.types.push(currentType);
        };
        const types = rootSchemaType._context?.types;
        for (let typeid in types) {
            const type = new ReflectionType();
            type.id = Number(typeid);
            buildType(type, types[typeid]._definition.schema);
        }
        return reflection.encodeAll();
    }
    static decode(bytes, it) {
        const context = new Context();
        const reflection = new Reflection();
        reflection.decode(bytes, it);
        const schemaTypes = reflection.types.reduce((types, reflectionType) => {
            const schema = class _ extends Schema {
            };
            const typeid = reflectionType.id;
            types[typeid] = schema;
            context.add(schema, typeid);
            return types;
        }, {});
        reflection.types.forEach((reflectionType) => {
            const schemaType = schemaTypes[reflectionType.id];
            reflectionType.fields.forEach(field => {
                if (field.referencedType !== undefined) {
                    let fieldType = field.type;
                    let refType = schemaTypes[field.referencedType];
                    // map or array of primitive type (-1)
                    if (!refType) {
                        const typeInfo = field.type.split(":");
                        fieldType = typeInfo[0];
                        refType = typeInfo[1];
                    }
                    if (fieldType === "ref") {
                        type(refType, { context })(schemaType.prototype, field.name);
                    }
                    else {
                        type({ [fieldType]: refType }, { context })(schemaType.prototype, field.name);
                    }
                }
                else {
                    type(field.type, { context })(schemaType.prototype, field.name);
                }
            });
        });
        const rootType = schemaTypes[reflection.rootType];
        const rootInstance = new rootType();
        /**
         * auto-initialize referenced types on root type
         * to allow registering listeners immediatelly on client-side
         */
        for (let fieldName in rootType._definition.schema) {
            const fieldType = rootType._definition.schema[fieldName];
            if (typeof (fieldType) !== "string") {
                rootInstance[fieldName] = (typeof (fieldType) === "function")
                    ? new fieldType() // is a schema reference
                    : new (getType(Object.keys(fieldType)[0])).constructor(); // is a "collection"
            }
        }
        return rootInstance;
    }
}
__decorate([
    type([ReflectionType], reflectionContext)
], Reflection.prototype, "types", void 0);
__decorate([
    type("number", reflectionContext)
], Reflection.prototype, "rootType", void 0);

registerType("map", { constructor: MapSchema });
registerType("array", { constructor: ArraySchema });
registerType("set", { constructor: SetSchema });
registerType("collection", { constructor: CollectionSchema, });

var Protocol = /* @__PURE__ */ ((Protocol2) => {
  Protocol2[Protocol2["JOIN_ROOM"] = 10] = "JOIN_ROOM";
  Protocol2[Protocol2["ERROR"] = 11] = "ERROR";
  Protocol2[Protocol2["LEAVE_ROOM"] = 12] = "LEAVE_ROOM";
  Protocol2[Protocol2["ROOM_DATA"] = 13] = "ROOM_DATA";
  Protocol2[Protocol2["ROOM_STATE"] = 14] = "ROOM_STATE";
  Protocol2[Protocol2["ROOM_STATE_PATCH"] = 15] = "ROOM_STATE_PATCH";
  Protocol2[Protocol2["ROOM_DATA_SCHEMA"] = 16] = "ROOM_DATA_SCHEMA";
  Protocol2[Protocol2["ROOM_DATA_BYTES"] = 17] = "ROOM_DATA_BYTES";
  Protocol2[Protocol2["WS_CLOSE_NORMAL"] = 1e3] = "WS_CLOSE_NORMAL";
  Protocol2[Protocol2["WS_CLOSE_GOING_AWAY"] = 1001] = "WS_CLOSE_GOING_AWAY";
  Protocol2[Protocol2["WS_CLOSE_CONSENTED"] = 4e3] = "WS_CLOSE_CONSENTED";
  Protocol2[Protocol2["WS_CLOSE_WITH_ERROR"] = 4002] = "WS_CLOSE_WITH_ERROR";
  Protocol2[Protocol2["WS_CLOSE_DEVMODE_RESTART"] = 4010] = "WS_CLOSE_DEVMODE_RESTART";
  Protocol2[Protocol2["WS_SERVER_DISCONNECT"] = 4201] = "WS_SERVER_DISCONNECT";
  Protocol2[Protocol2["WS_TOO_MANY_CLIENTS"] = 4202] = "WS_TOO_MANY_CLIENTS";
  return Protocol2;
})(Protocol || {});
var ErrorCode = /* @__PURE__ */ ((ErrorCode2) => {
  ErrorCode2[ErrorCode2["MATCHMAKE_NO_HANDLER"] = 4210] = "MATCHMAKE_NO_HANDLER";
  ErrorCode2[ErrorCode2["MATCHMAKE_INVALID_CRITERIA"] = 4211] = "MATCHMAKE_INVALID_CRITERIA";
  ErrorCode2[ErrorCode2["MATCHMAKE_INVALID_ROOM_ID"] = 4212] = "MATCHMAKE_INVALID_ROOM_ID";
  ErrorCode2[ErrorCode2["MATCHMAKE_UNHANDLED"] = 4213] = "MATCHMAKE_UNHANDLED";
  ErrorCode2[ErrorCode2["MATCHMAKE_EXPIRED"] = 4214] = "MATCHMAKE_EXPIRED";
  ErrorCode2[ErrorCode2["AUTH_FAILED"] = 4215] = "AUTH_FAILED";
  ErrorCode2[ErrorCode2["APPLICATION_ERROR"] = 4216] = "APPLICATION_ERROR";
  return ErrorCode2;
})(ErrorCode || {});
const getMessageBytes = {
  [10 /* JOIN_ROOM */]: (reconnectionToken, serializerId, handshake) => {
    let offset = 0;
    const reconnectionTokenLength = utf8Length(reconnectionToken);
    const serializerIdLength = utf8Length(serializerId);
    const handshakeLength = handshake ? handshake.length : 0;
    const buff = Buffer.allocUnsafe(1 + reconnectionTokenLength + serializerIdLength + handshakeLength);
    buff.writeUInt8(10 /* JOIN_ROOM */, offset++);
    utf8Write(buff, offset, reconnectionToken);
    offset += reconnectionTokenLength;
    utf8Write(buff, offset, serializerId);
    offset += serializerIdLength;
    if (handshake) {
      for (let i = 0, l = handshake.length; i < l; i++) {
        buff.writeUInt8(handshake[i], offset++);
      }
    }
    return buff;
  },
  [11 /* ERROR */]: (code, message = "") => {
    const bytes = [11 /* ERROR */];
    encode.number(bytes, code);
    encode.string(bytes, message);
    return bytes;
  },
  [14 /* ROOM_STATE */]: (bytes) => {
    return [14 /* ROOM_STATE */, ...bytes];
  },
  [16 /* ROOM_DATA_SCHEMA */]: (message) => {
    const typeid = message.constructor._typeid;
    if (typeid === void 0) {
      logger.warn("Starting at colyseus >= 0.13 You must provide a type and message when calling `this.broadcast()` or `client.send()`. Please see: https://docs.colyseus.io/migrating/0.13/");
      throw new Error(`an instance of Schema was expected, but ${JSON.stringify(message)} has been provided.`);
    }
    return [16 /* ROOM_DATA_SCHEMA */, typeid, ...message.encodeAll()];
  },
  raw: (code, type, message, rawMessage) => {
    const initialBytes = [code];
    const messageType = typeof type;
    if (messageType === "string") {
      encode.string(initialBytes, type);
    } else if (messageType === "number") {
      encode.number(initialBytes, type);
    } else {
      throw new Error(`Protocol.ROOM_DATA: message type not supported "${type.toString()}"`);
    }
    let arr;
    if (message !== void 0) {
      const encoded = pack(message);
      arr = new Uint8Array(initialBytes.length + encoded.byteLength);
      arr.set(new Uint8Array(initialBytes), 0);
      arr.set(new Uint8Array(encoded), initialBytes.length);
    } else if (rawMessage !== void 0) {
      arr = new Uint8Array(initialBytes.length + (rawMessage.byteLength || rawMessage.length));
      arr.set(new Uint8Array(initialBytes), 0);
      arr.set(new Uint8Array(rawMessage), initialBytes.length);
    } else {
      arr = new Uint8Array(initialBytes);
    }
    return arr;
  }
};
function utf8Write(buff, offset, str = "") {
  buff[offset++] = utf8Length(str) - 1;
  let c = 0;
  for (let i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
      buff[offset++] = c;
    } else if (c < 2048) {
      buff[offset++] = 192 | c >> 6;
      buff[offset++] = 128 | c & 63;
    } else if (c < 55296 || c >= 57344) {
      buff[offset++] = 224 | c >> 12;
      buff[offset++] = 128 | c >> 6 & 63;
      buff[offset++] = 128 | c & 63;
    } else {
      i++;
      c = 65536 + ((c & 1023) << 10 | str.charCodeAt(i) & 1023);
      buff[offset++] = 240 | c >> 18;
      buff[offset++] = 128 | c >> 12 & 63;
      buff[offset++] = 128 | c >> 6 & 63;
      buff[offset++] = 128 | c & 63;
    }
  }
}
function utf8Length(str = "") {
  let c = 0;
  let length = 0;
  for (let i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
      length += 1;
    } else if (c < 2048) {
      length += 2;
    } else if (c < 55296 || c >= 57344) {
      length += 3;
    } else {
      i++;
      length += 4;
    }
  }
  return length + 1;
}

class ServerError extends Error {
  constructor(code = ErrorCode.MATCHMAKE_UNHANDLED, message) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerError);
    }
    this.name = "ServerError";
    this.code = code;
  }
}

debug("colyseus:connection");
debug("colyseus:driver");
const debugError = debug("colyseus:errors");
debug("colyseus:matchmaking");
const debugMessage = debug("colyseus:message");
const debugPatch = debug("colyseus:patch");
debug("colyseus:presence");
const debugAndPrintError = (e) => {
  const message = e instanceof Error ? e.stack : e;
  if (!(e instanceof ServerError)) {
    logger.error(message);
  }
  debugError.call(debugError, message);
};

var random$1 = {exports: {}};

var crypto = require$$5;

if (crypto.randomFillSync) {
  // We reuse buffers with the same size to avoid memory fragmentations
  // for better performance
  var buffers = { };
  random$1.exports = function (bytes) {
    var buffer = buffers[bytes];
    if (!buffer) {
      // `Buffer.allocUnsafe()` faster because it don’t clean memory.
      // We do not need it, since we will fill memory with new bytes anyway.
      buffer = Buffer.allocUnsafe(bytes);
      if (bytes <= 255) buffers[bytes] = buffer;
    }
    return crypto.randomFillSync(buffer)
  };
} else {
  random$1.exports = crypto.randomBytes;
}

var randomExports = random$1.exports;

// This alphabet uses a-z A-Z 0-9 _- symbols.
// Despite the fact the source code is quite long, its entropy
// is low and there are lots of duplicates - just what compressors
// like GZIP and Brotli likes the best.

/**
 * URL safe symbols.
 *
 * @name url
 * @type {string}
 *
 * @example
 * const url = require('nanoid/url')
 * generate(url, 10) //=> "Uakgb_J5m9"
 */

// This alphabet uses a-z A-Z 0-9 _- symbols.
// Symbols are generated for smaller size.
// -_zyxwvutsrqponmlkjihgfedcba9876543210ZYXWVUTSRQPONMLKJIHGFEDCBA
var url$1 = '-_';
var i = 36;
while (i--) {
  // 36 is radix. Number.prototype.toString(36) returns number
  // in Base36 representation. Base36 is like hex, but it uses 0–9 and a-z.
  url$1 += i.toString(36);
  i > 9 && (url$1 += i.toString(36).toUpperCase());
}

var random = randomExports;
var url = url$1;

/**
 * Generate secure URL-friendly unique ID.
 *
 * By default, ID will have 21 symbols to have a collision probability similar
 * to UUID v4.
 *
 * @param {number} [size=21] The number of symbols in ID.
 *
 * @return {string} Random string.
 *
 * @example
 * const nanoid = require('nanoid')
 * model.id = nanoid() //=> "Uakgb_J5m9g-0JDMbcJqL"
 *
 * @name nanoid
 * @function
 */
var nanoid = function (size) {
  size = size || 21;
  var bytes = random(size);
  var id = '';
  // Compact alternative for `for (var i = 0; i < size; i++)`
  while (size--) {
    // We can’t use bytes bigger than the alphabet. 63 is 00111111 bitmask.
    // This mask reduces random byte 0-255 to 0-63 values.
    // There is no need in `|| ''` and `* 1.6` hacks in here,
    // because bitmask trim bytes exact to alphabet size.
    id += url[bytes[size] & 63];
  }
  return id
};

const nanoid$1 = /*@__PURE__*/getDefaultExportFromCjs(nanoid);

Number(process.env.COLYSEUS_PRESENCE_SHORT_TIMEOUT || 2e3);
function generateId(length = 9) {
  return nanoid$1(length);
}
function spliceOne(arr, index) {
  if (index === -1 || index >= arr.length) {
    return false;
  }
  const len = arr.length - 1;
  for (let i = index; i < len; i++) {
    arr[i] = arr[i + 1];
  }
  arr.length = len;
  return true;
}
class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  then(func) {
    return this.promise.then.apply(this.promise, arguments);
  }
  catch(func) {
    return this.promise.catch(func);
  }
}
addExtension({
  Class: Schema,
  type: 0,
  read(datum) {
    return datum;
  },
  write(instance) {
    return instance.toJSON();
  }
});

debug("colyseus:devmode");
let isDevMode = false;

let ColyseusAuth = void 0;
try {
  ColyseusAuth = require("@colyseus/auth");
} catch (e) {
}

var bufferUtil$1 = {exports: {}};

var constants = {
  BINARY_TYPES: ['nodebuffer', 'arraybuffer', 'fragments'],
  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
  kStatusCode: Symbol('status-code'),
  kWebSocket: Symbol('websocket'),
  EMPTY_BUFFER: Buffer.alloc(0),
  NOOP: () => {}
};

const __viteOptionalPeerDep_bufferutil_ws = {};

const __viteOptionalPeerDep_bufferutil_ws$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: __viteOptionalPeerDep_bufferutil_ws
}, Symbol.toStringTag, { value: 'Module' }));

const require$$1 = /*@__PURE__*/getAugmentedNamespace(__viteOptionalPeerDep_bufferutil_ws$1);

const { EMPTY_BUFFER: EMPTY_BUFFER$3 } = constants;

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
function concat$1(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER$3;
  if (list.length === 1) return list[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    target.set(buf, offset);
    offset += buf.length;
  }

  if (offset < totalLength) return target.slice(0, offset);

  return target;
}

/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
function _mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
function _unmask(buffer, mask) {
  // Required until https://github.com/nodejs/node/issues/9006 is resolved.
  const length = buffer.length;
  for (let i = 0; i < length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} buf The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 * @public
 */
function toArrayBuffer$1(buf) {
  if (buf.byteLength === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/**
 * Converts `data` to a `Buffer`.
 *
 * @param {*} data The data to convert
 * @return {Buffer} The buffer
 * @throws {TypeError}
 * @public
 */
function toBuffer$2(data) {
  toBuffer$2.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

  let buf;

  if (data instanceof ArrayBuffer) {
    buf = Buffer.from(data);
  } else if (ArrayBuffer.isView(data)) {
    buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buf = Buffer.from(data);
    toBuffer$2.readOnly = false;
  }

  return buf;
}

try {
  const bufferUtil = require$$1;
  const bu = bufferUtil.BufferUtil || bufferUtil;

  bufferUtil$1.exports = {
    concat: concat$1,
    mask(source, mask, output, offset, length) {
      if (length < 48) _mask(source, mask, output, offset, length);
      else bu.mask(source, mask, output, offset, length);
    },
    toArrayBuffer: toArrayBuffer$1,
    toBuffer: toBuffer$2,
    unmask(buffer, mask) {
      if (buffer.length < 32) _unmask(buffer, mask);
      else bu.unmask(buffer, mask);
    }
  };
} catch (e) /* istanbul ignore next */ {
  bufferUtil$1.exports = {
    concat: concat$1,
    mask: _mask,
    toArrayBuffer: toArrayBuffer$1,
    toBuffer: toBuffer$2,
    unmask: _unmask
  };
}

var bufferUtilExports = bufferUtil$1.exports;

const kDone = Symbol('kDone');
const kRun = Symbol('kRun');

/**
 * A very simple job queue with adjustable concurrency. Adapted from
 * https://github.com/STRML/async-limiter
 */
let Limiter$1 = class Limiter {
  /**
   * Creates a new `Limiter`.
   *
   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
   *     to run concurrently
   */
  constructor(concurrency) {
    this[kDone] = () => {
      this.pending--;
      this[kRun]();
    };
    this.concurrency = concurrency || Infinity;
    this.jobs = [];
    this.pending = 0;
  }

  /**
   * Adds a job to the queue.
   *
   * @param {Function} job The job to run
   * @public
   */
  add(job) {
    this.jobs.push(job);
    this[kRun]();
  }

  /**
   * Removes a job from the queue and runs it if possible.
   *
   * @private
   */
  [kRun]() {
    if (this.pending === this.concurrency) return;

    if (this.jobs.length) {
      const job = this.jobs.shift();

      this.pending++;
      job(this[kDone]);
    }
  }
};

var limiter = Limiter$1;

const zlib = require$$0$2;

const bufferUtil = bufferUtilExports;
const Limiter = limiter;
const { kStatusCode: kStatusCode$2, NOOP: NOOP$1 } = constants;

const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError = Symbol('error');

//
// We limit zlib concurrency, which prevents severe memory fragmentation
// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
// and https://github.com/websockets/ws/issues/1202
//
// Intentionally global; it's the global thread pool that's an issue.
//
let zlibLimiter;

/**
 * permessage-deflate implementation.
 */
let PerMessageDeflate$4 = class PerMessageDeflate {
  /**
   * Creates a PerMessageDeflate instance.
   *
   * @param {Object} [options] Configuration options
   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
   *     disabling of server context takeover
   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
   *     acknowledge disabling of client context takeover
   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
   *     use of a custom server window size
   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
   *     for, or request, a custom client window size
   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
   *     deflate
   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
   *     inflate
   * @param {Number} [options.threshold=1024] Size (in bytes) below which
   *     messages should not be compressed
   * @param {Number} [options.concurrencyLimit=10] The number of concurrent
   *     calls to zlib
   * @param {Boolean} [isServer=false] Create the instance in either server or
   *     client mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(options, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold =
      this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;

    this.params = null;

    if (!zlibLimiter) {
      const concurrency =
        this._options.concurrencyLimit !== undefined
          ? this._options.concurrencyLimit
          : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }

  /**
   * @type {String}
   */
  static get extensionName() {
    return 'permessage-deflate';
  }

  /**
   * Create an extension negotiation offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer() {
    const params = {};

    if (this._options.serverNoContextTakeover) {
      params.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      params.client_no_context_takeover = true;
    }
    if (this._options.serverMaxWindowBits) {
      params.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (this._options.clientMaxWindowBits) {
      params.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits == null) {
      params.client_max_window_bits = true;
    }

    return params;
  }

  /**
   * Accept an extension negotiation offer/response.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Object} Accepted configuration
   * @public
   */
  accept(configurations) {
    configurations = this.normalizeParams(configurations);

    this.params = this._isServer
      ? this.acceptAsServer(configurations)
      : this.acceptAsClient(configurations);

    return this.params;
  }

  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }

    if (this._deflate) {
      const callback = this._deflate[kCallback];

      this._deflate.close();
      this._deflate = null;

      if (callback) {
        callback(
          new Error(
            'The deflate stream was closed while data was being processed'
          )
        );
      }
    }
  }

  /**
   *  Accept an extension negotiation offer.
   *
   * @param {Array} offers The extension negotiation offers
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer(offers) {
    const opts = this._options;
    const accepted = offers.find((params) => {
      if (
        (opts.serverNoContextTakeover === false &&
          params.server_no_context_takeover) ||
        (params.server_max_window_bits &&
          (opts.serverMaxWindowBits === false ||
            (typeof opts.serverMaxWindowBits === 'number' &&
              opts.serverMaxWindowBits > params.server_max_window_bits))) ||
        (typeof opts.clientMaxWindowBits === 'number' &&
          !params.client_max_window_bits)
      ) {
        return false;
      }

      return true;
    });

    if (!accepted) {
      throw new Error('None of the extension offers can be accepted');
    }

    if (opts.serverNoContextTakeover) {
      accepted.server_no_context_takeover = true;
    }
    if (opts.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof opts.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = opts.serverMaxWindowBits;
    }
    if (typeof opts.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = opts.clientMaxWindowBits;
    } else if (
      accepted.client_max_window_bits === true ||
      opts.clientMaxWindowBits === false
    ) {
      delete accepted.client_max_window_bits;
    }

    return accepted;
  }

  /**
   * Accept the extension negotiation response.
   *
   * @param {Array} response The extension negotiation response
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient(response) {
    const params = response[0];

    if (
      this._options.clientNoContextTakeover === false &&
      params.client_no_context_takeover
    ) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }

    if (!params.client_max_window_bits) {
      if (typeof this._options.clientMaxWindowBits === 'number') {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      }
    } else if (
      this._options.clientMaxWindowBits === false ||
      (typeof this._options.clientMaxWindowBits === 'number' &&
        params.client_max_window_bits > this._options.clientMaxWindowBits)
    ) {
      throw new Error(
        'Unexpected or invalid parameter "client_max_window_bits"'
      );
    }

    return params;
  }

  /**
   * Normalize parameters.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Array} The offers/response with normalized parameters
   * @private
   */
  normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((key) => {
        let value = params[key];

        if (value.length > 1) {
          throw new Error(`Parameter "${key}" must have only a single value`);
        }

        value = value[0];

        if (key === 'client_max_window_bits') {
          if (value !== true) {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(
                `Invalid value for parameter "${key}": ${value}`
              );
            }
            value = num;
          } else if (!this._isServer) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else if (key === 'server_max_window_bits') {
          const num = +value;
          if (!Number.isInteger(num) || num < 8 || num > 15) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
          value = num;
        } else if (
          key === 'client_no_context_takeover' ||
          key === 'server_no_context_takeover'
        ) {
          if (value !== true) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else {
          throw new Error(`Unknown parameter "${key}"`);
        }

        params[key] = value;
      });
    });

    return configurations;
  }

  /**
   * Decompress data. Concurrency limited.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Compress data. Concurrency limited.
   *
   * @param {Buffer} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Decompress data.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }

    this._inflate[kCallback] = callback;

    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);

    this._inflate.flush(() => {
      const err = this._inflate[kError];

      if (err) {
        this._inflate.close();
        this._inflate = null;
        callback(err);
        return;
      }

      const data = bufferUtil.concat(
        this._inflate[kBuffers],
        this._inflate[kTotalLength]
      );

      if (this._inflate._readableState.endEmitted) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];

        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._inflate.reset();
        }
      }

      callback(null, data);
    });
  }

  /**
   * Compress data.
   *
   * @param {Buffer} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _compress(data, fin, callback) {
    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits
      });

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      //
      // An `'error'` event is emitted, only on Node.js < 10.0.0, if the
      // `zlib.DeflateRaw` instance is closed while data is being processed.
      // This can happen if `PerMessageDeflate#cleanup()` is called at the wrong
      // time due to an abnormal WebSocket closure.
      //
      this._deflate.on('error', NOOP$1);
      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;

    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) {
        //
        // The deflate stream was closed while data was being processed.
        //
        return;
      }

      let data = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (fin) data = data.slice(0, data.length - 4);

      //
      // Ensure that the callback will not be called again in
      // `PerMessageDeflate#cleanup()`.
      //
      this._deflate[kCallback] = null;

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      if (fin && this.params[`${endpoint}_no_context_takeover`]) {
        this._deflate.reset();
      }

      callback(null, data);
    });
  }
};

var permessageDeflate = PerMessageDeflate$4;

/**
 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;

  if (
    this[kPerMessageDeflate]._maxPayload < 1 ||
    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
  ) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError] = new RangeError('Max payload size exceeded');
  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
  this[kError][kStatusCode$2] = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError(err) {
  //
  // There is no need to call `Zlib#close()` as the handle is automatically
  // closed when an error is emitted.
  //
  this[kPerMessageDeflate]._inflate = null;
  err[kStatusCode$2] = 1007;
  this[kCallback](err);
}

var validation = {exports: {}};

const __viteOptionalPeerDep_utf8Validate_ws = {};

const __viteOptionalPeerDep_utf8Validate_ws$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: __viteOptionalPeerDep_utf8Validate_ws
}, Symbol.toStringTag, { value: 'Module' }));

const require$$0 = /*@__PURE__*/getAugmentedNamespace(__viteOptionalPeerDep_utf8Validate_ws$1);

/**
 * Checks if a status code is allowed in a close frame.
 *
 * @param {Number} code The status code
 * @return {Boolean} `true` if the status code is valid, else `false`
 * @public
 */
function isValidStatusCode$2(code) {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

/**
 * Checks if a given buffer contains only correct UTF-8.
 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
 * Markus Kuhn.
 *
 * @param {Buffer} buf The buffer to check
 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
 * @public
 */
function _isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;

  while (i < len) {
    if ((buf[i] & 0x80) === 0) {
      // 0xxxxxxx
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {
      // 110xxxxx 10xxxxxx
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0 // Overlong
      ) {
        return false;
      }

      i += 2;
    } else if ((buf[i] & 0xf0) === 0xe0) {
      // 1110xxxx 10xxxxxx 10xxxxxx
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
      ) {
        return false;
      }

      i += 3;
    } else if ((buf[i] & 0xf8) === 0xf0) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
        buf[i] > 0xf4 // > U+10FFFF
      ) {
        return false;
      }

      i += 4;
    } else {
      return false;
    }
  }

  return true;
}

try {
  let isValidUTF8 = require$$0;

  /* istanbul ignore if */
  if (typeof isValidUTF8 === 'object') {
    isValidUTF8 = isValidUTF8.Validation.isValidUTF8; // utf-8-validate@<3.0.0
  }

  validation.exports = {
    isValidStatusCode: isValidStatusCode$2,
    isValidUTF8(buf) {
      return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
    }
  };
} catch (e) /* istanbul ignore next */ {
  validation.exports = {
    isValidStatusCode: isValidStatusCode$2,
    isValidUTF8: _isValidUTF8
  };
}

var validationExports = validation.exports;

const { Writable } = require$$0$3;

const PerMessageDeflate$3 = permessageDeflate;
const {
  BINARY_TYPES: BINARY_TYPES$1,
  EMPTY_BUFFER: EMPTY_BUFFER$2,
  kStatusCode: kStatusCode$1,
  kWebSocket: kWebSocket$2
} = constants;
const { concat, toArrayBuffer, unmask } = bufferUtilExports;
const { isValidStatusCode: isValidStatusCode$1, isValidUTF8 } = validationExports;

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;

/**
 * HyBi Receiver implementation.
 *
 * @extends Writable
 */
let Receiver$1 = class Receiver extends Writable {
  /**
   * Creates a Receiver instance.
   *
   * @param {String} [binaryType=nodebuffer] The type for binary data
   * @param {Object} [extensions] An object containing the negotiated extensions
   * @param {Boolean} [isServer=false] Specifies whether to operate in client or
   *     server mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(binaryType, extensions, isServer, maxPayload) {
    super();

    this._binaryType = binaryType || BINARY_TYPES$1[0];
    this[kWebSocket$2] = undefined;
    this._extensions = extensions || {};
    this._isServer = !!isServer;
    this._maxPayload = maxPayload | 0;

    this._bufferedBytes = 0;
    this._buffers = [];

    this._compressed = false;
    this._payloadLength = 0;
    this._mask = undefined;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._opcode = 0;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];

    this._state = GET_INFO;
    this._loop = false;
  }

  /**
   * Implements `Writable.prototype._write()`.
   *
   * @param {Buffer} chunk The chunk of data to write
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} cb Callback
   * @private
   */
  _write(chunk, encoding, cb) {
    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(cb);
  }

  /**
   * Consumes `n` bytes from the buffered data.
   *
   * @param {Number} n The number of bytes to consume
   * @return {Buffer} The consumed bytes
   * @private
   */
  consume(n) {
    this._bufferedBytes -= n;

    if (n === this._buffers[0].length) return this._buffers.shift();

    if (n < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = buf.slice(n);
      return buf.slice(0, n);
    }

    const dst = Buffer.allocUnsafe(n);

    do {
      const buf = this._buffers[0];
      const offset = dst.length - n;

      if (n >= buf.length) {
        dst.set(this._buffers.shift(), offset);
      } else {
        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
        this._buffers[0] = buf.slice(n);
      }

      n -= buf.length;
    } while (n > 0);

    return dst;
  }

  /**
   * Starts the parsing loop.
   *
   * @param {Function} cb Callback
   * @private
   */
  startLoop(cb) {
    let err;
    this._loop = true;

    do {
      switch (this._state) {
        case GET_INFO:
          err = this.getInfo();
          break;
        case GET_PAYLOAD_LENGTH_16:
          err = this.getPayloadLength16();
          break;
        case GET_PAYLOAD_LENGTH_64:
          err = this.getPayloadLength64();
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          err = this.getData(cb);
          break;
        default:
          // `INFLATING`
          this._loop = false;
          return;
      }
    } while (this._loop);

    cb(err);
  }

  /**
   * Reads the first two bytes of a frame.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getInfo() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buf = this.consume(2);

    if ((buf[0] & 0x30) !== 0x00) {
      this._loop = false;
      return error(
        RangeError,
        'RSV2 and RSV3 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_2_3'
      );
    }

    const compressed = (buf[0] & 0x40) === 0x40;

    if (compressed && !this._extensions[PerMessageDeflate$3.extensionName]) {
      this._loop = false;
      return error(
        RangeError,
        'RSV1 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_1'
      );
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        this._loop = false;
        return error(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
      }

      if (!this._fragmented) {
        this._loop = false;
        return error(
          RangeError,
          'invalid opcode 0',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
      }

      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        this._loop = false;
        return error(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
      }

      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        this._loop = false;
        return error(
          RangeError,
          'FIN must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_FIN'
        );
      }

      if (compressed) {
        this._loop = false;
        return error(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
      }

      if (this._payloadLength > 0x7d) {
        this._loop = false;
        return error(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );
      }
    } else {
      this._loop = false;
      return error(
        RangeError,
        `invalid opcode ${this._opcode}`,
        true,
        1002,
        'WS_ERR_INVALID_OPCODE'
      );
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buf[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        this._loop = false;
        return error(
          RangeError,
          'MASK must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_MASK'
        );
      }
    } else if (this._masked) {
      this._loop = false;
      return error(
        RangeError,
        'MASK must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_MASK'
      );
    }

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else return this.haveLength();
  }

  /**
   * Gets extended payload length (7+16).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength16() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    return this.haveLength();
  }

  /**
   * Gets extended payload length (7+64).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength64() {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buf = this.consume(8);
    const num = buf.readUInt32BE(0);

    //
    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
    // if payload length is greater than this number.
    //
    if (num > Math.pow(2, 53 - 32) - 1) {
      this._loop = false;
      return error(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009,
        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
      );
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    return this.haveLength();
  }

  /**
   * Payload length has been read.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  haveLength() {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        this._loop = false;
        return error(
          RangeError,
          'Max payload size exceeded',
          false,
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
        );
      }
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }

    this._mask = this.consume(4);
    this._state = GET_DATA;
  }

  /**
   * Reads data bytes.
   *
   * @param {Function} cb Callback
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  getData(cb) {
    let data = EMPTY_BUFFER$2;

    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }

      data = this.consume(this._payloadLength);
      if (this._masked) unmask(data, this._mask);
    }

    if (this._opcode > 0x07) return this.controlMessage(data);

    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, cb);
      return;
    }

    if (data.length) {
      //
      // This message is not compressed so its lenght is the sum of the payload
      // length of all fragments.
      //
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }

    return this.dataMessage();
  }

  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @param {Function} cb Callback
   * @private
   */
  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate$3.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) return cb(err);

      if (buf.length) {
        this._messageLength += buf.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          return cb(
            error(
              RangeError,
              'Max payload size exceeded',
              false,
              1009,
              'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
            )
          );
        }

        this._fragments.push(buf);
      }

      const er = this.dataMessage();
      if (er) return cb(er);

      this.startLoop(cb);
    });
  }

  /**
   * Handles a data message.
   *
   * @return {(Error|undefined)} A possible error
   * @private
   */
  dataMessage() {
    if (this._fin) {
      const messageLength = this._messageLength;
      const fragments = this._fragments;

      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];

      if (this._opcode === 2) {
        let data;

        if (this._binaryType === 'nodebuffer') {
          data = concat(fragments, messageLength);
        } else if (this._binaryType === 'arraybuffer') {
          data = toArrayBuffer(concat(fragments, messageLength));
        } else {
          data = fragments;
        }

        this.emit('message', data);
      } else {
        const buf = concat(fragments, messageLength);

        if (!isValidUTF8(buf)) {
          this._loop = false;
          return error(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );
        }

        this.emit('message', buf.toString());
      }
    }

    this._state = GET_INFO;
  }

  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  controlMessage(data) {
    if (this._opcode === 0x08) {
      this._loop = false;

      if (data.length === 0) {
        this.emit('conclude', 1005, '');
        this.end();
      } else if (data.length === 1) {
        return error(
          RangeError,
          'invalid payload length 1',
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode$1(code)) {
          return error(
            RangeError,
            `invalid status code ${code}`,
            true,
            1002,
            'WS_ERR_INVALID_CLOSE_CODE'
          );
        }

        const buf = data.slice(2);

        if (!isValidUTF8(buf)) {
          return error(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );
        }

        this.emit('conclude', code, buf.toString());
        this.end();
      }
    } else if (this._opcode === 0x09) {
      this.emit('ping', data);
    } else {
      this.emit('pong', data);
    }

    this._state = GET_INFO;
  }
};

var receiver = Receiver$1;

/**
 * Builds an error object.
 *
 * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
 * @param {String} message The error message
 * @param {Boolean} prefix Specifies whether or not to add a default prefix to
 *     `message`
 * @param {Number} statusCode The status code
 * @param {String} errorCode The exposed error code
 * @return {(Error|RangeError)} The error
 * @private
 */
function error(ErrorCtor, message, prefix, statusCode, errorCode) {
  const err = new ErrorCtor(
    prefix ? `Invalid WebSocket frame: ${message}` : message
  );

  Error.captureStackTrace(err, error);
  err.code = errorCode;
  err[kStatusCode$1] = statusCode;
  return err;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls$" }] */
const { randomFillSync } = require$$5;

const PerMessageDeflate$2 = permessageDeflate;
const { EMPTY_BUFFER: EMPTY_BUFFER$1 } = constants;
const { isValidStatusCode } = validationExports;
const { mask: applyMask, toBuffer: toBuffer$1 } = bufferUtilExports;

const mask = Buffer.alloc(4);

/**
 * HyBi Sender implementation.
 */
let Sender$1 = class Sender {
  /**
   * Creates a Sender instance.
   *
   * @param {(net.Socket|tls.Socket)} socket The connection socket
   * @param {Object} [extensions] An object containing the negotiated extensions
   */
  constructor(socket, extensions) {
    this._extensions = extensions || {};
    this._socket = socket;

    this._firstFragment = true;
    this._compress = false;

    this._bufferedBytes = 0;
    this._deflating = false;
    this._queue = [];
  }

  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {Buffer} data The data to frame
   * @param {Object} options Options object
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @return {Buffer[]} The framed data as a list of `Buffer` instances
   * @public
   */
  static frame(data, options) {
    const merge = options.mask && options.readOnly;
    let offset = options.mask ? 6 : 2;
    let payloadLength = data.length;

    if (data.length >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (data.length > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(merge ? data.length + offset : offset);

    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    target[1] = payloadLength;

    if (payloadLength === 126) {
      target.writeUInt16BE(data.length, 2);
    } else if (payloadLength === 127) {
      target.writeUInt32BE(0, 2);
      target.writeUInt32BE(data.length, 6);
    }

    if (!options.mask) return [target, data];

    randomFillSync(mask, 0, 4);

    target[1] |= 0x80;
    target[offset - 4] = mask[0];
    target[offset - 3] = mask[1];
    target[offset - 2] = mask[2];
    target[offset - 1] = mask[3];

    if (merge) {
      applyMask(data, mask, target, offset, data.length);
      return [target];
    }

    applyMask(data, mask, data, 0, data.length);
    return [target, data];
  }

  /**
   * Sends a close message to the other peer.
   *
   * @param {Number} [code] The status code component of the body
   * @param {String} [data] The message component of the body
   * @param {Boolean} [mask=false] Specifies whether or not to mask the message
   * @param {Function} [cb] Callback
   * @public
   */
  close(code, data, mask, cb) {
    let buf;

    if (code === undefined) {
      buf = EMPTY_BUFFER$1;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('First argument must be a valid error code number');
    } else if (data === undefined || data === '') {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      const length = Buffer.byteLength(data);

      if (length > 123) {
        throw new RangeError('The message must not be greater than 123 bytes');
      }

      buf = Buffer.allocUnsafe(2 + length);
      buf.writeUInt16BE(code, 0);
      buf.write(data, 2);
    }

    if (this._deflating) {
      this.enqueue([this.doClose, buf, mask, cb]);
    } else {
      this.doClose(buf, mask, cb);
    }
  }

  /**
   * Frames and sends a close message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @private
   */
  doClose(data, mask, cb) {
    this.sendFrame(
      Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x08,
        mask,
        readOnly: false
      }),
      cb
    );
  }

  /**
   * Sends a ping message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  ping(data, mask, cb) {
    const buf = toBuffer$1(data);

    if (buf.length > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    if (this._deflating) {
      this.enqueue([this.doPing, buf, mask, toBuffer$1.readOnly, cb]);
    } else {
      this.doPing(buf, mask, toBuffer$1.readOnly, cb);
    }
  }

  /**
   * Frames and sends a ping message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Boolean} [readOnly=false] Specifies whether `data` can be modified
   * @param {Function} [cb] Callback
   * @private
   */
  doPing(data, mask, readOnly, cb) {
    this.sendFrame(
      Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x09,
        mask,
        readOnly
      }),
      cb
    );
  }

  /**
   * Sends a pong message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  pong(data, mask, cb) {
    const buf = toBuffer$1(data);

    if (buf.length > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    if (this._deflating) {
      this.enqueue([this.doPong, buf, mask, toBuffer$1.readOnly, cb]);
    } else {
      this.doPong(buf, mask, toBuffer$1.readOnly, cb);
    }
  }

  /**
   * Frames and sends a pong message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Boolean} [readOnly=false] Specifies whether `data` can be modified
   * @param {Function} [cb] Callback
   * @private
   */
  doPong(data, mask, readOnly, cb) {
    this.sendFrame(
      Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x0a,
        mask,
        readOnly
      }),
      cb
    );
  }

  /**
   * Sends a data message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} [options.compress=false] Specifies whether or not to
   *     compress `data`
   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
   *     or text
   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Function} [cb] Callback
   * @public
   */
  send(data, options, cb) {
    const buf = toBuffer$1(data);
    const perMessageDeflate = this._extensions[PerMessageDeflate$2.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = options.compress;

    if (this._firstFragment) {
      this._firstFragment = false;
      if (rsv1 && perMessageDeflate) {
        rsv1 = buf.length >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

    if (perMessageDeflate) {
      const opts = {
        fin: options.fin,
        rsv1,
        opcode,
        mask: options.mask,
        readOnly: toBuffer$1.readOnly
      };

      if (this._deflating) {
        this.enqueue([this.dispatch, buf, this._compress, opts, cb]);
      } else {
        this.dispatch(buf, this._compress, opts, cb);
      }
    } else {
      this.sendFrame(
        Sender.frame(buf, {
          fin: options.fin,
          rsv1: false,
          opcode,
          mask: options.mask,
          readOnly: toBuffer$1.readOnly
        }),
        cb
      );
    }
  }

  /**
   * Dispatches a data message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     `data`
   * @param {Object} options Options object
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  dispatch(data, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, options), cb);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate$2.extensionName];

    this._bufferedBytes += data.length;
    this._deflating = true;
    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      if (this._socket.destroyed) {
        const err = new Error(
          'The socket was closed while data was being compressed'
        );

        if (typeof cb === 'function') cb(err);

        for (let i = 0; i < this._queue.length; i++) {
          const callback = this._queue[i][4];

          if (typeof callback === 'function') callback(err);
        }

        return;
      }

      this._bufferedBytes -= data.length;
      this._deflating = false;
      options.readOnly = false;
      this.sendFrame(Sender.frame(buf, options), cb);
      this.dequeue();
    });
  }

  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue() {
    while (!this._deflating && this._queue.length) {
      const params = this._queue.shift();

      this._bufferedBytes -= params[1].length;
      Reflect.apply(params[0], this, params.slice(1));
    }
  }

  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue(params) {
    this._bufferedBytes += params[1].length;
    this._queue.push(params);
  }

  /**
   * Sends a frame.
   *
   * @param {Buffer[]} list The frame to send
   * @param {Function} [cb] Callback
   * @private
   */
  sendFrame(list, cb) {
    if (list.length === 2) {
      this._socket.cork();
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
      this._socket.uncork();
    } else {
      this._socket.write(list[0], cb);
    }
  }
};

var sender = Sender$1;

/**
 * Class representing an event.
 *
 * @private
 */
class Event {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @param {Object} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(type, target) {
    this.target = target;
    this.type = type;
  }
}

/**
 * Class representing a message event.
 *
 * @extends Event
 * @private
 */
class MessageEvent extends Event {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {(String|Buffer|ArrayBuffer|Buffer[])} data The received data
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(data, target) {
    super('message', target);

    this.data = data;
  }
}

/**
 * Class representing a close event.
 *
 * @extends Event
 * @private
 */
class CloseEvent extends Event {
  /**
   * Create a new `CloseEvent`.
   *
   * @param {Number} code The status code explaining why the connection is being
   *     closed
   * @param {String} reason A human-readable string explaining why the
   *     connection is closing
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(code, reason, target) {
    super('close', target);

    this.wasClean = target._closeFrameReceived && target._closeFrameSent;
    this.reason = reason;
    this.code = code;
  }
}

/**
 * Class representing an open event.
 *
 * @extends Event
 * @private
 */
class OpenEvent extends Event {
  /**
   * Create a new `OpenEvent`.
   *
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(target) {
    super('open', target);
  }
}

/**
 * Class representing an error event.
 *
 * @extends Event
 * @private
 */
class ErrorEvent extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param {Object} error The error that generated this event
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(error, target) {
    super('error', target);

    this.message = error.message;
    this.error = error;
  }
}

/**
 * This provides methods for emulating the `EventTarget` interface. It's not
 * meant to be used directly.
 *
 * @mixin
 */
const EventTarget = {
  /**
   * Register an event listener.
   *
   * @param {String} type A string representing the event type to listen for
   * @param {Function} listener The listener to add
   * @param {Object} [options] An options object specifies characteristics about
   *     the event listener
   * @param {Boolean} [options.once=false] A `Boolean`` indicating that the
   *     listener should be invoked at most once after being added. If `true`,
   *     the listener would be automatically removed when invoked.
   * @public
   */
  addEventListener(type, listener, options) {
    if (typeof listener !== 'function') return;

    function onMessage(data) {
      listener.call(this, new MessageEvent(data, this));
    }

    function onClose(code, message) {
      listener.call(this, new CloseEvent(code, message, this));
    }

    function onError(error) {
      listener.call(this, new ErrorEvent(error, this));
    }

    function onOpen() {
      listener.call(this, new OpenEvent(this));
    }

    const method = options && options.once ? 'once' : 'on';

    if (type === 'message') {
      onMessage._listener = listener;
      this[method](type, onMessage);
    } else if (type === 'close') {
      onClose._listener = listener;
      this[method](type, onClose);
    } else if (type === 'error') {
      onError._listener = listener;
      this[method](type, onError);
    } else if (type === 'open') {
      onOpen._listener = listener;
      this[method](type, onOpen);
    } else {
      this[method](type, listener);
    }
  },

  /**
   * Remove an event listener.
   *
   * @param {String} type A string representing the event type to remove
   * @param {Function} listener The listener to remove
   * @public
   */
  removeEventListener(type, listener) {
    const listeners = this.listeners(type);

    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i] === listener || listeners[i]._listener === listener) {
        this.removeListener(type, listeners[i]);
      }
    }
  }
};

var eventTarget = EventTarget;

//
// Allowed token characters:
//
// '!', '#', '$', '%', '&', ''', '*', '+', '-',
// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
//
// tokenChars[32] === 0 // ' '
// tokenChars[33] === 1 // '!'
// tokenChars[34] === 0 // '"'
// ...
//
// prettier-ignore
const tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

/**
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push(dest, name, elem) {
  if (dest[name] === undefined) dest[name] = [elem];
  else dest[name].push(elem);
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse$2(header) {
  const offers = Object.create(null);

  if (header === undefined || header === '') return offers;

  let params = Object.create(null);
  let mustUnescape = false;
  let isEscaping = false;
  let inQuotes = false;
  let extensionName;
  let paramName;
  let start = -1;
  let end = -1;
  let i = 0;

  for (; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 /* ' ' */ || code === 0x09 /* '\t' */) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        const name = header.slice(start, end);
        if (code === 0x2c) {
          push(offers, name, params);
          params = Object.create(null);
        } else {
          extensionName = name;
        }

        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        push(params, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
        paramName = header.slice(start, i);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else {
      //
      // The value of a quoted-string after unescaping must conform to the
      // token ABNF, so only token characters are valid.
      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
      //
      if (isEscaping) {
        if (tokenChars[code] !== 1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (start === -1) start = i;
        else if (!mustUnescape) mustUnescape = true;
        isEscaping = false;
      } else if (inQuotes) {
        if (tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22 /* '"' */ && start !== -1) {
          inQuotes = false;
          end = i;
        } else if (code === 0x5c /* '\' */) {
          isEscaping = true;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
        inQuotes = true;
      } else if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
        if (end === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        let value = header.slice(start, end);
        if (mustUnescape) {
          value = value.replace(/\\/g, '');
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        paramName = undefined;
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
  }

  if (start === -1 || inQuotes) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = i;
  const token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, params);
  } else {
    if (paramName === undefined) {
      push(params, token, true);
    } else if (mustUnescape) {
      push(params, paramName, token.replace(/\\/g, ''));
    } else {
      push(params, paramName, token);
    }
    push(offers, extensionName, params);
  }

  return offers;
}

/**
 * Builds the `Sec-WebSocket-Extensions` header field value.
 *
 * @param {Object} extensions The map of extensions and parameters to format
 * @return {String} A string representing the given object
 * @public
 */
function format$2(extensions) {
  return Object.keys(extensions)
    .map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations)) configurations = [configurations];
      return configurations
        .map((params) => {
          return [extension]
            .concat(
              Object.keys(params).map((k) => {
                let values = params[k];
                if (!Array.isArray(values)) values = [values];
                return values
                  .map((v) => (v === true ? k : `${k}=${v}`))
                  .join('; ');
              })
            )
            .join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

var extension = { format: format$2, parse: parse$2 };

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Readable$" }] */

const EventEmitter$1 = require$$0$4;
const https = require$$1$3;
const http$1 = require$$2;
const net = require$$3;
const tls = require$$4;
const { randomBytes, createHash: createHash$1 } = require$$5;
const { URL } = require$$7;

const PerMessageDeflate$1 = permessageDeflate;
const Receiver = receiver;
const Sender = sender;
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  GUID: GUID$1,
  kStatusCode,
  kWebSocket: kWebSocket$1,
  NOOP
} = constants;
const { addEventListener, removeEventListener } = eventTarget;
const { format: format$1, parse: parse$1 } = extension;
const { toBuffer } = bufferUtilExports;

const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
const protocolVersions = [8, 13];
const closeTimeout = 30 * 1000;

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */
let WebSocket$3 = class WebSocket extends EventEmitter$1 {
  /**
   * Create a new `WebSocket`.
   *
   * @param {(String|URL)} address The URL to which to connect
   * @param {(String|String[])} [protocols] The subprotocols
   * @param {Object} [options] Connection options
   */
  constructor(address, protocols, options) {
    super();

    this._binaryType = BINARY_TYPES[0];
    this._closeCode = 1006;
    this._closeFrameReceived = false;
    this._closeFrameSent = false;
    this._closeMessage = '';
    this._closeTimer = null;
    this._extensions = {};
    this._protocol = '';
    this._readyState = WebSocket.CONNECTING;
    this._receiver = null;
    this._sender = null;
    this._socket = null;

    if (address !== null) {
      this._bufferedAmount = 0;
      this._isServer = false;
      this._redirects = 0;

      if (Array.isArray(protocols)) {
        protocols = protocols.join(', ');
      } else if (typeof protocols === 'object' && protocols !== null) {
        options = protocols;
        protocols = undefined;
      }

      initAsClient(this, address, protocols, options);
    } else {
      this._isServer = true;
    }
  }

  /**
   * This deviates from the WHATWG interface since ws doesn't support the
   * required default "blob" type (instead we define a custom "nodebuffer"
   * type).
   *
   * @type {String}
   */
  get binaryType() {
    return this._binaryType;
  }

  set binaryType(type) {
    if (!BINARY_TYPES.includes(type)) return;

    this._binaryType = type;

    //
    // Allow to change `binaryType` on the fly.
    //
    if (this._receiver) this._receiver._binaryType = type;
  }

  /**
   * @type {Number}
   */
  get bufferedAmount() {
    if (!this._socket) return this._bufferedAmount;

    return this._socket._writableState.length + this._sender._bufferedBytes;
  }

  /**
   * @type {String}
   */
  get extensions() {
    return Object.keys(this._extensions).join();
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onclose() {
    return undefined;
  }

  /* istanbul ignore next */
  set onclose(listener) {}

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onerror() {
    return undefined;
  }

  /* istanbul ignore next */
  set onerror(listener) {}

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onopen() {
    return undefined;
  }

  /* istanbul ignore next */
  set onopen(listener) {}

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onmessage() {
    return undefined;
  }

  /* istanbul ignore next */
  set onmessage(listener) {}

  /**
   * @type {String}
   */
  get protocol() {
    return this._protocol;
  }

  /**
   * @type {Number}
   */
  get readyState() {
    return this._readyState;
  }

  /**
   * @type {String}
   */
  get url() {
    return this._url;
  }

  /**
   * Set up the socket and the internal resources.
   *
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Number} [maxPayload=0] The maximum allowed message size
   * @private
   */
  setSocket(socket, head, maxPayload) {
    const receiver = new Receiver(
      this.binaryType,
      this._extensions,
      this._isServer,
      maxPayload
    );

    this._sender = new Sender(socket, this._extensions);
    this._receiver = receiver;
    this._socket = socket;

    receiver[kWebSocket$1] = this;
    socket[kWebSocket$1] = this;

    receiver.on('conclude', receiverOnConclude);
    receiver.on('drain', receiverOnDrain);
    receiver.on('error', receiverOnError);
    receiver.on('message', receiverOnMessage);
    receiver.on('ping', receiverOnPing);
    receiver.on('pong', receiverOnPong);

    socket.setTimeout(0);
    socket.setNoDelay();

    if (head.length > 0) socket.unshift(head);

    socket.on('close', socketOnClose);
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError$1);

    this._readyState = WebSocket.OPEN;
    this.emit('open');
  }

  /**
   * Emit the `'close'` event.
   *
   * @private
   */
  emitClose() {
    if (!this._socket) {
      this._readyState = WebSocket.CLOSED;
      this.emit('close', this._closeCode, this._closeMessage);
      return;
    }

    if (this._extensions[PerMessageDeflate$1.extensionName]) {
      this._extensions[PerMessageDeflate$1.extensionName].cleanup();
    }

    this._receiver.removeAllListeners();
    this._readyState = WebSocket.CLOSED;
    this.emit('close', this._closeCode, this._closeMessage);
  }

  /**
   * Start a closing handshake.
   *
   *          +----------+   +-----------+   +----------+
   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
   *    |     +----------+   +-----------+   +----------+     |
   *          +----------+   +-----------+         |
   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
   *          +----------+   +-----------+   |
   *    |           |                        |   +---+        |
   *                +------------------------+-->|fin| - - - -
   *    |         +---+                      |   +---+
   *     - - - - -|fin|<---------------------+
   *              +---+
   *
   * @param {Number} [code] Status code explaining why the connection is closing
   * @param {String} [data] A string explaining why the connection is closing
   * @public
   */
  close(code, data) {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      return abortHandshake$1(this, this._req, msg);
    }

    if (this.readyState === WebSocket.CLOSING) {
      if (
        this._closeFrameSent &&
        (this._closeFrameReceived || this._receiver._writableState.errorEmitted)
      ) {
        this._socket.end();
      }

      return;
    }

    this._readyState = WebSocket.CLOSING;
    this._sender.close(code, data, !this._isServer, (err) => {
      //
      // This error is handled by the `'error'` listener on the socket. We only
      // want to know if the close frame has been sent here.
      //
      if (err) return;

      this._closeFrameSent = true;

      if (
        this._closeFrameReceived ||
        this._receiver._writableState.errorEmitted
      ) {
        this._socket.end();
      }
    });

    //
    // Specify a timeout for the closing handshake to complete.
    //
    this._closeTimer = setTimeout(
      this._socket.destroy.bind(this._socket),
      closeTimeout
    );
  }

  /**
   * Send a ping.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the ping is sent
   * @public
   */
  ping(data, mask, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.ping(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Send a pong.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the pong is sent
   * @public
   */
  pong(data, mask, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.pong(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Send a data message.
   *
   * @param {*} data The message to send
   * @param {Object} [options] Options object
   * @param {Boolean} [options.compress] Specifies whether or not to compress
   *     `data`
   * @param {Boolean} [options.binary] Specifies whether `data` is binary or
   *     text
   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when data is written out
   * @public
   */
  send(data, options, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    const opts = {
      binary: typeof data !== 'string',
      mask: !this._isServer,
      compress: true,
      fin: true,
      ...options
    };

    if (!this._extensions[PerMessageDeflate$1.extensionName]) {
      opts.compress = false;
    }

    this._sender.send(data || EMPTY_BUFFER, opts, cb);
  }

  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate() {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      return abortHandshake$1(this, this._req, msg);
    }

    if (this._socket) {
      this._readyState = WebSocket.CLOSING;
      this._socket.destroy();
    }
  }
};

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$3, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$3.prototype, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$3, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$3.prototype, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$3, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$3.prototype, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$3, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$3.prototype, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

[
  'binaryType',
  'bufferedAmount',
  'extensions',
  'protocol',
  'readyState',
  'url'
].forEach((property) => {
  Object.defineProperty(WebSocket$3.prototype, property, { enumerable: true });
});

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
  Object.defineProperty(WebSocket$3.prototype, `on${method}`, {
    enumerable: true,
    get() {
      const listeners = this.listeners(method);
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i]._listener) return listeners[i]._listener;
      }

      return undefined;
    },
    set(listener) {
      const listeners = this.listeners(method);
      for (let i = 0; i < listeners.length; i++) {
        //
        // Remove only the listeners added via `addEventListener`.
        //
        if (listeners[i]._listener) this.removeListener(method, listeners[i]);
      }
      this.addEventListener(method, listener);
    }
  });
});

WebSocket$3.prototype.addEventListener = addEventListener;
WebSocket$3.prototype.removeEventListener = removeEventListener;

var websocket = WebSocket$3;

/**
 * Initialize a WebSocket client.
 *
 * @param {WebSocket} websocket The client to initialize
 * @param {(String|URL)} address The URL to which to connect
 * @param {String} [protocols] The subprotocols
 * @param {Object} [options] Connection options
 * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
 *     permessage-deflate
 * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
 *     handshake request
 * @param {Number} [options.protocolVersion=13] Value of the
 *     `Sec-WebSocket-Version` header
 * @param {String} [options.origin] Value of the `Origin` or
 *     `Sec-WebSocket-Origin` header
 * @param {Number} [options.maxPayload=104857600] The maximum allowed message
 *     size
 * @param {Boolean} [options.followRedirects=false] Whether or not to follow
 *     redirects
 * @param {Number} [options.maxRedirects=10] The maximum number of redirects
 *     allowed
 * @private
 */
function initAsClient(websocket, address, protocols, options) {
  const opts = {
    protocolVersion: protocolVersions[1],
    maxPayload: 100 * 1024 * 1024,
    perMessageDeflate: true,
    followRedirects: false,
    maxRedirects: 10,
    ...options,
    createConnection: undefined,
    socketPath: undefined,
    hostname: undefined,
    protocol: undefined,
    timeout: undefined,
    method: undefined,
    host: undefined,
    path: undefined,
    port: undefined
  };

  if (!protocolVersions.includes(opts.protocolVersion)) {
    throw new RangeError(
      `Unsupported protocol version: ${opts.protocolVersion} ` +
        `(supported versions: ${protocolVersions.join(', ')})`
    );
  }

  let parsedUrl;

  if (address instanceof URL) {
    parsedUrl = address;
    websocket._url = address.href;
  } else {
    parsedUrl = new URL(address);
    websocket._url = address;
  }

  const isUnixSocket = parsedUrl.protocol === 'ws+unix:';

  if (!parsedUrl.host && (!isUnixSocket || !parsedUrl.pathname)) {
    const err = new Error(`Invalid URL: ${websocket.url}`);

    if (websocket._redirects === 0) {
      throw err;
    } else {
      emitErrorAndClose(websocket, err);
      return;
    }
  }

  const isSecure =
    parsedUrl.protocol === 'wss:' || parsedUrl.protocol === 'https:';
  const defaultPort = isSecure ? 443 : 80;
  const key = randomBytes(16).toString('base64');
  const get = isSecure ? https.get : http$1.get;
  let perMessageDeflate;

  opts.createConnection = isSecure ? tlsConnect : netConnect;
  opts.defaultPort = opts.defaultPort || defaultPort;
  opts.port = parsedUrl.port || defaultPort;
  opts.host = parsedUrl.hostname.startsWith('[')
    ? parsedUrl.hostname.slice(1, -1)
    : parsedUrl.hostname;
  opts.headers = {
    'Sec-WebSocket-Version': opts.protocolVersion,
    'Sec-WebSocket-Key': key,
    Connection: 'Upgrade',
    Upgrade: 'websocket',
    ...opts.headers
  };
  opts.path = parsedUrl.pathname + parsedUrl.search;
  opts.timeout = opts.handshakeTimeout;

  if (opts.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate$1(
      opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
      false,
      opts.maxPayload
    );
    opts.headers['Sec-WebSocket-Extensions'] = format$1({
      [PerMessageDeflate$1.extensionName]: perMessageDeflate.offer()
    });
  }
  if (protocols) {
    opts.headers['Sec-WebSocket-Protocol'] = protocols;
  }
  if (opts.origin) {
    if (opts.protocolVersion < 13) {
      opts.headers['Sec-WebSocket-Origin'] = opts.origin;
    } else {
      opts.headers.Origin = opts.origin;
    }
  }
  if (parsedUrl.username || parsedUrl.password) {
    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
  }

  if (isUnixSocket) {
    const parts = opts.path.split(':');

    opts.socketPath = parts[0];
    opts.path = parts[1];
  }

  if (opts.followRedirects) {
    if (websocket._redirects === 0) {
      websocket._originalUnixSocket = isUnixSocket;
      websocket._originalSecure = isSecure;
      websocket._originalHostOrSocketPath = isUnixSocket
        ? opts.socketPath
        : parsedUrl.host;

      const headers = options && options.headers;

      //
      // Shallow copy the user provided options so that headers can be changed
      // without mutating the original object.
      //
      options = { ...options, headers: {} };

      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          options.headers[key.toLowerCase()] = value;
        }
      }
    } else {
      const isSameHost = isUnixSocket
        ? websocket._originalUnixSocket
          ? opts.socketPath === websocket._originalHostOrSocketPath
          : false
        : websocket._originalUnixSocket
        ? false
        : parsedUrl.host === websocket._originalHostOrSocketPath;

      if (!isSameHost || (websocket._originalSecure && !isSecure)) {
        //
        // Match curl 7.77.0 behavior and drop the following headers. These
        // headers are also dropped when following a redirect to a subdomain.
        //
        delete opts.headers.authorization;
        delete opts.headers.cookie;

        if (!isSameHost) delete opts.headers.host;

        opts.auth = undefined;
      }
    }

    //
    // Match curl 7.77.0 behavior and make the first `Authorization` header win.
    // If the `Authorization` header is set, then there is nothing to do as it
    // will take precedence.
    //
    if (opts.auth && !options.headers.authorization) {
      options.headers.authorization =
        'Basic ' + Buffer.from(opts.auth).toString('base64');
    }
  }

  let req = (websocket._req = get(opts));

  if (opts.timeout) {
    req.on('timeout', () => {
      abortHandshake$1(websocket, req, 'Opening handshake has timed out');
    });
  }

  req.on('error', (err) => {
    if (req === null || req.aborted) return;

    req = websocket._req = null;
    emitErrorAndClose(websocket, err);
  });

  req.on('response', (res) => {
    const location = res.headers.location;
    const statusCode = res.statusCode;

    if (
      location &&
      opts.followRedirects &&
      statusCode >= 300 &&
      statusCode < 400
    ) {
      if (++websocket._redirects > opts.maxRedirects) {
        abortHandshake$1(websocket, req, 'Maximum redirects exceeded');
        return;
      }

      req.abort();

      let addr;

      try {
        addr = new URL(location, address);
      } catch (err) {
        emitErrorAndClose(websocket, err);
        return;
      }

      initAsClient(websocket, addr, protocols, options);
    } else if (!websocket.emit('unexpected-response', req, res)) {
      abortHandshake$1(
        websocket,
        req,
        `Unexpected server response: ${res.statusCode}`
      );
    }
  });

  req.on('upgrade', (res, socket, head) => {
    websocket.emit('upgrade', res);

    //
    // The user may have closed the connection from a listener of the `upgrade`
    // event.
    //
    if (websocket.readyState !== WebSocket$3.CONNECTING) return;

    req = websocket._req = null;

    if (res.headers.upgrade.toLowerCase() !== 'websocket') {
      abortHandshake$1(websocket, socket, 'Invalid Upgrade header');
      return;
    }

    const digest = createHash$1('sha1')
      .update(key + GUID$1)
      .digest('base64');

    if (res.headers['sec-websocket-accept'] !== digest) {
      abortHandshake$1(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
      return;
    }

    const serverProt = res.headers['sec-websocket-protocol'];
    const protList = (protocols || '').split(/, */);
    let protError;

    if (!protocols && serverProt) {
      protError = 'Server sent a subprotocol but none was requested';
    } else if (protocols && !serverProt) {
      protError = 'Server sent no subprotocol';
    } else if (serverProt && !protList.includes(serverProt)) {
      protError = 'Server sent an invalid subprotocol';
    }

    if (protError) {
      abortHandshake$1(websocket, socket, protError);
      return;
    }

    if (serverProt) websocket._protocol = serverProt;

    const secWebSocketExtensions = res.headers['sec-websocket-extensions'];

    if (secWebSocketExtensions !== undefined) {
      if (!perMessageDeflate) {
        const message =
          'Server sent a Sec-WebSocket-Extensions header but no extension ' +
          'was requested';
        abortHandshake$1(websocket, socket, message);
        return;
      }

      let extensions;

      try {
        extensions = parse$1(secWebSocketExtensions);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake$1(websocket, socket, message);
        return;
      }

      const extensionNames = Object.keys(extensions);

      if (extensionNames.length) {
        if (
          extensionNames.length !== 1 ||
          extensionNames[0] !== PerMessageDeflate$1.extensionName
        ) {
          const message =
            'Server indicated an extension that was not requested';
          abortHandshake$1(websocket, socket, message);
          return;
        }

        try {
          perMessageDeflate.accept(extensions[PerMessageDeflate$1.extensionName]);
        } catch (err) {
          const message = 'Invalid Sec-WebSocket-Extensions header';
          abortHandshake$1(websocket, socket, message);
          return;
        }

        websocket._extensions[PerMessageDeflate$1.extensionName] =
          perMessageDeflate;
      }
    }

    websocket.setSocket(socket, head, opts.maxPayload);
  });
}

/**
 * Emit the `'error'` and `'close'` event.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {Error} The error to emit
 * @private
 */
function emitErrorAndClose(websocket, err) {
  websocket._readyState = WebSocket$3.CLOSING;
  websocket.emit('error', err);
  websocket.emitClose();
}

/**
 * Create a `net.Socket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {net.Socket} The newly created socket used to start the connection
 * @private
 */
function netConnect(options) {
  options.path = options.socketPath;
  return net.connect(options);
}

/**
 * Create a `tls.TLSSocket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {tls.TLSSocket} The newly created socket used to start the connection
 * @private
 */
function tlsConnect(options) {
  options.path = undefined;

  if (!options.servername && options.servername !== '') {
    options.servername = net.isIP(options.host) ? '' : options.host;
  }

  return tls.connect(options);
}

/**
 * Abort the handshake and emit an error.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
 *     abort or the socket to destroy
 * @param {String} message The error message
 * @private
 */
function abortHandshake$1(websocket, stream, message) {
  websocket._readyState = WebSocket$3.CLOSING;

  const err = new Error(message);
  Error.captureStackTrace(err, abortHandshake$1);

  if (stream.setHeader) {
    stream.abort();

    if (stream.socket && !stream.socket.destroyed) {
      //
      // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if
      // called after the request completed. See
      // https://github.com/websockets/ws/issues/1869.
      //
      stream.socket.destroy();
    }

    stream.once('abort', websocket.emitClose.bind(websocket));
    websocket.emit('error', err);
  } else {
    stream.destroy(err);
    stream.once('error', websocket.emit.bind(websocket, 'error'));
    stream.once('close', websocket.emitClose.bind(websocket));
  }
}

/**
 * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
 * when the `readyState` attribute is `CLOSING` or `CLOSED`.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {*} [data] The data to send
 * @param {Function} [cb] Callback
 * @private
 */
function sendAfterClose(websocket, data, cb) {
  if (data) {
    const length = toBuffer(data).length;

    //
    // The `_bufferedAmount` property is used only when the peer is a client and
    // the opening handshake fails. Under these circumstances, in fact, the
    // `setSocket()` method is not called, so the `_socket` and `_sender`
    // properties are set to `null`.
    //
    if (websocket._socket) websocket._sender._bufferedBytes += length;
    else websocket._bufferedAmount += length;
  }

  if (cb) {
    const err = new Error(
      `WebSocket is not open: readyState ${websocket.readyState} ` +
        `(${readyStates[websocket.readyState]})`
    );
    cb(err);
  }
}

/**
 * The listener of the `Receiver` `'conclude'` event.
 *
 * @param {Number} code The status code
 * @param {String} reason The reason for closing
 * @private
 */
function receiverOnConclude(code, reason) {
  const websocket = this[kWebSocket$1];

  websocket._closeFrameReceived = true;
  websocket._closeMessage = reason;
  websocket._closeCode = code;

  if (websocket._socket[kWebSocket$1] === undefined) return;

  websocket._socket.removeListener('data', socketOnData);
  process.nextTick(resume, websocket._socket);

  if (code === 1005) websocket.close();
  else websocket.close(code, reason);
}

/**
 * The listener of the `Receiver` `'drain'` event.
 *
 * @private
 */
function receiverOnDrain() {
  this[kWebSocket$1]._socket.resume();
}

/**
 * The listener of the `Receiver` `'error'` event.
 *
 * @param {(RangeError|Error)} err The emitted error
 * @private
 */
function receiverOnError(err) {
  const websocket = this[kWebSocket$1];

  if (websocket._socket[kWebSocket$1] !== undefined) {
    websocket._socket.removeListener('data', socketOnData);

    //
    // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See
    // https://github.com/websockets/ws/issues/1940.
    //
    process.nextTick(resume, websocket._socket);

    websocket.close(err[kStatusCode]);
  }

  websocket.emit('error', err);
}

/**
 * The listener of the `Receiver` `'finish'` event.
 *
 * @private
 */
function receiverOnFinish() {
  this[kWebSocket$1].emitClose();
}

/**
 * The listener of the `Receiver` `'message'` event.
 *
 * @param {(String|Buffer|ArrayBuffer|Buffer[])} data The message
 * @private
 */
function receiverOnMessage(data) {
  this[kWebSocket$1].emit('message', data);
}

/**
 * The listener of the `Receiver` `'ping'` event.
 *
 * @param {Buffer} data The data included in the ping frame
 * @private
 */
function receiverOnPing(data) {
  const websocket = this[kWebSocket$1];

  websocket.pong(data, !websocket._isServer, NOOP);
  websocket.emit('ping', data);
}

/**
 * The listener of the `Receiver` `'pong'` event.
 *
 * @param {Buffer} data The data included in the pong frame
 * @private
 */
function receiverOnPong(data) {
  this[kWebSocket$1].emit('pong', data);
}

/**
 * Resume a readable stream
 *
 * @param {Readable} stream The readable stream
 * @private
 */
function resume(stream) {
  stream.resume();
}

/**
 * The listener of the `net.Socket` `'close'` event.
 *
 * @private
 */
function socketOnClose() {
  const websocket = this[kWebSocket$1];

  this.removeListener('close', socketOnClose);
  this.removeListener('data', socketOnData);
  this.removeListener('end', socketOnEnd);

  websocket._readyState = WebSocket$3.CLOSING;

  let chunk;

  //
  // The close frame might not have been received or the `'end'` event emitted,
  // for example, if the socket was destroyed due to an error. Ensure that the
  // `receiver` stream is closed after writing any remaining buffered data to
  // it. If the readable side of the socket is in flowing mode then there is no
  // buffered data as everything has been already written and `readable.read()`
  // will return `null`. If instead, the socket is paused, any possible buffered
  // data will be read as a single chunk.
  //
  if (
    !this._readableState.endEmitted &&
    !websocket._closeFrameReceived &&
    !websocket._receiver._writableState.errorEmitted &&
    (chunk = websocket._socket.read()) !== null
  ) {
    websocket._receiver.write(chunk);
  }

  websocket._receiver.end();

  this[kWebSocket$1] = undefined;

  clearTimeout(websocket._closeTimer);

  if (
    websocket._receiver._writableState.finished ||
    websocket._receiver._writableState.errorEmitted
  ) {
    websocket.emitClose();
  } else {
    websocket._receiver.on('error', receiverOnFinish);
    websocket._receiver.on('finish', receiverOnFinish);
  }
}

/**
 * The listener of the `net.Socket` `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function socketOnData(chunk) {
  if (!this[kWebSocket$1]._receiver.write(chunk)) {
    this.pause();
  }
}

/**
 * The listener of the `net.Socket` `'end'` event.
 *
 * @private
 */
function socketOnEnd() {
  const websocket = this[kWebSocket$1];

  websocket._readyState = WebSocket$3.CLOSING;
  websocket._receiver.end();
  this.end();
}

/**
 * The listener of the `net.Socket` `'error'` event.
 *
 * @private
 */
function socketOnError$1() {
  const websocket = this[kWebSocket$1];

  this.removeListener('error', socketOnError$1);
  this.on('error', NOOP);

  if (websocket) {
    websocket._readyState = WebSocket$3.CLOSING;
    this.destroy();
  }
}

const { Duplex } = require$$0$3;

/**
 * Emits the `'close'` event on a stream.
 *
 * @param {Duplex} stream The stream.
 * @private
 */
function emitClose$1(stream) {
  stream.emit('close');
}

/**
 * The listener of the `'end'` event.
 *
 * @private
 */
function duplexOnEnd() {
  if (!this.destroyed && this._writableState.finished) {
    this.destroy();
  }
}

/**
 * The listener of the `'error'` event.
 *
 * @param {Error} err The error
 * @private
 */
function duplexOnError(err) {
  this.removeListener('error', duplexOnError);
  this.destroy();
  if (this.listenerCount('error') === 0) {
    // Do not suppress the throwing behavior.
    this.emit('error', err);
  }
}

/**
 * Wraps a `WebSocket` in a duplex stream.
 *
 * @param {WebSocket} ws The `WebSocket` to wrap
 * @param {Object} [options] The options for the `Duplex` constructor
 * @return {Duplex} The duplex stream
 * @public
 */
function createWebSocketStream(ws, options) {
  let resumeOnReceiverDrain = true;
  let terminateOnDestroy = true;

  function receiverOnDrain() {
    if (resumeOnReceiverDrain) ws._socket.resume();
  }

  if (ws.readyState === ws.CONNECTING) {
    ws.once('open', function open() {
      ws._receiver.removeAllListeners('drain');
      ws._receiver.on('drain', receiverOnDrain);
    });
  } else {
    ws._receiver.removeAllListeners('drain');
    ws._receiver.on('drain', receiverOnDrain);
  }

  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  ws.on('message', function message(msg) {
    if (!duplex.push(msg)) {
      resumeOnReceiverDrain = false;
      ws._socket.pause();
    }
  });

  ws.once('error', function error(err) {
    if (duplex.destroyed) return;

    // Prevent `ws.terminate()` from being called by `duplex._destroy()`.
    //
    // - If the `'error'` event is emitted before the `'open'` event, then
    //   `ws.terminate()` is a noop as no socket is assigned.
    // - Otherwise, the error is re-emitted by the listener of the `'error'`
    //   event of the `Receiver` object. The listener already closes the
    //   connection by calling `ws.close()`. This allows a close frame to be
    //   sent to the other peer. If `ws.terminate()` is called right after this,
    //   then the close frame might not be sent.
    terminateOnDestroy = false;
    duplex.destroy(err);
  });

  ws.once('close', function close() {
    if (duplex.destroyed) return;

    duplex.push(null);
  });

  duplex._destroy = function (err, callback) {
    if (ws.readyState === ws.CLOSED) {
      callback(err);
      process.nextTick(emitClose$1, duplex);
      return;
    }

    let called = false;

    ws.once('error', function error(err) {
      called = true;
      callback(err);
    });

    ws.once('close', function close() {
      if (!called) callback(err);
      process.nextTick(emitClose$1, duplex);
    });

    if (terminateOnDestroy) ws.terminate();
  };

  duplex._final = function (callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._final(callback);
      });
      return;
    }

    // If the value of the `_socket` property is `null` it means that `ws` is a
    // client websocket and the handshake failed. In fact, when this happens, a
    // socket is never assigned to the websocket. Wait for the `'error'` event
    // that will be emitted by the websocket.
    if (ws._socket === null) return;

    if (ws._socket._writableState.finished) {
      callback();
      if (duplex._readableState.endEmitted) duplex.destroy();
    } else {
      ws._socket.once('finish', function finish() {
        // `duplex` is not destroyed here because the `'end'` event will be
        // emitted on `duplex` after this `'finish'` event. The EOF signaling
        // `null` chunk is, in fact, pushed when the websocket emits `'close'`.
        callback();
      });
      ws.close();
    }
  };

  duplex._read = function () {
    if (
      (ws.readyState === ws.OPEN || ws.readyState === ws.CLOSING) &&
      !resumeOnReceiverDrain
    ) {
      resumeOnReceiverDrain = true;
      if (!ws._receiver._writableState.needDrain) ws._socket.resume();
    }
  };

  duplex._write = function (chunk, encoding, callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._write(chunk, encoding, callback);
      });
      return;
    }

    ws.send(chunk, callback);
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);
  return duplex;
}

var stream = createWebSocketStream;

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls|https$" }] */

const EventEmitter = require$$0$4;
const http = require$$2;
const { createHash } = require$$5;

const PerMessageDeflate = permessageDeflate;
const WebSocket$2 = websocket;
const { format, parse } = extension;
const { GUID, kWebSocket } = constants;

const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

const RUNNING = 0;
const CLOSING = 1;
const CLOSED = 2;

/**
 * Class representing a WebSocket server.
 *
 * @extends EventEmitter
 */
class WebSocketServer extends EventEmitter {
  /**
   * Create a `WebSocketServer` instance.
   *
   * @param {Object} options Configuration options
   * @param {Number} [options.backlog=511] The maximum length of the queue of
   *     pending connections
   * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
   *     track clients
   * @param {Function} [options.handleProtocols] A hook to handle protocols
   * @param {String} [options.host] The hostname where to bind the server
   * @param {Number} [options.maxPayload=104857600] The maximum allowed message
   *     size
   * @param {Boolean} [options.noServer=false] Enable no server mode
   * @param {String} [options.path] Accept only connections matching this path
   * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
   *     permessage-deflate
   * @param {Number} [options.port] The port where to bind the server
   * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
   *     server to use
   * @param {Function} [options.verifyClient] A hook to reject connections
   * @param {Function} [callback] A listener for the `listening` event
   */
  constructor(options, callback) {
    super();

    options = {
      maxPayload: 100 * 1024 * 1024,
      perMessageDeflate: false,
      handleProtocols: null,
      clientTracking: true,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null,
      ...options
    };

    if (
      (options.port == null && !options.server && !options.noServer) ||
      (options.port != null && (options.server || options.noServer)) ||
      (options.server && options.noServer)
    ) {
      throw new TypeError(
        'One and only one of the "port", "server", or "noServer" options ' +
          'must be specified'
      );
    }

    if (options.port != null) {
      this._server = http.createServer((req, res) => {
        const body = http.STATUS_CODES[426];

        res.writeHead(426, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.end(body);
      });
      this._server.listen(
        options.port,
        options.host,
        options.backlog,
        callback
      );
    } else if (options.server) {
      this._server = options.server;
    }

    if (this._server) {
      const emitConnection = this.emit.bind(this, 'connection');

      this._removeListeners = addListeners(this._server, {
        listening: this.emit.bind(this, 'listening'),
        error: this.emit.bind(this, 'error'),
        upgrade: (req, socket, head) => {
          this.handleUpgrade(req, socket, head, emitConnection);
        }
      });
    }

    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
    if (options.clientTracking) this.clients = new Set();
    this.options = options;
    this._state = RUNNING;
  }

  /**
   * Returns the bound address, the address family name, and port of the server
   * as reported by the operating system if listening on an IP socket.
   * If the server is listening on a pipe or UNIX domain socket, the name is
   * returned as a string.
   *
   * @return {(Object|String|null)} The address of the server
   * @public
   */
  address() {
    if (this.options.noServer) {
      throw new Error('The server is operating in "noServer" mode');
    }

    if (!this._server) return null;
    return this._server.address();
  }

  /**
   * Close the server.
   *
   * @param {Function} [cb] Callback
   * @public
   */
  close(cb) {
    if (cb) this.once('close', cb);

    if (this._state === CLOSED) {
      process.nextTick(emitClose, this);
      return;
    }

    if (this._state === CLOSING) return;
    this._state = CLOSING;

    //
    // Terminate all associated clients.
    //
    if (this.clients) {
      for (const client of this.clients) client.terminate();
    }

    const server = this._server;

    if (server) {
      this._removeListeners();
      this._removeListeners = this._server = null;

      //
      // Close the http server if it was internally created.
      //
      if (this.options.port != null) {
        server.close(emitClose.bind(undefined, this));
        return;
      }
    }

    process.nextTick(emitClose, this);
  }

  /**
   * See if a given request should be handled by this server instance.
   *
   * @param {http.IncomingMessage} req Request object to inspect
   * @return {Boolean} `true` if the request is valid, else `false`
   * @public
   */
  shouldHandle(req) {
    if (this.options.path) {
      const index = req.url.indexOf('?');
      const pathname = index !== -1 ? req.url.slice(0, index) : req.url;

      if (pathname !== this.options.path) return false;
    }

    return true;
  }

  /**
   * Handle a HTTP Upgrade request.
   *
   * @param {http.IncomingMessage} req The request object
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @public
   */
  handleUpgrade(req, socket, head, cb) {
    socket.on('error', socketOnError);

    const key =
      req.headers['sec-websocket-key'] !== undefined
        ? req.headers['sec-websocket-key'].trim()
        : false;
    const version = +req.headers['sec-websocket-version'];
    const extensions = {};

    if (
      req.method !== 'GET' ||
      req.headers.upgrade.toLowerCase() !== 'websocket' ||
      !key ||
      !keyRegex.test(key) ||
      (version !== 8 && version !== 13) ||
      !this.shouldHandle(req)
    ) {
      return abortHandshake(socket, 400);
    }

    if (this.options.perMessageDeflate) {
      const perMessageDeflate = new PerMessageDeflate(
        this.options.perMessageDeflate,
        true,
        this.options.maxPayload
      );

      try {
        const offers = parse(req.headers['sec-websocket-extensions']);

        if (offers[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        return abortHandshake(socket, 400);
      }
    }

    //
    // Optionally call external client verification handler.
    //
    if (this.options.verifyClient) {
      const info = {
        origin:
          req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
        secure: !!(req.socket.authorized || req.socket.encrypted),
        req
      };

      if (this.options.verifyClient.length === 2) {
        this.options.verifyClient(info, (verified, code, message, headers) => {
          if (!verified) {
            return abortHandshake(socket, code || 401, message, headers);
          }

          this.completeUpgrade(key, extensions, req, socket, head, cb);
        });
        return;
      }

      if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
    }

    this.completeUpgrade(key, extensions, req, socket, head, cb);
  }

  /**
   * Upgrade the connection to WebSocket.
   *
   * @param {String} key The value of the `Sec-WebSocket-Key` header
   * @param {Object} extensions The accepted extensions
   * @param {http.IncomingMessage} req The request object
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @throws {Error} If called more than once with the same socket
   * @private
   */
  completeUpgrade(key, extensions, req, socket, head, cb) {
    //
    // Destroy the socket if the client has already sent a FIN packet.
    //
    if (!socket.readable || !socket.writable) return socket.destroy();

    if (socket[kWebSocket]) {
      throw new Error(
        'server.handleUpgrade() was called more than once with the same ' +
          'socket, possibly due to a misconfiguration'
      );
    }

    if (this._state > RUNNING) return abortHandshake(socket, 503);

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${digest}`
    ];

    const ws = new WebSocket$2(null);
    let protocol = req.headers['sec-websocket-protocol'];

    if (protocol) {
      protocol = protocol.split(',').map(trim);

      //
      // Optionally call external protocol selection handler.
      //
      if (this.options.handleProtocols) {
        protocol = this.options.handleProtocols(protocol, req);
      } else {
        protocol = protocol[0];
      }

      if (protocol) {
        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
        ws._protocol = protocol;
      }
    }

    if (extensions[PerMessageDeflate.extensionName]) {
      const params = extensions[PerMessageDeflate.extensionName].params;
      const value = format({
        [PerMessageDeflate.extensionName]: [params]
      });
      headers.push(`Sec-WebSocket-Extensions: ${value}`);
      ws._extensions = extensions;
    }

    //
    // Allow external modification/inspection of handshake headers.
    //
    this.emit('headers', headers, req);

    socket.write(headers.concat('\r\n').join('\r\n'));
    socket.removeListener('error', socketOnError);

    ws.setSocket(socket, head, this.options.maxPayload);

    if (this.clients) {
      this.clients.add(ws);
      ws.on('close', () => this.clients.delete(ws));
    }

    cb(ws, req);
  }
}

var websocketServer = WebSocketServer;

/**
 * Add event listeners on an `EventEmitter` using a map of <event, listener>
 * pairs.
 *
 * @param {EventEmitter} server The event emitter
 * @param {Object.<String, Function>} map The listeners to add
 * @return {Function} A function that will remove the added listeners when
 *     called
 * @private
 */
function addListeners(server, map) {
  for (const event of Object.keys(map)) server.on(event, map[event]);

  return function removeListeners() {
    for (const event of Object.keys(map)) {
      server.removeListener(event, map[event]);
    }
  };
}

/**
 * Emit a `'close'` event on an `EventEmitter`.
 *
 * @param {EventEmitter} server The event emitter
 * @private
 */
function emitClose(server) {
  server._state = CLOSED;
  server.emit('close');
}

/**
 * Handle premature socket errors.
 *
 * @private
 */
function socketOnError() {
  this.destroy();
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {(net.Socket|tls.Socket)} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @param {Object} [headers] Additional HTTP response headers
 * @private
 */
function abortHandshake(socket, code, message, headers) {
  if (socket.writable) {
    message = message || http.STATUS_CODES[code];
    headers = {
      Connection: 'close',
      'Content-Type': 'text/html',
      'Content-Length': Buffer.byteLength(message),
      ...headers
    };

    socket.write(
      `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
        Object.keys(headers)
          .map((h) => `${h}: ${headers[h]}`)
          .join('\r\n') +
        '\r\n\r\n' +
        message
    );
  }

  socket.removeListener('error', socketOnError);
  socket.destroy();
}

/**
 * Remove whitespace characters from both ends of a string.
 *
 * @param {String} str The string
 * @return {String} A new string representing `str` stripped of whitespace
 *     characters from both its beginning and end
 * @private
 */
function trim(str) {
  return str.trim();
}

const WebSocket = websocket;

WebSocket.createWebSocketStream = stream;
WebSocket.Server = websocketServer;
WebSocket.Receiver = receiver;
WebSocket.Sender = sender;

var ws = WebSocket;

const WebSocket$1 = /*@__PURE__*/getDefaultExportFromCjs(ws);

class NoneSerializer {
  constructor() {
    this.id = "none";
  }
  reset(data) {
  }
  getFullState(client) {
    return null;
  }
  applyPatches(clients, state) {
    return false;
  }
}

var ClientState = /* @__PURE__ */ ((ClientState2) => {
  ClientState2[ClientState2["JOINING"] = 0] = "JOINING";
  ClientState2[ClientState2["JOINED"] = 1] = "JOINED";
  ClientState2[ClientState2["RECONNECTED"] = 2] = "RECONNECTED";
  ClientState2[ClientState2["LEAVING"] = 3] = "LEAVING";
  return ClientState2;
})(ClientState || {});
class ClientArray extends Array {
  getById(sessionId) {
    return this.find((client) => client.sessionId === sessionId);
  }
  delete(client) {
    return spliceOne(this, this.indexOf(client));
  }
}

console.log('123');

class SchemaSerializer {
  constructor() {
    this.id = "schema";
    this.useFilters = false;
  }
  reset(newState) {
    this.state = newState;
    this.useFilters = hasFilter(newState.constructor);
  }
  getFullState(client) {
    const fullEncodedState = this.state.encodeAll(this.useFilters);
    if (client && this.useFilters) {
      return this.state.applyFilters(client, true);
    } else {
      return fullEncodedState;
    }
  }
  applyPatches(clients) {
    const hasChanges = this.state["$changes"].changes.size > 0;
    if (hasChanges) {
      let numClients = clients.length;
      if (debugPatch.enabled) {
        debugPatch.dumpChanges = dumpChanges(this.state);
      }
      const patches = this.state.encode(false, [], this.useFilters);
      if (!this.useFilters) {
        patches.unshift(Protocol.ROOM_STATE_PATCH);
        while (numClients--) {
          const client = clients[numClients];
          if (client.state === ClientState.JOINED) {
            debugger;
            client.raw(patches);
          }
        }
      } else {
        while (numClients--) {
          const client = clients[numClients];
          if (client.state === ClientState.JOINED) {
            const filteredPatches = this.state.applyFilters(client);
            debugger;
            client.raw([Protocol.ROOM_STATE_PATCH, ...filteredPatches]);
          }
        }
        this.state.discardAllChanges();
      }
      if (debugPatch.enabled) {
        debugPatch(
          "%d bytes sent to %d clients, %j",
          patches.length,
          clients.length,
          debugPatch.dumpChanges
        );
      }
    }
    return hasChanges;
  }
  handshake() {
    console.log('mjs', 'handshakeCache', this.handshakeCache);
    if (!this.handshakeCache) {
      this.handshakeCache = this.state && Reflection.encode(this.state);
    }
    return this.handshakeCache;
  }
}

const DEFAULT_PATCH_RATE = 1e3 / 20;
const DEFAULT_SIMULATION_INTERVAL = 1e3 / 60;
const noneSerializer = new NoneSerializer();
const DEFAULT_SEAT_RESERVATION_TIME = Number(process.env.COLYSEUS_SEAT_RESERVATION_TIME || 15);
class Room {
  constructor(presence) {
    this.clock = new Clock();
    this.maxClients = Infinity;
    this.patchRate = DEFAULT_PATCH_RATE;
    this.autoDispose = true;
    this.clients = new ClientArray();
    this._events = new EventEmitter$2();
    this.seatReservationTime = DEFAULT_SEAT_RESERVATION_TIME;
    this.reservedSeats = {};
    this.reservedSeatTimeouts = {};
    this._reconnections = {};
    this._reconnectingSessionId = /* @__PURE__ */ new Map();
    this.onMessageHandlers = {};
    this._serializer = noneSerializer;
    this._afterNextPatchQueue = [];
    this._internalState = 0 /* CREATING */;
    this._locked = false;
    this._lockedExplicitly = false;
    this._maxClientsReached = false;
    this.presence = presence;
    this._events.once("dispose", async () => {
      try {
        await this._dispose();
      } catch (e) {
        debugAndPrintError(`onDispose error: ${e && e.message || e || "promise rejected"}`);
      }
      this._events.emit("disconnect");
    });
    this.setPatchRate(this.patchRate);
    this.resetAutoDisposeTimeout(this.seatReservationTime);
  }
  get locked() {
    return this._locked;
  }
  get metadata() {
    return this.listing.metadata;
  }
  #_roomId;
  #_roomName;
  get roomName() {
    return this.#_roomName;
  }
  set roomName(roomName) {
    if (this.#_roomName) {
      throw new ServerError(ErrorCode.APPLICATION_ERROR, "'roomName' cannot be overwritten.");
    }
    this.#_roomName = roomName;
  }
  get roomId() {
    return this.#_roomId;
  }
  set roomId(roomId) {
    if (this._internalState !== 0 /* CREATING */ && !isDevMode) {
      throw new ServerError(ErrorCode.APPLICATION_ERROR, "'roomId' can only be overridden upon room creation.");
    }
    this.#_roomId = roomId;
  }
  onAuth(client, options, request) {
    return true;
  }
  static async onAuth(token, req) {
    return true;
  }
  hasReachedMaxClients() {
    return this.clients.length + Object.keys(this.reservedSeats).length >= this.maxClients || this._internalState === 2 /* DISPOSING */;
  }
  setSeatReservationTime(seconds) {
    this.seatReservationTime = seconds;
    return this;
  }
  hasReservedSeat(sessionId, reconnectionToken) {
    if (reconnectionToken) {
      const reconnection = this._reconnections[reconnectionToken];
      return reconnection && reconnection[0] === sessionId && this.reservedSeats[sessionId] !== void 0 && this._reconnectingSessionId.has(sessionId);
    } else {
      return this.reservedSeats[sessionId] !== void 0 && (!this._reconnectingSessionId.has(sessionId) || this._reconnectingSessionId.get(sessionId) === sessionId);
    }
  }
  checkReconnectionToken(reconnectionToken) {
    const reconnection = this._reconnections[reconnectionToken];
    const sessionId = reconnection && reconnection[0];
    if (this.hasReservedSeat(sessionId)) {
      this._reconnectingSessionId.set(sessionId, reconnectionToken);
      return sessionId;
    } else {
      return void 0;
    }
  }
  setSimulationInterval(onTickCallback, delay = DEFAULT_SIMULATION_INTERVAL) {
    if (this._simulationInterval) {
      clearInterval(this._simulationInterval);
    }
    if (onTickCallback) {
      this._simulationInterval = setInterval(() => {
        this.clock.tick();
        onTickCallback(this.clock.deltaTime);
      }, delay);
    }
  }
  setPatchRate(milliseconds) {
    this.patchRate = milliseconds;
    if (this._patchInterval) {
      clearInterval(this._patchInterval);
      this._patchInterval = void 0;
    }
    if (milliseconds !== null && milliseconds !== 0) {
      this._patchInterval = setInterval(() => this.broadcastPatch(), milliseconds);
    }
  }
  setState(newState) {
    this.clock.start();
    if ("_definition" in newState) {
      this.setSerializer(new SchemaSerializer());
    }
    this._serializer.reset(newState);
    this.state = newState;
  }
  setSerializer(serializer) {
    this._serializer = serializer;
  }
  async setMetadata(meta) {
    if (!this.listing.metadata) {
      this.listing.metadata = meta;
    } else {
      for (const field in meta) {
        if (!meta.hasOwnProperty(field)) {
          continue;
        }
        this.listing.metadata[field] = meta[field];
      }
      if ("markModified" in this.listing) {
        this.listing.markModified("metadata");
      }
    }
    if (this._internalState === 1 /* CREATED */) {
      await this.listing.save();
    }
  }
  async setPrivate(bool = true) {
    if (this.listing.private === bool)
      return;
    this.listing.private = bool;
    if (this._internalState === 1 /* CREATED */) {
      await this.listing.save();
    }
    this._events.emit("visibility-change", bool);
  }
  async lock() {
    this._lockedExplicitly = arguments[0] === void 0;
    if (this._locked) {
      return;
    }
    this._locked = true;
    await this.listing.updateOne({
      $set: { locked: this._locked }
    });
    this._events.emit("lock");
  }
  async unlock() {
    if (arguments[0] === void 0) {
      this._lockedExplicitly = false;
    }
    if (!this._locked) {
      return;
    }
    this._locked = false;
    await this.listing.updateOne({
      $set: { locked: this._locked }
    });
    this._events.emit("unlock");
  }
  send(client, messageOrType, messageOrOptions, options) {
    logger.warn("DEPRECATION WARNING: use client.send(...) instead of this.send(client, ...)");
    client.send(messageOrType, messageOrOptions, options);
  }
  broadcast(typeOrSchema, messageOrOptions, options) {
    const isSchema = typeof typeOrSchema === "object";
    const opts = isSchema ? messageOrOptions : options;
    if (opts && opts.afterNextPatch) {
      delete opts.afterNextPatch;
      this._afterNextPatchQueue.push(["broadcast", arguments]);
      return;
    }
    if (isSchema) {
      this.broadcastMessageSchema(typeOrSchema, opts);
    } else {
      this.broadcastMessageType(typeOrSchema, messageOrOptions, opts);
    }
  }
  broadcastPatch() {
    if (this.onBeforePatch) {
      this.onBeforePatch(this.state);
    }
    if (!this._simulationInterval) {
      this.clock.tick();
    }
    if (!this.state) {
      return false;
    }
    const hasChanges = this._serializer.applyPatches(this.clients, this.state);
    this._dequeueAfterPatchMessages();
    return hasChanges;
  }
  onMessage(messageType, callback) {
    this.onMessageHandlers[messageType] = callback;
    return () => delete this.onMessageHandlers[messageType];
  }
  disconnect(closeCode = Protocol.WS_CLOSE_CONSENTED) {
    if (this._internalState === 2 /* DISPOSING */) {
      return;
    } else if (this._internalState === 0 /* CREATING */) {
      throw new Error("cannot disconnect during onCreate()");
    }
    this._internalState = 2 /* DISPOSING */;
    this.listing.remove();
    this.autoDispose = true;
    const delayedDisconnection = new Promise((resolve) => this._events.once("disconnect", () => resolve()));
    for (const [_, reconnection] of Object.values(this._reconnections)) {
      reconnection.reject();
    }
    let numClients = this.clients.length;
    if (numClients > 0) {
      while (numClients--) {
        this._forciblyCloseClient(this.clients[numClients], closeCode);
      }
    } else {
      this._events.emit("dispose");
    }
    return delayedDisconnection;
  }
  async ["_onJoin"](client, req) {
    const sessionId = client.sessionId;
    client._reconnectionToken = generateId();
    if (this.reservedSeatTimeouts[sessionId]) {
      clearTimeout(this.reservedSeatTimeouts[sessionId]);
      delete this.reservedSeatTimeouts[sessionId];
    }
    if (this._autoDisposeTimeout) {
      clearTimeout(this._autoDisposeTimeout);
      this._autoDisposeTimeout = void 0;
    }
    const [joinOptions, authData] = this.reservedSeats[sessionId];
    if (this.reservedSeats[sessionId].length > 2) {
      throw new ServerError(ErrorCode.MATCHMAKE_EXPIRED, "already consumed");
    }
    this.reservedSeats[sessionId].push(true);
    client._afterNextPatchQueue = this._afterNextPatchQueue;
    client.ref["onleave"] = (_) => client.state = ClientState.LEAVING;
    client.ref.once("close", client.ref["onleave"]);
    const previousReconnectionToken = this._reconnectingSessionId.get(sessionId);
    if (previousReconnectionToken) {
      this.clients.push(client);
      this._reconnections[previousReconnectionToken]?.[1].resolve(client);
    } else {
      try {
        if (authData) {
          client.auth = authData;
        } else if (this.onAuth !== Room.prototype.onAuth) {
          client.auth = await this.onAuth(client, joinOptions, req);
          if (!client.auth) {
            throw new ServerError(ErrorCode.AUTH_FAILED, "onAuth failed");
          }
        }
        if (client.readyState !== WebSocket$1.OPEN) {
          throw new ServerError(Protocol.WS_CLOSE_GOING_AWAY, "already disconnected");
        }
        this.clients.push(client);
        if (this.onJoin) {
          await this.onJoin(client, joinOptions, client.auth);
        }
        this._events.emit("join", client);
        delete this.reservedSeats[sessionId];
        if (client.state === ClientState.LEAVING) {
          await this._onLeave(client, Protocol.WS_CLOSE_GOING_AWAY);
        }
      } catch (e) {
        this.clients.delete(client);
        delete this.reservedSeats[sessionId];
        this._decrementClientCount();
        if (!e.code) {
          e.code = ErrorCode.APPLICATION_ERROR;
        }
        throw e;
      }
    }
    if (client.state === ClientState.JOINING) {
      client.ref.removeListener("close", client.ref["onleave"]);
      client.ref["onleave"] = this._onLeave.bind(this, client);
      client.ref.once("close", client.ref["onleave"]);
      client.ref.on("message", this._onMessage.bind(this, client));
      client.raw(getMessageBytes[Protocol.JOIN_ROOM](
        client._reconnectionToken,
        this._serializer.id,
        this._serializer.handshake && this._serializer.handshake()
      ));
    }
  }
  allowReconnection(previousClient, seconds) {
    if (previousClient._enqueuedMessages !== void 0) {
      return;
    }
    if (seconds === void 0) {
      console.warn('DEPRECATED: allowReconnection() requires a second argument. Using "manual" mode.');
      seconds = "manual";
    }
    if (seconds === "manual") {
      seconds = Infinity;
    }
    if (this._internalState === 2 /* DISPOSING */) {
      this._disposeIfEmpty();
      throw new Error("disconnecting");
    }
    const sessionId = previousClient.sessionId;
    const reconnectionToken = previousClient._reconnectionToken;
    this._reserveSeat(sessionId, true, previousClient.auth, seconds, true);
    const reconnection = new Deferred();
    this._reconnections[reconnectionToken] = [sessionId, reconnection];
    if (seconds !== Infinity) {
      this.reservedSeatTimeouts[sessionId] = setTimeout(() => reconnection.reject(false), seconds * 1e3);
    }
    const cleanup = () => {
      delete this._reconnections[reconnectionToken];
      delete this.reservedSeats[sessionId];
      delete this.reservedSeatTimeouts[sessionId];
      this._reconnectingSessionId.delete(sessionId);
    };
    reconnection.then((newClient) => {
      newClient.auth = previousClient.auth;
      newClient.userData = previousClient.userData;
      previousClient.ref = newClient.ref;
      previousClient.state = ClientState.RECONNECTED;
      clearTimeout(this.reservedSeatTimeouts[sessionId]);
      cleanup();
    }).catch(() => {
      cleanup();
      this.resetAutoDisposeTimeout();
    });
    return reconnection;
  }
  resetAutoDisposeTimeout(timeoutInSeconds = 1) {
    clearTimeout(this._autoDisposeTimeout);
    if (!this.autoDispose) {
      return;
    }
    this._autoDisposeTimeout = setTimeout(() => {
      this._autoDisposeTimeout = void 0;
      this._disposeIfEmpty();
    }, timeoutInSeconds * 1e3);
  }
  broadcastMessageSchema(message, options = {}) {
    debugMessage("broadcast: %O", message);
    const encodedMessage = getMessageBytes[Protocol.ROOM_DATA_SCHEMA](message);
    const except = typeof options.except !== "undefined" ? Array.isArray(options.except) ? options.except : [options.except] : void 0;
    let numClients = this.clients.length;
    while (numClients--) {
      const client = this.clients[numClients];
      if (!except || !except.includes(client)) {
        client.enqueueRaw(encodedMessage);
      }
    }
  }
  broadcastMessageType(type, message, options = {}) {
    debugMessage("broadcast: %O", message);
    const encodedMessage = getMessageBytes.raw(Protocol.ROOM_DATA, type, message);
    const except = typeof options.except !== "undefined" ? Array.isArray(options.except) ? options.except : [options.except] : void 0;
    let numClients = this.clients.length;
    while (numClients--) {
      const client = this.clients[numClients];
      if (!except || !except.includes(client)) {
        client.enqueueRaw(encodedMessage);
      }
    }
  }
  sendFullState(client) {
    client.enqueueRaw(getMessageBytes[Protocol.ROOM_STATE](this._serializer.getFullState(client)));
  }
  _dequeueAfterPatchMessages() {
    const length = this._afterNextPatchQueue.length;
    if (length > 0) {
      for (let i = 0; i < length; i++) {
        const [target, args] = this._afterNextPatchQueue[i];
        if (target === "broadcast") {
          this.broadcast.apply(this, args);
        } else {
          target.raw.apply(target, args);
        }
      }
      this._afterNextPatchQueue.splice(0, length);
    }
  }
  async _reserveSeat(sessionId, joinOptions = true, authData = void 0, seconds = this.seatReservationTime, allowReconnection = false, devModeReconnection) {
    if (!allowReconnection && this.hasReachedMaxClients()) {
      return false;
    }
    this.reservedSeats[sessionId] = [joinOptions, authData];
    if (!allowReconnection) {
      await this._incrementClientCount();
      this.reservedSeatTimeouts[sessionId] = setTimeout(async () => {
        delete this.reservedSeats[sessionId];
        delete this.reservedSeatTimeouts[sessionId];
        await this._decrementClientCount();
      }, seconds * 1e3);
      this.resetAutoDisposeTimeout(seconds);
    }
    if (devModeReconnection) {
      this._reconnectingSessionId.set(sessionId, sessionId);
    }
    return true;
  }
  _disposeIfEmpty() {
    const willDispose = this.autoDispose && this._autoDisposeTimeout === void 0 && this.clients.length === 0 && Object.keys(this.reservedSeats).length === 0;
    if (willDispose) {
      this._events.emit("dispose");
    }
    return willDispose;
  }
  async _dispose() {
    this._internalState = 2 /* DISPOSING */;
    await this.listing.remove();
    let userReturnData;
    if (this.onDispose) {
      userReturnData = this.onDispose();
    }
    if (this._patchInterval) {
      clearInterval(this._patchInterval);
      this._patchInterval = void 0;
    }
    if (this._simulationInterval) {
      clearInterval(this._simulationInterval);
      this._simulationInterval = void 0;
    }
    if (this._autoDisposeTimeout) {
      clearInterval(this._autoDisposeTimeout);
      this._autoDisposeTimeout = void 0;
    }
    this.clock.clear();
    this.clock.stop();
    return await (userReturnData || Promise.resolve());
  }
  _onMessage(client, bytes) {
    if (client.state === ClientState.LEAVING) {
      return;
    }
    const it = { offset: 0 };
    const code = decode.uint8(bytes, it);
    if (!bytes) {
      debugAndPrintError(`${this.roomName} (${this.roomId}), couldn't decode message: ${bytes}`);
      return;
    }
    if (code === Protocol.ROOM_DATA) {
      const messageType = decode.stringCheck(bytes, it) ? decode.string(bytes, it) : decode.number(bytes, it);
      let message;
      try {
        message = bytes.length > it.offset ? unpack(new Uint8Array(bytes.slice(it.offset, bytes.length))) : void 0;
        debugMessage("received: '%s' -> %j", messageType, message);
      } catch (e) {
        debugAndPrintError(e);
        return;
      }
      if (this.onMessageHandlers[messageType]) {
        this.onMessageHandlers[messageType](client, message);
      } else if (this.onMessageHandlers["*"]) {
        this.onMessageHandlers["*"](client, messageType, message);
      } else {
        debugAndPrintError(`onMessage for "${messageType}" not registered.`);
      }
    } else if (code === Protocol.ROOM_DATA_BYTES) {
      const messageType = decode.stringCheck(bytes, it) ? decode.string(bytes, it) : decode.number(bytes, it);
      const message = bytes.slice(it.offset, bytes.length);
      debugMessage("received: '%s' -> %j", messageType, message);
      if (this.onMessageHandlers[messageType]) {
        this.onMessageHandlers[messageType](client, message);
      } else if (this.onMessageHandlers["*"]) {
        this.onMessageHandlers["*"](client, messageType, message);
      } else {
        debugAndPrintError(`onMessage for "${messageType}" not registered.`);
      }
    } else if (code === Protocol.JOIN_ROOM && client.state === ClientState.JOINING) {
      client.state = ClientState.JOINED;
      if (this.state) {
        this.sendFullState(client);
      }
      if (client._enqueuedMessages.length > 0) {
        client._enqueuedMessages.forEach((enqueued) => client.raw(enqueued));
      }
      delete client._enqueuedMessages;
    } else if (code === Protocol.LEAVE_ROOM) {
      this._forciblyCloseClient(client, Protocol.WS_CLOSE_CONSENTED);
    }
  }
  _forciblyCloseClient(client, closeCode) {
    client.ref.removeAllListeners("message");
    client.ref.removeListener("close", client.ref["onleave"]);
    this._onLeave(client, closeCode).then(() => client.leave(closeCode));
  }
  async _onLeave(client, code) {
    const success = this.clients.delete(client);
    if (success) {
      client.state = ClientState.LEAVING;
      if (this.onLeave) {
        try {
          await this.onLeave(client, code === Protocol.WS_CLOSE_CONSENTED);
        } catch (e) {
          debugAndPrintError(`onLeave error: ${e && e.message || e || "promise rejected"}`);
        }
      }
    }
    if (client.state !== ClientState.RECONNECTED) {
      const willDispose = await this._decrementClientCount();
      this._events.emit("leave", client, willDispose);
    }
  }
  async _incrementClientCount() {
    if (!this._locked && this.hasReachedMaxClients()) {
      this._maxClientsReached = true;
      this.lock.call(this, true);
    }
    await this.listing.updateOne({
      $inc: { clients: 1 },
      $set: { locked: this._locked }
    });
  }
  async _decrementClientCount() {
    const willDispose = this._disposeIfEmpty();
    if (this._internalState === 2 /* DISPOSING */) {
      return true;
    }
    if (!willDispose) {
      if (this._maxClientsReached && !this._lockedExplicitly) {
        this._maxClientsReached = false;
        this.unlock.call(this, true);
      }
      await this.listing.updateOne({
        $inc: { clients: -1 },
        $set: { locked: this._locked }
      });
    }
    return willDispose;
  }
}

path.resolve(".devmode.json");

new Deferred();

const context = new Context();
class Player extends Schema {
}
defineTypes(Player, {
  connected: "boolean",
  name: "string",
  sessionId: "string"
}, { context });
class State extends Schema {
  constructor() {
    super(...arguments);
    this.players = new MapSchema();
  }
}
defineTypes(State, {
  players: { map: Player }
}, { context });

var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp$1(target, key, result);
  return result;
};
class AwaiterState extends Schema {
}
__decorateClass$1([
  type("string")
], AwaiterState.prototype, "name", 2);
__decorateClass$1([
  type("string")
], AwaiterState.prototype, "team", 2);
class WaitingRoomState extends Schema {
  constructor() {
    super(...arguments);
    this.awaiters = new MapSchema();
  }
}
__decorateClass$1([
  type("string")
], WaitingRoomState.prototype, "hostSessionId", 2);
__decorateClass$1([
  type({ map: AwaiterState })
], WaitingRoomState.prototype, "awaiters", 2);

var RoomType = /* @__PURE__ */ ((RoomType2) => {
  RoomType2["WAITING_ROOM"] = "waiting-room";
  RoomType2["GAME_ROOM"] = "game-room";
  return RoomType2;
})(RoomType || {});
var ToWaitingRoomMessageType = /* @__PURE__ */ ((ToWaitingRoomMessageType2) => {
  ToWaitingRoomMessageType2["CHANGE_TEAM"] = "to-change-team";
  ToWaitingRoomMessageType2["START_GAME"] = "to-start-game";
  return ToWaitingRoomMessageType2;
})(ToWaitingRoomMessageType || {});
var FromWaitingRoomMessageType = /* @__PURE__ */ ((FromWaitingRoomMessageType2) => {
  FromWaitingRoomMessageType2["CHANGE_TEAM"] = "from-change-team";
  FromWaitingRoomMessageType2["START_GAME"] = "from-start-game";
  return FromWaitingRoomMessageType2;
})(FromWaitingRoomMessageType || {});
var GameRoomMessageType = /* @__PURE__ */ ((GameRoomMessageType2) => {
  GameRoomMessageType2["USER_READY_TO_KICKOFF"] = "user-ready-to-kickoff";
  GameRoomMessageType2["USER_ACTION"] = "user-action";
  GameRoomMessageType2["GOAL"] = "goal";
  GameRoomMessageType2["READY_TO_START"] = "ready-to-start";
  GameRoomMessageType2["KICKOFF"] = "kickoff";
  GameRoomMessageType2["SHOOT"] = "shoot";
  GameRoomMessageType2["TIMESTAMP"] = "timestamp";
  GameRoomMessageType2["END"] = "end";
  GameRoomMessageType2["DISPOSE"] = "dispose";
  return GameRoomMessageType2;
})(GameRoomMessageType || {});

var GameRoomActionType = /* @__PURE__ */ ((GameRoomActionType2) => {
  GameRoomActionType2["DIRECTION"] = "direction";
  GameRoomActionType2["SHOOT_START"] = "shoot-start";
  GameRoomActionType2["SHOOT_END"] = "shoot-end";
  return GameRoomActionType2;
})(GameRoomActionType || {});

var Team = /* @__PURE__ */ ((Team2) => {
  Team2["OBSERVER"] = "observer";
  Team2["RED"] = "red";
  Team2["BLUE"] = "blue";
  return Team2;
})(Team || {});
var GameState = /* @__PURE__ */ ((GameState2) => {
  GameState2[GameState2["PREPARATION"] = 0] = "PREPARATION";
  GameState2[GameState2["KICKOFF"] = 1] = "KICKOFF";
  GameState2[GameState2["PROGRESS"] = 2] = "PROGRESS";
  GameState2[GameState2["GOAL"] = 3] = "GOAL";
  GameState2[GameState2["END"] = 4] = "END";
  return GameState2;
})(GameState || {});
var PlayerEntityState = /* @__PURE__ */ ((PlayerEntityState2) => {
  PlayerEntityState2[PlayerEntityState2["IDLE"] = 0] = "IDLE";
  PlayerEntityState2[PlayerEntityState2["SHOOTING"] = 1] = "SHOOTING";
  return PlayerEntityState2;
})(PlayerEntityState || {});

class WaitingRoom extends Room {
  constructor() {
    super();
    this.maxClients = 10;
    this.setState(new WaitingRoomState());
  }
  onCreate(option) {
    console.log("waiting room", this.roomId, "creating...");
    this.onMessage(
      ToWaitingRoomMessageType.CHANGE_TEAM,
      (client, message) => {
        console.log(
          `[${ToWaitingRoomMessageType.CHANGE_TEAM}]: ${client.sessionId}, ${JSON.stringify(message)}`
        );
        const awaiter = this.state.awaiters.get(client.sessionId);
        if (!awaiter) {
          throw new Error(
            `The client(sessionId: ${client.sessionId}) not found.`
          );
        }
        awaiter.team = message.to;
        this.state.awaiters.set(client.sessionId, awaiter);
        this.broadcast(FromWaitingRoomMessageType.CHANGE_TEAM, {
          awaiters: this.state.awaiters
        });
      }
    );
    this.onMessage(
      ToWaitingRoomMessageType.START_GAME,
      (client, { roomId: gameRoomId, map }) => {
        console.log(
          `[${ToWaitingRoomMessageType.START_GAME}]: ${client.sessionId}`
        );
        this.broadcast(
          FromWaitingRoomMessageType.START_GAME,
          {
            roomId: gameRoomId,
            map
          },
          { except: client }
        );
      }
    );
  }
  onJoin(client, options) {
    console.log(client.sessionId, "joined!");
    const info = options.hostJoinInfo ?? options;
    const awaiter = new AwaiterState();
    awaiter.name = info.name;
    awaiter.team = Team.OBSERVER;
    this.state.awaiters.set(client.sessionId, awaiter);
    if (!this.state.hostSessionId) {
      this.state.hostSessionId = client.sessionId;
    }
  }
  onLeave(client, consented) {
    console.log(client.sessionId, "left!");
    this.state.awaiters.delete(client.sessionId);
    if (this.state.hostSessionId === client.sessionId) {
      this.state.hostSessionId = [...this.state.awaiters.keys()][0];
    }
  }
  onDispose() {
    console.log("waiting room", this.roomId, "disposing...");
  }
}

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
const _PlayerState = class _PlayerState extends Schema {
  constructor() {
    super(...arguments);
    this.actionQueue = [];
    // input from the client
    this.accelX = 0;
    this.accelY = 0;
    this.radius = 27;
    this.entityState = PlayerEntityState.IDLE;
  }
  static {
    this.SPEED_LIMIT = 2.8;
  }
  static {
    // pixel per step
    this.SHOOTING_SPEED_LIMIT = 2;
  }
  static {
    // pixel per step
    this.ACCELERATION = 0.16;
  }
  static {
    // speed per step
    this.SHOOTING_ACCLERATION = 0.1;
  }
  static {
    // speed per step
    this.FRICTION = 4e-3;
  }
  accelrate(direction) {
    const acceleration = this.entityState === PlayerEntityState.SHOOTING ? _PlayerState.SHOOTING_ACCLERATION : _PlayerState.ACCELERATION;
    switch (direction) {
      case "":
        this.accelX = 0;
        this.accelY = 0;
        break;
      case "left":
        this.accelX = -acceleration;
        this.accelY = 0;
        break;
      case "right":
        this.accelX = acceleration;
        this.accelY = 0;
        break;
      case "up":
        this.accelX = 0;
        this.accelY = -acceleration;
        break;
      case "down":
        this.accelX = 0;
        this.accelY = acceleration;
        break;
      case "leftup":
        this.accelX = -acceleration * Math.SQRT1_2;
        this.accelY = -acceleration * Math.SQRT1_2;
        break;
      case "leftdown":
        this.accelX = -acceleration * Math.SQRT1_2;
        this.accelY = acceleration * Math.SQRT1_2;
        break;
      case "rightup":
        this.accelX = acceleration * Math.SQRT1_2;
        this.accelY = -acceleration * Math.SQRT1_2;
        break;
      case "rightdown":
        this.accelX = acceleration * Math.SQRT1_2;
        this.accelY = acceleration * Math.SQRT1_2;
        break;
    }
    return [this.accelX, this.accelY];
  }
};
__decorateClass([
  type("string")
], _PlayerState.prototype, "name", 2);
__decorateClass([
  type("string")
], _PlayerState.prototype, "team", 2);
__decorateClass([
  type("number")
], _PlayerState.prototype, "radius", 2);
__decorateClass([
  type("number")
], _PlayerState.prototype, "entityState", 2);
__decorateClass([
  type("number")
], _PlayerState.prototype, "x", 2);
__decorateClass([
  type("number")
], _PlayerState.prototype, "y", 2);
__decorateClass([
  type("number")
], _PlayerState.prototype, "kickoffX", 2);
__decorateClass([
  type("number")
], _PlayerState.prototype, "kickoffY", 2);
let PlayerState = _PlayerState;
class BallState extends Schema {
  constructor() {
    super(...arguments);
    this.radius = 19;
  }
}
__decorateClass([
  type("number")
], BallState.prototype, "radius", 2);
__decorateClass([
  type("number")
], BallState.prototype, "x", 2);
__decorateClass([
  type("number")
], BallState.prototype, "y", 2);
__decorateClass([
  type("number")
], BallState.prototype, "kickoffX", 2);
__decorateClass([
  type("number")
], BallState.prototype, "kickoffY", 2);
class GameRoomState extends Schema {
  constructor() {
    super(...arguments);
    this.redTeamScore = 0;
    this.blueTeamScore = 0;
    this.state = GameState.PREPARATION;
    this.players = new MapSchema();
  }
  createPlayer(sessionId, state) {
    this.players.set(sessionId, state);
  }
  removePlayer(sessionId) {
  }
}
__decorateClass([
  type("number")
], GameRoomState.prototype, "state", 2);
__decorateClass([
  type({ map: PlayerState })
], GameRoomState.prototype, "players", 2);
__decorateClass([
  type(BallState)
], GameRoomState.prototype, "ball", 2);

const DEFAULT_GROUP = 0;
const COLLISION_WITH_BALL_GROUP = 1;
const PLAYER_GROUP = 2;
const STADIUM_OUTLINE_MASK = 1 << 0;
const GOAL_POST_MASK = 1 << 1;
const GOAL_POST_NET_MASK = 1 << 2;
const GROUND_CENTERLINE_MASK = 1 << 3;
const GROUND_OUTLINE_MASK = 1 << 4;
const BALL_MASK = 1 << 5;
const RED_PLAYER_MASK = 1 << 6;
const BLUE_PLAYER_MASK = 1 << 7;
const PLAYER_MASK = 1 << 7 | 1 << 6;

const createRoundedPath = (params) => {
  const {
    cx,
    cy,
    radius,
    fromRadian,
    toRadian,
    division,
    reverse = false
  } = params;
  const intervalRadian = (toRadian - fromRadian) / division;
  let targetRadians = [...Array.from({ length: division + 1 }).keys()].map(
    (interval) => fromRadian + intervalRadian * interval
  );
  reverse && (targetRadians = targetRadians.reverse());
  return targetRadians.reduce((path, targetRadian) => {
    return `${path}, ${cx + radius * Math.sin(targetRadian)} ${cy - radius * Math.cos(targetRadian)}`;
  }, "");
};

const WALL_THICK = 80;
const lineWidth = 4;
class MapBuilder {
  constructor(world, map) {
    /** for block */
    this.groundOutLines = [];
    this.leftSideCenterLines = [];
    this.rightSideCenterLines = [];
    this.goalPostNets = [];
    this.world = world;
    this.map = map;
  }
  blockGroundOutLines() {
    this.groundOutLines.forEach((body) => {
      body.collisionFilter.mask = (body.collisionFilter.mask ?? 0) | PLAYER_MASK;
    });
  }
  openGroundLines() {
    this.groundOutLines.forEach((body) => {
      body.collisionFilter.mask = (body.collisionFilter.mask ?? 0) & ~PLAYER_MASK;
    });
  }
  blockCenterLine(side) {
    if (side === "right") {
      this.rightSideCenterLines.forEach((lineBody) => {
        lineBody.collisionFilter.mask = (lineBody.collisionFilter.mask ?? 0) | PLAYER_MASK;
      });
    } else {
      this.leftSideCenterLines.forEach((lineBody) => {
        lineBody.collisionFilter.mask = (lineBody.collisionFilter.mask ?? 0) | PLAYER_MASK;
      });
    }
  }
  openCenterLine() {
    this.rightSideCenterLines.forEach((lineBody) => {
      lineBody.collisionFilter.mask = (lineBody.collisionFilter.mask ?? 0) & ~PLAYER_MASK;
    });
    this.leftSideCenterLines.forEach((lineBody) => {
      lineBody.collisionFilter.mask = (lineBody.collisionFilter.mask ?? 0) & ~PLAYER_MASK;
    });
  }
  blockGoalPostNets() {
    this.goalPostNets.forEach((netBody) => {
      netBody.collisionFilter.mask = (netBody.collisionFilter.mask ?? 0) | PLAYER_MASK;
    });
  }
  openGoalPostNets() {
    this.goalPostNets.forEach((netBody) => {
      netBody.collisionFilter.mask = (netBody.collisionFilter.mask ?? 0) & ~PLAYER_MASK;
    });
  }
  build() {
    const width = this.map.width;
    const height = this.map.height;
    Matter.Composite.add(
      this.world,
      [
        // top
        Matter.Bodies.rectangle(width / 2, 0, width, WALL_THICK),
        // bottom
        Matter.Bodies.rectangle(width / 2, height, width, WALL_THICK),
        // left
        Matter.Bodies.rectangle(
          -WALL_THICK / 2,
          height / 2,
          WALL_THICK,
          height
        ),
        // right
        Matter.Bodies.rectangle(
          width + WALL_THICK / 2,
          height / 2,
          WALL_THICK,
          height
        )
      ].map((body) => {
        body.isStatic = true;
        body.collisionFilter = {
          group: DEFAULT_GROUP,
          category: STADIUM_OUTLINE_MASK,
          mask: PLAYER_MASK
        };
        return body;
      })
    );
    this.groundOutLines = this.drawGroundOutLines();
    const centerLines = this.drawCenterLines();
    const leftHalfCircle = this.drawCenterLeftHalfCircle();
    const rightHalfCircle = this.drawCenterRightHalfCircle();
    this.leftSideCenterLines = [...centerLines, leftHalfCircle];
    this.rightSideCenterLines = [...centerLines, rightHalfCircle];
    this.goalPostNets = this.drawGoalPostNets();
    this.drawGoalPosts();
  }
  drawGoalPosts() {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundX = (width - groundWidth) / 2;
    const goalPostWidth = this.map.ground.goalPostWidth;
    const goalPostTopPositionY = (height - goalPostWidth) / 2;
    const goalPostBottomPositionY = (height + goalPostWidth) / 2;
    const goalPostRadius = this.map.ground.goalPostRadius;
    Matter.Composite.add(
      this.world,
      [
        // left
        Matter.Bodies.circle(groundX, goalPostTopPositionY, goalPostRadius),
        Matter.Bodies.circle(groundX, goalPostBottomPositionY, goalPostRadius),
        // right
        Matter.Bodies.circle(
          groundX + groundWidth,
          goalPostTopPositionY,
          goalPostRadius
        ),
        Matter.Bodies.circle(
          groundX + groundWidth,
          goalPostBottomPositionY,
          goalPostRadius
        )
      ].map((body) => {
        body.isStatic = true;
        body.restitution = 0.8;
        body.collisionFilter = {
          group: COLLISION_WITH_BALL_GROUP,
          category: GOAL_POST_MASK,
          mask: PLAYER_MASK
        };
        return body;
      })
    );
  }
  drawGroundOutLines(mask = 0) {
    const width = this.map.width;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = this.map.ground.x;
    const groundY = this.map.ground.y;
    const { goalPostTopPositionY, goalPostBottomPositionY } = this.map.ground;
    const groundOutLines = [
      // top
      Matter.Bodies.rectangle(
        width / 2,
        groundY - WALL_THICK / 2,
        groundWidth,
        WALL_THICK
      ),
      // bottom
      Matter.Bodies.rectangle(
        width / 2,
        groundY + groundHeight + WALL_THICK / 2,
        groundWidth,
        WALL_THICK
      ),
      // left
      Matter.Bodies.rectangle(
        groundX - WALL_THICK / 2,
        groundY + (goalPostTopPositionY - groundY) / 2,
        WALL_THICK,
        goalPostTopPositionY - groundY
      ),
      Matter.Bodies.rectangle(
        groundX - WALL_THICK / 2,
        goalPostBottomPositionY + (goalPostTopPositionY - groundY) / 2,
        WALL_THICK,
        goalPostTopPositionY - groundY
      ),
      // right
      Matter.Bodies.rectangle(
        groundX + groundWidth + WALL_THICK / 2,
        groundY + (goalPostTopPositionY - groundY) / 2,
        WALL_THICK,
        goalPostTopPositionY - groundY
      ),
      Matter.Bodies.rectangle(
        groundX + groundWidth + WALL_THICK / 2,
        goalPostBottomPositionY + (goalPostTopPositionY - groundY) / 2,
        WALL_THICK,
        goalPostTopPositionY - groundY
      )
    ].map((body) => {
      body.isStatic = true;
      body.restitution = 0.6;
      body.collisionFilter = {
        group: COLLISION_WITH_BALL_GROUP,
        category: GROUND_OUTLINE_MASK,
        mask
      };
      return body;
    });
    Matter.Composite.add(this.world, groundOutLines);
    return groundOutLines;
  }
  drawGoalPostNets() {
    const { width, height, ground } = this.map;
    const {
      width: groundWidth,
      goalPostNetThickness,
      goalPostDepth,
      goalPostWidth,
      goalPostNetCornerRadius
    } = ground;
    const groundX = (width - groundWidth) / 2;
    const goalPostTopPositionY = (height - goalPostWidth) / 2;
    const cornerRoundDivision = 10;
    const path = createRoundedPath({
      cx: goalPostNetCornerRadius,
      cy: goalPostNetCornerRadius,
      radius: goalPostNetCornerRadius + goalPostNetThickness * 0.5,
      fromRadian: 1.5 * Math.PI,
      toRadian: 2 * Math.PI,
      division: cornerRoundDivision,
      reverse: true
    }) + createRoundedPath({
      cx: goalPostNetCornerRadius,
      cy: goalPostWidth - goalPostNetCornerRadius,
      radius: goalPostNetCornerRadius + goalPostNetThickness * 0.5,
      fromRadian: 1 * Math.PI,
      toRadian: 1.5 * Math.PI,
      division: cornerRoundDivision,
      reverse: true
    }) + createRoundedPath({
      cx: goalPostNetCornerRadius,
      cy: goalPostWidth - goalPostNetCornerRadius,
      radius: goalPostNetCornerRadius - goalPostNetThickness,
      fromRadian: 1 * Math.PI,
      toRadian: 1.5 * Math.PI,
      division: cornerRoundDivision
    }) + createRoundedPath({
      cx: goalPostNetCornerRadius,
      cy: goalPostNetCornerRadius,
      radius: goalPostNetCornerRadius - goalPostNetThickness,
      fromRadian: 1.5 * Math.PI,
      toRadian: 2 * Math.PI,
      division: cornerRoundDivision
    });
    const netVertices = Matter.Vertices.fromPath(path, Matter.Body.create({}));
    const leftNetBody = Matter.Bodies.fromVertices(
      groundX - goalPostDepth * 0.5 - 14,
      goalPostTopPositionY + goalPostWidth / 2,
      [netVertices],
      {
        isStatic: true
      }
    );
    const rightNetBody = Matter.Bodies.fromVertices(
      groundX + groundWidth + goalPostDepth * 0.5 + 14,
      goalPostTopPositionY + goalPostWidth / 2,
      [netVertices],
      {
        isStatic: true
      }
    );
    Matter.Body.rotate(rightNetBody, Math.PI);
    Matter.Composite.add(
      this.world,
      [leftNetBody, rightNetBody].map((body) => {
        body.collisionFilter = {
          group: COLLISION_WITH_BALL_GROUP,
          category: GOAL_POST_NET_MASK
        };
        return body;
      })
    );
    return [leftNetBody, rightNetBody];
  }
  drawCenterLeftHalfCircle(mask = 0) {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = (width - groundWidth) * 0.5;
    const groundY = (height - groundHeight) * 0.5;
    const cx = groundX + groundWidth * 0.5;
    const cy = groundY + groundHeight * 0.5;
    const radius = groundHeight * 0.222222;
    const rightHalfCircleVertices = this.createRightHalfCircleVertices();
    const leftHalfCircleBody = Matter.Bodies.fromVertices(
      cx - (radius / 2 + lineWidth * 4 + 2),
      cy,
      [rightHalfCircleVertices],
      {
        isStatic: true,
        collisionFilter: {
          category: GROUND_CENTERLINE_MASK
        }
      }
    );
    Matter.Body.rotate(leftHalfCircleBody, Math.PI);
    leftHalfCircleBody.collisionFilter.mask = mask;
    Matter.Composite.add(this.world, [leftHalfCircleBody]);
    return leftHalfCircleBody;
  }
  drawCenterRightHalfCircle(mask = 0) {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = (width - groundWidth) * 0.5;
    const groundY = (height - groundHeight) * 0.5;
    const cx = groundX + groundWidth * 0.5;
    const cy = groundY + groundHeight * 0.5;
    const radius = groundHeight * 0.222222;
    const rightHalfCircleVertices = this.createRightHalfCircleVertices();
    const rightHalfCircleBody = Matter.Bodies.fromVertices(
      cx + radius / 2 + lineWidth * 4 + 2,
      cy,
      [rightHalfCircleVertices],
      {
        isStatic: true,
        collisionFilter: {
          category: GROUND_CENTERLINE_MASK
        }
      }
    );
    rightHalfCircleBody.collisionFilter.mask = mask;
    Matter.Composite.add(this.world, [rightHalfCircleBody]);
    return rightHalfCircleBody;
  }
  createRightHalfCircleVertices() {
    const groundHeight = this.map.ground.height;
    const radius = groundHeight * 0.222222;
    const division = 20;
    const rightHalfCirclePath = createRoundedPath({
      cx: 0,
      cy: 0,
      radius: radius + lineWidth * 0.5,
      fromRadian: 0,
      toRadian: Math.PI,
      division
    }) + createRoundedPath({
      cx: 0,
      cy: 0,
      radius: radius - lineWidth * 0.5,
      fromRadian: 0,
      toRadian: Math.PI,
      division,
      reverse: true
    });
    return Matter.Vertices.fromPath(
      rightHalfCirclePath,
      Matter.Body.create({})
    );
  }
  /** NOTE: center circle기준으로 위, 아래 라인만 */
  drawCenterLines(mask = 0) {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = (width - groundWidth) / 2;
    const groundY = (height - groundHeight) / 2;
    const cx = groundX + groundWidth * 0.5;
    const centerCircleRadius = groundHeight * 0.222222;
    const upperHalfLineHeight = (groundHeight - centerCircleRadius * 2) * 0.5;
    const lineWidth2 = 4;
    const upperCenterLineBody = Matter.Bodies.rectangle(
      cx,
      groundY + upperHalfLineHeight * 0.5,
      lineWidth2,
      upperHalfLineHeight,
      {
        isStatic: true,
        collisionFilter: {
          category: GROUND_CENTERLINE_MASK,
          mask
        }
      }
    );
    const lowerCenterLineBody = Matter.Bodies.rectangle(
      cx,
      groundY + groundHeight - upperHalfLineHeight * 0.5,
      lineWidth2,
      upperHalfLineHeight,
      {
        isStatic: true,
        collisionFilter: {
          category: GROUND_CENTERLINE_MASK,
          mask
        }
      }
    );
    const lineBodies = [upperCenterLineBody, lowerCenterLineBody];
    Matter.Composite.add(this.world, lineBodies);
    return lineBodies;
  }
}

global.decomp = decomp;
class GameEngine {
  constructor(room) {
    this.players = {};
    this.room = room;
    this.state = room.state;
    this.engine = Matter.Engine.create({
      positionIterations: 8,
      velocityIterations: 6
    });
    this.world = this.engine.world;
    this.init();
  }
  init() {
    this.engine.gravity = { x: 0, y: 0, scale: 1 };
    this.initUpdateEvents();
    this.initCollisionEvents();
  }
  buildMap(map) {
    this.mapBuilder = new MapBuilder(this.world, map);
    this.mapBuilder.build();
    this.redGoalLine = map.ground.x;
    this.blueGoalLine = map.ground.x + map.ground.width;
  }
  initUpdateEvents() {
    Matter.Events.on(this.engine, "afterUpdate", () => {
      const { x: ballX } = this.ball.position;
      switch (this.state.state) {
        case GameState.PROGRESS:
          if (ballX < this.redGoalLine || ballX > this.blueGoalLine) {
            this.state.state = GameState.GOAL;
            const isRedTeamGoal = ballX > this.blueGoalLine;
            if (isRedTeamGoal) {
              this.state.redTeamScore += 1;
              this.room.broadcast(GameRoomMessageType.GOAL, {
                team: Team.RED,
                redTeamScore: this.state.redTeamScore,
                blueTeamScore: this.state.blueTeamScore
              });
            } else {
              this.state.blueTeamScore += 1;
              this.room.broadcast(GameRoomMessageType.GOAL, {
                team: Team.BLUE,
                redTeamScore: this.state.redTeamScore,
                blueTeamScore: this.state.blueTeamScore
              });
            }
            const endScore = this.room.setting.endScore;
            if (this.state.redTeamScore === endScore || this.state.blueTeamScore === endScore) {
              const isRedTeamVictory = this.state.redTeamScore === endScore;
              isRedTeamVictory ? this.room.broadcast(GameRoomMessageType.END, {
                victoryTeam: Team.RED
              }) : this.room.broadcast(GameRoomMessageType.END, {
                victoryTeam: Team.BLUE
              });
              setTimeout(() => {
                this.destroy();
              }, 3e3);
            } else {
              setTimeout(() => {
                this.setupKickoff(isRedTeamGoal ? Team.BLUE : Team.RED);
              }, 3e3);
            }
          }
          break;
        case GameState.KICKOFF:
          break;
      }
      const { x, y } = this.ball.position;
      this.state.ball.x = x;
      this.state.ball.y = y;
      for (const key in this.players) {
        const worldPlayer = this.players[key];
        const player = this.state.players.get(key);
        if (!worldPlayer || !player) {
          continue;
        }
        const { x: x2, y: y2 } = worldPlayer.position;
        player.x = x2;
        player.y = y2;
        if (player.entityState === PlayerEntityState.SHOOTING) {
          this.processPlayerShoot(worldPlayer, player);
        }
      }
    });
  }
  initCollisionEvents() {
  }
  update(delta) {
    this.state.players.forEach((player) => {
      let action;
      while (action = player.actionQueue.shift()) {
        this.processPlayerAction(player.id, action);
      }
    });
    Matter.Engine.update(this.engine, delta);
  }
  addBall(state) {
    const { kickoffX: x, kickoffY: y, radius } = state;
    this.ball = Matter.Bodies.circle(x, y, radius);
    this.ball.mass = 5;
    this.ball.friction = 0;
    this.ball.frictionStatic = 5;
    this.ball.frictionAir = 0.018;
    this.ball.inertia = Infinity;
    this.ball.collisionFilter = {
      group: COLLISION_WITH_BALL_GROUP,
      category: BALL_MASK,
      mask: PLAYER_MASK
    };
    Matter.Composite.add(this.world, [this.ball]);
    this.state.ball = state;
  }
  addPlayer(sessionId, state) {
    const { kickoffX: x, kickoffY: y, radius, team } = state;
    const worldPlayer = Matter.Bodies.circle(x, y, radius);
    worldPlayer.mass = 40;
    worldPlayer.friction = 0;
    worldPlayer.frictionStatic = 0;
    worldPlayer.frictionAir = 0;
    worldPlayer.inertia = Infinity;
    worldPlayer.collisionFilter = {
      group: PLAYER_GROUP,
      category: team === Team.RED ? RED_PLAYER_MASK : BLUE_PLAYER_MASK,
      mask: STADIUM_OUTLINE_MASK | GROUND_OUTLINE_MASK | GROUND_CENTERLINE_MASK | GOAL_POST_MASK | GOAL_POST_NET_MASK | BALL_MASK
    };
    this.players[sessionId] = worldPlayer;
    Matter.Composite.add(this.world, [worldPlayer]);
    this.state.createPlayer(sessionId, state);
  }
  removePlayer(sessionId) {
    const player = this.players[sessionId];
    Matter.Composite.remove(this.world, [player]);
    this.state.removePlayer(sessionId);
  }
  processPlayerAction(sessionId, action) {
    const worldPlayer = this.players[sessionId];
    const player = this.state.players.get(sessionId);
    if (!worldPlayer || !player) {
      return;
    }
    const { type, payload } = action;
    switch (type) {
      case GameRoomActionType.DIRECTION:
        this.processPlayerDirection(worldPlayer, player, payload);
        break;
      case GameRoomActionType.SHOOT_START:
        player.entityState = PlayerEntityState.SHOOTING;
        break;
      case GameRoomActionType.SHOOT_END:
        player.entityState = PlayerEntityState.IDLE;
        break;
    }
  }
  destroy() {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
    this.room.broadcast(GameRoomMessageType.DISPOSE);
    this.room.disconnect();
  }
  /** FIXME: duplicate logic */
  // TODO: layout 로직 분리
  setupKickoff(team) {
    this.mapBuilder.blockGroundOutLines();
    this.mapBuilder.blockCenterLine(team === Team.RED ? "right" : "left");
    this.mapBuilder.blockGoalPostNets();
    for (const key in this.players) {
      const worldPlayer = this.players[key];
      const player = this.state.players.get(key);
      if (!worldPlayer || !player)
        continue;
      Matter.Body.setPosition(worldPlayer, {
        x: player.kickoffX,
        y: player.kickoffY
      });
      Matter.Body.setVelocity(worldPlayer, { x: 0, y: 0 });
    }
    Matter.Body.setPosition(this.ball, {
      x: this.state.ball.kickoffX,
      y: this.state.ball.kickoffY
    });
    Matter.Body.setVelocity(this.ball, { x: 0, y: 0 });
    this.onceDetectBallTouch(() => {
      this.state.state = GameState.PROGRESS;
      this.mapBuilder.openCenterLine();
      this.mapBuilder.openGroundLines();
      this.mapBuilder.openGoalPostNets();
    });
    this.state.state = GameState.KICKOFF;
    setTimeout(() => {
      this.room.broadcast(GameRoomMessageType.KICKOFF);
    }, 100);
  }
  processPlayerDirection(worldPlayer, player, payload) {
    const speedLimit = player.entityState === PlayerEntityState.SHOOTING ? PlayerState.SHOOTING_SPEED_LIMIT : PlayerState.SPEED_LIMIT;
    const friction = PlayerState.FRICTION;
    const currVelocity = worldPlayer.velocity;
    const [accelX, accelY] = player.accelrate(payload.direction);
    let newVx = currVelocity.x;
    let newVy = currVelocity.y;
    accelX ? newVx = (Math.sign(newVx + accelX) || 1) * Math.min(speedLimit, Math.abs(newVx + accelX)) : newVx -= newVx * (friction + accelY ? 0.01 : 0);
    accelY ? newVy = (Math.sign(newVy + accelY) || 1) * Math.min(speedLimit, Math.abs(newVy + accelY)) : newVy -= newVy * (friction + accelX ? 0.01 : 0);
    const speed = Math.sqrt(newVx * newVx + newVy * newVy);
    const overSpeedRatio = speed / speedLimit;
    if (overSpeedRatio > 1) {
      newVx /= overSpeedRatio;
      newVy /= overSpeedRatio;
    }
    Matter.Body.setVelocity(worldPlayer, { x: newVx, y: newVy });
  }
  processPlayerShoot(worldPlayer, player) {
    const contactThreshold = 1;
    const shootForce = 0.04;
    const worldBall = this.ball;
    const diffVectorX = worldBall.position.x - worldPlayer.position.x;
    const diffVectorY = worldBall.position.y - worldPlayer.position.y;
    const distBetweenCenter = Math.sqrt(
      diffVectorX * diffVectorX + diffVectorY * diffVectorY
    );
    const distBetweenBody = distBetweenCenter - (worldPlayer.circleRadius ?? 0) - (worldBall.circleRadius ?? 0);
    if (distBetweenBody > contactThreshold) {
      return;
    }
    const unitVectorX = diffVectorX / distBetweenCenter;
    const unitVectorY = diffVectorY / distBetweenCenter;
    Matter.Body.applyForce(worldBall, worldBall.position, {
      x: unitVectorX * Math.sqrt(shootForce),
      y: unitVectorY * Math.sqrt(shootForce)
    });
    player.entityState = PlayerEntityState.IDLE;
    this.room.broadcast(GameRoomMessageType.SHOOT);
  }
  onceDetectBallTouch(onBallTouch) {
    const cb = (event) => {
      for (const { bodyA, bodyB } of event.pairs) {
        if (bodyA === this.ball || bodyB === this.ball) {
          Matter.Events.off(this.engine, "collisionStart", cb);
          onBallTouch();
        }
      }
    };
    Matter.Events.on(this.engine, "collisionStart", cb);
  }
}

class GameRoom extends Room {
  constructor() {
    super(...arguments);
    this.maxClients = 10;
  }
  onCreate(params) {
    console.log("game room", this.roomId, "creating...");
    const { setting } = params;
    this.setting = setting;
    this.setState(new GameRoomState());
    this.engine = new GameEngine(this);
    this.setPatchRate(33.33);
    this.setSimulationInterval((delta) => this.engine.update(delta));
    const { map } = this.setting;
    this.engine.buildMap(map);
    this.engine.addBall(
      new BallState({
        kickoffX: map.kickoff.ball.x,
        kickoffY: map.kickoff.ball.y
      })
    );
    this.initMessageHandlers();
  }
  /** NOTE: host의 경우 create타고 바로 여기 탐 */
  onJoin(client, params) {
    console.log(client.sessionId, "joined!", params);
    const { team, name, index } = params.hostJoinInfo ?? params;
    this.addPlayer(client.sessionId, { team, name, index });
    if (this.isReady()) {
      this.engine.setupKickoff(Team.RED);
      this.engine.mapBuilder.blockCenterLine("left");
      setTimeout(() => {
        console.log("ready_to_start");
        this.broadcast(GameRoomMessageType.READY_TO_START);
      }, 1e3);
    }
  }
  onLeave(client, consented) {
    console.log(client.sessionId, "left!");
  }
  onDispose() {
    console.log("game room", this.roomId, "disposing...");
  }
  getTotalPlayerCount() {
    return this.setting.redTeamCount + this.setting.blueTeamCount;
  }
  getActivePlayerCount() {
    return this.state.players.size;
  }
  isReady() {
    return this.getTotalPlayerCount() === this.getActivePlayerCount();
  }
  initMessageHandlers() {
    this.onMessage(
      GameRoomMessageType.USER_READY_TO_KICKOFF,
      /* @__PURE__ */ (() => {
        let count = 0;
        return (client) => {
          if (++count === this.getTotalPlayerCount()) {
            this.engine.mapBuilder.openCenterLine();
            this.broadcast(GameRoomMessageType.KICKOFF);
          }
        };
      })()
    );
    this.onMessage(
      GameRoomMessageType.USER_ACTION,
      (client, action) => {
        const player = this.state.players.get(client.sessionId);
        player?.actionQueue.push(action);
      }
    );
  }
  addPlayer(sessionId, params) {
    const { team, name, index } = params;
    const height = this.setting.map.height;
    const centerLine = this.setting.map.width / 2;
    const redTeamCount = this.setting.redTeamCount;
    const blueTeamCount = this.setting.blueTeamCount;
    const engagedTeamCount = team === Team.RED ? redTeamCount : blueTeamCount;
    const playerState = new PlayerState({
      id: sessionId,
      index,
      team,
      name,
      kickoffX: centerLine + (team === Team.RED ? -1 : 1) * centerLine / 2,
      kickoffY: height * (index + 1) / (engagedTeamCount + 1)
    });
    switch (team) {
      case Team.RED:
        this.engine.addPlayer(sessionId, playerState);
        break;
      case Team.BLUE:
        this.engine.addPlayer(sessionId, playerState);
        break;
    }
  }
}

const { FE_PORT } = process.env;
const config = {
  initializeGameServer: (gameServer) => {
    gameServer.define(RoomType.WAITING_ROOM, WaitingRoom);
    gameServer.define(RoomType.GAME_ROOM, GameRoom);
  },
  initializeExpress: (app) => {
    app.use("/monitor", monitor());
    if (FE_PORT) {
      app.use("/playground", playground);
      app.use(
        createProxyMiddleware("/", { target: `http://localhost:${FE_PORT}/` })
      );
    }
  },
  beforeListen: () => {
  }
};

const { BE_PORT } = process.env;
listen(config, BE_PORT ? +BE_PORT : void 0);
//# sourceMappingURL=index.js.map
