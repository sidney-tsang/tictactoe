function drawHeart(ctx, x, y, filled) {
  ctx.fillStyle = filled ? '#ff4444' : '#3a1111';
  const P = 4;
  const pixels = [
    [0,1,0,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0],
  ];
  for (let r = 0; r < pixels.length; r++) {
    for (let c = 0; c < pixels[r].length; c++) {
      if (pixels[r][c]) {
        ctx.fillRect(x + c * P, y + r * P, P, P);
      }
    }
  }
  // Highlight on filled heart
  if (filled) {
    ctx.fillStyle = '#ff8888';
    ctx.fillRect(x + P, y, P, P);
  }
}

function drawMenu(ctx, width, height, highScore) {
  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Scanlines
  for (let y = 0; y < height; y += 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, y, width, 1);
  }

  // Border
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, width - 36, height - 36);
  ctx.strokeStyle = '#1a4a1a';
  ctx.strokeRect(22, 22, width - 44, height - 44);

  // Decorative corner brackets
  const corner = (x, y, sx, sy) => {
    ctx.strokeStyle = '#44ff44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + sx * 20, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * 20);
    ctx.stroke();
  };
  corner(30, 30, 1, 1);
  corner(width - 30, 30, -1, 1);
  corner(30, height - 30, 1, -1);
  corner(width - 30, height - 30, -1, -1);

  // Title shadow
  ctx.textAlign = 'center';
  ctx.font = 'bold 62px monospace';
  ctx.fillStyle = '#220000';
  ctx.fillText('TOP-DOWN', width / 2 + 3, height / 2 - 85 + 3);
  ctx.fillText('TERROR', width / 2 + 3, height / 2 - 18 + 3);

  // Title
  ctx.fillStyle = '#dd3333';
  ctx.fillText('TOP-DOWN', width / 2, height / 2 - 85);
  ctx.fillStyle = '#ffee00';
  ctx.fillText('TERROR', width / 2, height / 2 - 18);

  // Controls hint
  ctx.fillStyle = '#556655';
  ctx.font = '14px monospace';
  ctx.fillText('ARROW KEYS: MOVE   |   MOUSE: AIM   |   CLICK: SHOOT', width / 2, height / 2 + 38);

  // Press enter (blinking)
  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#44ff44';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('>>> PRESS ENTER TO START <<<', width / 2, height / 2 + 82);
  }

  // High score
  if (highScore > 0) {
    ctx.fillStyle = '#ffaa44';
    ctx.font = '16px monospace';
    ctx.fillText(`BEST SCORE: ${highScore}`, width / 2, height / 2 + 124);
  }

  // Version / flavor
  ctx.fillStyle = '#333333';
  ctx.font = '11px monospace';
  ctx.fillText('v1.0  SURVIVE THE WAVES', width / 2, height - 36);
}

function drawHUD(ctx, width, height, player, levelManager, score) {
  // HUD background strip (subtle)
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, width, 54);

  // Health hearts
  ctx.fillStyle = '#884444';
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HP', 14, 14);
  for (let i = 0; i < player.maxHealth; i++) {
    drawHeart(ctx, 14 + i * 28, 17, i < player.health);
  }

  // Level + wave (center)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#44ff44';
  ctx.font = 'bold 17px monospace';
  ctx.fillText(`LEVEL  ${levelManager.currentLevel}`, width / 2, 22);
  ctx.fillStyle = '#668866';
  ctx.font = '13px monospace';
  ctx.fillText(`WAVE  ${levelManager.currentWaveIndex + 1} / ${levelManager.totalWaves}`, width / 2, 42);

  // Score (right)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffee44';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(String(score).padStart(6, '0'), width - 14, 26);
  ctx.fillStyle = '#666644';
  ctx.font = '11px monospace';
  ctx.fillText('SCORE', width - 14, 42);

  // Wave banner
  if (levelManager.showingWaveBanner) {
    const t = Math.min(1, levelManager.waveBannerTimer / 400);
    ctx.save();
    ctx.globalAlpha = t;
    ctx.textAlign = 'center';

    // Banner bg
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(width / 2 - 200, height / 2 - 50, 400, 80);
    ctx.strokeStyle = '#44ff44';
    ctx.lineWidth = 1;
    ctx.strokeRect(width / 2 - 200, height / 2 - 50, 400, 80);

    ctx.fillStyle = '#ffee00';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(`WAVE  ${levelManager.currentWaveIndex + 1}`, width / 2, height / 2 - 12);
    ctx.fillStyle = '#88ff88';
    ctx.font = '16px monospace';
    ctx.fillText('GET READY!', width / 2, height / 2 + 18);
    ctx.restore();
  }
}

function drawLevelComplete(ctx, width, height, level, score) {
  ctx.fillStyle = 'rgba(0, 10, 0, 0.78)';
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';

  // Glow effect behind text
  ctx.shadowColor = '#44ff44';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#44ff44';
  ctx.font = 'bold 50px monospace';
  ctx.fillText(`LEVEL  ${level}  CLEAR!`, width / 2, height / 2 - 55);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffee44';
  ctx.font = '26px monospace';
  ctx.fillText(`SCORE:  ${score}`, width / 2, height / 2 + 8);

  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS ENTER TO CONTINUE', width / 2, height / 2 + 62);
  }
}

function drawGameOver(ctx, width, height, score) {
  ctx.fillStyle = 'rgba(20, 0, 0, 0.8)';
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';

  ctx.shadowColor = '#ff2222';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#ff2222';
  ctx.font = 'bold 66px monospace';
  ctx.fillText('GAME OVER', width / 2, height / 2 - 60);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffee44';
  ctx.font = '28px monospace';
  ctx.fillText(`FINAL SCORE:  ${score}`, width / 2, height / 2 + 14);

  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS ENTER TO RETURN TO MENU', width / 2, height / 2 + 70);
  }
}
