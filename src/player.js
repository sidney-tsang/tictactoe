class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speed = 165;
    this.health = 3;
    this.maxHealth = 3;
    this.shootCooldown = 0;
    this.shootCooldownMax = 240;
    this.shootFlash = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 110;
    this.isMoving = false;
    this.hurtTimer = 0;
    this.invincibleTimer = 0;
    this.radius = 12;
  }

  update(dt, input, mouse) {
    let dx = 0, dy = 0;
    if (input.left)  dx -= 1;
    if (input.right) dx += 1;
    if (input.up)    dy -= 1;
    if (input.down)  dy += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.isMoving = dx !== 0 || dy !== 0;
    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);

    if (this.isMoving) {
      this.animTimer += dt * 1000;
      if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else {
      this.animFrame = 0;
    }

    if (this.shootCooldown > 0) this.shootCooldown -= dt * 1000;
    if (this.hurtTimer > 0)     this.hurtTimer -= dt * 1000;
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt * 1000;
    if (this.shootFlash > 0)    this.shootFlash--;
  }

  takeDamage(amount) {
    this.health -= amount;
    this.hurtTimer = 220;
    this.invincibleTimer = 1100;
  }

  draw(ctx) {
    drawPlayer(ctx, this.x, this.y, this.angle, this.animFrame, this.hurtTimer > 0, this.shootFlash > 0);
  }
}
