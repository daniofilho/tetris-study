import CanvasDrawer from '../CanvasDrawer';
import { ICanvasDrawer } from '../CanvasDrawer/types';
import {
  IGameControllerProps,
  IBlock,
  IMoveBlockToNewPositionProps,
  ICanMoveBlockToNewPositionProps,
  IMovementDirection,
} from './types';

import config from '../../../config';

import { screenX, screenY } from '../../utils/calculations';
import { pickRandomBlock } from './utils';
import RunChecker from '../../utils/RunChecker';

const { sizes, colors } = config;

class GameController {
  #drawer?: ICanvasDrawer;

  #isGameRunning: boolean = false;
  #isGameOver: boolean = false;

  #gravity: number = 1000; //

  #level: number = 0;
  #score: number = 0;

  #currentBlock: IBlock = pickRandomBlock();
  #nextBlock: IBlock = pickRandomBlock();

  #grid: number[][] = [];

  #gravityRunChecker: RunChecker | null = null;
  #arrowKeyMovementRunChecker: RunChecker | null = null;

  #aBlockHasMoved: boolean = true;

  constructor({ context }: IGameControllerProps) {
    this.#drawer = new CanvasDrawer({ context });

    this.#gravityRunChecker = new RunChecker(this.#gravity);
    this.#arrowKeyMovementRunChecker = new RunChecker(50);
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
  }: ICanMoveBlockToNewPositionProps): boolean => {
    const blockWidth = format[0].length;
    const blockHeight = format.length;

    if (newRow + blockHeight > sizes.rows + sizes.blockMaxHeight) return false;
    if (newColumn + blockWidth > sizes.columns) return false;
    if (newColumn < 0) return false;

    let canMove = true;

    // First, remove this block from grid
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const block = format[rowIndex][columnIndex];

        if (block === 1) this.#grid[rowIndex + actualRow][columnIndex + actualColumn] = 2;
      });
    });

    // Now, check if it can move
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        // if can't move, don't waste resources
        if (!canMove) return;

        const rowToMove = rowIndex + newRow;
        const columnToMove = columnIndex + newColumn;

        const block = format[rowIndex][columnIndex];

        if (block === 1 && this.#grid[rowToMove][columnToMove] === 1) {
          canMove = false;
        }
      });
    });

    // Now, put the block where it was
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const block = format[rowIndex][columnIndex];

        if (block === 1) this.#grid[rowIndex + actualRow][columnIndex + actualColumn] = 1;
      });
    });

    return canMove;
  };

  #moveBlockToPositionOnGrid = ({
    actualColumn,
    actualRow,
    direction,
    format,
  }: IMoveBlockToNewPositionProps) => {
    let newRow = actualRow;
    let newColumn = actualColumn;

    if (direction === 'left') newColumn -= 1;
    if (direction === 'right') newColumn += 1;
    if (direction === 'down') newRow += 1;

    if (
      !this.#canMoveBlockToNewPosition({
        format,
        actualColumn,
        actualRow,
        newColumn,
        newRow,
      })
    ) {
      if (newRow <= sizes.blockMaxHeight && direction === 'down') {
        this.#gameOver();
        return false;
      }

      return false;
    }

    // ok, move the block

    // remove from last position
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        this.#grid[rowIndex + actualRow][columnIndex + actualColumn] = 0;
      });
    });

    // set to new position
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const rowToMove = rowIndex + newRow;
        const columnToMove = columnIndex + newColumn;

        const block = format[rowIndex][columnIndex];
        if (block === 1) this.#grid[rowToMove][columnToMove] = 1;
      });
    });

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

    this.#level += 1;
    this.#gravity /= this.#level * 0.5;

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
      format: this.#currentBlock.format,
    });
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #activateBlockGravity = () => {
    if (!this.#isGameRunning) return;

    if (!this.#gravityRunChecker) return;

    if (!this.#gravityRunChecker.canRun()) return;

    if (!this.#aBlockHasMoved) {
      this.#aBlockHasMoved = true;
      this.#gravityRunChecker.resetTimer();
      return this.#pickNewBlock();
    }

    this.#aBlockHasMoved = this.#moveBlockToPositionOnGrid({
      actualColumn: this.#currentBlock.column,
      actualRow: this.#currentBlock.row,
      direction: 'down',
      format: this.#currentBlock.format,
    });
  };

  moveBlock = (direction: IMovementDirection) => {
    if (!this.#arrowKeyMovementRunChecker) return;

    if (!this.#arrowKeyMovementRunChecker.canRun()) return;

    this.#moveBlockToPositionOnGrid({
      actualColumn: this.#currentBlock.column,
      actualRow: this.#currentBlock.row,
      direction,
      format: this.#currentBlock.format,
    });
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #reset = () => {
    this.#level = 1;
    this.#score = 0;
    this.#isGameOver = false;

    this.#resetGrid();
    this.#pickNewBlock();
  };

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
