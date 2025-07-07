// Ant class for Ant Smasher Game
class Ant {
  constructor(gameArea, onSmashed) {
    this.gameArea = gameArea;
    this.onSmashed = onSmashed;
    this.antElem = document.createElement("div");
    this.antElem.className = "ant";
    this.isSmashed = false;
    this.gameArea.appendChild(this.antElem); // Append first so CSS applies
    this.setSize(); // Now measure size
    this.setRandomPosition();
    this.setRandomDirection();
    this.speed = (window.antSpeedSetting || 1) * (1 + Math.random() * 0.5); // px per frame, scaled
    this.moveTimer = null;
    this.directionTimer = null;
    this.walkFrames = [
      "../assets/ant_walk_1.webp",
      "../assets/ant_walk_2.webp",
      "../assets/ant_walk_3.webp",
    ];
    this.currentFrame = 0;
    this.frameInterval = null;
    this.antElem.addEventListener("click", () => this.smash());
    this.startMoving();
    this.startAnimating();
    this.startRandomDirectionChange();
  }

  setSize() {
    // Use computed style to get current size in px
    const rect = this.antElem.getBoundingClientRect();
    this.size = rect.width;
  }

  setRandomPosition() {
    const areaRect = this.gameArea.getBoundingClientRect();
    const x = Math.random() * (areaRect.width - this.size);
    const y = Math.random() * (areaRect.height - this.size);
    this.x = x;
    this.y = y;
    this.updatePosition();
  }

  setRandomDirection() {
    const angle = Math.random() * 2 * Math.PI;
    this.dx = Math.cos(angle);
    this.dy = Math.sin(angle);
  }

  updatePosition() {
    this.antElem.style.left = `${this.x}px`;
    this.antElem.style.top = `${this.y}px`;
  }

  move() {
    if (this.isSmashed) return;
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;
    // Bounce off edges
    const areaRect = this.gameArea.getBoundingClientRect();
    let bounced = false;
    if (this.x < 0) {
      this.x = 0;
      this.dx *= -1;
      bounced = true;
    } else if (this.x > areaRect.width - this.size) {
      this.x = areaRect.width - this.size;
      this.dx *= -1;
      bounced = true;
    }
    if (this.y < 0) {
      this.y = 0;
      this.dy *= -1;
      bounced = true;
    } else if (this.y > areaRect.height - this.size) {
      this.y = areaRect.height - this.size;
      this.dy *= -1;
      bounced = true;
    }
    // If bounced, slightly randomize direction for more natural movement
    if (bounced) {
      this.randomizeDirectionSlightly();
    }
    this.updatePosition();
  }

  randomizeDirectionSlightly() {
    // Add a small random angle to the current direction
    const angle = Math.atan2(this.dy, this.dx);
    const delta = (Math.random() - 0.5) * (Math.PI / 6); // +/- 30 degrees
    const newAngle = angle + delta;
    this.dx = Math.cos(newAngle);
    this.dy = Math.sin(newAngle);
  }

  startMoving() {
    this.moveTimer = setInterval(() => this.move(), 16); // ~60fps
  }

  startAnimating() {
    // Start JS-based frame animation
    this.frameInterval = setInterval(() => {
      if (this.isSmashed) return;
      this.currentFrame = (this.currentFrame + 1) % this.walkFrames.length;
      this.antElem.style.backgroundImage = `url('${
        this.walkFrames[this.currentFrame]
      }')`;
    }, 120); // 120ms per frame, adjust as needed
  }

  stopAnimating() {
    if (this.frameInterval) clearInterval(this.frameInterval);
    this.frameInterval = null;
  }

  startRandomDirectionChange() {
    // Change direction every 1-3 seconds randomly
    const change = () => {
      if (this.isSmashed) return;
      this.setRandomDirection();
      const next = 1000 + Math.random() * 2000;
      this.directionTimer = setTimeout(change, next);
    };
    change();
  }

  stopRandomDirectionChange() {
    if (this.directionTimer) clearTimeout(this.directionTimer);
    this.directionTimer = null;
  }

  smash() {
    if (this.isSmashed) return;
    // Play smash sound immediately
    if (window.soundOn && typeof window.playNextSmashSound === "function") {
      window.playNextSmashSound();
    }
    this.isSmashed = true;
    this.antElem.classList.add("smashed");
    // Set smashed ant image
    this.antElem.style.backgroundImage = "url('../assets/ant_smashed.webp')";
    clearInterval(this.moveTimer);
    this.stopRandomDirectionChange();
    this.stopAnimating();
    setTimeout(() => {
      this.remove();
      if (this.onSmashed) this.onSmashed(this);
    }, 300);
  }

  remove() {
    this.stopAnimating();
    if (this.antElem.parentNode) {
      this.antElem.parentNode.removeChild(this.antElem);
    }
  }

  updateSpeed() {
    // Update speed for existing ants when setting changes
    this.speed = (window.antSpeedSetting || 1) * (1 + Math.random() * 0.5);
  }
}

// Export for use in main.js
window.Ant = Ant;
