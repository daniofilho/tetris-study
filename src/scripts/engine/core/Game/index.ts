import config from '../../../config';

import UI from '../../objects/ui';
import GameController from '../GameController';
import CanvasDrawer from '../../core/CanvasDrawer';
import { ICanvasDrawer } from '../CanvasDrawer/types';

class Game {
  // Game Loop Control
  #delta: number = 0;
  #lastFrameTimeMs: number = 0;
  #fps: number = config.fps;
  #lastFpsUpdate: number = this.#fps;
  #framesThisSecond: number = 0;
  #timestep: number = 1000 / config.fps;

  // Canvas

  #canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
  #context: CanvasRenderingContext2D = this.#canvas.getContext('2d') as CanvasRenderingContext2D;

  #ui?: UI;
  #gameController?: GameController;

  #drawer: ICanvasDrawer | null;

  #keysDown: any = {}; // TODO correct type this

  constructor() {
    // turn off image aliasing
    this.#context.imageSmoothingEnabled = false;

    this.#canvas.width = config.canvas.width;
    this.#canvas.height = config.canvas.height;

    // Objects

    this.#gameController = new GameController({
      context: this.#context,
    });

    this.#ui = new UI({
      context: this.#context,
      gameController: this.#gameController,
    });

    this.#drawer = new CanvasDrawer({ context: this.#context });
  }

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #startEventListeners = (): void => {
    window.addEventListener(
      'keydown',
      (e) => {
        this.#keysDown[e.key] = true;
      },
      false
    );

    window.addEventListener(
      'keyup',
      (e) => {
        this.#keysDown[e.key] = false;
      },
      false
    );
  };

  #handleKeyPress = (): void => {
    if (this.#keysDown['ArrowLeft']) this.#gameController?.moveBlock('left');

    if (this.#keysDown['ArrowRight']) this.#gameController?.moveBlock('right');

    if (this.#keysDown['ArrowDown']) this.#gameController?.moveBlock('down');

    if (this.#keysDown[' ']) this.#gameController?.start();
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  // # The Game Loop
  #updateGame = (deltaTime: number) => {
    if (!this.#context || !this.#ui || !this.#drawer || !this.#gameController) return;

    this.#drawer.clearScreen({
      canvasHeight: config.canvas.height,
      canvasWidth: config.canvas.width,
    });

    // Render Objects
    this.#ui.render({ deltaTime });
    this.#gameController.render({ deltaTime });

    // Keypress
    this.#handleKeyPress();

    // FPS DEBUG
    this.#ui.showFPS(this.#fps);
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #gameLoop = (timestamp: number): void => {
    // Control the frame rate
    if (timestamp < this.#lastFrameTimeMs + 1000 / config.fps) {
      requestAnimationFrame(this.#gameLoop);
      return;
    }

    this.#delta += timestamp - this.#lastFrameTimeMs;
    this.#lastFrameTimeMs = timestamp;

    // Measure fps
    if (timestamp > this.#lastFpsUpdate + 1000) {
      this.#fps = 0.25 * this.#framesThisSecond + 0.75 * this.#fps;

      this.#lastFpsUpdate = timestamp;
      this.#framesThisSecond = 0;
    }
    this.#framesThisSecond++;

    while (this.#delta >= this.#timestep) {
      this.#delta -= this.#timestep;
    }

    this.#updateGame(this.#delta / this.#timestep);

    requestAnimationFrame(this.#gameLoop);
  };

  // # Start/Restart a Game

  #startNewGame = () => {
    this.#gameLoop(0); // GO GO GO
  };

  // # Run
  run = (): void => {
    this.#startEventListeners();
    this.#startNewGame();

    // !DEBUG
    this.#gameController?.start();
  };
}

export default Game;
