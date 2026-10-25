// Injected with Page.addScriptToEvaluateOnNewDocument into every frame of the page
// target (the embed is a same-origin iframe). Observes only; does not change player logic.
// Emits lines `console.debug('__BENCH__' + json)` that the runner reads via CDP.
(function () {
  if (window.__benchProbe) return;
  window.__benchProbe = true;
  var dbg = console.debug.bind(console);
  function mOf(src) {
    try { return new URL(src, location.href).searchParams.get('m'); } catch (e) { return null; }
  }
  function emit(type, data) {
    data = data || {};
    data.type = type;
    data.t = Date.now();
    dbg('__BENCH__' + JSON.stringify(data));
  }
  function desc(el) {
    if (el.id) return el.id;
    return el.isConnected ? 'video' : 'detached';
  }
  function stack() {
    var s = (new Error().stack || '').split('\n').slice(3, 7).map(function (l) {
      return l.trim().replace(/^at /, '').replace(/https?:\/\/[^/]+/g, '').replace(/\?[^:)]*/g, '');
    });
    return s.join(' < ');
  }
  function src(el) { var s = el.currentSrc || el.getAttribute('src') || ''; return { m: mOf(s), rand: /[?&]rand=/.test(s) }; }

  var watched = new WeakSet();
  var EV = ['loadstart', 'durationchange', 'loadedmetadata', 'canplay', 'playing', 'waiting', 'seeking', 'seeked',
    'pause', 'play', 'error', 'stalled', 'abort', 'emptied', 'ended'];
  function onEv(ev) {
    var v = ev.target;
    if (!(v instanceof HTMLMediaElement)) return;
    if (ev.type === 'loadstart' || ev.type === 'play') { try { v.muted = true; v.volume = 0; } catch (e) {} }
    var d = { ev: ev.type, el: desc(v), ct: +v.currentTime.toFixed(2), rs: v.readyState, ns: v.networkState, msrc: src(v) };
    if (v.error) d.err = { code: v.error.code, message: (v.error.message || '').slice(0, 200) };
    emit('media', d);
  }
  function watch(el) {
    if (watched.has(el)) return;
    watched.add(el);
    if (!el.isConnected) EV.forEach(function (e) { el.addEventListener(e, onEv); });
  }
  EV.forEach(function (e) { document.addEventListener(e, onEv, true); });

  // Lite mode (live runs): no prototype wrappers. On the real site, wrapping these
  // prototypes broke the SW API in the embed iframe on a repeat visit (InvalidStateError,
  // no controller); reloads are still visible through emptied/loadstart events.
  if (window.__BENCH_LITE__) return startTicks();
  var P = HTMLMediaElement.prototype;
  var origLoad = P.load;
  P.load = function () {
    watch(this);
    emit('call', { fn: 'load', el: desc(this), ct: +this.currentTime.toFixed(2), msrc: src(this), stack: stack() });
    return origLoad.apply(this, arguments);
  };
  var srcDesc = Object.getOwnPropertyDescriptor(P, 'src');
  Object.defineProperty(P, 'src', {
    configurable: true, enumerable: true,
    get: function () { return srcDesc.get.call(this); },
    set: function (v) {
      watch(this);
      emit('call', { fn: 'src=', el: desc(this), m: v ? mOf(v) : null, rand: /[?&]rand=/.test(v || ''), empty: !v, stack: stack() });
      return srcDesc.set.call(this, v);
    }
  });
  var origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (this instanceof HTMLMediaElement && String(name).toLowerCase() === 'src') {
      watch(this);
      emit('call', { fn: 'setAttribute(src)', el: desc(this), m: mOf(value), rand: /[?&]rand=/.test(value || ''), stack: stack() });
    }
    return origSetAttr.apply(this, arguments);
  };

  function startTicks() { ticks(); }
  function mainVideo() {
    return document.getElementById('main-video_html5_api') || document.querySelector('video');
  }
  function ticks() { setInterval(function () {
    var v = mainVideo();
    if (!v) return;
    var ahead = 0;
    try {
      for (var i = 0; i < v.buffered.length; i++) {
        if (v.buffered.start(i) <= v.currentTime + 0.5 && v.buffered.end(i) > v.currentTime) ahead = v.buffered.end(i) - v.currentTime;
      }
    } catch (e) {}
    emit('tick', {
      ct: +v.currentTime.toFixed(2), paused: v.paused, rs: v.readyState, ns: v.networkState,
      ahead: +ahead.toFixed(1), vis: document.visibilityState,
      ctrl: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
      muted: v.muted, msrc: src(v)
    });
  }, 1000); }
  if (!window.__BENCH_LITE__) ticks();
  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', function () { emit('sw', { ev: 'controllerchange' }); });
  }
  document.addEventListener('visibilitychange', function () { emit('page', { ev: 'visibility', vis: document.visibilityState }); });
})();
