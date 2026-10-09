/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 alextrv
 * Copyright (c) 2015 erkserkserks
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
 * SOFTWARE.
 */

// Registered with world: MAIN so it runs before YouTube's own scripts
(() => {
  'use strict';

  const STORAGE_KEY = 'enhanced-h264ify';
  const CONFIG_EVENT = 'enhanced-h264ify:config';

  // Keep in sync with defaults.js, which isn't loaded in this world
  const DEFAULTS = {
    block_60fps: false,
    block_h264: false,
    block_vp8: true,
    block_vp9: true,
    block_av1: true,
    block_opus: false,
    block_mp4a: false
  };

  const CODEC_TOKENS = {
    block_h264: ['avc'],
    block_vp8: ['vp8'],
    block_vp9: ['vp9', 'vp09'],
    block_av1: ['av01', 'av99'],
    block_opus: ['opus'],
    block_mp4a: ['mp4a']
  };

  let cfg = { ...DEFAULTS };

  const applyConfig = (json) => {
    try {
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed === 'object') cfg = { ...DEFAULTS, ...parsed };
    } catch (_) {}
  };

  // Cache from the last page load; chrome.storage is async and unavailable here
  try { applyConfig(localStorage.getItem(STORAGE_KEY)); } catch (_) {}

  document.addEventListener(CONFIG_EVENT, (e) => applyConfig(e.detail));

  const toFps = (f) => {
    if (typeof f === 'number') return f;
    if (typeof f === 'string') { // can be a rational like "30000/1001"
      const [n, d] = f.split('/').map(Number);
      return d ? n / d : n;
    }
    return undefined;
  };

  const isBlocked = (type, fps) => {
    const t = String(type).toLowerCase();
    for (const [option, tokens] of Object.entries(CODEC_TOKENS)) {
      if (cfg[option] === true && tokens.some((tok) => t.includes(tok))) return true;
    }
    if (cfg.block_60fps === true) {
      if (fps === undefined) {
        const m = /framerate=(\d+)/.exec(t);
        fps = m ? Number(m[1]) : 0;
      }
      if (fps > 30) return true;
    }
    return false;
  };

  // Proxy so toString() still reports native code
  const wrap = (obj, name, apply) => {
    const orig = obj && obj[name];
    if (typeof orig === 'function') obj[name] = new Proxy(orig, { apply });
  };

  if (window.HTMLMediaElement) {
    wrap(HTMLMediaElement.prototype, 'canPlayType', (target, self, args) =>
      isBlocked(args[0]) ? '' : Reflect.apply(target, self, args));
  }

  if (window.MediaSource) {
    wrap(MediaSource, 'isTypeSupported', (target, self, args) =>
      isBlocked(args[0]) ? false : Reflect.apply(target, self, args));
  }

  // YouTube consults this API too
  if (window.MediaCapabilities) {
    wrap(MediaCapabilities.prototype, 'decodingInfo', (target, self, args) => {
      const c = args[0];
      const v = c && c.video;
      const a = c && c.audio;
      if ((v && isBlocked(v.contentType, toFps(v.framerate))) ||
          (a && isBlocked(a.contentType, 0))) {
        return Promise.resolve({
          supported: false,
          smooth: false,
          powerEfficient: false,
          keySystemAccess: null,
          configuration: c
        });
      }
      return Reflect.apply(target, self, args);
    });
  }
})();
