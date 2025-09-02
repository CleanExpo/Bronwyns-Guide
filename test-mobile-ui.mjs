import { chromium, devices } from 'playwright';

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
  
  console.log('📱 Opening Bronwyn\'s Guide in mobile view (iPhone 14)...');
  console.log('🌐 URL: https://bronwyns-guide.vercel.app');
  
  // Navigate to the site
  await page.goto('https://bronwyns-guide.vercel.app');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of login page
  await page.screenshot({ 
    path: 'mobile-login-screenshot.png',
    fullPage: true 
  });
  console.log('✅ Login page screenshot saved: mobile-login-screenshot.png');
  
  // Try to login with test credentials
  console.log('🔐 Logging in with test credentials...');
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
  console.log('✅ Dashboard screenshot saved: mobile-dashboard-screenshot.png');
  
  // Test mobile navigation - click on Recipes
  console.log('📱 Testing mobile navigation...');
  const recipesLink = await page.$('a[href="/recipes"]');
  if (recipesLink) {
    await recipesLink.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'mobile-recipes-screenshot.png',
      fullPage: true 
    });
    console.log('✅ Recipes page screenshot saved: mobile-recipes-screenshot.png');
  }
  
  // Test mobile menu (hamburger)
  const menuButton = await page.$('.menu-toggle');
  if (menuButton) {
    console.log('📱 Testing mobile menu...');
    await menuButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'mobile-menu-open-screenshot.png',
      fullPage: true 
    });
    console.log('✅ Mobile menu screenshot saved: mobile-menu-open-screenshot.png');
  }
  
  console.log('\n✨ Mobile UI test complete!');
  console.log('📸 Screenshots saved in:', process.cwd());
  
  // Show current page info
  const currentUrl = page.url();
  const title = await page.title();
  console.log('\n📍 Current page:');
  console.log('   URL:', currentUrl);
  console.log('   Title:', title);
  
  // Keep browser open for manual inspection
  console.log('\n👀 Browser will stay open for 30 seconds for manual inspection...');
  console.log('   You can interact with the mobile view manually');
  await page.waitForTimeout(30000);
  
  await browser.close();
  console.log('✅ Browser closed');
})();