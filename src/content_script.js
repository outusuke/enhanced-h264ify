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

// main_world.js can't use chrome.storage, so options go over by event + localStorage cache

(() => {
  const STORAGE_KEY = 'enhanced-h264ify';
  const CONFIG_EVENT = 'enhanced-h264ify:config';

  // Drop the per-option keys written by <= 2.2.x
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_KEY + '-'))
      .forEach((k) => localStorage.removeItem(k));
  } catch (_) {}

  const publish = (options) => {
    const json = JSON.stringify(options);
    try { localStorage.setItem(STORAGE_KEY, json); } catch (_) {}
    // string detail: objects don't reliably cross worlds
    document.dispatchEvent(new CustomEvent(CONFIG_EVENT, { detail: json }));
  };

  const refresh = () => chrome.storage.local.get(ENHANCED_H264IFY_DEFAULTS).then(publish);

  refresh();
  chrome.storage.onChanged.addListener((_changes, area) => {
    if (area === 'local') refresh();
  });
})();
