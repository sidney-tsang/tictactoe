// All sprite drawing functions — retro pixel-art style using canvas primitives

function drawPlayer(ctx, x, y, angle, animFrame, isHurt, shootFlash) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  const flash = isHurt && Math.floor(Date.now() / 80) % 2 === 0;
  const bob = Math.sin(animFrame * Math.PI / 2) * 1.5;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(3, 5, 15, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer body ring
  ctx.fillStyle = flash ? '#ffffff' : '#1a3399';
  ctx.beginPath();
  ctx.arc(0, 0, 13 + bob * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Main body
  ctx.fillStyle = flash ? '#ffffff' : '#3355dd';
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();

  // Armor detail
  if (!flash) {
    ctx.fillStyle = '#4466ee';
    ctx.beginPath();
    ctx.arc(-2, -2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Inner ring
    ctx.strokeStyle = '#2244bb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Head highlight
  ctx.fillStyle = flash ? '#ffffff' : '#88aaff';
  ctx.beginPath();
  ctx.arc(-2, -3, 5, 0, Math.PI * 2);
  ctx.fill();

  if (!flash) {
    // Helmet visor
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(-3, -6, 6, 2);
  }

  // Gun arm (rotates to face mouse)
  ctx.rotate(angle);

  // Muzzle flash
  if (shootFlash) {
    ctx.fillStyle = 'rgba(255,255,100,0.9)';
    ctx.beginPath();
    ctx.arc(30, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(30, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gun body
  ctx.fillStyle = flash ? '#ffffff' : '#555555';
  ctx.fillRect(4, -5, 11, 10);
  // Barrel
  ctx.fillStyle = flash ? '#ffffff' : '#777777';
  ctx.fillRect(11, -3, 21, 6);
  // Barrel highlight
  if (!flash) {
    ctx.fillStyle = '#999999';
    ctx.fillRect(11, -2, 21, 2);
    // Grip detail
    ctx.fillStyle = '#444444';
    ctx.fillRect(5, 2, 8, 3);
  }
  // Barrel tip
  ctx.fillStyle = flash ? '#ffffff' : '#888888';
  ctx.fillRect(29, -4, 4, 8);

  ctx.restore();
}

function drawEnemy(ctx, x, y, type, angle, animFrame, isHurt, health, maxHealth, dead, deathTimer) {
  const def = ENEMY_DEFS[type];

  if (dead) {
    const t = deathTimer / 400;
    ctx.save();
    ctx.globalAlpha = t * 0.8;
    ctx.translate(Math.round(x), Math.round(y));
    const scale = 1 + (1 - t) * 1.8;
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, def.radius * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = def.lightColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, def.radius * scale * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  const flash = isHurt && Math.floor(Date.now() / 60) % 2 === 0;
  const bob = Math.sin(animFrame * Math.PI / 2) * 1.5;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(3, def.radius * 0.8, def.radius * 1.1, def.radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  if (type === 'tank') {
    // Tank body — chunky square shape
    ctx.fillStyle = flash ? '#ffffff' : def.darkColor;
    ctx.fillRect(-def.radius - 2, -def.radius - 2, (def.radius + 2) * 2, (def.radius + 2) * 2);

    ctx.fillStyle = flash ? '#eeeeee' : def.color;
    ctx.fillRect(-def.radius, -def.radius, def.radius * 2, def.radius * 2);

    if (!flash) {
      // Tank treads
      ctx.fillStyle = def.darkColor;
      ctx.fillRect(-def.radius, -def.radius, 5, def.radius * 2);
      ctx.fillRect(def.radius - 5, -def.radius, 5, def.radius * 2);
      // Tread detail
      ctx.fillStyle = '#222';
      for (let i = -def.radius; i < def.radius; i += 6) {
        ctx.fillRect(-def.radius, i, 5, 3);
        ctx.fillRect(def.radius - 5, i, 5, 3);
      }
      // Turret
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = def.color;
      ctx.fillRect(-5, -5, 10, 10);
      ctx.fillStyle = def.darkColor;
      ctx.fillRect(3, -3, 14, 6);
      ctx.restore();
    }
  } else {
    // Grunt/runner — circular body
    ctx.fillStyle = flash ? '#ffffff' : def.darkColor;
    ctx.beginPath();
    ctx.arc(0, bob * 0.3, def.radius + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = flash ? '#eeeeee' : def.color;
    ctx.beginPath();
    ctx.arc(0, bob * 0.3, def.radius, 0, Math.PI * 2);
    ctx.fill();

    if (!flash) {
      // Inner shadow detail
      ctx.fillStyle = def.darkColor;
      ctx.beginPath();
      ctx.arc(2, 2 + bob * 0.3, def.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Eyes (face toward player)
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = '#ffffff';
      const er = def.radius * 0.35;
      ctx.beginPath();
      ctx.arc(er, -3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(er, 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(er + 1, -3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(er + 1, 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Legs
      if (type === 'runner') {
        const legBob = Math.sin(animFrame * Math.PI / 2) * 4;
        ctx.fillStyle = def.darkColor;
        ctx.fillRect(-def.radius + 1, def.radius - 4 + legBob, 5, 7);
        ctx.fillRect(def.radius - 6, def.radius - 4 - legBob, 5, 7);
      } else {
        const legBob = Math.sin(animFrame * Math.PI / 2) * 3;
        ctx.fillStyle = def.darkColor;
        ctx.fillRect(-def.radius + 2, def.radius - 4 + legBob, 6, 7);
        ctx.fillRect(def.radius - 7, def.radius - 4 - legBob, 6, 7);
      }
    }
  }

  // Health bar (always for tank, only when damaged for others)
  if (maxHealth > 1 || health < maxHealth) {
    const bw = def.radius * 2.6;
    const bh = 4;
    const bx = -bw / 2;
    const by = -def.radius - 12;
    ctx.fillStyle = '#222';
    ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
    ctx.fillStyle = '#111';
    ctx.fillRect(bx, by, bw, bh);
    const ratio = health / maxHealth;
    ctx.fillStyle = ratio > 0.6 ? '#44ff44' : ratio > 0.3 ? '#ffaa00' : '#ff2222';
    ctx.fillRect(bx, by, bw * ratio, bh);
  }

  ctx.restore();
}
