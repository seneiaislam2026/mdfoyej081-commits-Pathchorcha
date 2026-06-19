const https = require('https');
https.get('https://ibb.co.com/99rNyhjm', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const urls = data.match(/https:\/\/[^"]+\.(png|jpg|jpeg|gif|webp)/g);
    if (urls) {
      console.log(Array.from(new Set(urls)).join('\n'));
    } else {
      console.log('No images found');
    }
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
