# Sourcegraph changesets redirect

Chrome extension that redirects GitHub pull requests to their Sourcegraph changeset review page. Defaults to `sourcegraph/sourcegraph` on sourcegraph.sourcegraph.com; both are configurable.

```
github.com/sourcegraph/sourcegraph/pull/12345
  → sourcegraph.sourcegraph.com/changesets/gh/sourcegraph/sourcegraph/12345
```

PR subpages (`/files`, `/commits`) redirect too. Repos not in your list are untouched.

Watch the [overview on Loom](https://www.loom.com/share/28df26c93e704c4dbe1b4143fb7c5068) (requires sign-in).

## Install

```sh
npm install
npm run build
```

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select this folder.

## Configure

Right-click the toolbar icon and choose **Options**:

- **Sourcegraph instance URL:** your instance, for example `https://sourcegraph.example.com`.
- **GitHub repos to redirect:** one `owner/repo` per line, or `owner/*` for a whole org.

## Enable and disable

Click the toolbar icon to toggle. An **OFF** badge means redirects are paused, so you can reach the GitHub PR page (for example, to merge). The setting persists across restarts.

## Development

- `npm run build` compiles `src/` to `dist/`. Reload the extension in `chrome://extensions` after rebuilding.
- `npm run icons` regenerates the PNG icons from `icons/icon.svg`.
