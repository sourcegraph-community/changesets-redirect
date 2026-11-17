export interface Settings {
  enabled: boolean;
  instanceUrl: string;
  repos: string[];
}

export const DEFAULTS: Settings = {
  enabled: true,
  instanceUrl: "https://sourcegraph.sourcegraph.com",
  repos: ["sourcegraph/sourcegraph"],
};

export async function loadSettings(): Promise<Settings> {
  return (await chrome.storage.sync.get(DEFAULTS)) as Settings;
}

export function normalizeInstanceUrl(input: string): string {
  const url = new URL(input.trim());
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Instance URL must start with https:// or http://");
  }
  return (url.origin + url.pathname).replace(/\/+$/, "");
}

const REPO_PATTERN = /^[\w.-]+\/(?:[\w.-]+|\*)$/;

export function parseRepos(input: string): string[] {
  const repos = input
    .split(/[\s,]+/)
    .map((r) => r.trim())
    .filter(Boolean);
  const invalid = repos.filter((r) => !REPO_PATTERN.test(r));
  if (invalid.length) {
    throw new Error(`Invalid repo (use owner/repo or owner/*): ${invalid.join(", ")}`);
  }
  return repos;
}

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Builds a regex for one owner/repo pattern capturing (owner)(repo)(pr number).
export function prUrlRegex(repo: string): string {
  const [owner, name] = repo.split("/");
  const namePart = name === "*" ? "[^/?]+" : escapeRegex(name);
  return `^https://github\\.com/(${escapeRegex(owner)})/(${namePart})/pull/(\\d+)(?:[/?].*)?$`;
}

export function changesetUrl(instanceUrl: string, owner: string, repo: string, pr: string): string {
  return `${instanceUrl}/changesets/gh/${owner}/${repo}/${pr}`;
}
