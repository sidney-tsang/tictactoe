class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const speed = 580;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 4;
    this.active = true;
    this.trail = [];
    this.maxTrail = 7;
  }

  update(dt) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    // Trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const pct = i / this.trail.length;
      const r = this.radius * pct * 0.75;
      ctx.fillStyle = `rgba(255, ${Math.round(180 * pct)}, 0, ${pct * 0.7})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer glow
    ctx.fillStyle = 'rgba(255, 220, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), this.radius + 3, 0, Math.PI * 2);
    ctx.fill();

    // Main bullet
    ctx.fillStyle = '#ffff44';
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), this.radius, 0, Math.PI * 2);
    ctx.fill();

    // White core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), this.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Particle {
  constructor(x, y, vx, vy, life, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= Math.pow(0.88, dt * 60);
    this.vy *= Math.pow(0.88, dt * 60);
    this.life -= dt * 60;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    const s = Math.max(1, this.size * alpha);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(
      Math.round(this.x - s / 2),
      Math.round(this.y - s / 2),
      Math.ceil(s),
      Math.ceil(s)
    );
    ctx.restore();
  }
}
