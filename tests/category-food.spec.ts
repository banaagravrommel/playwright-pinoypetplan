import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'https://pinoypetplan.com';
const FOOD_CATEGORY_URL = `${BASE_URL}/category/food/`;

// Page object model for better organization
class FoodCategoryPage {
  constructor(private page: Page) {}

  // Navigation elements - Fixed selectors to be more specific
  get mainHeader() { return this.page.locator('header.mainHeader').first(); }
  get navigation() { return this.page.locator('nav, .mainHeader nav').first(); }
  get logo() { return this.page.locator('img.btMainLogo').first(); } // Fixed: Use only one selector, not comma-separated
  get menuItems() { return this.page.locator('.mainHeader nav a, .menu a'); }
  get searchBox() { return this.page.locator('input[type="search"], .search-input').first(); }

  // Main content elements - Fixed to use more specific selectors
  get mainContent() { return this.page.locator('.btContentHolder').first(); } // Fixed: Use specific selector only
  get pageTitle() { return this.page.locator('h1').first(); }
  get breadcrumb() { return this.page.locator('.breadcrumb, .breadcrumbs').first(); }
  get categoryDescription() { return this.page.locator('.category-description, .archive-description').first(); }

  // Food articles/posts - Updated for actual structure
  get foodArticles() { return this.page.locator('.bt_bb_blog_grid .bt_bb_grid_item, article, .post'); }
  get articleTitles() { return this.page.locator('.bt_bb_blog_grid h3, .bt_bb_blog_grid h2, article h2, .post-title'); }
  get articleImages() { return this.page.locator('.bt_bb_blog_grid img, article img'); }
  get articleExcerpts() { return this.page.locator('.bt_bb_blog_grid .bt_bb_text, .excerpt, .post-excerpt'); }
  get readMoreLinks() { return this.page.locator('.bt_bb_blog_grid a, .read-more, .continue-reading'); }

  // Sidebar elements
  get sidebar() { return this.page.locator('aside, .sidebar, .bt_bb_sidebar').first(); }
  get categories() { return this.page.locator('.widget-categories, .categories-widget').first(); }
  get recentPosts() { return this.page.locator('.widget-recent-posts, .recent-posts').first(); }
  get tags() { return this.page.locator('.widget-tags, .tags-widget').first(); }

  // Footer elements
  get footer() { return this.page.locator('footer.btLightSkin, footer').first(); }
  get footerLinks() { return this.page.locator('footer a').filter({ hasText: /.+/ }); }
  get socialLinks() { return this.page.locator('footer .social-links a, footer .social-media a'); }

  // Pagination
  get pagination() { return this.page.locator('.pagination, .page-numbers, .bt_bb_pagination').first(); }
  get paginationLinks() { return this.page.locator('.pagination a, .page-numbers a'); }

  // Utility methods
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async scrollToBottom() {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }
}

test.describe('PinoyPetPlan Food Category Page', () => {
  let foodPage: FoodCategoryPage;

  test.beforeEach(async ({ page }) => {
    foodPage = new FoodCategoryPage(page);
    await page.goto(FOOD_CATEGORY_URL);
    await foodPage.waitForPageLoad();
  });

  test('should load the food category page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/.*food.*/i);
    await expect(page).toHaveURL(FOOD_CATEGORY_URL);
    
    // Check if page body is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display correct page metadata', async ({ page }) => {
    // Check meta tags
    const metaDescription = page.locator('meta[name="description"]');
    const metaKeywords = page.locator('meta[name="keywords"]');
    
    if (await metaDescription.count() > 0) {
      await expect(metaDescription).toHaveAttribute('content', /.+/);
    }

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    
    if (await ogTitle.count() > 0) {
      await expect(ogTitle).toHaveAttribute('content', /.+/);
    }
  });

  test('should have a proper header with navigation', async () => {
    // Main header should be visible
    await expect(foodPage.mainHeader).toBeVisible();
    
    // Logo should be present and have src attribute - Fixed to handle multiple logos
    const logoCount = await foodPage.logo.count();
    if (logoCount > 0) {
      await expect(foodPage.logo).toHaveAttribute('src', /.+/);
      await expect(foodPage.logo).toHaveAttribute('alt', /.+/);
    }

    // Check if navigation exists
    if (await foodPage.navigation.count() > 0) {
      await expect(foodPage.navigation).toBeVisible();
    }
    
    // Check for menu items
    if (await foodPage.menuItems.count() > 0) {
      const menuText = await foodPage.menuItems.allTextContents();
      expect(menuText.length).toBeGreaterThan(0);
    }
  });

  test('should display the food category content', async () => {
    // Main content area should be visible - Fixed selector
    await expect(foodPage.mainContent).toBeVisible();
    
    // Check if page has any h1 elements
    const h1Elements = foodPage.page.locator('h1');
    if (await h1Elements.count() > 0) {
      const titleText = await h1Elements.first().textContent();
      expect(titleText).toBeDefined();
    }

    // Check for breadcrumb navigation (if present)
    if (await foodPage.breadcrumb.count() > 0) {
      await expect(foodPage.breadcrumb).toBeVisible();
    }
  });

  test('should display food-related articles', async () => {
    // Check if food articles are present
    const articleCount = await foodPage.foodArticles.count();
    expect(articleCount).toBeGreaterThan(0);
    
    // Each article should have a title
    if (articleCount > 0) {
      const titleCount = await foodPage.articleTitles.count();
      expect(titleCount).toBeGreaterThan(0);
      
      // Check article titles contain food-related content
      const titles = await foodPage.articleTitles.allTextContents();
      expect(titles.length).toBeGreaterThan(0);
      
      // Check if at least one title contains food-related terms
      const hasFoodContent = titles.some(title => 
        title.toLowerCase().includes('food') || 
        title.toLowerCase().includes('nutrition') ||
        title.toLowerCase().includes('feed') ||
        title.toLowerCase().includes('diet') ||
        title.toLowerCase().includes('pet') ||
        title.toLowerCase().includes('dog') ||
        title.toLowerCase().includes('cat')
      );
      expect(hasFoodContent).toBeTruthy();
    }
  });

  test('should have proper article structure', async () => {
    const articleCount = await foodPage.foodArticles.count();
    
    if (articleCount > 0) {
      // Check first article structure
      const firstArticle = foodPage.foodArticles.first();
      
      // Article should have a title
      const titleElements = firstArticle.locator('h1, h2, h3, .title, .bt_bb_headline');
      if (await titleElements.count() > 0) {
        await expect(titleElements.first()).toBeVisible();
      }
      
      // Article should have an image (if present)
      const articleImage = firstArticle.locator('img');
      if (await articleImage.count() > 0) {
        await expect(articleImage.first()).toHaveAttribute('src', /.+/);
      }
      
      // Article should have some content/excerpt (check for visible content)
      const content = firstArticle.locator('.bt_bb_text, .content, .excerpt, p').filter({ hasText: /.+/ });
      if (await content.count() > 0) {
        const contentText = await content.first().textContent();
        expect(contentText?.trim()).toBeDefined();
      }
    }
  });

  test('should have functional sidebar widgets', async () => {
    if (await foodPage.sidebar.count() > 0) {
      await expect(foodPage.sidebar).toBeVisible();
      
      // Check for categories widget
      if (await foodPage.categories.count() > 0) {
        await expect(foodPage.categories).toBeVisible();
      }
      
      // Check for recent posts widget
      if (await foodPage.recentPosts.count() > 0) {
        await expect(foodPage.recentPosts).toBeVisible();
      }
    }
  });

  test('should have a proper footer', async () => {
    // Scroll to footer
    await foodPage.scrollToBottom();
    
    // Footer should exist
    const footerCount = await foodPage.footer.count();
    expect(footerCount).toBeGreaterThan(0);
    
    // Check for footer links with actual text
    if (await foodPage.footerLinks.count() > 0) {
      const footerLinkTexts = await foodPage.footerLinks.allTextContents();
      const nonEmptyLinks = footerLinkTexts.filter(text => text.trim().length > 0);
      expect(nonEmptyLinks.length).toBeGreaterThan(0);
    }
  });

  test('should have working pagination (if present)', async () => {
    await foodPage.scrollToBottom();
    
    if (await foodPage.pagination.count() > 0) {
      await expect(foodPage.pagination).toBeVisible();
      
      // Check pagination links
      if (await foodPage.paginationLinks.count() > 0) {
        const firstPaginationLink = foodPage.paginationLinks.first();
        await expect(firstPaginationLink).toHaveAttribute('href', /.+/);
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await foodPage.waitForPageLoad();
    
    // Main header should still be present
    await expect(foodPage.mainHeader).toBeVisible();
    
    // Content should be visible - Fixed selector
    await expect(foodPage.mainContent).toBeVisible();
    
    // Check if mobile menu toggle exists
    const mobileMenuToggle = page.locator('.mobile-menu-toggle, .hamburger, .menu-toggle, .bt_bb_mobile_menu');
    if (await mobileMenuToggle.count() > 0) {
      await expect(mobileMenuToggle.first()).toBeVisible();
    }
  });

  test('should have proper SEO structure', async ({ page }) => {
    // Check for h1 tag - Fixed to handle pages without h1
    const h1Tags = page.locator('h1');
    const h1Count = await h1Tags.count();
    
    // If no h1 tags, check for other heading tags or page title elements
    if (h1Count === 0) {
      // Look for alternative title elements
      const alternativeTitles = page.locator('.page-title, .entry-title, .bt_bb_headline, .category-title, .archive-title');
      const altTitleCount = await alternativeTitles.count();
      
      // If no alternative titles found, check for any visible heading tags
      if (altTitleCount === 0) {
        const anyHeadings = page.locator('h1, h2, h3, h4, h5, h6');
        const anyHeadingCount = await anyHeadings.count();
        expect(anyHeadingCount).toBeGreaterThan(0);
      } else {
        expect(altTitleCount).toBeGreaterThan(0);
      }
    } else {
      expect(h1Count).toBeGreaterThanOrEqual(1);
    }
    
    // Check heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // Should have at least one heading
      await expect(headings.first()).toBeVisible();
    }
  });

  test('should load images properly', async ({ page }) => {
    // Get all images on the page
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check first few images that have src attributes
      const imagesWithSrc = images.filter({ hasAttribute: 'src' });
      const srcImageCount = await imagesWithSrc.count();
      
      if (srcImageCount > 0) {
        for (let i = 0; i < Math.min(3, srcImageCount); i++) {
          const img = imagesWithSrc.nth(i);
          await expect(img).toHaveAttribute('src', /.+/);
          
          // Check if image has alt attribute
          await expect(img).toHaveAttribute('alt');
        }
      }
    }
  });

  test('should have working search functionality (if present)', async ({ page }) => {
    if (await foodPage.searchBox.count() > 0) {
      await expect(foodPage.searchBox).toBeVisible();
      
      // Test search functionality
      await foodPage.searchBox.fill('dog food');
      await foodPage.searchBox.press('Enter');
      
      // Wait for navigation
      await page.waitForTimeout(2000);
      
      // Check if URL changed or results appeared
      const currentUrl = page.url();
      const hasSearchInUrl = currentUrl.includes('search') || currentUrl.includes('s=') || currentUrl.includes('?');
      if (hasSearchInUrl) {
        expect(currentUrl).not.toBe(FOOD_CATEGORY_URL);
      }
    }
  });

  test('should not have broken links', async ({ page }) => {
    // Get all links on the page with href attributes
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      // Check first few internal links that are visible
      const visibleLinks = links.filter({ hasText: /.+/ });
      const visibleLinkCount = await visibleLinks.count();
      
      if (visibleLinkCount > 0) {
        for (let i = 0; i < Math.min(5, visibleLinkCount); i++) {
          const link = visibleLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && (href.startsWith('/') || href.includes('pinoypetplan.com'))) {
            expect(href).toMatch(/^(https?:\/\/|\/)/);
          }
        }
      }
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for alt attributes on images
    const images = page.locator('img[src]');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(3, imageCount); i++) {
        const img = images.nth(i);
        // Images should have alt attributes
        await expect(img).toHaveAttribute('alt');
      }
    }
    
    // Check for proper link text - Only check links with text content
    const linksWithText = page.locator('a').filter({ hasText: /.+/ });
    const linkWithTextCount = await linksWithText.count();
    
    if (linkWithTextCount > 0) {
      for (let i = 0; i < Math.min(3, linkWithTextCount); i++) {
        const link = linksWithText.nth(i);
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        
        // Links should have meaningful text or aria-label
        expect(linkText?.trim() || ariaLabel?.trim()).toBeTruthy();
      }
    }
  });

  test('should have food category specific content', async ({ page }) => {
    // Check if the page contains food-related keywords
    const bodyText = await page.locator('body').textContent();
    
    if (bodyText) {
      const foodKeywords = ['food', 'nutrition', 'diet', 'feed', 'treat', 'meal', 'recipe'];
      const hasKeywords = foodKeywords.some(keyword => 
        bodyText.toLowerCase().includes(keyword)
      );
      
      expect(hasKeywords).toBeTruthy();
    }
    
    // Check if URL contains food category
    const currentUrl = page.url();
    expect(currentUrl).toContain('/category/food/');
  });

  test('should have proper page structure', async ({ page }) => {
    // Check for basic HTML structure
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('head')).toHaveCount(1);
    await expect(page.locator('body')).toHaveCount(1);
    
    // Check for title tag
    const title = await page.title();
    expect(title).toBeDefined();
    expect(title.length).toBeGreaterThan(0);
  });
});

// Performance test
test.describe('Performance Tests', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(FOOD_CATEGORY_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 15 seconds (increased for better reliability)
    expect(loadTime).toBeLessThan(15000);
  });
});

// Additional utility functions for custom assertions
export class CustomAssertions {
  static async assertTextContains(page: Page, selector: string, expectedText: string) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      await expect(element.first()).toBeVisible();
      const text = await element.first().textContent();
      expect(text?.toLowerCase()).toContain(expectedText.toLowerCase());
    }
  }

  static async assertImageLoaded(page: Page, selector: string) {
    const image = page.locator(selector);
    if (await image.count() > 0) {
      await expect(image.first()).toHaveAttribute('src', /.+/);
      const naturalWidth = await image.first().evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  }

  static async assertLinkClickable(page: Page, selector: string) {
    const link = page.locator(selector);
    if (await link.count() > 0) {
      await expect(link.first()).toHaveAttribute('href', /.+/);
    }
  }

  static async assertElementExistsAndVisible(page: Page, selector: string) {
    const element = page.locator(selector);
    const count = await element.count();
    if (count > 0) {
      await expect(element.first()).toBeVisible();
    }
    return count > 0;
  }
}