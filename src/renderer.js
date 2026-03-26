function drawBackground(ctx, width, height) {
  // Base floor
  ctx.fillStyle = '#1a2a1a';
  ctx.fillRect(0, 0, width, height);

  // Grid lines (32px tile)
  ctx.strokeStyle = '#1f301f';
  ctx.lineWidth = 1;
  const g = 32;
  for (let x = 0; x <= width; x += g) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += g) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Subtle corner dots at intersections
  ctx.fillStyle = '#243024';
  for (let x = 0; x <= width; x += g) {
    for (let y = 0; y <= height; y += g) {
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
}
