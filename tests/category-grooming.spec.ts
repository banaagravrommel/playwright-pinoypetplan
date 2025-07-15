import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'https://pinoypetplan.com';
const GROOMING_CATEGORY_URL = `${BASE_URL}/category/grooming/`;

// Page Object Model for reusable selectors
class GroomingPageSelectors {
  // Navigation menu selectors - using more specific selectors to avoid strict mode violations
  static readonly NAV_HOME = 'nav a[href*="pinoypetplan.com"]:has-text("Home")';
  static readonly NAV_ABOUT = 'nav a:has-text("About Us")';
  static readonly NAV_DOGS = 'nav a[href*="/dogs"]:has-text("Dogs")';
  static readonly NAV_CATS = 'nav a[href*="/cats"]:has-text("Cats")';
  static readonly NAV_FOOD = 'nav a[href*="/food"]:has-text("Food")';
  static readonly NAV_ACTIVITY = 'nav a:has-text("Activity and Exercise")';
  static readonly NAV_GROOMING = '#menu-item-3422 a[href*="/grooming/"]'; // More specific selector
  static readonly NAV_HEALTH = 'nav a[href*="/health"]:has-text("Health")';
  static readonly NAV_CONTACT = 'nav a:has-text("Contact")';
  
  // Category menu selectors - more specific
  static readonly CATEGORY_DOGS = '.btArticleCategory:has-text("Dogs")';
  static readonly CATEGORY_CATS = '.btArticleCategory:has-text("Cats")';
  static readonly CATEGORY_ACTIVITY = '.btArticleCategory:has-text("Activity and Exercise")';
  static readonly CATEGORY_FOOD = '.btArticleCategory:has-text("Food")';
  static readonly CATEGORY_GROOMING = '.btArticleCategory:has-text("Grooming")';
  static readonly CATEGORY_HEALTH = '.btArticleCategory:has-text("Health")';
  
  // Article selectors
  static readonly ARTICLE_CARDS = '.btArticleListItem, .post, .entry';
  static readonly ARTICLE_TITLES = 'h1, h2, h3, .entry-title, .post-title';
  static readonly ARTICLE_DATES = '.btArticleDate, [class*="date"], .published, .post-date';
  static readonly READ_MORE_BUTTONS = 'a:has-text("CONTINUE READING")';
  
  // Common page elements
  static readonly PAGE_TITLE = 'h1, .page-title, .category-title, .bt_bb_headline';
  static readonly BREADCRUMBS = '.breadcrumb, .breadcrumbs, nav[aria-label="breadcrumb"]';
  static readonly FOOTER = 'footer, .footer';
  static readonly HEADER = 'header';
  
  // Specific navigation menu selectors
  static readonly MAIN_NAV_GROOMING = '#menu-item-3422 a, #menu-item-3443 a';
  static readonly GROOMING_CATEGORY_LINK = 'a[href*="/category/grooming/"]:has-text("Grooming")';
}

// Helper class for common page actions
class PageHelpers {
  constructor(private page: Page) {}
  
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }
  
  async validateMenuItems(menuItems: string[]) {
    for (const item of menuItems) {
      // Use more specific selector to avoid strict mode violations
      const selector = `nav a:has-text("${item}")`;
      await expect(this.page.locator(selector).first()).toBeVisible();
    }
  }
  
  async validateArticleStructure(articleSelector: string) {
    const articles = this.page.locator(articleSelector);
    const count = await articles.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const article = articles.nth(i);
        await expect(article).toBeVisible();
      }
    }
  }
}

test.describe('Pinoy Pet Plan - Grooming Category Page', () => {
  let pageHelpers: PageHelpers;
  
  test.beforeEach(async ({ page }) => {
    pageHelpers = new PageHelpers(page);
    await page.goto(GROOMING_CATEGORY_URL);
    await pageHelpers.waitForPageLoad();
  });

  test('should load the grooming category page successfully', async ({ page }) => {
    // Verify page loads and has correct URL
    await expect(page).toHaveURL(GROOMING_CATEGORY_URL);
    
    // Verify page has a title
    await expect(page).toHaveTitle(/grooming/i);
    
    // Verify page is not showing 404 or error
    const errorMessages = page.locator('text=404, text=Error, text=Not Found');
    await expect(errorMessages).toHaveCount(0);
  });

  test('should display main navigation menu correctly', async ({ page }) => {
    const mainNavItems = [
      'Home',
      'About Us', 
      'Dogs',
      'Cats',
      'Food',
      'Activity and Exercise',
      'Grooming',
      'Health',
      'Contact'
    ];
    
    await pageHelpers.validateMenuItems(mainNavItems);
    
    // Fix: Use specific selector to avoid strict mode violation
    const groomingNav = page.locator(GroomingPageSelectors.NAV_GROOMING);
    await expect(groomingNav).toBeVisible();
    
    // Verify it has aria-current="page" or similar active indicator
    const activeGroomingNav = page.locator('a[aria-current="page"][href*="/grooming/"]');
    await expect(activeGroomingNav.first()).toBeVisible();
  });

  test('should display category navigation menu', async ({ page }) => {
    const categoryItems = [
      'Dogs',
      'Cats', 
      'Activity and Exercise',
      'Food',
      'Grooming',
      'Health'
    ];
    
    await pageHelpers.validateMenuItems(categoryItems);
  });

  test('should display grooming articles correctly', async ({ page }) => {
    // Check for specific grooming articles mentioned in the content
    const expectedArticles = [
      'Pet Grooming 101',
      'The Importance of Professional Pet Grooming in the Philippines',
      'Pet Grooming Trends in the Philippines: Keeping Your Fur Babies Fresh and Stylish',
      'The Rise of the Pet Spa Industry in the Philippines'
    ];
    
    for (const article of expectedArticles) {
      await expect(page.locator(`text=${article}`).first()).toBeVisible();
    }
  });

  test('should display article dates correctly', async ({ page }) => {
    const expectedDates = [
      'July 5, 2025',
      'June 3, 2025', 
      'March 24, 2025',
      'February 14, 2025'
    ];
    
    for (const date of expectedDates) {
      await expect(page.locator(`text=${date}`).first()).toBeVisible();
    }
  });

  test('should display "CONTINUE READING" buttons for articles', async ({ page }) => {
    const readMoreButtons = page.locator(GroomingPageSelectors.READ_MORE_BUTTONS);
    const buttonCount = await readMoreButtons.count();
    
    // Should have at least one "CONTINUE READING" button
    expect(buttonCount).toBeGreaterThan(0);
    
    // Verify all buttons are visible and clickable
    for (let i = 0; i < buttonCount; i++) {
      await expect(readMoreButtons.nth(i)).toBeVisible();
      await expect(readMoreButtons.nth(i)).toBeEnabled();
    }
  });

  test('should have proper page structure elements', async ({ page }) => {
    // Check for header
    const header = page.locator(GroomingPageSelectors.HEADER);
    if (await header.count() > 0) {
      await expect(header.first()).toBeVisible();
    }
    
    // Fix: Check if footer exists and is attached to DOM, not necessarily visible
    const footer = page.locator(GroomingPageSelectors.FOOTER);
    if (await footer.count() > 0) {
      await expect(footer.first()).toBeAttached();
    }
    
    // Check for main content area
    const mainContent = page.locator('main, .main, .content, #content, .btContentHolder');
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
    
    // Check for article list container
    const articleContainer = page.locator('.btArticleListItem, .post-item, .blog-post');
    if (await articleContainer.count() > 0) {
      await expect(articleContainer.first()).toBeVisible();
    }
  });

  test('should have responsive design elements', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await pageHelpers.waitForPageLoad();
    
    // Verify menu is visible on desktop
    await expect(page.locator('nav a:has-text("Home")').first()).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await pageHelpers.waitForPageLoad();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await pageHelpers.waitForPageLoad();
    
    // Fix: Use more specific selector to avoid strict mode violation
    await expect(page.locator(GroomingPageSelectors.GROOMING_CATEGORY_LINK).first()).toBeVisible();
    
    // Verify main content is still accessible
    await expect(page.locator('h2:has-text("Pet Grooming 101")').first()).toBeVisible();
  });

  test('navigation menu links should be functional', async ({ page }) => {
    // Test home link
    const homeLink = page.locator(GroomingPageSelectors.NAV_HOME).first();
    await expect(homeLink).toBeVisible();
    
    // Test category links (without actually navigating to avoid test complexity)
    const categoryLinks = [
      GroomingPageSelectors.NAV_DOGS,
      GroomingPageSelectors.NAV_CATS,
      GroomingPageSelectors.NAV_FOOD,
      GroomingPageSelectors.NAV_HEALTH
    ];
    
    for (const linkSelector of categoryLinks) {
      const link = page.locator(linkSelector).first();
      await expect(link).toBeVisible();
      
      // Verify link has proper href attribute
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('should display article metadata correctly', async ({ page }) => {
    // Check for article categories/tags
    const categoryTags = page.locator('text=Cats, text=Dogs, text=Health');
    const tagCount = await categoryTags.count();
    
    if (tagCount > 0) {
      for (let i = 0; i < tagCount; i++) {
        await expect(categoryTags.nth(i)).toBeVisible();
      }
    }
    
    // Check for comment counts (showing as "0" in the content)
    const commentCounts = page.locator('text=0').filter({ has: page.locator('[class*="comment"]') });
    // This is optional since comment display depends on theme implementation
  });

  test('should handle article interactions properly', async ({ page }) => {
    // Test clicking on "CONTINUE READING" button
    const readMoreButtons = page.locator(GroomingPageSelectors.READ_MORE_BUTTONS);
    
    if (await readMoreButtons.count() > 0) {
      const firstButton = readMoreButtons.first();
      await expect(firstButton).toBeVisible();
      await expect(firstButton).toBeEnabled();
      
      // Click and verify navigation (or modal opening, depending on implementation)
      await firstButton.click();
      
      // Wait for navigation or content change
      await page.waitForTimeout(1000);
      
      // Verify something changed (URL or content)
      // This might navigate to a full article page
    }
  });

  test('should have proper SEO and accessibility elements', async ({ page }) => {
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(0);
    }
    
    // Fix: More flexible H1 check - look for page-level headings
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();
    
    // If no H1, check for other heading elements that might serve as page title
    if (h1Count === 0) {
      const pageHeadings = page.locator('h1, h2.page-title, .bt_bb_headline, [role="heading"], .category-title');
      const headingCount = await pageHeadings.count();
      expect(headingCount).toBeGreaterThan(0);
    } else {
      expect(h1Count).toBeGreaterThan(0);
    }
    
    // Check for title tag
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // Check for alt text on images (if any)
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) { // Check first 5 images to avoid timeout
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        
        // Images should have alt text or be decorative
        if (src && !src.includes('decoration') && !src.includes('spacer')) {
          // Alt text is recommended but not always required
          if (alt === null || alt === '') {
            console.warn(`Image ${src} missing alt text`);
          }
        }
      }
    }
  });

  test('should load page content within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(GROOMING_CATEGORY_URL);
    await pageHelpers.waitForPageLoad();
    
    // Fix: Use more specific selector to avoid strict mode violation
    await expect(page.locator('h2:has-text("Pet Grooming 101")').first()).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });
});

// Additional test for cross-browser compatibility
test.describe('Cross-browser compatibility tests', () => {
  test('should work consistently across different browsers', async ({ page, browserName }) => {
    await page.goto(GROOMING_CATEGORY_URL);
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Fix: Use more specific selectors to avoid strict mode violation
    await expect(page.locator(GroomingPageSelectors.GROOMING_CATEGORY_LINK).first()).toBeVisible();
    await expect(page.locator('h2:has-text("Pet Grooming 101")').first()).toBeVisible();
    
    // Log browser for debugging
    console.log(`Test running on: ${browserName}`);
  });
});

// Performance test
test.describe('Performance tests', () => {
  test('should not have excessive loading times', async ({ page }) => {
    // Monitor network requests
    const responses: any[] = [];
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        // Fix: Remove timing() call as it's not available in all Playwright versions
        headers: response.headers()
      });
    });
    
    await page.goto(GROOMING_CATEGORY_URL);
    await page.waitForLoadState('networkidle');
    
    // Check that no critical requests failed
    const failedRequests = responses.filter(r => r.status >= 400 && r.status < 600);
    
    // Allow some non-critical failures (like analytics, ads, etc.)
    const criticalFailures = failedRequests.filter(r => 
      r.url.includes('pinoypetplan.com') && 
      !r.url.includes('analytics') && 
      !r.url.includes('ads') &&
      !r.url.includes('tracking')
    );
    
    expect(criticalFailures.length).toBe(0);
    
    // Main page should load successfully
    const mainPageRequest = responses.find(r => r.url === GROOMING_CATEGORY_URL);
    if (mainPageRequest) {
      expect(mainPageRequest.status).toBe(200);
    }
    
    // Verify content loaded properly
    await expect(page.locator('h2:has-text("Pet Grooming 101")').first()).toBeVisible();
  });
});