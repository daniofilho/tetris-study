const config = {
  fps: 60,
  fontFamily: 'Press Start 2P',
  canvas: {
    width: 0,
    height: 720,
    centerX: 0,
    centerY: 0,
  },
  colors: {
    gray: {
      default: '#9EAD86',
      dark: '#83946E',
    },
    front: '#000100',
  },
  sizes: {
    columns: 10,
    rows: 20,
    lineWidth: 8,
    blocks: 0,
    blocksArea: {
      width: 0,
      height: 0,
    },
    blockMaxHeight: 3,
    informationIntendedWidth: 250,
  },
};

config.sizes.blocks = config.canvas.height / config.sizes.rows;
config.canvas.width =
  config.sizes.blocks * config.sizes.columns +
  config.sizes.informationIntendedWidth +
  config.sizes.lineWidth;
config.canvas.height = config.sizes.blocks * config.sizes.rows + config.sizes.lineWidth * 2;
config.canvas.centerX = config.canvas.width / 2;
config.canvas.centerY = config.canvas.height / 2;

config.sizes.blocksArea = {
  ...config.sizes.blocksArea,
  width: config.sizes.columns * config.sizes.blocks,
  height: config.sizes.rows * config.sizes.blocks,
};

config.sizes = {
  ...config.sizes,
};

export default config;
