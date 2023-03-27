import SoundManager from '../../objects/SoundManager';

export interface IGameControllerProps extends IObjectProps {
  soundManager: SoundManager;
}

export type IBlockFormat = number[][];

export interface ICanMoveReturn {
  can: boolean;
  reason: 'block' | 'wall' | 'out-of-screen' | '';
}

export interface IBlock {
  row: number;
  column: number;
  variations: IBlockFormat[];
  currentVariationIndex: number;
}

export type IMovementDirection = 'left' | 'right' | 'down' | 'idle';

export interface IMoveBlockToNewPositionProps {
  actualRow: number;
  actualColumn: number;
  direction: IMovementDirection;
  format: IBlockFormat;
  debug?: boolean;
}

export interface ICanMoveBlockToNewPositionProps
  extends Omit<IMoveBlockToNewPositionProps, 'direction'> {
  newRow: number;
  newColumn: number;
}

export interface ICanRotateBlockToNewPositionProps
  extends Omit<IMoveBlockToNewPositionProps, 'direction'> {
  newRow: number;
  newColumn: number;
  oldFormat: IBlockFormat;
}
