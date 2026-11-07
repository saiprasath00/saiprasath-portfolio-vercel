# Sai Prasath D P — Portfolio.xlsx

A portfolio website rebuilt as a **living spreadsheet**. The whole page is an Excel
workbook: title bar, ribbon, formula bar, a real cell grid, row/column headers,
sheet tabs (`About / Work / Toolkit / Journey / Contact`) and a status bar.

Everything is static — plain HTML, CSS and vanilla JavaScript, with GSAP
(loaded from CDN) for the animation layer. No build step.

## Preview locally

From this folder:

```powershell
python -m http.server 8123
```

Then open <http://127.0.0.1:8123/>.

Any static server works (Node, Live Server, etc.).

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub repo (e.g. `saiprasath-portfolio`).
2. In Cloudflare Pages, create a project from that repo.
3. Build command: **none**. Output directory: **`/`** (the repo root).
4. Deploy. `downloads/` ships as-is, so the résumé / model / PBIP links work.

Or drag-and-drop the folder in the Cloudflare Pages dashboard.

## What's interactive / animated

All motion auto-runs. There are no play/pause controls.

- **Formula bar** types itself on load and updates as you hover sections / cells.
- **Cell cursor** snaps to the grid and highlights the matching row & column headers.
- **Revenue chart** draws itself, then auto-cycles Bear → Base → Bull every ~3.2s.
  You can also drag the scenario slider to override (the auto-cycle resumes after a pause).
  The FY28 index, CAGR and chart dot update live.
- **Counters** (CGPA, year, projects, certificates) count up when scrolled into view.
- **Skill / language bars** fill as they enter the viewport.
- **Power BI pane** has four switchable pages (Executive / Trends / Scenarios / Detail).
- **Excel → Power BI transition**: a transition band before the Power BI project fills from
  Excel green to Power BI yellow, and as you pass it the **entire app shell swaps** into
  Power BI Desktop:
  - title bar → black with the Power BI logo, `Sai_Prasath_Reports.pbix` and "Power BI Desktop"
  - menu → File / Home / View / Help / External Tools
  - ribbon tabs → Home / Insert / Modeling / Data / View / Help / External Tools, with
    Power BI groups (Data, Queries, Calculations, Relationships & Security, Insert)
  - formula bar → a **DAX** measure (`Total Revenue = SUM('TCS'[FY25A])`)
  - grid rails → dark report canvas with yellow active cells
  - sheet tabs → dark Power BI report-page tabs; status bar → dark with yellow accents
  - the remaining sections render on a Power BI report canvas
  Scrolling back above the transition restores the Excel workbook shell.
- **Education roadmap**: an explicit Started 2016 → Now 2026 rail with a filling progress line,
  chronological milestones and a highlighted "You are here" card.
- **Sheet tabs** scroll to each section and stay in sync via scroll-spy.
- **Copy email** button copies the address.
- Extra motion: click ripples on the worksheet, cursor-follow tilt on cards, magnetic buttons,
  floating KPI card, parallax accents, and a pulsing Power BI logo.
- `prefers-reduced-motion` is respected — all animation settles to its final state.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Markup + all portfolio content |
| `styles.css` | Excel chrome, grid, typography, responsive |
| `script.js` | Interactions + GSAP animation |
| `downloads/` | Résumé, TCS Excel model, PBIP zip, resume pack |

## Content source

Rebuilt from <https://saiprasathportfolio.pages.dev> using the
`find-skills`, `frontend-design` and `gsap-core` skills.
