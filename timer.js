/**
 * Focus Dashboard - Timer & Interception Management Architecture
 * Core Engine Engine for Countdown Tracking and Domain Interception Validation
 */

// Global Application State Variables
let countdownInterval = null;
let secondsRemaining = 0;

// Initialize Workspace Event Listeners on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    initializeTimerState();
    setupNavigationIntercept();
});

/**
 * Validates tracking states across the application container layer
 */
function initializeTimerState() {
    // Clear unexpected runtime locks upon fresh application initializations
    localStorage.setItem("isTimerRunning", "false");
}

/**
 * Main Controller to initiate the focus tracking runtime state
 * @param {number} minutes - User-defined study duration parameters
 */
function startFocusSession(minutes) {
    if (countdownInterval) clearInterval(countdownInterval);

    secondsRemaining = minutes * 60;
    localStorage.setItem("isTimerRunning", "true");
    
    // Toggle system visual UI shield indicators if applicable
    updateShieldUI(true);

    countdownInterval = setInterval(() => {
        secondsRemaining--;
        updateDisplayMetrics(secondsRemaining);

        if (secondsRemaining <= 0) {
            terminateFocusSession(true);
        }
    }, 1000);
}

/**
 * Gracefully terminates the running interval framework and resets state metrics
 * @param {boolean} isCompleted - Distinguishes between manual breaks and complete loops
 */
function terminateFocusSession(isCompleted = false) {
    clearInterval(countdownInterval);
    countdownInterval = null;
    secondsRemaining = 0;
    
    localStorage.setItem("isTimerRunning", "false");
    updateShieldUI(false);
    
    if (isCompleted) {
        alert("Focus Session Complete! Your tracking data has been safely logged.");
    }
}

/**
 * Binds global event interceptors to prevent tab navigation out of bounds
 */
function setupNavigationIntercept() {
    // Intercept clicks on anchor tags generated within the application canvas
    document.addEventListener("click", (event) => {
        const targetAnchor = event.target.closest("a");
        if (!targetAnchor) return;

        const destinationUrl = targetAnchor.getAttribute("href");
        const isTimerActive = localStorage.getItem("isTimerRunning") === "true";

        // Check if the destination contains restricted domain indicators during focus blocks
        if (isTimerActive && isDomainRestricted(destinationUrl)) {
            event.preventDefault(); // Stop the browser from executing navigation
            displayBlockWarning();
        }
    });
}

/**
 * Evaluates whether an outbound destination matches restricted tracking targets
 * @param {string} url - Target URL parsed out of the event object
 * @returns {boolean}
 */
function isDomainRestricted(url) {
    if (!url) return false;
    const targets = ["facebook.com", "fb.com", "instagram.com", "twitter.com"];
    return targets.some(domain => url.toLowerCase().includes(domain));
}

function displayBlockWarning() {
    alert("Access Prohibited: This domain is blocked until your active focus clock runs out!");
}

function updateDisplayMetrics(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    
    // Update the visual node elements inside index.html layout definitions
    const displayNode = document.getElementById("timer-display");
    if (displayNode) {
        displayNode.textContent = `${mins}:${secs}`;
    }
}

function updateShieldUI(isActive) {
    const shieldNode = document.getElementById("focus-shield");
    if (!shieldNode) return;
    
    if (isActive) {
        shieldNode.classList.remove("shield-hidden");
    } else {
        shieldNode.classList.add("shield-hidden");
    }
}