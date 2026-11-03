(function () {
  const apiBase = 'http://127.0.0.1:18472';
  const protocolUrl = 'activepauseoverlay://start';

  function launch() {
    const link = document.createElement('a');
    link.href = protocolUrl;
    link.hidden = true;
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
    }
  }

  function requestState() {
    return fetch(`${apiBase}/state`, { cache: 'no-store' });
  }

  async function sendPhase(phase, remainingMs, locale) {
    const query = `phase=${phase}&remainingMs=${Math.max(0, Math.ceil(remainingMs))}&language=${encodeURIComponent(locale)}`;
    const response = await fetch(`${apiBase}/signal?${query}`, { method: 'POST', cache: 'no-store' });
    if (!response.ok) throw new Error(`Overlay returned HTTP ${response.status}`);
  }

  function shutdown() {
    return fetch(`${apiBase}/shutdown`, { method: 'POST', cache: 'no-store' });
  }

  window.ActivePauseOverlayClient = {
    launch,
    requestState,
    sendPhase,
    shutdown
  };
})();
