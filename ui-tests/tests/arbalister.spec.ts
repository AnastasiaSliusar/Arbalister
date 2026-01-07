import { expect, test } from "@jupyterlab/galata";
import { getColsRows, uploadFile, waitForGrid } from "../utils";

/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false });

test("should emit an activation console message", async ({ page }) => {
  const logs: string[] = [];

  page.on("console", (message) => {
    logs.push(message.text());
  });

  await page.goto();

  expect(logs.filter((s) => s === "Launching JupyterLab extension arbalister")).toHaveLength(1);
});

test.describe("Viewers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto();
  });
  test("open csv file and shows a delimiter", async ({ page }) => {
    await uploadFile(page, "fake_test.csv");
    await waitForGrid(page);

    const before = await getColsRows(page);

    await page.selectOption("select", ";");
    await page.waitForTimeout(500);

    const after = await getColsRows(page);

    await page.selectOption("select", ";");
    await page.waitForTimeout(500);

    expect(after).not.toEqual(before);
  });

  test("open parquet file", async ({ page }) => {
    await uploadFile(page, "fake_test.parquet");
    await waitForGrid(page);
    const before = await getColsRows(page);
    const check = "3 rows; 3 columns";
    console.log("before", before);
    expect(before).toEqual(check);
  });
});
