import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function checkContrast() {
  console.log('🎨 Starting Contrast Accessibility Check...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--force-device-scale-factor=1']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  const contrastReport = {
    timestamp: new Date().toISOString(),
    pages: {},
    issues: [],
    recommendations: []
  };

  try {
    // Navigate to the application
    console.log('📍 Navigating to http://localhost:3003...');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Inject axe-core accessibility library
    await page.addScriptTag({ 
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js' 
    });

    // Pages to test
    const pagesToTest = [
      { name: 'Login', url: 'http://localhost:3003/login' },
      { name: 'Dashboard', url: 'http://localhost:3003/' },
      { name: 'Profile', url: 'http://localhost:3003/profile' },
      { name: 'Recipes', url: 'http://localhost:3003/recipes' }
    ];

    for (const testPage of pagesToTest) {
      console.log(`\n🔍 Checking ${testPage.name} page...`);
      
      await page.goto(testPage.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      // Run axe accessibility audit
      const results = await page.evaluate(() => {
        return new Promise((resolve) => {
          if (typeof axe === 'undefined') {
            resolve({ violations: [], passes: [], incomplete: [] });
            return;
          }
          axe.run(document, {
            rules: {
              'color-contrast': { enabled: true },
              'color-contrast-enhanced': { enabled: true },
              'link-in-text-block': { enabled: true }
            }
          }).then(results => {
            resolve({
              violations: results.violations.filter(v => 
                v.id.includes('contrast') || v.id.includes('color')
              ),
              passes: results.passes.filter(p => 
                p.id.includes('contrast') || p.id.includes('color')
              ),
              incomplete: results.incomplete.filter(i => 
                i.id.includes('contrast') || i.id.includes('color')
              )
            });
          });
        });
      });

      // Get all color combinations on the page
      const colorCombinations = await page.evaluate(() => {
        const elements = [];
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
          const styles = window.getComputedStyle(el);
          const text = el.textContent?.trim();
          
          // Only check elements with text
          if (text && text.length > 0 && el.children.length === 0) {
            const color = styles.color;
            const bgColor = styles.backgroundColor;
            const fontSize = parseFloat(styles.fontSize);
            const fontWeight = styles.fontWeight;
            
            // Calculate relative luminance
            const getLuminance = (rgb) => {
              const match = rgb.match(/\d+/g);
              if (!match) return 0;
              const [r, g, b] = match.map(n => {
                const val = parseInt(n) / 255;
                return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
              });
              return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            };
            
            const getContrastRatio = (color1, color2) => {
              const l1 = getLuminance(color1);
              const l2 = getLuminance(color2);
              const lighter = Math.max(l1, l2);
              const darker = Math.min(l1, l2);
              return (lighter + 0.05) / (darker + 0.05);
            };
            
            const contrastRatio = bgColor !== 'rgba(0, 0, 0, 0)' 
              ? getContrastRatio(color, bgColor) 
              : null;
            
            if (contrastRatio) {
              // WCAG AA standards: 4.5:1 for normal text, 3:1 for large text
              const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
              const requiredRatio = isLargeText ? 3 : 4.5;
              const meetsAA = contrastRatio >= requiredRatio;
              const meetsAAA = contrastRatio >= (isLargeText ? 4.5 : 7);
              
              elements.push({
                selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''),
                text: text.substring(0, 30),
                color,
                backgroundColor: bgColor,
                fontSize: fontSize + 'px',
                fontWeight,
                contrastRatio: contrastRatio.toFixed(2),
                isLargeText,
                meetsAA,
                meetsAAA,
                requiredRatio
              });
            }
          }
        });
        
        return elements;
      });

      // Filter for problematic combinations
      const failingElements = colorCombinations.filter(el => !el.meetsAA);
      const warningElements = colorCombinations.filter(el => el.meetsAA && !el.meetsAAA);

      contrastReport.pages[testPage.name] = {
        url: testPage.url,
        totalElements: colorCombinations.length,
        violations: results.violations,
        passes: results.passes.length,
        incomplete: results.incomplete,
        failingElements,
        warningElements,
        summary: {
          failing: failingElements.length,
          warning: warningElements.length,
          passing: colorCombinations.filter(el => el.meetsAAA).length
        }
      };

      console.log(`  ✅ Checked ${colorCombinations.length} elements`);
      console.log(`  ❌ Failing: ${failingElements.length}`);
      console.log(`  ⚠️  Warning: ${warningElements.length}`);

      // Take screenshot for reference
      await page.screenshot({ 
        path: `contrast-check-${testPage.name.toLowerCase()}.png`,
        fullPage: true 
      });
    }

    // Test mobile view
    console.log('\n📱 Checking mobile view...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const mobileResults = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (typeof axe === 'undefined') {
          resolve({ violations: [], passes: [] });
          return;
        }
        axe.run(document, {
          rules: {
            'color-contrast': { enabled: true }
          }
        }).then(results => {
          resolve({
            violations: results.violations.filter(v => v.id.includes('contrast')),
            passes: results.passes.filter(p => p.id.includes('contrast'))
          });
        });
      });
    });

    contrastReport.pages['Mobile'] = {
      violations: mobileResults.violations,
      passes: mobileResults.passes.length
    };

    await page.screenshot({ 
      path: 'contrast-check-mobile.png',
      fullPage: true 
    });

    // Generate recommendations
    let totalFailing = 0;
    let criticalIssues = [];

    Object.entries(contrastReport.pages).forEach(([pageName, data]) => {
      if (data.failingElements) {
        totalFailing += data.failingElements.length;
        data.failingElements.forEach(el => {
          if (parseFloat(el.contrastRatio) < 3) {
            criticalIssues.push({
              page: pageName,
              element: el.selector,
              ratio: el.contrastRatio,
              required: el.requiredRatio
            });
          }
        });
      }
    });

    contrastReport.summary = {
      totalFailingElements: totalFailing,
      criticalIssues: criticalIssues.length,
      recommendations: []
    };

    // Add specific recommendations
    if (totalFailing > 0) {
      contrastReport.recommendations.push(
        '🎨 Increase color contrast for failing elements to meet WCAG AA standards',
        '📝 Consider using darker text colors (#2d3748 or darker) on light backgrounds',
        '🔍 Review purple brand color (#6B4C93) usage - ensure sufficient contrast'
      );
    }

    if (criticalIssues.length > 0) {
      contrastReport.recommendations.push(
        '🚨 CRITICAL: Some elements have contrast ratios below 3:1 - these must be fixed immediately'
      );
    }

    // Save detailed report
    fs.writeFileSync(
      'contrast-report.json',
      JSON.stringify(contrastReport, null, 2)
    );

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 CONTRAST ACCESSIBILITY REPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`\n📅 Timestamp: ${contrastReport.timestamp}`);
    console.log(`\n🎯 Overall Results:`);
    console.log(`  • Total Failing Elements: ${totalFailing}`);
    console.log(`  • Critical Issues (< 3:1): ${criticalIssues.length}`);
    
    console.log(`\n📄 Page-by-Page Breakdown:`);
    Object.entries(contrastReport.pages).forEach(([pageName, data]) => {
      if (data.summary) {
        console.log(`\n  ${pageName}:`);
        console.log(`    • Failing: ${data.summary.failing}`);
        console.log(`    • Warning: ${data.summary.warning}`);
        console.log(`    • Passing: ${data.summary.passing}`);
      }
    });

    if (contrastReport.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      contrastReport.recommendations.forEach(rec => {
        console.log(`  ${rec}`);
      });
    }

    console.log('\n✅ Full report saved to: contrast-report.json');
    console.log('📸 Screenshots saved with prefix: contrast-check-*.png');

    return contrastReport;

  } catch (error) {
    console.error('❌ Error during contrast check:', error);
    contrastReport.error = error.message;
  } finally {
    await browser.close();
  }

  return contrastReport;
}

// Run the check
checkContrast().then(() => {
  console.log('\n🎨 Contrast check complete!');
  process.exit(0);
}).catch(error => {
  console.error('Failed to complete contrast check:', error);
  process.exit(1);
});