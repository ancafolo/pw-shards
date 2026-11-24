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
// Layer is reported separately via allure.layer(), so it no longer drives Epic.
// Keys are lower-case feature names; add new features here as the project grows.
const EPIC_BY_FEATURE = {
  checkout: "Purchasing",
  cart: "Purchasing",
  authentication: "User account",
  profile: "User account",
  product: "Catalog",
  search: "Catalog",
};
const DEFAULT_EPIC = "Other";

function epicFor(feature) {
  if (!feature) return undefined;
  return EPIC_BY_FEATURE[feature.toLowerCase()] ?? DEFAULT_EPIC;
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

// setup({ layer, owner, feature, story })
//   feature -> sets Feature and derives Epic from EPIC_BY_FEATURE
//   story   -> sets Story
// If a spec already calls allure.feature()/allure.story() itself, remove those
// calls and pass the values here instead, so labels are not duplicated.
async function setup({ layer, owner, feature, story } = {}) {
  await applyGate();
  if (layer) await allure.layer(layer);
  if (feature) {
    await allure.epic(epicFor(feature));
    await allure.feature(feature);
  }
  if (story) await allure.story(story);
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