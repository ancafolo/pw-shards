//   TESTS_SUCCESS=always  -> every test passes
//   TESTS_SUCCESS=never   -> every test fails (assertion -> Allure "failed")
//   TESTS_SUCCESS=broken  -> every test is broken (thrown Error -> Allure "broken")
//   TESTS_SUCCESS=random  -> ~10% of assertions fail (default when unset)

const os = require("os");
const { expect, test } = require("@playwright/test");
const allure = require("allure-js-commons");

// Mirrors the 0.1 probability used in the per-suite conftest._should_fail().
const FAIL_PROBABILITY = 0.1;

// Epic = business area above Feature (Epic -> Feature -> Story).
// Keys are lower-case feature names; add new features here as the project grows.
// Unmapped features fall back to the layer-based epic in setup() (no "Other").
const EPIC_BY_FEATURE = {
  checkout: "Purchasing",
  cart: "Purchasing",
  "product catalog": "Catalog",
  authentication: "User account",
};

function epicFor(feature) {
  if (!feature) return undefined;
  const epic = EPIC_BY_FEATURE[feature.toLowerCase()];
  if (!epic) console.warn(`[allure] No epic mapped for feature "${feature}"`);
  return epic;
}

function shouldFail() {
  const mode = process.env.TESTS_SUCCESS || "random";
  if (mode === "always") return false;
  if (mode === "never") return true;
  return Math.random() < FAIL_PROBABILITY;
}

function osLabel() {
  const map = { darwin: "macos", win32: "windows", linux: "linux" };
  return process.env.TESTS_OS || map[os.platform()] || os.platform();
}

async function applyGate() {
  await allure.label("os", osLabel());
  if ((process.env.TESTS_SUCCESS || "random") === "broken") {
    test.setTimeout(1);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function assertStep(name, reason = "ODD") {
  await allure.step(name, async () => {
    expect(shouldFail(), `Failure due to reason ${reason}`).toBe(false);
  });
}

async function setup({ layer, owner, feature } = {}) {
  await applyGate();
  if (layer) await allure.layer(layer);
  const epic = epicFor(feature);
  if (epic) await allure.epic(epic);
  else if (layer === "unit") await allure.epic("BE unit tests");
  else if (layer === "api") await allure.epic("BE tests");
  else if (layer === "e2e" || layer === "web") await allure.epic("FE tests");
  if (owner) await allure.owner(owner);
}

const pad = (n, width = 3) => String(n).padStart(width, "0");

module.exports = {
  FAIL_PROBABILITY,
  EPIC_BY_FEATURE,
  epicFor,
  shouldFail,
  osLabel,
  applyGate,
  setup,
  assertStep,
  pad,
};