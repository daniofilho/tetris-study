import config from '../../../config';
import blocks from './blocks';
import { IBlockFormat, IBlock } from './types';

const pickRandomBlockVariations = (): IBlockFormat[] => {
  return blocks[Math.floor(Math.random() * (blocks.length - 1 - 0)) + 0];
};

export const pickRandomBlock = (): IBlock => {
  const currentVariationIndex = 0;

  const variations = pickRandomBlockVariations();

  const halfScreen = Math.floor(config.sizes.columns / 2);
  const halfBlock = Math.floor(variations[currentVariationIndex].length / 2);

  return {
    row: 0,
    column: Math.floor(halfScreen - halfBlock),
    variations,
    currentVariationIndex,
  };
};

export const generateEmptyLine = () => {
  return new Array(config.sizes.columns).fill(0);
};

export const generateCompletedLine = () => {
  return new Array(config.sizes.columns).fill(1);
};
