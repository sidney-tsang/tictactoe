const ENEMY_DEFS = {
  grunt: {
    speed: 65,
    health: 1,
    radius: 12,
    score: 100,
    color: '#cc3333',
    darkColor: '#882222',
    lightColor: '#ff6666',
  },
  runner: {
    speed: 115,
    health: 1,
    radius: 9,
    score: 150,
    color: '#ff8833',
    darkColor: '#cc5511',
    lightColor: '#ffbb77',
  },
  tank: {
    speed: 38,
    health: 3,
    radius: 18,
    score: 300,
    color: '#886633',
    darkColor: '#553311',
    lightColor: '#bbaa66',
  },
};

class Enemy {
  constructor(x, y, type) {
    const def = ENEMY_DEFS[type];
    this.x = x;
    this.y = y;
    this.type = type;
    this.health = def.health;
    this.maxHealth = def.health;
    this.speed = def.speed;
    this.radius = def.radius;
    this.score = def.score;
    this.angle = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = type === 'runner' ? 100 : 160;
    this.hurtTimer = 0;
    this.dead = false;
    this.deathTimer = 0;
  }

  update(dt, player) {
    if (this.dead) {
      this.deathTimer -= dt * 1000;
      return;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      this.angle = Math.atan2(dy, dx);
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }

    this.animTimer += dt * 1000;
    if (this.animTimer >= this.animSpeed) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    if (this.hurtTimer > 0) this.hurtTimer -= dt * 1000;
  }

  takeDamage(amount, game) {
    this.health -= amount;
    this.hurtTimer = 140;
    if (this.health <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.dead = true;
    this.deathTimer = 400;
    game.score += this.score;
    game.spawnExplosion(this.x, this.y, ENEMY_DEFS[this.type].color);
    game.triggerScreenShake(3, 7);
    game.levelManager.alive = Math.max(0, game.levelManager.alive - 1);
  }

  draw(ctx) {
    drawEnemy(
      ctx, this.x, this.y, this.type, this.angle,
      this.animFrame, this.hurtTimer > 0,
      this.health, this.maxHealth,
      this.dead, this.deathTimer
    );
  }
}

function spawnEnemyAtEdge(width, height, type, level) {
  const side = Math.floor(Math.random() * 4);
  const margin = 30;
  let x, y;
  switch (side) {
    case 0: x = Math.random() * width; y = -margin; break;
    case 1: x = width + margin; y = Math.random() * height; break;
    case 2: x = Math.random() * width; y = height + margin; break;
    default: x = -margin; y = Math.random() * height; break;
  }
  const e = new Enemy(x, y, type);
  e.speed *= (1 + (level - 1) * 0.1);
  return e;
}
