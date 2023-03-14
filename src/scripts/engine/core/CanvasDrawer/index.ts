import {
  IRectangleParams,
  ICanvasDrawerProps,
  ITextParams,
  IImageParams,
  IClearScreenParams,
  ILineParams,
  IStrokeRectParams,
} from './types';

import config from '../../../config';

class CanvasDrawer {
  #context?: CanvasRenderingContext2D;

  constructor({ context }: ICanvasDrawerProps) {
    this.#context = context;
  }

  rectangle = ({ color, x, y, height, width, padding = 0 }: IRectangleParams) => {
    if (!this.#context) return;

    const modifiedPadding = padding * 2;

    this.#context.beginPath();
    this.#context.fillStyle = color;
    this.#context.fillRect(
      x + modifiedPadding / 2,
      y + modifiedPadding / 2,
      width - modifiedPadding,
      height - modifiedPadding
    );
  };

  image = ({
    x,
    y,
    height,
    width,
    image,
    destinationX,
    destinationY,
    destinationWidth,
    destinationHeight,
  }: IImageParams) => {
    if (!this.#context) return;

    this.#context.imageSmoothingEnabled = false;

    this.#context.drawImage(
      image,
      x,
      y,
      width,
      height,
      destinationX,
      destinationY,
      destinationWidth,
      destinationHeight
    );
  };

  text = ({ color, x, y, text, fontSize }: ITextParams) => {
    if (!this.#context) return;

    this.#context.font = `${fontSize} '${config.fontFamily}'`;
    this.#context.fillStyle = color;
    this.#context.fillText(text, x, y);
  };

  clearScreen = ({ canvasHeight, canvasWidth }: IClearScreenParams) => {
    if (!this.#context) return;

    this.#context.beginPath();
    this.#context.rect(0, 0, canvasWidth, canvasHeight);
    this.#context.fillStyle = 'black';
    this.#context.fill();
    this.#context.shadowBlur = 0;
  };

  line = ({ fromX, fromY, toX, toY, color, width }: ILineParams) => {
    if (!this.#context) return;

    this.#context.beginPath();
    this.#context.moveTo(fromX, fromY);
    this.#context.lineTo(toX, toY);
    this.#context.lineWidth = width;
    this.#context.lineCap = 'square';
    this.#context.strokeStyle = color;
    this.#context.stroke();
  };

  strokeRect = ({ height, width, x, y, gradient, lineWidth }: IStrokeRectParams) => {
    if (!this.#context) return;

    this.#context.beginPath();
    if (gradient) this.#context.strokeStyle = gradient;
    this.#context.lineWidth = lineWidth;
    this.#context.strokeRect(x, y, width, height);
  };
}

export default CanvasDrawer;
