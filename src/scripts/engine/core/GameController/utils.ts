import config from '../../../config';
import blocks from './blocks';
import { BlockFormat, IBlock } from './types';

const pickRandomBlockFormat = (): BlockFormat => {
  return blocks[Math.floor(Math.random() * (blocks.length - 1 - 0)) + 0];
};

export const pickRandomBlock = (): IBlock => {
  const format = pickRandomBlockFormat();

  const halfScreen = Math.floor(config.sizes.columns / 2);
  const halfBlock = Math.floor(format[0].length / 2);

  return {
    row: 0,
    column: Math.floor(halfScreen - halfBlock),
    format,
  };
};
