import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setCacheEnabled(false);
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCache');
  await client.send('Network.setBypassServiceWorker', { bypass: true });

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
  console.log("FINAL URL is:", page.url());
  
  await browser.close();
})();
