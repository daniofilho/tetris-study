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

const { sizes, colors } = config;

class GameController {
  #drawer?: ICanvasDrawer;

  #isGameRunning: boolean = false;

  #level: number = 0;
  #score: number = 0;

  #currentBlock: IBlock = pickRandomBlock();
  #nextBlock: IBlock = pickRandomBlock();

  #grid: number[][] = [];

  #lastUpdate: number = Date.now();
  #timerDelay: number = 1500;
  #aBlockHasMoved: boolean = true;

  constructor({ context }: IGameControllerProps) {
    this.#drawer = new CanvasDrawer({ context });
  }

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  get isGameRunning() {
    return this.#isGameRunning;
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

  #canRun = (): boolean => {
    const canRun = Date.now() - this.#lastUpdate > this.#timerDelay / this.#level;
    if (!canRun) return false;

    this.#lastUpdate = Date.now();
    return true;
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #gameOver = () => {
    this.#isGameRunning = false;
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
      row.map((column, columnIndex) => {
        if (!this.#drawer) return;

        //don't draw off screen blocks
        if (rowIndex < sizes.blockMaxHeight) return;

        const x = screenX + sizes.blocks * columnIndex;
        const y = screenY + sizes.blocks * (rowIndex - sizes.blockMaxHeight); // - sizes.blockMaxHeight to fix x position and bring to top os screen

        const isSpaceEmpty = column === 0;

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
    if (newRow > sizes.rows + 1) return false;
    if (newColumn > sizes.columns + 1) return false;

    const auxGrid = [...this.#grid];

    let canMove = true;

    // First, remove this block from grid
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        auxGrid[rowIndex + actualRow][columnIndex + actualColumn] = 0;
      });
    });

    // Now, check if it can move
    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        // if can't move, don't waste resources
        if (!canMove) return;

        const rowToMove = rowIndex + newRow;
        const columnToMove = columnIndex + newColumn;

        if (auxGrid[rowToMove][columnToMove] !== 0) canMove = false;
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
      if (newRow <= sizes.blockMaxHeight) {
        this.#gameOver();
        return false;
      }

      return false;
    }

    // ok, move the block

    format.map((formatRow, rowIndex) => {
      formatRow.map((_, columnIndex) => {
        const rowToMove = rowIndex + newRow;
        const columnToMove = columnIndex + newColumn;

        this.#grid[rowToMove][columnToMove] = 1;
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

  #moveBlockDown = () => {
    if (!this.#canRun()) return;

    if (!this.#aBlockHasMoved) {
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
    //if (!this.#canRun()) return;

    console.log(direction);

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

    this.#resetGrid();
    this.#pickNewBlock();
  };

  start = () => {
    if (this.#isGameRunning) return;

    this.#reset();
    this.#isGameRunning = true;
  };

  render = ({}: IRenderObjectProps) => {
    if (!this.#isGameRunning || !this.#drawer) return;

    this.#drawGrid();
    this.#moveBlockDown();
  };
}

export default GameController;
