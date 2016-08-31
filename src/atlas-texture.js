import {ImageLoader, Texture} from 'three';


function sliceImage(image, x, y, width, height) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  Object.assign(canvas, {width, height});

  ctx.drawImage(image, x * width, y * height, width, height, 0, 0, width, height);

  return canvas;
}

export function load(url, onProgress) {
  return new Promise((resolve, reject) => {
    new ImageLoader().load(url, image => {
      const {width, height} = image;
      const textureWidth = Math.floor(width / 4);

      const textures = [
        [2, 1],
        [0, 1],
        [1, 0],
        [1, 2],
        [1, 1],
        [3, 1],
      ].map(([x, y]) =>
        sliceImage(image, x, y, textureWidth, textureWidth)
      ).map(canvas => new Texture(canvas));

      textures.forEach(texture => texture.needsUpdate = true);

      resolve(textures);
    }, onProgress, reject);
  });
}

