export interface IGameControllerProps extends IObjectProps {}

export type BlockFormat = number[][];

export interface IBlock {
  row: number;
  column: number;
  format: BlockFormat;
}

export type IMovementDirection = 'left' | 'right' | 'down';

export interface IMoveBlockToNewPositionProps {
  actualRow: number;
  actualColumn: number;
  direction: IMovementDirection;
  format: BlockFormat;
}

export interface ICanMoveBlockToNewPositionProps
  extends Omit<IMoveBlockToNewPositionProps, 'direction'> {
  newRow: number;
  newColumn: number;
}
