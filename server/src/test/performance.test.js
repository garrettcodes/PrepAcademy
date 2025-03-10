const puppeteer = require('puppeteer');

// Test configuration
const APP_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 300000; // 5 minutes
const EXAM_DURATION = 20; // 20 seconds (for testing)

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Performance metrics to track
const PERFORMANCE_METRICS = [
  'LayoutDuration',
  'RecalcStyleDuration',
  'ScriptDuration',
  'TaskDuration',
  'FirstContentfulPaint',
  'DomContentLoaded',
  'Load'
];

// Set test timeout
jest.setTimeout(TEST_TIMEOUT);

describe('Exam Timer Performance', () => {
  let browser;
  let page;
  let performanceLogs = [];

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-precise-memory-info']
    });
    page = await browser.newPage();
    
    // Enable performance tracking
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();
    
    // Login first
    await login(page);
  });

  afterAll(async () => {
    // Get coverage data
    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();
    
    // Print coverage summary
    let jsUsedBytes = 0;
    let jsTotal = 0;
    jsCoverage.forEach(coverage => {
      jsTotal += coverage.text.length;
      coverage.ranges.forEach(range => {
        jsUsedBytes += range.end - range.start;
      });
    });
    
    let cssUsedBytes = 0;
    let cssTotal = 0;
    cssCoverage.forEach(coverage => {
      cssTotal += coverage.text.length;
      coverage.ranges.forEach(range => {
        cssUsedBytes += range.end - range.start;
      });
    });
    
    console.log(`JavaScript coverage: ${Math.round((jsUsedBytes / jsTotal) * 100)}%`);
    console.log(`CSS coverage: ${Math.round((cssUsedBytes / cssTotal) * 100)}%`);
    
    // Print performance summary
    console.log('\n--- Performance Metrics ---');
    for (const [name, metrics] of Object.entries(groupMetrics(performanceLogs))) {
      console.log(`\n${name}:`);
      console.log(`  Min: ${metrics.min.toFixed(2)}ms`);
      console.log(`  Max: ${metrics.max.toFixed(2)}ms`);
      console.log(`  Avg: ${metrics.avg.toFixed(2)}ms`);
    }
    
    await browser.close();
  });

  test('Exam timer should maintain accurate timing and perform well', async () => {
    // Navigate to exams page
    await page.goto(`${APP_URL}/exams`);
    await page.waitForSelector('.start-exam-button');
    
    // Start timer for navigation
    const navigationStart = Date.now();
    
    // Click on first exam
    await page.click('.start-exam-button');
    
    // Wait for exam page to load
    await page.waitForSelector('.exam-timer');
    
    // Record navigation time
    const navigationTime = Date.now() - navigationStart;
    console.log(`Navigation to exam page: ${navigationTime}ms`);
    
    // Track timer element initial value
    const initialTimerValue = await page.$eval('.exam-timer', el => el.textContent);
    console.log(`Initial timer value: ${initialTimerValue}`);
    
    // Monitor timer update frequency and performance
    const startTime = Date.now();
    let lastSecond = -1;
    
    for (let elapsed = 0; elapsed < EXAM_DURATION * 1000; elapsed += 1000) {
      // Wait for roughly 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get current performance metrics
      const metrics = await page.evaluate(() => {
        const perfEntries = performance.getEntriesByType('measure');
        return perfEntries.map(entry => ({
          name: entry.name,
          duration: entry.duration
        }));
      });
      
      performanceLogs.push(...metrics);
      
      // Get current timer value
      const currentTimerValue = await page.$eval('.exam-timer', el => el.textContent);
      const currentSecond = extractSeconds(currentTimerValue);
      
      if (currentSecond !== lastSecond) {
        // Record the frame rate for this second
        const perfMetrics = await page.metrics();
        console.log(`Timer update (${currentTimerValue}): FPS=${Math.round(perfMetrics.Frames)}, JSHeapUsed=${formatBytes(perfMetrics.JSHeapUsedSize)}`);
        lastSecond = currentSecond;
      }
      
      // Take a memory snapshot every 5 seconds
      if (elapsed % 5000 === 0) {
        const memoryInfo = await page.evaluate(() => performance.memory);
        if (memoryInfo) {
          console.log(`Memory at ${elapsed/1000}s: ${formatBytes(memoryInfo.usedJSHeapSize)} / ${formatBytes(memoryInfo.totalJSHeapSize)}`);
        }
      }
    }
    
    // Check if timer is accurate
    const endTime = Date.now();
    const elapsedSeconds = Math.round((endTime - startTime) / 1000);
    
    const finalTimerValue = await page.$eval('.exam-timer', el => el.textContent);
    const timerSeconds = extractSeconds(finalTimerValue);
    
    // Allow for a small buffer in timing precision
    const timerAccuracy = Math.abs(EXAM_DURATION - timerSeconds);
    expect(timerAccuracy).toBeLessThanOrEqual(2); // Within 2 seconds of accuracy
    
    // Test exam submission under load
    await page.click('.submit-exam-button');
    await page.waitForSelector('.exam-results', { timeout: 5000 });
    
    // Verify results page loaded correctly
    const resultsTitle = await page.$eval('h1, h2', el => el.textContent);
    expect(resultsTitle).toContain('Results');
  });
});

// Helper functions
async function login(page) {
  await page.goto(`${APP_URL}/login`);
  await page.waitForSelector('input[type="email"]');
  
  await page.type('input[type="email"]', TEST_USER.email);
  await page.type('input[type="password"]', TEST_USER.password);
  
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
}

function extractSeconds(timerString) {
  // Format might be "10:30" or "10 minutes 30 seconds" - extract just the seconds
  const minutes = parseInt(timerString.match(/(\d+)\s*:|\s*(\d+)\s*min/i)?.[1] || 0);
  const seconds = parseInt(timerString.match(/:(\d+)|\s(\d+)\s*sec/i)?.[1] || 0);
  
  return minutes * 60 + seconds;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function groupMetrics(metrics) {
  const grouped = {};
  
  metrics.forEach(metric => {
    if (!grouped[metric.name]) {
      grouped[metric.name] = {
        values: [],
        min: Infinity,
        max: -Infinity,
        avg: 0
      };
    }
    
    grouped[metric.name].values.push(metric.duration);
    grouped[metric.name].min = Math.min(grouped[metric.name].min, metric.duration);
    grouped[metric.name].max = Math.max(grouped[metric.name].max, metric.duration);
  });
  
  // Calculate averages
  Object.values(grouped).forEach(group => {
    const sum = group.values.reduce((a, b) => a + b, 0);
    group.avg = sum / group.values.length;
  });
  
  return grouped;
} 