// Minimal Chrome DevTools Protocol client over a single browser WebSocket.
// Sessions are attached explicitly with Target.attachToTarget({flatten:true}).
// Deliberately NO Target.setAutoAttach: we never attach to service workers, because an
// attached DevTools session cancels Chrome's SW termination timeout (see H6).
import WebSocket from 'ws';

export class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl, { perMessageDeflate: false, maxPayload: 256 * 1024 * 1024 });
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map(); // `${sessionId||''}|${method}` -> [fn]
    this.ws.on('message', (data) => this._onMessage(JSON.parse(data)));
    this.opened = new Promise((resolve, reject) => {
      this.ws.once('open', resolve);
      this.ws.once('error', reject);
    });
    this.closed = new Promise((resolve) => this.ws.once('close', resolve));
  }

  _onMessage(msg) {
    if (msg.id != null) {
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`));
      else p.resolve(msg.result);
      return;
    }
    for (const key of [`${msg.sessionId || ''}|${msg.method}`, `*|${msg.method}`]) {
      for (const fn of this.handlers.get(key) || []) fn(msg.params, msg.sessionId);
    }
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify(msg));
    });
  }

  /** sessionId '*' = any session */
  on(method, fn, sessionId = '') {
    const key = `${sessionId}|${method}`;
    if (!this.handlers.has(key)) this.handlers.set(key, []);
    this.handlers.get(key).push(fn);
  }

  close() {
    try { this.ws.close(); } catch (e) {}
  }
}
