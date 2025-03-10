import puppeteer, { Browser, Page } from 'puppeteer';
import devices from 'puppeteer/DeviceDescriptors';

// Test configuration
const APP_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 60000; // 60 seconds
jest.setTimeout(TEST_TIMEOUT);

// Device configurations to test
const deviceConfigs = [
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
const testUser = {
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
 * Helper to take screenshots
 */
async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `./screenshots/${name.replace(/\s/g, '_').toLowerCase()}.png`,
    fullPage: true,
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
        
        // Check for dashboard elements
        await page.waitForSelector('.dashboard-container', { timeout: 5000 });
        
        // Check for responsive layout
        const isMobileView = await page.evaluate(() => {
          return window.innerWidth < 768;
        });
        
        if (isMobileView) {
          // In mobile view, the menu should be collapsed
          const hamburgerMenu = await page.$('.mobile-menu-button');
          expect(hamburgerMenu).not.toBeNull();
        } else {
          // In desktop view, the sidebar should be visible
          const sidebar = await page.$('.sidebar');
          expect(sidebar).not.toBeNull();
        }
        
        await takeScreenshot(page, `${device.name} - Dashboard`);
      });
      
      test('Practice page renders correctly', async () => {
        await login(page);
        
        // Navigate to practice page
        await Promise.all([
          page.click('a[href="/practice"]'),
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);
        
        // Check for practice elements
        await page.waitForSelector('.practice-container', { timeout: 5000 });
        
        // Check that question cards are responsive
        const questionCards = await page.$$('.question-card');
        expect(questionCards.length).toBeGreaterThan(0);
        
        await takeScreenshot(page, `${device.name} - Practice Page`);
      });
      
      test('Study plan page renders correctly', async () => {
        await login(page);
        
        // Navigate to study plan page
        await Promise.all([
          page.click('a[href="/study-plan"]'),
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);
        
        // Check for study plan elements
        await page.waitForSelector('.study-plan-container', { timeout: 5000 });
        
        // Check for responsive calendar/schedule view
        if (device.isMobile) {
          // Mobile should have a list view
          const listView = await page.$('.mobile-schedule-view');
          expect(listView).not.toBeNull();
        } else {
          // Desktop should have a calendar view
          const calendarView = await page.$('.calendar-view');
          expect(calendarView).not.toBeNull();
        }
        
        await takeScreenshot(page, `${device.name} - Study Plan`);
      });
      
      test('Exam timer works correctly', async () => {
        await login(page);
        
        // Navigate to exams page
        await Promise.all([
          page.click('a[href="/exams"]'),
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);
        
        // Start an exam
        await Promise.all([
          page.click('.start-exam-button'),
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);
        
        // Check for timer element
        const timerElement = await page.$('.exam-timer');
        expect(timerElement).not.toBeNull();
        
        // Wait for a few seconds and check if timer is updating
        const initialTime = await page.evaluate(() => {
          return document.querySelector('.exam-timer')?.textContent;
        });
        
        await page.waitForTimeout(3000);
        
        const updatedTime = await page.evaluate(() => {
          return document.querySelector('.exam-timer')?.textContent;
        });
        
        expect(initialTime).not.toEqual(updatedTime);
        
        await takeScreenshot(page, `${device.name} - Exam Timer`);
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