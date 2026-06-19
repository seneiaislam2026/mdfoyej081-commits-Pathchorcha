const { Jimp } = require('jimp');

async function main() {
  try {
    const meta1 = await Jimp.read('public/test1.png');
    console.log("test1:", meta1.bitmap.width, "x", meta1.bitmap.height);
    const meta2 = await Jimp.read('public/test2.png');
    console.log("test2:", meta2.bitmap.width, "x", meta2.bitmap.height);
  } catch(e) {
    console.error(e);
  }
}
main();
