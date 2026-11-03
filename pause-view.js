(function () {
  const elements = {};

  function initialize() {
    elements.status = document.getElementById('pause-status');
    elements.connection = document.getElementById('pause-connection');
    elements.leftPanel = document.getElementById('left-panel');
    elements.clockPanel = document.getElementById('clock-panel');
    elements.timeContext = document.getElementById('time-context');
    elements.systemPanel = document.getElementById('system-panel');
    elements.cpuChart = document.getElementById('cpu-chart');
    elements.gpuChart = document.getElementById('gpu-chart');
    elements.ramChart = document.getElementById('ram-chart');
    elements.albumArt = document.getElementById('albumart');
    elements.visualizer = document.getElementById('canvas');
    elements.overlayToggle = document.getElementById('overlay-toggle');
    elements.reset = document.getElementById('pause-reset');
    elements.pauseToggle = document.getElementById('pause-toggle');
    elements.takePause = document.getElementById('pause-take');
  }

  function isInitialized() {
    return Boolean(elements.status);
  }

  function setDocumentLanguage(translate, overlayConnected, language) {
    document.documentElement.lang = language.locale;
    document.documentElement.dir = language.direction;
    document.title = 'Active Pause Wallpaper';
    if (elements.leftPanel) elements.leftPanel.setAttribute('aria-label', translate('wallpaperLabel'));
    if (elements.clockPanel) elements.clockPanel.setAttribute('aria-label', translate('clockLabel'));
    if (elements.timeContext) elements.timeContext.setAttribute('aria-label', translate('contextLabel'));
    if (elements.systemPanel) elements.systemPanel.setAttribute('aria-label', translate('systemLabel'));
    if (elements.cpuChart) elements.cpuChart.setAttribute('aria-label', translate('cpuLabel'));
    if (elements.gpuChart) elements.gpuChart.setAttribute('aria-label', translate('gpuLabel'));
    if (elements.ramChart) elements.ramChart.setAttribute('aria-label', translate('ramLabel'));
    if (elements.albumArt) elements.albumArt.setAttribute('alt', translate('albumArtLabel'));
    if (elements.visualizer) elements.visualizer.setAttribute('aria-label', translate('visualizerLabel'));
    if (elements.overlayToggle) elements.overlayToggle.setAttribute('aria-label', translate(overlayConnected ? 'deactivate' : 'activate'));
    if (elements.reset) elements.reset.setAttribute('aria-label', translate('restart'));
    if (elements.pauseToggle) elements.pauseToggle.setAttribute('aria-label', translate('pause'));
    if (elements.takePause) elements.takePause.setAttribute('aria-label', translate('takePause'));
  }

  function setConnectionMessage(message) {
    if (elements.connection) elements.connection.textContent = message;
  }

  function bindControls(handlers) {
    elements.overlayToggle.addEventListener('click', handlers.toggleOverlay);
    elements.reset.addEventListener('click', handlers.restart);
    elements.pauseToggle.addEventListener('click', handlers.togglePause);
    elements.takePause.addEventListener('click', handlers.takePause);
  }

  function render({ enabled, overlayConnected, lifecycleName, remainingMs, translate, formatDuration }) {
    if (!isInitialized()) return;

    const active = overlayConnected;
    elements.overlayToggle.textContent = translate(active ? 'deactivate' : 'activate');
    elements.overlayToggle.setAttribute('aria-label', elements.overlayToggle.textContent);
    elements.reset.textContent = translate('restart');
    elements.reset.setAttribute('aria-label', elements.reset.textContent);
    elements.takePause.textContent = translate('takePause');
    elements.takePause.setAttribute('aria-label', elements.takePause.textContent);
    elements.overlayToggle.disabled = !enabled || lifecycleName === 'starting';
    elements.reset.disabled = !active;
    elements.takePause.disabled = !active || lifecycleName !== 'active';
    elements.pauseToggle.disabled = !active || !['active', 'paused'].includes(lifecycleName);
    elements.pauseToggle.textContent = translate(lifecycleName === 'paused' ? 'resume' : 'pause');
    elements.pauseToggle.setAttribute('aria-label', elements.pauseToggle.textContent);

    if (!enabled) elements.status.textContent = translate('disabled');
    else if (lifecycleName === 'starting') elements.status.textContent = translate('starting');
    else if (lifecycleName === 'inactive' || lifecycleName === 'unavailable') elements.status.textContent = translate('stopped');
    else if (lifecycleName === 'paused') elements.status.textContent = translate('paused', { time: formatDuration(remainingMs) });
    else if (lifecycleName === 'warning') elements.status.textContent = translate('warning', { time: formatDuration(remainingMs) });
    else if (lifecycleName === 'pause') elements.status.textContent = translate('break', { time: formatDuration(remainingMs) });
    else elements.status.textContent = translate('active', { time: formatDuration(remainingMs) });

    if (!overlayConnected) {
      elements.connection.textContent = lifecycleName === 'unavailable'
        ? translate('overlayUnavailable')
        : translate('overlayDisconnected');
    } else {
      elements.connection.textContent = translate('overlaySynchronized');
    }
  }

  window.ActivePauseView = {
    bindControls,
    initialize,
    isInitialized,
    render,
    setConnectionMessage,
    setDocumentLanguage
  };
})();
