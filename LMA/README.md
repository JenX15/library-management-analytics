# Library Management Analytics (Frontend-only)

## Overview
A frontend-only demo to track books, borrowers and visualize analytics (most borrowed, overdue, borrower history) using HTML/CSS/JS and a single `data/data.json` file. All runtime changes persist to browser `localStorage`.

## How to run
1. Open this folder in VS Code.
2. Install "Live Server" extension and run `Open with Live Server` (recommended).
3. Or use any static server that serves files over `http://`.

> Note: `fetch` won't load `data/data.json` correctly from `file://`. Use Live Server or similar.

## File structure
- `index.html` — Dashboard
- `overdue.html` — Overdue table
- `borrowers.html` — Borrower history
- `css/styles.css` — Styles
- `js/*.js` — App logic
- `data/data.json` — Single JSON file for all data

## Persistence
- Initial data comes from `data/data.json`.
- Updates (borrow/return) are saved to `localStorage`.
- To reset data, clear localStorage for this site.

## Next steps / enhancements
- Add UI to create/update books and borrowers.
- Add CSV export/import.
- Add bulk actions and better merge/version handling for `data.json`.
