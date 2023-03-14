import config from '../../config';

const { sizes } = config;

const { blocksArea, informationIntendedWidth, lineWidth } = sizes;

export const screenY = lineWidth;
export const screenX = lineWidth;
export const screenWidth = blocksArea.width;
export const screenHeight = blocksArea.height;

export const informationX = screenWidth + lineWidth * 2;
export const informationY = screenY;
export const informationHeight = screenHeight;
export const informationWidth = informationIntendedWidth - lineWidth * 2;

export const backgroundX = 0;
export const backgroundY = 0;
export const backgroundWidth = screenWidth + informationWidth + lineWidth * 3;
export const backgroundHeight = screenHeight + lineWidth * 2;

export const topLeftCornerX = backgroundX;
export const topLeftCornerY = backgroundY;
