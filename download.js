const https = require('https');
const fs = require('fs');

https.get('https://i.ibb.co.com/8mR4T19/IMG-20260618-WA0012.jpg', (res) => {
  const path = './public/logo.png'; 
  const writeStream = fs.createWriteStream(path);
  res.pipe(writeStream);
  writeStream.on('finish', () => {
      writeStream.close();
      console.log('Download Completed');
  })
})
