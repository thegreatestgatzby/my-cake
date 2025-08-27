document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candlesContainer = document.querySelector(".candles");
  let candles = [];

  // --- Helper: Encode candle positions and out state ---
  function encodeCandles() {
    return btoa(
      JSON.stringify(
        candles.map(c => ({
          left: parseFloat(c.style.left),
          top: parseFloat(c.style.top),
          out: c.classList.contains("out")
        }))
      )
    );
  }

  // --- Helper: Decode candle positions ---
  function decodeCandles(encoded) {
    try {
      return JSON.parse(atob(encoded));
    } catch (e) {
      console.error("Failed to decode candles:", e);
      return [];
    }
  }

  // --- Create a candle element ---
  function createCandle(left = 0, top = 0, out = false) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    if (out) flame.classList.add("extinguished");

    candle.appendChild(flame);
    candlesContainer.appendChild(candle);
    candles.push(candle);
  }

  // --- Load candles from URL ---
  function loadCandlesFromURL() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("candles");
    if (!data) return;

    const arr = decodeCandles(data);

    arr.forEach(c => createCandle(c.left, c.top, c.out));
  }

  // --- Generate shareable link ---
  function generateShareLink() {
    const encoded = encodeCandles();
    const url = `${window.location.origin}${window.location.pathname}?candles=${encoded}`;
    return url;
  }

  // --- Blow out candles ---
  function blowOutCandles() {
    let anyBlown = false;
    candles.forEach(c => {
      const flame = c.querySelector(".flame");
      if (!c.classList.contains("out") && flame) {
        c.classList.add("out");
        flame.classList.add("extinguished");
        anyBlown = true;
      }
    });
    if (anyBlown) console.log("Candles blown out! Share link:", generateShareLink());
  }

  // --- Microphone setup ---
  async function startMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const mic = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      mic.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function detectBlow() {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        if (volume > 50) blowOutCandles(); // threshold for blowing
        requestAnimationFrame(detectBlow);
      }
      detectBlow();
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }

  // --- Initialize ---
  loadCandlesFromURL();
  startMic();
});
