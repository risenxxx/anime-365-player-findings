// Shared pieces for scenarios.
export const SLOW = 600 * 1024; // CDN speed for fault scenarios, bytes/s (~2.7x the media bitrate):
// slow enough that the SW forward loader has NOT cached the whole file yet, so faults
// hit live connections (at 4 MB/s the whole episode is cached within ~70 s).

export const cutEvery = (bytes, extra = {}) => ({ action: 'cut', afterBytes: bytes, when: { ...extra } });
export const outageAfterCut = (code, ms, extra = {}) => ({ action: 'status', code, when: { withinMsAfterCut: ms, ...extra } });
export const statusAfterCut = (code, count = 1, extra = {}) => ({ action: 'status', code, when: { afterCut: count, ...extra } });

// H1 verdict: a sustained error -> load -> playing loop that never reaches notifyBroken.
export function judgeLoop(m, { minErrors = 5 } = {}) {
  const cyc = m.errors.length;
  if (cyc === 0) return { verdict: 'не воспроизводится', why: 'Ни одной ошибки <video>: сбой поглощён ниже плеера (повтор в SW или в медиастеке Chrome).' };
  if (cyc >= minErrors && m.notifyBroken === 0 && m.playingEvents > cyc / 2) {
    return { verdict: 'воспроизведено', why: `${cyc} ошибок <video> подряд, после каждой load() и снова playing (playing: ${m.playingEvents}); счётчик errorCounter сбрасывается, notifyBroken не вызван ни разу.` };
  }
  if (m.notifyBroken > 0) return { verdict: 'не воспроизводится', why: `Ошибок: ${cyc}; порог сработал, notifyBroken: ${m.notifyBroken}.` };
  return { verdict: 'частично', why: `Ошибок: ${cyc}, playing: ${m.playingEvents}, notifyBroken: ${m.notifyBroken}.` };
}

// H2 verdict: position goes back to ~0 after an error that happened far into the episode.
export function judgeReset(m) {
  if (m.resetToZero.length) return { verdict: 'воспроизведено', why: `После ошибки позиция ушла в начало: ${m.resetToZero.map((r) => `${r.before.toFixed(0)} с → ${r.after.toFixed(0)} с${r.pausedAfter ? ' (и стоит на паузе)' : ''}`).join('; ')}.` };
  if (!m.errors.length) return { verdict: 'не воспроизводится', why: 'Ошибки <video> не возникло, сбой поглощён ниже плеера.' };
  return { verdict: 'не воспроизводится', why: `Ошибок: ${m.errors.length}, но позиция восстановлена (последняя ct=${m.lastCt}).` };
}
