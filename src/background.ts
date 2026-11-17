// Full page loads are redirected by dynamic declarativeNetRequest rules. GitHub
// navigates between pages client-side (pushState), which bypasses network rules,
// so those navigations are caught by the webNavigation listener.

import { changesetUrl, loadSettings, prUrlRegex, type Settings } from "./settings.js";

async function applySettings(settings: Settings): Promise<void> {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const addRules: chrome.declarativeNetRequest.Rule[] = settings.enabled
    ? settings.repos.map((repo, i) => ({
        id: i + 1,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: { regexSubstitution: changesetUrl(settings.instanceUrl, "\\1", "\\2", "\\3") },
        },
        condition: {
          regexFilter: prUrlRegex(repo),
          isUrlFilterCaseSensitive: false,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      }))
    : [];
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules,
  });
  await chrome.action.setBadgeText({ text: settings.enabled ? "" : "OFF" });
  await chrome.action.setTitle({
    title: `Changesets redirect: ${settings.enabled ? "ON" : "OFF"} (click to toggle, right-click for options)`,
  });
}

chrome.webNavigation.onHistoryStateUpdated.addListener(
  async ({ tabId, frameId, url }) => {
    if (frameId !== 0) return;
    const settings = await loadSettings();
    if (!settings.enabled) return;
    for (const repo of settings.repos) {
      const m = new RegExp(prUrlRegex(repo), "i").exec(url);
      if (m) {
        await chrome.tabs.update(tabId, { url: changesetUrl(settings.instanceUrl, m[1], m[2], m[3]) });
        return;
      }
    }
  },
  { url: [{ hostEquals: "github.com" }] },
);

chrome.action.onClicked.addListener(async () => {
  const { enabled } = await loadSettings();
  await chrome.storage.sync.set({ enabled: !enabled });
});

chrome.storage.onChanged.addListener(async (_changes, area) => {
  if (area === "sync") await applySettings(await loadSettings());
});

const sync = async (): Promise<void> => applySettings(await loadSettings());
chrome.runtime.onInstalled.addListener(sync);
chrome.runtime.onStartup.addListener(sync);
