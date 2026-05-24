let timer;
let seconds = 0;
let limitSeconds = 0;
let running = false;

const timerDisplay = document.getElementById("timer");
const remainingDisplay = document.getElementById("remainingDisplay");
const durationInput = document.getElementById("durationInput");
const circle = document.getElementById("progressCircle");

// SVG Arc Configuration Properties
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

// Request System Notification Permissions on Script Initialization
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

/**
 * Extension Communication Bridge
 * Broadcasts tracking updates securely to your unpacked browser companion shield
 * @param {string} actionType - Handshake parameters ("START_TIMER" or "STOP_TIMER")
 */
function signalExtension(actionType) {
  // IMPORTANT: Replace this string with your actual extension ID from chrome://extensions
  const extensionId = "YOUR_EXTENSION_ID_HERE"; 
  
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage(extensionId, { type: actionType }, () => {
      // Catch errors silently if extension isn't loaded yet
      if (chrome.runtime.lastError) {
        console.log("Extension connection status: Waiting for local unpacked installation.");
      }
    });
  }
}

// Audio Synthesis Engine for the Break Chime
function playCompletionSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // First Note (E5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime); 
    gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.4);

    // Second Note (A5) played at a slight delay
    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime);
      gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.6);
    }, 150);

  } catch (error) {
    console.warn("Audio Context blocked or unsupported by browser architecture:", error);
  }
}

// System Alert Orchestration Engine with Integrated Center Pop-Up Modal
function triggerSessionEndNotification() {
  playCompletionSound();

  // 1. Trigger the custom center screen HTML modal animation
  const modalOverlay = document.getElementById("customModal");
  modalOverlay.classList.add("active");

  // 2. Keep the standard system tray notification fallback channel operational
  const title = "Focus Block Completed!";
  const options = {
    body: "Superb work! Your focus block is done. Time to unplug and recharge your mind.",
    icon: "https://cdn-icons-png.flaticon.com/512/2088/2088610.png"
  };

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, options);
  }
}

// Global scope controller handler to close and deactivate modal window overlay
function closeModal() {
  const modalOverlay = document.getElementById("customModal");
  modalOverlay.classList.remove("active");
}

function updateTimer() {
  seconds++;

  let hrs = Math.floor(seconds / 3600);
  let mins = Math.floor((seconds % 3600) / 60);
  let secs = seconds % 60;

  timerDisplay.textContent =
    String(hrs).padStart(2, "0") + ":" +
    String(mins).padStart(2, "0") + ":" +
    String(secs).padStart(2, "0");

  let timeRemaining = limitSeconds - seconds;
  let progressPercent = ((limitSeconds - seconds) / limitSeconds) * 100;
  setProgress(Math.max(0, progressPercent));

  if (timeRemaining <= 0) {
    clearInterval(timer);
    running = false;
    durationInput.disabled = false;
    circle.style.stroke = "#EF4444"; 

    remainingDisplay.textContent = "Time's up! Session ended.";
    
    // SIGNAL EXTENSION: Turn off tracking blocks when timer naturally runs down to 0
    signalExtension("STOP_TIMER");

    // Invoke the notification routing sequence
    triggerSessionEndNotification();

    saveSession(seconds);
    seconds = 0;

    if (typeof loadChart === "function") {
      loadChart();
    }
  } else {
    let remMins = Math.floor(timeRemaining / 60);
    let remSecs = timeRemaining % 60;
    remainingDisplay.textContent = `Remaining: ${String(remMins).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;
  }
}

document.getElementById("startBtn").onclick = function () {
  if (!running) {
    let inputMinutes = parseInt(durationInput.value) || 25;
    limitSeconds = inputMinutes * 60;

    durationInput.disabled = true;
    circle.style.stroke = "#10B981"; 
    remainingDisplay.textContent = `Remaining: ${String(inputMinutes).padStart(2, "0")}:00`;
    setProgress(100);

    timer = setInterval(updateTimer, 1000);
    running = true;

    // SIGNAL EXTENSION: Broadcast study signal to enforce website interception layers
    signalExtension("START_TIMER");
  }
};

document.getElementById("stopBtn").onclick = function () {
  if (running) {
    clearInterval(timer);
    running = false;
    durationInput.disabled = false;
    setProgress(0);

    saveSession(seconds);
    seconds = 0;
    remainingDisplay.textContent = "Session stopped early.";

    if (typeof loadChart === "function") {
      loadChart();
    }

    // SIGNAL EXTENSION: Lift website restrictions immediately when session is cleared early
    signalExtension("STOP_TIMER");
  }
};

// --- Shield Block Simulation Controller Implementation ---
let blockedItems = [];

function addDistraction() {
  const inputElement = document.getElementById("appInput");
  const entityValue = inputElement.value.trim();

  if (entityValue !== "") {
    blockedItems.push(entityValue);
    inputElement.value = "";
    renderDistractions();
    
    if (entityValue.includes(".") && !entityValue.endsWith(".exe")) {
      alert(`[Simulation Active] Inbound HTTP requests bound to "${entityValue}" are now intercepted and dropped.`);
    } else {
      alert(`[Simulation Active] Runtime execution permissions for process "${entityValue}" revoked.`);
    }
  }
}

function renderDistractions() {
  const containerList = document.getElementById("distractionList");
  containerList.innerHTML = "";
  
  blockedItems.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `🚫 Blocked: ${item}`;
    containerList.appendChild(li);
  });
}