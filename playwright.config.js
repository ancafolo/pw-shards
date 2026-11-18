import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  retries: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "./playwright-report", open: "never" }],
    ["allure-playwright", {
      resultsDir: "./allure-results",
      environmentInfo: {
        node_version: process.version,
      },
    }],
  ],
  projects: [
    {
      name: "poco",
      testDir: "test/poco",
    },
  ],
});