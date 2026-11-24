# FuturePath Outbound Workspace

Astro static site for the FuturePath AI client project status workspace.

## Run locally

1. Install a current Node.js LTS release.
2. Open this project folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev` to preview, or `npm run build` to create the Vercel-ready `dist/` folder.

Vercel can import this folder from GitHub with the Astro preset. The build command is `npm run build`; the output directory is `dist`.

## Project content

- `src/pages/index.astro` — overview dashboard.
- `src/pages/roadmap.astro` — phases and research tools.
- `src/pages/updates/` — status update list and static detail pages.
- `src/content/updates/` — Markdown sprint reports.
- `public/assets/futurepath-logo.png` — logo extracted from the supplied dashboard.

The KPI values and sample leads are illustrative. The preview lead tracker, chat notes, announcements, and the overview's personal work status, checkpoint, and to-do list use browser local storage and are visible only in that browser. They are not shared with a client or connected to Google Sheets. Workbook links open the existing Google Sheets, whose access remains controlled in Google Drive.

For a private client-facing deployment, enable Vercel Deployment Protection or another authentication layer before sharing the site URL. This static Astro project does not itself authenticate users.
