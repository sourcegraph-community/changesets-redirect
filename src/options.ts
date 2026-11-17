import { DEFAULTS, loadSettings, normalizeInstanceUrl, parseRepos } from "./settings.js";

const form = document.querySelector<HTMLFormElement>("#settings")!;
const instanceInput = document.querySelector<HTMLInputElement>("#instance-url")!;
const reposInput = document.querySelector<HTMLTextAreaElement>("#repos")!;
const status = document.querySelector<HTMLOutputElement>("#status")!;

function show(message: string, isError = false): void {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function fill(instanceUrl: string, repos: string[]): void {
  instanceInput.value = instanceUrl;
  reposInput.value = repos.join("\n");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const instanceUrl = normalizeInstanceUrl(instanceInput.value);
    const repos = parseRepos(reposInput.value);
    if (!repos.length) throw new Error("Add at least one repo.");
    await chrome.storage.sync.set({ instanceUrl, repos });
    fill(instanceUrl, repos);
    show("Saved.");
  } catch (err) {
    show(err instanceof Error ? err.message : String(err), true);
  }
});

document.querySelector("#reset")!.addEventListener("click", () => {
  fill(DEFAULTS.instanceUrl, DEFAULTS.repos);
  show("Defaults restored. Click Save to apply.");
});

loadSettings().then((s) => fill(s.instanceUrl, s.repos));
