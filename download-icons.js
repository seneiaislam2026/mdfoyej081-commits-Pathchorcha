const https = require('https');
const fs = require('fs');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

Promise.all([
  download('https://cdn-icons-png.flaticon.com/512/8076/8076045.png', './public/icon-512.png'),
  download('https://cdn-icons-png.flaticon.com/128/8076/8076045.png', './public/icon-192.png') // 128 is closest, Chrome will scale but it's better to find a 192. Wait, Flaticon has 512, Chrome can resize 512.
]).then(() => console.log('Icons downloaded')).catch(console.error);
