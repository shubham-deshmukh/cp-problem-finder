import { test, expect } from '@playwright/test';

test.describe('CP Problem Finder E2E Guest Flow', () => {
  test('should go through the full guest journey and CRUD lifecycle', async ({ page }) => {
    // 1. Visit the home page and force Welcome Modal to show up
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('seen_welcome_guide'));
    await page.reload();

    // 2. Wait for and click the Continue button on the Welcome Modal
    const continueBtn = page.getByRole('button', { name: 'Continue', exact: true });
    await continueBtn.waitFor({ state: 'visible' });
    await continueBtn.click();

    // 3. Click "Continue as guest" to enter the sandbox workspace
    const guestLoginBtn = page.locator('button:has-text("Continue as guest")');
    await expect(guestLoginBtn).toBeVisible();
    await guestLoginBtn.click();

    // 4. Verify we successfully enter the dashboard
    // The FAB button with id "tour-add-btn" is shown only when authenticated
    const addButton = page.locator('#tour-add-btn');
    await expect(addButton).toBeVisible({ timeout: 15000 });

    // 5. Open the "Add Problem" modal
    await addButton.click();
    const modalHeader = page.locator('h2:has-text("Add New Problem")');
    await expect(modalHeader).toBeVisible();

    // 6. Fill in the problem link and configurations
    // We use "3sum-closest" as LeetCode URL which isn't in default seeded data
    await page.fill('#link', 'https://leetcode.com/problems/3sum-closest/');

    // Click platform select to open it and pick Leetcode
    await page.click('#platform');
    await page.click('button:has-text("Leetcode")');

    // Click difficulty select to open it and pick Medium
    await page.click('#difficulty');
    await page.click('button:has-text("Medium")');

    // Add tags by selecting from CustomSelect tag adder
    await page.click('#tag-select');
    await page.click('button:has-text("two pointers")');
    
    await page.click('#tag-select');
    await page.click('button:has-text("binary search")');

    // Submit the form to trigger backend scraping and database indexing
    const submitBtn = page.locator('button:has-text("Analyze & Add")');
    await submitBtn.click();

    // 7. Verify the problem is added and appears in the table with scraped title
    // Wait for the modal to close and the new row containing "3Sum Closest" to show
    const newProblemLink = page.locator('a:has-text("3Sum Closest")');
    await expect(newProblemLink).toBeVisible({ timeout: 15000 });

    // Verify difficulty badge and platform badge are correct
    const difficultyBadge = page.locator('span:has-text("Medium")').first();
    await expect(difficultyBadge).toBeVisible();

    // 8. Open the markdown notes drawer for our new problem
    const firstRowNotesBtn = page.locator('#tour-notes-btn');
    await expect(firstRowNotesBtn).toBeVisible();
    await firstRowNotesBtn.click();

    // Verify the drawer is visible and automatically opens in write mode because notes are empty
    const drawerTitle = page.locator('h2 a:has-text("3Sum Closest")');
    await expect(drawerTitle).toBeVisible();

    // 9. Enter the notes in the textarea (already in write mode by default for empty notes)
    const notesTextarea = page.locator('textarea[placeholder*="Add notes"]');
    await expect(notesTextarea).toBeVisible();
    await notesTextarea.fill('This is revised notes.\n\n- Note Item 1\n- Note Item 2');

    // Save the changes
    const saveNotesBtn = page.locator('button:has-text("Save Notes")');
    await saveNotesBtn.click();

    // Verify markdown renders bullet items correctly in preview mode
    await expect(page.locator('li:has-text("Note Item 1")')).toBeVisible();
    await expect(page.locator('li:has-text("Note Item 2")')).toBeVisible();

    // Close the drawer
    const closeDrawerBtn = page.locator('button[aria-label="Close notes"]');
    await closeDrawerBtn.click();
    await expect(drawerTitle).not.toBeVisible();

    // 10. Test the fuzzy search bar
    const searchInput = page.locator('#tour-search-bar input');
    await searchInput.fill('Closest');
    // Wait for debounce and check that the row is visible
    await expect(newProblemLink).toBeVisible();
    
    // Clear search and verify other rows return
    await searchInput.fill('');
    await expect(page.locator('a:has-text("Maximum Subarray Sum")')).toBeVisible();

    // 11. Test the Theme Switcher (Dark/Light mode)
    const themeBtn = page.locator('#tour-theme-btn');
    await expect(themeBtn).toBeVisible();
    
    // Toggle theme to light mode
    await themeBtn.click();
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');

    // Toggle theme back to dark mode
    await themeBtn.click();
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');

    // 12. Log out and teardown guest sandbox session
    const userMenuBtn = page.locator('button[title="User menu"]');
    await userMenuBtn.click();

    const signOutBtn = page.locator('[role="menuitem"]:has-text("Sign out")');
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // Verify redirection to landing/login page
    const loginHeader = page.locator('h1:has-text("Welcome to")');
    await expect(loginHeader).toBeVisible();
  });
});
