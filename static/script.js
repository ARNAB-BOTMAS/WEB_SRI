const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const animationContainer = document.getElementById('animationContainer');
const responseContainer = document.getElementById('responseContainer');
const responseText = document.getElementById('responseText');
const musicPlayer = document.getElementById('musicPlayer');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert('Speech recognition not supported by your browser.');
  throw new Error('Speech recognition not supported');
}

const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.continuous = true;

let awake = true;
let processingResponse = false;
let micEnabled = false;
let musicPlaying = false;

// Create Stop Music button but don't add to DOM yet
const stopMusicBtn = document.createElement('button');
stopMusicBtn.textContent = 'Stop Music';
stopMusicBtn.style.marginLeft = '10px';
stopMusicBtn.style.display = 'none'; // hidden initially
stopMusicBtn.onclick = () => {
  if (musicPlaying) {
    musicPlayer.pause();
    musicPlayer.currentTime = 0;
    musicPlaying = false;
    responseText.textContent = 'Music stopped. Listening...';
    setAnimation('listening');
    if (awake) {
      try { recognition.start(); micEnabled = true; } catch(e) {}
    }
    stopMusicBtn.style.display = 'none'; // hide button when stopped
  }
};
// Add button to DOM but hidden
document.body.insertBefore(stopMusicBtn, animationContainer);

function jarvisAnimation(color, innerColor) {
  return `
    <svg viewBox="0 0 100 100" class="glow">
      <circle cx="50" cy="50" r="40" stroke="${color}" stroke-width="2" fill="none">
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="50" r="30" stroke="${color}" stroke-width="1.5" fill="none">
        <animate attributeName="stroke" values="${color};#111;${color}" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="50" r="10" fill="${innerColor}">
        <animate attributeName="r" values="10;12;10" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>`;
}

function setAnimation(state) {
  const animations = {
    listening: jarvisAnimation('#00ffff', '#00ffff'),
    thinking: jarvisAnimation('#ffcc00', '#ffcc00'),
    speaking: jarvisAnimation('#00ff00', '#00ff00'),
    sleeping: jarvisAnimation('#666', '#666'),
    waking: jarvisAnimation('#33ff33', '#33ff33'),
    startup: jarvisAnimation('#3399ff', '#3399ff')
  };
  animationContainer.innerHTML = animations[state] || '';
  animationContainer.appendChild(responseContainer);

  if (state === 'speaking' || musicPlaying) {
    micEnabled = false;
    try { recognition.stop(); } catch (e) {}
  } else if (state === 'listening' && awake && !musicPlaying) {
    if (!micEnabled) {
      micEnabled = true;
      try { recognition.start(); } catch (e) {}
    }
  }
}

function sleepAssistant() {
  awake = false;
  micEnabled = true; // Keep listening for "wake up"
  setAnimation('sleeping');
  responseText.textContent = `Assistant sleeping. Say "wake up" to activate.`;
  responseContainer.style.display = 'block';
  responsiveVoice.speak("Going to sleep now.", "UK English Female", {
    pitch: 0.3, rate: 1, volume: 1
  });
  stopMusicBtn.style.display = 'none'; // hide stop button if sleeping
}

function wakeAssistant() {
  awake = true;
  micEnabled = false;
  setAnimation('waking');
  responseText.textContent = `Assistant waking up...`;
  responseContainer.style.display = 'block';

  responsiveVoice.speak("Waking up. How can I help you?", "UK English Female", {
    pitch: 0.3, rate: 1, volume: 1,
    onstart: () => {
      try { recognition.stop(); } catch (e) {}
    },
    onend: () => {
      if (awake) {
        setAnimation('listening');
        responseText.textContent = 'Listening...';
        try {
          recognition.start();
          micEnabled = true;
        } catch (e) {}
      }
    }
  });
}

recognition.onresult = async (event) => {
  if (processingResponse || musicPlaying) return;

  const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim().replace(/\./g, "");
  console.log('Heard:', transcript);

  if (!awake) {
    if (['wake up', 'weak up', 'good morning', 'goodmorning'].includes(transcript)){
      try { recognition.stop(); } catch (e) {}
      wakeAssistant();
      responseText.textContent = 'Heard "wake up". Assistant active now.';
    } else {
      responseText.textContent = 'Sleeping... Say "wake up" to activate.';
    }
    responseContainer.style.display = 'block';
    return;
  }

  // Music command
  if (transcript.includes('music') && !musicPlaying) {
    musicPlaying = true;
    setAnimation('speaking');
    responseText.textContent = 'Playing music...';
    responseContainer.style.display = 'block';

    micEnabled = false;
    try { recognition.stop(); } catch (e) {}

    musicPlayer.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    musicPlayer.play();

    stopMusicBtn.style.display = 'inline-block'; // show stop button

    musicPlayer.onended = () => {
      musicPlaying = false;
      responseText.textContent = 'Music ended. Listening...';
      setAnimation('listening');
      micEnabled = true;
      stopMusicBtn.style.display = 'none'; // hide stop button when music ends
      try { recognition.start(); } catch (e) {}
    };

    return;
  }

  if (['quit', 'deactivate', 'stop listening', 'stop', 'goodnight', 'good night'].includes(transcript)) {
    responseText.textContent = `Heard "${transcript}". Going to sleep...`;
    responseContainer.style.display = 'block';
    sleepAssistant();
    return;
  }

  processingResponse = true;
  setAnimation('thinking');
  responseText.textContent = `You said: ${transcript}\nSending to server...`;
  responseContainer.style.display = 'block';

  try {
    const res = await fetch('/post-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: transcript })
    });

    const data = await res.json();
    responseText.textContent = `You said: ${transcript}\nServer response: ${data.received}`;
    setAnimation('speaking');

    responsiveVoice.speak(data.received, "UK English Female", {
      pitch: 0.3, rate: 1, volume: 1,
      onend: () => {
        processingResponse = false;
        if (awake) {
          setAnimation('listening');
          responseText.textContent = 'Listening...';
        }
      }
    });
  } catch (err) {
    responseText.textContent = `Error: ${err.message}`;
    setAnimation('listening');
    processingResponse = false;
  }
};

recognition.onerror = (event) => {
  console.error("Recognition error:", event.error);
  if (event.error === "not-allowed" || event.error === "service-not-allowed") {
    micEnabled = false;
    recognition.stop();
  }
  responseText.textContent = `Speech recognition error: ${event.error}`;
  responseContainer.style.display = 'block';
};

recognition.onend = () => {
  if (!processingResponse && micEnabled && awake && !musicPlaying) {
    setTimeout(() => {
      try { recognition.start(); } catch (e) {}
    }, 500);
  }
};

startBtn.onclick = () => {
  awake = true;
  setAnimation('startup');
  responseContainer.style.display = 'none';
  setTimeout(() => {
    wakeAssistant();
  }, 2500);
};

stopBtn.onclick = () => {
  awake = false;
  micEnabled = false;
  try { recognition.stop(); } catch (e) {}
  sleepAssistant();
};
