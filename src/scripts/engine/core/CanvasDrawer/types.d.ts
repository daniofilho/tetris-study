import { BlockType } from '../GameController/types';

interface IDefaultCoordinatesParams {
  x: number;
  y: number;
}

interface IDefaultSizesParams {
  width: number;
  height: number;
}

interface IDefaultVisualParams {
  color: string;
}

// * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface IRectangleParams
  extends IDefaultCoordinatesParams,
    IDefaultSizesParams,
    IDefaultVisualParams {
  padding?: number;
}

interface ITextParams extends IDefaultCoordinatesParams, IDefaultVisualParams {
  text: string;
  fontSize: string;
}

interface IClearScreenParams {
  canvasWidth: number;
  canvasHeight: number;
}

interface IImageParams extends IDefaultCoordinatesParams, IDefaultSizesParams {
  image: HTMLImageElement;
  destinationX: number;
  destinationY: number;
  destinationWidth: number;
  destinationHeight: number;
}

interface ILineParams extends IDefaultVisualParams {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;
}

interface IStrokeRectParams extends IDefaultCoordinatesParams, IDefaultSizesParams {
  gradient?: CanvasGradient;
  lineWidth: number;
}

// * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export interface ICanvasDrawerProps {
  context: CanvasRenderingContext2D;
}

export interface ICanvasDrawer {
  clearScreen: (params: IClearScreenParams) => void;
  rectangle: (params: IRectangleParams) => void;
  text: (params: ITextParams) => void;
  image: (params: IImageParams) => void;
  line: (params: ILineParams) => void;
  strokeRect: (params: IStrokeRectParams) => void;
}
