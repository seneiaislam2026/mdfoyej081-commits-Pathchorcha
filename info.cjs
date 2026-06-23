const sharp = require('sharp');

async function main() {
  try {
    const meta1 = await sharp('public/test1.png').metadata();
    console.log("test1:", meta1.width, "x", meta1.height);
    const meta2 = await sharp('public/test2.png').metadata();
    console.log("test2:", meta2.width, "x", meta2.height);
  } catch(e) {
    console.error(e);
  }
}
main();






