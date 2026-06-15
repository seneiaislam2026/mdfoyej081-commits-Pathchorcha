import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  await page.goto('http://localhost:3000/memorize', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  console.log("BODY LEN:", (await page.content()).length);
  await browser.close();
  console.log("DONE!");
})();
