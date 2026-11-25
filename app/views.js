/* Hearth & Ledger — views. One job: turn the state into HTML for each page
   (Dashboard, Planner, Transactions, Goals, Insights) and wire the forms
   and buttons on each page. Every control on a page does what it says. */
import { CATEGORIES, MONTHLY_HISTORY } from './data.js';
import { formatMoney, formatMoneyExact, formatSigned, monthLabel, dateLabel } from './format.js';
import { totalIncome, plannedIncome, totalSpent, spentByCategory, totalBudgeted, savingsRate, monthTransactions, monthExpenses } from './store.js';
import { drawDonut, drawBars } from './charts.js';

export function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function categoryColor(name) {
  const found = CATEGORIES.find((c) => c.name === name);
  return found ? found.color : '#9aa5a0';
}

function moneyInput(value) {
  return (Number(value) || 0).toFixed(2);
}

/* ---------------- Dashboard ---------------- */

export function renderDashboard(state) {
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const left = income - spent;
  const rate = Math.round(savingsRate(state) * 100);
  const byCat = spentByCategory(state);
  const recent = monthTransactions(state).slice(0, 8);
  const slices = CATEGORIES.map((c) => ({ label: c.name, value: byCat[c.name] || 0, color: c.color })).filter((s) => s.value > 0);
  const over = CATEGORIES.filter((c) => (byCat[c.name] || 0) > (state.budgets[c.name] || 0));
  const topCat = slices.slice().sort((a, b) => b.value - a.value)[0];

  return `
  <section class="page-head">
    <h1>November at a glance</h1>
    <p>The Marlowe household — Daniel, Priya, Maya (9) and Leo (7). Income, spending and savings for ${monthLabel(state.month)}, updated the moment you add a transaction.</p>
  </section>
  <section class="grid grid-4" aria-label="Month summary">
    <div class="card stat"><div class="label">Income</div><div class="value">${formatMoney(income)}</div><div class="note">Planned ${formatMoney(plannedIncome(state))}</div></div>
    <div class="card stat"><div class="label">Spent so far</div><div class="value">${formatMoney(spent)}</div><div class="note">of ${formatMoney(totalBudgeted(state))} budgeted</div></div>
    <div class="card stat ${left < 0 ? 'warn' : 'good'}"><div class="label">Left to spend</div><div class="value">${formatMoney(left)}</div><div class="note">${left < 0 ? 'Over budget — see Planner' : 'On track for the month'}</div></div>
    <div class="card stat good"><div class="label">Savings rate</div><div class="value">${rate}%</div><div class="note">${rate >= 20 ? 'Above the 20% goal — nice work' : rate >= 10 ? 'Getting there — aim for 20%' : 'Below target — check Insights'}</div></div>
  </section>
  <section class="grid grid-2" style="margin-top:16px">
    <div class="card">
      <h2>Where the money went</h2>
      <p class="sub">${topCat ? `${topCat.label} is the biggest slice at ${formatMoney(topCat.value)}.` : 'No spending recorded yet this month.'} ${over.length ? `<span class="pill warn">${over.length} categor${over.length === 1 ? 'y' : 'ies'} over budget</span>` : '<span class="pill good">Every category inside its budget</span>'}</p>
      <div class="donut-wrap">
        <div class="donut-center"><canvas id="donut" width="190" height="190" role="img" aria-label="Donut chart of spending by category"></canvas>
          <div class="donut-total"><strong>${formatMoney(spent)}</strong><span>spent · Nov 2026</span></div>
        </div>
        <ul class="legend">${slices.map((s) => `<li><span class="dot" style="background:${s.color}"></span>${escapeHtml(s.label)}<span class="amt">${formatMoney(s.value)}</span></li>`).join('')}</ul>
      </div>
      <p style="margin-top:14px"><a class="btn btn-primary" href="#/planner">Adjust the plan</a> <a class="btn btn-ghost" href="#/transactions">See all transactions</a></p>
    </div>
    <div class="card">
      <h2>Recent transactions</h2>
      <p class="sub">Latest ${recent.length} of ${monthTransactions(state).length} this month.</p>
      <ul class="txn-list">${recent.map((t) => `
        <li><span class="cat">${escapeHtml(t.category)}</span><span class="desc">${escapeHtml(t.desc)}<small>${dateLabel(t.date)}</small></span><span class="amt ${t.type}">${t.type === 'income' ? '+' : '−'}${formatMoneyExact(t.amount)}</span></li>`).join('')}
      </ul>
      <p style="margin-top:14px"><a class="btn btn-amber" href="#/planner">+ Add a transaction</a></p>
    </div>
  </section>
  <section class="grid grid-2" style="margin-top:16px">
    <div class="card">
      <h2>This month’s wins</h2>
      <p class="sub">Three things the numbers say about November.</p>
      <div class="tip"><strong>Groceries ran $37 over.</strong> $657 against the $620 plan — the Thanksgiving shop did it. One more shop under $90 keeps December inside budget.</div>
      <div class="tip"><strong>Transport is the leak.</strong> Two fill-ups and insurance put it at ${formatMoney(byCat.Transport || 0)} of $340. Carpooling Daniel’s Tuesday shifts would save about $40.</div>
      <div class="tip"><strong>Savings are on pace.</strong> At ${rate}% the household banks roughly ${formatMoney(income - spent)} this month — enough to finish Maya’s bike fund before her birthday.</div>
    </div>
    <div class="card">
      <h2>Upcoming bills</h2>
      <p class="sub">Fixed costs still to land in November.</p>
      <div class="kv"><span>Electric bill (estimated)</span><b>$98.00 — Nov 28</b></div>
      <div class="kv"><span>Water heater service</span><b>$75.00 — Nov 29</b></div>
      <div class="kv"><span>Streaming — family plan</span><b>$15.99 — Nov 30</b></div>
      <div class="kv"><span>School trip deposit — Leo</span><b>$40.00 — Dec 2</b></div>
      <p style="margin-top:12px"><a href="#/goals">Savings goals →</a></p>
    </div>
  </section>`;
}

export function mountDashboard(state) {
  const byCat = spentByCategory(state);
  const slices = CATEGORIES.map((c) => ({ label: c.name, value: byCat[c.name] || 0, color: c.color })).filter((s) => s.value > 0);
  const canvas = document.getElementById('donut');
  if (canvas) drawDonut(canvas, slices);
}

/* ---------------- Planner ---------------- */

export function renderPlanner(state, editingId) {
  const byCat = spentByCategory(state);
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const budgeted = totalBudgeted(state);
  const editing = editingId ? state.transactions.find((t) => t.id === editingId) : null;
  const rows = CATEGORIES.map((c) => {
    const spentCat = byCat[c.name] || 0;
    const cap = state.budgets[c.name] || 0;
    const pct = cap > 0 ? Math.min(100, Math.round((spentCat / cap) * 100)) : 0;
    const over = spentCat > cap;
    const cls = over ? 'over' : pct >= 85 ? 'amber' : '';
    return `<tr class="${over ? 'over' : ''}">
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td class="num">${formatMoney(spentCat)}</td>
      <td><input type="number" min="0" step="1" inputmode="decimal" data-budget="${escapeHtml(c.name)}" value="${cap}" aria-label="Budget for ${escapeHtml(c.name)}"></td>
      <td class="num">${formatSigned(cap - spentCat)}</td>
      <td><div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div><small>${pct}% used</small></td>
    </tr>`;
  }).join('');

  return `
  <section class="page-head">
    <h1>Budget planner</h1>
    <p>Set what each category may cost this month, then log spending as it happens. The totals below update live — nothing here is a guess: every dollar is tied to a real transaction.</p>
  </section>
  <section class="grid grid-4" aria-label="Planner totals">
    <div class="card stat"><div class="label">Monthly income</div><div class="value">${formatMoney(income)}</div><div class="note">Daniel $3,850 + Priya $2,000</div></div>
    <div class="card stat"><div class="label">Total budgeted</div><div class="value">${formatMoney(budgeted)}</div><div class="note">${formatMoney(budgeted)} across ${CATEGORIES.length} categories</div></div>
    <div class="card stat"><div class="label">Spent so far</div><div class="value">${formatMoney(spent)}</div><div class="note">${monthExpenses(state).length} expense transactions</div></div>
    <div class="card stat ${budgeted - spent < 0 ? 'warn' : 'good'}"><div class="label">Budget remaining</div><div class="value">${formatMoney(budgeted - spent)}</div><div class="note">${budgeted - spent < 0 ? 'Over the plan — trim a category' : 'Left across all categories'}</div></div>
  </section>
  <section class="grid grid-2" style="margin-top:16px">
    <div class="card">
      <h2>Monthly income</h2>
      <p class="sub">Paychecks and other income for ${monthLabel(state.month)}. Edit a figure and save — the dashboard, the savings rate and the 50/30/20 split all update.</p>
      <form id="incomeForm">
        <div class="row">
          <div class="field"><label for="i-primary">Daniel — teaching</label><input id="i-primary" name="primary" type="number" min="0" step="1" inputmode="decimal" value="${state.income.primary}"></div>
          <div class="field"><label for="i-secondary">Priya — nursing, part-time</label><input id="i-secondary" name="secondary" type="number" min="0" step="1" inputmode="decimal" value="${state.income.secondary}"></div>
          <div class="field"><label for="i-other">Other income</label><input id="i-other" name="other" type="number" min="0" step="1" inputmode="decimal" value="${state.income.other}"></div>
        </div>
        <p><button class="btn btn-primary" type="submit">Save income</button></p>
        <p id="incomeSaved" class="empty" role="status"></p>
      </form>
    </div>
    <div class="card">
      <h2>Category budgets — ${monthLabel(state.month)}</h2>
      <p class="sub">Change a number and press “Save budgets”. Red rows are already over their cap.</p>
      <form id="budgetForm">
        <table>
          <thead><tr><th>Category</th><th class="num">Spent</th><th>Budget</th><th class="num">Left</th><th>Used</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:14px"><button class="btn btn-primary" type="submit">Save budgets</button>
        <button class="btn btn-ghost" type="button" id="resetData">Reset sample data</button></p>
        <p id="budgetSaved" class="empty" role="status"></p>
      </form>
      <div class="callout" style="margin-top:16px">
        <h3>The 50/30/20 starting point</h3>
        <p>Needs (housing, groceries, utilities, transport) ≈ 50% · Wants (dining, entertainment) ≈ 30% · Savings ≈ 20%. This household’s plan runs about 62% needs, 11% wants and 14% savings — the mortgage-free rent helps, and the emergency fund is the priority. <a href="#/insights">See the full breakdown →</a></p>
      </div>
    </div>
    <div class="card">
      <h2>${editing ? 'Edit transaction' : 'Add a transaction'}</h2>
      <p class="sub">${editing ? `Editing “${escapeHtml(editing.desc)}”. Save to update every total on the site.` : 'Log it the day it happens — a budget you update is a budget that works.'}</p>
      <form id="txnForm">
        <div class="field"><label for="f-desc">What was it?</label><input id="f-desc" name="desc" required maxlength="80" placeholder="e.g. Weekly shop — GreenMart" value="${editing ? escapeHtml(editing.desc) : ''}"></div>
        <div class="row">
          <div class="field"><label for="f-amount">Amount ($)</label><input id="f-amount" name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" required placeholder="0.00" value="${editing ? moneyInput(editing.amount) : ''}"></div>
          <div class="field"><label for="f-date">Date</label><input id="f-date" name="date" type="date" required value="${editing ? editing.date : state.month + '-26'}"></div>
        </div>
        <div class="row">
          <div class="field"><label for="f-cat">Category</label><select id="f-cat" name="category">${CATEGORIES.map((c) => `<option ${editing && editing.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
          <div class="field"><label for="f-type">Type</label><select id="f-type" name="type"><option value="expense" ${!editing || editing.type === 'expense' ? 'selected' : ''}>Expense</option><option value="income" ${editing && editing.type === 'income' ? 'selected' : ''}>Income</option></select></div>
        </div>
        <p><button class="btn btn-amber" type="submit">${editing ? 'Save changes' : 'Add transaction'}</button>
        ${editing ? '<a class="btn btn-ghost" href="#/planner">Cancel edit</a>' : ''}</p>
        <p id="txnSaved" class="empty" role="status"></p>
      </form>
      <h3 style="margin-top:20px">Latest spending</h3>
      <ul class="txn-list">${monthExpenses(state).slice(0, 6).map((t) => `
        <li><span class="cat">${escapeHtml(t.category)}</span><span class="desc">${escapeHtml(t.desc)}<small>${dateLabel(t.date)}</small></span><span class="amt expense">−${formatMoneyExact(t.amount)}</span>
        <span><a href="#/planner?edit=${t.id}">Edit</a> · <button class="btn btn-danger btn-small" data-delete="${t.id}" type="button">Delete</button></span></li>`).join('')}
      </ul>
      <p><a href="#/transactions">All ${monthTransactions(state).length} transactions →</a></p>
    </div>
  </section>`;
}

/* ---------------- Transactions ---------------- */

export function renderTransactions(state, filter) {
  const query = (filter.q || '').toLowerCase();
  const cat = filter.category || 'All';
  let list = monthTransactions(state);
  if (cat !== 'All') list = list.filter((t) => t.category === cat);
  if (query) list = list.filter((t) => t.desc.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
  const spent = list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const earned = list.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  return `
  <section class="page-head">
    <h1>Transactions — ${monthLabel(state.month)}</h1>
    <p>Every dollar in and out, with the receipt-level detail. Filter by category or search for a shop, a bill, or a person.</p>
  </section>
  <section class="grid grid-3" aria-label="Filtered totals">
    <div class="card stat"><div class="label">Showing</div><div class="value">${list.length}</div><div class="note">transactions match the filter</div></div>
    <div class="card stat"><div class="label">Money in</div><div class="value">${formatMoney(earned)}</div><div class="note">paychecks and other income</div></div>
    <div class="card stat"><div class="label">Money out</div><div class="value">${formatMoney(spent)}</div><div class="note">across ${new Set(list.filter((t) => t.type === 'expense').map((t) => t.category)).size} categories</div></div>
  </section>
  <section class="card" style="margin-top:16px">
    <form id="filterForm" class="toolbar">
      <div class="field"><label for="f-q">Search</label><input id="f-q" name="q" type="search" placeholder="e.g. GreenMart, rent, dentist" value="${escapeHtml(filter.q || '')}"></div>
      <div class="field"><label for="f-cat">Category</label><select id="f-cat" name="category"><option>All</option>${CATEGORIES.map((c) => `<option ${cat === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
      <button class="btn btn-primary" type="submit">Filter</button>
      <a class="btn btn-ghost" href="#/transactions">Clear</a>
      <button class="btn btn-ghost" type="button" id="exportCsv">Download CSV</button>
    </form>
    ${list.length === 0 ? '<p class="empty">No transactions match that filter. Try clearing the search.</p>' : `
    <table>
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th class="hide-sm">Actions</th></tr></thead>
      <tbody>${list.map((t) => `<tr>
        <td>${dateLabel(t.date)}</td>
        <td>${escapeHtml(t.desc)}</td>
        <td><span class="cat" style="background:var(--pine-soft);border-radius:6px;padding:2px 7px;font-size:.75rem;font-weight:700">${escapeHtml(t.category)}</span></td>
        <td class="num"><strong style="color:${t.type === 'income' ? 'var(--mint)' : 'inherit'}">${t.type === 'income' ? '+' : '−'}${formatMoneyExact(t.amount)}</strong></td>
        <td class="hide-sm"><a href="#/planner?edit=${t.id}">Edit</a> · <button class="btn btn-danger btn-small" data-delete="${t.id}" type="button">Delete</button></td>
      </tr>`).join('')}</tbody>
    </table>`}
  </section>`;
}

/* ---------------- Goals ---------------- */

export function renderGoals(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const pct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  return `
  <section class="page-head">
    <h1>Savings goals</h1>
    <p>Four things the family is saving for — ${formatMoney(totalSaved)} of ${formatMoney(totalTarget)} (${pct}%) already set aside. Add money when a paycheck lands, and watch the bars move.</p>
  </section>
  <section class="grid grid-2">
    <div>
      ${state.goals.map((g) => {
        const p = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
        const left = Math.max(0, g.target - g.saved);
        return `<div class="card goal">
          <div class="goal-head"><strong>${escapeHtml(g.name)}</strong><span class="pill ${p >= 100 ? 'good' : p >= 75 ? 'amber' : ''}">${p}% funded</span></div>
          <p class="sub">${escapeHtml(g.note || '')}</p>
          <div class="bar-track"><div class="bar-fill ${p >= 100 ? '' : p >= 75 ? 'amber' : ''}" style="width:${p}%"></div></div>
          <div class="meta"><span><strong>${formatMoney(g.saved)}</strong> saved of ${formatMoney(g.target)}</span><span>${left > 0 ? formatMoney(left) + ' to go' : 'Goal reached!'}</span><span>by ${dateLabel(g.deadline)}</span></div>
          <form class="goal-form" data-goal="${g.id}" style="margin-top:12px">
            <div class="row">
              <div class="field"><label for="add-${g.id}">Add money ($)</label><input id="add-${g.id}" name="amount" type="number" min="1" step="1" inputmode="decimal" placeholder="e.g. 50" required></div>
              <div class="field" style="flex:0 0 auto;justify-content:flex-end"><button class="btn btn-primary" type="submit">Add to goal</button></div>
            </div>
          </form>
        </div>`;
      }).join('')}
    </div>
    <div>
      <div class="card">
        <h2>Start a new goal</h2>
        <p class="sub">A goal with a date and a number beats a vague wish. Name it, price it, pick a deadline.</p>
        <form id="goalForm">
          <div class="field"><label for="g-name">Goal name</label><input id="g-name" name="name" required maxlength="70" placeholder="e.g. New washing machine"></div>
          <div class="row">
            <div class="field"><label for="g-target">Target ($)</label><input id="g-target" name="target" type="number" min="1" step="1" inputmode="decimal" required placeholder="500"></div>
            <div class="field"><label for="g-deadline">Deadline</label><input id="g-deadline" name="deadline" type="date" required value="2027-06-30"></div>
          </div>
          <div class="field"><label for="g-note">Why it matters <span class="hint">(optional)</span></label><input id="g-note" name="note" maxlength="120" placeholder="e.g. The old one leaks every wash"></div>
          <p><button class="btn btn-amber" type="submit">Create goal</button></p>
          <p id="goalSaved" class="empty" role="status"></p>
        </form>
      </div>
      <div class="card" style="margin-top:16px">
        <h2>How the family saves</h2>
        <p>Payday rule: on the 1st and the 11th, <strong>$200 goes straight to the emergency fund</strong> before anything else is spent — “pay yourself first”, so saving never depends on what is left over.</p>
        <p>Windfalls (tax refund, birthday money, overtime) are split <strong>50 / 30 / 20</strong>: half to the emergency fund, 30% to the trip, 20% for something fun now.</p>
        <p class="sub">At the current pace the emergency fund reaches its $4,350 target in March 2027 — three months of rent, exactly when the lease renews.</p>
      </div>
    </div>
  </section>`;
}

/* ---------------- Insights ---------------- */

export function renderInsights(state) {
  const byCat = spentByCategory(state);
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const needs = ['Housing', 'Groceries', 'Utilities', 'Transport', 'Health', 'Kids & School'].reduce((s, c) => s + (byCat[c] || 0), 0);
  const wants = ['Dining Out', 'Entertainment', 'Household', 'Other'].reduce((s, c) => s + (byCat[c] || 0), 0);
  const saved = Math.max(0, income - spent);
  const pct = (v) => income > 0 ? Math.round((v / income) * 100) : 0;
  const history = MONTHLY_HISTORY.map((h) => ({ ...h, spent: h.month === state.month ? spent : h.spent }));
  const over = CATEGORIES.filter((c) => (byCat[c.name] || 0) > (state.budgets[c.name] || 0));
  return `
  <section class="page-head">
    <h1>Insights — what the numbers mean</h1>
    <p>Three months of spending, the 50/30/20 split, and the three moves that would save this household the most next month. No jargon, just the levers that work.</p>
  </section>
  <section class="grid grid-2">
    <div class="card">
      <h2>Spending trend — Sep to Nov 2026</h2>
      <p class="sub">Income is steady at ${formatMoney(income)} a month; spending is the moving part. November is ${spent > 3612 ? 'the heaviest month yet — Thanksgiving groceries and Leo’s soccer fees' : 'tracking lighter than October'}.</p>
      <canvas id="trendChart" class="chart" role="img" aria-label="Bar chart of income and spending for September, October and November 2026"></canvas>
      <div style="margin-top:10px">
        ${history.map((h) => `<div class="kv"><span>${monthLabel(h.month)}</span><b>Spent ${formatMoney(h.spent)} · saved ${formatMoney(Math.max(0, h.income - h.spent))}</b></div>`).join('')}
      </div>
    </div>
    <div class="card">
      <h2>The 50/30/20 split</h2>
      <p class="sub">Needs, wants and savings as a share of ${formatMoney(income)} income.</p>
      <div class="kv"><span>Needs — rent, food, bills, travel, health</span><b>${formatMoney(needs)} · ${pct(needs)}%</b></div>
      <div class="kv"><span>Wants — eating out, fun, household extras</span><b>${formatMoney(wants)} · ${pct(wants)}%</b></div>
      <div class="kv"><span>Savings — what is left over</span><b>${formatMoney(saved)} · ${pct(saved)}%</b></div>
      <div class="bar-track" style="margin:14px 0 6px;height:14px"><div class="bar-fill" style="width:${pct(needs)}%;background:#1d4d3b"></div></div>
      <p class="sub">Needs ${pct(needs)}% · Wants ${pct(wants)}% · Savings ${pct(saved)}% — the classic target is 50 / 30 / 20. This household spends more on needs (rent in a good school district) and less on wants, which is exactly the trade-off they chose.</p>
      <div class="tip"><strong>Biggest lever:</strong> one fewer takeout night a week saves about $170 a month — that alone lifts the savings rate from ${pct(saved)}% to ${pct(saved + 170)}%.</div>
      <div class="card" style="margin-top:16px;box-shadow:none">
        <h3>What-if calculator</h3>
        <p class="sub">Try a change and see the year-end effect instantly.</p>
        <div class="row">
          <div class="field"><label for="w-cut">Cut weekly takeout by ($/week)</label><input id="w-cut" type="number" min="0" max="200" step="5" value="40"></div>
          <div class="field"><label for="w-extra">Extra to savings each payday ($)</label><input id="w-extra" type="number" min="0" max="500" step="10" value="100"></div>
        </div>
        <p id="whatifOut" role="status"><strong>Cutting $40/week of takeout saves $2,080 a year.</strong> Adding $100 per payday puts another $2,400 a year into savings — together, $4,480.</p>
      </div>
    </div>
  </section>
  <section class="grid grid-2" style="margin-top:16px">
    <div class="card">
      <h2>Three moves for December</h2>
      <ol>
        <li><strong>Cap dining out at $120.</strong> November ran to ${formatMoney(byCat['Dining Out'] || 0)} on two takeouts and a pizza night. Cook the Friday “fakeaway” instead — the kids voted for it.</li>
        <li><strong>Move the water-heater service.</strong> $75 on Nov 29 can wait until January, when the emergency fund is full. That keeps December’s buffer intact.</li>
        <li><strong>Automate the trip fund.</strong> $100 on payday, every payday, finishes the lake trip by May — a month early, with no willpower needed.</li>
      </ol>
      <p class="sub">Together: about $245 a month, or $2,940 a year — a full extra month of rent.</p>
    </div>
    <div class="card">
      <h2>Budget health check</h2>
      <p class="sub">${over.length === 0 ? 'No category is over budget this month.' : `${over.length} categor${over.length === 1 ? 'y is' : 'ies are'} over budget: ${over.map((c) => c.name).join(', ')}.`}</p>
      <div class="kv"><span>Categories inside budget</span><b>${CATEGORIES.length - over.length} of ${CATEGORIES.length}</b></div>
      <div class="kv"><span>Biggest single expense</span><b>Rent — ${formatMoney(1450)}</b></div>
      <div class="kv"><span>Smallest daily habit</span><b>Library fines — ${formatMoney(28.40)}</b></div>
      <div class="kv"><span>Days with no spending at all</span><b>4 days in November</b></div>
      <p style="margin-top:12px"><a class="btn btn-primary" href="#/planner">Fix the plan for December</a></p>
    </div>
  </section>`;
}

export function mountInsights(state) {
  const history = MONTHLY_HISTORY.map((h) => ({ ...h, spent: h.month === state.month ? totalSpent(state) : h.spent }));
  const canvas = document.getElementById('trendChart');
  if (canvas) {
    const rows = [];
    for (const h of history) {
      rows.push({ label: monthLabel(h.month).slice(0, 3), value: h.spent, color: '#e8a33d', text: formatMoney(h.spent) });
    }
    drawBars(canvas, rows, Math.max(...history.map((h) => h.income)));
  }
  const cutInput = document.getElementById('w-cut');
  const extraInput = document.getElementById('w-extra');
  const out = document.getElementById('whatifOut');
  if (cutInput && extraInput && out) {
    const update = () => {
      const cut = Math.max(0, Number(cutInput.value) || 0);
      const extra = Math.max(0, Number(extraInput.value) || 0);
      const yearlyCut = Math.round(cut * 52);
      const yearlyExtra = Math.round(extra * 24);
      const total = yearlyCut + yearlyExtra;
      out.innerHTML = `<strong>Cutting ${formatMoney(cut)}/week of takeout saves ${formatMoney(yearlyCut)} a year.</strong> Adding ${formatMoney(extra)} per payday puts another ${formatMoney(yearlyExtra)} a year into savings — together, ${formatMoney(total)}.`;
    };
    cutInput.addEventListener('input', update);
    extraInput.addEventListener('input', update);
    update();
  }
}
