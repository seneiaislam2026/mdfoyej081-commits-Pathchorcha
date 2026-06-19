const https = require('https');
const fs = require('fs');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

const logoUrl = 'https://i.ibb.co/5WR6skVX/file-000000004c047209a4e27202c54ddd8d-1.png';
download(logoUrl, 'public/icon-192-v2.png').then(() => console.log('192 done'));
download(logoUrl, 'public/icon-512-v2.png').then(() => console.log('512 done'));
