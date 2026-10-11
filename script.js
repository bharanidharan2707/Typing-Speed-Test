
const passageText =
    "Learning new skills takes time and practice. " +
    "Every day is a new opportunity to improve. " +
    "Stay focused, keep learning, and never give up.";

const passageElement = document.getElementById("passage");
const typingInput = document.getElementById("typing-input");

const timerElement = document.getElementById("timer");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");

const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");
const messageElement = document.getElementById("message");

const resultSection = document.getElementById("result-section");
const finalWpm = document.getElementById("final-wpm");
const finalAccuracy = document.getElementById("final-accuracy");
const finalCorrect = document.getElementById("final-correct");

const TEST_DURATION = 60;

let timeLeft = TEST_DURATION;
let timerId = null;
let startTime = null;
let testStarted = false;
let testFinished = false;

// Display the passage one character at a time
function displayPassage() {
    passageElement.replaceChildren();

    for (const character of passageText) {
        const span = document.createElement("span");
        span.textContent = character;
        passageElement.appendChild(span);
    }

    highlightCharacters("");
}

// Highlight correct, incorrect, and current characters
function highlightCharacters(typedText) {
    const characters = passageElement.querySelectorAll("span");

    characters.forEach((span, index) => {
        span.className = "";

        if (index < typedText.length) {
            if (typedText[index] === passageText[index]) {
                span.classList.add("correct");
            } else {
                span.classList.add("incorrect");
            }
        } else if (index === typedText.length) {
            span.classList.add("current");
        }
    });
}

// Calculate typing speed and accuracy
function updateStats() {
    const typedText = typingInput.value;
    const characters = passageElement.querySelectorAll("span");

    let correctCharacters = 0;

    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === passageText[i]) {
            correctCharacters++;
        }
    }

    const elapsedMinutes = startTime === null
        ? 0
        : Math.max((Date.now() - startTime) / 60000, 1 / 60000);

    const wpm = Math.round(
        (correctCharacters / 5) / elapsedMinutes
    );

    const accuracy = typedText.length === 0
        ? 100
        : Math.round(
            (correctCharacters / typedText.length) * 100
        );

    wpmElement.textContent = wpm;
    accuracyElement.textContent = accuracy + "%";

    highlightCharacters(typedText);

    return {
        wpm: wpm,
        accuracy: accuracy,
        correctCharacters: correctCharacters
    };
}

// Start the 60-second test
function startTest() {
    if (testStarted || testFinished) return;

    testStarted = true;
    startTime = Date.now();

    typingInput.disabled = false;
    typingInput.focus();

    startButton.disabled = true;
    messageElement.textContent = "Start typing the passage!";

    timerId = setInterval(() => {
        const elapsedSeconds = Math.floor(
            (Date.now() - startTime) / 1000
        );

        timeLeft = Math.max(
            0,
            TEST_DURATION - elapsedSeconds
        );

        timerElement.textContent = timeLeft;
        updateStats();

        if (timeLeft <= 0) {
            finishTest();
        }
    }, 100);
}

// Handle typing
typingInput.addEventListener("input", () => {
    if (!testStarted || testFinished) return;

    const stats = updateStats();

    if (typingInput.value.length >= passageText.length) {
        finishTest();
    } else if (stats.accuracy < 100) {
        messageElement.textContent =
            "Some characters are incorrect. Keep going!";
    } else {
        messageElement.textContent = "Great! Keep typing.";
    }
});

// Finish the test and show results
function finishTest() {
    if (testFinished) return;

    testFinished = true;
    clearInterval(timerId);

    typingInput.disabled = true;
    startButton.disabled = true;

    const stats = updateStats();

    finalWpm.textContent = "Typing Speed: " + stats.wpm + " WPM";
    finalAccuracy.textContent =
        "Accuracy: " + stats.accuracy + "%";
    finalCorrect.textContent =
        "Correct Characters: " + stats.correctCharacters;

    resultSection.classList.remove("hidden");
    messageElement.textContent = "Test completed. Well done!";
}

// Reset everything and prepare a new test
function restartTest() {
    clearInterval(timerId);

    timeLeft = TEST_DURATION;
    startTime = null;
    testStarted = false;
    testFinished = false;
    timerId = null;

    timerElement.textContent = TEST_DURATION;
    wpmElement.textContent = "0";
    accuracyElement.textContent = "100%";

    typingInput.value = "";
    typingInput.disabled = true;

    startButton.disabled = false;

    resultSection.classList.add("hidden");
    messageElement.textContent = "Click Start Test to begin.";

    displayPassage();
    updateStats();
}

startButton.addEventListener("click", startTest);
restartButton.addEventListener("click", restartTest);

// Initialize the page
restartTest();
