import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:8000",
    // Lets a developer keep the preview open while running the browser suite.
    // CI still starts a clean server.
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone-portrait", use: { ...devices["Pixel 7"] } },
    { name: "tablet-portrait", use: { viewport: { width: 800, height: 1280 }, isMobile: true, hasTouch: true } },
  ],
});
