const OPTION_IDS = Object.keys(ENHANCED_H264IFY_DEFAULTS);

async function restoreOptions() {
  const options = await chrome.storage.local.get(ENHANCED_H264IFY_DEFAULTS);
  for (const id of OPTION_IDS) {
    document.getElementById(id).checked = options[id];
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);

for (const checkbox of document.getElementsByClassName('checkbox')) {
  checkbox.addEventListener('change', (e) => {
    chrome.storage.local.set({ [e.target.id]: e.target.checked });
  });
}

// l10n
for (const element of document.querySelectorAll('[data-l10n-id]')) {
  element.textContent = chrome.i18n.getMessage(element.dataset.l10nId);
}
