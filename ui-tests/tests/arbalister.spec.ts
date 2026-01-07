import { expect, galata, test } from "@jupyterlab/galata";
import path from "path";

/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false, tmpPath: "arbalister-viewer-tests" });

test("should emit an activation console message", async ({ page }) => {
  const logs: string[] = [];

  page.on("console", (message) => {
    logs.push(message.text());
  });

  await page.goto();

  expect(logs.filter((s) => s === "Launching JupyterLab extension arbalister")).toHaveLength(1);
});

test.describe
  .serial("Arbalister Viewer", () => {
    test.beforeAll(async ({ request, tmpPath }) => {
      const contents = galata.newContentsHelper(request);
      await contents.uploadFile(
        path.resolve(__dirname, `./test-files/test.csv`),
        `${tmpPath}/test.csv`,
      );

      await contents.uploadFile(
        path.resolve(__dirname, `./test-files/test.parquet`),
        `${tmpPath}/test.parquet`,
      );
    });

    test.afterAll(async ({ request, tmpPath }) => {
      const contents = galata.newContentsHelper(request);
      await contents.deleteDirectory(tmpPath);
    });


    test("open csv file and shows a delimiter", async ({ page }) => {
      await page.goto();
      const tmpPath = "arbalister-viewer-tests";
      const target = `${tmpPath}/test.csv`;
      await page.notebook.openByPath(target);
      await page.notebook.activate(target);

      const text = page.getByTestId(`toolbar-group-cols-rows`).innerText;
      console.log("text csv", text);
      expect(text).toContain("3 rows; 3 colums");
      await page.notebook.close(true);
      
    });

    test("open parquet file", async ({ page }) => {
      await page.goto();

      const tmpPath = "arbalister-viewer-tests";
      const target = `${tmpPath}/test.parquet`;
      await page.notebook.openByPath(target);
      await page.notebook.activate(target);

      const text = page.locator(`.toolbar-group-cols-rows`).innerText;
      console.log("text parquet", text);
      expect(text).toContain("3 rows; 3 colums");

      await page.notebook.close(true);
    });
  });
