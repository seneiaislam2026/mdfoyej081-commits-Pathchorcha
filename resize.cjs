const { Jimp } = require('jimp');

async function main() {
  try {
    const image = await Jimp.read('public/icon-192-v2.png');
    
    const img192 = image.resize({ w: 192, h: 192 });
    await img192.write('public/icon-192.png');
    
    // re-read to not mess up clone over mutation
    const image2 = await Jimp.read('public/icon-192-v2.png');
    const img512 = image2.resize({ w: 512, h: 512 });
    await img512.write('public/icon-512.png');
    
    console.log("Resized successfully!");
  } catch(e) {
    console.error(e);
  }
}
main();
