import https from 'https';
const url = process.argv[2] || 'https://ibb.co.com/LXxCvBMh';
https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const match = data.match(/https:\/\/i\.ibb\.co\.com\/[^\s"']+/g) || data.match(/https:\/\/i\.ibb\.co\/[^\s"']+/g);
    console.log(match);
  });
});
