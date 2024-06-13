import { listen as bi } from "@colyseus/tools";
import { monitor as Oi } from "@colyseus/monitor";
import { playground as Ti } from "@colyseus/playground";
import { createProxyMiddleware as vi } from "http-proxy-middleware";
import un from "node:tty";
import Ai from "node:util";
import $i from "node:os";
import { createRequire as Ii } from "node:module";
import ls from "node:crypto";
import dn, { EventEmitter as Ri } from "node:events";
import ki from "node:https";
import gn from "node:http";
import Li from "node:net";
import Di from "node:tls";
import Ni from "node:url";
import Pi from "node:zlib";
import pn from "node:stream";
import Mi from "node:path";
import P from "matter-js";
import Fi from "poly-decomp-es";
var mr = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function fs(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
function _n(s) {
  if (s.__esModule)
    return s;
  var e = s.default;
  if (typeof e == "function") {
    var t = function r() {
      return this instanceof r ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else
    t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(s).forEach(function(r) {
    var n = Object.getOwnPropertyDescriptor(s, r);
    Object.defineProperty(t, r, n.get ? n : {
      enumerable: !0,
      get: function() {
        return s[r];
      }
    });
  }), t;
}
var mn = {}, Qe = {};
Object.defineProperty(Qe, "__esModule", { value: !0 });
Qe.Delayed = Qe.Type = void 0;
var Ot;
(function(s) {
  s[s.Interval = 0] = "Interval", s[s.Timeout = 1] = "Timeout", s[s.Async = 2] = "Async";
})(Ot || (Qe.Type = Ot = {}));
class Bi {
  constructor(e, t, r, n) {
    this.active = !0, this.paused = !1, this.elapsedTime = 0, this.handler = e, this.args = t, this.time = r, this.type = n;
  }
  tick(e) {
    this.paused || (this.elapsedTime += e, this.elapsedTime >= this.time && this.execute());
  }
  execute() {
    switch (this.handler.apply(this, this.args), this.type) {
      case Ot.Timeout:
      case Ot.Async:
        this.active = !1;
        break;
      case Ot.Interval:
        this.elapsedTime -= this.time;
        break;
    }
  }
  reset() {
    this.elapsedTime = 0;
  }
  pause() {
    this.paused = !0;
  }
  resume() {
    this.paused = !1;
  }
  clear() {
    this.active = !1;
  }
}
Qe.Delayed = Bi;
var Nt = {};
Object.defineProperty(Nt, "__esModule", { value: !0 });
Nt.TimerClearedError = void 0;
class Ui extends Error {
  constructor() {
    super("Timer has been cleared");
  }
}
Nt.TimerClearedError = Ui;
var hs = {}, ji = function() {
  function s(e) {
    e === void 0 && (e = !1), this.running = !1, this.now = typeof window < "u" && window.performance && window.performance.now && window.performance.now.bind(window.performance) || Date.now, this.start(e);
  }
  return s.prototype.start = function(e) {
    e === void 0 && (e = !1), this.deltaTime = 0, this.currentTime = this.now(), this.elapsedTime = 0, this.running = !0, e && (this._interval = setInterval(this.tick.bind(this), 1e3 / 60));
  }, s.prototype.stop = function() {
    this.running = !1, this._interval && clearInterval(this._interval);
  }, s.prototype.tick = function(e) {
    e === void 0 && (e = this.now()), this.deltaTime = e - this.currentTime, this.currentTime = e, this.elapsedTime += this.deltaTime;
  }, s;
}(), Vi = ji, Gi = mr && mr.__importDefault || function(s) {
  return s && s.__esModule ? s : { default: s };
};
Object.defineProperty(hs, "__esModule", { value: !0 });
hs.ClockTimer = void 0;
const Wi = Gi(Vi), ot = Qe, Hi = Nt;
class Yi extends Wi.default {
  constructor(e = !1) {
    super(e), this.delayed = [];
  }
  /**
   * Re-evaluate all the scheduled timeouts and intervals and execute appropriate handlers.
   * Use this in your own context or not if your passed `autoStart` as `true` in the constructor.
   */
  tick() {
    super.tick();
    let e = this.delayed, t = e.length;
    for (; t--; ) {
      const r = e[t];
      if (r.active)
        r.tick(this.deltaTime);
      else {
        e.splice(t, 1);
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
  setInterval(e, t, ...r) {
    const n = new ot.Delayed(e, r, t, ot.Type.Interval);
    return this.delayed.push(n), n;
  }
  /**
   * Schedule a function to be called after a delay.
   *
   * This `time` minimum value will be tied to the `tick` method of the clock. This means if you use the default `autoStart` value from the constructor, the minimum value will be 16ms. Otherwise it will depend on your `tick` method call.
   *
   * Returns a {@link Delayed} object that can be used to clear the timeout or play around with it.
   */
  setTimeout(e, t, ...r) {
    const n = new ot.Delayed(e, r, t, ot.Type.Timeout);
    return this.delayed.push(n), n;
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
  duration(e) {
    return new Promise((t, r) => {
      const n = new ot.Delayed(t, void 0, e, ot.Type.Async);
      n.clear = () => {
        n.active = !1, r(new Hi.TimerClearedError());
      }, this.delayed.push(n);
    });
  }
  /**
   * Delete any scheduled timeout or interval. That will never be executed.
   *
   * If some of the timeouts/intervals are already executed, they will be removed from the list and callback will be garbage collected.
   * For timeout created with {@link ClockTimer.duration}, the promise will be rejected and therefore the unused resolving callback will be garbage collected.
   */
  clear() {
    let e = this.delayed.length;
    for (; e--; )
      this.delayed[e].clear();
    this.delayed = [];
  }
}
hs.ClockTimer = Yi;
(function(s) {
  Object.defineProperty(s, "__esModule", { value: !0 }), s.TimerClearedError = s.Type = s.Delayed = void 0;
  var e = Qe;
  Object.defineProperty(s, "Delayed", { enumerable: !0, get: function() {
    return e.Delayed;
  } }), Object.defineProperty(s, "Type", { enumerable: !0, get: function() {
    return e.Type;
  } });
  var t = Nt;
  Object.defineProperty(s, "TimerClearedError", { enumerable: !0, get: function() {
    return t.TimerClearedError;
  } });
  const r = hs;
  s.default = r.ClockTimer;
})(mn);
const zi = /* @__PURE__ */ fs(mn);
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
var Vs = { exports: {} }, Ut = { exports: {} }, vs, xr;
function qi() {
  if (xr)
    return vs;
  xr = 1;
  var s = 1e3, e = s * 60, t = e * 60, r = t * 24, n = r * 7, i = r * 365.25;
  vs = function(c, d) {
    d = d || {};
    var h = typeof c;
    if (h === "string" && c.length > 0)
      return o(c);
    if (h === "number" && isFinite(c))
      return d.long ? a(c) : l(c);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(c)
    );
  };
  function o(c) {
    if (c = String(c), !(c.length > 100)) {
      var d = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        c
      );
      if (d) {
        var h = parseFloat(d[1]), x = (d[2] || "ms").toLowerCase();
        switch (x) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return h * i;
          case "weeks":
          case "week":
          case "w":
            return h * n;
          case "days":
          case "day":
          case "d":
            return h * r;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return h * t;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return h * e;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return h * s;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return h;
          default:
            return;
        }
      }
    }
  }
  function l(c) {
    var d = Math.abs(c);
    return d >= r ? Math.round(c / r) + "d" : d >= t ? Math.round(c / t) + "h" : d >= e ? Math.round(c / e) + "m" : d >= s ? Math.round(c / s) + "s" : c + "ms";
  }
  function a(c) {
    var d = Math.abs(c);
    return d >= r ? f(c, d, r, "day") : d >= t ? f(c, d, t, "hour") : d >= e ? f(c, d, e, "minute") : d >= s ? f(c, d, s, "second") : c + " ms";
  }
  function f(c, d, h, x) {
    var S = d >= h * 1.5;
    return Math.round(c / h) + " " + x + (S ? "s" : "");
  }
  return vs;
}
var As, yr;
function xn() {
  if (yr)
    return As;
  yr = 1;
  function s(e) {
    r.debug = r, r.default = r, r.coerce = f, r.disable = o, r.enable = i, r.enabled = l, r.humanize = qi(), r.destroy = c, Object.keys(e).forEach((d) => {
      r[d] = e[d];
    }), r.names = [], r.skips = [], r.formatters = {};
    function t(d) {
      let h = 0;
      for (let x = 0; x < d.length; x++)
        h = (h << 5) - h + d.charCodeAt(x), h |= 0;
      return r.colors[Math.abs(h) % r.colors.length];
    }
    r.selectColor = t;
    function r(d) {
      let h, x = null, S, m;
      function b(...R) {
        if (!b.enabled)
          return;
        const L = b, k = Number(/* @__PURE__ */ new Date()), A = k - (h || k);
        L.diff = A, L.prev = h, L.curr = k, h = k, R[0] = r.coerce(R[0]), typeof R[0] != "string" && R.unshift("%O");
        let D = 0;
        R[0] = R[0].replace(/%([a-zA-Z%])/g, (w, E) => {
          if (w === "%%")
            return "%";
          D++;
          const N = r.formatters[E];
          if (typeof N == "function") {
            const B = R[D];
            w = N.call(L, B), R.splice(D, 1), D--;
          }
          return w;
        }), r.formatArgs.call(L, R), (L.log || r.log).apply(L, R);
      }
      return b.namespace = d, b.useColors = r.useColors(), b.color = r.selectColor(d), b.extend = n, b.destroy = r.destroy, Object.defineProperty(b, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => x !== null ? x : (S !== r.namespaces && (S = r.namespaces, m = r.enabled(d)), m),
        set: (R) => {
          x = R;
        }
      }), typeof r.init == "function" && r.init(b), b;
    }
    function n(d, h) {
      const x = r(this.namespace + (typeof h > "u" ? ":" : h) + d);
      return x.log = this.log, x;
    }
    function i(d) {
      r.save(d), r.namespaces = d, r.names = [], r.skips = [];
      let h;
      const x = (typeof d == "string" ? d : "").split(/[\s,]+/), S = x.length;
      for (h = 0; h < S; h++)
        x[h] && (d = x[h].replace(/\*/g, ".*?"), d[0] === "-" ? r.skips.push(new RegExp("^" + d.slice(1) + "$")) : r.names.push(new RegExp("^" + d + "$")));
    }
    function o() {
      const d = [
        ...r.names.map(a),
        ...r.skips.map(a).map((h) => "-" + h)
      ].join(",");
      return r.enable(""), d;
    }
    function l(d) {
      if (d[d.length - 1] === "*")
        return !0;
      let h, x;
      for (h = 0, x = r.skips.length; h < x; h++)
        if (r.skips[h].test(d))
          return !1;
      for (h = 0, x = r.names.length; h < x; h++)
        if (r.names[h].test(d))
          return !0;
      return !1;
    }
    function a(d) {
      return d.toString().substring(2, d.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function f(d) {
      return d instanceof Error ? d.stack || d.message : d;
    }
    function c() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return r.enable(r.load()), r;
  }
  return As = s, As;
}
var Er;
function Ji() {
  return Er || (Er = 1, function(s, e) {
    e.formatArgs = r, e.save = n, e.load = i, e.useColors = t, e.storage = o(), e.destroy = /* @__PURE__ */ (() => {
      let a = !1;
      return () => {
        a || (a = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), e.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function t() {
      return typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs) ? !0 : typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/) ? !1 : typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function r(a) {
      if (a[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + a[0] + (this.useColors ? "%c " : " ") + "+" + s.exports.humanize(this.diff), !this.useColors)
        return;
      const f = "color: " + this.color;
      a.splice(1, 0, f, "color: inherit");
      let c = 0, d = 0;
      a[0].replace(/%[a-zA-Z%]/g, (h) => {
        h !== "%%" && (c++, h === "%c" && (d = c));
      }), a.splice(d, 0, f);
    }
    e.log = console.debug || console.log || (() => {
    });
    function n(a) {
      try {
        a ? e.storage.setItem("debug", a) : e.storage.removeItem("debug");
      } catch {
      }
    }
    function i() {
      let a;
      try {
        a = e.storage.getItem("debug");
      } catch {
      }
      return !a && typeof process < "u" && "env" in process && (a = process.env.DEBUG), a;
    }
    function o() {
      try {
        return localStorage;
      } catch {
      }
    }
    s.exports = xn()(e);
    const { formatters: l } = s.exports;
    l.j = function(a) {
      try {
        return JSON.stringify(a);
      } catch (f) {
        return "[UnexpectedJSONParseError]: " + f.message;
      }
    };
  }(Ut, Ut.exports)), Ut.exports;
}
var jt = { exports: {} }, $s, Sr;
function Ki() {
  return Sr || (Sr = 1, $s = (s, e = process.argv) => {
    const t = s.startsWith("-") ? "" : s.length === 1 ? "-" : "--", r = e.indexOf(t + s), n = e.indexOf("--");
    return r !== -1 && (n === -1 || r < n);
  }), $s;
}
var Is, wr;
function Xi() {
  if (wr)
    return Is;
  wr = 1;
  const s = $i, e = un, t = Ki(), { env: r } = process;
  let n;
  t("no-color") || t("no-colors") || t("color=false") || t("color=never") ? n = 0 : (t("color") || t("colors") || t("color=true") || t("color=always")) && (n = 1), "FORCE_COLOR" in r && (r.FORCE_COLOR === "true" ? n = 1 : r.FORCE_COLOR === "false" ? n = 0 : n = r.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(r.FORCE_COLOR, 10), 3));
  function i(a) {
    return a === 0 ? !1 : {
      level: a,
      hasBasic: !0,
      has256: a >= 2,
      has16m: a >= 3
    };
  }
  function o(a, f) {
    if (n === 0)
      return 0;
    if (t("color=16m") || t("color=full") || t("color=truecolor"))
      return 3;
    if (t("color=256"))
      return 2;
    if (a && !f && n === void 0)
      return 0;
    const c = n || 0;
    if (r.TERM === "dumb")
      return c;
    if (process.platform === "win32") {
      const d = s.release().split(".");
      return Number(d[0]) >= 10 && Number(d[2]) >= 10586 ? Number(d[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in r)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((d) => d in r) || r.CI_NAME === "codeship" ? 1 : c;
    if ("TEAMCITY_VERSION" in r)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(r.TEAMCITY_VERSION) ? 1 : 0;
    if (r.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in r) {
      const d = parseInt((r.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (r.TERM_PROGRAM) {
        case "iTerm.app":
          return d >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(r.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(r.TERM) || "COLORTERM" in r ? 1 : c;
  }
  function l(a) {
    const f = o(a, a && a.isTTY);
    return i(f);
  }
  return Is = {
    supportsColor: l,
    stdout: i(o(!0, e.isatty(1))),
    stderr: i(o(!0, e.isatty(2)))
  }, Is;
}
var Cr;
function Qi() {
  return Cr || (Cr = 1, function(s, e) {
    const t = un, r = Ai;
    e.init = c, e.log = l, e.formatArgs = i, e.save = a, e.load = f, e.useColors = n, e.destroy = r.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), e.colors = [6, 2, 3, 4, 5, 1];
    try {
      const h = Xi();
      h && (h.stderr || h).level >= 2 && (e.colors = [
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
      ]);
    } catch {
    }
    e.inspectOpts = Object.keys(process.env).filter((h) => /^debug_/i.test(h)).reduce((h, x) => {
      const S = x.substring(6).toLowerCase().replace(/_([a-z])/g, (b, R) => R.toUpperCase());
      let m = process.env[x];
      return /^(yes|on|true|enabled)$/i.test(m) ? m = !0 : /^(no|off|false|disabled)$/i.test(m) ? m = !1 : m === "null" ? m = null : m = Number(m), h[S] = m, h;
    }, {});
    function n() {
      return "colors" in e.inspectOpts ? !!e.inspectOpts.colors : t.isatty(process.stderr.fd);
    }
    function i(h) {
      const { namespace: x, useColors: S } = this;
      if (S) {
        const m = this.color, b = "\x1B[3" + (m < 8 ? m : "8;5;" + m), R = `  ${b};1m${x} \x1B[0m`;
        h[0] = R + h[0].split(`
`).join(`
` + R), h.push(b + "m+" + s.exports.humanize(this.diff) + "\x1B[0m");
      } else
        h[0] = o() + x + " " + h[0];
    }
    function o() {
      return e.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function l(...h) {
      return process.stderr.write(r.format(...h) + `
`);
    }
    function a(h) {
      h ? process.env.DEBUG = h : delete process.env.DEBUG;
    }
    function f() {
      return process.env.DEBUG;
    }
    function c(h) {
      h.inspectOpts = {};
      const x = Object.keys(e.inspectOpts);
      for (let S = 0; S < x.length; S++)
        h.inspectOpts[x[S]] = e.inspectOpts[x[S]];
    }
    s.exports = xn()(e);
    const { formatters: d } = s.exports;
    d.o = function(h) {
      return this.inspectOpts.colors = this.useColors, r.inspect(h, this.inspectOpts).split(`
`).map((x) => x.trim()).join(" ");
    }, d.O = function(h) {
      return this.inspectOpts.colors = this.useColors, r.inspect(h, this.inspectOpts);
    };
  }(jt, jt.exports)), jt.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Vs.exports = Ji() : Vs.exports = Qi();
var Zi = Vs.exports;
const je = /* @__PURE__ */ fs(Zi);
let ir = console;
var Gs;
try {
  Gs = new TextDecoder();
} catch {
}
var C, ye, u = 0;
const or = [];
var Xe = or, At = 0, J = {}, G, Ie, xe = 0, Ce = 0, ee, Re, ae = [], V, br = {
  useRecords: !1,
  mapsAsObjects: !0
};
class yn {
}
const En = new yn();
En.name = "MessagePack 0xC1";
var Ue = !1, Sn = 2, Ws, Hs, Ys;
try {
  new Function("");
} catch {
  Sn = 1 / 0;
}
class $t {
  constructor(e) {
    e && (e.useRecords === !1 && e.mapsAsObjects === void 0 && (e.mapsAsObjects = !0), e.sequential && e.trusted !== !1 && (e.trusted = !0, !e.structures && e.useRecords != !1 && (e.structures = [], e.maxSharedStructures || (e.maxSharedStructures = 0))), e.structures ? e.structures.sharedLength = e.structures.length : e.getStructures && ((e.structures = []).uninitialized = !0, e.structures.sharedLength = 0), e.int64AsNumber && (e.int64AsType = "number")), Object.assign(this, e);
  }
  unpack(e, t) {
    if (C)
      return In(() => (zs(), this ? this.unpack(e, t) : $t.prototype.unpack.call(br, e, t)));
    !e.buffer && e.constructor === ArrayBuffer && (e = typeof Buffer < "u" ? Buffer.from(e) : new Uint8Array(e)), typeof t == "object" ? (ye = t.end || e.length, u = t.start || 0) : (u = 0, ye = t > -1 ? t : e.length), At = 0, Ce = 0, Ie = null, Xe = or, ee = null, C = e;
    try {
      V = e.dataView || (e.dataView = new DataView(e.buffer, e.byteOffset, e.byteLength));
    } catch (r) {
      throw C = null, e instanceof Uint8Array ? r : new Error("Source must be a Uint8Array or Buffer but was a " + (e && typeof e == "object" ? e.constructor.name : typeof e));
    }
    if (this instanceof $t) {
      if (J = this, this.structures)
        return G = this.structures, Vt(t);
      (!G || G.length > 0) && (G = []);
    } else
      J = br, (!G || G.length > 0) && (G = []);
    return Vt(t);
  }
  unpackMultiple(e, t) {
    let r, n = 0;
    try {
      Ue = !0;
      let i = e.length, o = this ? this.unpack(e, i) : us.unpack(e, i);
      if (t) {
        if (t(o, n, u) === !1)
          return;
        for (; u < i; )
          if (n = u, t(Vt(), n, u) === !1)
            return;
      } else {
        for (r = [o]; u < i; )
          n = u, r.push(Vt());
        return r;
      }
    } catch (i) {
      throw i.lastPosition = n, i.values = r, i;
    } finally {
      Ue = !1, zs();
    }
  }
  _mergeStructures(e, t) {
    Hs && (e = Hs.call(this, e)), e = e || [], Object.isFrozen(e) && (e = e.map((r) => r.slice(0)));
    for (let r = 0, n = e.length; r < n; r++) {
      let i = e[r];
      i && (i.isShared = !0, r >= 32 && (i.highByte = r - 32 >> 5));
    }
    e.sharedLength = e.length;
    for (let r in t || [])
      if (r >= 0) {
        let n = e[r], i = t[r];
        i && (n && ((e.restoreStructures || (e.restoreStructures = []))[r] = n), e[r] = i);
      }
    return this.structures = e;
  }
  decode(e, t) {
    return this.unpack(e, t);
  }
}
function Vt(s) {
  try {
    if (!J.trusted && !Ue) {
      let t = G.sharedLength || 0;
      t < G.length && (G.length = t);
    }
    let e;
    if (J.randomAccessStructure && C[u] < 64 && C[u] >= 32 && Ws ? (e = Ws(C, u, ye, J), C = null, !(s && s.lazy) && e && (e = e.toJSON()), u = ye) : e = Q(), ee && (u = ee.postBundlePosition, ee = null), Ue && (G.restoreStructures = null), u == ye)
      G && G.restoreStructures && Or(), G = null, C = null, Re && (Re = null);
    else {
      if (u > ye)
        throw new Error("Unexpected end of MessagePack data");
      if (!Ue) {
        let t;
        try {
          t = JSON.stringify(e, (r, n) => typeof n == "bigint" ? `${n}n` : n).slice(0, 100);
        } catch (r) {
          t = "(JSON view not available " + r + ")";
        }
        throw new Error("Data read, but end of buffer not reached " + t);
      }
    }
    return e;
  } catch (e) {
    throw G && G.restoreStructures && Or(), zs(), (e instanceof RangeError || e.message.startsWith("Unexpected end of buffer") || u > ye) && (e.incomplete = !0), e;
  }
}
function Or() {
  for (let s in G.restoreStructures)
    G[s] = G.restoreStructures[s];
  G.restoreStructures = null;
}
function Q() {
  let s = C[u++];
  if (s < 160)
    if (s < 128) {
      if (s < 64)
        return s;
      {
        let e = G[s & 63] || J.getStructures && wn()[s & 63];
        return e ? (e.read || (e.read = ar(e, s & 63)), e.read()) : s;
      }
    } else if (s < 144)
      if (s -= 128, J.mapsAsObjects) {
        let e = {};
        for (let t = 0; t < s; t++) {
          let r = vn();
          r === "__proto__" && (r = "__proto_"), e[r] = Q();
        }
        return e;
      } else {
        let e = /* @__PURE__ */ new Map();
        for (let t = 0; t < s; t++)
          e.set(Q(), Q());
        return e;
      }
    else {
      s -= 144;
      let e = new Array(s);
      for (let t = 0; t < s; t++)
        e[t] = Q();
      return J.freezeData ? Object.freeze(e) : e;
    }
  else if (s < 192) {
    let e = s - 160;
    if (Ce >= u)
      return Ie.slice(u - xe, (u += e) - xe);
    if (Ce == 0 && ye < 140) {
      let t = e < 16 ? cr(e) : Tn(e);
      if (t != null)
        return t;
    }
    return rs(e);
  } else {
    let e;
    switch (s) {
      case 192:
        return null;
      case 193:
        return ee ? (e = Q(), e > 0 ? ee[1].slice(ee.position1, ee.position1 += e) : ee[0].slice(ee.position0, ee.position0 -= e)) : En;
      case 194:
        return !1;
      case 195:
        return !0;
      case 196:
        if (e = C[u++], e === void 0)
          throw new Error("Unexpected end of buffer");
        return Rs(e);
      case 197:
        return e = V.getUint16(u), u += 2, Rs(e);
      case 198:
        return e = V.getUint32(u), u += 4, Rs(e);
      case 199:
        return Ge(C[u++]);
      case 200:
        return e = V.getUint16(u), u += 2, Ge(e);
      case 201:
        return e = V.getUint32(u), u += 4, Ge(e);
      case 202:
        if (e = V.getFloat32(u), J.useFloat32 > 2) {
          let t = Pt[(C[u] & 127) << 1 | C[u + 1] >> 7];
          return u += 4, (t * e + (e > 0 ? 0.5 : -0.5) >> 0) / t;
        }
        return u += 4, e;
      case 203:
        return e = V.getFloat64(u), u += 8, e;
      case 204:
        return C[u++];
      case 205:
        return e = V.getUint16(u), u += 2, e;
      case 206:
        return e = V.getUint32(u), u += 4, e;
      case 207:
        return J.int64AsType === "number" ? (e = V.getUint32(u) * 4294967296, e += V.getUint32(u + 4)) : J.int64AsType === "string" ? e = V.getBigUint64(u).toString() : J.int64AsType === "auto" ? (e = V.getBigUint64(u), e <= BigInt(2) << BigInt(52) && (e = Number(e))) : e = V.getBigUint64(u), u += 8, e;
      case 208:
        return V.getInt8(u++);
      case 209:
        return e = V.getInt16(u), u += 2, e;
      case 210:
        return e = V.getInt32(u), u += 4, e;
      case 211:
        return J.int64AsType === "number" ? (e = V.getInt32(u) * 4294967296, e += V.getUint32(u + 4)) : J.int64AsType === "string" ? e = V.getBigInt64(u).toString() : J.int64AsType === "auto" ? (e = V.getBigInt64(u), e >= BigInt(-2) << BigInt(52) && e <= BigInt(2) << BigInt(52) && (e = Number(e))) : e = V.getBigInt64(u), u += 8, e;
      case 212:
        if (e = C[u++], e == 114)
          return Rr(C[u++] & 63);
        {
          let t = ae[e];
          if (t)
            return t.read ? (u++, t.read(Q())) : t.noBuffer ? (u++, t()) : t(C.subarray(u, ++u));
          throw new Error("Unknown extension " + e);
        }
      case 213:
        return e = C[u], e == 114 ? (u++, Rr(C[u++] & 63, C[u++])) : Ge(2);
      case 214:
        return Ge(4);
      case 215:
        return Ge(8);
      case 216:
        return Ge(16);
      case 217:
        return e = C[u++], Ce >= u ? Ie.slice(u - xe, (u += e) - xe) : Cn(e);
      case 218:
        return e = V.getUint16(u), u += 2, Ce >= u ? Ie.slice(u - xe, (u += e) - xe) : bn(e);
      case 219:
        return e = V.getUint32(u), u += 4, Ce >= u ? Ie.slice(u - xe, (u += e) - xe) : On(e);
      case 220:
        return e = V.getUint16(u), u += 2, vr(e);
      case 221:
        return e = V.getUint32(u), u += 4, vr(e);
      case 222:
        return e = V.getUint16(u), u += 2, Ar(e);
      case 223:
        return e = V.getUint32(u), u += 4, Ar(e);
      default:
        if (s >= 224)
          return s - 256;
        if (s === void 0) {
          let t = new Error("Unexpected end of MessagePack data");
          throw t.incomplete = !0, t;
        }
        throw new Error("Unknown MessagePack token " + s);
    }
  }
}
const eo = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
function ar(s, e) {
  function t() {
    if (t.count++ > Sn) {
      let n = s.read = new Function("r", "return function(){return " + (J.freezeData ? "Object.freeze" : "") + "({" + s.map((i) => i === "__proto__" ? "__proto_:r()" : eo.test(i) ? i + ":r()" : "[" + JSON.stringify(i) + "]:r()").join(",") + "})}")(Q);
      return s.highByte === 0 && (s.read = Tr(e, s.read)), n();
    }
    let r = {};
    for (let n = 0, i = s.length; n < i; n++) {
      let o = s[n];
      o === "__proto__" && (o = "__proto_"), r[o] = Q();
    }
    return J.freezeData ? Object.freeze(r) : r;
  }
  return t.count = 0, s.highByte === 0 ? Tr(e, t) : t;
}
const Tr = (s, e) => function() {
  let t = C[u++];
  if (t === 0)
    return e();
  let r = s < 32 ? -(s + (t << 5)) : s + (t << 5), n = G[r] || wn()[r];
  if (!n)
    throw new Error("Record id is not defined for " + r);
  return n.read || (n.read = ar(n, s)), n.read();
};
function wn() {
  let s = In(() => (C = null, J.getStructures()));
  return G = J._mergeStructures(s, G);
}
var rs = tt, Cn = tt, bn = tt, On = tt;
function to(s) {
  rs = e(1), Cn = e(2), bn = e(3), On = e(5);
  function e(t) {
    return function(n) {
      let i = Xe[At++];
      if (i == null) {
        if (ee)
          return tt(n);
        let l = C.byteOffset, a = s(u - t + l, ye + l, C.buffer);
        if (typeof a == "string")
          i = a, Xe = or;
        else if (Xe = a, At = 1, Ce = 1, i = Xe[0], i === void 0)
          throw new Error("Unexpected end of buffer");
      }
      let o = i.length;
      return o <= n ? (u += n, i) : (Ie = i, xe = u, Ce = u + o, u += n, i.slice(0, n));
    };
  }
}
function tt(s) {
  let e;
  if (s < 16 && (e = cr(s)))
    return e;
  if (s > 64 && Gs)
    return Gs.decode(C.subarray(u, u += s));
  const t = u + s, r = [];
  for (e = ""; u < t; ) {
    const n = C[u++];
    if (!(n & 128))
      r.push(n);
    else if ((n & 224) === 192) {
      const i = C[u++] & 63;
      r.push((n & 31) << 6 | i);
    } else if ((n & 240) === 224) {
      const i = C[u++] & 63, o = C[u++] & 63;
      r.push((n & 31) << 12 | i << 6 | o);
    } else if ((n & 248) === 240) {
      const i = C[u++] & 63, o = C[u++] & 63, l = C[u++] & 63;
      let a = (n & 7) << 18 | i << 12 | o << 6 | l;
      a > 65535 && (a -= 65536, r.push(a >>> 10 & 1023 | 55296), a = 56320 | a & 1023), r.push(a);
    } else
      r.push(n);
    r.length >= 4096 && (e += ne.apply(String, r), r.length = 0);
  }
  return r.length > 0 && (e += ne.apply(String, r)), e;
}
function so(s, e, t) {
  let r = C;
  C = s, u = e;
  try {
    return tt(t);
  } finally {
    C = r;
  }
}
function vr(s) {
  let e = new Array(s);
  for (let t = 0; t < s; t++)
    e[t] = Q();
  return J.freezeData ? Object.freeze(e) : e;
}
function Ar(s) {
  if (J.mapsAsObjects) {
    let e = {};
    for (let t = 0; t < s; t++) {
      let r = vn();
      r === "__proto__" && (r = "__proto_"), e[r] = Q();
    }
    return e;
  } else {
    let e = /* @__PURE__ */ new Map();
    for (let t = 0; t < s; t++)
      e.set(Q(), Q());
    return e;
  }
}
var ne = String.fromCharCode;
function Tn(s) {
  let e = u, t = new Array(s);
  for (let r = 0; r < s; r++) {
    const n = C[u++];
    if ((n & 128) > 0) {
      u = e;
      return;
    }
    t[r] = n;
  }
  return ne.apply(String, t);
}
function cr(s) {
  if (s < 4)
    if (s < 2) {
      if (s === 0)
        return "";
      {
        let e = C[u++];
        if ((e & 128) > 1) {
          u -= 1;
          return;
        }
        return ne(e);
      }
    } else {
      let e = C[u++], t = C[u++];
      if ((e & 128) > 0 || (t & 128) > 0) {
        u -= 2;
        return;
      }
      if (s < 3)
        return ne(e, t);
      let r = C[u++];
      if ((r & 128) > 0) {
        u -= 3;
        return;
      }
      return ne(e, t, r);
    }
  else {
    let e = C[u++], t = C[u++], r = C[u++], n = C[u++];
    if ((e & 128) > 0 || (t & 128) > 0 || (r & 128) > 0 || (n & 128) > 0) {
      u -= 4;
      return;
    }
    if (s < 6) {
      if (s === 4)
        return ne(e, t, r, n);
      {
        let i = C[u++];
        if ((i & 128) > 0) {
          u -= 5;
          return;
        }
        return ne(e, t, r, n, i);
      }
    } else if (s < 8) {
      let i = C[u++], o = C[u++];
      if ((i & 128) > 0 || (o & 128) > 0) {
        u -= 6;
        return;
      }
      if (s < 7)
        return ne(e, t, r, n, i, o);
      let l = C[u++];
      if ((l & 128) > 0) {
        u -= 7;
        return;
      }
      return ne(e, t, r, n, i, o, l);
    } else {
      let i = C[u++], o = C[u++], l = C[u++], a = C[u++];
      if ((i & 128) > 0 || (o & 128) > 0 || (l & 128) > 0 || (a & 128) > 0) {
        u -= 8;
        return;
      }
      if (s < 10) {
        if (s === 8)
          return ne(e, t, r, n, i, o, l, a);
        {
          let f = C[u++];
          if ((f & 128) > 0) {
            u -= 9;
            return;
          }
          return ne(e, t, r, n, i, o, l, a, f);
        }
      } else if (s < 12) {
        let f = C[u++], c = C[u++];
        if ((f & 128) > 0 || (c & 128) > 0) {
          u -= 10;
          return;
        }
        if (s < 11)
          return ne(e, t, r, n, i, o, l, a, f, c);
        let d = C[u++];
        if ((d & 128) > 0) {
          u -= 11;
          return;
        }
        return ne(e, t, r, n, i, o, l, a, f, c, d);
      } else {
        let f = C[u++], c = C[u++], d = C[u++], h = C[u++];
        if ((f & 128) > 0 || (c & 128) > 0 || (d & 128) > 0 || (h & 128) > 0) {
          u -= 12;
          return;
        }
        if (s < 14) {
          if (s === 12)
            return ne(e, t, r, n, i, o, l, a, f, c, d, h);
          {
            let x = C[u++];
            if ((x & 128) > 0) {
              u -= 13;
              return;
            }
            return ne(e, t, r, n, i, o, l, a, f, c, d, h, x);
          }
        } else {
          let x = C[u++], S = C[u++];
          if ((x & 128) > 0 || (S & 128) > 0) {
            u -= 14;
            return;
          }
          if (s < 15)
            return ne(e, t, r, n, i, o, l, a, f, c, d, h, x, S);
          let m = C[u++];
          if ((m & 128) > 0) {
            u -= 15;
            return;
          }
          return ne(e, t, r, n, i, o, l, a, f, c, d, h, x, S, m);
        }
      }
    }
  }
}
function $r() {
  let s = C[u++], e;
  if (s < 192)
    e = s - 160;
  else
    switch (s) {
      case 217:
        e = C[u++];
        break;
      case 218:
        e = V.getUint16(u), u += 2;
        break;
      case 219:
        e = V.getUint32(u), u += 4;
        break;
      default:
        throw new Error("Expected string");
    }
  return tt(e);
}
function Rs(s) {
  return J.copyBuffers ? (
    // specifically use the copying slice (not the node one)
    Uint8Array.prototype.slice.call(C, u, u += s)
  ) : C.subarray(u, u += s);
}
function Ge(s) {
  let e = C[u++];
  if (ae[e]) {
    let t;
    return ae[e](C.subarray(u, t = u += s), (r) => {
      u = r;
      try {
        return Q();
      } finally {
        u = t;
      }
    });
  } else
    throw new Error("Unknown extension type " + e);
}
var Ir = new Array(4096);
function vn() {
  let s = C[u++];
  if (s >= 160 && s < 192) {
    if (s = s - 160, Ce >= u)
      return Ie.slice(u - xe, (u += s) - xe);
    if (!(Ce == 0 && ye < 180))
      return rs(s);
  } else
    return u--, An(Q());
  let e = (s << 5 ^ (s > 1 ? V.getUint16(u) : s > 0 ? C[u] : 0)) & 4095, t = Ir[e], r = u, n = u + s - 3, i, o = 0;
  if (t && t.bytes == s) {
    for (; r < n; ) {
      if (i = V.getUint32(r), i != t[o++]) {
        r = 1879048192;
        break;
      }
      r += 4;
    }
    for (n += 3; r < n; )
      if (i = C[r++], i != t[o++]) {
        r = 1879048192;
        break;
      }
    if (r === n)
      return u = r, t.string;
    n -= 3, r = u;
  }
  for (t = [], Ir[e] = t, t.bytes = s; r < n; )
    i = V.getUint32(r), t.push(i), r += 4;
  for (n += 3; r < n; )
    i = C[r++], t.push(i);
  let l = s < 16 ? cr(s) : Tn(s);
  return l != null ? t.string = l : t.string = rs(s);
}
function An(s) {
  if (typeof s == "string")
    return s;
  if (typeof s == "number")
    return s.toString();
  throw new Error("Invalid property type for record", typeof s);
}
const Rr = (s, e) => {
  let t = Q().map(An), r = s;
  e !== void 0 && (s = s < 32 ? -((e << 5) + s) : (e << 5) + s, t.highByte = e);
  let n = G[s];
  return n && (n.isShared || Ue) && ((G.restoreStructures || (G.restoreStructures = []))[s] = n), G[s] = t, t.read = ar(t, r), t.read();
};
ae[0] = () => {
};
ae[0].noBuffer = !0;
ae[66] = (s) => {
  let e = s.length, t = BigInt(s[0] & 128 ? s[0] - 256 : s[0]);
  for (let r = 1; r < e; r++)
    t <<= 8n, t += BigInt(s[r]);
  return t;
};
let ro = { Error, TypeError, ReferenceError };
ae[101] = () => {
  let s = Q();
  return (ro[s[0]] || Error)(s[1]);
};
ae[105] = (s) => {
  if (J.structuredClone === !1)
    throw new Error("Structured clone extension is disabled");
  let e = V.getUint32(u - 4);
  Re || (Re = /* @__PURE__ */ new Map());
  let t = C[u], r;
  t >= 144 && t < 160 || t == 220 || t == 221 ? r = [] : r = {};
  let n = { target: r };
  Re.set(e, n);
  let i = Q();
  return n.used ? Object.assign(r, i) : (n.target = i, i);
};
ae[112] = (s) => {
  if (J.structuredClone === !1)
    throw new Error("Structured clone extension is disabled");
  let e = V.getUint32(u - 4), t = Re.get(e);
  return t.used = !0, t.target;
};
ae[115] = () => new Set(Q());
const $n = ["Int8", "Uint8", "Uint8Clamped", "Int16", "Uint16", "Int32", "Uint32", "Float32", "Float64", "BigInt64", "BigUint64"].map((s) => s + "Array");
let no = typeof globalThis == "object" ? globalThis : window;
ae[116] = (s) => {
  let e = s[0], t = $n[e];
  if (!t)
    throw new Error("Could not find typed array for code " + e);
  return new no[t](Uint8Array.prototype.slice.call(s, 1).buffer);
};
ae[120] = () => {
  let s = Q();
  return new RegExp(s[0], s[1]);
};
const io = [];
ae[98] = (s) => {
  let e = (s[0] << 24) + (s[1] << 16) + (s[2] << 8) + s[3], t = u;
  return u += e - s.length, ee = io, ee = [$r(), $r()], ee.position0 = 0, ee.position1 = 0, ee.postBundlePosition = u, u = t, Q();
};
ae[255] = (s) => s.length == 4 ? new Date((s[0] * 16777216 + (s[1] << 16) + (s[2] << 8) + s[3]) * 1e3) : s.length == 8 ? new Date(
  ((s[0] << 22) + (s[1] << 14) + (s[2] << 6) + (s[3] >> 2)) / 1e6 + ((s[3] & 3) * 4294967296 + s[4] * 16777216 + (s[5] << 16) + (s[6] << 8) + s[7]) * 1e3
) : s.length == 12 ? new Date(
  ((s[0] << 24) + (s[1] << 16) + (s[2] << 8) + s[3]) / 1e6 + ((s[4] & 128 ? -281474976710656 : 0) + s[6] * 1099511627776 + s[7] * 4294967296 + s[8] * 16777216 + (s[9] << 16) + (s[10] << 8) + s[11]) * 1e3
) : /* @__PURE__ */ new Date("invalid");
function In(s) {
  Ys && Ys();
  let e = ye, t = u, r = At, n = xe, i = Ce, o = Ie, l = Xe, a = Re, f = ee, c = new Uint8Array(C.slice(0, ye)), d = G, h = G.slice(0, G.length), x = J, S = Ue, m = s();
  return ye = e, u = t, At = r, xe = n, Ce = i, Ie = o, Xe = l, Re = a, ee = f, C = c, Ue = S, G = d, G.splice(0, G.length, ...h), J = x, V = new DataView(C.buffer, C.byteOffset, C.byteLength), m;
}
function zs() {
  C = null, Re = null, G = null;
}
function oo(s) {
  s.unpack ? ae[s.type] = s.unpack : ae[s.type] = s;
}
const Pt = new Array(147);
for (let s = 0; s < 256; s++)
  Pt[s] = +("1e" + Math.floor(45.15 - s * 0.30103));
var us = new $t({ useRecords: !1 });
const ao = us.unpack;
us.unpackMultiple;
us.unpack;
let co = new Float32Array(1);
new Uint8Array(co.buffer, 0, 4);
function lo(s, e, t) {
  Ws = s, Hs = e, Ys = t;
}
let Jt;
try {
  Jt = new TextEncoder();
} catch {
}
let ns, lr;
const ds = typeof Buffer < "u", Gt = ds ? function(s) {
  return Buffer.allocUnsafeSlow(s);
} : Uint8Array, Rn = ds ? Buffer : Uint8Array, kr = ds ? 4294967296 : 2144337920;
let _, _t, z, g = 0, fe, X = null, kn;
const fo = 21760, ho = /[\u0080-\uFFFF]/, Ae = Symbol("record-id");
class uo extends $t {
  constructor(e) {
    super(e), this.offset = 0;
    let t, r, n, i, o = Rn.prototype.utf8Write ? function(p, O) {
      return _.utf8Write(p, O, 4294967295);
    } : Jt && Jt.encodeInto ? function(p, O) {
      return Jt.encodeInto(p, _.subarray(O)).written;
    } : !1, l = this;
    e || (e = {});
    let a = e && e.sequential, f = e.structures || e.saveStructures, c = e.maxSharedStructures;
    if (c == null && (c = f ? 32 : 0), c > 8160)
      throw new Error("Maximum maxSharedStructure is 8160");
    e.structuredClone && e.moreTypes == null && (this.moreTypes = !0);
    let d = e.maxOwnStructures;
    d == null && (d = f ? 32 : 64), !this.structures && e.useRecords != !1 && (this.structures = []);
    let h = c > 32 || d + c > 64, x = c + 64, S = c + d + 64;
    if (S > 8256)
      throw new Error("Maximum maxSharedStructure + maxOwnStructure is 8192");
    let m = [], b = 0, R = 0;
    this.pack = this.encode = function(p, O) {
      if (_ || (_ = new Gt(8192), z = _.dataView || (_.dataView = new DataView(_.buffer, 0, 8192)), g = 0), fe = _.length - 10, fe - g < 2048 ? (_ = new Gt(_.length), z = _.dataView || (_.dataView = new DataView(_.buffer, 0, _.length)), fe = _.length - 10, g = 0) : g = g + 7 & 2147483640, t = g, O & So && (g += O & 255), i = l.structuredClone ? /* @__PURE__ */ new Map() : null, l.bundleStrings && typeof p != "string" ? (X = [], X.size = 1 / 0) : X = null, n = l.structures, n) {
        n.uninitialized && (n = l._mergeStructures(l.getStructures()));
        let y = n.sharedLength || 0;
        if (y > c)
          throw new Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to " + n.sharedLength);
        if (!n.transitions) {
          n.transitions = /* @__PURE__ */ Object.create(null);
          for (let v = 0; v < y; v++) {
            let U = n[v];
            if (!U)
              continue;
            let M, F = n.transitions;
            for (let q = 0, Y = U.length; q < Y; q++) {
              let Ee = U[q];
              M = F[Ee], M || (M = F[Ee] = /* @__PURE__ */ Object.create(null)), F = M;
            }
            F[Ae] = v + 64;
          }
          this.lastNamedStructuresLength = y;
        }
        a || (n.nextId = y + 64);
      }
      r && (r = !1);
      let T;
      try {
        l.randomAccessStructure && p && p.constructor && p.constructor === Object ? K(p) : A(p);
        let y = X;
        if (X && Nr(t, A, 0), i && i.idsToInsert) {
          let v = i.idsToInsert.sort((q, Y) => q.offset > Y.offset ? 1 : -1), U = v.length, M = -1;
          for (; y && U > 0; ) {
            let q = v[--U].offset + t;
            q < y.stringsPosition + t && M === -1 && (M = 0), q > y.position + t ? M >= 0 && (M += 6) : (M >= 0 && (z.setUint32(
              y.position + t,
              z.getUint32(y.position + t) + M
            ), M = -1), y = y.previous, U++);
          }
          M >= 0 && y && z.setUint32(
            y.position + t,
            z.getUint32(y.position + t) + M
          ), g += v.length * 6, g > fe && N(g), l.offset = g;
          let F = po(_.subarray(t, g), v);
          return i = null, F;
        }
        return l.offset = g, O & yo ? (_.start = t, _.end = g, _) : _.subarray(t, g);
      } catch (y) {
        throw T = y, y;
      } finally {
        if (n && (L(), r && l.saveStructures)) {
          let y = n.sharedLength || 0, v = _.subarray(t, g), U = Ln(n, l);
          if (!T)
            return l.saveStructures(U, U.isCompatible) === !1 ? l.pack(p, O) : (l.lastNamedStructuresLength = y, v);
        }
        O & Eo && (g = t);
      }
    };
    const L = () => {
      R < 10 && R++;
      let p = n.sharedLength || 0;
      if (n.length > p && !a && (n.length = p), b > 1e4)
        n.transitions = null, R = 0, b = 0, m.length > 0 && (m = []);
      else if (m.length > 0 && !a) {
        for (let O = 0, T = m.length; O < T; O++)
          m[O][Ae] = 0;
        m = [];
      }
    }, k = (p) => {
      var O = p.length;
      O < 16 ? _[g++] = 144 | O : O < 65536 ? (_[g++] = 220, _[g++] = O >> 8, _[g++] = O & 255) : (_[g++] = 221, z.setUint32(g, O), g += 4);
      for (let T = 0; T < O; T++)
        A(p[T]);
    }, A = (p) => {
      g > fe && (_ = N(g));
      var O = typeof p, T;
      if (O === "string") {
        let y = p.length;
        if (X && y >= 4 && y < 4096) {
          if ((X.size += y) > fo) {
            let F, q = (X[0] ? X[0].length * 3 + X[1].length : 0) + 10;
            g + q > fe && (_ = N(g + q));
            let Y;
            X.position ? (Y = X, _[g] = 200, g += 3, _[g++] = 98, F = g - t, g += 4, Nr(t, A, 0), z.setUint16(F + t - 3, g - t - F)) : (_[g++] = 214, _[g++] = 98, F = g - t, g += 4), X = ["", ""], X.previous = Y, X.size = 0, X.position = F;
          }
          let M = ho.test(p);
          X[M ? 0 : 1] += p, _[g++] = 193, A(M ? -y : y);
          return;
        }
        let v;
        y < 32 ? v = 1 : y < 256 ? v = 2 : y < 65536 ? v = 3 : v = 5;
        let U = y * 3;
        if (g + U > fe && (_ = N(g + U)), y < 64 || !o) {
          let M, F, q, Y = g + v;
          for (M = 0; M < y; M++)
            F = p.charCodeAt(M), F < 128 ? _[Y++] = F : F < 2048 ? (_[Y++] = F >> 6 | 192, _[Y++] = F & 63 | 128) : (F & 64512) === 55296 && ((q = p.charCodeAt(M + 1)) & 64512) === 56320 ? (F = 65536 + ((F & 1023) << 10) + (q & 1023), M++, _[Y++] = F >> 18 | 240, _[Y++] = F >> 12 & 63 | 128, _[Y++] = F >> 6 & 63 | 128, _[Y++] = F & 63 | 128) : (_[Y++] = F >> 12 | 224, _[Y++] = F >> 6 & 63 | 128, _[Y++] = F & 63 | 128);
          T = Y - g - v;
        } else
          T = o(p, g + v);
        T < 32 ? _[g++] = 160 | T : T < 256 ? (v < 2 && _.copyWithin(g + 2, g + 1, g + 1 + T), _[g++] = 217, _[g++] = T) : T < 65536 ? (v < 3 && _.copyWithin(g + 3, g + 2, g + 2 + T), _[g++] = 218, _[g++] = T >> 8, _[g++] = T & 255) : (v < 5 && _.copyWithin(g + 5, g + 3, g + 3 + T), _[g++] = 219, z.setUint32(g, T), g += 4), g += T;
      } else if (O === "number")
        if (p >>> 0 === p)
          p < 32 || p < 128 && this.useRecords === !1 || p < 64 && !this.randomAccessStructure ? _[g++] = p : p < 256 ? (_[g++] = 204, _[g++] = p) : p < 65536 ? (_[g++] = 205, _[g++] = p >> 8, _[g++] = p & 255) : (_[g++] = 206, z.setUint32(g, p), g += 4);
        else if (p >> 0 === p)
          p >= -32 ? _[g++] = 256 + p : p >= -128 ? (_[g++] = 208, _[g++] = p + 256) : p >= -32768 ? (_[g++] = 209, z.setInt16(g, p), g += 2) : (_[g++] = 210, z.setInt32(g, p), g += 4);
        else {
          let y;
          if ((y = this.useFloat32) > 0 && p < 4294967296 && p >= -2147483648) {
            _[g++] = 202, z.setFloat32(g, p);
            let v;
            if (y < 4 || // this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
            (v = p * Pt[(_[g] & 127) << 1 | _[g + 1] >> 7]) >> 0 === v) {
              g += 4;
              return;
            } else
              g--;
          }
          _[g++] = 203, z.setFloat64(g, p), g += 8;
        }
      else if (O === "object" || O === "function")
        if (!p)
          _[g++] = 192;
        else {
          if (i) {
            let v = i.get(p);
            if (v) {
              if (!v.id) {
                let U = i.idsToInsert || (i.idsToInsert = []);
                v.id = U.push(v);
              }
              _[g++] = 214, _[g++] = 112, z.setUint32(g, v.id), g += 4;
              return;
            } else
              i.set(p, { offset: g - t });
          }
          let y = p.constructor;
          if (y === Object)
            E(p, !0);
          else if (y === Array)
            k(p);
          else if (y === Map)
            if (this.mapAsEmptyObject)
              _[g++] = 128;
            else {
              T = p.size, T < 16 ? _[g++] = 128 | T : T < 65536 ? (_[g++] = 222, _[g++] = T >> 8, _[g++] = T & 255) : (_[g++] = 223, z.setUint32(g, T), g += 4);
              for (let [v, U] of p)
                A(v), A(U);
            }
          else {
            for (let v = 0, U = ns.length; v < U; v++) {
              let M = lr[v];
              if (p instanceof M) {
                let F = ns[v];
                if (F.write) {
                  F.type && (_[g++] = 212, _[g++] = F.type, _[g++] = 0);
                  let De = F.write.call(this, p);
                  De === p ? Array.isArray(p) ? k(p) : E(p) : A(De);
                  return;
                }
                let q = _, Y = z, Ee = g;
                _ = null;
                let Ve;
                try {
                  Ve = F.pack.call(this, p, (De) => (_ = q, q = null, g += De, g > fe && N(g), {
                    target: _,
                    targetView: z,
                    position: g - De
                  }), A);
                } finally {
                  q && (_ = q, z = Y, g = Ee, fe = _.length - 10);
                }
                Ve && (Ve.length + g > fe && N(Ve.length + g), g = go(Ve, _, g, F.type));
                return;
              }
            }
            if (Array.isArray(p))
              k(p);
            else {
              if (p.toJSON) {
                const v = p.toJSON();
                if (v !== p)
                  return A(v);
              }
              if (O === "function")
                return A(this.writeFunction && this.writeFunction(p));
              E(p, !p.hasOwnProperty);
            }
          }
        }
      else if (O === "boolean")
        _[g++] = p ? 195 : 194;
      else if (O === "bigint") {
        if (p < BigInt(1) << BigInt(63) && p >= -(BigInt(1) << BigInt(63)))
          _[g++] = 211, z.setBigInt64(g, p);
        else if (p < BigInt(1) << BigInt(64) && p > 0)
          _[g++] = 207, z.setBigUint64(g, p);
        else if (this.largeBigIntToFloat)
          _[g++] = 203, z.setFloat64(g, Number(p));
        else if (this.useBigIntExtension && p < 2n ** 1023n && p > -(2n ** 1023n)) {
          _[g++] = 199, g++, _[g++] = 66;
          let y = [], v;
          do {
            let U = p & 0xffn;
            v = (U & 0x80n) === (p < 0n ? 0x80n : 0n), y.push(U), p >>= 8n;
          } while (!((p === 0n || p === -1n) && v));
          _[g - 2] = y.length;
          for (let U = y.length; U > 0; )
            _[g++] = Number(y[--U]);
          return;
        } else
          throw new RangeError(p + " was too large to fit in MessagePack 64-bit integer format, use useBigIntExtension or set largeBigIntToFloat to convert to float-64");
        g += 8;
      } else if (O === "undefined")
        this.encodeUndefinedAsNil ? _[g++] = 192 : (_[g++] = 212, _[g++] = 0, _[g++] = 0);
      else
        throw new Error("Unknown type: " + O);
    }, D = this.variableMapSize || this.coercibleKeyAsNumber ? (p) => {
      let O = Object.keys(p), T = O.length;
      T < 16 ? _[g++] = 128 | T : T < 65536 ? (_[g++] = 222, _[g++] = T >> 8, _[g++] = T & 255) : (_[g++] = 223, z.setUint32(g, T), g += 4);
      let y;
      if (this.coercibleKeyAsNumber)
        for (let v = 0; v < T; v++) {
          y = O[v];
          let U = Number(y);
          A(isNaN(U) ? y : U), A(p[y]);
        }
      else
        for (let v = 0; v < T; v++)
          A(y = O[v]), A(p[y]);
    } : (p, O) => {
      _[g++] = 222;
      let T = g - t;
      g += 2;
      let y = 0;
      for (let v in p)
        (O || p.hasOwnProperty(v)) && (A(v), A(p[v]), y++);
      _[T++ + t] = y >> 8, _[T + t] = y & 255;
    }, I = this.useRecords === !1 ? D : e.progressiveRecords && !h ? (
      // this is about 2% faster for highly stable structures, since it only requires one for-in loop (but much more expensive when new structure needs to be written)
      (p, O) => {
        let T, y = n.transitions || (n.transitions = /* @__PURE__ */ Object.create(null)), v = g++ - t, U;
        for (let M in p)
          if (O || p.hasOwnProperty(M)) {
            if (T = y[M], T)
              y = T;
            else {
              let F = Object.keys(p), q = y;
              y = n.transitions;
              let Y = 0;
              for (let Ee = 0, Ve = F.length; Ee < Ve; Ee++) {
                let De = F[Ee];
                T = y[De], T || (T = y[De] = /* @__PURE__ */ Object.create(null), Y++), y = T;
              }
              v + t + 1 == g ? (g--, B(y, F, Y)) : j(y, F, v, Y), U = !0, y = q[M];
            }
            A(p[M]);
          }
        if (!U) {
          let M = y[Ae];
          M ? _[v + t] = M : j(y, Object.keys(p), v, 0);
        }
      }
    ) : (p, O) => {
      let T, y = n.transitions || (n.transitions = /* @__PURE__ */ Object.create(null)), v = 0;
      for (let M in p)
        (O || p.hasOwnProperty(M)) && (T = y[M], T || (T = y[M] = /* @__PURE__ */ Object.create(null), v++), y = T);
      let U = y[Ae];
      U ? U >= 96 && h ? (_[g++] = ((U -= 96) & 31) + 96, _[g++] = U >> 5) : _[g++] = U : B(y, y.__keys__ || Object.keys(p), v);
      for (let M in p)
        (O || p.hasOwnProperty(M)) && A(p[M]);
    }, w = typeof this.useRecords == "function" && this.useRecords, E = w ? (p, O) => {
      w(p) ? I(p, O) : D(p, O);
    } : I, N = (p) => {
      let O;
      if (p > 16777216) {
        if (p - t > kr)
          throw new Error("Packed buffer would be larger than maximum buffer size");
        O = Math.min(
          kr,
          Math.round(Math.max((p - t) * (p > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096
        );
      } else
        O = (Math.max(p - t << 2, _.length - 1) >> 12) + 1 << 12;
      let T = new Gt(O);
      return z = T.dataView || (T.dataView = new DataView(T.buffer, 0, O)), p = Math.min(p, _.length), _.copy ? _.copy(T, 0, t, p) : T.set(_.slice(t, p)), g -= t, t = 0, fe = T.length - 10, _ = T;
    }, B = (p, O, T) => {
      let y = n.nextId;
      y || (y = 64), y < x && this.shouldShareStructure && !this.shouldShareStructure(O) ? (y = n.nextOwnId, y < S || (y = x), n.nextOwnId = y + 1) : (y >= S && (y = x), n.nextId = y + 1);
      let v = O.highByte = y >= 96 && h ? y - 96 >> 5 : -1;
      p[Ae] = y, p.__keys__ = O, n[y - 64] = O, y < x ? (O.isShared = !0, n.sharedLength = y - 63, r = !0, v >= 0 ? (_[g++] = (y & 31) + 96, _[g++] = v) : _[g++] = y) : (v >= 0 ? (_[g++] = 213, _[g++] = 114, _[g++] = (y & 31) + 96, _[g++] = v) : (_[g++] = 212, _[g++] = 114, _[g++] = y), T && (b += R * T), m.length >= d && (m.shift()[Ae] = 0), m.push(p), A(O));
    }, j = (p, O, T, y) => {
      let v = _, U = g, M = fe, F = t;
      _ = _t, g = 0, t = 0, _ || (_t = _ = new Gt(8192)), fe = _.length - 10, B(p, O, y), _t = _;
      let q = g;
      if (_ = v, g = U, fe = M, t = F, q > 1) {
        let Y = g + q - 1;
        Y > fe && N(Y);
        let Ee = T + t;
        _.copyWithin(Ee + q, Ee + 1, g), _.set(_t.slice(0, q), Ee), g = Y;
      } else
        _[T + t] = _t[0];
    }, K = (p, O) => {
      let T = kn(p, _, t, g, n, N, (y, v, U) => {
        if (U)
          return r = !0;
        g = v;
        let M = _;
        return A(y), L(), M !== _ ? { position: g, targetView: z, target: _ } : g;
      }, this);
      if (T === 0)
        return E(p, !0);
      g = T;
    };
  }
  useBuffer(e) {
    _ = e, z = new DataView(_.buffer, _.byteOffset, _.byteLength), g = 0;
  }
  clearSharedData() {
    this.structures && (this.structures = []), this.typedStructs && (this.typedStructs = []);
  }
}
lr = [Date, Set, Error, RegExp, ArrayBuffer, Object.getPrototypeOf(Uint8Array.prototype).constructor, yn];
ns = [{
  pack(s, e, t) {
    let r = s.getTime() / 1e3;
    if ((this.useTimestamp32 || s.getMilliseconds() === 0) && r >= 0 && r < 4294967296) {
      let { target: n, targetView: i, position: o } = e(6);
      n[o++] = 214, n[o++] = 255, i.setUint32(o, r);
    } else if (r > 0 && r < 4294967296) {
      let { target: n, targetView: i, position: o } = e(10);
      n[o++] = 215, n[o++] = 255, i.setUint32(o, s.getMilliseconds() * 4e6 + (r / 1e3 / 4294967296 >> 0)), i.setUint32(o + 4, r);
    } else if (isNaN(r)) {
      if (this.onInvalidDate)
        return e(0), t(this.onInvalidDate());
      let { target: n, targetView: i, position: o } = e(3);
      n[o++] = 212, n[o++] = 255, n[o++] = 255;
    } else {
      let { target: n, targetView: i, position: o } = e(15);
      n[o++] = 199, n[o++] = 12, n[o++] = 255, i.setUint32(o, s.getMilliseconds() * 1e6), i.setBigInt64(o + 4, BigInt(Math.floor(r)));
    }
  }
}, {
  pack(s, e, t) {
    if (this.setAsEmptyObject)
      return e(0), t({});
    let r = Array.from(s), { target: n, position: i } = e(this.moreTypes ? 3 : 0);
    this.moreTypes && (n[i++] = 212, n[i++] = 115, n[i++] = 0), t(r);
  }
}, {
  pack(s, e, t) {
    let { target: r, position: n } = e(this.moreTypes ? 3 : 0);
    this.moreTypes && (r[n++] = 212, r[n++] = 101, r[n++] = 0), t([s.name, s.message]);
  }
}, {
  pack(s, e, t) {
    let { target: r, position: n } = e(this.moreTypes ? 3 : 0);
    this.moreTypes && (r[n++] = 212, r[n++] = 120, r[n++] = 0), t([s.source, s.flags]);
  }
}, {
  pack(s, e) {
    this.moreTypes ? Lr(s, 16, e) : Dr(ds ? Buffer.from(s) : new Uint8Array(s), e);
  }
}, {
  pack(s, e) {
    let t = s.constructor;
    t !== Rn && this.moreTypes ? Lr(s, $n.indexOf(t.name), e) : Dr(s, e);
  }
}, {
  pack(s, e) {
    let { target: t, position: r } = e(1);
    t[r] = 193;
  }
}];
function Lr(s, e, t, r) {
  let n = s.byteLength;
  if (n + 1 < 256) {
    var { target: i, position: o } = t(4 + n);
    i[o++] = 199, i[o++] = n + 1;
  } else if (n + 1 < 65536) {
    var { target: i, position: o } = t(5 + n);
    i[o++] = 200, i[o++] = n + 1 >> 8, i[o++] = n + 1 & 255;
  } else {
    var { target: i, position: o, targetView: l } = t(7 + n);
    i[o++] = 201, l.setUint32(o, n + 1), o += 4;
  }
  i[o++] = 116, i[o++] = e, i.set(new Uint8Array(s.buffer, s.byteOffset, s.byteLength), o);
}
function Dr(s, e) {
  let t = s.byteLength;
  var r, n;
  if (t < 256) {
    var { target: r, position: n } = e(t + 2);
    r[n++] = 196, r[n++] = t;
  } else if (t < 65536) {
    var { target: r, position: n } = e(t + 3);
    r[n++] = 197, r[n++] = t >> 8, r[n++] = t & 255;
  } else {
    var { target: r, position: n, targetView: i } = e(t + 5);
    r[n++] = 198, i.setUint32(n, t), n += 4;
  }
  r.set(s, n);
}
function go(s, e, t, r) {
  let n = s.length;
  switch (n) {
    case 1:
      e[t++] = 212;
      break;
    case 2:
      e[t++] = 213;
      break;
    case 4:
      e[t++] = 214;
      break;
    case 8:
      e[t++] = 215;
      break;
    case 16:
      e[t++] = 216;
      break;
    default:
      n < 256 ? (e[t++] = 199, e[t++] = n) : n < 65536 ? (e[t++] = 200, e[t++] = n >> 8, e[t++] = n & 255) : (e[t++] = 201, e[t++] = n >> 24, e[t++] = n >> 16 & 255, e[t++] = n >> 8 & 255, e[t++] = n & 255);
  }
  return e[t++] = r, e.set(s, t), t += n, t;
}
function po(s, e) {
  let t, r = e.length * 6, n = s.length - r;
  for (; t = e.pop(); ) {
    let i = t.offset, o = t.id;
    s.copyWithin(i + r, i, n), r -= 6;
    let l = i + r;
    s[l++] = 214, s[l++] = 105, s[l++] = o >> 24, s[l++] = o >> 16 & 255, s[l++] = o >> 8 & 255, s[l++] = o & 255, n = i;
  }
  return s;
}
function Nr(s, e, t) {
  if (X.length > 0) {
    z.setUint32(X.position + s, g + t - X.position - s), X.stringsPosition = g - s;
    let r = X;
    X = null, e(r[0]), e(r[1]);
  }
}
function _o(s) {
  if (s.Class) {
    if (!s.pack && !s.write)
      throw new Error("Extension has no pack or write function");
    if (s.pack && !s.type)
      throw new Error("Extension has no type (numeric code to identify the extension)");
    lr.unshift(s.Class), ns.unshift(s);
  }
  oo(s);
}
function Ln(s, e) {
  return s.isCompatible = (t) => {
    let r = !t || (e.lastNamedStructuresLength || 0) === t.length;
    return r || e._mergeStructures(t), r;
  }, s;
}
function mo(s, e) {
  kn = s, Ln = e;
}
let Dn = new uo({ useRecords: !1 });
const xo = Dn.pack;
Dn.pack;
const yo = 512, Eo = 1024, So = 2048, qs = 3, ft = 0, Tt = 2, Kt = 1, fr = 16, Nn = ["num", "object", "string", "ascii"];
Nn[fr] = "date";
const wo = [!1, !0, !0, !1, !1, !0, !0, !1];
let Pn;
try {
  new Function(""), Pn = !0;
} catch {
}
let qe;
const Co = typeof Buffer < "u";
let Xt, Te;
try {
  Xt = new TextEncoder();
} catch {
}
const bo = Co ? function(s, e, t) {
  return s.utf8Write(e, t, 4294967295);
} : Xt && Xt.encodeInto ? function(s, e, t) {
  return Xt.encodeInto(e, s.subarray(t)).written;
} : !1;
mo(Mn, $o);
function Mn(s, e, t, r, n, i, o, l) {
  let a = l.typedStructs || (l.typedStructs = []), f = e.dataView, c = (a.lastStringStart || 100) + r, d = e.length - 10, h = r;
  r > d && (e = i(r), f = e.dataView, r -= t, h -= t, c -= t, t = 0, d = e.length - 10);
  let x, S = c, m = a.transitions || (a.transitions = /* @__PURE__ */ Object.create(null)), b = a.nextId || a.length, R = b < 15 ? 1 : b < 240 ? 2 : b < 61440 ? 3 : b < 15728640 ? 4 : 0;
  if (R === 0)
    return 0;
  r += R;
  let L = [], k, A = 0;
  for (let I in s) {
    let w = s[I], E = m[I];
    switch (E || (m[I] = E = {
      key: I,
      parent: m,
      enumerationOffset: 0,
      ascii0: null,
      ascii8: null,
      num8: null,
      string16: null,
      object16: null,
      num32: null,
      float64: null,
      date64: null
    }), r > d && (e = i(r), f = e.dataView, r -= t, h -= t, c -= t, S -= t, t = 0, d = e.length - 10), typeof w) {
      case "number":
        let N = w;
        if (b < 200 || !E.num64) {
          if (N >> 0 === N && N < 536870912 && N > -520093696) {
            N < 246 && N >= 0 && (E.num8 && !(b > 200 && E.num32) || N < 32 && !E.num32) ? (m = E.num8 || de(E, ft, 1), e[r++] = N) : (m = E.num32 || de(E, ft, 4), f.setUint32(r, N, !0), r += 4);
            break;
          } else if (N < 4294967296 && N >= -2147483648 && (f.setFloat32(r, N, !0), wo[e[r + 3] >>> 5])) {
            let p;
            if ((p = N * Pt[(e[r + 3] & 127) << 1 | e[r + 2] >> 7]) >> 0 === p) {
              m = E.num32 || de(E, ft, 4), r += 4;
              break;
            }
          }
        }
        m = E.num64 || de(E, ft, 8), f.setFloat64(r, N, !0), r += 8;
        break;
      case "string":
        let B = w.length;
        if (x = S - c, (B << 2) + S > d && (e = i((B << 2) + S), f = e.dataView, r -= t, h -= t, c -= t, S -= t, t = 0, d = e.length - 10), B > 65280 + x >> 2) {
          L.push(I, w, r - h);
          break;
        }
        let j, K = S;
        if (B < 64) {
          let p, O, T;
          for (p = 0; p < B; p++)
            O = w.charCodeAt(p), O < 128 ? e[S++] = O : O < 2048 ? (j = !0, e[S++] = O >> 6 | 192, e[S++] = O & 63 | 128) : (O & 64512) === 55296 && ((T = w.charCodeAt(p + 1)) & 64512) === 56320 ? (j = !0, O = 65536 + ((O & 1023) << 10) + (T & 1023), p++, e[S++] = O >> 18 | 240, e[S++] = O >> 12 & 63 | 128, e[S++] = O >> 6 & 63 | 128, e[S++] = O & 63 | 128) : (j = !0, e[S++] = O >> 12 | 224, e[S++] = O >> 6 & 63 | 128, e[S++] = O & 63 | 128);
        } else
          S += bo(e, w, S), j = S - K > B;
        if (x < 160 || x < 246 && (E.ascii8 || E.string8)) {
          if (j)
            (m = E.string8) || (a.length > 10 && (m = E.ascii8) ? (m.__type = Tt, E.ascii8 = null, E.string8 = m, o(null, 0, !0)) : m = de(E, Tt, 1));
          else if (x === 0 && !k) {
            k = !0, m = E.ascii0 || de(E, qs, 0);
            break;
          } else
            !(m = E.ascii8) && !(a.length > 10 && (m = E.string8)) && (m = de(E, qs, 1));
          e[r++] = x;
        } else
          m = E.string16 || de(E, Tt, 2), f.setUint16(r, x, !0), r += 2;
        break;
      case "object":
        if (w) {
          w.constructor === Date ? (m = E.date64 || de(E, fr, 8), f.setFloat64(r, w.getTime(), !0), r += 8) : L.push(I, w, A);
          break;
        } else
          E = Pr(E, r, f, -10), E ? (m = E, r = qe) : L.push(I, w, A);
        break;
      case "boolean":
        m = E.num8 || E.ascii8 || de(E, ft, 1), e[r++] = w ? 249 : 248;
        break;
      case "undefined":
        E = Pr(E, r, f, -9), E ? (m = E, r = qe) : L.push(I, w, A);
        break;
      default:
        L.push(I, w, A);
    }
    A++;
  }
  for (let I = 0, w = L.length; I < w; ) {
    let E = L[I++], N = L[I++], B = L[I++], j = m[E];
    j || (m[E] = j = {
      key: E,
      parent: m,
      enumerationOffset: B - A,
      ascii0: null,
      ascii8: null,
      num8: null,
      string16: null,
      object16: null,
      num32: null,
      float64: null
    });
    let K;
    if (N) {
      let p;
      x = S - c, x < 65280 ? (m = j.object16, m ? p = 2 : (m = j.object32) ? p = 4 : (m = de(j, Kt, 2), p = 2)) : (m = j.object32 || de(j, Kt, 4), p = 4), K = o(N, S), typeof K == "object" ? (S = K.position, f = K.targetView, e = K.target, c -= t, r -= t, h -= t, t = 0) : S = K, p === 2 ? (f.setUint16(r, x, !0), r += 2) : (f.setUint32(r, x, !0), r += 4);
    } else
      m = j.object16 || de(j, Kt, 2), f.setInt16(r, N === null ? -10 : -9, !0), r += 2;
    A++;
  }
  let D = m[Ae];
  if (D == null) {
    D = l.typedStructs.length;
    let I = [], w = m, E, N;
    for (; (N = w.__type) !== void 0; ) {
      let B = w.__size;
      w = w.__parent, E = w.key;
      let j = [N, B, E];
      w.enumerationOffset && j.push(w.enumerationOffset), I.push(j), w = w.parent;
    }
    I.reverse(), m[Ae] = D, l.typedStructs[D] = I, o(null, 0, !0);
  }
  switch (R) {
    case 1:
      if (D >= 16)
        return 0;
      e[h] = D + 32;
      break;
    case 2:
      if (D >= 256)
        return 0;
      e[h] = 56, e[h + 1] = D;
      break;
    case 3:
      if (D >= 65536)
        return 0;
      e[h] = 57, f.setUint16(h + 1, D, !0);
      break;
    case 4:
      if (D >= 16777216)
        return 0;
      f.setUint32(h, (D << 8) + 58, !0);
      break;
  }
  if (r < c) {
    if (c === S)
      return r;
    e.copyWithin(r, c, S), S += r - c, a.lastStringStart = r - h;
  } else if (r > c)
    return c === S ? r : (a.lastStringStart = r - h, Mn(s, e, t, h, n, i, o, l));
  return S;
}
function Pr(s, e, t, r) {
  let n;
  if (n = s.ascii8 || s.num8)
    return t.setInt8(e, r, !0), qe = e + 1, n;
  if (n = s.string16 || s.object16)
    return t.setInt16(e, r, !0), qe = e + 2, n;
  if (n = s.num32)
    return t.setUint32(e, 3758096640 + r, !0), qe = e + 4, n;
  if (n = s.num64)
    return t.setFloat64(e, NaN, !0), t.setInt8(e, r), qe = e + 8, n;
  qe = e;
}
function de(s, e, t) {
  let r = Nn[e] + (t << 3), n = s[r] || (s[r] = /* @__PURE__ */ Object.create(null));
  return n.__type = e, n.__size = t, n.__parent = s, n;
}
function Oo(s) {
  if (!(s instanceof Map))
    return s;
  let e = s.get("typed") || [];
  Object.isFrozen(e) && (e = e.map((n) => n.slice(0)));
  let t = s.get("named"), r = /* @__PURE__ */ Object.create(null);
  for (let n = 0, i = e.length; n < i; n++) {
    let o = e[n], l = r;
    for (let [a, f, c] of o) {
      let d = l[c];
      d || (l[c] = d = {
        key: c,
        parent: l,
        enumerationOffset: 0,
        ascii0: null,
        ascii8: null,
        num8: null,
        string16: null,
        object16: null,
        num32: null,
        float64: null,
        date64: null
      }), l = de(d, a, f);
    }
    l[Ae] = n;
  }
  return e.transitions = r, this.typedStructs = e, this.lastTypedStructuresLength = e.length, t;
}
var Js = Symbol.for("source");
function To(s, e, t, r) {
  let n = s[e++] - 32;
  if (n >= 24)
    switch (n) {
      case 24:
        n = s[e++];
        break;
      case 25:
        n = s[e++] + (s[e++] << 8);
        break;
      case 26:
        n = s[e++] + (s[e++] << 8) + (s[e++] << 16);
        break;
      case 27:
        n = s[e++] + (s[e++] << 8) + (s[e++] << 16) + (s[e++] << 24);
        break;
    }
  let i = r.typedStructs && r.typedStructs[n];
  if (!i) {
    if (s = Uint8Array.prototype.slice.call(s, e, t), t -= e, e = 0, r._mergeStructures(r.getStructures()), !r.typedStructs)
      throw new Error("Could not find any shared typed structures");
    if (r.lastTypedStructuresLength = r.typedStructs.length, i = r.typedStructs[n], !i)
      throw new Error("Could not find typed structure " + n);
  }
  var o = i.construct;
  if (!o) {
    o = i.construct = function() {
    };
    var l = o.prototype;
    let f = [], c = 0, d;
    for (let h = 0, x = i.length; h < x; h++) {
      let S = i[h], [m, b, R, L] = S;
      R === "__proto__" && (R = "__proto_");
      let k = {
        key: R,
        offset: c
      };
      L ? f.splice(h + L, 0, k) : f.push(k);
      let A;
      switch (b) {
        case 0:
          A = () => 0;
          break;
        case 1:
          A = (I, w) => {
            let E = I.bytes[w + k.offset];
            return E >= 246 ? at(E) : E;
          };
          break;
        case 2:
          A = (I, w) => {
            let E = I.bytes, B = (E.dataView || (E.dataView = new DataView(E.buffer, E.byteOffset, E.byteLength))).getUint16(w + k.offset, !0);
            return B >= 65280 ? at(B & 255) : B;
          };
          break;
        case 4:
          A = (I, w) => {
            let E = I.bytes, B = (E.dataView || (E.dataView = new DataView(E.buffer, E.byteOffset, E.byteLength))).getUint32(w + k.offset, !0);
            return B >= 4294967040 ? at(B & 255) : B;
          };
          break;
      }
      k.getRef = A, c += b;
      let D;
      switch (m) {
        case qs:
          d && !d.next && (d.next = k), d = k, k.multiGetCount = 0, D = function(I) {
            let w = I.bytes, E = I.position, N = c + E, B = A(I, E);
            if (typeof B != "number")
              return B;
            let j, K = k.next;
            for (; K && (j = K.getRef(I, E), typeof j != "number"); )
              j = null, K = K.next;
            return j == null && (j = I.bytesEnd - N), I.srcString ? I.srcString.slice(B, j) : so(w, B + N, j - B);
          };
          break;
        case Tt:
        case Kt:
          d && !d.next && (d.next = k), d = k, D = function(I) {
            let w = I.position, E = c + w, N = A(I, w);
            if (typeof N != "number")
              return N;
            let B = I.bytes, j, K = k.next;
            for (; K && (j = K.getRef(I, w), typeof j != "number"); )
              j = null, K = K.next;
            if (j == null && (j = I.bytesEnd - E), m === Tt)
              return B.toString("utf8", N + E, j + E);
            Te = I;
            try {
              return r.unpack(B, { start: N + E, end: j + E });
            } finally {
              Te = null;
            }
          };
          break;
        case ft:
          switch (b) {
            case 4:
              D = function(I) {
                let w = I.bytes, E = w.dataView || (w.dataView = new DataView(w.buffer, w.byteOffset, w.byteLength)), N = I.position + k.offset, B = E.getInt32(N, !0);
                if (B < 536870912) {
                  if (B > -520093696)
                    return B;
                  if (B > -536870912)
                    return at(B & 255);
                }
                let j = E.getFloat32(N, !0), K = Pt[(w[N + 3] & 127) << 1 | w[N + 2] >> 7];
                return (K * j + (j > 0 ? 0.5 : -0.5) >> 0) / K;
              };
              break;
            case 8:
              D = function(I) {
                let w = I.bytes, N = (w.dataView || (w.dataView = new DataView(w.buffer, w.byteOffset, w.byteLength))).getFloat64(I.position + k.offset, !0);
                if (isNaN(N)) {
                  let B = w[I.position + k.offset];
                  if (B >= 246)
                    return at(B);
                }
                return N;
              };
              break;
            case 1:
              D = function(I) {
                let E = I.bytes[I.position + k.offset];
                return E < 246 ? E : at(E);
              };
              break;
          }
          break;
        case fr:
          D = function(I) {
            let w = I.bytes, E = w.dataView || (w.dataView = new DataView(w.buffer, w.byteOffset, w.byteLength));
            return new Date(E.getFloat64(I.position + k.offset, !0));
          };
          break;
      }
      k.get = D;
    }
    if (Pn) {
      let h = [], x = [], S = 0, m;
      for (let R of f) {
        if (r.alwaysLazyProperty && r.alwaysLazyProperty(R.key)) {
          m = !0;
          continue;
        }
        Object.defineProperty(l, R.key, { get: vo(R.get), enumerable: !0 });
        let L = "v" + S++;
        x.push(L), h.push("[" + JSON.stringify(R.key) + "]:" + L + "(s)");
      }
      m && h.push("__proto__:this");
      let b = new Function(...x, "return function(s){return{" + h.join(",") + "}}").apply(null, f.map((R) => R.get));
      Object.defineProperty(l, "toJSON", {
        value(R) {
          return b.call(this, this[Js]);
        }
      });
    } else
      Object.defineProperty(l, "toJSON", {
        value(h) {
          let x = {};
          for (let S = 0, m = f.length; S < m; S++) {
            let b = f[S].key;
            x[b] = this[b];
          }
          return x;
        }
        // not enumerable or anything
      });
  }
  var a = new o();
  return a[Js] = {
    bytes: s,
    position: e,
    srcString: "",
    bytesEnd: t
  }, a;
}
function at(s) {
  switch (s) {
    case 246:
      return null;
    case 247:
      return;
    case 248:
      return !1;
    case 249:
      return !0;
  }
  throw new Error("Unknown constant");
}
function vo(s) {
  return function() {
    return s(this[Js]);
  };
}
function Ao() {
  Te && (Te.bytes = Uint8Array.prototype.slice.call(Te.bytes, Te.position, Te.bytesEnd), Te.position = 0, Te.bytesEnd = Te.bytes.length);
}
function $o(s, e) {
  if (e.typedStructs) {
    let r = /* @__PURE__ */ new Map();
    r.set("named", s), r.set("typed", e.typedStructs), s = r;
  }
  let t = e.lastTypedStructuresLength || 0;
  return s.isCompatible = (r) => {
    let n = !0;
    return r instanceof Map ? ((r.get("named") || []).length !== (e.lastNamedStructuresLength || 0) && (n = !1), (r.get("typed") || []).length !== t && (n = !1)) : (r instanceof Array || Array.isArray(r)) && r.length !== (e.lastNamedStructuresLength || 0) && (n = !1), n || e._mergeStructures(r), n;
  }, e.lastTypedStructuresLength = e.typedStructs && e.typedStructs.length, s;
}
lo(To, Oo, Ao);
const Io = process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED !== void 0 && process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED.toLowerCase() === "true";
if (!Io) {
  let s;
  try {
    typeof require == "function" ? s = require("msgpackr-extract") : s = Ii(import.meta.url)("msgpackr-extract"), s && to(s.extractStrings);
  } catch {
  }
}
const Qt = 255, Mr = 213;
var $;
(function(s) {
  s[s.ADD = 128] = "ADD", s[s.REPLACE = 0] = "REPLACE", s[s.DELETE = 64] = "DELETE", s[s.DELETE_AND_ADD = 192] = "DELETE_AND_ADD", s[s.TOUCH = 1] = "TOUCH", s[s.CLEAR = 10] = "CLEAR";
})($ || ($ = {}));
class st {
  ref;
  refId;
  root;
  parent;
  parentIndex;
  indexes;
  changed = !1;
  changes = /* @__PURE__ */ new Map();
  allChanges = /* @__PURE__ */ new Set();
  // cached indexes for filtering
  caches = {};
  currentCustomOperation = 0;
  constructor(e, t, r) {
    this.ref = e, this.setParent(t, r);
  }
  setParent(e, t, r) {
    if (this.indexes || (this.indexes = this.ref instanceof H ? this.ref._definition.indexes : {}), this.parent = e, this.parentIndex = r, !!t)
      if (this.root = t, this.ref instanceof H) {
        const n = this.ref._definition;
        for (let i in n.schema) {
          const o = this.ref[i];
          if (o && o.$changes) {
            const l = n.indexes[i];
            o.$changes.setParent(this.ref, t, l);
          }
        }
      } else
        typeof this.ref == "object" && this.ref.forEach((n, i) => {
          if (n instanceof H) {
            const o = n.$changes, l = this.ref.$changes.indexes[i];
            o.setParent(this.ref, this.root, l);
          }
        });
  }
  operation(e) {
    this.changes.set(--this.currentCustomOperation, e);
  }
  change(e, t = $.ADD) {
    const r = typeof e == "number" ? e : this.indexes[e];
    this.assertValidIndex(r, e);
    const n = this.changes.get(r);
    (!n || n.op === $.DELETE || n.op === $.TOUCH) && this.changes.set(r, {
      op: n && n.op === $.DELETE ? $.DELETE_AND_ADD : t,
      // : OPERATION.REPLACE,
      index: r
    }), this.allChanges.add(r), this.changed = !0, this.touchParents();
  }
  touch(e) {
    const t = typeof e == "number" ? e : this.indexes[e];
    this.assertValidIndex(t, e), this.changes.has(t) || this.changes.set(t, { op: $.TOUCH, index: t }), this.allChanges.add(t), this.touchParents();
  }
  touchParents() {
    this.parent && this.parent.$changes.touch(this.parentIndex);
  }
  getType(e) {
    if (this.ref._definition) {
      const t = this.ref._definition;
      return t.schema[t.fieldsByIndex[e]];
    } else {
      const t = this.parent._definition, r = t.schema[t.fieldsByIndex[this.parentIndex]];
      return Object.values(r)[0];
    }
  }
  getChildrenFilter() {
    const e = this.parent._definition.childFilters;
    return e && e[this.parentIndex];
  }
  //
  // used during `.encode()`
  //
  getValue(e) {
    return this.ref.getByIndex(e);
  }
  delete(e) {
    const t = typeof e == "number" ? e : this.indexes[e];
    if (t === void 0) {
      console.warn(`@colyseus/schema ${this.ref.constructor.name}: trying to delete non-existing index: ${e} (${t})`);
      return;
    }
    const r = this.getValue(t);
    this.changes.set(t, { op: $.DELETE, index: t }), this.allChanges.delete(t), delete this.caches[t], r && r.$changes && (r.$changes.parent = void 0), this.changed = !0, this.touchParents();
  }
  discard(e = !1, t = !1) {
    this.ref instanceof H || this.changes.forEach((r) => {
      if (r.op === $.DELETE) {
        const n = this.ref.getIndex(r.index);
        delete this.indexes[n];
      }
    }), this.changes.clear(), this.changed = e, t && this.allChanges.clear(), this.currentCustomOperation = 0;
  }
  /**
   * Recursively discard all changes from this, and child structures.
   */
  discardAll() {
    this.changes.forEach((e) => {
      const t = this.getValue(e.index);
      t && t.$changes && t.$changes.discardAll();
    }), this.discard();
  }
  // cache(field: number, beginIndex: number, endIndex: number) {
  cache(e, t) {
    this.caches[e] = t;
  }
  clone() {
    return new st(this.ref, this.parent, this.root);
  }
  ensureRefId() {
    this.refId === void 0 && (this.refId = this.root.getNextUniqueId());
  }
  assertValidIndex(e, t) {
    if (e === void 0)
      throw new Error(`ChangeTree: missing index for field "${t}"`);
  }
}
function _e(s, e, t, r) {
  return s[e] || (s[e] = []), s[e].push(t), r?.forEach((n, i) => t(n, i)), () => Fn(s[e], s[e].indexOf(t));
}
function gs(s) {
  const e = typeof this.$changes.getType() != "string";
  this.$items.forEach((t, r) => {
    s.push({
      refId: this.$changes.refId,
      op: $.DELETE,
      field: r,
      value: void 0,
      previousValue: t
    }), e && this.$changes.root.removeRef(t.$changes.refId);
  });
}
function Fn(s, e) {
  if (e === -1 || e >= s.length)
    return !1;
  const t = s.length - 1;
  for (let r = e; r < t; r++)
    s[r] = s[r + 1];
  return s.length = t, !0;
}
const Ro = (s, e) => {
  const t = s.toString(), r = e.toString();
  return t < r ? -1 : t > r ? 1 : 0;
};
function ko(s) {
  return s.$proxy = !0, s = new Proxy(s, {
    get: (e, t) => typeof t != "symbol" && !isNaN(t) ? e.at(t) : e[t],
    set: (e, t, r) => {
      if (typeof t != "symbol" && !isNaN(t)) {
        const n = Array.from(e.$items.keys()), i = parseInt(n[t] || t);
        r == null ? e.deleteAt(i) : e.setAt(i, r);
      } else
        e[t] = r;
      return !0;
    },
    deleteProperty: (e, t) => (typeof t == "number" ? e.deleteAt(t) : delete e[t], !0),
    has: (e, t) => typeof t != "symbol" && !isNaN(Number(t)) ? e.$items.has(Number(t)) : Reflect.has(e, t)
  }), s;
}
class pe {
  $changes = new st(this);
  $items = /* @__PURE__ */ new Map();
  $indexes = /* @__PURE__ */ new Map();
  $refId = 0;
  //
  // Decoding callbacks
  //
  $callbacks;
  onAdd(e, t = !0) {
    return _e(this.$callbacks || (this.$callbacks = {}), $.ADD, e, t ? this.$items : void 0);
  }
  onRemove(e) {
    return _e(this.$callbacks || (this.$callbacks = {}), $.DELETE, e);
  }
  onChange(e) {
    return _e(this.$callbacks || (this.$callbacks = {}), $.REPLACE, e);
  }
  static is(e) {
    return (
      // type format: ["string"]
      Array.isArray(e) || // type format: { array: "string" }
      e.array !== void 0
    );
  }
  constructor(...e) {
    this.push.apply(this, e);
  }
  set length(e) {
    e === 0 ? this.clear() : this.splice(e, this.length - e);
  }
  get length() {
    return this.$items.size;
  }
  push(...e) {
    let t;
    return e.forEach((r) => {
      t = this.$refId++, this.setAt(t, r);
    }), t;
  }
  /**
   * Removes the last element from an array and returns it.
   */
  pop() {
    const e = Array.from(this.$indexes.values()).pop();
    if (e === void 0)
      return;
    this.$changes.delete(e), this.$indexes.delete(e);
    const t = this.$items.get(e);
    return this.$items.delete(e), t;
  }
  at(e) {
    const t = Array.from(this.$items.keys())[e];
    return this.$items.get(t);
  }
  setAt(e, t) {
    if (t == null) {
      console.error("ArraySchema items cannot be null nor undefined; Use `deleteAt(index)` instead.");
      return;
    }
    if (this.$items.get(e) === t)
      return;
    t.$changes !== void 0 && t.$changes.setParent(this, this.$changes.root, e);
    const r = this.$changes.indexes[e]?.op ?? $.ADD;
    this.$changes.indexes[e] = e, this.$indexes.set(e, e), this.$items.set(e, t), this.$changes.change(e, r);
  }
  deleteAt(e) {
    const t = Array.from(this.$items.keys())[e];
    return t === void 0 ? !1 : this.$deleteAt(t);
  }
  $deleteAt(e) {
    return this.$changes.delete(e), this.$indexes.delete(e), this.$items.delete(e);
  }
  clear(e) {
    this.$changes.discard(!0, !0), this.$changes.indexes = {}, this.$indexes.clear(), e && gs.call(this, e), this.$items.clear(), this.$changes.operation({ index: 0, op: $.CLEAR }), this.$changes.touchParents();
  }
  /**
   * Combines two or more arrays.
   * @param items Additional items to add to the end of array1.
   */
  // @ts-ignore
  concat(...e) {
    return new pe(...Array.from(this.$items.values()).concat(...e));
  }
  /**
   * Adds all the elements of an array separated by the specified separator string.
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(e) {
    return Array.from(this.$items.values()).join(e);
  }
  /**
   * Reverses the elements in an Array.
   */
  // @ts-ignore
  reverse() {
    const e = Array.from(this.$items.keys());
    return Array.from(this.$items.values()).reverse().forEach((r, n) => {
      this.setAt(e[n], r);
    }), this;
  }
  /**
   * Removes the first element from an array and returns it.
   */
  shift() {
    const t = Array.from(this.$items.keys()).shift();
    if (t === void 0)
      return;
    const r = this.$items.get(t);
    return this.$deleteAt(t), r;
  }
  /**
   * Returns a section of an array.
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(e, t) {
    const r = new pe();
    return r.push(...Array.from(this.$items.values()).slice(e, t)), r;
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
  sort(e = Ro) {
    const t = Array.from(this.$items.keys());
    return Array.from(this.$items.values()).sort(e).forEach((n, i) => {
      this.setAt(t[i], n);
    }), this;
  }
  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @param items Elements to insert into the array in place of the deleted elements.
   */
  splice(e, t = this.length - e, ...r) {
    const n = Array.from(this.$items.keys()), i = [];
    for (let o = e; o < e + t; o++)
      i.push(this.$items.get(n[o])), this.$deleteAt(n[o]);
    for (let o = 0; o < r.length; o++)
      this.setAt(e + o, r[o]);
    return i;
  }
  /**
   * Inserts new elements at the start of an array.
   * @param items  Elements to insert at the start of the Array.
   */
  unshift(...e) {
    const t = this.length, r = e.length, n = Array.from(this.$items.values());
    return e.forEach((i, o) => {
      this.setAt(o, i);
    }), n.forEach((i, o) => {
      this.setAt(r + o, i);
    }), t + r;
  }
  /**
   * Returns the index of the first occurrence of a value in an array.
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(e, t) {
    return Array.from(this.$items.values()).indexOf(e, t);
  }
  /**
   * Returns the index of the last occurrence of a specified value in an array.
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
   */
  lastIndexOf(e, t = this.length - 1) {
    return Array.from(this.$items.values()).lastIndexOf(e, t);
  }
  /**
   * Determines whether all the members of an array satisfy the specified test.
   * @param callbackfn A function that accepts up to three arguments. The every method calls
   * the callbackfn function for each element in the array until the callbackfn returns a value
   * which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  every(e, t) {
    return Array.from(this.$items.values()).every(e, t);
  }
  /**
   * Determines whether the specified callback function returns true for any element of an array.
   * @param callbackfn A function that accepts up to three arguments. The some method calls
   * the callbackfn function for each element in the array until the callbackfn returns a value
   * which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  some(e, t) {
    return Array.from(this.$items.values()).some(e, t);
  }
  /**
   * Performs the specified action for each element in an array.
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(e, t) {
    Array.from(this.$items.values()).forEach(e, t);
  }
  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(e, t) {
    return Array.from(this.$items.values()).map(e, t);
  }
  filter(e, t) {
    return Array.from(this.$items.values()).filter(e, t);
  }
  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(e, t) {
    return Array.prototype.reduce.apply(Array.from(this.$items.values()), arguments);
  }
  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(e, t) {
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
  find(e, t) {
    return Array.from(this.$items.values()).find(e, t);
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
  findIndex(e, t) {
    return Array.from(this.$items.values()).findIndex(e, t);
  }
  /**
   * Returns the this object after filling the section identified by start and end with value
   * @param value value to fill array section with
   * @param start index to start filling the array at. If start is negative, it is treated as
   * length+start where length is the length of the array.
   * @param end index to stop filling the array at. If end is negative, it is treated as
   * length+end.
   */
  fill(e, t, r) {
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
  copyWithin(e, t, r) {
    throw new Error("ArraySchema#copyWithin() not implemented");
  }
  /**
   * Returns a string representation of an array.
   */
  toString() {
    return this.$items.toString();
  }
  /**
   * Returns a string representation of an array. The elements are converted to string using their toLocalString methods.
   */
  toLocaleString() {
    return this.$items.toLocaleString();
  }
  /** Iterator */
  [Symbol.iterator]() {
    return Array.from(this.$items.values())[Symbol.iterator]();
  }
  static get [Symbol.species]() {
    return pe;
  }
  // WORKAROUND for compatibility
  // - TypeScript 4 defines @@unscopables as a function
  // - TypeScript 5 defines @@unscopables as an object
  [Symbol.unscopables];
  /**
   * Returns an iterable of key, value pairs for every entry in the array
   */
  entries() {
    return this.$items.entries();
  }
  /**
   * Returns an iterable of keys in the array
   */
  keys() {
    return this.$items.keys();
  }
  /**
   * Returns an iterable of values in the array
   */
  values() {
    return this.$items.values();
  }
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(e, t) {
    return Array.from(this.$items.values()).includes(e, t);
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
  flatMap(e, t) {
    throw new Error("ArraySchema#flatMap() is not supported.");
  }
  /**
   * Returns a new array with all sub-array elements concatenated into it recursively up to the
   * specified depth.
   *
   * @param depth The maximum recursion depth
   */
  // @ts-ignore
  flat(e) {
    throw new Error("ArraySchema#flat() is not supported.");
  }
  findLast() {
    const e = Array.from(this.$items.values());
    return e.findLast.apply(e, arguments);
  }
  findLastIndex(...e) {
    const t = Array.from(this.$items.values());
    return t.findLastIndex.apply(t, arguments);
  }
  //
  // ES2023
  //
  with(e, t) {
    const r = Array.from(this.$items.values());
    return r[e] = t, new pe(...r);
  }
  toReversed() {
    return Array.from(this.$items.values()).reverse();
  }
  toSorted(e) {
    return Array.from(this.$items.values()).sort(e);
  }
  // @ts-ignore
  toSpliced(e, t, ...r) {
    const n = Array.from(this.$items.values());
    return n.toSpliced.apply(n, arguments);
  }
  setIndex(e, t) {
    this.$indexes.set(e, t);
  }
  getIndex(e) {
    return this.$indexes.get(e);
  }
  getByIndex(e) {
    return this.$items.get(this.$indexes.get(e));
  }
  deleteByIndex(e) {
    const t = this.$indexes.get(e);
    this.$items.delete(t), this.$indexes.delete(e);
  }
  toArray() {
    return Array.from(this.$items.values());
  }
  toJSON() {
    return this.toArray().map((e) => typeof e.toJSON == "function" ? e.toJSON() : e);
  }
  //
  // Decoding utilities
  //
  clone(e) {
    let t;
    return e ? t = new pe(...Array.from(this.$items.values())) : t = new pe(...this.map((r) => r.$changes ? r.clone() : r)), t;
  }
}
function Lo(s) {
  return s.$proxy = !0, s = new Proxy(s, {
    get: (e, t) => typeof t != "symbol" && // accessing properties
    typeof e[t] > "u" ? e.get(t) : e[t],
    set: (e, t, r) => (typeof t != "symbol" && t.indexOf("$") === -1 && t !== "onAdd" && t !== "onRemove" && t !== "onChange" ? e.set(t, r) : e[t] = r, !0),
    deleteProperty: (e, t) => (e.delete(t), !0)
  }), s;
}
class ie {
  $changes = new st(this);
  $items = /* @__PURE__ */ new Map();
  $indexes = /* @__PURE__ */ new Map();
  $refId = 0;
  //
  // Decoding callbacks
  //
  $callbacks;
  onAdd(e, t = !0) {
    return _e(this.$callbacks || (this.$callbacks = {}), $.ADD, e, t ? this.$items : void 0);
  }
  onRemove(e) {
    return _e(this.$callbacks || (this.$callbacks = {}), $.DELETE, e);
  }
  onChange(e) {
    return _e(this.$callbacks || (this.$callbacks = {}), $.REPLACE, e);
  }
  static is(e) {
    return e.map !== void 0;
  }
  constructor(e) {
    if (e)
      if (e instanceof Map || e instanceof ie)
        e.forEach((t, r) => this.set(r, t));
      else
        for (const t in e)
          this.set(t, e[t]);
  }
  /** Iterator */
  [Symbol.iterator]() {
    return this.$items[Symbol.iterator]();
  }
  get [Symbol.toStringTag]() {
    return this.$items[Symbol.toStringTag];
  }
  static get [Symbol.species]() {
    return ie;
  }
  set(e, t) {
    if (t == null)
      throw new Error(`MapSchema#set('${e}', ${t}): trying to set ${t} value on '${e}'.`);
    e = e.toString();
    const r = typeof this.$changes.indexes[e] < "u", n = r ? this.$changes.indexes[e] : this.$refId++;
    let i = r ? $.REPLACE : $.ADD;
    const o = t.$changes !== void 0;
    if (o && t.$changes.setParent(this, this.$changes.root, n), !r)
      this.$changes.indexes[e] = n, this.$indexes.set(n, e);
    else {
      if (!o && this.$items.get(e) === t)
        return;
      o && // if is schema, force ADD operation if value differ from previous one.
      this.$items.get(e) !== t && (i = $.ADD);
    }
    return this.$items.set(e, t), this.$changes.change(e, i), this;
  }
  get(e) {
    return this.$items.get(e);
  }
  delete(e) {
    return this.$changes.delete(e.toString()), this.$items.delete(e);
  }
  clear(e) {
    this.$changes.discard(!0, !0), this.$changes.indexes = {}, this.$indexes.clear(), e && gs.call(this, e), this.$items.clear(), this.$changes.operation({ index: 0, op: $.CLEAR }), this.$changes.touchParents();
  }
  has(e) {
    return this.$items.has(e);
  }
  forEach(e) {
    this.$items.forEach(e);
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
  setIndex(e, t) {
    this.$indexes.set(e, t);
  }
  getIndex(e) {
    return this.$indexes.get(e);
  }
  getByIndex(e) {
    return this.$items.get(this.$indexes.get(e));
  }
  deleteByIndex(e) {
    const t = this.$indexes.get(e);
    this.$items.delete(t), this.$indexes.delete(e);
  }
  toJSON() {
    const e = {};
    return this.forEach((t, r) => {
      e[r] = typeof t.toJSON == "function" ? t.toJSON() : t;
    }), e;
  }
  //
  // Decoding utilities
  //
  clone(e) {
    let t;
    return e ? t = Object.assign(new ie(), this) : (t = new ie(), this.forEach((r, n) => {
      r.$changes ? t.set(n, r.clone()) : t.set(n, r);
    })), t;
  }
}
const Bn = {};
function ps(s, e) {
  Bn[s] = e;
}
function is(s) {
  return Bn[s];
}
class _s {
  schema;
  //
  // TODO: use a "field" structure combining all these properties per-field.
  //
  indexes = {};
  fieldsByIndex = {};
  filters;
  indexesWithFilters;
  childFilters;
  // childFilters are used on Map, Array, Set items.
  deprecated = {};
  descriptors = {};
  static create(e) {
    const t = new _s();
    return t.schema = Object.assign({}, e && e.schema || {}), t.indexes = Object.assign({}, e && e.indexes || {}), t.fieldsByIndex = Object.assign({}, e && e.fieldsByIndex || {}), t.descriptors = Object.assign({}, e && e.descriptors || {}), t.deprecated = Object.assign({}, e && e.deprecated || {}), t;
  }
  addField(e, t) {
    const r = this.getNextFieldIndex();
    this.fieldsByIndex[r] = e, this.indexes[e] = r, this.schema[e] = Array.isArray(t) ? { array: t[0] } : t;
  }
  hasField(e) {
    return this.indexes[e] !== void 0;
  }
  addFilter(e, t) {
    return this.filters || (this.filters = {}, this.indexesWithFilters = []), this.filters[this.indexes[e]] = t, this.indexesWithFilters.push(this.indexes[e]), !0;
  }
  addChildrenFilter(e, t) {
    const r = this.indexes[e], n = this.schema[e];
    if (is(Object.keys(n)[0]))
      return this.childFilters || (this.childFilters = {}), this.childFilters[r] = t, !0;
    console.warn(`@filterChildren: field '${e}' can't have children. Ignoring filter.`);
  }
  getChildrenFilter(e) {
    return this.childFilters && this.childFilters[this.indexes[e]];
  }
  getNextFieldIndex() {
    return Object.keys(this.schema || {}).length;
  }
}
function Do(s) {
  return s._context && s._context.useFilters;
}
class gt {
  types = {};
  schemas = /* @__PURE__ */ new Map();
  useFilters = !1;
  has(e) {
    return this.schemas.has(e);
  }
  get(e) {
    return this.types[e];
  }
  add(e, t = this.schemas.size) {
    e._definition = _s.create(e._definition), e._typeid = t, this.types[t] = e, this.schemas.set(e, t);
  }
  static create(e = {}) {
    return function(t) {
      return e.context || (e.context = new gt()), W(t, e);
    };
  }
}
const Un = new gt();
function W(s, e = {}) {
  return function(t, r) {
    const n = e.context || Un, i = t.constructor;
    if (i._context = n, !s)
      throw new Error(`${i.name}: @type() reference provided for "${r}" is undefined. Make sure you don't have any circular dependencies.`);
    n.has(i) || n.add(i);
    const o = i._definition;
    if (o.addField(r, s), o.descriptors[r]) {
      if (o.deprecated[r])
        return;
      try {
        throw new Error(`@colyseus/schema: Duplicate '${r}' definition on '${i.name}'.
Check @type() annotation`);
      } catch (c) {
        const d = c.stack.split(`
`)[4].trim();
        throw new Error(`${c.message} ${d}`);
      }
    }
    const l = pe.is(s), a = !l && ie.is(s);
    if (typeof s != "string" && !H.is(s)) {
      const c = Object.values(s)[0];
      typeof c != "string" && !n.has(c) && n.add(c);
    }
    if (e.manual) {
      o.descriptors[r] = {
        enumerable: !0,
        configurable: !0,
        writable: !0
      };
      return;
    }
    const f = `_${r}`;
    o.descriptors[f] = {
      enumerable: !1,
      configurable: !1,
      writable: !0
    }, o.descriptors[r] = {
      get: function() {
        return this[f];
      },
      set: function(c) {
        c !== this[f] && (c != null ? (l && !(c instanceof pe) && (c = new pe(...c)), a && !(c instanceof ie) && (c = new ie(c)), c.$proxy === void 0 && (a ? c = Lo(c) : l && (c = ko(c))), this.$changes.change(r), c.$changes && c.$changes.setParent(this, this.$changes.root, this._definition.indexes[r])) : this[f] && this.$changes.delete(r), this[f] = c);
      },
      enumerable: !0,
      configurable: !0
    };
  };
}
function jn(s, e, t = {}) {
  t.context || (t.context = s._context || t.context || Un);
  for (let r in e)
    W(e[r], t)(s.prototype, r);
  return s;
}
function No(s) {
  for (var e = 0, t = 0, r = 0, n = s.length; r < n; r++)
    e = s.charCodeAt(r), e < 128 ? t += 1 : e < 2048 ? t += 2 : e < 55296 || e >= 57344 ? t += 3 : (r++, t += 4);
  return t;
}
function Vn(s, e, t) {
  for (var r = 0, n = 0, i = t.length; n < i; n++)
    r = t.charCodeAt(n), r < 128 ? s[e++] = r : r < 2048 ? (s[e++] = 192 | r >> 6, s[e++] = 128 | r & 63) : r < 55296 || r >= 57344 ? (s[e++] = 224 | r >> 12, s[e++] = 128 | r >> 6 & 63, s[e++] = 128 | r & 63) : (n++, r = 65536 + ((r & 1023) << 10 | t.charCodeAt(n) & 1023), s[e++] = 240 | r >> 18, s[e++] = 128 | r >> 12 & 63, s[e++] = 128 | r >> 6 & 63, s[e++] = 128 | r & 63);
}
function Gn(s, e) {
  s.push(e & 255);
}
function he(s, e) {
  s.push(e & 255);
}
function Wn(s, e) {
  s.push(e & 255), s.push(e >> 8 & 255);
}
function hr(s, e) {
  s.push(e & 255), s.push(e >> 8 & 255);
}
function It(s, e) {
  s.push(e & 255), s.push(e >> 8 & 255), s.push(e >> 16 & 255), s.push(e >> 24 & 255);
}
function Ze(s, e) {
  const t = e >> 24, r = e >> 16, n = e >> 8, i = e;
  s.push(i & 255), s.push(n & 255), s.push(r & 255), s.push(t & 255);
}
function Hn(s, e) {
  const t = Math.floor(e / Math.pow(2, 32)), r = e >>> 0;
  Ze(s, r), Ze(s, t);
}
function Yn(s, e) {
  const t = e / Math.pow(2, 32) >> 0, r = e >>> 0;
  Ze(s, r), Ze(s, t);
}
function Po(s, e) {
  zn(s, e);
}
function Mo(s, e) {
  ur(s, e);
}
const Rt = new Int32Array(2), Fo = new Float32Array(Rt.buffer), Bo = new Float64Array(Rt.buffer);
function zn(s, e) {
  Fo[0] = e, It(s, Rt[0]);
}
function ur(s, e) {
  Bo[0] = e, It(s, Rt[0]), It(s, Rt[1]);
}
function Uo(s, e) {
  return he(s, e ? 1 : 0);
}
function Zt(s, e) {
  e || (e = "");
  let t = No(e), r = 0;
  if (t < 32)
    s.push(t | 160), r = 1;
  else if (t < 256)
    s.push(217), he(s, t), r = 2;
  else if (t < 65536)
    s.push(218), hr(s, t), r = 3;
  else if (t < 4294967296)
    s.push(219), Ze(s, t), r = 5;
  else
    throw new Error("String too long");
  return Vn(s, s.length, e), r + t;
}
function ge(s, e) {
  if (isNaN(e))
    return ge(s, 0);
  if (isFinite(e)) {
    if (e !== (e | 0))
      return s.push(203), ur(s, e), 9;
  } else
    return ge(s, e > 0 ? Number.MAX_SAFE_INTEGER : -Number.MAX_SAFE_INTEGER);
  return e >= 0 ? e < 128 ? (he(s, e), 1) : e < 256 ? (s.push(204), he(s, e), 2) : e < 65536 ? (s.push(205), hr(s, e), 3) : e < 4294967296 ? (s.push(206), Ze(s, e), 5) : (s.push(207), Yn(s, e), 9) : e >= -32 ? (s.push(224 | e + 32), 1) : e >= -128 ? (s.push(208), Gn(s, e), 2) : e >= -32768 ? (s.push(209), Wn(s, e), 3) : e >= -2147483648 ? (s.push(210), It(s, e), 5) : (s.push(211), Hn(s, e), 9);
}
var ht = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  utf8Write: Vn,
  int8: Gn,
  uint8: he,
  int16: Wn,
  uint16: hr,
  int32: It,
  uint32: Ze,
  int64: Hn,
  uint64: Yn,
  float32: Po,
  float64: Mo,
  writeFloat32: zn,
  writeFloat64: ur,
  boolean: Uo,
  string: Zt,
  number: ge
});
function jo(s, e, t) {
  for (var r = "", n = 0, i = e, o = e + t; i < o; i++) {
    var l = s[i];
    if (!(l & 128)) {
      r += String.fromCharCode(l);
      continue;
    }
    if ((l & 224) === 192) {
      r += String.fromCharCode((l & 31) << 6 | s[++i] & 63);
      continue;
    }
    if ((l & 240) === 224) {
      r += String.fromCharCode((l & 15) << 12 | (s[++i] & 63) << 6 | (s[++i] & 63) << 0);
      continue;
    }
    if ((l & 248) === 240) {
      n = (l & 7) << 18 | (s[++i] & 63) << 12 | (s[++i] & 63) << 6 | (s[++i] & 63) << 0, n >= 65536 ? (n -= 65536, r += String.fromCharCode((n >>> 10) + 55296, (n & 1023) + 56320)) : r += String.fromCharCode(n);
      continue;
    }
    console.error("Invalid byte " + l.toString(16));
  }
  return r;
}
function qn(s, e) {
  return Mt(s, e) << 24 >> 24;
}
function Mt(s, e) {
  return s[e.offset++];
}
function Jn(s, e) {
  return ms(s, e) << 16 >> 16;
}
function ms(s, e) {
  return s[e.offset++] | s[e.offset++] << 8;
}
function et(s, e) {
  return s[e.offset++] | s[e.offset++] << 8 | s[e.offset++] << 16 | s[e.offset++] << 24;
}
function ut(s, e) {
  return et(s, e) >>> 0;
}
function Vo(s, e) {
  return dr(s, e);
}
function Go(s, e) {
  return gr(s, e);
}
function Kn(s, e) {
  const t = ut(s, e);
  return et(s, e) * Math.pow(2, 32) + t;
}
function Xn(s, e) {
  const t = ut(s, e);
  return ut(s, e) * Math.pow(2, 32) + t;
}
const kt = new Int32Array(2), Wo = new Float32Array(kt.buffer), Ho = new Float64Array(kt.buffer);
function dr(s, e) {
  return kt[0] = et(s, e), Wo[0];
}
function gr(s, e) {
  return kt[0] = et(s, e), kt[1] = et(s, e), Ho[0];
}
function Yo(s, e) {
  return Mt(s, e) > 0;
}
function Qn(s, e) {
  const t = s[e.offset++];
  let r;
  t < 192 ? r = t & 31 : t === 217 ? r = Mt(s, e) : t === 218 ? r = ms(s, e) : t === 219 && (r = ut(s, e));
  const n = jo(s, e.offset, r);
  return e.offset += r, n;
}
function zo(s, e) {
  const t = s[e.offset];
  return (
    // fixstr
    t < 192 && t > 160 || // str 8
    t === 217 || // str 16
    t === 218 || // str 32
    t === 219
  );
}
function Ye(s, e) {
  const t = s[e.offset++];
  if (t < 128)
    return t;
  if (t === 202)
    return dr(s, e);
  if (t === 203)
    return gr(s, e);
  if (t === 204)
    return Mt(s, e);
  if (t === 205)
    return ms(s, e);
  if (t === 206)
    return ut(s, e);
  if (t === 207)
    return Xn(s, e);
  if (t === 208)
    return qn(s, e);
  if (t === 209)
    return Jn(s, e);
  if (t === 210)
    return et(s, e);
  if (t === 211)
    return Kn(s, e);
  if (t > 223)
    return (255 - t + 1) * -1;
}
function qo(s, e) {
  const t = s[e.offset];
  return t < 128 || t >= 202 && t <= 211;
}
function Jo(s, e) {
  return s[e.offset] < 160;
}
function Zn(s, e) {
  return (
    // previous byte should be `SWITCH_TO_STRUCTURE`
    s[e.offset - 1] === Qt && // next byte should be a number
    (s[e.offset] < 128 || s[e.offset] >= 202 && s[e.offset] <= 211)
  );
}
var Ne = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  int8: qn,
  uint8: Mt,
  int16: Jn,
  uint16: ms,
  int32: et,
  uint32: ut,
  float32: Vo,
  float64: Go,
  int64: Kn,
  uint64: Xn,
  readFloat32: dr,
  readFloat64: gr,
  boolean: Yo,
  string: Qn,
  stringCheck: zo,
  number: Ye,
  numberCheck: qo,
  arrayCheck: Jo,
  switchStructureCheck: Zn
});
class Lt {
  $changes = new st(this);
  $items = /* @__PURE__ */ new Map();
  $indexes = /* @__PURE__ */ new Map();
  $refId = 0;
  //
  // Decoding callbacks
  //
  $callbacks;
  onAdd(e, t = !0) {
    return _e(this.$callbacks || (this.$callbacks = []), $.ADD, e, t ? this.$items : void 0);
  }
  onRemove(e) {
    return _e(this.$callbacks || (this.$callbacks = []), $.DELETE, e);
  }
  onChange(e) {
    return _e(this.$callbacks || (this.$callbacks = []), $.REPLACE, e);
  }
  static is(e) {
    return e.collection !== void 0;
  }
  constructor(e) {
    e && e.forEach((t) => this.add(t));
  }
  add(e) {
    const t = this.$refId++;
    return e.$changes !== void 0 && e.$changes.setParent(this, this.$changes.root, t), this.$changes.indexes[t] = t, this.$indexes.set(t, t), this.$items.set(t, e), this.$changes.change(t), t;
  }
  at(e) {
    const t = Array.from(this.$items.keys())[e];
    return this.$items.get(t);
  }
  entries() {
    return this.$items.entries();
  }
  delete(e) {
    const t = this.$items.entries();
    let r, n;
    for (; (n = t.next()) && !n.done; )
      if (e === n.value[1]) {
        r = n.value[0];
        break;
      }
    return r === void 0 ? !1 : (this.$changes.delete(r), this.$indexes.delete(r), this.$items.delete(r));
  }
  clear(e) {
    this.$changes.discard(!0, !0), this.$changes.indexes = {}, this.$indexes.clear(), e && gs.call(this, e), this.$items.clear(), this.$changes.operation({ index: 0, op: $.CLEAR }), this.$changes.touchParents();
  }
  has(e) {
    return Array.from(this.$items.values()).some((t) => t === e);
  }
  forEach(e) {
    this.$items.forEach((t, r, n) => e(t, r, this));
  }
  values() {
    return this.$items.values();
  }
  get size() {
    return this.$items.size;
  }
  setIndex(e, t) {
    this.$indexes.set(e, t);
  }
  getIndex(e) {
    return this.$indexes.get(e);
  }
  getByIndex(e) {
    return this.$items.get(this.$indexes.get(e));
  }
  deleteByIndex(e) {
    const t = this.$indexes.get(e);
    this.$items.delete(t), this.$indexes.delete(e);
  }
  toArray() {
    return Array.from(this.$items.values());
  }
  toJSON() {
    const e = [];
    return this.forEach((t, r) => {
      e.push(typeof t.toJSON == "function" ? t.toJSON() : t);
    }), e;
  }
  //
  // Decoding utilities
  //
  clone(e) {
    let t;
    return e ? t = Object.assign(new Lt(), this) : (t = new Lt(), this.forEach((r) => {
      r.$changes ? t.add(r.clone()) : t.add(r);
    })), t;
  }
}
class Dt {
  $changes = new st(this);
  $items = /* @__PURE__ */ new Map();
  $indexes = /* @__PURE__ */ new Map();
  $refId = 0;
  //
  // Decoding callbacks
  //
  $callbacks;
  onAdd(e, t = !0) {
    return _e(this.$callbacks || (this.$callbacks = []), $.ADD, e, t ? this.$items : void 0);
  }
  onRemove(e) {
    return _e(this.$callbacks || (this.$callbacks = []), $.DELETE, e);
  }
  onChange(e) {
    return _e(this.$callbacks || (this.$callbacks = []), $.REPLACE, e);
  }
  static is(e) {
    return e.set !== void 0;
  }
  constructor(e) {
    e && e.forEach((t) => this.add(t));
  }
  add(e) {
    if (this.has(e))
      return !1;
    const t = this.$refId++;
    e.$changes !== void 0 && e.$changes.setParent(this, this.$changes.root, t);
    const r = this.$changes.indexes[t]?.op ?? $.ADD;
    return this.$changes.indexes[t] = t, this.$indexes.set(t, t), this.$items.set(t, e), this.$changes.change(t, r), t;
  }
  entries() {
    return this.$items.entries();
  }
  delete(e) {
    const t = this.$items.entries();
    let r, n;
    for (; (n = t.next()) && !n.done; )
      if (e === n.value[1]) {
        r = n.value[0];
        break;
      }
    return r === void 0 ? !1 : (this.$changes.delete(r), this.$indexes.delete(r), this.$items.delete(r));
  }
  clear(e) {
    this.$changes.discard(!0, !0), this.$changes.indexes = {}, this.$indexes.clear(), e && gs.call(this, e), this.$items.clear(), this.$changes.operation({ index: 0, op: $.CLEAR }), this.$changes.touchParents();
  }
  has(e) {
    const t = this.$items.values();
    let r = !1, n;
    for (; (n = t.next()) && !n.done; )
      if (e === n.value) {
        r = !0;
        break;
      }
    return r;
  }
  forEach(e) {
    this.$items.forEach((t, r, n) => e(t, r, this));
  }
  values() {
    return this.$items.values();
  }
  get size() {
    return this.$items.size;
  }
  setIndex(e, t) {
    this.$indexes.set(e, t);
  }
  getIndex(e) {
    return this.$indexes.get(e);
  }
  getByIndex(e) {
    return this.$items.get(this.$indexes.get(e));
  }
  deleteByIndex(e) {
    const t = this.$indexes.get(e);
    this.$items.delete(t), this.$indexes.delete(e);
  }
  toArray() {
    return Array.from(this.$items.values());
  }
  toJSON() {
    const e = [];
    return this.forEach((t, r) => {
      e.push(typeof t.toJSON == "function" ? t.toJSON() : t);
    }), e;
  }
  //
  // Decoding utilities
  //
  clone(e) {
    let t;
    return e ? t = Object.assign(new Dt(), this) : (t = new Dt(), this.forEach((r) => {
      r.$changes ? t.add(r.clone()) : t.add(r);
    })), t;
  }
}
let Ko = class ei {
  refIds = /* @__PURE__ */ new WeakSet();
  containerIndexes = /* @__PURE__ */ new WeakMap();
  // containerIndexes = new Map<ChangeTree, Set<number>>();
  addRefId(e) {
    this.refIds.has(e) || (this.refIds.add(e), this.containerIndexes.set(e, /* @__PURE__ */ new Set()));
  }
  static get(e) {
    return e.$filterState === void 0 && (e.$filterState = new ei()), e.$filterState;
  }
};
class Xo {
  //
  // Relation of refId => Schema structure
  // For direct access of structures during decoding time.
  //
  refs = /* @__PURE__ */ new Map();
  refCounts = {};
  deletedRefs = /* @__PURE__ */ new Set();
  nextUniqueId = 0;
  getNextUniqueId() {
    return this.nextUniqueId++;
  }
  // for decoding
  addRef(e, t, r = !0) {
    this.refs.set(e, t), r && (this.refCounts[e] = (this.refCounts[e] || 0) + 1);
  }
  // for decoding
  removeRef(e) {
    const t = this.refCounts[e];
    if (t === void 0) {
      console.warn(`trying to remove reference ${e} that doesn't exist`);
      return;
    }
    if (t === 0) {
      console.warn(`trying to remove reference ${e} with 0 refCount`);
      return;
    }
    this.refCounts[e] = t - 1, this.deletedRefs.add(e);
  }
  clearRefs() {
    this.refs.clear(), this.deletedRefs.clear(), this.refCounts = {};
  }
  // for decoding
  garbageCollectDeletedRefs() {
    this.deletedRefs.forEach((e) => {
      if (this.refCounts[e] > 0)
        return;
      const t = this.refs.get(e);
      if (t instanceof H)
        for (const r in t._definition.schema)
          typeof t._definition.schema[r] != "string" && t[r] && t[r].$changes && this.removeRef(t[r].$changes.refId);
      else {
        const r = t.$changes.parent._definition, n = r.schema[r.fieldsByIndex[t.$changes.parentIndex]];
        typeof Object.values(n)[0] == "function" && Array.from(t.values()).forEach((i) => this.removeRef(i.$changes.refId));
      }
      this.refs.delete(e), delete this.refCounts[e];
    }), this.deletedRefs.clear();
  }
}
class pr extends Error {
}
function Qo(s, e, t, r) {
  let n, i = !1;
  switch (e) {
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
      n = "number", isNaN(s) && console.log(`trying to encode "NaN" in ${t.constructor.name}#${r}`);
      break;
    case "string":
      n = "string", i = !0;
      break;
    case "boolean":
      return;
  }
  if (typeof s !== n && (!i || i && s !== null)) {
    let o = `'${JSON.stringify(s)}'${s && s.constructor && ` (${s.constructor.name})` || ""}`;
    throw new pr(`a '${n}' was expected, but ${o} was provided in ${t.constructor.name}#${r}`);
  }
}
function Fr(s, e, t, r) {
  if (!(s instanceof e))
    throw new pr(`a '${e.name}' was expected, but '${s.constructor.name}' was provided in ${t.constructor.name}#${r}`);
}
function Zo(s, e, t, r, n) {
  Qo(t, s, r, n);
  const i = ht[s];
  if (i)
    i(e, t);
  else
    throw new pr(`a '${s}' was expected, but ${t} was provided in ${r.constructor.name}#${n}`);
}
function ea(s, e, t) {
  return Ne[s](e, t);
}
class H {
  static _typeid;
  static _context;
  static _definition = _s.create();
  static onError(e) {
    console.error(e);
  }
  static is(e) {
    return e._definition && e._definition.schema !== void 0;
  }
  $changes;
  // TODO: refactor. this feature needs to be ported to other languages with potentially different API
  // protected $listeners: { [field: string]: Array<(value: any, previousValue: any) => void> };
  $callbacks;
  onChange(e) {
    return _e(this.$callbacks || (this.$callbacks = {}), $.REPLACE, e);
  }
  onRemove(e) {
    return _e(this.$callbacks || (this.$callbacks = {}), $.DELETE, e);
  }
  // allow inherited classes to have a constructor
  constructor(...e) {
    Object.defineProperties(this, {
      $changes: {
        value: new st(this, void 0, new Xo()),
        enumerable: !1,
        writable: !0
      },
      // $listeners: {
      //     value: undefined,
      //     enumerable: false,
      //     writable: true
      // },
      $callbacks: {
        value: void 0,
        enumerable: !1,
        writable: !0
      }
    });
    const t = this._definition.descriptors;
    t && Object.defineProperties(this, t), e[0] && this.assign(e[0]);
  }
  assign(e) {
    return Object.assign(this, e), this;
  }
  get _definition() {
    return this.constructor._definition;
  }
  /**
   * (Server-side): Flag a property to be encoded for the next patch.
   * @param instance Schema instance
   * @param property string representing the property name, or number representing the index of the property.
   * @param operation OPERATION to perform (detected automatically)
   */
  setDirty(e, t) {
    this.$changes.change(e, t);
  }
  /**
   * Client-side: listen for changes on property.
   * @param prop the property name
   * @param callback callback to be triggered on property change
   * @param immediate trigger immediatelly if property has been already set.
   */
  listen(e, t, r = !0) {
    return this.$callbacks || (this.$callbacks = {}), this.$callbacks[e] || (this.$callbacks[e] = []), this.$callbacks[e].push(t), r && this[e] !== void 0 && t(this[e], void 0), () => Fn(this.$callbacks[e], this.$callbacks[e].indexOf(t));
  }
  decode(e, t = { offset: 0 }, r = this) {
    const n = [], i = this.$changes.root, o = e.length;
    let l = 0;
    for (i.refs.set(l, this); t.offset < o; ) {
      let a = e[t.offset++];
      if (a == Qt) {
        l = Ye(e, t);
        const L = i.refs.get(l);
        if (!L)
          throw new Error(`"refId" not found: ${l}`);
        r = L;
        continue;
      }
      const f = r.$changes, c = r._definition !== void 0, d = c ? a >> 6 << 6 : a;
      if (d === $.CLEAR) {
        r.clear(n);
        continue;
      }
      const h = c ? a % (d || 255) : Ye(e, t), x = c ? r._definition.fieldsByIndex[h] : "";
      let S = f.getType(h), m, b, R;
      if (c ? b = r[`_${x}`] : (b = r.getByIndex(h), (d & $.ADD) === $.ADD ? (R = r instanceof ie ? Qn(e, t) : h, r.setIndex(h, R)) : R = r.getIndex(h)), (d & $.DELETE) === $.DELETE && (d !== $.DELETE_AND_ADD && r.deleteByIndex(h), b && b.$changes && i.removeRef(b.$changes.refId), m = null), x === void 0) {
        console.warn("@colyseus/schema: definition mismatch");
        const L = { offset: t.offset };
        for (; t.offset < o && !(Zn(e, t) && (L.offset = t.offset + 1, i.refs.has(Ye(e, L)))); )
          t.offset++;
        continue;
      } else if (d !== $.DELETE)
        if (H.is(S)) {
          const L = Ye(e, t);
          if (m = i.refs.get(L), d !== $.REPLACE) {
            const k = this.getSchemaType(e, t, S);
            m || (m = this.createTypeInstance(k), m.$changes.refId = L, b && (m.$callbacks = b.$callbacks, b.$changes.refId && L !== b.$changes.refId && i.removeRef(b.$changes.refId))), i.addRef(L, m, m !== b);
          }
        } else if (typeof S == "string")
          m = ea(S, e, t);
        else {
          const L = is(Object.keys(S)[0]), k = Ye(e, t), A = i.refs.has(k) ? b || i.refs.get(k) : new L.constructor();
          if (m = A.clone(!0), m.$changes.refId = k, b && (m.$callbacks = b.$callbacks, b.$changes.refId && k !== b.$changes.refId)) {
            i.removeRef(b.$changes.refId);
            const D = b.entries();
            let I;
            for (; (I = D.next()) && !I.done; ) {
              const [w, E] = I.value;
              n.push({
                refId: k,
                op: $.DELETE,
                field: w,
                value: void 0,
                previousValue: E
              });
            }
          }
          i.addRef(k, m, A !== b);
        }
      if (m != null) {
        if (m.$changes && m.$changes.setParent(f.ref, f.root, h), r instanceof H)
          r[x] = m;
        else if (r instanceof ie) {
          const L = R;
          r.$items.set(L, m), r.$changes.allChanges.add(h);
        } else if (r instanceof pe)
          r.setAt(h, m);
        else if (r instanceof Lt) {
          const L = r.add(m);
          r.setIndex(h, L);
        } else if (r instanceof Dt) {
          const L = r.add(m);
          L !== !1 && r.setIndex(h, L);
        }
      }
      b !== m && n.push({
        refId: l,
        op: d,
        field: x,
        dynamicIndex: R,
        value: m,
        previousValue: b
      });
    }
    return this._triggerChanges(n), i.garbageCollectDeletedRefs(), n;
  }
  encode(e = !1, t = [], r = !1) {
    const n = this.$changes, i = /* @__PURE__ */ new WeakSet(), o = [n];
    let l = 1;
    for (let a = 0; a < l; a++) {
      const f = o[a], c = f.ref, d = c instanceof H;
      f.ensureRefId(), i.add(f), f !== n && (f.changed || e) && (he(t, Qt), ge(t, f.refId));
      const h = e ? Array.from(f.allChanges) : Array.from(f.changes.values());
      for (let x = 0, S = h.length; x < S; x++) {
        const m = e ? { op: $.ADD, index: h[x] } : h[x], b = m.index, R = d ? c._definition.fieldsByIndex && c._definition.fieldsByIndex[b] : b, L = t.length;
        if (m.op !== $.TOUCH)
          if (d)
            he(t, b | m.op);
          else {
            if (he(t, m.op), m.op === $.CLEAR)
              continue;
            ge(t, b);
          }
        if (!d && (m.op & $.ADD) == $.ADD && c instanceof ie) {
          const D = f.ref.$indexes.get(b);
          Zt(t, D);
        }
        if (m.op === $.DELETE)
          continue;
        const k = f.getType(b), A = f.getValue(b);
        if (A && A.$changes && !i.has(A.$changes) && (o.push(A.$changes), A.$changes.ensureRefId(), l++), m.op !== $.TOUCH) {
          if (H.is(k))
            Fr(A, k, c, R), ge(t, A.$changes.refId), (m.op & $.ADD) === $.ADD && this.tryEncodeTypeId(t, k, A.constructor);
          else if (typeof k == "string")
            Zo(k, t, A, c, R);
          else {
            const D = is(Object.keys(k)[0]);
            Fr(c[`_${R}`], D.constructor, c, R), ge(t, A.$changes.refId);
          }
          r && f.cache(b, t.slice(L));
        }
      }
      !e && !r && f.discard();
    }
    return t;
  }
  encodeAll(e) {
    return this.encode(!0, [], e);
  }
  applyFilters(e, t = !1) {
    const r = this, n = /* @__PURE__ */ new Set(), i = Ko.get(e), o = [this.$changes];
    let l = 1, a = [];
    for (let f = 0; f < l; f++) {
      const c = o[f];
      if (n.has(c.refId))
        continue;
      const d = c.ref, h = d instanceof H;
      he(a, Qt), ge(a, c.refId);
      const x = i.refIds.has(c), S = t || !x;
      i.addRefId(c);
      const m = i.containerIndexes.get(c), b = S ? Array.from(c.allChanges) : Array.from(c.changes.values());
      !t && h && d._definition.indexesWithFilters && d._definition.indexesWithFilters.forEach((L) => {
        !m.has(L) && c.allChanges.has(L) && (S ? b.push(L) : b.push({ op: $.ADD, index: L }));
      });
      for (let R = 0, L = b.length; R < L; R++) {
        const k = S ? { op: $.ADD, index: b[R] } : b[R];
        if (k.op === $.CLEAR) {
          he(a, k.op);
          continue;
        }
        const A = k.index;
        if (k.op === $.DELETE) {
          h ? he(a, k.op | A) : (he(a, k.op), ge(a, A));
          continue;
        }
        const D = c.getValue(A), I = c.getType(A);
        if (h) {
          const w = d._definition.filters && d._definition.filters[A];
          if (w && !w.call(d, e, D, r)) {
            D && D.$changes && n.add(D.$changes.refId);
            continue;
          }
        } else {
          const w = c.parent, E = c.getChildrenFilter();
          if (E && !E.call(w, e, d.$indexes.get(A), D, r)) {
            D && D.$changes && n.add(D.$changes.refId);
            continue;
          }
        }
        if (D.$changes && (o.push(D.$changes), l++), k.op !== $.TOUCH)
          if (k.op === $.ADD || h)
            a.push.apply(a, c.caches[A] ?? []), m.add(A);
          else if (m.has(A))
            a.push.apply(a, c.caches[A] ?? []);
          else {
            if (m.add(A), he(a, $.ADD), ge(a, A), d instanceof ie) {
              const w = c.ref.$indexes.get(A);
              Zt(a, w);
            }
            D.$changes ? ge(a, D.$changes.refId) : ht[I](a, D);
          }
        else if (D.$changes && !h) {
          if (he(a, $.ADD), ge(a, A), d instanceof ie) {
            const w = c.ref.$indexes.get(A);
            Zt(a, w);
          }
          ge(a, D.$changes.refId);
        }
      }
    }
    return a;
  }
  clone() {
    const e = new this.constructor(), t = this._definition.schema;
    for (let r in t)
      typeof this[r] == "object" && typeof this[r]?.clone == "function" ? e[r] = this[r].clone() : e[r] = this[r];
    return e;
  }
  toJSON() {
    const e = this._definition.schema, t = this._definition.deprecated, r = {};
    for (let n in e)
      !t[n] && this[n] !== null && typeof this[n] < "u" && (r[n] = typeof this[n].toJSON == "function" ? this[n].toJSON() : this[`_${n}`]);
    return r;
  }
  discardAllChanges() {
    this.$changes.discardAll();
  }
  getByIndex(e) {
    return this[this._definition.fieldsByIndex[e]];
  }
  deleteByIndex(e) {
    this[this._definition.fieldsByIndex[e]] = void 0;
  }
  tryEncodeTypeId(e, t, r) {
    t._typeid !== r._typeid && (he(e, Mr), ge(e, r._typeid));
  }
  getSchemaType(e, t, r) {
    let n;
    return e[t.offset] === Mr && (t.offset++, n = this.constructor._context.get(Ye(e, t))), n || r;
  }
  createTypeInstance(e) {
    let t = new e();
    return t.$changes.root = this.$changes.root, t;
  }
  _triggerChanges(e) {
    const t = /* @__PURE__ */ new Set(), r = this.$changes.root.refs;
    for (let n = 0; n < e.length; n++) {
      const i = e[n], o = i.refId, l = r.get(o), a = l.$callbacks;
      if ((i.op & $.DELETE) === $.DELETE && i.previousValue instanceof H && i.previousValue.$callbacks?.[$.DELETE]?.forEach((f) => f()), !!a) {
        if (l instanceof H) {
          if (!t.has(o))
            try {
              a?.[$.REPLACE]?.forEach((f) => f());
            } catch (f) {
              H.onError(f);
            }
          try {
            a.hasOwnProperty(i.field) && a[i.field]?.forEach((f) => f(i.value, i.previousValue));
          } catch (f) {
            H.onError(f);
          }
        } else
          i.op === $.ADD && i.previousValue === void 0 ? a[$.ADD]?.forEach((f) => f(i.value, i.dynamicIndex ?? i.field)) : i.op === $.DELETE ? i.previousValue !== void 0 && a[$.DELETE]?.forEach((f) => f(i.previousValue, i.dynamicIndex ?? i.field)) : i.op === $.DELETE_AND_ADD && (i.previousValue !== void 0 && a[$.DELETE]?.forEach((f) => f(i.previousValue, i.dynamicIndex ?? i.field)), a[$.ADD]?.forEach((f) => f(i.value, i.dynamicIndex ?? i.field))), i.value !== i.previousValue && a[$.REPLACE]?.forEach((f) => f(i.value, i.dynamicIndex ?? i.field));
        t.add(o);
      }
    }
  }
}
function ta(s) {
  const e = [s.$changes];
  let t = 1;
  const r = {};
  let n = r;
  for (let i = 0; i < t; i++) {
    const o = e[i];
    o.changes.forEach((l) => {
      const a = o.ref, f = l.index, c = a._definition ? a._definition.fieldsByIndex[f] : a.$indexes.get(f);
      n[c] = o.getValue(f);
    });
  }
  return r;
}
function rt(s, e, t, r) {
  var n = arguments.length, i = n < 3 ? e : r === null ? r = Object.getOwnPropertyDescriptor(e, t) : r, o;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function")
    i = Reflect.decorate(s, e, t, r);
  else
    for (var l = s.length - 1; l >= 0; l--)
      (o = s[l]) && (i = (n < 3 ? o(i) : n > 3 ? o(e, t, i) : o(e, t)) || i);
  return n > 3 && i && Object.defineProperty(e, t, i), i;
}
const nt = { context: new gt() };
class Ft extends H {
  name;
  type;
  referencedType;
}
rt([
  W("string", nt)
], Ft.prototype, "name", void 0);
rt([
  W("string", nt)
], Ft.prototype, "type", void 0);
rt([
  W("number", nt)
], Ft.prototype, "referencedType", void 0);
class xs extends H {
  id;
  fields = new pe();
}
rt([
  W("number", nt)
], xs.prototype, "id", void 0);
rt([
  W([Ft], nt)
], xs.prototype, "fields", void 0);
class dt extends H {
  types = new pe();
  rootType;
  static encode(e) {
    const t = e.constructor, r = new dt();
    r.rootType = t._typeid;
    const n = (o, l) => {
      for (let a in l) {
        const f = new Ft();
        f.name = a;
        let c;
        if (typeof l[a] == "string")
          c = l[a];
        else {
          const d = l[a];
          let h;
          H.is(d) ? (c = "ref", h = l[a]) : (c = Object.keys(d)[0], typeof d[c] == "string" ? c += ":" + d[c] : h = d[c]), f.referencedType = h ? h._typeid : -1;
        }
        f.type = c, o.fields.push(f);
      }
      r.types.push(o);
    }, i = t._context?.types;
    for (let o in i) {
      const l = new xs();
      l.id = Number(o), n(l, i[o]._definition.schema);
    }
    return r.encodeAll();
  }
  static decode(e, t) {
    const r = new gt(), n = new dt();
    n.decode(e, t);
    const i = n.types.reduce((a, f) => {
      const c = class extends H {
      }, d = f.id;
      return a[d] = c, r.add(c, d), a;
    }, {});
    n.types.forEach((a) => {
      const f = i[a.id];
      a.fields.forEach((c) => {
        if (c.referencedType !== void 0) {
          let d = c.type, h = i[c.referencedType];
          if (!h) {
            const x = c.type.split(":");
            d = x[0], h = x[1];
          }
          d === "ref" ? W(h, { context: r })(f.prototype, c.name) : W({ [d]: h }, { context: r })(f.prototype, c.name);
        } else
          W(c.type, { context: r })(f.prototype, c.name);
      });
    });
    const o = i[n.rootType], l = new o();
    for (let a in o._definition.schema) {
      const f = o._definition.schema[a];
      typeof f != "string" && (l[a] = typeof f == "function" ? new f() : new (is(Object.keys(f)[0])).constructor());
    }
    return l;
  }
}
rt([
  W([xs], nt)
], dt.prototype, "types", void 0);
rt([
  W("number", nt)
], dt.prototype, "rootType", void 0);
ps("map", { constructor: ie });
ps("array", { constructor: pe });
ps("set", { constructor: Dt });
ps("collection", { constructor: Lt });
var oe = /* @__PURE__ */ ((s) => (s[s.JOIN_ROOM = 10] = "JOIN_ROOM", s[s.ERROR = 11] = "ERROR", s[s.LEAVE_ROOM = 12] = "LEAVE_ROOM", s[s.ROOM_DATA = 13] = "ROOM_DATA", s[s.ROOM_STATE = 14] = "ROOM_STATE", s[s.ROOM_STATE_PATCH = 15] = "ROOM_STATE_PATCH", s[s.ROOM_DATA_SCHEMA = 16] = "ROOM_DATA_SCHEMA", s[s.ROOM_DATA_BYTES = 17] = "ROOM_DATA_BYTES", s[s.WS_CLOSE_NORMAL = 1e3] = "WS_CLOSE_NORMAL", s[s.WS_CLOSE_GOING_AWAY = 1001] = "WS_CLOSE_GOING_AWAY", s[s.WS_CLOSE_CONSENTED = 4e3] = "WS_CLOSE_CONSENTED", s[s.WS_CLOSE_WITH_ERROR = 4002] = "WS_CLOSE_WITH_ERROR", s[s.WS_CLOSE_DEVMODE_RESTART = 4010] = "WS_CLOSE_DEVMODE_RESTART", s[s.WS_SERVER_DISCONNECT = 4201] = "WS_SERVER_DISCONNECT", s[s.WS_TOO_MANY_CLIENTS = 4202] = "WS_TOO_MANY_CLIENTS", s))(oe || {}), Je = /* @__PURE__ */ ((s) => (s[s.MATCHMAKE_NO_HANDLER = 4210] = "MATCHMAKE_NO_HANDLER", s[s.MATCHMAKE_INVALID_CRITERIA = 4211] = "MATCHMAKE_INVALID_CRITERIA", s[s.MATCHMAKE_INVALID_ROOM_ID = 4212] = "MATCHMAKE_INVALID_ROOM_ID", s[s.MATCHMAKE_UNHANDLED = 4213] = "MATCHMAKE_UNHANDLED", s[s.MATCHMAKE_EXPIRED = 4214] = "MATCHMAKE_EXPIRED", s[s.AUTH_FAILED = 4215] = "AUTH_FAILED", s[s.APPLICATION_ERROR = 4216] = "APPLICATION_ERROR", s))(Je || {});
const Wt = {
  10: (s, e, t) => {
    let r = 0;
    const n = Ks(s), i = Ks(e), o = t ? t.length : 0, l = Buffer.allocUnsafe(1 + n + i + o);
    if (l.writeUInt8(10, r++), Br(l, r, s), r += n, Br(l, r, e), r += i, t)
      for (let a = 0, f = t.length; a < f; a++)
        l.writeUInt8(t[a], r++);
    return l;
  },
  11: (s, e = "") => {
    const t = [
      11
      /* ERROR */
    ];
    return ht.number(t, s), ht.string(t, e), t;
  },
  14: (s) => [14, ...s],
  16: (s) => {
    const e = s.constructor._typeid;
    if (e === void 0)
      throw ir.warn("Starting at colyseus >= 0.13 You must provide a type and message when calling `this.broadcast()` or `client.send()`. Please see: https://docs.colyseus.io/migrating/0.13/"), new Error(`an instance of Schema was expected, but ${JSON.stringify(s)} has been provided.`);
    return [16, e, ...s.encodeAll()];
  },
  raw: (s, e, t, r) => {
    const n = [s], i = typeof e;
    if (i === "string")
      ht.string(n, e);
    else if (i === "number")
      ht.number(n, e);
    else
      throw new Error(`Protocol.ROOM_DATA: message type not supported "${e.toString()}"`);
    let o;
    if (t !== void 0) {
      const l = xo(t);
      o = new Uint8Array(n.length + l.byteLength), o.set(new Uint8Array(n), 0), o.set(new Uint8Array(l), n.length);
    } else
      r !== void 0 ? (o = new Uint8Array(n.length + (r.byteLength || r.length)), o.set(new Uint8Array(n), 0), o.set(new Uint8Array(r), n.length)) : o = new Uint8Array(n);
    return o;
  }
};
function Br(s, e, t = "") {
  s[e++] = Ks(t) - 1;
  let r = 0;
  for (let n = 0, i = t.length; n < i; n++)
    r = t.charCodeAt(n), r < 128 ? s[e++] = r : r < 2048 ? (s[e++] = 192 | r >> 6, s[e++] = 128 | r & 63) : r < 55296 || r >= 57344 ? (s[e++] = 224 | r >> 12, s[e++] = 128 | r >> 6 & 63, s[e++] = 128 | r & 63) : (n++, r = 65536 + ((r & 1023) << 10 | t.charCodeAt(n) & 1023), s[e++] = 240 | r >> 18, s[e++] = 128 | r >> 12 & 63, s[e++] = 128 | r >> 6 & 63, s[e++] = 128 | r & 63);
}
function Ks(s = "") {
  let e = 0, t = 0;
  for (let r = 0, n = s.length; r < n; r++)
    e = s.charCodeAt(r), e < 128 ? t += 1 : e < 2048 ? t += 2 : e < 55296 || e >= 57344 ? t += 3 : (r++, t += 4);
  return t + 1;
}
class Me extends Error {
  constructor(e = Je.MATCHMAKE_UNHANDLED, t) {
    super(t), Error.captureStackTrace && Error.captureStackTrace(this, Me), this.name = "ServerError", this.code = e;
  }
}
je("colyseus:connection");
je("colyseus:driver");
const Ur = je("colyseus:errors");
je("colyseus:matchmaking");
const Ht = je("colyseus:message"), mt = je("colyseus:patch");
je("colyseus:presence");
const ct = (s) => {
  const e = s instanceof Error ? s.stack : s;
  s instanceof Me || ir.error(e), Ur.call(Ur, e);
};
var Xs = { exports: {} }, ks = ls;
if (ks.randomFillSync) {
  var jr = {};
  Xs.exports = function(s) {
    var e = jr[s];
    return e || (e = Buffer.allocUnsafe(s), s <= 255 && (jr[s] = e)), ks.randomFillSync(e);
  };
} else
  Xs.exports = ks.randomBytes;
var sa = Xs.exports, Qs = "-_", Yt = 36;
for (; Yt--; )
  Qs += Yt.toString(36), Yt > 9 && (Qs += Yt.toString(36).toUpperCase());
var ra = sa, na = Qs, ia = function(s) {
  s = s || 21;
  for (var e = ra(s), t = ""; s--; )
    t += na[e[s] & 63];
  return t;
};
const oa = /* @__PURE__ */ fs(ia);
Number(process.env.COLYSEUS_PRESENCE_SHORT_TIMEOUT || 2e3);
function aa(s = 9) {
  return oa(s);
}
function ca(s, e) {
  if (e === -1 || e >= s.length)
    return !1;
  const t = s.length - 1;
  for (let r = e; r < t; r++)
    s[r] = s[r + 1];
  return s.length = t, !0;
}
class ti {
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
  then(e) {
    return this.promise.then.apply(this.promise, arguments);
  }
  catch(e) {
    return this.promise.catch(e);
  }
}
_o({
  Class: H,
  type: 0,
  read(s) {
    return s;
  },
  write(s) {
    return s.toJSON();
  }
});
je("colyseus:devmode");
let la = !1, fa;
try {
  fa = require("@colyseus/auth");
} catch {
}
var Zs = { exports: {} }, pt = {
  BINARY_TYPES: ["nodebuffer", "arraybuffer", "fragments"],
  GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
  kStatusCode: Symbol("status-code"),
  kWebSocket: Symbol("websocket"),
  EMPTY_BUFFER: Buffer.alloc(0),
  NOOP: () => {
  }
};
const ha = {}, ua = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ha
}, Symbol.toStringTag, { value: "Module" })), da = /* @__PURE__ */ _n(ua), { EMPTY_BUFFER: ga } = pt;
function Vr(s, e) {
  if (s.length === 0)
    return ga;
  if (s.length === 1)
    return s[0];
  const t = Buffer.allocUnsafe(e);
  let r = 0;
  for (let n = 0; n < s.length; n++) {
    const i = s[n];
    t.set(i, r), r += i.length;
  }
  return r < e ? t.slice(0, r) : t;
}
function Gr(s, e, t, r, n) {
  for (let i = 0; i < n; i++)
    t[r + i] = s[i] ^ e[i & 3];
}
function Wr(s, e) {
  const t = s.length;
  for (let r = 0; r < t; r++)
    s[r] ^= e[r & 3];
}
function Hr(s) {
  return s.byteLength === s.buffer.byteLength ? s.buffer : s.buffer.slice(s.byteOffset, s.byteOffset + s.byteLength);
}
function os(s) {
  if (os.readOnly = !0, Buffer.isBuffer(s))
    return s;
  let e;
  return s instanceof ArrayBuffer ? e = Buffer.from(s) : ArrayBuffer.isView(s) ? e = Buffer.from(s.buffer, s.byteOffset, s.byteLength) : (e = Buffer.from(s), os.readOnly = !1), e;
}
try {
  const s = da, e = s.BufferUtil || s;
  Zs.exports = {
    concat: Vr,
    mask(t, r, n, i, o) {
      o < 48 ? Gr(t, r, n, i, o) : e.mask(t, r, n, i, o);
    },
    toArrayBuffer: Hr,
    toBuffer: os,
    unmask(t, r) {
      t.length < 32 ? Wr(t, r) : e.unmask(t, r);
    }
  };
} catch {
  Zs.exports = {
    concat: Vr,
    mask: Gr,
    toArrayBuffer: Hr,
    toBuffer: os,
    unmask: Wr
  };
}
var ys = Zs.exports;
const Yr = Symbol("kDone"), Ls = Symbol("kRun");
let pa = class {
  /**
   * Creates a new `Limiter`.
   *
   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
   *     to run concurrently
   */
  constructor(e) {
    this[Yr] = () => {
      this.pending--, this[Ls]();
    }, this.concurrency = e || 1 / 0, this.jobs = [], this.pending = 0;
  }
  /**
   * Adds a job to the queue.
   *
   * @param {Function} job The job to run
   * @public
   */
  add(e) {
    this.jobs.push(e), this[Ls]();
  }
  /**
   * Removes a job from the queue and runs it if possible.
   *
   * @private
   */
  [Ls]() {
    if (this.pending !== this.concurrency && this.jobs.length) {
      const e = this.jobs.shift();
      this.pending++, e(this[Yr]);
    }
  }
};
var _a = pa;
const xt = Pi, zr = ys, ma = _a, { kStatusCode: si, NOOP: xa } = pt, ya = Buffer.from([0, 0, 255, 255]), as = Symbol("permessage-deflate"), $e = Symbol("total-length"), wt = Symbol("callback"), Pe = Symbol("buffers"), es = Symbol("error");
let zt, Ea = class {
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
  constructor(e, t, r) {
    if (this._maxPayload = r | 0, this._options = e || {}, this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024, this._isServer = !!t, this._deflate = null, this._inflate = null, this.params = null, !zt) {
      const n = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
      zt = new ma(n);
    }
  }
  /**
   * @type {String}
   */
  static get extensionName() {
    return "permessage-deflate";
  }
  /**
   * Create an extension negotiation offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer() {
    const e = {};
    return this._options.serverNoContextTakeover && (e.server_no_context_takeover = !0), this._options.clientNoContextTakeover && (e.client_no_context_takeover = !0), this._options.serverMaxWindowBits && (e.server_max_window_bits = this._options.serverMaxWindowBits), this._options.clientMaxWindowBits ? e.client_max_window_bits = this._options.clientMaxWindowBits : this._options.clientMaxWindowBits == null && (e.client_max_window_bits = !0), e;
  }
  /**
   * Accept an extension negotiation offer/response.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Object} Accepted configuration
   * @public
   */
  accept(e) {
    return e = this.normalizeParams(e), this.params = this._isServer ? this.acceptAsServer(e) : this.acceptAsClient(e), this.params;
  }
  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup() {
    if (this._inflate && (this._inflate.close(), this._inflate = null), this._deflate) {
      const e = this._deflate[wt];
      this._deflate.close(), this._deflate = null, e && e(
        new Error(
          "The deflate stream was closed while data was being processed"
        )
      );
    }
  }
  /**
   *  Accept an extension negotiation offer.
   *
   * @param {Array} offers The extension negotiation offers
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer(e) {
    const t = this._options, r = e.find((n) => !(t.serverNoContextTakeover === !1 && n.server_no_context_takeover || n.server_max_window_bits && (t.serverMaxWindowBits === !1 || typeof t.serverMaxWindowBits == "number" && t.serverMaxWindowBits > n.server_max_window_bits) || typeof t.clientMaxWindowBits == "number" && !n.client_max_window_bits));
    if (!r)
      throw new Error("None of the extension offers can be accepted");
    return t.serverNoContextTakeover && (r.server_no_context_takeover = !0), t.clientNoContextTakeover && (r.client_no_context_takeover = !0), typeof t.serverMaxWindowBits == "number" && (r.server_max_window_bits = t.serverMaxWindowBits), typeof t.clientMaxWindowBits == "number" ? r.client_max_window_bits = t.clientMaxWindowBits : (r.client_max_window_bits === !0 || t.clientMaxWindowBits === !1) && delete r.client_max_window_bits, r;
  }
  /**
   * Accept the extension negotiation response.
   *
   * @param {Array} response The extension negotiation response
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient(e) {
    const t = e[0];
    if (this._options.clientNoContextTakeover === !1 && t.client_no_context_takeover)
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    if (!t.client_max_window_bits)
      typeof this._options.clientMaxWindowBits == "number" && (t.client_max_window_bits = this._options.clientMaxWindowBits);
    else if (this._options.clientMaxWindowBits === !1 || typeof this._options.clientMaxWindowBits == "number" && t.client_max_window_bits > this._options.clientMaxWindowBits)
      throw new Error(
        'Unexpected or invalid parameter "client_max_window_bits"'
      );
    return t;
  }
  /**
   * Normalize parameters.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Array} The offers/response with normalized parameters
   * @private
   */
  normalizeParams(e) {
    return e.forEach((t) => {
      Object.keys(t).forEach((r) => {
        let n = t[r];
        if (n.length > 1)
          throw new Error(`Parameter "${r}" must have only a single value`);
        if (n = n[0], r === "client_max_window_bits") {
          if (n !== !0) {
            const i = +n;
            if (!Number.isInteger(i) || i < 8 || i > 15)
              throw new TypeError(
                `Invalid value for parameter "${r}": ${n}`
              );
            n = i;
          } else if (!this._isServer)
            throw new TypeError(
              `Invalid value for parameter "${r}": ${n}`
            );
        } else if (r === "server_max_window_bits") {
          const i = +n;
          if (!Number.isInteger(i) || i < 8 || i > 15)
            throw new TypeError(
              `Invalid value for parameter "${r}": ${n}`
            );
          n = i;
        } else if (r === "client_no_context_takeover" || r === "server_no_context_takeover") {
          if (n !== !0)
            throw new TypeError(
              `Invalid value for parameter "${r}": ${n}`
            );
        } else
          throw new Error(`Unknown parameter "${r}"`);
        t[r] = n;
      });
    }), e;
  }
  /**
   * Decompress data. Concurrency limited.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress(e, t, r) {
    zt.add((n) => {
      this._decompress(e, t, (i, o) => {
        n(), r(i, o);
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
  compress(e, t, r) {
    zt.add((n) => {
      this._compress(e, t, (i, o) => {
        n(), r(i, o);
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
  _decompress(e, t, r) {
    const n = this._isServer ? "client" : "server";
    if (!this._inflate) {
      const i = `${n}_max_window_bits`, o = typeof this.params[i] != "number" ? xt.Z_DEFAULT_WINDOWBITS : this.params[i];
      this._inflate = xt.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits: o
      }), this._inflate[as] = this, this._inflate[$e] = 0, this._inflate[Pe] = [], this._inflate.on("error", wa), this._inflate.on("data", ri);
    }
    this._inflate[wt] = r, this._inflate.write(e), t && this._inflate.write(ya), this._inflate.flush(() => {
      const i = this._inflate[es];
      if (i) {
        this._inflate.close(), this._inflate = null, r(i);
        return;
      }
      const o = zr.concat(
        this._inflate[Pe],
        this._inflate[$e]
      );
      this._inflate._readableState.endEmitted ? (this._inflate.close(), this._inflate = null) : (this._inflate[$e] = 0, this._inflate[Pe] = [], t && this.params[`${n}_no_context_takeover`] && this._inflate.reset()), r(null, o);
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
  _compress(e, t, r) {
    const n = this._isServer ? "server" : "client";
    if (!this._deflate) {
      const i = `${n}_max_window_bits`, o = typeof this.params[i] != "number" ? xt.Z_DEFAULT_WINDOWBITS : this.params[i];
      this._deflate = xt.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits: o
      }), this._deflate[$e] = 0, this._deflate[Pe] = [], this._deflate.on("error", xa), this._deflate.on("data", Sa);
    }
    this._deflate[wt] = r, this._deflate.write(e), this._deflate.flush(xt.Z_SYNC_FLUSH, () => {
      if (!this._deflate)
        return;
      let i = zr.concat(
        this._deflate[Pe],
        this._deflate[$e]
      );
      t && (i = i.slice(0, i.length - 4)), this._deflate[wt] = null, this._deflate[$e] = 0, this._deflate[Pe] = [], t && this.params[`${n}_no_context_takeover`] && this._deflate.reset(), r(null, i);
    });
  }
};
var Es = Ea;
function Sa(s) {
  this[Pe].push(s), this[$e] += s.length;
}
function ri(s) {
  if (this[$e] += s.length, this[as]._maxPayload < 1 || this[$e] <= this[as]._maxPayload) {
    this[Pe].push(s);
    return;
  }
  this[es] = new RangeError("Max payload size exceeded"), this[es].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH", this[es][si] = 1009, this.removeListener("data", ri), this.reset();
}
function wa(s) {
  this[as]._inflate = null, s[si] = 1007, this[wt](s);
}
var er = { exports: {} };
const Ca = {}, ba = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ca
}, Symbol.toStringTag, { value: "Module" })), Oa = /* @__PURE__ */ _n(ba);
function qr(s) {
  return s >= 1e3 && s <= 1014 && s !== 1004 && s !== 1005 && s !== 1006 || s >= 3e3 && s <= 4999;
}
function Jr(s) {
  const e = s.length;
  let t = 0;
  for (; t < e; )
    if (!(s[t] & 128))
      t++;
    else if ((s[t] & 224) === 192) {
      if (t + 1 === e || (s[t + 1] & 192) !== 128 || (s[t] & 254) === 192)
        return !1;
      t += 2;
    } else if ((s[t] & 240) === 224) {
      if (t + 2 >= e || (s[t + 1] & 192) !== 128 || (s[t + 2] & 192) !== 128 || s[t] === 224 && (s[t + 1] & 224) === 128 || // Overlong
      s[t] === 237 && (s[t + 1] & 224) === 160)
        return !1;
      t += 3;
    } else if ((s[t] & 248) === 240) {
      if (t + 3 >= e || (s[t + 1] & 192) !== 128 || (s[t + 2] & 192) !== 128 || (s[t + 3] & 192) !== 128 || s[t] === 240 && (s[t + 1] & 240) === 128 || // Overlong
      s[t] === 244 && s[t + 1] > 143 || s[t] > 244)
        return !1;
      t += 4;
    } else
      return !1;
  return !0;
}
try {
  let s = Oa;
  typeof s == "object" && (s = s.Validation.isValidUTF8), er.exports = {
    isValidStatusCode: qr,
    isValidUTF8(e) {
      return e.length < 150 ? Jr(e) : s(e);
    }
  };
} catch {
  er.exports = {
    isValidStatusCode: qr,
    isValidUTF8: Jr
  };
}
var ni = er.exports;
const { Writable: Ta } = pn, Kr = Es, {
  BINARY_TYPES: va,
  EMPTY_BUFFER: Aa,
  kStatusCode: $a,
  kWebSocket: Ia
} = pt, { concat: Ds, toArrayBuffer: Ra, unmask: ka } = ys, { isValidStatusCode: La, isValidUTF8: Xr } = ni, yt = 0, Qr = 1, Zr = 2, en = 3, Ns = 4, Da = 5;
let Na = class extends Ta {
  /**
   * Creates a Receiver instance.
   *
   * @param {String} [binaryType=nodebuffer] The type for binary data
   * @param {Object} [extensions] An object containing the negotiated extensions
   * @param {Boolean} [isServer=false] Specifies whether to operate in client or
   *     server mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(e, t, r, n) {
    super(), this._binaryType = e || va[0], this[Ia] = void 0, this._extensions = t || {}, this._isServer = !!r, this._maxPayload = n | 0, this._bufferedBytes = 0, this._buffers = [], this._compressed = !1, this._payloadLength = 0, this._mask = void 0, this._fragmented = 0, this._masked = !1, this._fin = !1, this._opcode = 0, this._totalPayloadLength = 0, this._messageLength = 0, this._fragments = [], this._state = yt, this._loop = !1;
  }
  /**
   * Implements `Writable.prototype._write()`.
   *
   * @param {Buffer} chunk The chunk of data to write
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} cb Callback
   * @private
   */
  _write(e, t, r) {
    if (this._opcode === 8 && this._state == yt)
      return r();
    this._bufferedBytes += e.length, this._buffers.push(e), this.startLoop(r);
  }
  /**
   * Consumes `n` bytes from the buffered data.
   *
   * @param {Number} n The number of bytes to consume
   * @return {Buffer} The consumed bytes
   * @private
   */
  consume(e) {
    if (this._bufferedBytes -= e, e === this._buffers[0].length)
      return this._buffers.shift();
    if (e < this._buffers[0].length) {
      const r = this._buffers[0];
      return this._buffers[0] = r.slice(e), r.slice(0, e);
    }
    const t = Buffer.allocUnsafe(e);
    do {
      const r = this._buffers[0], n = t.length - e;
      e >= r.length ? t.set(this._buffers.shift(), n) : (t.set(new Uint8Array(r.buffer, r.byteOffset, e), n), this._buffers[0] = r.slice(e)), e -= r.length;
    } while (e > 0);
    return t;
  }
  /**
   * Starts the parsing loop.
   *
   * @param {Function} cb Callback
   * @private
   */
  startLoop(e) {
    let t;
    this._loop = !0;
    do
      switch (this._state) {
        case yt:
          t = this.getInfo();
          break;
        case Qr:
          t = this.getPayloadLength16();
          break;
        case Zr:
          t = this.getPayloadLength64();
          break;
        case en:
          this.getMask();
          break;
        case Ns:
          t = this.getData(e);
          break;
        default:
          this._loop = !1;
          return;
      }
    while (this._loop);
    e(t);
  }
  /**
   * Reads the first two bytes of a frame.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getInfo() {
    if (this._bufferedBytes < 2) {
      this._loop = !1;
      return;
    }
    const e = this.consume(2);
    if (e[0] & 48)
      return this._loop = !1, Z(
        RangeError,
        "RSV2 and RSV3 must be clear",
        !0,
        1002,
        "WS_ERR_UNEXPECTED_RSV_2_3"
      );
    const t = (e[0] & 64) === 64;
    if (t && !this._extensions[Kr.extensionName])
      return this._loop = !1, Z(
        RangeError,
        "RSV1 must be clear",
        !0,
        1002,
        "WS_ERR_UNEXPECTED_RSV_1"
      );
    if (this._fin = (e[0] & 128) === 128, this._opcode = e[0] & 15, this._payloadLength = e[1] & 127, this._opcode === 0) {
      if (t)
        return this._loop = !1, Z(
          RangeError,
          "RSV1 must be clear",
          !0,
          1002,
          "WS_ERR_UNEXPECTED_RSV_1"
        );
      if (!this._fragmented)
        return this._loop = !1, Z(
          RangeError,
          "invalid opcode 0",
          !0,
          1002,
          "WS_ERR_INVALID_OPCODE"
        );
      this._opcode = this._fragmented;
    } else if (this._opcode === 1 || this._opcode === 2) {
      if (this._fragmented)
        return this._loop = !1, Z(
          RangeError,
          `invalid opcode ${this._opcode}`,
          !0,
          1002,
          "WS_ERR_INVALID_OPCODE"
        );
      this._compressed = t;
    } else if (this._opcode > 7 && this._opcode < 11) {
      if (!this._fin)
        return this._loop = !1, Z(
          RangeError,
          "FIN must be set",
          !0,
          1002,
          "WS_ERR_EXPECTED_FIN"
        );
      if (t)
        return this._loop = !1, Z(
          RangeError,
          "RSV1 must be clear",
          !0,
          1002,
          "WS_ERR_UNEXPECTED_RSV_1"
        );
      if (this._payloadLength > 125)
        return this._loop = !1, Z(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          !0,
          1002,
          "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
        );
    } else
      return this._loop = !1, Z(
        RangeError,
        `invalid opcode ${this._opcode}`,
        !0,
        1002,
        "WS_ERR_INVALID_OPCODE"
      );
    if (!this._fin && !this._fragmented && (this._fragmented = this._opcode), this._masked = (e[1] & 128) === 128, this._isServer) {
      if (!this._masked)
        return this._loop = !1, Z(
          RangeError,
          "MASK must be set",
          !0,
          1002,
          "WS_ERR_EXPECTED_MASK"
        );
    } else if (this._masked)
      return this._loop = !1, Z(
        RangeError,
        "MASK must be clear",
        !0,
        1002,
        "WS_ERR_UNEXPECTED_MASK"
      );
    if (this._payloadLength === 126)
      this._state = Qr;
    else if (this._payloadLength === 127)
      this._state = Zr;
    else
      return this.haveLength();
  }
  /**
   * Gets extended payload length (7+16).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength16() {
    if (this._bufferedBytes < 2) {
      this._loop = !1;
      return;
    }
    return this._payloadLength = this.consume(2).readUInt16BE(0), this.haveLength();
  }
  /**
   * Gets extended payload length (7+64).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength64() {
    if (this._bufferedBytes < 8) {
      this._loop = !1;
      return;
    }
    const e = this.consume(8), t = e.readUInt32BE(0);
    return t > Math.pow(2, 21) - 1 ? (this._loop = !1, Z(
      RangeError,
      "Unsupported WebSocket frame: payload length > 2^53 - 1",
      !1,
      1009,
      "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
    )) : (this._payloadLength = t * Math.pow(2, 32) + e.readUInt32BE(4), this.haveLength());
  }
  /**
   * Payload length has been read.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  haveLength() {
    if (this._payloadLength && this._opcode < 8 && (this._totalPayloadLength += this._payloadLength, this._totalPayloadLength > this._maxPayload && this._maxPayload > 0))
      return this._loop = !1, Z(
        RangeError,
        "Max payload size exceeded",
        !1,
        1009,
        "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
      );
    this._masked ? this._state = en : this._state = Ns;
  }
  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = !1;
      return;
    }
    this._mask = this.consume(4), this._state = Ns;
  }
  /**
   * Reads data bytes.
   *
   * @param {Function} cb Callback
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  getData(e) {
    let t = Aa;
    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = !1;
        return;
      }
      t = this.consume(this._payloadLength), this._masked && ka(t, this._mask);
    }
    if (this._opcode > 7)
      return this.controlMessage(t);
    if (this._compressed) {
      this._state = Da, this.decompress(t, e);
      return;
    }
    return t.length && (this._messageLength = this._totalPayloadLength, this._fragments.push(t)), this.dataMessage();
  }
  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @param {Function} cb Callback
   * @private
   */
  decompress(e, t) {
    this._extensions[Kr.extensionName].decompress(e, this._fin, (n, i) => {
      if (n)
        return t(n);
      if (i.length) {
        if (this._messageLength += i.length, this._messageLength > this._maxPayload && this._maxPayload > 0)
          return t(
            Z(
              RangeError,
              "Max payload size exceeded",
              !1,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            )
          );
        this._fragments.push(i);
      }
      const o = this.dataMessage();
      if (o)
        return t(o);
      this.startLoop(t);
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
      const e = this._messageLength, t = this._fragments;
      if (this._totalPayloadLength = 0, this._messageLength = 0, this._fragmented = 0, this._fragments = [], this._opcode === 2) {
        let r;
        this._binaryType === "nodebuffer" ? r = Ds(t, e) : this._binaryType === "arraybuffer" ? r = Ra(Ds(t, e)) : r = t, this.emit("message", r);
      } else {
        const r = Ds(t, e);
        if (!Xr(r))
          return this._loop = !1, Z(
            Error,
            "invalid UTF-8 sequence",
            !0,
            1007,
            "WS_ERR_INVALID_UTF8"
          );
        this.emit("message", r.toString());
      }
    }
    this._state = yt;
  }
  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  controlMessage(e) {
    if (this._opcode === 8)
      if (this._loop = !1, e.length === 0)
        this.emit("conclude", 1005, ""), this.end();
      else {
        if (e.length === 1)
          return Z(
            RangeError,
            "invalid payload length 1",
            !0,
            1002,
            "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
          );
        {
          const t = e.readUInt16BE(0);
          if (!La(t))
            return Z(
              RangeError,
              `invalid status code ${t}`,
              !0,
              1002,
              "WS_ERR_INVALID_CLOSE_CODE"
            );
          const r = e.slice(2);
          if (!Xr(r))
            return Z(
              Error,
              "invalid UTF-8 sequence",
              !0,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
          this.emit("conclude", t, r.toString()), this.end();
        }
      }
    else
      this._opcode === 9 ? this.emit("ping", e) : this.emit("pong", e);
    this._state = yt;
  }
};
var ii = Na;
function Z(s, e, t, r, n) {
  const i = new s(
    t ? `Invalid WebSocket frame: ${e}` : e
  );
  return Error.captureStackTrace(i, Z), i.code = n, i[$a] = r, i;
}
const { randomFillSync: Pa } = ls, tn = Es, { EMPTY_BUFFER: Ma } = pt, { isValidStatusCode: Fa } = ni, { mask: sn, toBuffer: ve } = ys, We = Buffer.alloc(4);
let Ba = class ze {
  /**
   * Creates a Sender instance.
   *
   * @param {(net.Socket|tls.Socket)} socket The connection socket
   * @param {Object} [extensions] An object containing the negotiated extensions
   */
  constructor(e, t) {
    this._extensions = t || {}, this._socket = e, this._firstFragment = !0, this._compress = !1, this._bufferedBytes = 0, this._deflating = !1, this._queue = [];
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
  static frame(e, t) {
    const r = t.mask && t.readOnly;
    let n = t.mask ? 6 : 2, i = e.length;
    e.length >= 65536 ? (n += 8, i = 127) : e.length > 125 && (n += 2, i = 126);
    const o = Buffer.allocUnsafe(r ? e.length + n : n);
    return o[0] = t.fin ? t.opcode | 128 : t.opcode, t.rsv1 && (o[0] |= 64), o[1] = i, i === 126 ? o.writeUInt16BE(e.length, 2) : i === 127 && (o.writeUInt32BE(0, 2), o.writeUInt32BE(e.length, 6)), t.mask ? (Pa(We, 0, 4), o[1] |= 128, o[n - 4] = We[0], o[n - 3] = We[1], o[n - 2] = We[2], o[n - 1] = We[3], r ? (sn(e, We, o, n, e.length), [o]) : (sn(e, We, e, 0, e.length), [o, e])) : [o, e];
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
  close(e, t, r, n) {
    let i;
    if (e === void 0)
      i = Ma;
    else {
      if (typeof e != "number" || !Fa(e))
        throw new TypeError("First argument must be a valid error code number");
      if (t === void 0 || t === "")
        i = Buffer.allocUnsafe(2), i.writeUInt16BE(e, 0);
      else {
        const o = Buffer.byteLength(t);
        if (o > 123)
          throw new RangeError("The message must not be greater than 123 bytes");
        i = Buffer.allocUnsafe(2 + o), i.writeUInt16BE(e, 0), i.write(t, 2);
      }
    }
    this._deflating ? this.enqueue([this.doClose, i, r, n]) : this.doClose(i, r, n);
  }
  /**
   * Frames and sends a close message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @private
   */
  doClose(e, t, r) {
    this.sendFrame(
      ze.frame(e, {
        fin: !0,
        rsv1: !1,
        opcode: 8,
        mask: t,
        readOnly: !1
      }),
      r
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
  ping(e, t, r) {
    const n = ve(e);
    if (n.length > 125)
      throw new RangeError("The data size must not be greater than 125 bytes");
    this._deflating ? this.enqueue([this.doPing, n, t, ve.readOnly, r]) : this.doPing(n, t, ve.readOnly, r);
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
  doPing(e, t, r, n) {
    this.sendFrame(
      ze.frame(e, {
        fin: !0,
        rsv1: !1,
        opcode: 9,
        mask: t,
        readOnly: r
      }),
      n
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
  pong(e, t, r) {
    const n = ve(e);
    if (n.length > 125)
      throw new RangeError("The data size must not be greater than 125 bytes");
    this._deflating ? this.enqueue([this.doPong, n, t, ve.readOnly, r]) : this.doPong(n, t, ve.readOnly, r);
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
  doPong(e, t, r, n) {
    this.sendFrame(
      ze.frame(e, {
        fin: !0,
        rsv1: !1,
        opcode: 10,
        mask: t,
        readOnly: r
      }),
      n
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
  send(e, t, r) {
    const n = ve(e), i = this._extensions[tn.extensionName];
    let o = t.binary ? 2 : 1, l = t.compress;
    if (this._firstFragment ? (this._firstFragment = !1, l && i && (l = n.length >= i._threshold), this._compress = l) : (l = !1, o = 0), t.fin && (this._firstFragment = !0), i) {
      const a = {
        fin: t.fin,
        rsv1: l,
        opcode: o,
        mask: t.mask,
        readOnly: ve.readOnly
      };
      this._deflating ? this.enqueue([this.dispatch, n, this._compress, a, r]) : this.dispatch(n, this._compress, a, r);
    } else
      this.sendFrame(
        ze.frame(n, {
          fin: t.fin,
          rsv1: !1,
          opcode: o,
          mask: t.mask,
          readOnly: ve.readOnly
        }),
        r
      );
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
  dispatch(e, t, r, n) {
    if (!t) {
      this.sendFrame(ze.frame(e, r), n);
      return;
    }
    const i = this._extensions[tn.extensionName];
    this._bufferedBytes += e.length, this._deflating = !0, i.compress(e, r.fin, (o, l) => {
      if (this._socket.destroyed) {
        const a = new Error(
          "The socket was closed while data was being compressed"
        );
        typeof n == "function" && n(a);
        for (let f = 0; f < this._queue.length; f++) {
          const c = this._queue[f][4];
          typeof c == "function" && c(a);
        }
        return;
      }
      this._bufferedBytes -= e.length, this._deflating = !1, r.readOnly = !1, this.sendFrame(ze.frame(l, r), n), this.dequeue();
    });
  }
  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue() {
    for (; !this._deflating && this._queue.length; ) {
      const e = this._queue.shift();
      this._bufferedBytes -= e[1].length, Reflect.apply(e[0], this, e.slice(1));
    }
  }
  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue(e) {
    this._bufferedBytes += e[1].length, this._queue.push(e);
  }
  /**
   * Sends a frame.
   *
   * @param {Buffer[]} list The frame to send
   * @param {Function} [cb] Callback
   * @private
   */
  sendFrame(e, t) {
    e.length === 2 ? (this._socket.cork(), this._socket.write(e[0]), this._socket.write(e[1], t), this._socket.uncork()) : this._socket.write(e[0], t);
  }
};
var oi = Ba;
class Ss {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @param {Object} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(e, t) {
    this.target = t, this.type = e;
  }
}
class Ua extends Ss {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {(String|Buffer|ArrayBuffer|Buffer[])} data The received data
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(e, t) {
    super("message", t), this.data = e;
  }
}
class ja extends Ss {
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
  constructor(e, t, r) {
    super("close", r), this.wasClean = r._closeFrameReceived && r._closeFrameSent, this.reason = t, this.code = e;
  }
}
class Va extends Ss {
  /**
   * Create a new `OpenEvent`.
   *
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(e) {
    super("open", e);
  }
}
class Ga extends Ss {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param {Object} error The error that generated this event
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(e, t) {
    super("error", t), this.message = e.message, this.error = e;
  }
}
const Wa = {
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
  addEventListener(s, e, t) {
    if (typeof e != "function")
      return;
    function r(a) {
      e.call(this, new Ua(a, this));
    }
    function n(a, f) {
      e.call(this, new ja(a, f, this));
    }
    function i(a) {
      e.call(this, new Ga(a, this));
    }
    function o() {
      e.call(this, new Va(this));
    }
    const l = t && t.once ? "once" : "on";
    s === "message" ? (r._listener = e, this[l](s, r)) : s === "close" ? (n._listener = e, this[l](s, n)) : s === "error" ? (i._listener = e, this[l](s, i)) : s === "open" ? (o._listener = e, this[l](s, o)) : this[l](s, e);
  },
  /**
   * Remove an event listener.
   *
   * @param {String} type A string representing the event type to remove
   * @param {Function} listener The listener to remove
   * @public
   */
  removeEventListener(s, e) {
    const t = this.listeners(s);
    for (let r = 0; r < t.length; r++)
      (t[r] === e || t[r]._listener === e) && this.removeListener(s, t[r]);
  }
};
var Ha = Wa;
const Et = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  // 0 - 15
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  // 16 - 31
  0,
  1,
  0,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  1,
  1,
  0,
  1,
  1,
  0,
  // 32 - 47
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  // 48 - 63
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  // 64 - 79
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  1,
  1,
  // 80 - 95
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  // 96 - 111
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  1,
  0,
  1,
  0
  // 112 - 127
];
function Oe(s, e, t) {
  s[e] === void 0 ? s[e] = [t] : s[e].push(t);
}
function Ya(s) {
  const e = /* @__PURE__ */ Object.create(null);
  if (s === void 0 || s === "")
    return e;
  let t = /* @__PURE__ */ Object.create(null), r = !1, n = !1, i = !1, o, l, a = -1, f = -1, c = 0;
  for (; c < s.length; c++) {
    const h = s.charCodeAt(c);
    if (o === void 0)
      if (f === -1 && Et[h] === 1)
        a === -1 && (a = c);
      else if (h === 32 || h === 9)
        f === -1 && a !== -1 && (f = c);
      else if (h === 59 || h === 44) {
        if (a === -1)
          throw new SyntaxError(`Unexpected character at index ${c}`);
        f === -1 && (f = c);
        const x = s.slice(a, f);
        h === 44 ? (Oe(e, x, t), t = /* @__PURE__ */ Object.create(null)) : o = x, a = f = -1;
      } else
        throw new SyntaxError(`Unexpected character at index ${c}`);
    else if (l === void 0)
      if (f === -1 && Et[h] === 1)
        a === -1 && (a = c);
      else if (h === 32 || h === 9)
        f === -1 && a !== -1 && (f = c);
      else if (h === 59 || h === 44) {
        if (a === -1)
          throw new SyntaxError(`Unexpected character at index ${c}`);
        f === -1 && (f = c), Oe(t, s.slice(a, f), !0), h === 44 && (Oe(e, o, t), t = /* @__PURE__ */ Object.create(null), o = void 0), a = f = -1;
      } else if (h === 61 && a !== -1 && f === -1)
        l = s.slice(a, c), a = f = -1;
      else
        throw new SyntaxError(`Unexpected character at index ${c}`);
    else if (n) {
      if (Et[h] !== 1)
        throw new SyntaxError(`Unexpected character at index ${c}`);
      a === -1 ? a = c : r || (r = !0), n = !1;
    } else if (i)
      if (Et[h] === 1)
        a === -1 && (a = c);
      else if (h === 34 && a !== -1)
        i = !1, f = c;
      else if (h === 92)
        n = !0;
      else
        throw new SyntaxError(`Unexpected character at index ${c}`);
    else if (h === 34 && s.charCodeAt(c - 1) === 61)
      i = !0;
    else if (f === -1 && Et[h] === 1)
      a === -1 && (a = c);
    else if (a !== -1 && (h === 32 || h === 9))
      f === -1 && (f = c);
    else if (h === 59 || h === 44) {
      if (a === -1)
        throw new SyntaxError(`Unexpected character at index ${c}`);
      f === -1 && (f = c);
      let x = s.slice(a, f);
      r && (x = x.replace(/\\/g, ""), r = !1), Oe(t, l, x), h === 44 && (Oe(e, o, t), t = /* @__PURE__ */ Object.create(null), o = void 0), l = void 0, a = f = -1;
    } else
      throw new SyntaxError(`Unexpected character at index ${c}`);
  }
  if (a === -1 || i)
    throw new SyntaxError("Unexpected end of input");
  f === -1 && (f = c);
  const d = s.slice(a, f);
  return o === void 0 ? Oe(e, d, t) : (l === void 0 ? Oe(t, d, !0) : r ? Oe(t, l, d.replace(/\\/g, "")) : Oe(t, l, d), Oe(e, o, t)), e;
}
function za(s) {
  return Object.keys(s).map((e) => {
    let t = s[e];
    return Array.isArray(t) || (t = [t]), t.map((r) => [e].concat(
      Object.keys(r).map((n) => {
        let i = r[n];
        return Array.isArray(i) || (i = [i]), i.map((o) => o === !0 ? n : `${n}=${o}`).join("; ");
      })
    ).join("; ")).join(", ");
  }).join(", ");
}
var ai = { format: za, parse: Ya };
const qa = dn, Ja = ki, Ka = gn, ci = Li, Xa = Di, { randomBytes: Qa, createHash: Za } = ls, { URL: Ps } = Ni, Fe = Es, ec = ii, tc = oi, {
  BINARY_TYPES: rn,
  EMPTY_BUFFER: Ms,
  GUID: sc,
  kStatusCode: rc,
  kWebSocket: ce,
  NOOP: li
} = pt, { addEventListener: nc, removeEventListener: ic } = Ha, { format: oc, parse: ac } = ai, { toBuffer: cc } = ys, ke = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"], Fs = [8, 13], lc = 30 * 1e3;
let te = class re extends qa {
  /**
   * Create a new `WebSocket`.
   *
   * @param {(String|URL)} address The URL to which to connect
   * @param {(String|String[])} [protocols] The subprotocols
   * @param {Object} [options] Connection options
   */
  constructor(e, t, r) {
    super(), this._binaryType = rn[0], this._closeCode = 1006, this._closeFrameReceived = !1, this._closeFrameSent = !1, this._closeMessage = "", this._closeTimer = null, this._extensions = {}, this._protocol = "", this._readyState = re.CONNECTING, this._receiver = null, this._sender = null, this._socket = null, e !== null ? (this._bufferedAmount = 0, this._isServer = !1, this._redirects = 0, Array.isArray(t) ? t = t.join(", ") : typeof t == "object" && t !== null && (r = t, t = void 0), hi(this, e, t, r)) : this._isServer = !0;
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
  set binaryType(e) {
    rn.includes(e) && (this._binaryType = e, this._receiver && (this._receiver._binaryType = e));
  }
  /**
   * @type {Number}
   */
  get bufferedAmount() {
    return this._socket ? this._socket._writableState.length + this._sender._bufferedBytes : this._bufferedAmount;
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
  }
  /* istanbul ignore next */
  set onclose(e) {
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onerror() {
  }
  /* istanbul ignore next */
  set onerror(e) {
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onopen() {
  }
  /* istanbul ignore next */
  set onopen(e) {
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onmessage() {
  }
  /* istanbul ignore next */
  set onmessage(e) {
  }
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
  setSocket(e, t, r) {
    const n = new ec(
      this.binaryType,
      this._extensions,
      this._isServer,
      r
    );
    this._sender = new tc(e, this._extensions), this._receiver = n, this._socket = e, n[ce] = this, e[ce] = this, n.on("conclude", uc), n.on("drain", dc), n.on("error", gc), n.on("message", pc), n.on("ping", _c), n.on("pong", mc), e.setTimeout(0), e.setNoDelay(), t.length > 0 && e.unshift(t), e.on("close", di), e.on("data", ws), e.on("end", gi), e.on("error", pi), this._readyState = re.OPEN, this.emit("open");
  }
  /**
   * Emit the `'close'` event.
   *
   * @private
   */
  emitClose() {
    if (!this._socket) {
      this._readyState = re.CLOSED, this.emit("close", this._closeCode, this._closeMessage);
      return;
    }
    this._extensions[Fe.extensionName] && this._extensions[Fe.extensionName].cleanup(), this._receiver.removeAllListeners(), this._readyState = re.CLOSED, this.emit("close", this._closeCode, this._closeMessage);
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
  close(e, t) {
    if (this.readyState !== re.CLOSED) {
      if (this.readyState === re.CONNECTING)
        return me(this, this._req, "WebSocket was closed before the connection was established");
      if (this.readyState === re.CLOSING) {
        this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted) && this._socket.end();
        return;
      }
      this._readyState = re.CLOSING, this._sender.close(e, t, !this._isServer, (r) => {
        r || (this._closeFrameSent = !0, (this._closeFrameReceived || this._receiver._writableState.errorEmitted) && this._socket.end());
      }), this._closeTimer = setTimeout(
        this._socket.destroy.bind(this._socket),
        lc
      );
    }
  }
  /**
   * Send a ping.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the ping is sent
   * @public
   */
  ping(e, t, r) {
    if (this.readyState === re.CONNECTING)
      throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
    if (typeof e == "function" ? (r = e, e = t = void 0) : typeof t == "function" && (r = t, t = void 0), typeof e == "number" && (e = e.toString()), this.readyState !== re.OPEN) {
      Us(this, e, r);
      return;
    }
    t === void 0 && (t = !this._isServer), this._sender.ping(e || Ms, t, r);
  }
  /**
   * Send a pong.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the pong is sent
   * @public
   */
  pong(e, t, r) {
    if (this.readyState === re.CONNECTING)
      throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
    if (typeof e == "function" ? (r = e, e = t = void 0) : typeof t == "function" && (r = t, t = void 0), typeof e == "number" && (e = e.toString()), this.readyState !== re.OPEN) {
      Us(this, e, r);
      return;
    }
    t === void 0 && (t = !this._isServer), this._sender.pong(e || Ms, t, r);
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
  send(e, t, r) {
    if (this.readyState === re.CONNECTING)
      throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
    if (typeof t == "function" && (r = t, t = {}), typeof e == "number" && (e = e.toString()), this.readyState !== re.OPEN) {
      Us(this, e, r);
      return;
    }
    const n = {
      binary: typeof e != "string",
      mask: !this._isServer,
      compress: !0,
      fin: !0,
      ...t
    };
    this._extensions[Fe.extensionName] || (n.compress = !1), this._sender.send(e || Ms, n, r);
  }
  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate() {
    if (this.readyState !== re.CLOSED) {
      if (this.readyState === re.CONNECTING)
        return me(this, this._req, "WebSocket was closed before the connection was established");
      this._socket && (this._readyState = re.CLOSING, this._socket.destroy());
    }
  }
};
Object.defineProperty(te, "CONNECTING", {
  enumerable: !0,
  value: ke.indexOf("CONNECTING")
});
Object.defineProperty(te.prototype, "CONNECTING", {
  enumerable: !0,
  value: ke.indexOf("CONNECTING")
});
Object.defineProperty(te, "OPEN", {
  enumerable: !0,
  value: ke.indexOf("OPEN")
});
Object.defineProperty(te.prototype, "OPEN", {
  enumerable: !0,
  value: ke.indexOf("OPEN")
});
Object.defineProperty(te, "CLOSING", {
  enumerable: !0,
  value: ke.indexOf("CLOSING")
});
Object.defineProperty(te.prototype, "CLOSING", {
  enumerable: !0,
  value: ke.indexOf("CLOSING")
});
Object.defineProperty(te, "CLOSED", {
  enumerable: !0,
  value: ke.indexOf("CLOSED")
});
Object.defineProperty(te.prototype, "CLOSED", {
  enumerable: !0,
  value: ke.indexOf("CLOSED")
});
[
  "binaryType",
  "bufferedAmount",
  "extensions",
  "protocol",
  "readyState",
  "url"
].forEach((s) => {
  Object.defineProperty(te.prototype, s, { enumerable: !0 });
});
["open", "error", "close", "message"].forEach((s) => {
  Object.defineProperty(te.prototype, `on${s}`, {
    enumerable: !0,
    get() {
      const e = this.listeners(s);
      for (let t = 0; t < e.length; t++)
        if (e[t]._listener)
          return e[t]._listener;
    },
    set(e) {
      const t = this.listeners(s);
      for (let r = 0; r < t.length; r++)
        t[r]._listener && this.removeListener(s, t[r]);
      this.addEventListener(s, e);
    }
  });
});
te.prototype.addEventListener = nc;
te.prototype.removeEventListener = ic;
var fi = te;
function hi(s, e, t, r) {
  const n = {
    protocolVersion: Fs[1],
    maxPayload: 104857600,
    perMessageDeflate: !0,
    followRedirects: !1,
    maxRedirects: 10,
    ...r,
    createConnection: void 0,
    socketPath: void 0,
    hostname: void 0,
    protocol: void 0,
    timeout: void 0,
    method: void 0,
    host: void 0,
    path: void 0,
    port: void 0
  };
  if (!Fs.includes(n.protocolVersion))
    throw new RangeError(
      `Unsupported protocol version: ${n.protocolVersion} (supported versions: ${Fs.join(", ")})`
    );
  let i;
  e instanceof Ps ? (i = e, s._url = e.href) : (i = new Ps(e), s._url = e);
  const o = i.protocol === "ws+unix:";
  if (!i.host && (!o || !i.pathname)) {
    const x = new Error(`Invalid URL: ${s.url}`);
    if (s._redirects === 0)
      throw x;
    Bs(s, x);
    return;
  }
  const l = i.protocol === "wss:" || i.protocol === "https:", a = l ? 443 : 80, f = Qa(16).toString("base64"), c = l ? Ja.get : Ka.get;
  let d;
  if (n.createConnection = l ? hc : fc, n.defaultPort = n.defaultPort || a, n.port = i.port || a, n.host = i.hostname.startsWith("[") ? i.hostname.slice(1, -1) : i.hostname, n.headers = {
    "Sec-WebSocket-Version": n.protocolVersion,
    "Sec-WebSocket-Key": f,
    Connection: "Upgrade",
    Upgrade: "websocket",
    ...n.headers
  }, n.path = i.pathname + i.search, n.timeout = n.handshakeTimeout, n.perMessageDeflate && (d = new Fe(
    n.perMessageDeflate !== !0 ? n.perMessageDeflate : {},
    !1,
    n.maxPayload
  ), n.headers["Sec-WebSocket-Extensions"] = oc({
    [Fe.extensionName]: d.offer()
  })), t && (n.headers["Sec-WebSocket-Protocol"] = t), n.origin && (n.protocolVersion < 13 ? n.headers["Sec-WebSocket-Origin"] = n.origin : n.headers.Origin = n.origin), (i.username || i.password) && (n.auth = `${i.username}:${i.password}`), o) {
    const x = n.path.split(":");
    n.socketPath = x[0], n.path = x[1];
  }
  if (n.followRedirects) {
    if (s._redirects === 0) {
      s._originalUnixSocket = o, s._originalSecure = l, s._originalHostOrSocketPath = o ? n.socketPath : i.host;
      const x = r && r.headers;
      if (r = { ...r, headers: {} }, x)
        for (const [S, m] of Object.entries(x))
          r.headers[S.toLowerCase()] = m;
    } else {
      const x = o ? s._originalUnixSocket ? n.socketPath === s._originalHostOrSocketPath : !1 : s._originalUnixSocket ? !1 : i.host === s._originalHostOrSocketPath;
      (!x || s._originalSecure && !l) && (delete n.headers.authorization, delete n.headers.cookie, x || delete n.headers.host, n.auth = void 0);
    }
    n.auth && !r.headers.authorization && (r.headers.authorization = "Basic " + Buffer.from(n.auth).toString("base64"));
  }
  let h = s._req = c(n);
  n.timeout && h.on("timeout", () => {
    me(s, h, "Opening handshake has timed out");
  }), h.on("error", (x) => {
    h === null || h.aborted || (h = s._req = null, Bs(s, x));
  }), h.on("response", (x) => {
    const S = x.headers.location, m = x.statusCode;
    if (S && n.followRedirects && m >= 300 && m < 400) {
      if (++s._redirects > n.maxRedirects) {
        me(s, h, "Maximum redirects exceeded");
        return;
      }
      h.abort();
      let b;
      try {
        b = new Ps(S, e);
      } catch (R) {
        Bs(s, R);
        return;
      }
      hi(s, b, t, r);
    } else
      s.emit("unexpected-response", h, x) || me(
        s,
        h,
        `Unexpected server response: ${x.statusCode}`
      );
  }), h.on("upgrade", (x, S, m) => {
    if (s.emit("upgrade", x), s.readyState !== te.CONNECTING)
      return;
    if (h = s._req = null, x.headers.upgrade.toLowerCase() !== "websocket") {
      me(s, S, "Invalid Upgrade header");
      return;
    }
    const b = Za("sha1").update(f + sc).digest("base64");
    if (x.headers["sec-websocket-accept"] !== b) {
      me(s, S, "Invalid Sec-WebSocket-Accept header");
      return;
    }
    const R = x.headers["sec-websocket-protocol"], L = (t || "").split(/, */);
    let k;
    if (!t && R ? k = "Server sent a subprotocol but none was requested" : t && !R ? k = "Server sent no subprotocol" : R && !L.includes(R) && (k = "Server sent an invalid subprotocol"), k) {
      me(s, S, k);
      return;
    }
    R && (s._protocol = R);
    const A = x.headers["sec-websocket-extensions"];
    if (A !== void 0) {
      if (!d) {
        me(s, S, "Server sent a Sec-WebSocket-Extensions header but no extension was requested");
        return;
      }
      let D;
      try {
        D = ac(A);
      } catch {
        me(s, S, "Invalid Sec-WebSocket-Extensions header");
        return;
      }
      const I = Object.keys(D);
      if (I.length) {
        if (I.length !== 1 || I[0] !== Fe.extensionName) {
          me(s, S, "Server indicated an extension that was not requested");
          return;
        }
        try {
          d.accept(D[Fe.extensionName]);
        } catch {
          me(s, S, "Invalid Sec-WebSocket-Extensions header");
          return;
        }
        s._extensions[Fe.extensionName] = d;
      }
    }
    s.setSocket(S, m, n.maxPayload);
  });
}
function Bs(s, e) {
  s._readyState = te.CLOSING, s.emit("error", e), s.emitClose();
}
function fc(s) {
  return s.path = s.socketPath, ci.connect(s);
}
function hc(s) {
  return s.path = void 0, !s.servername && s.servername !== "" && (s.servername = ci.isIP(s.host) ? "" : s.host), Xa.connect(s);
}
function me(s, e, t) {
  s._readyState = te.CLOSING;
  const r = new Error(t);
  Error.captureStackTrace(r, me), e.setHeader ? (e.abort(), e.socket && !e.socket.destroyed && e.socket.destroy(), e.once("abort", s.emitClose.bind(s)), s.emit("error", r)) : (e.destroy(r), e.once("error", s.emit.bind(s, "error")), e.once("close", s.emitClose.bind(s)));
}
function Us(s, e, t) {
  if (e) {
    const r = cc(e).length;
    s._socket ? s._sender._bufferedBytes += r : s._bufferedAmount += r;
  }
  if (t) {
    const r = new Error(
      `WebSocket is not open: readyState ${s.readyState} (${ke[s.readyState]})`
    );
    t(r);
  }
}
function uc(s, e) {
  const t = this[ce];
  t._closeFrameReceived = !0, t._closeMessage = e, t._closeCode = s, t._socket[ce] !== void 0 && (t._socket.removeListener("data", ws), process.nextTick(ui, t._socket), s === 1005 ? t.close() : t.close(s, e));
}
function dc() {
  this[ce]._socket.resume();
}
function gc(s) {
  const e = this[ce];
  e._socket[ce] !== void 0 && (e._socket.removeListener("data", ws), process.nextTick(ui, e._socket), e.close(s[rc])), e.emit("error", s);
}
function nn() {
  this[ce].emitClose();
}
function pc(s) {
  this[ce].emit("message", s);
}
function _c(s) {
  const e = this[ce];
  e.pong(s, !e._isServer, li), e.emit("ping", s);
}
function mc(s) {
  this[ce].emit("pong", s);
}
function ui(s) {
  s.resume();
}
function di() {
  const s = this[ce];
  this.removeListener("close", di), this.removeListener("data", ws), this.removeListener("end", gi), s._readyState = te.CLOSING;
  let e;
  !this._readableState.endEmitted && !s._closeFrameReceived && !s._receiver._writableState.errorEmitted && (e = s._socket.read()) !== null && s._receiver.write(e), s._receiver.end(), this[ce] = void 0, clearTimeout(s._closeTimer), s._receiver._writableState.finished || s._receiver._writableState.errorEmitted ? s.emitClose() : (s._receiver.on("error", nn), s._receiver.on("finish", nn));
}
function ws(s) {
  this[ce]._receiver.write(s) || this.pause();
}
function gi() {
  const s = this[ce];
  s._readyState = te.CLOSING, s._receiver.end(), this.end();
}
function pi() {
  const s = this[ce];
  this.removeListener("error", pi), this.on("error", li), s && (s._readyState = te.CLOSING, this.destroy());
}
const { Duplex: xc } = pn;
function on(s) {
  s.emit("close");
}
function yc() {
  !this.destroyed && this._writableState.finished && this.destroy();
}
function _i(s) {
  this.removeListener("error", _i), this.destroy(), this.listenerCount("error") === 0 && this.emit("error", s);
}
function Ec(s, e) {
  let t = !0, r = !0;
  function n() {
    t && s._socket.resume();
  }
  s.readyState === s.CONNECTING ? s.once("open", function() {
    s._receiver.removeAllListeners("drain"), s._receiver.on("drain", n);
  }) : (s._receiver.removeAllListeners("drain"), s._receiver.on("drain", n));
  const i = new xc({
    ...e,
    autoDestroy: !1,
    emitClose: !1,
    objectMode: !1,
    writableObjectMode: !1
  });
  return s.on("message", function(l) {
    i.push(l) || (t = !1, s._socket.pause());
  }), s.once("error", function(l) {
    i.destroyed || (r = !1, i.destroy(l));
  }), s.once("close", function() {
    i.destroyed || i.push(null);
  }), i._destroy = function(o, l) {
    if (s.readyState === s.CLOSED) {
      l(o), process.nextTick(on, i);
      return;
    }
    let a = !1;
    s.once("error", function(c) {
      a = !0, l(c);
    }), s.once("close", function() {
      a || l(o), process.nextTick(on, i);
    }), r && s.terminate();
  }, i._final = function(o) {
    if (s.readyState === s.CONNECTING) {
      s.once("open", function() {
        i._final(o);
      });
      return;
    }
    s._socket !== null && (s._socket._writableState.finished ? (o(), i._readableState.endEmitted && i.destroy()) : (s._socket.once("finish", function() {
      o();
    }), s.close()));
  }, i._read = function() {
    (s.readyState === s.OPEN || s.readyState === s.CLOSING) && !t && (t = !0, s._receiver._writableState.needDrain || s._socket.resume());
  }, i._write = function(o, l, a) {
    if (s.readyState === s.CONNECTING) {
      s.once("open", function() {
        i._write(o, l, a);
      });
      return;
    }
    s.send(o, a);
  }, i.on("end", yc), i.on("error", _i), i;
}
var Sc = Ec;
const wc = dn, cs = gn, { createHash: Cc } = ls, He = Es, bc = fi, { format: Oc, parse: Tc } = ai, { GUID: vc, kWebSocket: Ac } = pt, $c = /^[+/0-9A-Za-z]{22}==$/, an = 0, cn = 1, mi = 2;
class Ic extends wc {
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
  constructor(e, t) {
    if (super(), e = {
      maxPayload: 100 * 1024 * 1024,
      perMessageDeflate: !1,
      handleProtocols: null,
      clientTracking: !0,
      verifyClient: null,
      noServer: !1,
      backlog: null,
      // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null,
      ...e
    }, e.port == null && !e.server && !e.noServer || e.port != null && (e.server || e.noServer) || e.server && e.noServer)
      throw new TypeError(
        'One and only one of the "port", "server", or "noServer" options must be specified'
      );
    if (e.port != null ? (this._server = cs.createServer((r, n) => {
      const i = cs.STATUS_CODES[426];
      n.writeHead(426, {
        "Content-Length": i.length,
        "Content-Type": "text/plain"
      }), n.end(i);
    }), this._server.listen(
      e.port,
      e.host,
      e.backlog,
      t
    )) : e.server && (this._server = e.server), this._server) {
      const r = this.emit.bind(this, "connection");
      this._removeListeners = kc(this._server, {
        listening: this.emit.bind(this, "listening"),
        error: this.emit.bind(this, "error"),
        upgrade: (n, i, o) => {
          this.handleUpgrade(n, i, o, r);
        }
      });
    }
    e.perMessageDeflate === !0 && (e.perMessageDeflate = {}), e.clientTracking && (this.clients = /* @__PURE__ */ new Set()), this.options = e, this._state = an;
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
    if (this.options.noServer)
      throw new Error('The server is operating in "noServer" mode');
    return this._server ? this._server.address() : null;
  }
  /**
   * Close the server.
   *
   * @param {Function} [cb] Callback
   * @public
   */
  close(e) {
    if (e && this.once("close", e), this._state === mi) {
      process.nextTick(js, this);
      return;
    }
    if (this._state === cn)
      return;
    if (this._state = cn, this.clients)
      for (const r of this.clients)
        r.terminate();
    const t = this._server;
    if (t && (this._removeListeners(), this._removeListeners = this._server = null, this.options.port != null)) {
      t.close(js.bind(void 0, this));
      return;
    }
    process.nextTick(js, this);
  }
  /**
   * See if a given request should be handled by this server instance.
   *
   * @param {http.IncomingMessage} req Request object to inspect
   * @return {Boolean} `true` if the request is valid, else `false`
   * @public
   */
  shouldHandle(e) {
    if (this.options.path) {
      const t = e.url.indexOf("?");
      if ((t !== -1 ? e.url.slice(0, t) : e.url) !== this.options.path)
        return !1;
    }
    return !0;
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
  handleUpgrade(e, t, r, n) {
    t.on("error", tr);
    const i = e.headers["sec-websocket-key"] !== void 0 ? e.headers["sec-websocket-key"].trim() : !1, o = +e.headers["sec-websocket-version"], l = {};
    if (e.method !== "GET" || e.headers.upgrade.toLowerCase() !== "websocket" || !i || !$c.test(i) || o !== 8 && o !== 13 || !this.shouldHandle(e))
      return St(t, 400);
    if (this.options.perMessageDeflate) {
      const a = new He(
        this.options.perMessageDeflate,
        !0,
        this.options.maxPayload
      );
      try {
        const f = Tc(e.headers["sec-websocket-extensions"]);
        f[He.extensionName] && (a.accept(f[He.extensionName]), l[He.extensionName] = a);
      } catch {
        return St(t, 400);
      }
    }
    if (this.options.verifyClient) {
      const a = {
        origin: e.headers[`${o === 8 ? "sec-websocket-origin" : "origin"}`],
        secure: !!(e.socket.authorized || e.socket.encrypted),
        req: e
      };
      if (this.options.verifyClient.length === 2) {
        this.options.verifyClient(a, (f, c, d, h) => {
          if (!f)
            return St(t, c || 401, d, h);
          this.completeUpgrade(i, l, e, t, r, n);
        });
        return;
      }
      if (!this.options.verifyClient(a))
        return St(t, 401);
    }
    this.completeUpgrade(i, l, e, t, r, n);
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
  completeUpgrade(e, t, r, n, i, o) {
    if (!n.readable || !n.writable)
      return n.destroy();
    if (n[Ac])
      throw new Error(
        "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
      );
    if (this._state > an)
      return St(n, 503);
    const a = [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${Cc("sha1").update(e + vc).digest("base64")}`
    ], f = new bc(null);
    let c = r.headers["sec-websocket-protocol"];
    if (c && (c = c.split(",").map(Lc), this.options.handleProtocols ? c = this.options.handleProtocols(c, r) : c = c[0], c && (a.push(`Sec-WebSocket-Protocol: ${c}`), f._protocol = c)), t[He.extensionName]) {
      const d = t[He.extensionName].params, h = Oc({
        [He.extensionName]: [d]
      });
      a.push(`Sec-WebSocket-Extensions: ${h}`), f._extensions = t;
    }
    this.emit("headers", a, r), n.write(a.concat(`\r
`).join(`\r
`)), n.removeListener("error", tr), f.setSocket(n, i, this.options.maxPayload), this.clients && (this.clients.add(f), f.on("close", () => this.clients.delete(f))), o(f, r);
  }
}
var Rc = Ic;
function kc(s, e) {
  for (const t of Object.keys(e))
    s.on(t, e[t]);
  return function() {
    for (const r of Object.keys(e))
      s.removeListener(r, e[r]);
  };
}
function js(s) {
  s._state = mi, s.emit("close");
}
function tr() {
  this.destroy();
}
function St(s, e, t, r) {
  s.writable && (t = t || cs.STATUS_CODES[e], r = {
    Connection: "close",
    "Content-Type": "text/html",
    "Content-Length": Buffer.byteLength(t),
    ...r
  }, s.write(
    `HTTP/1.1 ${e} ${cs.STATUS_CODES[e]}\r
` + Object.keys(r).map((n) => `${n}: ${r[n]}`).join(`\r
`) + `\r
\r
` + t
  )), s.removeListener("error", tr), s.destroy();
}
function Lc(s) {
  return s.trim();
}
const Bt = fi;
Bt.createWebSocketStream = Sc;
Bt.Server = Rc;
Bt.Receiver = ii;
Bt.Sender = oi;
var Dc = Bt;
const Nc = /* @__PURE__ */ fs(Dc);
class Pc {
  constructor() {
    this.id = "none";
  }
  reset(e) {
  }
  getFullState(e) {
    return null;
  }
  applyPatches(e, t) {
    return !1;
  }
}
var Se = /* @__PURE__ */ ((s) => (s[s.JOINING = 0] = "JOINING", s[s.JOINED = 1] = "JOINED", s[s.RECONNECTED = 2] = "RECONNECTED", s[s.LEAVING = 3] = "LEAVING", s))(Se || {});
class Mc extends Array {
  getById(e) {
    return this.find((t) => t.sessionId === e);
  }
  delete(e) {
    return ca(this, this.indexOf(e));
  }
}
console.log("123");
class Fc {
  constructor() {
    this.id = "schema", this.useFilters = !1;
  }
  reset(e) {
    this.state = e, this.useFilters = Do(e.constructor);
  }
  getFullState(e) {
    const t = this.state.encodeAll(this.useFilters);
    return e && this.useFilters ? this.state.applyFilters(e, !0) : t;
  }
  applyPatches(e) {
    const t = this.state.$changes.changes.size > 0;
    if (t) {
      let r = e.length;
      mt.enabled && (mt.dumpChanges = ta(this.state));
      const n = this.state.encode(!1, [], this.useFilters);
      if (this.useFilters) {
        for (; r--; ) {
          const i = e[r];
          if (i.state === Se.JOINED) {
            const o = this.state.applyFilters(i);
            debugger;
            i.raw([oe.ROOM_STATE_PATCH, ...o]);
          }
        }
        this.state.discardAllChanges();
      } else
        for (n.unshift(oe.ROOM_STATE_PATCH); r--; ) {
          const i = e[r];
          if (i.state === Se.JOINED) {
            debugger;
            i.raw(n);
          }
        }
      mt.enabled && mt(
        "%d bytes sent to %d clients, %j",
        n.length,
        e.length,
        mt.dumpChanges
      );
    }
    return t;
  }
  handshake() {
    return this.handshakeCache || (this.handshakeCache = this.state && dt.encode(this.state)), this.handshakeCache;
  }
}
const Bc = 1e3 / 20, Uc = 1e3 / 60, jc = new Pc(), Vc = Number(process.env.COLYSEUS_SEAT_RESERVATION_TIME || 15);
class Cs {
  constructor(e) {
    this.clock = new zi(), this.maxClients = 1 / 0, this.patchRate = Bc, this.autoDispose = !0, this.clients = new Mc(), this._events = new Ri(), this.seatReservationTime = Vc, this.reservedSeats = {}, this.reservedSeatTimeouts = {}, this._reconnections = {}, this._reconnectingSessionId = /* @__PURE__ */ new Map(), this.onMessageHandlers = {}, this._serializer = jc, this._afterNextPatchQueue = [], this._internalState = 0, this._locked = !1, this._lockedExplicitly = !1, this._maxClientsReached = !1, this.presence = e, this._events.once("dispose", async () => {
      try {
        await this._dispose();
      } catch (t) {
        ct(`onDispose error: ${t && t.message || t || "promise rejected"}`);
      }
      this._events.emit("disconnect");
    }), this.setPatchRate(this.patchRate), this.resetAutoDisposeTimeout(this.seatReservationTime);
  }
  get locked() {
    return this._locked;
  }
  get metadata() {
    return this.listing.metadata;
  }
  #t;
  #e;
  get roomName() {
    return this.#e;
  }
  set roomName(e) {
    if (this.#e)
      throw new Me(Je.APPLICATION_ERROR, "'roomName' cannot be overwritten.");
    this.#e = e;
  }
  get roomId() {
    return this.#t;
  }
  set roomId(e) {
    if (this._internalState !== 0 && !la)
      throw new Me(Je.APPLICATION_ERROR, "'roomId' can only be overridden upon room creation.");
    this.#t = e;
  }
  onAuth(e, t, r) {
    return !0;
  }
  static async onAuth(e, t) {
    return !0;
  }
  hasReachedMaxClients() {
    return this.clients.length + Object.keys(this.reservedSeats).length >= this.maxClients || this._internalState === 2;
  }
  setSeatReservationTime(e) {
    return this.seatReservationTime = e, this;
  }
  hasReservedSeat(e, t) {
    if (t) {
      const r = this._reconnections[t];
      return r && r[0] === e && this.reservedSeats[e] !== void 0 && this._reconnectingSessionId.has(e);
    } else
      return this.reservedSeats[e] !== void 0 && (!this._reconnectingSessionId.has(e) || this._reconnectingSessionId.get(e) === e);
  }
  checkReconnectionToken(e) {
    const t = this._reconnections[e], r = t && t[0];
    if (this.hasReservedSeat(r))
      return this._reconnectingSessionId.set(r, e), r;
  }
  setSimulationInterval(e, t = Uc) {
    this._simulationInterval && clearInterval(this._simulationInterval), e && (this._simulationInterval = setInterval(() => {
      this.clock.tick(), e(this.clock.deltaTime);
    }, t));
  }
  setPatchRate(e) {
    this.patchRate = e, this._patchInterval && (clearInterval(this._patchInterval), this._patchInterval = void 0), e !== null && e !== 0 && (this._patchInterval = setInterval(() => this.broadcastPatch(), e));
  }
  setState(e) {
    this.clock.start(), "_definition" in e && this.setSerializer(new Fc()), this._serializer.reset(e), this.state = e;
  }
  setSerializer(e) {
    this._serializer = e;
  }
  async setMetadata(e) {
    if (!this.listing.metadata)
      this.listing.metadata = e;
    else {
      for (const t in e)
        e.hasOwnProperty(t) && (this.listing.metadata[t] = e[t]);
      "markModified" in this.listing && this.listing.markModified("metadata");
    }
    this._internalState === 1 && await this.listing.save();
  }
  async setPrivate(e = !0) {
    this.listing.private !== e && (this.listing.private = e, this._internalState === 1 && await this.listing.save(), this._events.emit("visibility-change", e));
  }
  async lock() {
    this._lockedExplicitly = arguments[0] === void 0, !this._locked && (this._locked = !0, await this.listing.updateOne({
      $set: { locked: this._locked }
    }), this._events.emit("lock"));
  }
  async unlock() {
    arguments[0] === void 0 && (this._lockedExplicitly = !1), this._locked && (this._locked = !1, await this.listing.updateOne({
      $set: { locked: this._locked }
    }), this._events.emit("unlock"));
  }
  send(e, t, r, n) {
    ir.warn("DEPRECATION WARNING: use client.send(...) instead of this.send(client, ...)"), e.send(t, r, n);
  }
  broadcast(e, t, r) {
    const n = typeof e == "object", i = n ? t : r;
    if (i && i.afterNextPatch) {
      delete i.afterNextPatch, this._afterNextPatchQueue.push(["broadcast", arguments]);
      return;
    }
    n ? this.broadcastMessageSchema(e, i) : this.broadcastMessageType(e, t, i);
  }
  broadcastPatch() {
    if (this.onBeforePatch && this.onBeforePatch(this.state), this._simulationInterval || this.clock.tick(), !this.state)
      return !1;
    const e = this._serializer.applyPatches(this.clients, this.state);
    return this._dequeueAfterPatchMessages(), e;
  }
  onMessage(e, t) {
    return this.onMessageHandlers[e] = t, () => delete this.onMessageHandlers[e];
  }
  disconnect(e = oe.WS_CLOSE_CONSENTED) {
    if (this._internalState === 2)
      return;
    if (this._internalState === 0)
      throw new Error("cannot disconnect during onCreate()");
    this._internalState = 2, this.listing.remove(), this.autoDispose = !0;
    const t = new Promise((n) => this._events.once("disconnect", () => n()));
    for (const [n, i] of Object.values(this._reconnections))
      i.reject();
    let r = this.clients.length;
    if (r > 0)
      for (; r--; )
        this._forciblyCloseClient(this.clients[r], e);
    else
      this._events.emit("dispose");
    return t;
  }
  async _onJoin(e, t) {
    const r = e.sessionId;
    e._reconnectionToken = aa(), this.reservedSeatTimeouts[r] && (clearTimeout(this.reservedSeatTimeouts[r]), delete this.reservedSeatTimeouts[r]), this._autoDisposeTimeout && (clearTimeout(this._autoDisposeTimeout), this._autoDisposeTimeout = void 0);
    const [n, i] = this.reservedSeats[r];
    if (this.reservedSeats[r].length > 2)
      throw new Me(Je.MATCHMAKE_EXPIRED, "already consumed");
    this.reservedSeats[r].push(!0), e._afterNextPatchQueue = this._afterNextPatchQueue, e.ref.onleave = (l) => e.state = Se.LEAVING, e.ref.once("close", e.ref.onleave);
    const o = this._reconnectingSessionId.get(r);
    if (o)
      this.clients.push(e), this._reconnections[o]?.[1].resolve(e);
    else
      try {
        if (i)
          e.auth = i;
        else if (this.onAuth !== Cs.prototype.onAuth && (e.auth = await this.onAuth(e, n, t), !e.auth))
          throw new Me(Je.AUTH_FAILED, "onAuth failed");
        if (e.readyState !== Nc.OPEN)
          throw new Me(oe.WS_CLOSE_GOING_AWAY, "already disconnected");
        this.clients.push(e), this.onJoin && await this.onJoin(e, n, e.auth), this._events.emit("join", e), delete this.reservedSeats[r], e.state === Se.LEAVING && await this._onLeave(e, oe.WS_CLOSE_GOING_AWAY);
      } catch (l) {
        throw this.clients.delete(e), delete this.reservedSeats[r], this._decrementClientCount(), l.code || (l.code = Je.APPLICATION_ERROR), l;
      }
    e.state === Se.JOINING && (e.ref.removeListener("close", e.ref.onleave), e.ref.onleave = this._onLeave.bind(this, e), e.ref.once("close", e.ref.onleave), e.ref.on("message", this._onMessage.bind(this, e)), e.raw(Wt[oe.JOIN_ROOM](
      e._reconnectionToken,
      this._serializer.id,
      this._serializer.handshake && this._serializer.handshake()
    )));
  }
  allowReconnection(e, t) {
    if (e._enqueuedMessages !== void 0)
      return;
    if (t === void 0 && (console.warn('DEPRECATED: allowReconnection() requires a second argument. Using "manual" mode.'), t = "manual"), t === "manual" && (t = 1 / 0), this._internalState === 2)
      throw this._disposeIfEmpty(), new Error("disconnecting");
    const r = e.sessionId, n = e._reconnectionToken;
    this._reserveSeat(r, !0, e.auth, t, !0);
    const i = new ti();
    this._reconnections[n] = [r, i], t !== 1 / 0 && (this.reservedSeatTimeouts[r] = setTimeout(() => i.reject(!1), t * 1e3));
    const o = () => {
      delete this._reconnections[n], delete this.reservedSeats[r], delete this.reservedSeatTimeouts[r], this._reconnectingSessionId.delete(r);
    };
    return i.then((l) => {
      l.auth = e.auth, l.userData = e.userData, e.ref = l.ref, e.state = Se.RECONNECTED, clearTimeout(this.reservedSeatTimeouts[r]), o();
    }).catch(() => {
      o(), this.resetAutoDisposeTimeout();
    }), i;
  }
  resetAutoDisposeTimeout(e = 1) {
    clearTimeout(this._autoDisposeTimeout), this.autoDispose && (this._autoDisposeTimeout = setTimeout(() => {
      this._autoDisposeTimeout = void 0, this._disposeIfEmpty();
    }, e * 1e3));
  }
  broadcastMessageSchema(e, t = {}) {
    Ht("broadcast: %O", e);
    const r = Wt[oe.ROOM_DATA_SCHEMA](e), n = typeof t.except < "u" ? Array.isArray(t.except) ? t.except : [t.except] : void 0;
    let i = this.clients.length;
    for (; i--; ) {
      const o = this.clients[i];
      (!n || !n.includes(o)) && o.enqueueRaw(r);
    }
  }
  broadcastMessageType(e, t, r = {}) {
    Ht("broadcast: %O", t);
    const n = Wt.raw(oe.ROOM_DATA, e, t), i = typeof r.except < "u" ? Array.isArray(r.except) ? r.except : [r.except] : void 0;
    let o = this.clients.length;
    for (; o--; ) {
      const l = this.clients[o];
      (!i || !i.includes(l)) && l.enqueueRaw(n);
    }
  }
  sendFullState(e) {
    e.enqueueRaw(Wt[oe.ROOM_STATE](this._serializer.getFullState(e)));
  }
  _dequeueAfterPatchMessages() {
    const e = this._afterNextPatchQueue.length;
    if (e > 0) {
      for (let t = 0; t < e; t++) {
        const [r, n] = this._afterNextPatchQueue[t];
        r === "broadcast" ? this.broadcast.apply(this, n) : r.raw.apply(r, n);
      }
      this._afterNextPatchQueue.splice(0, e);
    }
  }
  async _reserveSeat(e, t = !0, r = void 0, n = this.seatReservationTime, i = !1, o) {
    return !i && this.hasReachedMaxClients() ? !1 : (this.reservedSeats[e] = [t, r], i || (await this._incrementClientCount(), this.reservedSeatTimeouts[e] = setTimeout(async () => {
      delete this.reservedSeats[e], delete this.reservedSeatTimeouts[e], await this._decrementClientCount();
    }, n * 1e3), this.resetAutoDisposeTimeout(n)), o && this._reconnectingSessionId.set(e, e), !0);
  }
  _disposeIfEmpty() {
    const e = this.autoDispose && this._autoDisposeTimeout === void 0 && this.clients.length === 0 && Object.keys(this.reservedSeats).length === 0;
    return e && this._events.emit("dispose"), e;
  }
  async _dispose() {
    this._internalState = 2, await this.listing.remove();
    let e;
    return this.onDispose && (e = this.onDispose()), this._patchInterval && (clearInterval(this._patchInterval), this._patchInterval = void 0), this._simulationInterval && (clearInterval(this._simulationInterval), this._simulationInterval = void 0), this._autoDisposeTimeout && (clearInterval(this._autoDisposeTimeout), this._autoDisposeTimeout = void 0), this.clock.clear(), this.clock.stop(), await (e || Promise.resolve());
  }
  _onMessage(e, t) {
    if (e.state === Se.LEAVING)
      return;
    const r = { offset: 0 }, n = Ne.uint8(t, r);
    if (!t) {
      ct(`${this.roomName} (${this.roomId}), couldn't decode message: ${t}`);
      return;
    }
    if (n === oe.ROOM_DATA) {
      const i = Ne.stringCheck(t, r) ? Ne.string(t, r) : Ne.number(t, r);
      let o;
      try {
        o = t.length > r.offset ? ao(new Uint8Array(t.slice(r.offset, t.length))) : void 0, Ht("received: '%s' -> %j", i, o);
      } catch (l) {
        ct(l);
        return;
      }
      this.onMessageHandlers[i] ? this.onMessageHandlers[i](e, o) : this.onMessageHandlers["*"] ? this.onMessageHandlers["*"](e, i, o) : ct(`onMessage for "${i}" not registered.`);
    } else if (n === oe.ROOM_DATA_BYTES) {
      const i = Ne.stringCheck(t, r) ? Ne.string(t, r) : Ne.number(t, r), o = t.slice(r.offset, t.length);
      Ht("received: '%s' -> %j", i, o), this.onMessageHandlers[i] ? this.onMessageHandlers[i](e, o) : this.onMessageHandlers["*"] ? this.onMessageHandlers["*"](e, i, o) : ct(`onMessage for "${i}" not registered.`);
    } else
      n === oe.JOIN_ROOM && e.state === Se.JOINING ? (e.state = Se.JOINED, this.state && this.sendFullState(e), e._enqueuedMessages.length > 0 && e._enqueuedMessages.forEach((i) => e.raw(i)), delete e._enqueuedMessages) : n === oe.LEAVE_ROOM && this._forciblyCloseClient(e, oe.WS_CLOSE_CONSENTED);
  }
  _forciblyCloseClient(e, t) {
    e.ref.removeAllListeners("message"), e.ref.removeListener("close", e.ref.onleave), this._onLeave(e, t).then(() => e.leave(t));
  }
  async _onLeave(e, t) {
    if (this.clients.delete(e) && (e.state = Se.LEAVING, this.onLeave))
      try {
        await this.onLeave(e, t === oe.WS_CLOSE_CONSENTED);
      } catch (n) {
        ct(`onLeave error: ${n && n.message || n || "promise rejected"}`);
      }
    if (e.state !== Se.RECONNECTED) {
      const n = await this._decrementClientCount();
      this._events.emit("leave", e, n);
    }
  }
  async _incrementClientCount() {
    !this._locked && this.hasReachedMaxClients() && (this._maxClientsReached = !0, this.lock.call(this, !0)), await this.listing.updateOne({
      $inc: { clients: 1 },
      $set: { locked: this._locked }
    });
  }
  async _decrementClientCount() {
    const e = this._disposeIfEmpty();
    return this._internalState === 2 ? !0 : (e || (this._maxClientsReached && !this._lockedExplicitly && (this._maxClientsReached = !1, this.unlock.call(this, !0)), await this.listing.updateOne({
      $inc: { clients: -1 },
      $set: { locked: this._locked }
    })), e);
  }
}
Mi.resolve(".devmode.json");
new ti();
const xi = new gt();
class yi extends H {
}
jn(yi, {
  connected: "boolean",
  name: "string",
  sessionId: "string"
}, { context: xi });
class Gc extends H {
  constructor() {
    super(...arguments), this.players = new ie();
  }
}
jn(Gc, {
  players: { map: yi }
}, { context: xi });
var Wc = Object.defineProperty, Hc = Object.getOwnPropertyDescriptor, bs = (s, e, t, r) => {
  for (var n = r > 1 ? void 0 : r ? Hc(e, t) : e, i = s.length - 1, o; i >= 0; i--)
    (o = s[i]) && (n = (r ? o(e, t, n) : o(n)) || n);
  return r && n && Wc(e, t, n), n;
};
class Os extends H {
}
bs([
  W("string")
], Os.prototype, "name", 2);
bs([
  W("string")
], Os.prototype, "team", 2);
class _r extends H {
  constructor() {
    super(...arguments), this.awaiters = new ie();
  }
}
bs([
  W("string")
], _r.prototype, "hostSessionId", 2);
bs([
  W({ map: Os })
], _r.prototype, "awaiters", 2);
var sr = /* @__PURE__ */ ((s) => (s.WAITING_ROOM = "waiting-room", s.GAME_ROOM = "game-room", s))(sr || {}), Ct = /* @__PURE__ */ ((s) => (s.CHANGE_TEAM = "to-change-team", s.START_GAME = "to-start-game", s))(Ct || {}), rr = /* @__PURE__ */ ((s) => (s.CHANGE_TEAM = "from-change-team", s.START_GAME = "from-start-game", s))(rr || {}), we = /* @__PURE__ */ ((s) => (s.USER_READY_TO_KICKOFF = "user-ready-to-kickoff", s.USER_ACTION = "user-action", s.GOAL = "goal", s.READY_TO_START = "ready-to-start", s.KICKOFF = "kickoff", s.SHOOT = "shoot", s.TIMESTAMP = "timestamp", s.END = "end", s.DISPOSE = "dispose", s))(we || {}), ts = /* @__PURE__ */ ((s) => (s.DIRECTION = "direction", s.SHOOT_START = "shoot-start", s.SHOOT_END = "shoot-end", s))(ts || {}), ue = /* @__PURE__ */ ((s) => (s.OBSERVER = "observer", s.RED = "red", s.BLUE = "blue", s))(ue || {}), Ke = /* @__PURE__ */ ((s) => (s[s.PREPARATION = 0] = "PREPARATION", s[s.KICKOFF = 1] = "KICKOFF", s[s.PROGRESS = 2] = "PROGRESS", s[s.GOAL = 3] = "GOAL", s[s.END = 4] = "END", s))(Ke || {}), Be = /* @__PURE__ */ ((s) => (s[s.IDLE = 0] = "IDLE", s[s.SHOOTING = 1] = "SHOOTING", s))(Be || {});
class Yc extends Cs {
  constructor() {
    super(), this.maxClients = 10, this.setState(new _r());
  }
  onCreate(e) {
    console.log("waiting room", this.roomId, "creating..."), this.onMessage(
      Ct.CHANGE_TEAM,
      (t, r) => {
        console.log(
          `[${Ct.CHANGE_TEAM}]: ${t.sessionId}, ${JSON.stringify(r)}`
        );
        const n = this.state.awaiters.get(t.sessionId);
        if (!n)
          throw new Error(
            `The client(sessionId: ${t.sessionId}) not found.`
          );
        n.team = r.to, this.state.awaiters.set(t.sessionId, n), this.broadcast(rr.CHANGE_TEAM, {
          awaiters: this.state.awaiters
        });
      }
    ), this.onMessage(
      Ct.START_GAME,
      (t, { roomId: r, map: n }) => {
        console.log(
          `[${Ct.START_GAME}]: ${t.sessionId}`
        ), this.broadcast(
          rr.START_GAME,
          {
            roomId: r,
            map: n
          },
          { except: t }
        );
      }
    );
  }
  onJoin(e, t) {
    console.log(e.sessionId, "joined!");
    const r = t.hostJoinInfo ?? t, n = new Os();
    n.name = r.name, n.team = ue.OBSERVER, this.state.awaiters.set(e.sessionId, n), this.state.hostSessionId || (this.state.hostSessionId = e.sessionId);
  }
  onLeave(e, t) {
    console.log(e.sessionId, "left!"), this.state.awaiters.delete(e.sessionId), this.state.hostSessionId === e.sessionId && (this.state.hostSessionId = [...this.state.awaiters.keys()][0]);
  }
  onDispose() {
    console.log("waiting room", this.roomId, "disposing...");
  }
}
var zc = Object.defineProperty, qc = Object.getOwnPropertyDescriptor, le = (s, e, t, r) => {
  for (var n = r > 1 ? void 0 : r ? qc(e, t) : e, i = s.length - 1, o; i >= 0; i--)
    (o = s[i]) && (n = (r ? o(e, t, n) : o(n)) || n);
  return r && n && zc(e, t, n), n;
};
const Le = class nr extends H {
  constructor() {
    super(...arguments), this.actionQueue = [], this.accelX = 0, this.accelY = 0, this.radius = 27, this.entityState = Be.IDLE;
  }
  static {
    this.SPEED_LIMIT = 2.8;
  }
  static {
    this.SHOOTING_SPEED_LIMIT = 2;
  }
  static {
    this.ACCELERATION = 0.16;
  }
  static {
    this.SHOOTING_ACCLERATION = 0.1;
  }
  static {
    this.FRICTION = 4e-3;
  }
  accelrate(e) {
    const t = this.entityState === Be.SHOOTING ? nr.SHOOTING_ACCLERATION : nr.ACCELERATION;
    switch (e) {
      case "":
        this.accelX = 0, this.accelY = 0;
        break;
      case "left":
        this.accelX = -t, this.accelY = 0;
        break;
      case "right":
        this.accelX = t, this.accelY = 0;
        break;
      case "up":
        this.accelX = 0, this.accelY = -t;
        break;
      case "down":
        this.accelX = 0, this.accelY = t;
        break;
      case "leftup":
        this.accelX = -t * Math.SQRT1_2, this.accelY = -t * Math.SQRT1_2;
        break;
      case "leftdown":
        this.accelX = -t * Math.SQRT1_2, this.accelY = t * Math.SQRT1_2;
        break;
      case "rightup":
        this.accelX = t * Math.SQRT1_2, this.accelY = -t * Math.SQRT1_2;
        break;
      case "rightdown":
        this.accelX = t * Math.SQRT1_2, this.accelY = t * Math.SQRT1_2;
        break;
    }
    return [this.accelX, this.accelY];
  }
};
le([
  W("string")
], Le.prototype, "name", 2);
le([
  W("string")
], Le.prototype, "team", 2);
le([
  W("number")
], Le.prototype, "radius", 2);
le([
  W("number")
], Le.prototype, "entityState", 2);
le([
  W("number")
], Le.prototype, "x", 2);
le([
  W("number")
], Le.prototype, "y", 2);
le([
  W("number")
], Le.prototype, "kickoffX", 2);
le([
  W("number")
], Le.prototype, "kickoffY", 2);
let vt = Le;
class it extends H {
  constructor() {
    super(...arguments), this.radius = 19;
  }
}
le([
  W("number")
], it.prototype, "radius", 2);
le([
  W("number")
], it.prototype, "x", 2);
le([
  W("number")
], it.prototype, "y", 2);
le([
  W("number")
], it.prototype, "kickoffX", 2);
le([
  W("number")
], it.prototype, "kickoffY", 2);
class Ts extends H {
  constructor() {
    super(...arguments), this.redTeamScore = 0, this.blueTeamScore = 0, this.state = Ke.PREPARATION, this.players = new ie();
  }
  createPlayer(e, t) {
    this.players.set(e, t);
  }
  removePlayer(e) {
  }
}
le([
  W("number")
], Ts.prototype, "state", 2);
le([
  W({ map: vt })
], Ts.prototype, "players", 2);
le([
  W(it)
], Ts.prototype, "ball", 2);
const Jc = 0, ss = 1, Kc = 2, Ei = 1, Si = 2, wi = 4, bt = 8, Ci = 16, ln = 32, Xc = 64, Qc = 128, be = 192, lt = (s) => {
  const {
    cx: e,
    cy: t,
    radius: r,
    fromRadian: n,
    toRadian: i,
    division: o,
    reverse: l = !1
  } = s, a = (i - n) / o;
  let f = [...Array.from({ length: o + 1 }).keys()].map(
    (c) => n + a * c
  );
  return l && (f = f.reverse()), f.reduce((c, d) => `${c}, ${e + r * Math.sin(d)} ${t - r * Math.cos(d)}`, "");
}, se = 80, qt = 4;
class Zc {
  constructor(e, t) {
    this.groundOutLines = [], this.leftSideCenterLines = [], this.rightSideCenterLines = [], this.goalPostNets = [], this.world = e, this.map = t;
  }
  blockGroundOutLines() {
    this.groundOutLines.forEach((e) => {
      e.collisionFilter.mask = (e.collisionFilter.mask ?? 0) | be;
    });
  }
  openGroundLines() {
    this.groundOutLines.forEach((e) => {
      e.collisionFilter.mask = (e.collisionFilter.mask ?? 0) & ~be;
    });
  }
  blockCenterLine(e) {
    e === "right" ? this.rightSideCenterLines.forEach((t) => {
      t.collisionFilter.mask = (t.collisionFilter.mask ?? 0) | be;
    }) : this.leftSideCenterLines.forEach((t) => {
      t.collisionFilter.mask = (t.collisionFilter.mask ?? 0) | be;
    });
  }
  openCenterLine() {
    this.rightSideCenterLines.forEach((e) => {
      e.collisionFilter.mask = (e.collisionFilter.mask ?? 0) & ~be;
    }), this.leftSideCenterLines.forEach((e) => {
      e.collisionFilter.mask = (e.collisionFilter.mask ?? 0) & ~be;
    });
  }
  blockGoalPostNets() {
    this.goalPostNets.forEach((e) => {
      e.collisionFilter.mask = (e.collisionFilter.mask ?? 0) | be;
    });
  }
  openGoalPostNets() {
    this.goalPostNets.forEach((e) => {
      e.collisionFilter.mask = (e.collisionFilter.mask ?? 0) & ~be;
    });
  }
  build() {
    const e = this.map.width, t = this.map.height;
    P.Composite.add(
      this.world,
      [
        // top
        P.Bodies.rectangle(e / 2, 0, e, se),
        // bottom
        P.Bodies.rectangle(e / 2, t, e, se),
        // left
        P.Bodies.rectangle(
          -se / 2,
          t / 2,
          se,
          t
        ),
        // right
        P.Bodies.rectangle(
          e + se / 2,
          t / 2,
          se,
          t
        )
      ].map((o) => (o.isStatic = !0, o.collisionFilter = {
        group: Jc,
        category: Ei,
        mask: be
      }, o))
    ), this.groundOutLines = this.drawGroundOutLines();
    const r = this.drawCenterLines(), n = this.drawCenterLeftHalfCircle(), i = this.drawCenterRightHalfCircle();
    this.leftSideCenterLines = [...r, n], this.rightSideCenterLines = [...r, i], this.goalPostNets = this.drawGoalPostNets(), this.drawGoalPosts();
  }
  drawGoalPosts() {
    const e = this.map.width, t = this.map.height, r = this.map.ground.width, n = (e - r) / 2, i = this.map.ground.goalPostWidth, o = (t - i) / 2, l = (t + i) / 2, a = this.map.ground.goalPostRadius;
    P.Composite.add(
      this.world,
      [
        // left
        P.Bodies.circle(n, o, a),
        P.Bodies.circle(n, l, a),
        // right
        P.Bodies.circle(
          n + r,
          o,
          a
        ),
        P.Bodies.circle(
          n + r,
          l,
          a
        )
      ].map((f) => (f.isStatic = !0, f.restitution = 0.8, f.collisionFilter = {
        group: ss,
        category: Si,
        mask: be
      }, f))
    );
  }
  drawGroundOutLines(e = 0) {
    const t = this.map.width, r = this.map.ground.width, n = this.map.ground.height, i = this.map.ground.x, o = this.map.ground.y, { goalPostTopPositionY: l, goalPostBottomPositionY: a } = this.map.ground, f = [
      // top
      P.Bodies.rectangle(
        t / 2,
        o - se / 2,
        r,
        se
      ),
      // bottom
      P.Bodies.rectangle(
        t / 2,
        o + n + se / 2,
        r,
        se
      ),
      // left
      P.Bodies.rectangle(
        i - se / 2,
        o + (l - o) / 2,
        se,
        l - o
      ),
      P.Bodies.rectangle(
        i - se / 2,
        a + (l - o) / 2,
        se,
        l - o
      ),
      // right
      P.Bodies.rectangle(
        i + r + se / 2,
        o + (l - o) / 2,
        se,
        l - o
      ),
      P.Bodies.rectangle(
        i + r + se / 2,
        a + (l - o) / 2,
        se,
        l - o
      )
    ].map((c) => (c.isStatic = !0, c.restitution = 0.6, c.collisionFilter = {
      group: ss,
      category: Ci,
      mask: e
    }, c));
    return P.Composite.add(this.world, f), f;
  }
  drawGoalPostNets() {
    const { width: e, height: t, ground: r } = this.map, {
      width: n,
      goalPostNetThickness: i,
      goalPostDepth: o,
      goalPostWidth: l,
      goalPostNetCornerRadius: a
    } = r, f = (e - n) / 2, c = (t - l) / 2, d = 10, h = lt({
      cx: a,
      cy: a,
      radius: a + i * 0.5,
      fromRadian: 1.5 * Math.PI,
      toRadian: 2 * Math.PI,
      division: d,
      reverse: !0
    }) + lt({
      cx: a,
      cy: l - a,
      radius: a + i * 0.5,
      fromRadian: 1 * Math.PI,
      toRadian: 1.5 * Math.PI,
      division: d,
      reverse: !0
    }) + lt({
      cx: a,
      cy: l - a,
      radius: a - i,
      fromRadian: 1 * Math.PI,
      toRadian: 1.5 * Math.PI,
      division: d
    }) + lt({
      cx: a,
      cy: a,
      radius: a - i,
      fromRadian: 1.5 * Math.PI,
      toRadian: 2 * Math.PI,
      division: d
    }), x = P.Vertices.fromPath(h, P.Body.create({})), S = P.Bodies.fromVertices(
      f - o * 0.5 - 14,
      c + l / 2,
      [x],
      {
        isStatic: !0
      }
    ), m = P.Bodies.fromVertices(
      f + n + o * 0.5 + 14,
      c + l / 2,
      [x],
      {
        isStatic: !0
      }
    );
    return P.Body.rotate(m, Math.PI), P.Composite.add(
      this.world,
      [S, m].map((b) => (b.collisionFilter = {
        group: ss,
        category: wi
      }, b))
    ), [S, m];
  }
  drawCenterLeftHalfCircle(e = 0) {
    const t = this.map.width, r = this.map.height, n = this.map.ground.width, i = this.map.ground.height, o = (t - n) * 0.5, l = (r - i) * 0.5, a = o + n * 0.5, f = l + i * 0.5, c = i * 0.222222, d = this.createRightHalfCircleVertices(), h = P.Bodies.fromVertices(
      a - (c / 2 + qt * 4 + 2),
      f,
      [d],
      {
        isStatic: !0,
        collisionFilter: {
          category: bt
        }
      }
    );
    return P.Body.rotate(h, Math.PI), h.collisionFilter.mask = e, P.Composite.add(this.world, [h]), h;
  }
  drawCenterRightHalfCircle(e = 0) {
    const t = this.map.width, r = this.map.height, n = this.map.ground.width, i = this.map.ground.height, o = (t - n) * 0.5, l = (r - i) * 0.5, a = o + n * 0.5, f = l + i * 0.5, c = i * 0.222222, d = this.createRightHalfCircleVertices(), h = P.Bodies.fromVertices(
      a + c / 2 + qt * 4 + 2,
      f,
      [d],
      {
        isStatic: !0,
        collisionFilter: {
          category: bt
        }
      }
    );
    return h.collisionFilter.mask = e, P.Composite.add(this.world, [h]), h;
  }
  createRightHalfCircleVertices() {
    const t = this.map.ground.height * 0.222222, r = 20, n = lt({
      cx: 0,
      cy: 0,
      radius: t + qt * 0.5,
      fromRadian: 0,
      toRadian: Math.PI,
      division: r
    }) + lt({
      cx: 0,
      cy: 0,
      radius: t - qt * 0.5,
      fromRadian: 0,
      toRadian: Math.PI,
      division: r,
      reverse: !0
    });
    return P.Vertices.fromPath(
      n,
      P.Body.create({})
    );
  }
  /** NOTE: center circle기준으로 위, 아래 라인만 */
  drawCenterLines(e = 0) {
    const t = this.map.width, r = this.map.height, n = this.map.ground.width, i = this.map.ground.height, o = (t - n) / 2, l = (r - i) / 2, a = o + n * 0.5, f = i * 0.222222, c = (i - f * 2) * 0.5, d = 4, h = P.Bodies.rectangle(
      a,
      l + c * 0.5,
      d,
      c,
      {
        isStatic: !0,
        collisionFilter: {
          category: bt,
          mask: e
        }
      }
    ), x = P.Bodies.rectangle(
      a,
      l + i - c * 0.5,
      d,
      c,
      {
        isStatic: !0,
        collisionFilter: {
          category: bt,
          mask: e
        }
      }
    ), S = [h, x];
    return P.Composite.add(this.world, S), S;
  }
}
global.decomp = Fi;
class el {
  constructor(e) {
    this.players = {}, this.room = e, this.state = e.state, this.engine = P.Engine.create({
      positionIterations: 8,
      velocityIterations: 6
    }), this.world = this.engine.world, this.init();
  }
  init() {
    this.engine.gravity = { x: 0, y: 0, scale: 1 }, this.initUpdateEvents(), this.initCollisionEvents();
  }
  buildMap(e) {
    this.mapBuilder = new Zc(this.world, e), this.mapBuilder.build(), this.redGoalLine = e.ground.x, this.blueGoalLine = e.ground.x + e.ground.width;
  }
  initUpdateEvents() {
    P.Events.on(this.engine, "afterUpdate", () => {
      const { x: e } = this.ball.position;
      switch (this.state.state) {
        case Ke.PROGRESS:
          if (e < this.redGoalLine || e > this.blueGoalLine) {
            this.state.state = Ke.GOAL;
            const n = e > this.blueGoalLine;
            n ? (this.state.redTeamScore += 1, this.room.broadcast(we.GOAL, {
              team: ue.RED,
              redTeamScore: this.state.redTeamScore,
              blueTeamScore: this.state.blueTeamScore
            })) : (this.state.blueTeamScore += 1, this.room.broadcast(we.GOAL, {
              team: ue.BLUE,
              redTeamScore: this.state.redTeamScore,
              blueTeamScore: this.state.blueTeamScore
            }));
            const i = this.room.setting.endScore;
            this.state.redTeamScore === i || this.state.blueTeamScore === i ? (this.state.redTeamScore === i ? this.room.broadcast(we.END, {
              victoryTeam: ue.RED
            }) : this.room.broadcast(we.END, {
              victoryTeam: ue.BLUE
            }), setTimeout(() => {
              this.destroy();
            }, 3e3)) : setTimeout(() => {
              this.setupKickoff(n ? ue.BLUE : ue.RED);
            }, 3e3);
          }
          break;
        case Ke.KICKOFF:
          break;
      }
      const { x: t, y: r } = this.ball.position;
      this.state.ball.x = t, this.state.ball.y = r;
      for (const n in this.players) {
        const i = this.players[n], o = this.state.players.get(n);
        if (!i || !o)
          continue;
        const { x: l, y: a } = i.position;
        o.x = l, o.y = a, o.entityState === Be.SHOOTING && this.processPlayerShoot(i, o);
      }
    });
  }
  initCollisionEvents() {
  }
  update(e) {
    this.state.players.forEach((t) => {
      let r;
      for (; r = t.actionQueue.shift(); )
        this.processPlayerAction(t.id, r);
    }), P.Engine.update(this.engine, e);
  }
  addBall(e) {
    const { kickoffX: t, kickoffY: r, radius: n } = e;
    this.ball = P.Bodies.circle(t, r, n), this.ball.mass = 5, this.ball.friction = 0, this.ball.frictionStatic = 5, this.ball.frictionAir = 0.018, this.ball.inertia = 1 / 0, this.ball.collisionFilter = {
      group: ss,
      category: ln,
      mask: be
    }, P.Composite.add(this.world, [this.ball]), this.state.ball = e;
  }
  addPlayer(e, t) {
    const { kickoffX: r, kickoffY: n, radius: i, team: o } = t, l = P.Bodies.circle(r, n, i);
    l.mass = 40, l.friction = 0, l.frictionStatic = 0, l.frictionAir = 0, l.inertia = 1 / 0, l.collisionFilter = {
      group: Kc,
      category: o === ue.RED ? Xc : Qc,
      mask: Ei | Ci | bt | Si | wi | ln
    }, this.players[e] = l, P.Composite.add(this.world, [l]), this.state.createPlayer(e, t);
  }
  removePlayer(e) {
    const t = this.players[e];
    P.Composite.remove(this.world, [t]), this.state.removePlayer(e);
  }
  processPlayerAction(e, t) {
    const r = this.players[e], n = this.state.players.get(e);
    if (!r || !n)
      return;
    const { type: i, payload: o } = t;
    switch (i) {
      case ts.DIRECTION:
        this.processPlayerDirection(r, n, o);
        break;
      case ts.SHOOT_START:
        n.entityState = Be.SHOOTING;
        break;
      case ts.SHOOT_END:
        n.entityState = Be.IDLE;
        break;
    }
  }
  destroy() {
    P.World.clear(this.world, !1), P.Engine.clear(this.engine), this.room.broadcast(we.DISPOSE), this.room.disconnect();
  }
  /** FIXME: duplicate logic */
  // TODO: layout 로직 분리
  setupKickoff(e) {
    this.mapBuilder.blockGroundOutLines(), this.mapBuilder.blockCenterLine(e === ue.RED ? "right" : "left"), this.mapBuilder.blockGoalPostNets();
    for (const t in this.players) {
      const r = this.players[t], n = this.state.players.get(t);
      !r || !n || (P.Body.setPosition(r, {
        x: n.kickoffX,
        y: n.kickoffY
      }), P.Body.setVelocity(r, { x: 0, y: 0 }));
    }
    P.Body.setPosition(this.ball, {
      x: this.state.ball.kickoffX,
      y: this.state.ball.kickoffY
    }), P.Body.setVelocity(this.ball, { x: 0, y: 0 }), this.onceDetectBallTouch(() => {
      this.state.state = Ke.PROGRESS, this.mapBuilder.openCenterLine(), this.mapBuilder.openGroundLines(), this.mapBuilder.openGoalPostNets();
    }), this.state.state = Ke.KICKOFF, setTimeout(() => {
      this.room.broadcast(we.KICKOFF);
    }, 100);
  }
  processPlayerDirection(e, t, r) {
    const n = t.entityState === Be.SHOOTING ? vt.SHOOTING_SPEED_LIMIT : vt.SPEED_LIMIT, i = vt.FRICTION, o = e.velocity, [l, a] = t.accelrate(r.direction);
    let f = o.x, c = o.y;
    l ? f = (Math.sign(f + l) || 1) * Math.min(n, Math.abs(f + l)) : f -= f * (i + a ? 0.01 : 0), a ? c = (Math.sign(c + a) || 1) * Math.min(n, Math.abs(c + a)) : c -= c * (i + l ? 0.01 : 0);
    const h = Math.sqrt(f * f + c * c) / n;
    h > 1 && (f /= h, c /= h), P.Body.setVelocity(e, { x: f, y: c });
  }
  processPlayerShoot(e, t) {
    const i = this.ball, o = i.position.x - e.position.x, l = i.position.y - e.position.y, a = Math.sqrt(
      o * o + l * l
    );
    if (a - (e.circleRadius ?? 0) - (i.circleRadius ?? 0) > 1)
      return;
    const c = o / a, d = l / a;
    P.Body.applyForce(i, i.position, {
      x: c * Math.sqrt(0.04),
      y: d * Math.sqrt(0.04)
    }), t.entityState = Be.IDLE, this.room.broadcast(we.SHOOT);
  }
  onceDetectBallTouch(e) {
    const t = (r) => {
      for (const { bodyA: n, bodyB: i } of r.pairs)
        (n === this.ball || i === this.ball) && (P.Events.off(this.engine, "collisionStart", t), e());
    };
    P.Events.on(this.engine, "collisionStart", t);
  }
}
class tl extends Cs {
  constructor() {
    super(...arguments), this.maxClients = 10;
  }
  onCreate(e) {
    console.log("game room", this.roomId, "creating...");
    const { setting: t } = e;
    this.setting = t, this.setState(new Ts()), this.engine = new el(this), this.setPatchRate(33.33), this.setSimulationInterval((n) => this.engine.update(n));
    const { map: r } = this.setting;
    this.engine.buildMap(r), this.engine.addBall(
      new it({
        kickoffX: r.kickoff.ball.x,
        kickoffY: r.kickoff.ball.y
      })
    ), this.initMessageHandlers();
  }
  /** NOTE: host의 경우 create타고 바로 여기 탐 */
  onJoin(e, t) {
    console.log(e.sessionId, "joined!", t);
    const { team: r, name: n, index: i } = t.hostJoinInfo ?? t;
    this.addPlayer(e.sessionId, { team: r, name: n, index: i }), this.isReady() && (this.engine.setupKickoff(ue.RED), this.engine.mapBuilder.blockCenterLine("left"), setTimeout(() => {
      console.log("ready_to_start"), this.broadcast(we.READY_TO_START);
    }, 1e3));
  }
  onLeave(e, t) {
    console.log(e.sessionId, "left!");
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
      we.USER_READY_TO_KICKOFF,
      /* @__PURE__ */ (() => {
        let e = 0;
        return (t) => {
          ++e === this.getTotalPlayerCount() && (this.engine.mapBuilder.openCenterLine(), this.broadcast(we.KICKOFF));
        };
      })()
    ), this.onMessage(
      we.USER_ACTION,
      (e, t) => {
        this.state.players.get(e.sessionId)?.actionQueue.push(t);
      }
    );
  }
  addPlayer(e, t) {
    const { team: r, name: n, index: i } = t, o = this.setting.map.height, l = this.setting.map.width / 2, a = this.setting.redTeamCount, f = this.setting.blueTeamCount, c = r === ue.RED ? a : f, d = new vt({
      id: e,
      index: i,
      team: r,
      name: n,
      kickoffX: l + (r === ue.RED ? -1 : 1) * l / 2,
      kickoffY: o * (i + 1) / (c + 1)
    });
    switch (r) {
      case ue.RED:
        this.engine.addPlayer(e, d);
        break;
      case ue.BLUE:
        this.engine.addPlayer(e, d);
        break;
    }
  }
}
const { FE_PORT: fn } = process.env, sl = {
  initializeGameServer: (s) => {
    s.define(sr.WAITING_ROOM, Yc), s.define(sr.GAME_ROOM, tl);
  },
  initializeExpress: (s) => {
    s.use("/monitor", Oi()), fn && (s.use("/playground", Ti), s.use(
      vi("/", { target: `http://localhost:${fn}/` })
    ));
  },
  beforeListen: () => {
  }
}, { BE_PORT: hn } = process.env;
bi(sl, hn ? +hn : void 0);
