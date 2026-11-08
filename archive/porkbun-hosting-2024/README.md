# Porkbun static hosting leftovers (archived 2026-11-08)

These files were on the old Porkbun static host for davidoncloud.com and were
in no commit of this repository. They were copied out before the Porkbun
hosting plan was cancelled, after the site moved to Vercel.

They are not part of the portfolio. `scripts/build.js` copies only a fixed
list of paths into `dist/`, so nothing here is published.

| File | Bytes | Line endings | SHA-256 (first 16) |
|---|---|---|---|
| `about.html` | 1419 | CRLF | `7d37ff3193d8a35e` |
| `contact.html` | 1315 | CRLF | `c060eec3c6f8d789` |
| `portfolio.html` | 1539 | CRLF | `eb4ea39f69762d07` |
| `styles.css` | 1211 | CRLF | `47b9457525836aa5` |
| `index.md` | 284 | CRLF | `0c6effc1d393ddd2` |
| `LICENSE` | 1059 | LF | `cd35957e7f357938` |

- `about.html`, `contact.html`, `portfolio.html`, `styles.css` (May 2024):
  a "John Doe" starter template from before this portfolio existed.
- `index.md` (Sep 2025): a Markdown formatting test page.
- `LICENSE` (Sep 2025): a copy of GitHub's MIT licence text.

Each text file was read from Porkbun's Static Hosting Editor and checked
against a CRC32 computed in the browser, and its size matches Porkbun's
file listing once Windows (CRLF) line endings are restored; the editor
shows LF only, so CRLF is inferred from the listed size.

Not recovered: `images/project1.jpg` to `project4.jpg` (about 7 MB, May
2024), the template's placeholder photos. The editor shows binaries as text
and corrupts them, and the domain no longer points at the Porkbun server.
