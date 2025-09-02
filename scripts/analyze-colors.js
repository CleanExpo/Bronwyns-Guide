import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WCAG contrast ratio calculation
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function rgbStringToArray(rgbString) {
  const match = rgbString.match(/\d+/g);
  return match ? match.slice(0, 3).map(Number) : null;
}

// Common colors used in the app
const appColors = {
  // Brand colors
  purple: '#6B4C93',
  purpleDark: '#553c7a',
  purpleLight: '#e9d8fd',
  
  // Text colors
  textDark: '#2d3748',
  textMedium: '#4a5568',
  textLight: '#718096',
  
  // Background colors
  white: '#ffffff',
  bgGray: '#f7fafc',
  bgLight: '#f8f9fa',
  
  // UI colors
  borderGray: '#e2e8f0',
  borderLight: '#cbd5e0',
  
  // Status colors
  green: '#48bb78',
  red: '#e53e3e',
  yellow: '#ecc94b',
  blue: '#4299e1'
};

// Common color combinations in the app
const colorCombinations = [
  // Primary brand combinations
  { name: 'Purple button on white', text: appColors.purple, bg: appColors.white },
  { name: 'White text on purple', text: appColors.white, bg: appColors.purple },
  { name: 'Purple on light purple', text: appColors.purple, bg: appColors.purpleLight },
  
  // Text combinations
  { name: 'Dark text on white', text: appColors.textDark, bg: appColors.white },
  { name: 'Medium text on white', text: appColors.textMedium, bg: appColors.white },
  { name: 'Light text on white', text: appColors.textLight, bg: appColors.white },
  { name: 'Dark text on gray bg', text: appColors.textDark, bg: appColors.bgGray },
  { name: 'Light text on gray bg', text: appColors.textLight, bg: appColors.bgGray },
  
  // Form inputs
  { name: 'Input text', text: appColors.textDark, bg: appColors.white },
  { name: 'Input placeholder', text: appColors.textLight, bg: appColors.white },
  { name: 'Input label', text: appColors.textMedium, bg: appColors.white },
  
  // Status indicators
  { name: 'Success text', text: appColors.green, bg: appColors.white },
  { name: 'Error text', text: appColors.red, bg: appColors.white },
  { name: 'Warning text', text: appColors.yellow, bg: appColors.white },
  { name: 'Info text', text: appColors.blue, bg: appColors.white },
  
  // Mobile nav
  { name: 'Nav text active', text: appColors.purple, bg: appColors.white },
  { name: 'Nav text inactive', text: appColors.textLight, bg: appColors.white },
  
  // Health indicators
  { name: 'Green badge on white', text: appColors.green, bg: appColors.white },
  { name: 'Red badge on white', text: appColors.red, bg: appColors.white },
  { name: 'White on green', text: appColors.white, bg: appColors.green },
  { name: 'White on red', text: appColors.white, bg: appColors.red }
];

console.log('🎨 CONTRAST ANALYSIS REPORT');
console.log('=' .repeat(60));
console.log('\n📊 Analyzing color combinations from Bronwyn\'s Guide app...\n');

const results = {
  passing: [],
  failing: [],
  warning: []
};

colorCombinations.forEach(combo => {
  const textRgb = hexToRgb(combo.text);
  const bgRgb = hexToRgb(combo.bg);
  
  if (textRgb && bgRgb) {
    const ratio = getContrastRatio(textRgb, bgRgb);
    const roundedRatio = Math.round(ratio * 100) / 100;
    
    // WCAG standards
    const normalTextAA = 4.5;
    const largeTextAA = 3;
    const normalTextAAA = 7;
    const largeTextAAA = 4.5;
    
    const result = {
      name: combo.name,
      textColor: combo.text,
      bgColor: combo.bg,
      ratio: roundedRatio,
      meetsNormalAA: ratio >= normalTextAA,
      meetsLargeAA: ratio >= largeTextAA,
      meetsNormalAAA: ratio >= normalTextAAA,
      meetsLargeAAA: ratio >= largeTextAAA
    };
    
    // Categorize results
    if (!result.meetsLargeAA) {
      results.failing.push(result);
    } else if (!result.meetsNormalAA) {
      results.warning.push(result);
    } else {
      results.passing.push(result);
    }
  }
});

// Print results
console.log('✅ PASSING (Meets WCAG AA for normal text)');
console.log('-'.repeat(60));
results.passing.forEach(r => {
  const aaaStatus = r.meetsNormalAAA ? '★' : '';
  console.log(`  ${r.name.padEnd(30)} ${r.ratio}:1 ${aaaStatus}`);
});

if (results.warning.length > 0) {
  console.log('\n⚠️  WARNING (Only meets AA for large text)');
  console.log('-'.repeat(60));
  results.warning.forEach(r => {
    console.log(`  ${r.name.padEnd(30)} ${r.ratio}:1`);
    console.log(`    → Use for text ≥18px or ≥14px bold only`);
  });
}

if (results.failing.length > 0) {
  console.log('\n❌ FAILING (Does not meet minimum standards)');
  console.log('-'.repeat(60));
  results.failing.forEach(r => {
    console.log(`  ${r.name.padEnd(30)} ${r.ratio}:1`);
    console.log(`    → Minimum required: ${r.meetsLargeAA ? 'OK for large' : '3:1 (large) / 4.5:1 (normal)'}`);
  });
}

// Recommendations
console.log('\n💡 RECOMMENDATIONS');
console.log('-'.repeat(60));

const recommendations = [];

// Check specific problematic combinations
const lightGrayOnWhite = getContrastRatio(hexToRgb('#718096'), hexToRgb('#ffffff'));
if (lightGrayOnWhite < 4.5) {
  recommendations.push(`• Light gray text (#718096) on white has ratio ${lightGrayOnWhite.toFixed(2)}:1
    → Consider using #5a6c7d or darker for better readability`);
}

const purpleOnWhite = getContrastRatio(hexToRgb('#6B4C93'), hexToRgb('#ffffff'));
if (purpleOnWhite < 4.5) {
  recommendations.push(`• Purple (#6B4C93) on white has ratio ${purpleOnWhite.toFixed(2)}:1
    → Consider darkening to #5a3f7d for WCAG AA compliance`);
}

// General recommendations
recommendations.push(
  '• Ensure all body text meets 4.5:1 contrast ratio',
  '• Large headings (≥18px) can use 3:1 ratio',
  '• Interactive elements (buttons, links) should have 4.5:1 ratio',
  '• Consider using a contrast checking tool during development',
  '• Test with users who have visual impairments'
);

recommendations.forEach(rec => console.log(rec));

// Save report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    total: colorCombinations.length,
    passing: results.passing.length,
    warning: results.warning.length,
    failing: results.failing.length
  },
  results,
  recommendations,
  wcagStandards: {
    AA: {
      normalText: '4.5:1',
      largeText: '3:1 (≥18px or ≥14px bold)'
    },
    AAA: {
      normalText: '7:1',
      largeText: '4.5:1'
    }
  }
};

fs.writeFileSync(
  path.join(__dirname, '..', 'contrast-analysis.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n📁 Full report saved to: contrast-analysis.json');

// Summary
console.log('\n📈 SUMMARY');
console.log('-'.repeat(60));
console.log(`Total combinations tested: ${colorCombinations.length}`);
console.log(`✅ Passing: ${results.passing.length} (${Math.round(results.passing.length / colorCombinations.length * 100)}%)`);
console.log(`⚠️  Warning: ${results.warning.length} (${Math.round(results.warning.length / colorCombinations.length * 100)}%)`);
console.log(`❌ Failing: ${results.failing.length} (${Math.round(results.failing.length / colorCombinations.length * 100)}%)`);

if (results.failing.length === 0 && results.warning.length <= 2) {
  console.log('\n🎉 Overall: Good contrast accessibility!');
} else if (results.failing.length === 0) {
  console.log('\n⚠️  Overall: Acceptable, but could be improved');
} else {
  console.log('\n❌ Overall: Contrast issues need to be addressed');
}

export default report;