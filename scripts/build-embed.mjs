// Builds the local embed page from the downloaded copy (vendor/site/translations/embed/<id>).
//
// Whitelist assembly: only these parts of the original page are kept, in order:
//   - <style> blocks and <title> from <head>
//   - the `site` config script (CSRF token replaced, videoLoadingEngine set per scenario)
//   - the small Proxy/freeze script that follows it
//   - the "please do not parse" notice script, with the activateDebugInfo blob emptied
//   - the <video id="main-video"> tag with our own sources (data-require-activation="0")
//   - every external same-origin <script src="/..."> in the original order
//   - the requirejs config script and the init script (initVideo), with local URLs
// Everything else is dropped: the obfuscated data: script and the tiny script that
// removes its tag (never decoded), the seed plugin and external script loaders,
// counters, the promo overlay, the cookie-sync image.

const ESC = { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' };
const attrEscape = (s) => String(s).replace(/[&"<>]/g, (c) => ESC[c]);

function scripts(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) out.push({ attrs: m[1], body: m[2], full: m[0] });
  return out;
}

const find = (list, pred, what) => {
  const s = list.find(pred);
  if (!s) throw new Error(`build-embed: ${what} not found in the downloaded embed (site changed?)`);
  return s;
};

/**
 * @param {string} html  original embed page
 * @param {object} o
 *   engine: 'singlethread' | 'multithread' | 'off'
 *   sources, alternativeSources: arrays [{height,type,urls:[...]}]
 *   backgroundSources: {m: [url]}
 *   embedId, pageUrl, duration, width, height
 */
export function buildEmbed(html, o) {
  const head = html.slice(0, html.indexOf('</head>'));
  const styles = head.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || [];
  const title = (head.match(/<title>[\s\S]*?<\/title>/i) || ['<title>bench</title>'])[0];
  const all = scripts(html);

  const config = find(all, (s) => /var site = \{/.test(s.body), 'site config script');
  const freeze = all.find((s) => /isProxy/.test(s.body) && !/src=/.test(s.attrs));
  const notice = all.find((s) => /activateDebugInfo/.test(s.body));
  const rjsConfig = find(all, (s) => /'requirejs_config'/.test(s.body), 'requirejs config');
  const init = find(all, (s) => /'init_scripts'/.test(s.body), 'init script');
  const external = all.filter((s) => /\ssrc="\/[^/]/.test(' ' + s.attrs) && !/src="data:/.test(s.attrs));

  const engine = o.engine || 'singlethread';
  const configBody = config.body
    .replace(/'csrf':'[^']*'/, "'csrf':'bench'")
    .replace(/YII_CSRF_TOKEN = "[^"]*"/, 'YII_CSRF_TOKEN = "bench"')
    .replace(/'multithreadedLoadingEnabled':(true|false)/, `'multithreadedLoadingEnabled':${engine === 'multithread'}`)
    .replace(/'videoLoadingEngine':'[^']*'/, `'videoLoadingEngine':'${engine}'`);

  const noticeBody = notice ? notice.body.replace(/window\.activateDebugInfo = "[^"]*";/, 'window.activateDebugInfo = "";') : '';

  const origVideo = html.match(/<video\b[^>]*id="main-video"[^>]*>/i);
  if (!origVideo) throw new Error('build-embed: <video id="main-video"> not found');
  const set = {
    'data-url': `/translations/embed/${o.embedId}`,
    'data-page-url': o.pageUrl,
    'data-subtitles': '',
    'data-vtt': '',
    'data-fonts': '[]',
    'data-sources': JSON.stringify(o.sources || []),
    'data-alternative-sources': JSON.stringify(o.alternativeSources || []),
    'data-background-sources': JSON.stringify(o.backgroundSources || {}),
    'data-require-activation': '0',
    'data-id': String(o.embedId),
    'data-title': 'bench',
  };
  if (o.duration) set['data-duration'] = String(o.duration);
  if (o.width) set['data-video-width'] = String(o.width);
  if (o.height) set['data-video-height'] = String(o.height);
  let video = origVideo[0];
  for (const [k, v] of Object.entries(set)) {
    const re = new RegExp(`\\s${k}="[^"]*"`);
    const a = ` ${k}="${attrEscape(v)}"`;
    video = re.test(video) ? video.replace(re, a) : video.replace(/>$/, a + '>');
  }

  const initBody = init.body
    .replace(/'url':'[^']*'/, `'url':'\\x2Ftranslations\\x2Fembed\\x2F${o.embedId}'`)
    .replace(/'pageUrl':'[^']*'/, `'pageUrl':'${o.pageUrl.replace(/\//g, '\\x2F')}'`)
    .replace(/'cid':'[^']*'/, "'cid':''");

  const tag = (body, attrs = ' type="text/javascript"') => `<script${attrs}>${body}</script>`;
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0"/>
<!-- Local bench build of the embed page. See scripts/build-embed.mjs for what is kept. -->
${styles.join('\n')}
${title}
${tag(configBody)}
${freeze ? tag(freeze.body, '') : ''}
${notice ? tag(noticeBody, '') : ''}
</head>
<body class="embed-layout">
<div class="embed-container">
${video}<p class="vjs-no-js">bench</p></video>
</div>
${external.map((s) => s.full).join('\n')}
${tag(rjsConfig.body)}
${tag(initBody)}
</body>
</html>
`;
}
