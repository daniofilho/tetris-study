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
  screenHeight,
  screenWidth,
  informationHeight,
  informationY,
  informationWidth,
} from '../../utils/calculations';

const { colors, canvas, sizes } = config;

const { lineWidth, blocksArea } = sizes;

import imageLeftArrow from '../../../../assets/images/arrow-left.png';
import imageRightArrow from '../../../../assets/images/arrow-right.png';
import imageDownArrow from '../../../../assets/images/arrow-down.png';
import imageUpArrow from '../../../../assets/images/arrow-up.png';

class UI {
  #drawer?: ICanvasDrawer;
  #gameController?: IGameController;

  #showInstructions: boolean = true;
  #instructionsTimer: number = 0;
  #maxInstructionsTimer: number = 10;

  #leftArrowImageDOM?: HTMLImageElement;
  #rightArrowImageDOM?: HTMLImageElement;
  #upArrowImageDOM?: HTMLImageElement;
  #downArrowImageDOM?: HTMLImageElement;

  constructor({ context, gameController }: IUIProps) {
    this.#drawer = new CanvasDrawer({ context });
    this.#gameController = gameController;

    const leftArrowImage = new Image();
    leftArrowImage.src = imageLeftArrow;
    leftArrowImage.onload = () => {
      this.#leftArrowImageDOM = leftArrowImage;
    };

    const rightArrowImage = new Image();
    rightArrowImage.src = imageRightArrow;
    rightArrowImage.onload = () => {
      this.#rightArrowImageDOM = rightArrowImage;
    };

    const upArrowImage = new Image();
    upArrowImage.src = imageUpArrow;
    upArrowImage.onload = () => {
      this.#upArrowImageDOM = upArrowImage;
    };

    const downArrowImage = new Image();
    downArrowImage.src = imageDownArrow;
    downArrowImage.onload = () => {
      this.#downArrowImageDOM = downArrowImage;
    };
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
    const previewBlockWidth = sizes.blocks * 0.55;

    nextBlock.variations[0].map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        if (!this.#drawer) return;

        const block = nextBlock.variations[0][rowIndex][columnIndex];
        if (block !== 1) return;

        const x = columnIndex * (previewBlockWidth + sizes.lineWidth / 4) + nextBlockX;
        const y = rowIndex * (previewBlockWidth + sizes.lineWidth / 4) + nextBlockY;

        this.#drawer.rectangle({
          color: colors.front,
          y: y + sizes.lineWidth,
          x: x + sizes.lineWidth,
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

  #drawControlsInstructions = () => {
    if (
      !this.#drawer ||
      !this.#downArrowImageDOM ||
      !this.#upArrowImageDOM ||
      !this.#rightArrowImageDOM ||
      !this.#leftArrowImageDOM
    )
      return;

    this.#drawer.text({
      color: colors.front,
      text: `Move blocks:`,
      y: config.canvas.height * 0.55,
      x: informationX + lineWidth,
      fontSize: '14px',
    });

    this.#drawer.image({
      image: this.#leftArrowImageDOM,
      destinationWidth: 124,
      destinationHeight: 124,
      destinationX: informationX + lineWidth,
      destinationY: config.canvas.height * 0.58,
      width: 64,
      height: 64,
      x: 0,
      y: 0,
    });

    this.#drawer.image({
      image: this.#rightArrowImageDOM,
      destinationWidth: 124,
      destinationHeight: 124,
      destinationX: informationX + lineWidth + 70,
      destinationY: config.canvas.height * 0.58,
      width: 64,
      height: 64,
      x: 0,
      y: 0,
    });

    this.#drawer.image({
      image: this.#downArrowImageDOM,
      destinationWidth: 124,
      destinationHeight: 124,
      destinationX: informationX + lineWidth + 140,
      destinationY: config.canvas.height * 0.58,
      width: 64,
      height: 64,
      x: 0,
      y: 0,
    });

    this.#drawer.text({
      color: colors.front,
      text: `Rotate blocks:`,
      y: config.canvas.height * 0.72,
      x: informationX + lineWidth,
      fontSize: '14px',
    });

    this.#drawer.image({
      image: this.#upArrowImageDOM,
      destinationWidth: 124,
      destinationHeight: 124,
      destinationX: informationX + lineWidth,
      destinationY: config.canvas.height * 0.75,
      width: 64,
      height: 64,
      x: 0,
      y: 0,
    });
  };

  #drawStartOrGameOver = ({ deltaTime }: IRenderObjectProps) => {
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
        if (this.#gameController.isGameOver) {
          this.#drawer.text({
            color: '#FFFFFF',
            text: `Game Over!`,
            y: config.canvas.height * 0.95,
            x: config.canvas.width * 0.64,
            fontSize: '20px',
          });
        } else {
          this.#drawer.text({
            color: '#FFFFFF',
            text: `Press Space to start`,
            y: config.canvas.height / 2 + 30,
            x: config.canvas.width / 2 - 160,
            fontSize: '16px',
          });

          this.#drawer.text({
            color: '#FFFFFF',
            text: `and use Arrow Keys to move blocks`,
            y: config.canvas.height / 2 + 60,
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
    this.#drawControlsInstructions();
    this.#drawStartOrGameOver(props);
  };
}

export default UI;
