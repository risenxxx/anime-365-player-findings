// [bench] Prepended to the site's /sworker.js by server/site. Not part of the site code.
// Forwards console.log/console.error lines of the service worker to the local collector
// (/__sw-log) with fetch(), so SW logs can be read WITHOUT attaching DevTools to the
// worker (an attached DevTools session cancels Chrome's SW termination timer, see H6).
// swMain.js binds console.log/error at import time, so this must run before importScripts.
// It does not call waitUntil and adds no event listeners that extend SW lifetime.
(function () {
  var instance = Math.random().toString(36).slice(2, 8);
  var queue = [];
  var timer = null;
  function fmt(a) {
    try {
      if (typeof a === 'string') return a;
      if (a instanceof Error) return a.name + ': ' + a.message;
      return JSON.stringify(a);
    } catch (e) {
      return String(a);
    }
  }
  function flush() {
    timer = null;
    var batch = queue.splice(0);
    if (!batch.length) return;
    fetch('/__sw-log', { method: 'POST', body: JSON.stringify(batch), keepalive: true }).catch(function () {});
  }
  function push(level, args) {
    queue.push({ ts: Date.now(), sw: instance, level: level, msg: Array.prototype.map.call(args, fmt).join(' ') });
    if (!timer) timer = setTimeout(flush, 200);
  }
  var origLog = console.log, origError = console.error;
  console.log = function () { push('log', arguments); return origLog.apply(console, arguments); };
  console.error = function () { push('error', arguments); return origError.apply(console, arguments); };
  push('log', ['[bench] SW script evaluated, instance=' + instance + ' script=' + self.location.search]);
})();
