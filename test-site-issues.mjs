import { chromium, devices } from 'playwright';

async function testSiteIssues() {
  console.log('🔍 Testing Bronwyn\'s Guide for issues...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  // Test on Desktop
  console.log('📱 Testing Desktop View...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const desktopPage = await desktopContext.newPage();
  
  const issues = [];
  
  try {
    // 1. Test Login Page
    console.log('Testing Login Page...');
    await desktopPage.goto('https://bronwyns-guide.vercel.app/login');
    await desktopPage.waitForLoadState('networkidle');
    
    // Check if login form exists
    const loginForm = await desktopPage.$('form');
    if (!loginForm) {
      issues.push('❌ Login form not found');
    }
    
    // Try to login
    console.log('Attempting login...');
    await desktopPage.fill('input[type="text"]', 'Bronwyn');
    await desktopPage.fill('input[type="password"]', 'Bron1234');
    await desktopPage.click('button[type="submit"]');
    
    // Wait for navigation
    await desktopPage.waitForTimeout(3000);
    
    // 2. Check Dashboard
    console.log('Testing Dashboard...');
    const currentUrl = desktopPage.url();
    if (!currentUrl.includes('/') || currentUrl.includes('/login')) {
      issues.push('❌ Login failed or redirect to dashboard failed');
    }
    
    // 3. Check for Health Profile in navigation
    console.log('Looking for Health Profile link...');
    const healthProfileLink = await desktopPage.$('a[href="/profile"]');
    if (!healthProfileLink) {
      issues.push('❌ Health Profile link not found in navigation');
    } else {
      // Click on Health Profile
      await healthProfileLink.click();
      await desktopPage.waitForTimeout(2000);
      
      // Check if Health Profile page loaded
      const profileTitle = await desktopPage.$('h1:has-text("Health Profile")');
      if (!profileTitle) {
        issues.push('❌ Health Profile page not loading correctly');
      }
      
      // Check for key sections
      const healthConditions = await desktopPage.$('text=/Health Conditions/i');
      const allergies = await desktopPage.$('text=/Allergies/i');
      const dietary = await desktopPage.$('text=/Dietary/i');
      
      if (!healthConditions) issues.push('❌ Health Conditions section missing');
      if (!allergies) issues.push('❌ Allergies section missing');
      if (!dietary) issues.push('❌ Dietary Preferences section missing');
      
      // Check if Edit button exists
      const editButton = await desktopPage.$('button:has-text("Edit Profile")');
      if (!editButton) {
        issues.push('❌ Edit Profile button missing');
      } else {
        // Try to edit
        await editButton.click();
        await desktopPage.waitForTimeout(1000);
        
        // Check if form fields are editable
        const firstNameInput = await desktopPage.$('input[value*="Bronwyn"]');
        if (!firstNameInput) {
          issues.push('❌ Profile form fields not populating');
        }
      }
    }
    
    // 4. Test Recipes page
    console.log('Testing Recipes page...');
    await desktopPage.goto('https://bronwyns-guide.vercel.app/recipes');
    await desktopPage.waitForTimeout(2000);
    
    const addRecipeButton = await desktopPage.$('a[href="/recipes/new"]');
    if (!addRecipeButton) {
      issues.push('❌ Add Recipe button missing');
    }
    
    // 5. Test Recipe Capture
    console.log('Testing Recipe Capture page...');
    await desktopPage.goto('https://bronwyns-guide.vercel.app/recipes/new');
    await desktopPage.waitForTimeout(2000);
    
    const imageUpload = await desktopPage.$('input[type="file"]');
    const cameraButton = await desktopPage.$('button:has-text("Take Photo")');
    
    if (!imageUpload && !cameraButton) {
      issues.push('❌ Image upload/capture functionality missing');
    }
    
    // Take screenshots of issues
    await desktopPage.screenshot({ 
      path: 'issue-profile-page.png',
      fullPage: true 
    });
    
  } catch (error) {
    issues.push(`❌ Error during testing: ${error.message}`);
  }
  
  // Test on Mobile
  console.log('\n📱 Testing Mobile View...');
  const iPhone = devices['iPhone 14'];
  const mobileContext = await browser.newContext(iPhone);
  const mobilePage = await mobileContext.newPage();
  
  try {
    await mobilePage.goto('https://bronwyns-guide.vercel.app');
    await mobilePage.waitForTimeout(2000);
    
    // Check mobile navigation
    const mobileNav = await mobilePage.$('.mobile-nav');
    if (!mobileNav) {
      issues.push('❌ Mobile navigation missing');
    }
    
    // Check if Health Profile is in mobile nav
    const mobileProfileLink = await mobilePage.$('.mobile-nav a[href="/profile"]');
    if (!mobileProfileLink) {
      issues.push('❌ Health Profile not in mobile navigation');
    }
    
    await mobilePage.screenshot({ 
      path: 'issue-mobile-view.png',
      fullPage: true 
    });
    
  } catch (error) {
    issues.push(`❌ Mobile testing error: ${error.message}`);
  }
  
  // Report Issues
  console.log('\n📋 ISSUES FOUND:');
  if (issues.length === 0) {
    console.log('✅ No issues found!');
  } else {
    issues.forEach(issue => console.log(issue));
  }
  
  console.log('\n📸 Screenshots saved:');
  console.log('  - issue-profile-page.png');
  console.log('  - issue-mobile-view.png');
  
  console.log('\n🔍 Keeping browser open for 30 seconds for manual inspection...');
  await desktopPage.waitForTimeout(30000);
  
  await browser.close();
  
  return issues;
}

// Run the test
testSiteIssues().then(issues => {
  console.log('\n✅ Testing complete!');
  if (issues.length > 0) {
    console.log('\n🚨 TODO LIST FOR FIXES:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. Fix: ${issue.replace('❌ ', '')}`);
    });
  }
}).catch(error => {
  console.error('Test failed:', error);
});