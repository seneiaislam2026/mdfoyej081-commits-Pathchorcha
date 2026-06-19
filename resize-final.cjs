const { Jimp } = require('jimp');

async function main() {
  try {
    const image = await Jimp.read('public/test1.png');
    
    // Crop center 1024x1024
    const cropX = Math.floor((image.bitmap.width - 1024) / 2);
    const cropY = Math.floor((image.bitmap.height - 1024) / 2);
    image.crop({ x: cropX, y: cropY, w: 1024, h: 1024 });

    // Jimp v1 resize method usage
    const img192 = image.clone().resize({ w: 192, h: 192 });
    await img192.write('public/icon-192-v2.png');
    
    const img512 = image.clone().resize({ w: 512, h: 512 });
    await img512.write('public/icon-512-v2.png');
    
    console.log("Resized and cropped successfully!");
  } catch(e) {
    console.error(e);
  }
}
main();
