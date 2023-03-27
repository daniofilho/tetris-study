import CanvasDrawer from '../CanvasDrawer';
import { ICanvasDrawer } from '../CanvasDrawer/types';
import {
  IGameControllerProps,
  IBlock,
  IMoveBlockToNewPositionProps,
  ICanMoveBlockToNewPositionProps,
  IMovementDirection,
  ICanMoveReturn,
  ICanRotateBlockToNewPositionProps,
} from './types';

import config from '../../../config';

import { screenX, screenY } from '../../utils/calculations';
import { generateEmptyLine, pickRandomBlock } from './utils';
import RunChecker from '../../utils/RunChecker';
import SoundManager from '../../objects/SoundManager';

const { sizes, colors } = config;

class GameController {
  #drawer?: ICanvasDrawer;

  #isGameRunning: boolean = false;
  #isGameOver: boolean = false;

  #gravity: number = 1000;

  #level: number = 0;
  #score: number = 0;
  #linesCleared: number = 0;

  #currentBlock: IBlock = pickRandomBlock();
  #nextBlock: IBlock = pickRandomBlock();

  #grid: number[][] = [];

  #gravityRunChecker: RunChecker | null = null;
  #arrowKeyMovementRunChecker: RunChecker | null = null;
  #blockRotationRunChecker: RunChecker | null = null;

  #aBlockHasMoved: boolean = true;

  #isRotating: boolean = false;

  #soundManager?: SoundManager;

  constructor({ context, soundManager }: IGameControllerProps) {
    this.#drawer = new CanvasDrawer({ context });
    this.#soundManager = soundManager;

    this.#gravityRunChecker = new RunChecker(this.#gravity);
    this.#arrowKeyMovementRunChecker = new RunChecker(50);
    this.#blockRotationRunChecker = new RunChecker(200);
  }

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  get isGameRunning() {
    return this.#isGameRunning;
  }

  get isGameOver() {
    return this.#isGameOver;
  }

  get level() {
    return this.#level;
  }

  get score() {
    return this.#score;
  }

  get nextBlock() {
    return this.#nextBlock;
  }

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #gameOver = () => {
    this.#isGameRunning = false;
    this.#isGameOver = true;

    this.#soundManager?.ingameSound?.stop();
    this.#soundManager?.gameOverSound?.play();
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #resetGrid = () => {
    // * create more rows than needed (blockMaxHeight) so the blocks start out of screen
    this.#grid = Array.from({ length: sizes.rows + sizes.blockMaxHeight }, () =>
      Array(sizes.columns).fill(0)
    );
  };

  #drawGrid = () => {
    this.#grid.map((row, rowIndex) => {
      row.map((_, columnIndex) => {
        if (!this.#drawer) return;

        //don't draw off screen blocks
        if (rowIndex < sizes.blockMaxHeight) return;

        const block = this.#grid[rowIndex][columnIndex];

        const x = screenX + sizes.blocks * columnIndex;
        const y = screenY + sizes.blocks * (rowIndex - sizes.blockMaxHeight); // - sizes.blockMaxHeight to fix x position and bring to top os screen

        const isSpaceEmpty = block === 0;

        this.#drawer.rectangle({
          color: isSpaceEmpty ? colors.gray.dark : colors.front,
          width: sizes.blocks,
          height: sizes.blocks,
          x: x,
          y: y,
          padding: sizes.lineWidth / 2,
        });
      });
    });
  };

  #canMoveBlockToNewPosition = ({
    actualColumn,
    actualRow,
    format,
    newColumn,
    newRow,
    debug = false,
  }: ICanMoveBlockToNewPositionProps): ICanMoveReturn => {
    const blockWidth = format[0].length;
    const blockHeight = format.length;

    if (newRow + blockHeight > sizes.rows + sizes.blockMaxHeight) {
      return {
        can: false,
        reason: 'wall',
      };
    }

    if (newColumn + blockWidth > sizes.columns) {
      return {
        can: false,
        reason: 'wall',
      };
    }

    if (newColumn < 0) {
      return {
        can: false,
        reason: 'wall',
      };
    }

    let can = true;

    if (debug) {
      console.log(this.#grid);
      debugger;
    }

    // First, remove this block from grid
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const block = format[rowIndex][columnIndex];

        if (block === 1) this.#grid[rowIndex + actualRow][columnIndex + actualColumn] = 2;
      });
    });

    if (debug) {
      console.log(this.#grid);
      debugger;
    }

    // Now, check if it can move
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        // if can't move, don't waste resources
        if (!can) return;

        const rowToMove = rowIndex + newRow;
        const columnToMove = columnIndex + newColumn;

        const block = format[rowIndex][columnIndex];

        if (block === 1 && this.#grid[rowToMove][columnToMove] === 1) {
          can = false;
        }
      });
    });

    if (debug) {
      console.log(this.#grid);
      debugger;
    }

    // Now, put the block where it was
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const block = format[rowIndex][columnIndex];

        if (block === 1) this.#grid[rowIndex + actualRow][columnIndex + actualColumn] = 1;
      });
    });

    if (debug) {
      console.log(this.#grid);
      debugger;
    }

    return {
      can,
      reason: 'block',
    };
  };

  #canRotateBlockToNewPosition = ({
    actualColumn,
    actualRow,
    format,
    newColumn,
    newRow,
    oldFormat,
    debug = false,
  }: ICanRotateBlockToNewPositionProps): ICanMoveReturn => {
    const blockWidth = format[0].length;
    const blockHeight = format.length;

    if (newRow + blockHeight > sizes.rows + sizes.blockMaxHeight) {
      return {
        can: false,
        reason: 'wall',
      };
    }

    if (newColumn + blockWidth > sizes.columns) {
      return {
        can: false,
        reason: 'wall',
      };
    }

    if (newColumn < 0) {
      return {
        can: false,
        reason: 'wall',
      };
    }

    let can = true;

    if (debug) {
      console.log(this.#grid);
      debugger;
    }

    // First, remove the old block from grid
    oldFormat.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const block = oldFormat[rowIndex][columnIndex];

        if (block === 1) this.#grid[rowIndex + actualRow][columnIndex + actualColumn] = 2;
      });
    });

    if (debug) {
      console.log(this.#grid);
      debugger;
    }

    // Now, check if it can move
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        // if can't move, don't waste resources
        if (!can) return;

        const rowToMove = rowIndex + newRow;
        const columnToMove = columnIndex + newColumn;

        const block = format[rowIndex][columnIndex];

        if (debug) {
          console.log(
            `block = ${block} / ${rowToMove}x${columnToMove} = ${
              this.#grid[rowToMove][columnToMove]
            }`
          );
          debugger;
        }

        if (block === 1 && this.#grid[rowToMove][columnToMove] === 1) {
          can = false;
        }
      });
    });

    if (debug) {
      console.log(can, this.#grid);
      debugger;
    }

    // Now, put the old block where it was
    oldFormat.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const block = oldFormat[rowIndex][columnIndex];

        if (block === 1) this.#grid[rowIndex + actualRow][columnIndex + actualColumn] = 1;
      });
    });

    if (debug) {
      console.log(this.#grid);
      debugger;
    }

    return {
      can,
      reason: 'block',
    };
  };

  #moveBlockToPositionOnGrid = ({
    actualColumn,
    actualRow,
    direction,
    format,
    debug = false,
  }: IMoveBlockToNewPositionProps) => {
    let newRow = actualRow;
    let newColumn = actualColumn;

    if (direction === 'left') newColumn -= 1;
    if (direction === 'right') newColumn += 1;
    if (direction === 'down') newRow += 1;

    const canMove = this.#canMoveBlockToNewPosition({
      format,
      actualColumn,
      actualRow,
      newColumn,
      newRow,
    });

    if (!canMove.can) {
      if (newRow <= sizes.blockMaxHeight && direction === 'down') {
        this.#gameOver();
        return false;
      }

      return false;
    }

    // ok, move the block

    if (debug) {
      console.log(this.#grid);
    }

    // remove from last position
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const block = format[rowIndex][columnIndex];
        if (block === 1) this.#grid[rowIndex + actualRow][columnIndex + actualColumn] = 0;
      });
    });

    if (debug) {
      console.log(this.#grid);
    }

    // set to new position
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const rowToMove = rowIndex + newRow;
        const columnToMove = columnIndex + newColumn;

        const block = format[rowIndex][columnIndex];
        if (block === 1) this.#grid[rowToMove][columnToMove] = 1;
      });
    });

    if (debug) {
      console.log(this.#grid);
    }

    // save new coordinates
    this.#currentBlock = {
      ...this.#currentBlock,
      column: newColumn,
      row: newRow,
    };

    return true;
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #levelUp = () => {
    if (!this.#gravityRunChecker) return;

    this.#soundManager?.levelUpSound?.play();

    this.#level += 1;
    this.#gravity /= this.#level * 0.2;

    this.#gravityRunChecker.timerDelay = this.#gravity;
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #pickNewBlock = () => {
    this.#currentBlock = this.#nextBlock;
    this.#nextBlock = pickRandomBlock();

    this.#moveBlockToPositionOnGrid({
      actualColumn: this.#currentBlock.column,
      actualRow: this.#currentBlock.row,
      direction: 'down',
      format: this.#currentBlock.variations[this.#currentBlock.currentVariationIndex],
    });
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #scorePoints = (linesCleared: number) => {
    // # https://tetris.wiki/Scoring
    // A simplified (and lazy) score version based on original BPS scoring system

    this.#soundManager?.clearLineSound?.play();

    let newScore = 0;

    if (linesCleared === 1) newScore = 40 * this.#level;
    if (linesCleared === 2) newScore = 100 * this.#level;
    if (linesCleared === 3) newScore = 300 * this.#level;
    if (linesCleared >= 4) newScore = 1200 * this.#level;

    this.#score += newScore;
    this.#linesCleared += linesCleared;

    // # https://www.reddit.com/r/Tetris/comments/ksjnnb/what_is_the_leveling_system_in_tetris/
    const targetLinesToLevelUp = this.#level * 10;
    if (this.#linesCleared > targetLinesToLevelUp) this.#levelUp();
  };

  #checkCompletedRolls = () => {
    let linesCleared = 0;

    this.#grid.map((row, rowIndex) => {
      let scored = true;
      let scoredRow: number | null = null;

      row.map((_, columnIndex) => {
        if (!scored) return;

        const block = this.#grid[rowIndex][columnIndex];

        if (block === 0) scored = false;

        if (columnIndex === config.sizes.columns - 1 && scored) {
          scoredRow = rowIndex;
        }
      });

      if (scored && scoredRow) {
        linesCleared += 1;

        // clear line
        this.#grid[scoredRow] = generateEmptyLine();

        // move everything down, from bottom to top
        for (let i = scoredRow; i >= 1; i--) {
          this.#grid[i] = this.#grid[i - 1];
        }

        // Make first row a new empty row
        this.#grid[0] = generateEmptyLine();
      }

      //reset
      scoredRow = null;
      scored = false;
    });

    if (linesCleared > 0) this.#scorePoints(linesCleared);
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #activateBlockGravity = () => {
    if (!this.#isGameRunning) return;

    if (!this.#gravityRunChecker) return;

    if (!this.#gravityRunChecker.canRun()) return;

    this.#aBlockHasMoved = this.#moveBlockToPositionOnGrid({
      actualColumn: this.#currentBlock.column,
      actualRow: this.#currentBlock.row,
      direction: 'down',
      format: this.#currentBlock.variations[this.#currentBlock.currentVariationIndex],
    });

    if (!this.#aBlockHasMoved) {
      this.#aBlockHasMoved = true;
      this.#gravityRunChecker.resetTimer();
      this.#checkCompletedRolls();

      return this.#pickNewBlock();
    }
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #reset = () => {
    this.#level = 1;
    this.#score = 0;
    this.#isGameOver = false;

    this.#resetGrid();
    this.#pickNewBlock();

    this.#soundManager?.soundtrackSound?.stop();
    this.#soundManager?.ingameSound?.play();
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  moveBlock = (direction: IMovementDirection) => {
    if (this.#isRotating) return;

    if (!this.#arrowKeyMovementRunChecker) return;

    if (!this.#arrowKeyMovementRunChecker.canRun()) return;

    this.#moveBlockToPositionOnGrid({
      actualColumn: this.#currentBlock.column,
      actualRow: this.#currentBlock.row,
      direction,
      format: this.#currentBlock.variations[this.#currentBlock.currentVariationIndex],
    });
  };

  rotateBlock = () => {
    const debug = false;

    if (!this.#blockRotationRunChecker) return;

    if (!this.#blockRotationRunChecker.canRun()) return;

    this.#isRotating = true;

    const oldVariationIndex = this.#currentBlock.currentVariationIndex;

    // Detect new Position
    const variationsCount = this.#currentBlock.variations.length - 1;
    let newVariation = this.#currentBlock.currentVariationIndex + 1;
    if (newVariation > variationsCount) newVariation = 0;

    // check if can move
    const canRotate = this.#canRotateBlockToNewPosition({
      format: this.#currentBlock.variations[newVariation],
      oldFormat: this.#currentBlock.variations[oldVariationIndex],
      actualColumn: this.#currentBlock.column,
      actualRow: this.#currentBlock.row,
      newColumn: this.#currentBlock.column,
      newRow: this.#currentBlock.row,
      debug,
    });

    if (!canRotate.can) {
      this.#isRotating = false;
      return;
    }

    // ok, let's move and save new movement
    this.#currentBlock.currentVariationIndex = newVariation;

    // Remove old format from the grid
    this.#currentBlock.variations[oldVariationIndex].map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const block = this.#currentBlock.variations[oldVariationIndex][rowIndex][columnIndex];
        if (block === 1)
          this.#grid[rowIndex + this.#currentBlock.row][
            columnIndex + this.#currentBlock.column
          ] = 0;
      });
    });

    // Draw on new position
    this.#moveBlockToPositionOnGrid({
      actualColumn: this.#currentBlock.column,
      actualRow: this.#currentBlock.row,
      direction: 'idle',
      format: this.#currentBlock.variations[this.#currentBlock.currentVariationIndex],
    });

    this.#isRotating = false;
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  start = () => {
    if (this.#isGameRunning) return;

    this.#reset();
    this.#isGameRunning = true;
  };

  render = ({}: IRenderObjectProps) => {
    if (!this.#drawer) return;

    this.#drawGrid();

    this.#activateBlockGravity();
  };
}

export default GameController;
