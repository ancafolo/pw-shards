import { defineConfig } from "allure";

const comboRules = [
  {
    name: "Transitions / Transition",
    matchers: { transitions: ["new", "fixed", "regressed", "malfunctioned"] },
    groupBy: ["transition"],
    groupByMessage: false,
  },
  {
    name: "Flaky / Flaky / Msg",
    matchers: { flaky: true },
    groupBy: ["flaky"],
    groupByMessage: true,
  },
  {
    name: "Feature+Story",
    matchers: { labels: { feature: /.+/, story: /.+/ } },
    groupBy: [{ label: "feature" }, { label: "story" }],
    groupByMessage: false,
  },
  {
    name: "Story / Transition",
    matchers: { labels: { story: /.+/ } },
    groupBy: ["transition"],
    groupByMessage: false,
  },
  {
    name: "Feature / Status",
    matchers: { labels: { feature: /.+/ } },
    groupBy: ["status"],
    groupByMessage: false,
  },
  {
    name: "Owner / Owner / Msg",
    matchers: { labels: { owner: /.+/ } },
    groupBy: ["owner"],
    groupByMessage: true,
  },
  {
    name: "Layer / Severity+Layer / Msg",
    matchers: { labels: { layer: /.+/ } },
    groupBy: ["severity", "layer"],
    groupByMessage: true,
  },
  {
    name: "Non-flaky / Flaky / Msg",
    matchers: { flaky: false },
    groupBy: ["flaky"],
    groupByMessage: true,
  },
];

export default defineConfig({
  name: "Allure Report",
  output: "./allure-report",
  historyPath: "./history.jsonl",
  open: false,
  categories: {
    rules: comboRules,
  },
  plugins: {
    awesomeAll: {
      import: "@allurereport/plugin-awesome",
      options: {
        reportName: "Allure 3 Report grouped by Feature",
        singleFile: false,
        reportLanguage: "en",
        groupBy: ["feature", "story"],
      },
    },
  },
});