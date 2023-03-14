import Game from './engine/core/Game/index';

window.onload = function () {
  const runGame = () => {
    let game = new Game();
    game.run();
  };

  runGame();
};
