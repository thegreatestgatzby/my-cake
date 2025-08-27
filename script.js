// Adds candles to the cake when you click on it
document.querySelector('.cake').addEventListener('click', function (e) {
  const candle = document.createElement('div');
  candle.className = 'candle';
  const rect = e.currentTarget.getBoundingClientRect();
  let left = e.clientX - rect.left - 5;
  let top = e.clientY - rect.top - 30;
  left = Math.max(20, Math.min(left, 210));
  top = Math.max(60, Math.min(top, 140));
  candle.style.left = left + 'px';
  candle.style.top = top + 'px';
  e.currentTarget.appendChild(candle);
});
