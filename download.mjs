import fs from "fs";

async function run() {
  try {
    const res = await fetch("https://ibb.co.com/DDFNtb2y");
    const html = await res.text();
    const match = html.match(/<meta property="og:image" content="(.*?)"/);
    if (match && match[1]) {
      const imgUrl = match[1];
      console.log("Found image URL:", imgUrl);
      
      const imgRes = await fetch(imgUrl);
      const buffer = await imgRes.arrayBuffer();
      fs.writeFileSync("public/icon-512.png", Buffer.from(buffer));
      fs.writeFileSync("public/logo.png", Buffer.from(buffer));
      
      // Let's also resize the image for icon-192 using some simple tool if required, or just use 512 for both for now since browsers can scale it down if needed. Although ideal is resize.
      fs.writeFileSync("public/icon-192.png", Buffer.from(buffer));
      
      console.log("Downloaded as public/icon-512.png and public/icon-192.png!");
    } else {
      console.log("Image URL not found in HTML");
    }
  } catch (err) {
    console.error(err);
  }
}
run();
