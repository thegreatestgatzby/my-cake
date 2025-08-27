document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const copyLinkBtn = document.getElementById("copyLinkBtn");
  const copyMsg = document.getElementById("copyMsg");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  // --- Helper: Encode candle positions ---
  function encodeCandles() {
    // Save only positions and "out" state
    const arr = candles.map(candle => {
      return {
        left: parseFloat(candle.style.left),
        top: parseFloat(candle.style.top),
        out: candle.classList.contains("out")
      };
    });
    return btoa(JSON.stringify(arr));
  }

  // --- Helper: Decode candle positions ---
  function decodeCandles(encoded) {
    try {
      return JSON.parse(atob(encoded));
    } catch (e) {
      return [];
    }
  }

  // --- Update candle count display ---
  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;
  }

  // --- Add candle at position (used for both click and loading from URL) ---
  function addCandle(left, top, out = false) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    if (out) {
      candle.classList.add("out");
    }

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
    updateURL();
  }

  // --- Cake click: add candle and update URL ---
  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top, false);
  });

  // --- Shareable link: copy to clipboard ---
  copyLinkBtn.addEventListener("click", function () {
    const param = encodeCandles();
    const url = window.location.origin + window.location.pathname + "?candles=" + param;

    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        copyMsg.style.display = "inline";
        setTimeout(() => {
          copyMsg.style.display = "none";
        }, 1500);
      }, () => {
        fallbackCopyTextToClipboard(url);
      });
    } else {
      fallbackCopyTextToClipboard(url);
    }
  });

  // --- Fallback for older browsers ---
  function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      if (successful) {
        copyMsg.style.display = "inline";
        setTimeout(() => {
          copyMsg.style.display = "none";
        }, 1500);
      }
    } catch (err) {
      alert('Unable to copy link automatically. Please copy it manually:\n' + text);
    }

    document.body.removeChild(textArea);
  }

  // --- Update browser URL (no reload) ---
  function updateURL() {
    const param = encodeCandles();
    const url = window.location.origin + window.location.pathname + (candles.length ? "?candles=" + param : "");
    window.history.replaceState({}, '', url);
  }

  // --- Load candles from URL on page load ---
  function loadCandlesFromURL() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("candles");
    if (encoded) {
      // Remove any existing candles
      candles.forEach(candle => candle.remove());
      candles = [];
      const arr = decodeCandles(encoded);
      arr.forEach(c => addCandle(c.left, c.top, c.out));
    }
  }

  // --- Candle blow out logic (unchanged) ---
  function isBlowing() {
    if (!analyser) return false;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 40;
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
      updateURL();
    }
  }

  // --- Microphone setup (unchanged) ---
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }

  // --- INITIALIZE: load candles from URL if present ---
  loadCandlesFromURL();
});
