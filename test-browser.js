const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  try {
    await page.goto('http://localhost:3000', {waitUntil: 'networkidle0', timeout: 10000});
  } catch (e) {
    console.log('Timeout or error:', e.message);
  }
  await browser.close();
  process.exit(0);
})();
