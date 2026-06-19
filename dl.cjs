const fs = require('fs');

async function download(url, path) {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path, buf);
}

async function main() {
  await download('https://i.ibb.co/gMR3tdCb/file-000000004c047209a4e27202c54ddd8d-1.png', 'public/test1.png');
  await download('https://i.ibb.co/5WR6skVX/file-000000004c047209a4e27202c54ddd8d-1.png', 'public/test2.png');
  console.log("Downloaded!");
}
main();
