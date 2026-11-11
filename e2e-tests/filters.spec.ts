import { test, expect } from '@playwright/test';

// These job/department/location combinations are derived from the fixtures in
// src/content/jobs/*.md and chosen so each scenario below has an unambiguous
// expected result set.
const FINANCE_TITLES = ['Financial Analyst', 'Financial Reconciliation Specialist'];
const WOODINVILLE_TITLES = [
    'Financial Analyst',
    'Procurement Analyst',
    'Regulatory Compliance Specialist',
];

test.describe('Role filters', () => {
    test('filters roles by department', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('department-filter-button').filter({ hasText: 'Finance' }).click();

        const cards = page.locator('[data-testid="role-card"]:visible');
        await expect(cards).toHaveCount(FINANCE_TITLES.length);
        for (const title of FINANCE_TITLES) {
            await expect(page.getByTestId('role-title').filter({ hasText: title })).toBeVisible();
        }
    });

    test('filters roles by location', async ({ page }) => {
        await page.goto('/');
        await page
            .getByTestId('location-filter-button')
            .filter({ hasText: 'Woodinville, WA, USA' })
            .click();

        const cards = page.locator('[data-testid="role-card"]:visible');
        await expect(cards).toHaveCount(WOODINVILLE_TITLES.length);
        for (const title of WOODINVILLE_TITLES) {
            await expect(page.getByTestId('role-title').filter({ hasText: title })).toBeVisible();
        }
    });

    test('combines department and location filters with AND', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('department-filter-button').filter({ hasText: 'Finance' }).click();
        await page
            .getByTestId('location-filter-button')
            .filter({ hasText: 'Woodinville, WA, USA' })
            .click();

        await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(1);
        await expect(
            page.locator('[data-testid="role-card"]:visible').getByTestId('role-title'),
        ).toHaveText('Financial Analyst');
    });

    test('shows an empty state when no role matches the combination', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('department-filter-button').filter({ hasText: 'Finance' }).click();
        await page
            .getByTestId('location-filter-button')
            .filter({ hasText: 'Mumbai, India' })
            .click();

        await expect(page.getByTestId('roles-empty-filtered')).toBeVisible();
        await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(0);
    });

    test('resets filters to restore the full roles list', async ({ page }) => {
        await page.goto('/');
        const allRolesCount = await page.locator('[data-testid="role-card"]:visible').count();

        await page.getByTestId('department-filter-button').filter({ hasText: 'Finance' }).click();
        await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(FINANCE_TITLES.length);

        await page.getByTestId('filters-reset').click();
        await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(allRolesCount);
        await expect(
            page.getByTestId('department-filter-button').filter({ hasText: 'Finance' }),
        ).toHaveAttribute('aria-pressed', 'false');
    });

    test('reflects selected filters in the URL and restores them on reload', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('department-filter-button').filter({ hasText: 'Finance' }).click();
        await page
            .getByTestId('location-filter-button')
            .filter({ hasText: 'Woodinville, WA, USA' })
            .click();

        await expect(page).toHaveURL(/department=Finance/);
        await expect(page).toHaveURL(/location=Woodinville/);

        await page.reload();
        await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(1);
        await expect(
            page.getByTestId('department-filter-button').filter({ hasText: 'Finance' }),
        ).toHaveAttribute('aria-pressed', 'true');
    });
});
