// main_world.js keeps its own copy of the codec defaults
const ENHANCED_H264IFY_DEFAULTS = Object.freeze({
  block_60fps: false,
  block_h264: false,
  block_vp8: true,
  block_vp9: true,
  block_av1: true,
  block_opus: false,
  block_mp4a: false,
  // LN stands for Loudness Normalization
  disable_LN: false
});
