import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  await page.goto('http://localhost:3000/memorize', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  
  // Click english
  try {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('English') || text.includes('ইংরেজি')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    
    // Click HSC paragraphs
    const catButtons = await page.$$('button');
    for (const btn of catButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('HSC Paragraph')) {
        await btn.click();
        break;
      }
    }
  } catch (err) {
    console.log("TEST CODE ERROR", err);
  }

  await new Promise(r => setTimeout(r, 1000));
  console.log("BODY LEN:", (await page.content()).length);
  await browser.close();
  console.log("DONE!");
})();
