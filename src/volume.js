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

(() => {
  const ATTR = 'aria-valuenow';
  let enabled = false;
  let started = false;

  const onVolumeChange = (mutations) => {
    if (!enabled) return;
    for (const m of mutations) {
      if (m.attributeName !== ATTR) continue;
      const video = document.querySelector('video');
      const value = Number(m.target.getAttribute(ATTR));
      if (video && Number.isFinite(value)) video.volume = Math.min(1, Math.max(0, value / 100));
    }
  };

  const start = () => {
    if (started) return;
    started = true;

    const attach = (panel) => new MutationObserver(onVolumeChange)
      .observe(panel, { attributes: true, attributeFilter: [ATTR] });

    const existing = document.querySelector('.ytp-volume-panel');
    if (existing) return attach(existing);

    // the player creates the panel lazily
    const waiter = new MutationObserver((_m, self) => {
      const panel = document.querySelector('.ytp-volume-panel');
      if (panel) {
        self.disconnect();
        attach(panel);
      }
    });
    waiter.observe(document.documentElement, { childList: true, subtree: true });
  };

  const apply = (value) => {
    enabled = value === true;
    if (enabled) start();
  };

  chrome.storage.local.get({ disable_LN: ENHANCED_H264IFY_DEFAULTS.disable_LN })
    .then((o) => apply(o.disable_LN));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.disable_LN) apply(changes.disable_LN.newValue);
  });
})();
