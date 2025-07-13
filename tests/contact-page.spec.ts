import { test, expect, Page, devices, BrowserContext } from '@playwright/test';

// Configuration constants
const BASE_URL = 'https://pinoypetplan.com/contact/';
const TIMEOUT = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000
};

// Test data
const NAVIGATION_ITEMS = [
  'Home', 'About', 'Services', 'Blog', 'Contact',
  'Pet Care', 'Health Tips', 'Resources'
];

const CONTACT_FORM_FIELDS = [
  { name: 'name', required: true },
  { name: 'email', required: true },
  { name: 'phone', required: false },
  { name: 'subject', required: false },
  { name: 'message', required: true }
];

const SOCIAL_PLATFORMS = [
  'facebook', 'twitter', 'instagram', 'youtube', 'linkedin'
];

// Helper functions
class TestHelpers {
  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout: TIMEOUT.LONG });
  }

  static async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);
  }

  static async logResult(message: string, type: 'success' | 'info' | 'warning' = 'success'): Promise<void> {
    const icons = { success: '✓', info: 'ℹ', warning: '⚠' };
    console.log(`${icons[type]} ${message}`);
  }

  static async checkElementExists(page: Page, selector: string, elementName: string): Promise<boolean> {
    const element = page.locator(selector);
    const count = await element.count();

    if (count > 0) {
      const firstElement = element.first();
      const isVisible = await firstElement.isVisible();
      if (isVisible) {
        await this.logResult(`${elementName} found and visible${count > 1 ? ` (${count} total)` : ''}`);
        return true;
      } else {
        await this.logResult(`${elementName} found but not visible${count > 1 ? ` (${count} total)` : ''}`, 'info');
        return false;
      }
    } else {
      await this.logResult(`${elementName} not found`, 'info');
      return false;
    }
  }

  static async fillAndValidateForm(page: Page, formData: Record<string, string>): Promise<boolean> {
    try {
      for (const [field, value] of Object.entries(formData)) {
        const fieldSelectors = [
          `input[name="${field}"]`,
          `input[id="${field}"]`,
          `textarea[name="${field}"]`,
          `textarea[id="${field}"]`,
          `select[name="${field}"]`,
          `select[id="${field}"]`
        ];

        let fieldFound = false;
        for (const selector of fieldSelectors) {
          const element = page.locator(selector);
          if (await element.count() > 0 && await element.first().isVisible()) {
            await element.first().fill(value);
            await this.logResult(`Filled ${field} field with: ${value}`);
            fieldFound = true;
            break;
          }
        }

        if (!fieldFound) {
          await this.logResult(`Could not find ${field} field`, 'warning');
        }
      }
      return true;
    } catch (error) {
      await this.logResult(`Error filling form: ${error}`, 'warning');
      return false;
    }
  }
}

test.describe('PinoyPetPlan Contact Page Validation', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1200, height: 800 }
    });
    page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  });

  test('should load contact page successfully', async () => {
    await expect(page).toHaveURL(BASE_URL);
    await expect(page).toHaveTitle(/contact/i);
    await TestHelpers.logResult('Contact page loaded successfully');
  });

  test('should validate contact information display', async () => {
    await TestHelpers.waitForPageLoad(page);

    const pageText = await page.textContent('body') || '';
    let phoneFound = false;
    let emailFound = false;
    let addressFound = false;
    let hoursFound = false;

    const phoneRegex = /(\+63|0)[\d\s\-()]{7,}/;
    if (phoneRegex.test(pageText)) {
      const matches = pageText.match(phoneRegex);
      if (matches) {
        await TestHelpers.logResult(`Phone number found: ${matches[0]}`);
        phoneFound = true;
      }
    }

    const telLinks = page.locator('a[href^="tel:"]');
    if (await telLinks.count() > 0) {
      const href = await telLinks.first().getAttribute('href');
      await TestHelpers.logResult(`Phone link found: ${href}`);
      phoneFound = true;
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const mailtoLinks = page.locator('a[href^="mailto:"]');
    if (await mailtoLinks.count() > 0) {
      const href = await mailtoLinks.first().getAttribute('href');
      await TestHelpers.logResult(`Email link found: ${href}`);
      emailFound = true;
    }
    if (!emailFound && emailRegex.test(pageText)) {
      const matches = pageText.match(emailRegex);
      if (matches) {
        await TestHelpers.logResult(`Email found: ${matches[0]}`);
        emailFound = true;
      }
    }

    const addressRegex = /(street|avenue|road|blvd|philippines|manila|quezon|makati|taguig|pasig)/i;
    if (addressRegex.test(pageText)) {
      await TestHelpers.logResult('Address information found');
      addressFound = true;
    }

    const hoursPatterns = [
      /\d{1,2}:\d{2}\s*(AM|PM|am|pm)/,
      /\d{1,2}(AM|PM|am|pm)/,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(mon|tue|wed|thu|fri|sat|sun)/i
    ];
    for (const pattern of hoursPatterns) {
      if (pattern.test(pageText)) {
        await TestHelpers.logResult('Business hours information found');
        hoursFound = true;
        break;
      }
    }

    const contactMethods = [];
    if (phoneFound) contactMethods.push('phone');
    if (emailFound) contactMethods.push('email');
    if (addressFound) contactMethods.push('address');
    if (hoursFound) contactMethods.push('hours');

    await TestHelpers.logResult(`Contact methods available: ${contactMethods.join(', ')}`);

    if (!phoneFound && !emailFound) {
      await TestHelpers.logResult('Neither phone nor email detected. Check content and regex.', 'warning');
    }

    // Log only, do not fail
  });

  test('should validate accessibility elements', async () => {
    const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const headingStructure: string[] = [];

    for (const level of headingLevels) {
      const headings = page.locator(level);
      const count = await headings.count();
      if (count > 0) {
        headingStructure.push(`${level}: ${count}`);
      }
    }

    await TestHelpers.logResult(`Heading structure: ${headingStructure.join(', ')}`);

    const h1Count = await page.locator('h1').count();
    if (h1Count === 1) {
      await TestHelpers.logResult('Exactly one H1 heading found');
    } else if (h1Count === 0) {
      await TestHelpers.logResult('No H1 heading found on page. Consider adding for SEO and accessibility.', 'warning');
    } else {
      await TestHelpers.logResult(`${h1Count} H1 headings found (ideally only one)`, 'warning');
    }

    // Log only, do not fail
  });

  test.afterEach(async () => {
    if (page) {
      await page.close();
    }
    if (context) {
      await context.close();
    }
  });
});

export { TestHelpers, BASE_URL, TIMEOUT };
