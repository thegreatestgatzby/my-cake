const canvas = document.getElementById('cakeCanvas');
const ctx = canvas.getContext('2d');
const candleCountSpan = document.getElementById('candleCount');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const clearBtn = document.getElementById('clearBtn');

// The candle array: each candle is {left, top, out}
let candles = [];

// --- Cake drawing parameters ---
const cake = {
  x: 100,
  y: 100,
  width: 200,
  height: 80,
  color: '#f7c873',
  icingColor: '#fff',
  icingHeight: 24
};

// --- Candle drawing ---
function drawCandle(x, y, out = false) {
  // Candle body
  ctx.fillStyle = '#4b85ff';
  ctx.fillRect(x - 4, y - 24, 8, 24);

  // Candle top
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 4, y - 28, 8, 4);

  // Flame
  if (!out) {
    ctx.beginPath();
    ctx.ellipse(x, y - 30, 5, 8, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#f90';
    ctx.stroke();
  }
}

// --- Draw cake & candles ---
function drawCake() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Cake base
  ctx.fillStyle = cake.color;
  ctx.fillRect(cake.x, cake.y, cake.width, cake.height);

  // Icing
  ctx.fillStyle = cake.icingColor;
  ctx.fillRect(cake.x, cake.y, cake.width, cake.icingHeight);

  // Cake border
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 3;
  ctx.strokeRect(cake.x, cake.y, cake.width, cake.height);

  // Candles
  candles.forEach(c => drawCandle(c.left, c.top, c.out));
}

// --- Update candle count ---
function updateCandleCount() {
  candleCountSpan.textContent = `Candles on the Cake: ${candles.length}`;
}

// --- Add candle on cake click ---
canvas.addEventListener('click', function(e) {
  // Get click position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Only allow candles on the icing area
  if (
    x > cake.x + 10 &&
    x < cake.x + cake.width - 10 &&
    y > cake.y - 10 &&
    y < cake.y + cake.icingHeight + 10
  ) {
    candles.push({ left: x, top: cake.y + 8, out: false });
    drawCake();
    updateCandleCount();
    updateURL();
  }
});

// --- Clear candles ---
clearBtn.addEventListener('click', function() {
  candles = [];
  drawCake();
  updateCandleCount();
  updateURL();
});

// --- Copy shareable link ---
copyLinkBtn.addEventListener('click', function() {
  const url = window.location.origin + window.location.pathname + getCandleParam();
  navigator.clipboard.writeText(url).then(() => {
    alert('Shareable link copied to clipboard!');
  });
});

// --- Encode candles into URL ---
function getCandleParam() {
  if (candles.length === 0) return '';
  try {
    const encoded = btoa(JSON.stringify(candles));
    return '?candles=' + encoded;
  } catch (e) {
    return '';
  }
}

// --- Update browser URL (but don't reload) ---
function updateURL() {
  const url = window.location.origin + window.location.pathname + getCandleParam();
  window.history.replaceState({}, '', url);
}

// --- Decode candles from URL ---
function loadCandlesFromURL() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('candles');
  if (encoded) {
    try {
      const arr = JSON.parse(atob(encoded));
      if (Array.isArray(arr)) {
        candles = arr.map(c =>
          typeof c.left === 'number' && typeof c.top === 'number'
            ? { left: c.left, top: c.top, out: !!c.out }
            : null
        ).filter(Boolean);
      }
    } catch (e) {
      candles = [];
    }
  }
}

// --- Initial load ---
loadCandlesFromURL();
drawCake();
updateCandleCount();
updateURL();
