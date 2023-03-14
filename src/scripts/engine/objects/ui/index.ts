import CanvasDrawer from '../../core/CanvasDrawer';
import { ICanvasDrawer } from '../../core/CanvasDrawer/types';
import config from '../../../config';
import { IUIProps } from './types';
import IGameController from '../../core/GameController';

import {
  backgroundHeight,
  backgroundWidth,
  backgroundX,
  backgroundY,
  informationX,
  screenX,
  screenY,
  topLeftCornerX,
  topLeftCornerY,
  screenHeight,
  screenWidth,
  informationHeight,
  informationY,
  informationWidth,
} from '../../utils/calculations';

const { colors, canvas, sizes } = config;

const { lineWidth, blocksArea } = sizes;

class UI {
  #drawer?: ICanvasDrawer;
  #gameController?: IGameController;

  #showInstructions: boolean = true;
  #instructionsTimer: number = 0;
  #maxInstructionsTimer: number = 10;

  constructor({ context, gameController }: IUIProps) {
    this.#drawer = new CanvasDrawer({ context });
    this.#gameController = gameController;
  }

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #drawScreen = () => {
    if (!this.#drawer) return;

    // Background
    this.#drawer.rectangle({
      color: colors.gray.dark,
      width: backgroundWidth,
      height: backgroundHeight,
      x: backgroundX,
      y: backgroundY,
    });

    //   Information
    this.#drawer.rectangle({
      color: colors.gray.default,
      width: informationWidth,
      height: informationHeight,
      x: informationX,
      y: informationY,
    });

    //   Screen
    this.#drawer.rectangle({
      color: colors.gray.default,
      width: screenWidth,
      height: screenHeight,
      x: screenX,
      y: screenY,
    });
  };

  #drawStatistics = () => {
    if (!this.#drawer || !this.#gameController) return;

    // * Next Block
    this.#drawer.text({
      color: config.colors.front,
      text: `Next Block`,
      y: blocksArea.height * 0.1,
      x: informationX + lineWidth,
      fontSize: '14px',
    });

    const nextBlockY = blocksArea.height * 0.12;
    const nextBlockX = informationX + lineWidth;

    this.#drawer.rectangle({
      color: colors.gray.dark,
      y: nextBlockY,
      x: nextBlockX,
      width: informationWidth - lineWidth * 2,
      height: 100,
    });

    const nextBlock = this.#gameController.nextBlock;
    const previewBlockWidth = sizes.blocks / 4;

    nextBlock.format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        if (!this.#drawer) return;

        const x = rowIndex * (previewBlockWidth + sizes.lineWidth / 4) + nextBlockX;
        const y = columnIndex * (previewBlockWidth + sizes.lineWidth / 4) + nextBlockY;

        this.#drawer.rectangle({
          color: colors.front,
          y,
          x,
          width: previewBlockWidth,
          height: previewBlockWidth,
        });
      });
    });

    // * Level
    this.#drawer.text({
      color: config.colors.front,
      text: `Level`,
      y: blocksArea.height * 0.31,
      x: informationX + lineWidth,
      fontSize: '14px',
    });

    this.#drawer.rectangle({
      color: colors.gray.dark,
      y: blocksArea.height * 0.32,
      x: informationX + lineWidth,
      width: informationWidth - lineWidth * 2,
      height: 40,
    });

    this.#drawer.text({
      color: config.colors.front,
      text: `${this.#gameController.level}`,
      y: blocksArea.height * 0.372,
      x: informationX + lineWidth * 2,
      fontSize: '29px',
    });

    // * Score
    this.#drawer.text({
      color: config.colors.front,
      text: `Score`,
      y: blocksArea.height * 0.43,
      x: informationX + lineWidth,
      fontSize: '14px',
    });

    this.#drawer.rectangle({
      color: colors.gray.dark,
      y: blocksArea.height * 0.44,
      x: informationX + lineWidth,
      width: informationWidth - lineWidth * 2,
      height: 40,
    });

    this.#drawer.text({
      color: config.colors.front,
      text: `${String(this.#gameController.score).padStart(7, '0')}`,
      y: blocksArea.height * 0.492,
      x: informationX + lineWidth * 2,
      fontSize: '29px',
    });
  };

  #drawStartInstructions = ({ deltaTime }: IRenderObjectProps) => {
    if (!this.#drawer || !this.#gameController) return;

    // * Instructions blinking only if the games hasn't started yet
    if (!this.#gameController.isGameRunning) {
      this.#drawer.rectangle({
        color: 'rgba(0,0,0,0.5)',
        y: 0,
        x: 0,
        width: canvas.width,
        height: canvas.height,
      });

      if (this.#showInstructions) {
        if (this.#gameController.score > 0) {
          this.#drawer.text({
            color: '#FFFFFF',
            text: `Game Over!`,
            y: config.canvas.height / 2 - 20,
            x: config.canvas.width / 2 - 160,
            fontSize: '16px',
          });

          this.#drawer.text({
            color: '#FFFFFF',
            text: `Press Space to restart`,
            y: config.canvas.height / 2 + 20,
            x: config.canvas.width / 2 - 260,
            fontSize: '16px',
          });
        } else {
          this.#drawer.text({
            color: '#FFFFFF',
            text: `Press Space to start`,
            y: config.canvas.height / 2 - 20,
            x: config.canvas.width / 2 - 160,
            fontSize: '16px',
          });

          this.#drawer.text({
            color: '#FFFFFF',
            text: `and use Arrow Keys to move blocks`,
            y: config.canvas.height / 2 + 20,
            x: config.canvas.width / 2 - 260,
            fontSize: '16px',
          });
        }
      }

      this.#instructionsTimer += deltaTime;

      if (this.#instructionsTimer > this.#maxInstructionsTimer) {
        this.#showInstructions = !this.#showInstructions;
        this.#instructionsTimer = 0;
      }
    }
  };

  showFPS = (fps: number) => {
    if (!this.#drawer) return;

    this.#drawer.text({
      color: config.colors.gray.dark,
      text: `FPS:${fps.toFixed(0)}`,
      y: lineWidth + 20,
      x: config.canvas.width - 90,
      fontSize: '13px',
    });
  };

  render = (props: IRenderObjectProps): void => {
    this.#drawScreen();

    this.#drawStatistics();

    this.#drawStartInstructions(props);
  };
}

export default UI;
