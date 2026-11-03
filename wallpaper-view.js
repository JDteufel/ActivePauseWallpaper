(function () {
let canvas = document.getElementById("canvas");
let max_height, startPos, vizWidth, midY;
let maxVal = 1;
let waveHeights = new Float64Array(0);

let glob = { bloom: false, bloomRadius: 10 };
let backgroundColor = "rgb(0,0,0)";
let linesColor = "rgb(224, 120, 0)";
let square = true;
let audioSensitivity = 5;
let metricHistory = {
  cpu: [],
  gpu: [],
  ram: []
};

let ctx = canvas.getContext("2d");
let gradient;

function setSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  max_height = window.innerHeight * 0.1;
  startPos = window.innerWidth * 0.87;
  vizWidth = window.innerWidth * 0.1;
  midY = canvas.height - canvas.height / 1.15;

  gradient = ctx.createLinearGradient(0,midY, 0, max_height);
  gradient.addColorStop(0, backgroundColor);
  gradient.addColorStop(1, linesColor);

}

window.onload = () => {
  setSize();
  updateClock();
  setInterval(updateClock, 1000);
};

window.onresize = () => {
  setSize();
};

function livelyPropertyListener(name, val)
{
  switch(name) {
    case "lineColor":
      const color = hexToRgb(val);
      if (!color) {
        console.warn("Ignoring invalid Lively line color:", val);
        break;
      }
      linesColor=`rgb(${color.r},${color.g},${color.b})`;
      updateGradient();
      break;
    case "backgroundColor": {
      const color = hexToRgb(val);
      if (!color) {
        console.warn("Ignoring invalid Lively background color:", val);
        break;
      }
      backgroundColor = `rgb(${color.r},${color.g},${color.b})`;
      updateGradient();
      break;
    }
    case "square":
      if (val === true || val === 1 || val === "1" || (typeof val === "string" && val.toLowerCase() === "true")) {
        square = true;
      } else if (val === false || val === 0 || val === "0" || (typeof val === "string" && val.toLowerCase() === "false")) {
        square = false;
      } else {
        console.warn("Ignoring invalid Lively waveform shape:", val);
      }
      break;
    case "audioSensitivity": {
      const sensitivity = Number(val);
      if (!Number.isFinite(sensitivity)) {
        console.warn("Ignoring invalid Lively audio sensitivity:", val);
        break;
      }
      audioSensitivity = Math.min(20, Math.max(1, sensitivity));
      break;
    }
  }
}

function updateGradient() {
  if (!Number.isFinite(midY) || !Number.isFinite(max_height)) return;
  gradient = ctx.createLinearGradient(0, midY, 0, max_height);
  gradient.addColorStop(0, backgroundColor);
  gradient.addColorStop(1, linesColor);
}

function drawWave(anchorX, direction = 1, verticalMirror = false) {
  const offSet = vizWidth / waveHeights.length;

  ctx.beginPath();
  ctx.lineJoin = "round";
  ctx.moveTo(anchorX + direction * offSet * 3, midY);
  ctx.lineTo(anchorX, midY);

  let posInLine = -1;
  for (var x = 0; x < waveHeights.length; x++) {
    posInLine++;
    const valueX = anchorX + direction * offSet * posInLine;
    const valueY = midY - waveHeights[x];
    const drawY = verticalMirror ? midY + (midY - valueY) : valueY;

    ctx.lineTo(valueX, drawY);

    if (square)
      ctx.lineTo(
        anchorX + direction * offSet * (posInLine + 1),
        drawY
      );
  }

  ctx.lineTo(anchorX + direction * offSet * (posInLine + (square ? 1 : 0)), midY);
  ctx.lineTo(anchorX + direction * offSet * (posInLine + (square ? 4 : 3)), midY);

  ctx.fillStyle = gradient;
  ctx.fill();
  renderLine(linesColor);
}

function drawMirrorWave(anchorX) {
  drawWave(anchorX, -1, false);
}

function drawVerticalMirrorWave(anchorX) {
  drawWave(anchorX, 1, true);
  drawWave(anchorX, -1, true);
}

function livelyAudioListener(audioArray)
{
  maxVal = 1;
  if (waveHeights.length !== audioArray.length) {
    waveHeights = new Float64Array(audioArray.length);
  }

  for (var x of audioArray) {
    if (x > maxVal) maxVal = x;
  }

  for (let x = 0; x < audioArray.length; x++) {
    const amplifiedValue = Math.min(audioArray[x] * audioSensitivity, maxVal);
    waveHeights[x] = (amplifiedValue / maxVal) * max_height;
  }

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawWave(startPos, 1, false);
  drawMirrorWave(startPos);
  drawVerticalMirrorWave(startPos);
}

function renderLine(color) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  if (glob.bloom) {
    ctx.shadowBlur = glob.bloomRadius;
    ctx.shadowColor = color;
  }
  ctx.stroke();
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function updateClock() {
  const now = new Date();
  const locale = typeof window.getActivePauseLocale === 'function'
    ? window.getActivePauseLocale()
    : 'en-US';
  document.getElementById('clock').textContent = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const calendarDate = now.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('date').textContent = calendarDate;
  if (typeof window.getClockContextText === 'function') {
    document.getElementById('time-context').textContent = window.getClockContextText(now);
  }
}

function formatPercentage(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `${numericValue.toFixed(0)}%` : '--';
}

function addMetricSample(metric, value) {
  if (!Number.isFinite(value)) return;
  metricHistory[metric].push(value);
  if (metricHistory[metric].length > 40) metricHistory[metric].shift();
}

function drawMetricChart(chartId, series, maximum) {
  const chart = document.getElementById(chartId);
  const context = chart.getContext('2d');
  const width = chart.width;
  const height = chart.height;

  context.clearRect(0, 0, width, height);
  context.strokeStyle = 'rgba(224, 120, 0, 0.25)';
  context.lineWidth = 1;
  for (let y = 1; y < 4; y++) {
    const position = (height / 4) * y;
    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(width, position);
    context.stroke();
  }

  series.forEach(({ values, color }) => {
    if (values.length < 2) return;

    context.beginPath();
    values.forEach((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (Math.min(maximum, Math.max(0, value)) / maximum) * height;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.shadowBlur = 6;
    context.shadowColor = color;
    context.stroke();
  });
  context.shadowBlur = 0;
}

function livelySystemInformation(data) {
  if (!data) return;

  try {
    const obj = JSON.parse(data);
    if (!obj) return;

    const currentCpu = Number(obj.CurrentCpu);
    document.getElementById('cpu-value').textContent = formatPercentage(currentCpu);
    addMetricSample('cpu', currentCpu);
    drawMetricChart('cpu-chart', [{ values: metricHistory.cpu, color: '#e07800' }], 100);

    const currentGpu = Number(obj.CurrentGpu3D);
    document.getElementById('gpu-value').textContent = formatPercentage(currentGpu);
    addMetricSample('gpu', currentGpu);
    drawMetricChart('gpu-chart', [{ values: metricHistory.gpu, color: '#e07800' }], 100);

    const totalRam = Number(obj.TotalRam);
    const availableRam = Number(obj.CurrentRamAvail);
    const usedRam = totalRam > 0 && Number.isFinite(availableRam)
      ? ((totalRam - availableRam) / totalRam) * 100
      : NaN;
    document.getElementById('ram-value').textContent = formatPercentage(usedRam);
    addMetricSample('ram', usedRam);
    drawMetricChart('ram-chart', [{ values: metricHistory.ram, color: '#e07800' }], 100);

  } catch (e) {
    console.error('Error parsing system information:', e);
  }
}

// Handle current track display
function livelyCurrentTrack(data) {
  const trackContainer = document.getElementById('track-container');
  const albumart = document.getElementById('albumart');
  const trackTitle = document.getElementById('track-title');
  const trackArtist = document.getElementById('track-artist');

  if (!data) return;

  try {
    const obj = JSON.parse(data);

    if (obj != null) {
      // Update title and artist
      trackTitle.innerText = obj.Title || '-';
      trackArtist.innerText = obj.Artist || '-';

      // Update album art
      if (obj.Thumbnail != null) {
        const base64String = !obj.Thumbnail.startsWith('data:image/')
          ? 'data:image/png;base64,' + obj.Thumbnail
          : obj.Thumbnail;
        albumart.src = base64String;
      } else {
        // Fallback: create a placeholder
        albumart.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23333%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
      }

      // Show track container
      trackContainer.style.opacity = '1';
    } else {
      // Hide track container when no track is playing
      trackContainer.style.opacity = '0';
    }
  } catch (e) {
    console.error('Error parsing track data:', e);
  }
}

window.ActivePauseWallpaperView = {
  livelyAudioListener,
  livelyCurrentTrack,
  livelyPropertyListener,
  livelySystemInformation,
  updateClock
};
})();
