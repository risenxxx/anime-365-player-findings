// Launches the real Google Chrome (not Playwright's Chromium: no H.264 there) with a
// throw-away profile and returns the browser WebSocket endpoint.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/**
 * @param {object} o
 *   profileDir  user-data-dir (created; removed by the caller)
 *   netlog      path for --log-net-log, or null
 *   headless    boolean
 *   extraArgs   string[]
 */
export async function launchChrome(o) {
  fs.mkdirSync(o.profileDir, { recursive: true });
  // a persistent profile keeps the port file of its previous session
  fs.rmSync(path.join(o.profileDir, 'DevToolsActivePort'), { force: true });
  const args = [
    `--user-data-dir=${o.profileDir}`,
    '--remote-debugging-port=0',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-search-engine-choice-screen',
    '--disable-background-networking',
    '--autoplay-policy=no-user-gesture-required',
    '--mute-audio', // tab audio only; the player itself is muted as well (rule 0.5)
    '--window-size=1320,860',
    '--disable-features=MediaRouter,OptimizationHints',
    ...(o.netlog ? [`--log-net-log=${o.netlog}`, '--net-log-capture-mode=Default'] : []),
    ...(o.headless ? ['--headless=new'] : []),
    ...(o.extraArgs || []),
    o.startUrl || 'about:blank',
  ];
  const proc = spawn(CHROME, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  proc.stderr.on('data', (d) => (stderr = (stderr + d).slice(-20000)));

  const portFile = path.join(o.profileDir, 'DevToolsActivePort');
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (fs.existsSync(portFile)) {
      const [port, wsPath] = fs.readFileSync(portFile, 'utf8').trim().split('\n');
      if (port && wsPath) return { proc, wsUrl: `ws://127.0.0.1:${port}${wsPath}`, stderr: () => stderr };
    }
    if (proc.exitCode != null) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  proc.kill();
  throw new Error('Chrome did not start: ' + stderr.slice(-2000));
}

export async function stopChrome(proc) {
  if (!proc || proc.exitCode != null) return;
  proc.kill('SIGTERM');
  const t = Date.now();
  while (proc.exitCode == null && Date.now() - t < 8000) await new Promise((r) => setTimeout(r, 100));
  if (proc.exitCode == null) proc.kill('SIGKILL');
}
