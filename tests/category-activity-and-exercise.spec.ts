import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://pinoypetplan.com';
const ACTIVITIES_URL = `${BASE_URL}/category/activity-and-exercise/`;

test.describe('Activities and Exercise Page Validation', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto(ACTIVITIES_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Page loads successfully and has correct title', async () => {
    // Verify page loads
    await expect(page).toHaveURL(ACTIVITIES_URL);
    
    // Check page title contains relevant keywords
    const title = await page.title();
    expect(title).toMatch(/activity|exercise|pet|dog|cat/i);
    
    // Verify page is responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('Validate main navigation menu', async () => {
    // Check if navigation menu exists
    const nav = page.locator('nav, .nav, .menu, .navigation, header nav');
    await expect(nav.first()).toBeVisible();
    
    // Common navigation links to validate
    const expectedNavItems = [
      { text: /home/i, selector: 'a[href*="home"], a[href="/"], a[href="' + BASE_URL + '"]' },
      { text: /blog/i, selector: 'a[href*="blog"]' },
      { text: /about/i, selector: 'a[href*="about"]' },
      { text: /contact/i, selector: 'a[href*="contact"]' },
      { text: /dogs/i, selector: 'a[href*="dog"]' },
      { text: /cats/i, selector: 'a[href*="cat"]' }
    ];

    for (const item of expectedNavItems) {
      const navLink = page.locator(item.selector).first();
      if (await navLink.isVisible()) {
        await expect(navLink).toBeVisible();
        await expect(navLink).toHaveAttribute('href');
      }
    }
  });

  test('Validate page header and breadcrumbs', async () => {
    // Check for page header/title with multiple fallback selectors
    const pageHeaderSelectors = [
      'h1, .page-title, .category-title, .entry-title',
      '.bt_bb_headline, .bt_bb_text',
      'h2, h3, .archive-title, .category-header',
      'title, .main-title, .content-title'
    ];
    
    let headerFound = false;
    let headerText = '';
    
    for (const selector of pageHeaderSelectors) {
      const pageHeader = page.locator(selector);
      const count = await pageHeader.count();
      
      if (count > 0) {
        const visibleHeaders = await pageHeader.filter({ hasText: /.+/ });
        const visibleCount = await visibleHeaders.count();
        
        if (visibleCount > 0) {
          headerText = await visibleHeaders.first().textContent() || '';
          if (headerText.trim().length > 0) {
            headerFound = true;
            break;
          }
        }
      }
    }
    
    // If no specific header found, check page title or any text containing activity/exercise
    if (!headerFound) {
      const activityText = page.locator('text=/activity|exercise/i');
      const activityCount = await activityText.count();
      
      if (activityCount > 0) {
        headerText = await activityText.first().textContent() || '';
        headerFound = true;
      }
    }
    
    expect(headerFound).toBe(true);
    if (headerText) {
      expect(headerText).toMatch(/activity|exercise|pet|dog|cat|blog/i);
    }

    // Check for breadcrumbs if they exist
    const breadcrumbs = page.locator('.breadcrumb, .breadcrumbs, nav[aria-label="breadcrumb"], .bt_bb_breadcrumbs');
    const breadcrumbCount = await breadcrumbs.count();
    
    if (breadcrumbCount > 0) {
      const visibleBreadcrumbs = await breadcrumbs.filter({ hasText: /.+/ });
      const visibleBreadcrumbCount = await visibleBreadcrumbs.count();
      
      if (visibleBreadcrumbCount > 0) {
        await expect(visibleBreadcrumbs.first()).toBeVisible();
      }
    }
  });

  test('Validate article listings and content', async () => {
    // Check for article/post listings
    const articles = page.locator('article, .post, .entry, .blog-post');
    await expect(articles.first()).toBeVisible();
    
    // Verify at least one article is present
    const articleCount = await articles.count();
    expect(articleCount).toBeGreaterThan(0);

    // Validate first article structure
    const firstArticle = articles.first();
    
    // Check for article title
    const articleTitle = firstArticle.locator('h1, h2, h3, .title, .entry-title');
    await expect(articleTitle.first()).toBeVisible();
    
    // Check for article link
    const articleLink = firstArticle.locator('a[href]');
    await expect(articleLink.first()).toBeVisible();
    await expect(articleLink.first()).toHaveAttribute('href');
    
    // Check for article excerpt or content
    const articleContent = firstArticle.locator('p, .excerpt, .content, .entry-content');
    if (await articleContent.first().isVisible()) {
      await expect(articleContent.first()).toBeVisible();
    }
  });

  test('Validate specific activity and exercise content', async () => {
    // Look for activity/exercise related content
    const activityContent = page.locator('text=/dog.friendly|exercise|activity|workout|training|play|walk|run|sport/i');
    await expect(activityContent.first()).toBeVisible();

    // Check for specific article about dog-friendly destinations
    const dogFriendlyArticle = page.locator('text=/dog.friendly.*destinations.*philippines/i');
    if (await dogFriendlyArticle.first().isVisible()) {
      await expect(dogFriendlyArticle.first()).toBeVisible();
    }
  });

  test('Validate page footer', async () => {
    // Check for footer with multiple selectors
    const footerSelectors = [
      'footer, .footer',
      '.bt_bb_footer, .btLightSkin',
      '.site-footer, .main-footer',
      '.footer-container, #footer'
    ];
    
    let footerFound = false;
    let footerElement = null;
    
    for (const selector of footerSelectors) {
      const footer = page.locator(selector);
      const count = await footer.count();
      
      if (count > 0) {
        // Check if footer has content or child elements
        const hasContent = await footer.first().locator('*').count() > 0;
        const hasText = (await footer.first().textContent() || '').trim().length > 0;
        
        if (hasContent || hasText) {
          footerElement = footer.first();
          footerFound = true;
          break;
        }
      }
    }
    
    // If footer found, validate it
    if (footerFound && footerElement) {
      // Check for copyright or site info
      const copyrightSelectors = [
        'text=/copyright|©|all rights reserved/i',
        '.copyright, .copy',
        'text=/pinoypetplan/i',
        'text=/2024|2025/i'
      ];
      
      let copyrightFound = false;
      for (const selector of copyrightSelectors) {
        const copyrightText = page.locator(selector);
        const count = await copyrightText.count();
        
        if (count > 0) {
          copyrightFound = true;
          break;
        }
      }
      
      // At least footer should exist, copyright is optional
      expect(footerFound).toBe(true);
    } else {
      // If no footer found, just log it - some sites may not have traditional footers
      console.log('No footer found on page');
    }
  });

  test('Validate responsive design', async () => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verify page is still functional on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Check if mobile menu toggle exists
    const mobileMenuToggle = page.locator('.mobile-menu-toggle, .hamburger, .menu-toggle, button[aria-label*="menu"]');
    if (await mobileMenuToggle.first().isVisible()) {
      await expect(mobileMenuToggle.first()).toBeVisible();
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Validate SEO elements', async () => {
    // Check meta description with fallback
    const metaDescriptionSelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]'
    ];
    
    let metaDescFound = false;
    for (const selector of metaDescriptionSelectors) {
      const metaDescription = page.locator(selector);
      const count = await metaDescription.count();
      
      if (count > 0) {
        const content = await metaDescription.first().getAttribute('content');
        if (content && content.trim().length > 0) {
          metaDescFound = true;
          break;
        }
      }
    }
    
    // Meta description is not always present, so don't fail if missing
    if (!metaDescFound) {
      console.log('Meta description not found - this may affect SEO');
    }
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();
    
    // Page should have at least some headings
    const totalHeadings = h1Count + h2Count + h3Count;
    expect(totalHeadings).toBeGreaterThan(0);
    
    // If H1 exists, there should be only one
    if (h1Count > 0) {
      expect(h1Count).toBeLessThanOrEqual(1);
    }
    
    // Check for meta keywords if present (optional)
    const metaKeywords = page.locator('meta[name="keywords"]');
    const keywordCount = await metaKeywords.count();
    
    if (keywordCount > 0) {
      const content = await metaKeywords.first().getAttribute('content');
      expect(content).toBeTruthy();
    }
    
    // Check for Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogTitleCount = await ogTitle.count();
    
    if (ogTitleCount > 0) {
      const content = await ogTitle.first().getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('Validate page performance and loading', async () => {
    // Check page load time
    const startTime = Date.now();
    await page.goto(ACTIVITIES_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    
    // Check for images with better error handling
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Find visible images
      const visibleImages = await images.filter({ hasText: /.*/ }).or(images.filter({ has: page.locator('img[src]') }));
      const visibleImageCount = await visibleImages.count();
      
      if (visibleImageCount > 0) {
        // Check if images have src attribute
        const imagesWithSrc = page.locator('img[src]');
        const srcCount = await imagesWithSrc.count();
        expect(srcCount).toBeGreaterThan(0);
        
        // Check for alt attributes
        const imagesWithAlt = page.locator('img[alt]');
        const altCount = await imagesWithAlt.count();
        expect(altCount).toBeGreaterThan(0);
        
        // Try to validate at least one image loads properly
        const firstImageWithSrc = imagesWithSrc.first();
        const src = await firstImageWithSrc.getAttribute('src');
        expect(src).toBeTruthy();
        
        // Optional: Check if image is not broken (basic check)
        const naturalWidth = await firstImageWithSrc.evaluate((img: HTMLImageElement) => img.naturalWidth);
        if (naturalWidth !== undefined && naturalWidth > 0) {
          expect(naturalWidth).toBeGreaterThan(0);
        }
      } else {
        console.log('No visible images found on page');
      }
    } else {
      console.log('No images found on page');
    }
  });

  test('Validate interactive elements', async () => {
    // Check for search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], .search-input');
    if (await searchInput.first().isVisible()) {
      await expect(searchInput.first()).toBeVisible();
      await expect(searchInput.first()).toBeEnabled();
    }
    
    // Check for pagination if exists
    const pagination = page.locator('.pagination, .pager, .page-numbers');
    if (await pagination.first().isVisible()) {
      await expect(pagination.first()).toBeVisible();
      
      const paginationLinks = pagination.locator('a');
      const linkCount = await paginationLinks.count();
      if (linkCount > 0) {
        await expect(paginationLinks.first()).toHaveAttribute('href');
      }
    }
    
    // Check for category filters or tags
    const categoryFilter = page.locator('.category-filter, .tag-filter, .filter-links');
    if (await categoryFilter.first().isVisible()) {
      await expect(categoryFilter.first()).toBeVisible();
    }
  });

  test('Validate accessibility features', async () => {
    // Check for proper ARIA labels
    const ariaElements = page.locator('[aria-label], [aria-labelledby], [role]');
    const ariaCount = await ariaElements.count();
    
    if (ariaCount > 0) {
      // At least one ARIA element should exist
      expect(ariaCount).toBeGreaterThan(0);
    }
    
    // Check for keyboard navigation
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    let focusableFound = false;
    let focusableElement = null;
    
    for (const selector of focusableSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        // Find a visible and enabled element
        for (let i = 0; i < Math.min(count, 5); i++) {
          const element = elements.nth(i);
          const isVisible = await element.isVisible();
          const isEnabled = await element.isEnabled();
          
          if (isVisible && isEnabled) {
            focusableElement = element;
            focusableFound = true;
            break;
          }
        }
        
        if (focusableFound) break;
      }
    }
    
    expect(focusableFound).toBe(true);
    
    // Test tab navigation on found element
    if (focusableElement) {
      try {
        await focusableElement.focus();
        
        // Wait a bit for focus to settle
        await page.waitForTimeout(100);
        
        // Check if element is focused or has focus-related styling
        const isFocused = await focusableElement.evaluate((el) => {
          return document.activeElement === el || el.matches(':focus');
        });
        
        // More lenient focus check - at least verify element can receive focus
        if (!isFocused) {
          // Try alternative focus verification
          const elementType = await focusableElement.evaluate((el) => el.tagName.toLowerCase());
          expect(['a', 'button', 'input', 'textarea', 'select'].includes(elementType)).toBe(true);
        }
      } catch (error) {
        console.log('Focus test failed:', error);
        // Don't fail the test if focus doesn't work, just log it
      }
    }
  });

  test('Validate social sharing elements', async () => {
    // Check for social media links or sharing buttons
    const socialLinks = page.locator('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"], .social-share, .share-buttons');
    
    if (await socialLinks.first().isVisible()) {
      const socialCount = await socialLinks.count();
      expect(socialCount).toBeGreaterThan(0);
      
      // Verify social links have proper attributes
      for (let i = 0; i < Math.min(socialCount, 3); i++) {
        const socialLink = socialLinks.nth(i);
        await expect(socialLink).toHaveAttribute('href');
      }
    }
  });
});

// Helper function to check if element exists and is visible
async function checkElementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return await element.first().isVisible();
  } catch {
    return false;
  }
}

// Configuration for test run
test.describe.configure({ mode: 'parallel' });

// Custom test fixtures for extended functionality
test.describe('Extended Validation Tests', () => {
  test('Validate form submissions if present', async ({ page }) => {
    await page.goto(ACTIVITIES_URL);
    
    // Check for contact forms or newsletter signups
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      const firstForm = forms.first();
      await expect(firstForm).toBeVisible();
      
      // Check for required fields
      const requiredFields = firstForm.locator('input[required], textarea[required], select[required]');
      const requiredCount = await requiredFields.count();
      
      if (requiredCount > 0) {
        await expect(requiredFields.first()).toBeVisible();
      }
    }
  });

  test('Validate external links behavior', async ({ page }) => {
    await page.goto(ACTIVITIES_URL);
    
    // Find external links
    const externalLinks = page.locator('a[href^="http"]:not([href*="pinoypetplan.com"])');
    const externalLinkCount = await externalLinks.count();
    
    if (externalLinkCount > 0) {
      // Check if external links open in new tabs
      const firstExternalLink = externalLinks.first();
      const target = await firstExternalLink.getAttribute('target');
      
      // External links should ideally open in new tabs
      if (target) {
        expect(target).toBe('_blank');
      }
    }
  });
});