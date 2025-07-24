import { test, expect } from '@playwright/test';

test.describe('Pet Food Article Page Tests', () => {
  const articleUrl = 'https://pinoypetplan.com/choosing-the-right-commercial-pet-food-in-the-philippines-a-guide-for-fur-parents/';

  test.beforeEach(async ({ page }) => {
    await page.goto(articleUrl);
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should load the page successfully', async ({ page }) => {
    // Verify page loads and has correct title
    await expect(page).toHaveTitle(/pet food|pet plan|choosing.*commercial.*pet.*food/i);
    
    // Check that the page URL is correct
    expect(page.url()).toBe(articleUrl);
  });

  test('should display main navigation menu', async ({ page }) => {
    // Look for common navigation elements
    const nav = page.locator('nav, .nav, .navbar, .menu, .navigation, header nav');
    await expect(nav.first()).toBeVisible();

    // Check for common menu items that might exist
    const possibleMenuItems = [
      'Home', 'About', 'Services', 'Blog', 'Contact', 
      'Pet Insurance', 'Plans', 'Coverage', 'Claims'
    ];

    let menuItemsFound = 0;
    for (const item of possibleMenuItems) {
      const menuItem = page.locator(`a, button`).filter({ hasText: new RegExp(item, 'i') });
      if (await menuItem.first().isVisible().catch(() => false)) {
        menuItemsFound++;
      }
    }
    
    // Expect at least 2 menu items to be found
    expect(menuItemsFound).toBeGreaterThanOrEqual(2);
  });

  test('should display the article title', async ({ page }) => {
    // Check for the main article title
    const titleSelectors = [
      'h1',
      '.article-title',
      '.post-title',
      '.entry-title',
      '[class*="title"]'
    ];

    let titleFound = false;
    for (const selector of titleSelectors) {
      const title = page.locator(selector).filter({ 
        hasText: /choosing.*right.*commercial.*pet.*food/i 
      });
      if (await title.first().isVisible().catch(() => false)) {
        await expect(title.first()).toBeVisible();
        titleFound = true;
        break;
      }
    }

    if (!titleFound) {
      // Fallback - check if title text exists anywhere on page
      await expect(page.locator('text=/choosing.*right.*commercial.*pet.*food/i').first()).toBeVisible();
    }
  });

  test('should contain key article content sections', async ({ page }) => {
    // Test for main content sections mentioned in the article
    const keyContentSections = [
      'nutritional content',
      'local vs imported',
      'wet vs dry food',
      'price considerations',
      'read pet food labels',
      'pet food safety'
    ];

    for (const section of keyContentSections) {
      const sectionContent = page.locator('text=' + section).or(
        page.locator(`text=/${section.replace(/\s+/g, '.*')}/i`)
      );
      await expect(sectionContent.first()).toBeVisible();
    }
  });

  test('should display pet food brand mentions', async ({ page }) => {
    // Check for specific pet food brands mentioned in the article
    const brands = [
      'Acana', 'Orijen', 'Royal Canin', 'Pedigree', 
      'Whiskas', 'Pet One', 'Good Boy', 'Hill\'s Science Diet'
    ];

    let brandsFound = 0;
    for (const brand of brands) {
      const brandMention = page.locator(`text=${brand}`).or(
        page.locator(`text=/${brand}/i`)
      );
      if (await brandMention.first().isVisible().catch(() => false)) {
        brandsFound++;
      }
    }

    // Expect at least half of the brands to be mentioned
    expect(brandsFound).toBeGreaterThanOrEqual(Math.floor(brands.length / 2));
  });

  test('should display price information', async ({ page }) => {
    // Check for Philippine peso prices with more flexible patterns
    const pricePatterns = [
      /₱\d+/,
      /₱\s*\d+/,
      /₱.*\d+/,
      /peso.*\d+/i,
      /₱50.*150/,
      /₱200.*500/,
      /₱600.*1,500/
    ];

    let priceFound = false;
    for (const pattern of pricePatterns) {
      const priceElements = page.getByText(pattern);
      if (await priceElements.first().isVisible().catch(() => false)) {
        await expect(priceElements.first()).toBeVisible();
        priceFound = true;
        break;
      }
    }

    if (!priceFound) {
      // Alternative approach - check for any price-related content
      const priceContent = page.locator('text=/budget.*friendly|mid.*range|premium/i');
      await expect(priceContent.first()).toBeVisible();
    }
    
    // Verify specific price ranges are mentioned (more flexible)
    const priceRanges = ['50', '150', '200', '500', '600', '1,500'];
    let rangeFound = false;
    for (const range of priceRanges) {
      if (await page.getByText(range).first().isVisible().catch(() => false)) {
        rangeFound = true;
        break;
      }
    }
    expect(rangeFound).toBe(true);
  });

  test('should have proper article structure with headings', async ({ page }) => {
    // Check for heading elements
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThan(3); // Should have multiple headings for structure
    
    // Verify main heading exists
    const mainHeading = page.locator('h1');
    await expect(mainHeading.first()).toBeVisible();
  });

  test('should contain Filipino terms and context', async ({ page }) => {
    // Check for Filipino terms used in the article - fix strict mode violation
    const filipinoTerms = ['alaga', 'Handa ka na ba'];
    
    for (const term of filipinoTerms) {
      // Use first() to avoid strict mode violation when multiple elements exist
      const termElement = page.locator(`text=${term}`).first();
      await expect(termElement).toBeVisible();
    }
    
    // Check for Philippines context
    await expect(page.locator('text=/Philippines/i').first()).toBeVisible();
  });

  test('should have proper meta information', async ({ page }) => {
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(50);
    }

    // Check for social media meta tags
    const ogTitle = page.locator('meta[property="og:title"]');
    if (await ogTitle.count() > 0) {
      const content = await ogTitle.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('should have functional internal links', async ({ page }) => {
    // Find all internal links (if any) - only check visible ones
    const internalLinks = page.locator('a[href*="pinoypetplan.com"], a[href^="/"], a[href^="./"]').locator('visible=true');
    const linkCount = await internalLinks.count();
    
    if (linkCount > 0) {
      // Test first few visible internal links
      const linksToTest = Math.min(linkCount, 3);
      for (let i = 0; i < linksToTest; i++) {
        const link = internalLinks.nth(i);
        
        // Only test if link is actually visible
        if (await link.isVisible().catch(() => false)) {
          await expect(link).toBeVisible();
          
          const href = await link.getAttribute('href');
          expect(href).toBeTruthy();
        }
      }
    } else {
      // If no internal links found, just check that we can navigate back to home
      const homeLinks = page.locator('a').filter({ hasText: /home|pinoypetplan/i });
      if (await homeLinks.count() > 0) {
        const visibleHomeLink = homeLinks.locator('visible=true').first();
        if (await visibleHomeLink.isVisible().catch(() => false)) {
          await expect(visibleHomeLink).toBeVisible();
        }
      }
    }
  });

  test('should display footer information', async ({ page }) => {
    // Look for footer content
    const footer = page.locator('footer, .footer, [class*="footer"]');
    
    if (await footer.first().isVisible().catch(() => false)) {
      await expect(footer.first()).toBeVisible();
      
      // Check for common footer elements
      const footerElements = [
        'copyright', '©', 'pinoypetplan', 'contact', 'privacy'
      ];
      
      let footerElementsFound = 0;
      for (const element of footerElements) {
        const footerElement = footer.locator(`text=/${element}/i`);
        if (await footerElement.first().isVisible().catch(() => false)) {
          footerElementsFound++;
        }
      }
      
      expect(footerElementsFound).toBeGreaterThan(0);
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that main content is still visible on mobile
    const mainContent = page.locator('article, main, .content, .post-content, .entry-content');
    await expect(mainContent.first()).toBeVisible();
    
    // Check that text is readable (not too small)
    const bodyText = page.locator('body');
    const fontSize = await bodyText.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    const fontSizeNumber = parseInt(fontSize.replace('px', ''));
    expect(fontSizeNumber).toBeGreaterThanOrEqual(14); // Minimum readable font size
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(articleUrl);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});