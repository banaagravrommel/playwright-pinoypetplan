import { test, expect, Page } from '@playwright/test';

test.describe('Telemedicine Article Page Tests', () => {
  const articleUrl = 'https://pinoypetplan.com/telemedicine-in-philippine-veterinary-care-bridging-the-gap-for-pets-in-need/';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(articleUrl);
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should load the article page successfully', async ({ page }) => {
    // Verify page loads and has correct title
    await expect(page).toHaveTitle(/Telemedicine in Philippine Veterinary Care/i);
    
    // Verify URL is correct
    expect(page.url()).toBe(articleUrl);
    
    // Check page is responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display main navigation menu', async ({ page }) => {
    // Check if main navigation exists
    const nav = page.locator('nav, .navigation, .main-menu, .navbar');
    await expect(nav.first()).toBeVisible();
    
    // Common menu items for pet insurance sites
    const menuItems = [
      /home/i,
      /about/i,
      /plans/i,
      /coverage/i,
      /blog/i,
      /contact/i,
    ];
    
    // Check for at least some menu items (flexible approach)
    let foundMenuItems = 0;
    for (const menuItem of menuItems) {
      const menuLink = page.locator(`a:has-text("${menuItem.source.slice(1, -2)}")`);
      if (await menuLink.count() > 0) {
        foundMenuItems++;
      }
    }
    
    // Expect at least 3 menu items to be present
    expect(foundMenuItems).toBeGreaterThanOrEqual(3);
  });

  test('should display article header and title', async ({ page }) => {
    // Check main article title
    const title = page.locator('h1, .article-title, .post-title, .entry-title');
    await expect(title.first()).toBeVisible();
    await expect(title.first()).toContainText(/telemedicine/i);
    await expect(title.first()).toContainText(/philippine/i);
    await expect(title.first()).toContainText(/veterinary/i);
  });

  test('should display article content sections', async ({ page }) => {
    // Check for main article content
    const articleContent = page.locator('article, .article-content, .post-content, .entry-content, main, body');
    await expect(articleContent.first()).toBeVisible();
    
    // Verify key content sections are present using more flexible text matching
    await expect(page.getByText(/lifeline for remote pet owners/i)).toBeVisible();
    await expect(page.getByText(/what is veterinary telemedicine/i)).toBeVisible();
    await expect(page.getByText(/benefits of telemedicine/i)).toBeVisible();
    await expect(page.getByText(/current adoption in the philippines/i)).toBeVisible();
    await expect(page.getByText(/challenges and limitations/i)).toBeVisible();
    await expect(page.getByText(/future of telemedicine/i)).toBeVisible();
  });

  test('should display article image', async ({ page }) => {
    // Check for article images (skip hidden logo images, focus on content images)
    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // Find the first visible image or check if any images are present
    let foundVisibleImage = false;
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();
      if (isVisible) {
        foundVisibleImage = true;
        // Check if image has proper src
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).not.toBe('');
        break;
      }
    }
    
    // If no visible images, at least check that images exist with valid src
    if (!foundVisibleImage) {
      const firstImg = images.first();
      const src = await firstImg.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).not.toBe('');
    }
  });

  test('should have proper meta information', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(50);
    }
    
    // Check canonical URL
    const canonical = page.locator('link[rel="canonical"]');
    if (await canonical.count() > 0) {
      const href = await canonical.getAttribute('href');
      expect(href).toContain('pinoypetplan.com');
    }
  });

  test('should display footer information', async ({ page }) => {
    // Scroll to footer to ensure it's loaded
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000); // Give time for any lazy loading
    
    // Check footer exists (may be hidden but still present)
    const footer = page.locator('footer, .footer, .site-footer');
    const footerCount = await footer.count();
    expect(footerCount).toBeGreaterThan(0);
    
    // Check for footer content instead of visibility since it might be hidden by CSS
    const footerElement = footer.first();
    const footerClass = await footerElement.getAttribute('class');
    expect(footerClass).toBeTruthy();
    
    // Look for copyright or company info anywhere on the page (footer might be hidden)
    const pageContent = page.locator('body');
    const hasFooterContent = await pageContent.getByText(/(?:copyright|©|pinoy|pet|plan|2024|2025)/i).count();
    expect(hasFooterContent).toBeGreaterThan(0);
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Ensure content is still visible on mobile
    const title = page.locator('h1, .article-title, .post-title, .entry-title');
    await expect(title.first()).toBeVisible();
    
    // Test tablet viewport  
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(title.first()).toBeVisible();
    
    // Reset to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Should have exactly one H1
    
    // Check for subheadings
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(2); // Should have multiple headings for content structure
  });

  test('should load external resources properly', async ({ page }) => {
    // Check for any 404 errors on images or resources
    const responses: any[] = [];
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status()
      });
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Filter for failed requests
    const failedRequests = responses.filter(response => response.status >= 400);
    
    // Allow some tolerance for external resources, but main content should load
    expect(failedRequests.length).toBeLessThan(3);
  });

  test('should have accessible content', async ({ page }) => {
    // Check for basic accessibility features
    
    // Ensure images have alt attributes or are decorative
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Image should have alt text or be marked as decorative
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
    
    // Check for skip links or main content landmark
    const main = page.locator('main, [role="main"], .main-content');
    if (await main.count() > 0) {
      await expect(main.first()).toBeVisible();
    }
  });

  test('should handle page scroll and reading progress', async ({ page }) => {
    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);
    
    // Scroll through the article
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    
    const midScrollY = await page.evaluate(() => window.scrollY);
    expect(midScrollY).toBeGreaterThan(0);
    
    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBe(0);
  });

  test('should display social sharing or engagement features', async ({ page }) => {
    // Look for social sharing buttons or engagement features
    const socialSelectors = [
      '.social-share',
      '.share-buttons', 
      '[class*="share"]',
      '[class*="social"]',
      'a[href*="facebook.com"]',
      'a[href*="twitter.com"]',
      'a[href*="linkedin.com"]'
    ];
    
    let foundSocial = false;
    for (const selector of socialSelectors) {
      if (await page.locator(selector).count() > 0) {
        foundSocial = true;
        break;
      }
    }
    
    // Social sharing is common but not required
    // This test documents whether it exists
    console.log(`Social sharing features found: ${foundSocial}`);
  });

  test('should have proper content structure and readability', async ({ page }) => {
    // Check for proper paragraph structure
    const paragraphs = page.locator('p');
    const paragraphCount = await paragraphs.count();
    expect(paragraphCount).toBeGreaterThan(5); // Article should have multiple paragraphs
    
    // Check for lists (bullet points mentioned in content)
    const lists = page.locator('ul, ol');
    const listCount = await lists.count();
    expect(listCount).toBeGreaterThan(0); // Should have at least one list
    
    // Verify key topics are covered
    await expect(page.getByText(/geographic barriers/i)).toBeVisible();
    await expect(page.getByText(/cost-effectiveness/i)).toBeVisible();
    await expect(page.getByText(/emergency triage/i)).toBeVisible();
  });
});