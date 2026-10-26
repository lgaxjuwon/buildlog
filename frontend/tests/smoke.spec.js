import { test, expect } from '@playwright/test';

test('real API connection, navigation, and 360px layout', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('서버 연결 확인됨');
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: testInfo.outputPath(`welcome-${width}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 360, height: 900 });
  await page.getByRole('navigation').getByRole('link', { name: '공부 기록' }).click();
  await expect(page.getByText('이 화면은 로그인 후 이용할 수 있습니다.')).toBeVisible();
  await page.getByRole('link', { name: '로그인 화면으로' }).click();
  await expect(page.getByLabel('이메일')).toBeDisabled();
  await page.getByRole('link', { name: '회원가입', exact: true }).click();
  await expect(page.getByLabel('닉네임')).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  expect(errors).toEqual([]);
});

test('connection failure is visible and can be retried', async ({ page }) => {
  await page.route('**/api/health', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('서버에 연결할 수 없습니다');
  await page.unroute('**/api/health');
  await page.getByRole('button', { name: '다시 확인' }).click();
  await expect(page.getByRole('status')).toContainText('서버 연결 확인됨');
});
