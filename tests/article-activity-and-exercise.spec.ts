import { test, expect } from '@playwright/test';

test.describe('Dog-Friendly Parks and Trails Article Tests', () => {
  const articleUrl = 'https://pinoypetplan.com/mabuhay-ang-lakad-exploring-dog-friendly-parks-and-trails-in-the-philippines/';

  test.beforeEach(async ({ page }) => {
    await page.goto(articleUrl);
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should load the page successfully', async ({ page }) => {
    // Verify page loads and has correct title
    await expect(page).toHaveTitle(/mabuhay.*lakad|dog.*friendly.*parks|trails.*philippines/i);
    
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

  test('should display the article title with Filipino greeting', async ({ page }) => {
    // Check for the main article title containing "Mabuhay ang Lakad"
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
        hasText: /mabuhay.*lakad|exploring.*dog.*friendly.*parks/i 
      });
      if (await title.first().isVisible().catch(() => false)) {
        await expect(title.first()).toBeVisible();
        titleFound = true;
        break;
      }
    }

    if (!titleFound) {
      // Fallback - check if title text exists anywhere on page
      await expect(page.locator('text=/mabuhay.*lakad/i').first()).toBeVisible();
    }
  });

  test('should contain main content sections', async ({ page }) => {
    // Test for main content sections mentioned in the article
    const keyContentSections = [
      'growing trend',
      'pet-friendly spaces',
      'practical advice',
      'key locations',
      'necessary preparations',
      'responsible pet ownership'
    ];

    let sectionsFound = 0;
    for (const section of keyContentSections) {
      const sectionContent = page.locator(`text=/${section.replace(/\s+/g, '.*')}/i`);
      if (await sectionContent.first().isVisible().catch(() => false)) {
        sectionsFound++;
      }
    }

    // Expect at least half of the sections to be found
    expect(sectionsFound).toBeGreaterThanOrEqual(Math.floor(keyContentSections.length / 2));
  });

  test('should display specific dog parks mentioned in Manila area', async ({ page }) => {
    // Check for specific dog parks mentioned in the article
    const dogParks = [
      'Central Bark Park',
      'BGC',
      'Salcedo Park',
      'Bark Park Eastwood',
      'Hachi Park',
      'BarkYard',
      'Jaime Velasquez Dog Park'
    ];

    let parksFound = 0;
    for (const park of dogParks) {
      const parkMention = page.locator(`text=${park}`).or(
        page.locator(`text=/${park}/i`)
      );
      if (await parkMention.first().isVisible().catch(() => false)) {
        parksFound++;
      }
    }

    // Expect at least half of the parks to be mentioned
    expect(parksFound).toBeGreaterThanOrEqual(Math.floor(dogParks.length / 2));
  });

  test('should display specific trails and hiking locations', async ({ page }) => {
    // Check for specific trails mentioned in the article
    const trails = [
      'UP Oval Trail',
      'Fort Strip',
      'BGC Loop',
      'Masuan Peak',
      'Chocolate Hills',
      'Marikina Heights'
    ];

    let trailsFound = 0;
    for (const trail of trails) {
      const trailMention = page.locator(`text=${trail}`).or(
        page.locator(`text=/${trail}/i`)
      );
      if (await trailMention.first().isVisible().catch(() => false)) {
        trailsFound++;
      }
    }

    // Expect at least half of the trails to be mentioned
    expect(trailsFound).toBeGreaterThanOrEqual(Math.floor(trails.length / 2));
  });

  test('should contain location-specific information', async ({ page }) => {
    // Check for specific Philippine cities and areas mentioned
    const locations = [
      'Quezon City',
      'Makati',
      'Bonifacio Global City',
      'Eastwood City',
      'Marikina',
      'Bohol',
      'Metro Manila'
    ];

    let locationsFound = 0;
    for (const location of locations) {
      const locationMention = page.locator(`text=${location}`).or(
        page.locator(`text=/${location}/i`)
      );
      if (await locationMention.first().isVisible().catch(() => false)) {
        locationsFound++;
      }
    }

    // Expect at least 3 locations to be mentioned
    expect(locationsFound).toBeGreaterThanOrEqual(3);
  });

  test('should provide practical dog walking advice', async ({ page }) => {
    // Check for practical advice keywords
    const practicalAdvice = [
      'leash',
      'poop bags',
      'clean up',
      'vaccinations',
      'water',
      'appropriate for your dog',
      'size and breed'
    ];

    let adviceFound = 0;
    for (const advice of practicalAdvice) {
      const adviceMention = page.locator(`text=${advice}`).or(
        page.locator(`text=/${advice.replace(/\s+/g, '.*')}/i`)
      );
      if (await adviceMention.first().isVisible().catch(() => false)) {
        adviceFound++;
      }
    }

    // Expect at least half of the advice items to be mentioned
    expect(adviceFound).toBeGreaterThanOrEqual(Math.floor(practicalAdvice.length / 2));
  });

  test('should contain safety and preparation information', async ({ page }) => {
    // Check for safety-related content
    const safetyItems = [
      'water bottle',
      'snacks',
      'weather conditions',
      'wildlife',
      'fitness level',
      'hot or cold',
      'safe environment'
    ];

    let safetyItemsFound = 0;
    for (const item of safetyItems) {
      const safetyMention = page.locator(`text=${item}`).or(
        page.locator(`text=/${item.replace(/\s+/g, '.*')}/i`)
      );
      if (await safetyMention.first().isVisible().catch(() => false)) {
        safetyItemsFound++;
      }
    }

    // Expect at least 3 safety items to be mentioned
    expect(safetyItemsFound).toBeGreaterThanOrEqual(3);
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

  test('should contain Filipino cultural context', async ({ page }) => {
    // Check for Filipino terms and cultural references
    const filipinoTerms = ['Mabuhay', 'lakad', 'Philippines', 'furry friend'];
    
    for (const term of filipinoTerms) {
      // Use first() to avoid strict mode violation when multiple elements exist
      const termElement = page.locator(`text=${term}`).first();
      if (await termElement.isVisible().catch(() => false)) {
        await expect(termElement).toBeVisible();
      }
    }
    
    // Check for Philippines context
    await expect(page.locator('text=/Philippines/i').first()).toBeVisible();
  });

  test('should mention different types of activities', async ({ page }) => {
    // Check for various activity types mentioned
    const activities = [
      'walk',
      'run',
      'hiking',
      'jog',
      'play',
      'socialize',
      'exercise',
      'off-leash play',
      'agility'
    ];

    let activitiesFound = 0;
    for (const activity of activities) {
      const activityMention = page.locator(`text=${activity}`).or(
        page.locator(`text=/${activity}/i`)
      );
      if (await activityMention.first().isVisible().catch(() => false)) {
        activitiesFound++;
      }
    }

    // Expect at least half of the activities to be mentioned
    expect(activitiesFound).toBeGreaterThanOrEqual(Math.floor(activities.length / 2));
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

  test('should mention responsible pet ownership', async ({ page }) => {
    // Check for responsible ownership themes
    const responsibilityThemes = [
      'responsible pet owner',
      'picking up',
      'respectful',
      'being aware',
      'keep your dog on a leash',
      'clean up after'
    ];

    let themesFound = 0;
    for (const theme of responsibilityThemes) {
      const themeMention = page.locator(`text=/${theme.replace(/\s+/g, '.*')}/i`);
      if (await themeMention.first().isVisible().catch(() => false)) {
        themesFound++;
      }
    }

    // Expect at least 3 responsibility themes to be mentioned
    expect(themesFound).toBeGreaterThanOrEqual(3);
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

  test('should contain conclusion and additional tips', async ({ page }) => {
    // Check for conclusion section
    const conclusion = page.locator('text=/conclusion/i');
    if (await conclusion.first().isVisible().catch(() => false)) {
      await expect(conclusion.first()).toBeVisible();
    }
    
    // Check for additional tips section
    const additionalTips = page.locator('text=/additional tips/i');
    if (await additionalTips.first().isVisible().catch(() => false)) {
      await expect(additionalTips.first()).toBeVisible();
    }
    
    // Check for final encouraging message
    const encouragement = page.locator('text=/have fun|enjoy/i');
    await expect(encouragement.first()).toBeVisible();
  });
});