import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
    headless: true
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER EXCEPTION:', err.message));
  
  console.log('Navigating...');
  await page.goto('http://localhost:3000/public-exam/abcd');
  
  // wait 3 seconds to see if it renders
  await new Promise(r => setTimeout(r, 3000));
  
  const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'NO ROOT');
  console.log('Root HTML length:', rootHtml.length);
  if (rootHtml.length < 500) {
    console.log('HTML CONTENT:', rootHtml);
  }
  
  await browser.close();
})();
