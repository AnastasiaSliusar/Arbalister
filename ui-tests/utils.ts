import { Page, expect } from "@playwright/test";

export async function openFile(page: Page, filename: string) {
  await page.click(`text=${filename}`);
  await page.waitForSelector(".arrow-viewer-toolbar");
}

export async function waitForGrid(page: Page) {
  await page.waitForSelector(".ag-root", { timeout: 3000 });
}

export async function getColsRows(page: Page) {
  const text = await page.locator(`toolbar-group-cols-rows`).innerText;
  return text;
}

export async function uploadFile(page: Page, filePath: string) {
  const input = page.locator("input[type=file]");
  await input.setInputFiles(filePath);
  await page.waitForSelector(".arrow-viewer-toolbar");
}
