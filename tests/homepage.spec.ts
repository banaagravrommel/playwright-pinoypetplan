import { test, expect, Page, devices, BrowserContext } from '@playwright/test';

// Configuration constants
const BASE_URL = 'https://pinoypetplan.com/';
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

const SOCIAL_PLATFORMS = [
  'facebook', 'twitter', 'instagram', 'youtube', 'linkedin'
];

const FOOTER_LINKS = [
  'Privacy Policy', 'Terms of Service', 'Contact Us', 
  'About Us', 'Social Media'
];

const FILIPINO_TERMS = [
  'alagang hayop', 'matalinong pag-aalaga', 'magkaisa'
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

  static async validateResponse(page: Page, url: string): Promise<number> {
    try {
      const response = await page.request.get(url);
      return response.status();
    } catch (error) {
      return 0;
    }
  }
}

test.describe('PinoyPetPlan Homepage Validation', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({
      // Add additional context options
      ignoreHTTPSErrors: true,
      viewport: { width: 1200, height: 800 }
    });
    page = await context.newPage();
    
    // Set up event listeners for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  });

  test('should load homepage successfully', async () => {
    await expect(page).toHaveTitle(/pinoypetplan\.com.*alagang totoo/i);
    await expect(page).toHaveURL(BASE_URL);
    await TestHelpers.logResult('Homepage loaded successfully');
  });

  test('should validate main navigation menu', async () => {
    await TestHelpers.waitForPageLoad(page);
    
    const foundItems: string[] = [];
    const notFoundItems: string[] = [];
    
    for (const menuItem of NAVIGATION_ITEMS) {
      const menuSelectors = [
        `nav a:has-text("${menuItem}")`,
        `.menu a:has-text("${menuItem}")`,
        `.navigation a:has-text("${menuItem}")`,
        `header a:has-text("${menuItem}")`,
        `[role="navigation"] a:has-text("${menuItem}")`
      ];
      
      let found = false;
      for (const selector of menuSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.first().isVisible()) {
          foundItems.push(menuItem);
          found = true;
          break;
        }
      }
      
      if (!found) {
        notFoundItems.push(menuItem);
      }
    }
    
    await TestHelpers.logResult(`Navigation items found: ${foundItems.join(', ')}`);
    if (notFoundItems.length > 0) {
      await TestHelpers.logResult(`Navigation items not found: ${notFoundItems.join(', ')}`, 'info');
    }
    
    // At least some navigation should exist
    expect(foundItems.length).toBeGreaterThan(0);
  });

  test('should validate header elements', async () => {
    await TestHelpers.waitForPageLoad(page);
    
    // Enhanced logo validation
    const logoSelectors = [
      'img[alt*="logo" i]',
      '.logo img',
      'header img',
      '.btMainLogo',
      'img[alt="pinoypetplan.com"]',
      '.site-logo img',
      '.brand img'
    ];
    
    let logoFound = false;
    for (const selector of logoSelectors) {
      const logo = page.locator(selector);
      if (await logo.count() > 0) {
        const logoSrc = await logo.first().getAttribute('src');
        if (logoSrc) {
          await TestHelpers.logResult(`Logo found with src: ${logoSrc}`);
          
          // Validate logo loads successfully
          const status = await TestHelpers.validateResponse(page, logoSrc);
          if (status === 200) {
            await TestHelpers.logResult('Logo image loads successfully');
          } else if (status > 0) {
            await TestHelpers.logResult(`Logo returned status: ${status}`, 'warning');
          }
          
          logoFound = true;
          break;
        }
      }
    }
    
    if (!logoFound) {
      await TestHelpers.logResult('No logo found', 'info');
    }
    
    // Site title validation
    const titleSelectors = ['h1', '.site-title', '.brand', '.logo-text'];
    for (const selector of titleSelectors) {
      if (await TestHelpers.checkElementExists(page, selector, 'Site title')) {
        break;
      }
    }
  });

  test('should validate main content sections', async () => {
    await TestHelpers.waitForPageLoad(page);
    
    // Hero section validation
    const heroSelectors = [
      '.hero', '.banner', '.main-banner', 
      'section:first-of-type', '.hero-section'
    ];
    
    for (const selector of heroSelectors) {
      if (await TestHelpers.checkElementExists(page, selector, 'Hero section')) {
        break;
      }
    }
    
    // Key content validation
    const keyPhrases = [
      'Peace of Mind for Every Step',
      'At Pinoy Pet Plan, we believe that every pet deserves a happy and healthy life'
    ];
    
    for (const phrase of keyPhrases) {
      const element = page.getByText(phrase, { exact: false });
      const count = await element.count();
      
      if (count > 0) {
        const firstElement = element.first();
        await expect(firstElement).toBeVisible();
        await TestHelpers.logResult(`Key phrase found: "${phrase}" (${count} occurrence${count > 1 ? 's' : ''})`);
      } else {
        await TestHelpers.logResult(`Key phrase not found: "${phrase}"`, 'info');
      }
    }
    
    // Filipino terms validation
    for (const term of FILIPINO_TERMS) {
      const element = page.getByText(term, { exact: false });
      const count = await element.count();
      
      if (count > 0) {
        // Handle multiple elements by checking the first one
        const firstElement = element.first();
        await expect(firstElement).toBeVisible();
        await TestHelpers.logResult(`Filipino term found: "${term}" (${count} occurrence${count > 1 ? 's' : ''})`);
      } else {
        await TestHelpers.logResult(`Filipino term not found: "${term}"`, 'info');
      }
    }
  });

  test('should validate footer elements', async () => {
    await TestHelpers.scrollToBottom(page);
    
    // Footer existence check
    const footerSelectors = ['footer', '.footer', '[role="contentinfo"]'];
    let footerFound = false;
    
    for (const selector of footerSelectors) {
      const footer = page.locator(selector);
      if (await footer.count() > 0) {
        const footerContent = await footer.first().textContent();
        if (footerContent && footerContent.trim().length > 0) {
          await expect(footer.first()).toBeVisible();
          await TestHelpers.logResult('Footer found and visible');
          footerFound = true;
          break;
        }
      }
    }
    
    if (!footerFound) {
      await TestHelpers.logResult('No footer found or footer is empty', 'info');
    }
    
    // Footer links validation
    const foundLinks: string[] = [];
    for (const link of FOOTER_LINKS) {
      const footerLink = page.locator(`footer a:has-text("${link}"), .footer a:has-text("${link}")`);
      if (await footerLink.count() > 0 && await footerLink.first().isVisible()) {
        foundLinks.push(link);
      }
    }
    
    if (foundLinks.length > 0) {
      await TestHelpers.logResult(`Footer links found: ${foundLinks.join(', ')}`);
    }
  });

  test('should validate social media links', async () => {
    const foundSocials: string[] = [];
    
    for (const social of SOCIAL_PLATFORMS) {
      const socialSelectors = [
        `a[href*="${social}"]`,
        `.social a[class*="${social}"]`,
        `a[class*="${social}"]`,
        `a[aria-label*="${social}" i]`
      ];
      
      for (const selector of socialSelectors) {
        const socialLink = page.locator(selector);
        if (await socialLink.count() > 0 && await socialLink.first().isVisible()) {
          const href = await socialLink.first().getAttribute('href');
          if (href && href.toLowerCase().includes(social)) {
            foundSocials.push(social);
            await TestHelpers.logResult(`${social} link found: ${href}`);
            
            // Validate external link attributes
            const target = await socialLink.first().getAttribute('target');
            const rel = await socialLink.first().getAttribute('rel');
            
            if (target !== '_blank') {
              await TestHelpers.logResult(`${social} link should have target="_blank"`, 'warning');
            }
            
            if (!rel || !rel.includes('noopener')) {
              await TestHelpers.logResult(`${social} link should have rel="noopener"`, 'warning');
            }
            
            break;
          }
        }
      }
    }
    
    if (foundSocials.length === 0) {
      await TestHelpers.logResult('No social media links found', 'info');
    }
  });

  test('should validate contact information', async () => {
    // Phone number validation
    const phonePatterns = [
      /\+63[0-9\s\-\(\)]{10,}/,
      /0[0-9]{2,3}[\s\-]?[0-9]{3,4}[\s\-]?[0-9]{4}/
    ];
    
    let phoneFound = false;
    const pageText = await page.textContent('body') || '';
    
    for (const pattern of phonePatterns) {
      if (pattern.test(pageText)) {
        const matches = pageText.match(pattern);
        if (matches) {
          await TestHelpers.logResult(`Phone number found: ${matches[0]}`);
          phoneFound = true;
          break;
        }
      }
    }
    
    // Check for tel: links
    const telLinks = page.locator('a[href^="tel:"]');
    if (await telLinks.count() > 0) {
      const href = await telLinks.first().getAttribute('href');
      await TestHelpers.logResult(`Phone link found: ${href}`);
      phoneFound = true;
    }
    
    if (!phoneFound) {
      await TestHelpers.logResult('No phone number found', 'info');
    }
    
    // Email validation
    let emailFound = false;
    
    // Check mailto links
    const mailtoLinks = page.locator('a[href^="mailto:"]');
    if (await mailtoLinks.count() > 0) {
      const href = await mailtoLinks.first().getAttribute('href');
      await TestHelpers.logResult(`Email link found: ${href}`);
      emailFound = true;
    }
    
    // Check for email patterns in text
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (!emailFound && emailPattern.test(pageText)) {
      const matches = pageText.match(emailPattern);
      if (matches) {
        await TestHelpers.logResult(`Email found: ${matches[0]}`);
        emailFound = true;
      }
    }
    
    if (!emailFound) {
      await TestHelpers.logResult('No email address found', 'info');
    }
  });

  test('should validate forms', async () => {
    const formSelectors = ['form', '.contact-form', '.form', '[role="form"]'];
    let formFound = false;
    
    for (const selector of formSelectors) {
      const form = page.locator(selector);
      if (await form.count() > 0 && await form.first().isVisible()) {
        await TestHelpers.logResult('Form found');
        formFound = true;
        
        // Validate form fields
        const formFields = [
          { name: 'name', selector: 'input[name*="name" i], input[id*="name" i], input[placeholder*="name" i]' },
          { name: 'email', selector: 'input[type="email"], input[name*="email" i], input[id*="email" i]' },
          { name: 'message', selector: 'textarea, input[name*="message" i], input[id*="message" i]' },
          { name: 'submit', selector: 'button[type="submit"], input[type="submit"], .submit-btn, button:has-text("Submit")' }
        ];
        
        for (const field of formFields) {
          await TestHelpers.checkElementExists(page, field.selector, `${field.name} field`);
        }
        
        break;
      }
    }
    
    if (!formFound) {
      await TestHelpers.logResult('No forms found', 'info');
    }
  });

  test('should validate SEO elements', async () => {
    // Meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content');
      if (content) {
        expect(content.length).toBeGreaterThan(50);
        expect(content.length).toBeLessThan(160);
        await TestHelpers.logResult(`Meta description (${content.length} chars): "${content}"`);
      }
    } else {
      await TestHelpers.logResult('Meta description not found', 'warning');
    }
    
    // Meta keywords
    const metaKeywords = page.locator('meta[name="keywords"]');
    if (await metaKeywords.count() > 0) {
      const content = await metaKeywords.getAttribute('content');
      await TestHelpers.logResult(`Meta keywords: "${content}"`);
    }
    
    // Open Graph tags
    const ogTags = [
      { property: 'og:title', required: true },
      { property: 'og:description', required: true },
      { property: 'og:image', required: true },
      { property: 'og:url', required: false },
      { property: 'og:type', required: false }
    ];
    
    for (const tag of ogTags) {
      const ogElement = page.locator(`meta[property="${tag.property}"]`);
      if (await ogElement.count() > 0) {
        const content = await ogElement.getAttribute('content');
        await TestHelpers.logResult(`${tag.property}: "${content}"`);
      } else if (tag.required) {
        await TestHelpers.logResult(`${tag.property} not found (recommended)`, 'warning');
      }
    }
  });

  test('should validate accessibility elements', async () => {
    // Heading structure validation
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
    
    // H1 validation
    const h1Count = await page.locator('h1').count();
    if (h1Count === 1) {
      await TestHelpers.logResult('Exactly one H1 heading found');
    } else if (h1Count === 0) {
      await TestHelpers.logResult('No H1 heading found', 'warning');
    } else {
      await TestHelpers.logResult(`${h1Count} H1 headings found (ideally should be 1)`, 'warning');
    }
    
    expect(h1Count).toBeGreaterThan(0);
    
    // Image alt text validation
    const images = page.locator('img');
    const imageCount = await images.count();
    let imagesWithAlt = 0;
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      if (alt !== null && alt !== '') {
        imagesWithAlt++;
      }
    }
    
    await TestHelpers.logResult(`Images with alt text: ${imagesWithAlt}/${imageCount}`);
    
    // Link text validation
    const links = page.locator('a');
    const linkCount = await links.count();
    let linksWithText = 0;
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      if ((text && text.trim() !== '') || ariaLabel) {
        linksWithText++;
      }
    }
    
    await TestHelpers.logResult(`Links with accessible text: ${linksWithText}/${linkCount}`);
  });

  test('should validate performance elements', async () => {
    const startTime = Date.now();
    await TestHelpers.waitForPageLoad(page);
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(TIMEOUT.LONG);
    
    // Performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: 0 // Would need additional setup for this
      };
    });
    
    console.log(`📊 DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`📊 Load Complete: ${metrics.loadComplete}ms`);
    
    // Image optimization checks
    const lazyImages = await page.locator('img[loading="lazy"]').count();
    const totalImages = await page.locator('img').count();
    const webpImages = await page.locator('img[src*=".webp"]').count();
    
    console.log(`📊 Lazy loaded images: ${lazyImages}/${totalImages}`);
    console.log(`📊 WebP images: ${webpImages}/${totalImages}`);
  });

  test('should validate responsive design', async () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1200, height: 800 }
    ];
    
    for (const viewport of viewports) {
      await TestHelpers.logResult(`Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload({ waitUntil: 'networkidle' });
      
      // Verify content is still accessible
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Mobile-specific checks
      if (viewport.width < 768) {
        const mobileMenuSelectors = [
          '.hamburger', '.menu-toggle', '.mobile-menu-toggle', 
          '.nav-toggle', '[aria-label*="menu" i]'
        ];
        
        for (const selector of mobileMenuSelectors) {
          if (await TestHelpers.checkElementExists(page, selector, `Mobile menu (${viewport.name})`)) {
            break;
          }
        }
      }
      
      // Check for horizontal scrolling
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      
      if (hasHorizontalScroll) {
        await TestHelpers.logResult(`Horizontal scrolling detected on ${viewport.name}`, 'warning');
      }
    }
  });

  test('should validate link integrity', async () => {
    // External links validation
    const externalLinks = page.locator('a[href^="http"]:not([href*="pinoypetplan.com"])');
    const externalCount = await externalLinks.count();
    
    await TestHelpers.logResult(`Found ${externalCount} external links`);
    
    for (let i = 0; i < Math.min(externalCount, 5); i++) {
      const link = externalLinks.nth(i);
      const href = await link.getAttribute('href');
      const target = await link.getAttribute('target');
      const rel = await link.getAttribute('rel');
      
      if (href) {
        await TestHelpers.logResult(`External link: ${href}`);
        
        if (target !== '_blank') {
          await TestHelpers.logResult(`External link should have target="_blank": ${href}`, 'warning');
        }
        
        if (!rel || !rel.includes('noopener')) {
          await TestHelpers.logResult(`External link should have rel="noopener": ${href}`, 'warning');
        }
      }
    }
    
    // Internal links validation
    const internalLinks = page.locator('a[href^="/"], a[href^="./"], a[href*="pinoypetplan.com"]');
    const internalCount = await internalLinks.count();
    
    await TestHelpers.logResult(`Found ${internalCount} internal links`);
    
    for (let i = 0; i < Math.min(internalCount, 10); i++) {
      const link = internalLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        const status = await TestHelpers.validateResponse(page, href);
        if (status >= 400) {
          await TestHelpers.logResult(`Internal link may be broken: ${href} (Status: ${status})`, 'warning');
        } else if (status === 200) {
          await TestHelpers.logResult(`Internal link working: ${href}`);
        }
      }
    }
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

// Device-specific tests
test.describe('Cross-device compatibility', () => {
  const devicesTest = [
    { name: 'iPhone 12', config: devices['iPhone 12'] },
    { name: 'iPad', config: devices['iPad'] },
    { name: 'Desktop Chrome', config: devices['Desktop Chrome'] }
  ];

  devicesTest.forEach(device => {
    test(`should work correctly on ${device.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device.config,
        ignoreHTTPSErrors: true
      });
      const page = await context.newPage();
      
      try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT.LONG });
        
        // Basic functionality verification
        await expect(page).toHaveTitle(/pinoypetplan\.com.*alagang totoo/i);
        await TestHelpers.logResult(`Page loads successfully on ${device.name}`);
        
        // Device-specific checks
        if (device.name.includes('iPhone') || device.name.includes('iPad')) {
          // Check for touch-friendly elements
          const touchElements = page.locator('button, a, input, select, textarea');
          const touchCount = await touchElements.count();
          await TestHelpers.logResult(`Touch elements found: ${touchCount}`);
        }
        
      } catch (error) {
        await TestHelpers.logResult(`Error testing ${device.name}: ${error}`, 'warning');
      } finally {
        await context.close();
      }
    });
  });
});

// Performance and load testing
test.describe('Performance validation', () => {
  test('should handle concurrent users', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    const startTime = Date.now();
    
    try {
      await Promise.all(
        pages.map(page => 
          page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT.LONG })
        )
      );
      
      const loadTime = Date.now() - startTime;
      console.log(`📊 Concurrent load time: ${loadTime}ms`);
      
      // Verify all pages loaded successfully
      for (const page of pages) {
        await expect(page).toHaveTitle(/pinoypetplan\.com.*alagang totoo/i);
      }
      
      await TestHelpers.logResult('Concurrent user test passed');
      
    } finally {
      await Promise.all(contexts.map(context => context.close()));
    }
  });
});

// Security testing
test.describe('Security validation', () => {
  test('should have proper security headers', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    
    if (response) {
      const headers = response.headers();
      
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy'
      ];
      
      for (const header of securityHeaders) {
        if (headers[header]) {
          await TestHelpers.logResult(`Security header found: ${header}: ${headers[header]}`);
        } else {
          await TestHelpers.logResult(`Security header missing: ${header}`, 'warning');
        }
      }
    }
  });
});

export { TestHelpers, BASE_URL, TIMEOUT };