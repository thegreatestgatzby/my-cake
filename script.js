// Function to blow out candles
function blowOutCandles() {
  document.querySelectorAll('.flame').forEach(flame => {
    flame.classList.add('extinguished');
  });
  document.querySelector('h1').textContent = "🎉 Happy Birthday! 🎉";
}

// Microphone detection
async function startMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const mic = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    mic.connect(analyser);

    function detectBlow() {
      analyser.getByteFrequencyData(dataArray);
      let volume = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

      if (volume > 50) { // Threshold for "blowing"
        blowOutCandles();
      } else {
        requestAnimationFrame(detectBlow);
      }
    }

    detectBlow();
  } catch (err) {
    console.error('Microphone access denied:', err);
  }
}

startMic();
