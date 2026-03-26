class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.WIDTH = 800;
    this.HEIGHT = 600;

    this.state = 'menu'; // 'menu' | 'playing' | 'level_complete' | 'game_over'
    this.score = 0;
    this.highScore = 0;

    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.levelManager = null;

    this.input = { left: false, right: false, up: false, down: false };
    this.mouse = { x: this.WIDTH / 2, y: this.HEIGHT / 2 };

    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.damageFlash = 0;
    this.lastTime = 0;
  }

  // ── State transitions ──────────────────────────────────────────────────────

  startGame() {
    this.score = 0;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.player = new Player(this.WIDTH / 2, this.HEIGHT / 2);
    this.levelManager = new LevelManager();
    this.levelManager.startLevel(this);
    this.damageFlash = 0;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.state = 'playing';
  }

  nextLevel() {
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.levelManager.advance();
    this.levelManager.startLevel(this);
    this.state = 'playing';
  }

  returnToMenu() {
    this.state = 'menu';
  }

  levelComplete() {
    if (this.score > this.highScore) this.highScore = this.score;
    this.state = 'level_complete';
  }

  gameOver() {
    if (this.score > this.highScore) this.highScore = this.score;
    this.state = 'game_over';
  }

  // ── Input ──────────────────────────────────────────────────────────────────

  handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowLeft':  this.input.left  = true; e.preventDefault(); break;
      case 'ArrowRight': this.input.right = true; e.preventDefault(); break;
      case 'ArrowUp':    this.input.up    = true; e.preventDefault(); break;
      case 'ArrowDown':  this.input.down  = true; e.preventDefault(); break;
    }
  }

  handleKeyUp(e) {
    switch (e.key) {
      case 'ArrowLeft':  this.input.left  = false; break;
      case 'ArrowRight': this.input.right = false; break;
      case 'ArrowUp':    this.input.up    = false; break;
      case 'ArrowDown':  this.input.down  = false; break;
    }
  }

  playerShoot() {
    if (!this.player || this.player.shootCooldown > 0) return;
    const angle = Math.atan2(
      this.mouse.y - this.player.y,
      this.mouse.x - this.player.x
    );
    const spawnDist = 28;
    this.bullets.push(new Bullet(
      this.player.x + Math.cos(angle) * spawnDist,
      this.player.y + Math.sin(angle) * spawnDist,
      angle
    ));
    this.player.shootCooldown = this.player.shootCooldownMax;
    this.player.shootFlash = 4;
  }

  // ── Effects ────────────────────────────────────────────────────────────────

  triggerScreenShake(intensity, duration) {
    if (intensity > this.shakeIntensity) {
      this.shakeIntensity = intensity;
      this.shakeDuration = duration;
    }
  }

  spawnExplosion(x, y, color) {
    const palette = [color, '#ffaa00', '#ffff00', '#ff4400', '#ffffff'];
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      const c = palette[Math.floor(Math.random() * palette.length)];
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        18 + Math.random() * 22,
        c,
        3 + Math.random() * 4
      ));
    }
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  update(dt) {
    if (this.state !== 'playing') return;

    // Player
    this.player.update(dt, this.input, this.mouse);
    this.player.x = Math.max(this.player.radius, Math.min(this.WIDTH  - this.player.radius, this.player.x));
    this.player.y = Math.max(this.player.radius, Math.min(this.HEIGHT - this.player.radius, this.player.y));

    // Level / spawning
    this.levelManager.update(dt, this);
    if (this.state !== 'playing') return; // level may have just ended

    // Bullets
    this.bullets = this.bullets.filter(b => b.active);
    for (const b of this.bullets) {
      b.update(dt);
      if (b.x < -20 || b.x > this.WIDTH + 20 || b.y < -20 || b.y > this.HEIGHT + 20) {
        b.active = false;
      }
    }

    // Enemies
    for (const e of this.enemies) {
      e.update(dt, this.player);
    }

    // Bullet ↔ enemy collisions
    for (const b of this.bullets) {
      if (!b.active) continue;
      for (const e of this.enemies) {
        if (e.dead) continue;
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        if (dx * dx + dy * dy < (b.radius + e.radius) * (b.radius + e.radius)) {
          b.active = false;
          e.takeDamage(1, this);
          break;
        }
      }
    }

    // Enemy ↔ player collision
    if (this.player.invincibleTimer <= 0) {
      for (const e of this.enemies) {
        if (e.dead) continue;
        const dx = this.player.x - e.x;
        const dy = this.player.y - e.y;
        if (dx * dx + dy * dy < (this.player.radius + e.radius - 4) ** 2) {
          this.player.takeDamage(1);
          this.damageFlash = 10;
          this.triggerScreenShake(6, 12);
          if (this.player.health <= 0) {
            this.gameOver();
            return;
          }
          break;
        }
      }
    }

    // Remove expired dead enemies
    this.enemies = this.enemies.filter(e => !(e.dead && e.deathTimer <= 0));

    // Particles
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter(p => p.life > 0);

    // Effects decay
    if (this.shakeDuration > 0) this.shakeDuration--;
    else this.shakeIntensity = 0;
    if (this.damageFlash > 0) this.damageFlash--;

    // Wave completion check
    this.levelManager.checkWaveComplete(this);
  }

  // ── Draw ───────────────────────────────────────────────────────────────────

  draw() {
    const ctx = this.ctx;

    ctx.save();

    // Screen shake
    if (this.shakeDuration > 0) {
      const sx = (Math.random() * 2 - 1) * this.shakeIntensity;
      const sy = (Math.random() * 2 - 1) * this.shakeIntensity;
      ctx.translate(sx, sy);
    }

    if (this.state === 'menu') {
      drawMenu(ctx, this.WIDTH, this.HEIGHT, this.highScore);
    } else {
      // Game world
      drawBackground(ctx, this.WIDTH, this.HEIGHT);

      // Particles (below entities)
      for (const p of this.particles) p.draw(ctx);

      // Bullets
      for (const b of this.bullets) b.draw(ctx);

      // Enemies
      for (const e of this.enemies) e.draw(ctx);

      // Player
      if (this.player) this.player.draw(ctx);

      // Damage flash overlay
      if (this.damageFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${(this.damageFlash / 10) * 0.38})`;
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
      }

      // HUD
      if (this.player) {
        drawHUD(ctx, this.WIDTH, this.HEIGHT, this.player, this.levelManager, this.score);
      }

      // Overlays
      if (this.state === 'level_complete') {
        drawLevelComplete(ctx, this.WIDTH, this.HEIGHT, this.levelManager.currentLevel - 1, this.score);
      } else if (this.state === 'game_over') {
        drawGameOver(ctx, this.WIDTH, this.HEIGHT, this.score);
      }
    }

    ctx.restore();
  }

  // ── Loop ───────────────────────────────────────────────────────────────────

  run() {
    const loop = (timestamp) => {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
      this.lastTime = timestamp;
      this.update(dt);
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame((t) => {
      this.lastTime = t;
      requestAnimationFrame(loop);
    });
  }
}
