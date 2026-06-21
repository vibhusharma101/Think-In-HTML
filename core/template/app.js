// Think-In-HTML renderer — reads window.ANALYSIS and builds the interactive UI.
// Implementation coming in M1.
(function () {
  'use strict';
  if (typeof ANALYSIS === 'undefined') {
    document.getElementById('app').textContent = 'No analysis data found.';
    return;
  }
  window.__THINK__ = ANALYSIS;
})();
