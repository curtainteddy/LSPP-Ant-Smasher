// Main JS for Ant Smasher Game
const gameArea = document.getElementById("game-area");
const menuScreen = document.getElementById("menu-screen");
const hud = document.getElementById("hud");
const pauseScreen = document.getElementById("pause-screen");
const gameoverScreen = document.getElementById("gameover-screen");
const scoreElem = document.getElementById("score");
const highScoreElem = document.getElementById("high-score");
const antCountElem = document.getElementById("ant-count");
const pauseBtn = document.getElementById("pause-btn");
const soundBtn = document.getElementById("sound-btn");
const startBtn = document.getElementById("start-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const playAgainBtn = document.getElementById("playagain-btn");
const finalScoreElem = document.getElementById("final-score");
const finalHighScoreElem = document.getElementById("final-high-score");
const bgMusic = document.getElementById("bg-music");
const gameoverSound = document.getElementById("gameover-sound");
const mainMenuBtn = document.getElementById("mainmenu-btn");
const optionsBtn = document.getElementById("options-btn");
const optionsScreen = document.getElementById("options-screen");
const closeOptionsBtn = document.getElementById("close-options-btn");
const bgmVolumeSlider = document.getElementById("bgm-volume");
bgmVolumeSlider.value = 100;
const bgmVolumeValue = document.getElementById("bgm-volume-value");
const smashVolumeSlider = document.getElementById("smash-volume");
smashVolumeSlider.value = 100;
const smashVolumeValue = document.getElementById("smash-volume-value");
const antSpeedSlider = document.getElementById("ant-speed");
antSpeedSlider.value = 3;
const antSpeedValue = document.getElementById("ant-speed-value");
let antSpeedSetting = 3;
window.antSpeedSetting = 3;

let ants = [];
let score = 0;
let highScore = 0;
let antSpawnTimer = null;
let gameState = "menu"; // menu, playing, paused, gameover
let maxAnts = 10;
let spawnInterval = 1200;
let soundOn = true;

// Add smash sounds array and index
const smashSounds = [
  new Audio("../assets/smash_1.mp3"),
  new Audio("../assets/smash_2.mp3"),
  new Audio("../assets/smash_3.mp3"),
  new Audio("../assets/smash_4.mp3"),
  new Audio("../assets/smash_5.mp3"),
];
let smashSoundIndex = 0;

function loadHighScore() {
  highScore = parseInt(localStorage.getItem("antHighScore") || "0", 10);
  highScoreElem.textContent = highScore;
}

function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("antHighScore", highScore);
    highScoreElem.textContent = highScore;
  }
}

function updateHUD() {
  scoreElem.textContent = score;
  highScoreElem.textContent = highScore;
  antCountElem.textContent = ants.length;
}

function showScreen(screen) {
  [
    menuScreen,
    hud,
    pauseScreen,
    gameoverScreen,
    gameArea,
    optionsScreen,
  ].forEach((s) => s.classList.add("hidden"));
  pauseBtn.style.display = "none";
  if (screen === "menu") menuScreen.classList.remove("hidden");
  if (screen === "hud") hud.classList.remove("hidden");
  if (screen === "game") {
    hud.classList.remove("hidden");
    gameArea.classList.remove("hidden");
    pauseBtn.style.display = "flex";
  }
  if (screen === "pause") pauseScreen.classList.remove("hidden");
  if (screen === "gameover") gameoverScreen.classList.remove("hidden");
  if (screen === "options") optionsScreen.classList.remove("hidden");
}

function startGame() {
  score = 0;
  updateHUD();
  clearAnts();
  showScreen("game");
  gameState = "playing";
  spawnInterval = 1200;
  startSpawningAnts();
  if (soundOn) bgMusic.play();
}

function pauseGame() {
  if (gameState !== "playing") return;
  gameState = "paused";
  showScreen("pause");
  stopSpawningAnts();
  ants.forEach((ant) => clearInterval(ant.moveTimer));
  if (soundOn) bgMusic.pause();
}

function resumeGame() {
  if (gameState !== "paused") return;
  gameState = "playing";
  showScreen("game");
  startSpawningAnts();
  ants.forEach((ant) => ant.startMoving());
  if (soundOn) bgMusic.play();
}

function gameOver() {
  gameState = "gameover";
  showScreen("gameover");
  stopSpawningAnts();
  saveHighScore();
  finalScoreElem.textContent = score;
  finalHighScoreElem.textContent = highScore;
  if (soundOn) {
    bgMusic.pause();
    gameoverSound.currentTime = 0;
    gameoverSound.play();
  }
}

function clearAnts() {
  ants.forEach((ant) => ant.remove());
  ants = [];
  updateHUD();
}

function spawnAnt() {
  if (gameState !== "playing") return;
  if (ants.length >= maxAnts) {
    gameOver();
    return;
  }
  const ant = new window.Ant(gameArea, onAntSmashed);
  ants.push(ant);
  updateHUD();
}

function onAntSmashed(ant) {
  ants = ants.filter((a) => a !== ant);
  score++;
  updateHUD();
  saveHighScore();
}

function startSpawningAnts() {
  stopSpawningAnts();
  antSpawnTimer = setInterval(() => {
    spawnAnt();
    // Spawn scaling: speed up over time
    if (spawnInterval > 400) {
      spawnInterval -= 10;
      clearInterval(antSpawnTimer);
      startSpawningAnts();
    }
  }, spawnInterval);
}

function stopSpawningAnts() {
  if (antSpawnTimer) clearInterval(antSpawnTimer);
  antSpawnTimer = null;
}

function toggleSound() {
  soundOn = !soundOn;
  window.soundOn = soundOn;
  soundBtn.innerHTML = soundOn
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';
  localStorage.setItem("antSound", soundOn ? "1" : "0");
  if (!soundOn) {
    bgMusic.pause();
  } else if (gameState === "playing") {
    bgMusic.play();
  }
}

function loadSettings() {
  soundOn = localStorage.getItem("antSound") !== "0";
  soundBtn.innerHTML = soundOn
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';
  // Load volumes
  const bgmVol = parseInt(localStorage.getItem("antBgmVolume") || "100", 10);
  bgmVolumeSlider.value = bgmVol;
  bgmVolumeValue.textContent = bgmVol;
  bgMusic.volume = bgmVol / 100;
  const smashVol = parseInt(
    localStorage.getItem("antSmashVolume") || "100",
    10
  );
  smashVolumeSlider.value = smashVol;
  smashVolumeValue.textContent = smashVol;
  smashSounds.forEach((s) => (s.volume = smashVol / 100));
  // Load ant speed
  antSpeedSetting = parseInt(localStorage.getItem("antSpeed") || "3", 10);
  window.antSpeedSetting = antSpeedSetting;
  antSpeedSlider.value = antSpeedSetting;
  antSpeedValue.textContent = antSpeedSetting;
}

function playNextSmashSound() {
  const sound = smashSounds[smashSoundIndex];
  sound.currentTime = 0;
  sound.play();
  smashSoundIndex = (smashSoundIndex + 1) % smashSounds.length;
}
window.playNextSmashSound = playNextSmashSound;
window.soundOn = soundOn;

// Event Listeners
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);
restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);
soundBtn.addEventListener("click", toggleSound);
mainMenuBtn.addEventListener("click", returnToMainMenu);
optionsBtn.addEventListener("click", () => {
  showScreen("options");
});
closeOptionsBtn.addEventListener("click", () => {
  showScreen("menu");
});
bgmVolumeSlider.addEventListener("input", () => {
  const v = parseInt(bgmVolumeSlider.value, 10);
  bgmVolumeValue.textContent = v;
  bgMusic.volume = v / 100;
  localStorage.setItem("antBgmVolume", v);
});
smashVolumeSlider.addEventListener("input", () => {
  const v = parseInt(smashVolumeSlider.value, 10);
  smashVolumeValue.textContent = v;
  smashSounds.forEach((s) => (s.volume = v / 100));
  localStorage.setItem("antSmashVolume", v);
});
antSpeedSlider.addEventListener("input", () => {
  const v = parseInt(antSpeedSlider.value, 10);
  antSpeedValue.textContent = v;
  antSpeedSetting = v;
  window.antSpeedSetting = v;
  localStorage.setItem("antSpeed", v);
  // Update speed of existing ants
  ants.forEach((ant) => {
    if (ant.updateSpeed) ant.updateSpeed();
  });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && gameState === "playing") pauseGame();
});

// Init
function init() {
  loadHighScore();
  loadSettings();
  showScreen("menu");
}

window.addEventListener("DOMContentLoaded", init);

function returnToMainMenu() {
  gameState = "menu";
  stopSpawningAnts();
  clearAnts();
  if (soundOn) bgMusic.pause();
  showScreen("menu");
}
