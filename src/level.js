const LEVEL_DEFS = [
  // Level 1 — tutorial-paced
  { waves: [
    { enemies: [{ type: 'grunt', count: 5 }] },
    { enemies: [{ type: 'grunt', count: 8 }] },
  ]},
  // Level 2
  { waves: [
    { enemies: [{ type: 'grunt', count: 7 }, { type: 'runner', count: 2 }] },
    { enemies: [{ type: 'grunt', count: 6 }, { type: 'runner', count: 4 }] },
  ]},
  // Level 3
  { waves: [
    { enemies: [{ type: 'runner', count: 6 }, { type: 'grunt', count: 5 }] },
    { enemies: [{ type: 'runner', count: 8 }, { type: 'grunt', count: 4 }] },
    { enemies: [{ type: 'runner', count: 6 }, { type: 'tank', count: 1 }] },
  ]},
  // Level 4
  { waves: [
    { enemies: [{ type: 'grunt', count: 6 }, { type: 'runner', count: 5 }, { type: 'tank', count: 1 }] },
    { enemies: [{ type: 'runner', count: 8 }, { type: 'tank', count: 2 }] },
    { enemies: [{ type: 'grunt', count: 8 }, { type: 'runner', count: 6 }, { type: 'tank', count: 1 }] },
  ]},
  // Level 5
  { waves: [
    { enemies: [{ type: 'runner', count: 10 }, { type: 'tank', count: 2 }] },
    { enemies: [{ type: 'grunt', count: 8 }, { type: 'runner', count: 8 }, { type: 'tank', count: 2 }] },
    { enemies: [{ type: 'runner', count: 12 }, { type: 'tank', count: 3 }] },
  ]},
  // Level 6+ (endless loop base)
  { waves: [
    { enemies: [{ type: 'grunt', count: 10 }, { type: 'runner', count: 8 }, { type: 'tank', count: 3 }] },
    { enemies: [{ type: 'runner', count: 14 }, { type: 'tank', count: 4 }] },
    { enemies: [{ type: 'grunt', count: 8 }, { type: 'runner', count: 10 }, { type: 'tank', count: 4 }] },
  ]},
];

class LevelManager {
  constructor() {
    this.currentLevel = 1;
    this.currentWaveIndex = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnInterval = 550;
    this.alive = 0;
    this.waveTransitioning = false;
    this.waveTransitionTimer = 0;
    this.showingWaveBanner = false;
    this.waveBannerTimer = 0;
  }

  get levelDef() {
    const idx = Math.min(this.currentLevel - 1, LEVEL_DEFS.length - 1);
    return LEVEL_DEFS[idx];
  }

  get totalWaves() {
    return this.levelDef.waves.length;
  }

  startLevel(game) {
    this.currentWaveIndex = 0;
    this.startWave(game);
  }

  startWave(game) {
    const wave = this.levelDef.waves[this.currentWaveIndex];
    this.spawnQueue = [];
    for (const entry of wave.enemies) {
      for (let i = 0; i < entry.count; i++) {
        this.spawnQueue.push(entry.type);
      }
    }
    // Shuffle
    for (let i = this.spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
    }
    this.spawnTimer = 0;
    this.alive = 0;
    this.waveTransitioning = false;
    this.showingWaveBanner = true;
    this.waveBannerTimer = 1800;
  }

  advance() {
    this.currentLevel++;
    this.currentWaveIndex = 0;
    this.waveTransitioning = false;
  }

  update(dt, game) {
    if (this.showingWaveBanner) {
      this.waveBannerTimer -= dt * 1000;
      if (this.waveBannerTimer <= 0) {
        this.showingWaveBanner = false;
      }
      return;
    }

    if (this.waveTransitioning) {
      this.waveTransitionTimer -= dt * 1000;
      if (this.waveTransitionTimer <= 0) {
        this.waveTransitioning = false;
        this.currentWaveIndex++;
        if (this.currentWaveIndex >= this.totalWaves) {
          game.levelComplete();
        } else {
          this.startWave(game);
        }
      }
      return;
    }

    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt * 1000;
      if (this.spawnTimer <= 0) {
        const type = this.spawnQueue.shift();
        const enemy = spawnEnemyAtEdge(game.WIDTH, game.HEIGHT, type, this.currentLevel);
        game.enemies.push(enemy);
        this.alive++;
        this.spawnTimer = this.spawnInterval;
      }
    }
  }

  checkWaveComplete(game) {
    if (game.state !== 'playing') return;
    if (this.waveTransitioning || this.showingWaveBanner) return;
    if (this.spawnQueue.length === 0 && this.alive === 0) {
      this.waveTransitioning = true;
      this.waveTransitionTimer = 1400;
      // Wave clear bonus
      game.score += 200 * this.currentLevel;
    }
  }
}
