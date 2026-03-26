window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (game.state === 'menu') {
        game.startGame();
      } else if (game.state === 'level_complete') {
        game.nextLevel();
      } else if (game.state === 'game_over') {
        game.returnToMenu();
      }
    }
    game.handleKeyDown(e);
  });

  document.addEventListener('keyup', (e) => {
    game.handleKeyUp(e);
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    game.mouse.x = e.clientX - rect.left;
    game.mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && game.state === 'playing') {
      game.playerShoot();
    }
  });

  // Hold mouse button to auto-fire
  canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1 && game.state === 'playing') {
      game.playerShoot();
    }
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  game.run();
});
