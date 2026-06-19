const { Jimp } = require('jimp');

async function main() {
  try {
    const image = await Jimp.read('public/test1.png');
    
    // Crop the left part (likely the emblem/icon without text)
    // 1535 width, 1024 height. We crop left 1024x1024.
    image.crop({ x: 0, y: 0, w: 1024, h: 1024 });

    const img192 = image.clone().resize({ w: 192, h: 192 });
    await img192.write('public/icon-192-v2.png');
    
    const img512 = image.clone().resize({ w: 512, h: 512 });
    await img512.write('public/icon-512-v2.png');
    
    // Write out the cropped emblem as a new file for the navbar/landing!
    await image.write('public/emblem.png');
    
    console.log("Resized and left-cropped successfully!");
  } catch(e) {
    console.error(e);
  }
}
main();
