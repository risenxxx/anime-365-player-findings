// A browser session for one scenario: Chrome + one page target, CDP attached to the
// page only (the embed iframe is same-origin, so it lives in the same target).
// Service worker targets are only *observed* (Target.setDiscoverTargets), never attached.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CDP } from './cdp.mjs';
import { launchChrome, stopChrome } from './chrome.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROBE = fs.readFileSync(path.join(HERE, 'probe.js'), 'utf8');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class Session {
  constructor({ profileDir, netlog, headless, noProbe = false, liteProbe = false }) {
    this.opts = { profileDir, netlog, headless };
    this.noProbe = noProbe;
    this.liteProbe = liteProbe;
    this.events = []; // {t, src:'probe'|'console'|'target'|'runner', ...}
    this.contexts = new Map(); // contextId -> {frameId, isDefault, origin}
    this.frames = new Map(); // frameId -> url
    this.t0 = Date.now();
  }

  rec(src, data) {
    this.events.push({ t: data.t || Date.now(), src, ...data });
  }

  async start() {
    const { proc, wsUrl } = await launchChrome(this.opts);
    this.proc = proc;
    this.cdp = new CDP(wsUrl);
    await this.cdp.opened;
    const c = this.cdp;

    // observe (not attach) service worker targets: start/stop of the worker
    c.on('Target.targetCreated', ({ targetInfo: ti }) => {
      if (ti.type !== 'page') this.rec('target', { ev: 'created', type: ti.type, url: short(ti.url), id: ti.targetId.slice(0, 8) });
    });
    c.on('Target.targetDestroyed', ({ targetId }) => this.rec('target', { ev: 'destroyed', id: targetId.slice(0, 8) }));
    c.on('Target.targetInfoChanged', ({ targetInfo: ti }) => {
      if (ti.type === 'service_worker') this.rec('target', { ev: 'changed', type: ti.type, url: short(ti.url), id: ti.targetId.slice(0, 8), attached: ti.attached });
    });
    await c.send('Target.setDiscoverTargets', { discover: true });

    const { targetInfos } = await c.send('Target.getTargets');
    const page = targetInfos.find((t) => t.type === 'page' && t.url === 'about:blank') || targetInfos.find((t) => t.type === 'page');
    this.pageTargetId = page.targetId;
    const { sessionId } = await c.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
    this.sid = sessionId;

    c.on('Runtime.executionContextCreated', ({ context }) => {
      this.contexts.set(context.id, { frameId: context.auxData?.frameId, isDefault: context.auxData?.isDefault, origin: context.origin });
    }, sessionId);
    c.on('Runtime.executionContextDestroyed', ({ executionContextId }) => this.contexts.delete(executionContextId), sessionId);
    c.on('Runtime.executionContextsCleared', () => this.contexts.clear(), sessionId);
    c.on('Page.frameNavigated', ({ frame }) => this.frames.set(frame.id, frame.url), sessionId);
    c.on('Runtime.consoleAPICalled', (p) => this._onConsole(p), sessionId);
    c.on('Runtime.exceptionThrown', ({ exceptionDetails: d }) => {
      this.rec('exception', { msg: (d.exception?.description || d.text || '').split('\n')[0].slice(0, 300) });
    }, sessionId);

    await c.send('Page.enable', {}, sessionId);
    await c.send('Runtime.enable', {}, sessionId);
    if (!this.noProbe) await c.send('Page.addScriptToEvaluateOnNewDocument', { source: (this.liteProbe ? 'window.__BENCH_LITE__ = true;\n' : '') + PROBE }, sessionId);
  }

  _onConsole(p) {
    const ctx = this.contexts.get(p.executionContextId);
    const frameUrl = ctx ? this.frames.get(ctx.frameId) || '' : '';
    const text = p.args.map((a) => (a.value !== undefined ? (typeof a.value === 'string' ? a.value : JSON.stringify(a.value)) : a.description || a.type)).join(' ');
    if (text.startsWith('__BENCH__')) {
      try {
        const d = JSON.parse(text.slice(9));
        this.rec('probe', { ...d, frame: frameKind(frameUrl) });
      } catch (e) {}
      return;
    }
    this.rec('console', { level: p.type, frame: frameKind(frameUrl), msg: text.slice(0, 600) });
  }

  embedContext() {
    let best = null;
    for (const [id, ctx] of this.contexts) {
      if (!ctx.isDefault) continue;
      const url = this.frames.get(ctx.frameId) || '';
      if (/\/translations\/embed\//.test(url)) best = id;
    }
    return best;
  }

  async evalEmbed(expression, { awaitPromise = true } = {}) {
    const contextId = this.embedContext();
    if (!contextId) throw new Error('embed frame context not found');
    const r = await this.cdp.send('Runtime.evaluate', { expression, contextId, awaitPromise, returnByValue: true }, this.sid);
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  }

  async evalTop(expression) {
    const r = await this.cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, this.sid);
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  }

  async navigate(url) {
    this.rec('runner', { action: 'navigate', url: short(url) });
    await this.cdp.send('Page.navigate', { url }, this.sid);
  }

  async waitForPlayer(timeoutMs = 20000) {
    const t = Date.now();
    while (Date.now() - t < timeoutMs) {
      try {
        const ok = await this.evalEmbed("!!(window.vjs && vjs.players && vjs.players['main-video'] && vjs.players['main-video'].concatenate)");
        if (ok) return true;
      } catch (e) {}
      await sleep(250);
    }
    throw new Error('player did not initialise');
  }

  // ---- user actions (always through the player API, like the UI does) ----
  async act(action, arg) {
    this.rec('runner', { action, arg });
    const P = "vjs.players['main-video']";
    switch (action) {
      case 'mute': return this.evalEmbed(`(${P}.muted(true), ${P}.volume(0), true)`);
      case 'play': return this.evalEmbed(`(${P}.muted(true), ${P}.play(), true)`);
      case 'pause': return this.evalEmbed(`(${P}.pause(), true)`);
      case 'seek': return this.evalEmbed(`(${P}.currentTime(${+arg}), true)`);
      case 'hide': {
        const { targetId } = await this.cdp.send('Target.createTarget', { url: 'about:blank', background: false });
        this.otherTab = targetId;
        await this.cdp.send('Target.activateTarget', { targetId });
        return true;
      }
      case 'show': {
        await this.cdp.send('Target.activateTarget', { targetId: this.pageTargetId });
        if (this.otherTab) { await this.cdp.send('Target.closeTarget', { targetId: this.otherTab }).catch(() => {}); this.otherTab = null; }
        return true;
      }
      // Stop the SW the way the browser does on idle (sent to the PAGE session; no DevTools
      // session is attached to the worker itself).
      case 'stopSW': {
        await this.cdp.send('ServiceWorker.enable', {}, this.sid);
        await this.cdp.send('ServiceWorker.stopAllWorkers', {}, this.sid);
        await this.cdp.send('ServiceWorker.disable', {}, this.sid);
        return true;
      }
      case 'swUpdate': return this.evalEmbed('navigator.serviceWorker.getRegistration().then(r => r ? r.update().then(() => "updated") : "no-reg")');
      default: throw new Error('unknown action ' + action);
    }
  }

  async state() {
    return this.evalEmbed(`(() => { const p = vjs.players['main-video']; const v = p.tech && p.tech.el_;
      return { ct: p.currentTime(), paused: p.paused(), errorCounter: p.errorCounter, lastSuccessTime: p.lastSuccessTime,
        blacklisted: Object.keys(p.concatenate._blacklistedMParams || {}), ctrl: !!navigator.serviceWorker.controller,
        rs: v && v.readyState }; })()`);
  }

  async cacheInfo() {
    return this.evalEmbed(`(async () => { const out = {}; for (const k of await caches.keys()) {
      const c = await caches.open(k); out[k] = (await c.keys()).length; } return out; })()`);
  }

  async stop() {
    try { this.cdp?.close(); } catch (e) {}
    await stopChrome(this.proc);
  }
}

function short(url) {
  if (!url) return url;
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):\d+/, '');
}
function frameKind(url) {
  if (/\/translations\/embed\//.test(url)) return 'embed';
  if (/\/bench\/watch/.test(url)) return 'host';
  return url ? 'other' : '';
}
