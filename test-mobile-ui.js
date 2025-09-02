const { chromium, devices } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  // Create context with iPhone 14 device emulation
  const iPhone = devices['iPhone 14'];
  const context = await browser.newContext({
    ...iPhone,
    permissions: ['geolocation'],
  });
  
  // Create page
  const page = await context.newPage();
  
  console.log('Opening Bronwyn\'s Guide in mobile view...');
  
  // Navigate to the site
  await page.goto('https://bronwyns-guide.vercel.app');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of login page
  await page.screenshot({ 
    path: 'mobile-login-screenshot.png',
    fullPage: true 
  });
  console.log('✅ Login page screenshot saved');
  
  // Try to login with test credentials
  await page.fill('input[type="text"]', 'Bronwyn');
  await page.fill('input[type="password"]', 'Bron1234');
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForTimeout(2000);
  
  // Take screenshot of dashboard
  await page.screenshot({ 
    path: 'mobile-dashboard-screenshot.png',
    fullPage: true 
  });
  console.log('✅ Dashboard screenshot saved');
  
  // Test mobile navigation - click on Recipes
  const recipesLink = await page.$('a[href="/recipes"]');
  if (recipesLink) {
    await recipesLink.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'mobile-recipes-screenshot.png',
      fullPage: true 
    });
    console.log('✅ Recipes page screenshot saved');
  }
  
  // Test mobile menu (hamburger)
  const menuButton = await page.$('.menu-toggle');
  if (menuButton) {
    await menuButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'mobile-menu-open-screenshot.png',
      fullPage: true 
    });
    console.log('✅ Mobile menu screenshot saved');
  }
  
  console.log('\n📱 Mobile UI test complete!');
  console.log('Screenshots saved in the current directory');
  
  // Keep browser open for manual inspection
  console.log('\n👀 Browser will stay open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
})();