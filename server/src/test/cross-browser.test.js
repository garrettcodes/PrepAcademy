const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const safari = require('selenium-webdriver/safari');
const edge = require('selenium-webdriver/edge');

// Test configuration
const APP_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 60000; // 60 seconds

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Browser configurations to test
const browserConfigs = [
  {
    name: 'Chrome',
    builder: () => new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()),
  },
  {
    name: 'Firefox',
    builder: () => new Builder().forBrowser('firefox').setFirefoxOptions(new firefox.Options().headless()),
  },
  // Uncomment to test Safari (macOS only)
  // {
  //   name: 'Safari',
  //   builder: () => new Builder().forBrowser('safari').setSafariOptions(new safari.Options()),
  // },
  // Uncomment to test Edge
  // {
  //   name: 'Edge',
  //   builder: () => new Builder().forBrowser('MicrosoftEdge').setEdgeOptions(new edge.Options().headless()),
  // },
];

// Test result storage
const results = [];

// Main test function
async function runCrossBrowserTests() {
  console.log('Starting cross-browser compatibility tests...');
  
  for (const browserConfig of browserConfigs) {
    console.log(`Testing with ${browserConfig.name}...`);
    let driver;
    
    try {
      // Initialize WebDriver
      driver = await browserConfig.builder().build();
      await driver.manage().setTimeouts({ implicit: 10000 });
      
      // Run the tests
      const testResults = {
        browser: browserConfig.name,
        tests: {}
      };
      
      // Test 1: Login page rendering
      testResults.tests.loginPageRendering = await testLoginPageRendering(driver);
      
      // Test 2: Authentication flow
      testResults.tests.authenticationFlow = await testAuthenticationFlow(driver);
      
      // Test 3: Dashboard rendering
      testResults.tests.dashboardRendering = await testDashboardRendering(driver);
      
      // Test 4: Practice page loading
      testResults.tests.practicePageLoading = await testPracticePageLoading(driver);
      
      // Add more tests as needed
      
      // Store test results
      results.push(testResults);
      
      console.log(`Completed tests for ${browserConfig.name}.`);
    } catch (error) {
      console.error(`Error testing with ${browserConfig.name}:`, error);
      results.push({
        browser: browserConfig.name,
        error: error.message,
      });
    } finally {
      // Clean up
      if (driver) {
        await driver.quit();
      }
    }
  }
  
  // Print results summary
  console.log('\n--- Cross-Browser Test Results ---');
  results.forEach(result => {
    console.log(`\n${result.browser}:`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    } else {
      Object.entries(result.tests).forEach(([testName, success]) => {
        console.log(`  ${testName}: ${success ? 'PASS' : 'FAIL'}`);
      });
    }
  });
}

// Test 1: Login page rendering
async function testLoginPageRendering(driver) {
  try {
    await driver.get(`${APP_URL}/login`);
    
    // Check for key elements
    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    
    return true;
  } catch (error) {
    console.error('Login page rendering test failed:', error);
    return false;
  }
}

// Test 2: Authentication flow
async function testAuthenticationFlow(driver) {
  try {
    await driver.get(`${APP_URL}/login`);
    
    // Enter credentials
    await driver.findElement(By.css('input[type="email"]')).sendKeys(TEST_USER.email);
    await driver.findElement(By.css('input[type="password"]')).sendKeys(TEST_USER.password);
    
    // Click login button
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for dashboard to load (redirect after successful login)
    await driver.wait(until.urlContains('/dashboard'), 5000);
    
    return true;
  } catch (error) {
    console.error('Authentication flow test failed:', error);
    return false;
  }
}

// Test 3: Dashboard rendering
async function testDashboardRendering(driver) {
  try {
    // Navigate to dashboard (assuming already logged in)
    await driver.get(`${APP_URL}/dashboard`);
    
    // Check for key dashboard elements
    await driver.wait(until.elementLocated(By.css('.dashboard-container')), 5000);
    
    // Check for key metrics or elements
    const studyPlanSection = await driver.findElement(By.css('[data-testid="study-plan-summary"]'));
    const performanceSection = await driver.findElement(By.css('[data-testid="performance-summary"]'));
    
    return true;
  } catch (error) {
    console.error('Dashboard rendering test failed:', error);
    return false;
  }
}

// Test 4: Practice page loading
async function testPracticePageLoading(driver) {
  try {
    // Navigate to practice page
    await driver.get(`${APP_URL}/practice`);
    
    // Wait for practice questions to load
    await driver.wait(until.elementLocated(By.css('.practice-container')), 5000);
    
    // Check if question cards are loaded
    const questionCards = await driver.findElements(By.css('.question-card'));
    
    return questionCards.length > 0;
  } catch (error) {
    console.error('Practice page loading test failed:', error);
    return false;
  }
}

// Execute the tests if this script is run directly
if (require.main === module) {
  runCrossBrowserTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Cross-browser test script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runCrossBrowserTests,
  testLoginPageRendering,
  testAuthenticationFlow,
  testDashboardRendering,
  testPracticePageLoading,
}; 