# Hearth & Ledger — Household Budget Planner

[![make.fun](https://make.fun/badge.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

A household budget site that actually works: plan the month, log every
dollar, and watch savings goals grow — all offline, in the browser, with
your data saved only on your own device (localStorage).

## What it does

- **Dashboard** — income, spending, money left, and savings rate for the
  month; a donut chart of spending by category; recent transactions;
  upcoming bills and three plain-English wins for the month.
- **Budget Planner** — editable monthly income (three sources) and
  per-category budget caps with spent / left / % used bars; add, edit and
  delete transactions; totals update live everywhere.
- **Transactions** — every transaction for the month, searchable and
  filterable by category, with CSV download.
- **Savings Goals** — four goals with progress bars and deadlines; add
  money to a goal, or create a new one.
- **Insights** — three-month spending trend chart, the 50/30/20 split,
  three money-saving moves for next month, and a what-if calculator
  (cut takeout, add to savings → yearly effect, instantly).

The sample household is the Marlowe family of four (November 2026):
$5,850 income, $3,141 spent, 46% savings rate. Edit any figure — or use
“Reset sample data” on the Planner page to start over.

## Run it

```sh
node serve.ts          # serves app/ at http://localhost:8080
```

No build step, no network requests, no libraries: plain HTML, CSS and
ES modules under `app/`. Open `app/index.html` in any browser.

## Layout

- `app/index.html` — shell, navigation, month picker
- `app/style.css` — the whole look (pine green / cream / amber)
- `app/main.js` — hash routing and form wiring
- `app/views.js` — one render function per page
- `app/store.js` — localStorage persistence and month totals
- `app/data.js` — seed household, categories, budgets, goals
- `app/format.js` — money and date formatting
- `app/charts.js` — canvas donut and bar charts (no library)
- `screenshots/` — 3 desktop + 1 phone screenshots of the working site
- `main.ts` — hand-in program: copies `app/` + `screenshots/` to
  `/output` and writes `dossier.json` (see `MAKEFUN_OUTPUT_DIR=out node main.ts`)

## License

MIT — see `LICENSE`.
