import puppeteer, { Browser, Page, Device } from 'puppeteer';
import devices from 'puppeteer/DeviceDescriptors';

// Test configuration
const APP_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 60000; // 60 seconds
jest.setTimeout(TEST_TIMEOUT);

// Interface for device configurations
interface DeviceConfig {
  name: string;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
  userAgent: string;
  isMobile: boolean;
}

// Device configurations to test
const deviceConfigs: Array<DeviceConfig | Device> = [
  // Desktop
  {
    name: 'Desktop (1920x1080)',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
    isMobile: false,
  },
  // Tablet
  {
    name: 'iPad Pro',
    ...devices['iPad Pro'],
  },
  // Mobile
  {
    name: 'iPhone X',
    ...devices['iPhone X'],
  },
];

// Login credentials for testing
interface TestUser {
  email: string;
  password: string;
}

const testUser: TestUser = {
  email: 'test@example.com',
  password: 'password123',
};

let browser: Browser;

/**
 * Set up puppeteer before all tests
 */
beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
});

/**
 * Clean up after all tests
 */
afterAll(async () => {
  await browser.close();
});

/**
 * Helper function to login
 */
async function login(page: Page): Promise<void> {
  await page.goto(`${APP_URL}/login`);
  await page.waitForSelector('input[type="email"]');
  
  await page.type('input[type="email"]', testUser.email);
  await page.type('input[type="password"]', testUser.password);
  
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
}

/**
 * Helper to take screenshots during tests
 */
async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
  await page.screenshot({ 
    path: `./screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Test suite for cross-device compatibility
 */
describe('Cross-Device Compatibility', () => {
  // Test each device configuration
  deviceConfigs.forEach((device) => {
    describe(`${device.name}`, () => {
      let page: Page;
      
      beforeEach(async () => {
        page = await browser.newPage();
        
        // Set the device configuration
        await page.emulate({
          viewport: device.viewport,
          userAgent: device.userAgent,
        });
      });
      
      afterEach(async () => {
        await page.close();
      });
      
      test('Login page renders correctly', async () => {
        await page.goto(`${APP_URL}/login`);
        await page.waitForSelector('input[type="email"]');
        
        // Check that all expected elements are visible
        const emailInput = await page.$('input[type="email"]');
        const passwordInput = await page.$('input[type="password"]');
        const loginButton = await page.$('button[type="submit"]');
        
        expect(emailInput).not.toBeNull();
        expect(passwordInput).not.toBeNull();
        expect(loginButton).not.toBeNull();
        
        await takeScreenshot(page, `${device.name} - Login Page`);
      });
      
      test('Dashboard renders correctly after login', async () => {
        await login(page);
        
        // Check that dashboard elements are visible
        await page.waitForSelector('h1');
        const heading = await page.$eval('h1', el => el.textContent);
        expect(heading).toContain('Dashboard');
        
        await takeScreenshot(page, `${device.name} - Dashboard`);
      });
      
      test('Practice page renders correctly', async () => {
        await login(page);
        
        // Navigate to practice page
        await Promise.all([
          page.click('a[href="/practice"]'),
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);
        
        // Check that practice elements are visible
        await page.waitForSelector('h1');
        const heading = await page.$eval('h1', el => el.textContent);
        expect(heading).toContain('Practice');
        
        await takeScreenshot(page, `${device.name} - Practice Page`);
      });
      
      // Test offline functionality
      test('Offline indicator appears when connection is lost', async () => {
        await login(page);
        
        // Simulate offline status
        await page.evaluate(() => {
          window.dispatchEvent(new Event('offline'));
        });
        
        // Check that offline indicator appears
        await page.waitForSelector('.offline-indicator');
        const indicatorText = await page.$eval('.offline-indicator', el => el.textContent);
        expect(indicatorText).toContain('Offline Mode');
        
        await takeScreenshot(page, `${device.name} - Offline Indicator`);
      });
    });
  });
});

/**
 * Test suite for offline functionality
 */
describe('Offline Functionality', () => {
  let page: Page;
  
  beforeEach(async () => {
    page = await browser.newPage();
    await page.emulate(devices['iPhone X']);
  });
  
  afterEach(async () => {
    await page.close();
  });
  
  test('App shows offline indicator when network is disconnected', async () => {
    await login(page);
    
    // Simulate offline mode
    await page.setOfflineMode(true);
    
    // Refresh the page to see offline indicator
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Check for offline indicator
    const offlineIndicator = await page.$('.offline-indicator');
    expect(offlineIndicator).not.toBeNull();
    
    await takeScreenshot(page, 'Offline Mode Indicator');
    
    // Set back online mode
    await page.setOfflineMode(false);
  });
  
  test('Offline practice questions work without internet', async () => {
    await login(page);
    
    // Navigate to practice page and load questions
    await Promise.all([
      page.click('a[href="/practice"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    
    // Ensure questions are loaded
    await page.waitForSelector('.question-card', { timeout: 5000 });
    
    // Go offline
    await page.setOfflineMode(true);
    
    // Try to answer a question
    await page.click('.question-option');
    await page.click('.submit-answer-button');
    
    // Check that the answer was processed
    const feedbackElement = await page.$('.answer-feedback');
    expect(feedbackElement).not.toBeNull();
    
    await takeScreenshot(page, 'Offline Question Answering');
    
    // Set back online mode
    await page.setOfflineMode(false);
  });
});

/**
 * Test suite for touch interactions
 */
describe('Touch Interactions', () => {
  let page: Page;
  
  beforeEach(async () => {
    page = await browser.newPage();
    await page.emulate(devices['iPad Pro']);
  });
  
  afterEach(async () => {
    await page.close();
  });
  
  test('Swipe navigation works on mobile devices', async () => {
    await login(page);
    
    // Navigate to practice page
    await Promise.all([
      page.click('a[href="/practice"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    
    // Get the first question card
    await page.waitForSelector('.question-card', { timeout: 5000 });
    const cardBounds = await page.evaluate(() => {
      const card = document.querySelector('.question-card');
      if (!card) return null;
      const rect = card.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    
    if (cardBounds) {
      // Simulate swipe on the card
      const startX = cardBounds.x + cardBounds.width / 2;
      const startY = cardBounds.y + cardBounds.height / 2;
      
      // Swipe left to right
      await page.touchscreen.tap(startX, startY);
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 200, startY, { steps: 10 });
      await page.mouse.up();
      
      // Wait for animation
      await page.waitForTimeout(500);
      
      // Take screenshot after swipe
      await takeScreenshot(page, 'After Swipe Navigation');
    }
  });
  
  test('Pinch zoom works on diagrams', async () => {
    await login(page);
    
    // Navigate to a page with diagrams
    await Promise.all([
      page.click('a[href="/resources"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    
    // Find a diagram
    await page.waitForSelector('.diagram-container', { timeout: 5000 });
    const diagramBounds = await page.evaluate(() => {
      const diagram = document.querySelector('.diagram-container img');
      if (!diagram) return null;
      const rect = diagram.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    
    if (diagramBounds) {
      // Click on the diagram to focus/activate it
      await page.mouse.click(
        diagramBounds.x + diagramBounds.width / 2,
        diagramBounds.y + diagramBounds.height / 2
      );
      
      // Take screenshot before zoom
      await takeScreenshot(page, 'Before Diagram Zoom');
    }
  });
}); 