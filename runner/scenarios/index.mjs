// Order = order in summary.md
import controlSw from './control-sw.mjs';
import controlNosw from './control-nosw.mjs';
import h1CutSw from './h1-cut-sw.mjs';
import h1CutNosw from './h1-cut-nosw.mjs';
import h1Cut503Sw from './h1-cut503-sw.mjs';
import h1Cut503Nosw from './h1-cut503-nosw.mjs';
import h1OutageSw from './h1-outage-sw.mjs';
import h1OutageNosw from './h1-outage-nosw.mjs';
import h1LongOutageSw from './h1-long-outage-sw.mjs';
import h2aZeroSw from './h2a-zero-sw.mjs';
import h2aZeroNosw from './h2a-zero-nosw.mjs';
import h2aPreloadNosw from './h2a-preload-nosw.mjs';
import h2aNoSwSupport from './h2a-no-sw-support.mjs';
import h2bDecodeSw from './h2b-decode-sw.mjs';
import h3First503Sw from './h3-first-503-sw.mjs';
import h3HiddenRangeSw from './h3-hidden-range-sw.mjs';
import h4Expired403Sw from './h4-expired-403-sw.mjs';
import h5TwinSw from './h5-twin-sw.mjs';
import h7SwUpdate from './h7-sw-update.mjs';
import h8StallSw from './h8-stall-sw.mjs';
import h8StallNosw from './h8-stall-nosw.mjs';
import h6LongPlaySw from './h6-long-play-sw.mjs';
import h6LongPauseSw from './h6-long-pause-sw.mjs';
import h6bSwRestart from './h6b-sw-restart.mjs';

export const SCENARIOS = [controlSw, controlNosw, h1CutSw, h1CutNosw, h1Cut503Sw, h1Cut503Nosw, h1OutageSw, h1OutageNosw, h1LongOutageSw,
  h2aZeroSw, h2aZeroNosw, h2aPreloadNosw, h2aNoSwSupport, h2bDecodeSw, h3First503Sw, h3HiddenRangeSw, h4Expired403Sw, h5TwinSw, h7SwUpdate, h8StallSw, h8StallNosw,
  h6LongPlaySw, h6LongPauseSw, h6bSwRestart];
