/* Hearth & Ledger — main. One job: routing and wiring. It reads the hash
   route, renders the matching view, and connects every form and button on
   the page to the store, so each control does what it says. */
import { MONTHS } from './data.js';
import { loadState, saveState, resetState, nextId } from './store.js';
import { formatMoneyExact, monthLabel, parseMoney } from './format.js';
import { renderDashboard, mountDashboard, renderPlanner, renderTransactions, renderGoals, renderInsights, mountInsights } from './views.js';

const app = document.getElementById('app');
const monthSelect = document.getElementById('monthSelect');
let state = loadState();

function fillMonthSelect() {
  monthSelect.innerHTML = MONTHS.map((m) => `<option value="${m}" ${m === state.month ? 'selected' : ''}>${monthLabel(m)}</option>`).join('');
}

monthSelect.addEventListener('change', () => {
  state.month = monthSelect.value;
  saveState(state);
  render();
});

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, queryString] = raw.split('?');
  const params = new URLSearchParams(queryString || '');
  return { path: path || '', params };
}

function setActiveNav(route) {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === route);
  });
}

function render() {
  fillMonthSelect();
  const { path, params } = parseHash();
  let route = 'dashboard';
  if (path === 'planner') route = 'planner';
  else if (path === 'transactions') route = 'transactions';
  else if (path === 'goals') route = 'goals';
  else if (path === 'insights') route = 'insights';
  setActiveNav(route);

  if (route === 'planner') {
    app.innerHTML = renderPlanner(state, params.get('edit'));
    wirePlanner();
  } else if (route === 'transactions') {
    app.innerHTML = renderTransactions(state, { q: params.get('q') || '', category: params.get('category') || 'All' });
    wireTransactions();
  } else if (route === 'goals') {
    app.innerHTML = renderGoals(state);
    wireGoals();
  } else if (route === 'insights') {
    app.innerHTML = renderInsights(state);
    mountInsights(state);
  } else {
    app.innerHTML = renderDashboard(state);
    mountDashboard(state);
  }
  window.scrollTo(0, 0);
}

function wireDeletes(scope) {
  scope.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      const txn = state.transactions.find((t) => t.id === button.dataset.delete);
      if (!txn) return;
      if (window.confirm(`Delete “${txn.desc}” (${formatMoneyExact(txn.amount)})?`)) {
        state.transactions = state.transactions.filter((t) => t.id !== txn.id);
        saveState(state);
        render();
      }
    });
  });
}

function wirePlanner() {
  wireDeletes(app);
  const incomeForm = document.getElementById('incomeForm');
  incomeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(incomeForm);
    for (const key of ['primary', 'secondary', 'other']) {
      const value = parseMoney(data.get(key));
      if (!Number.isNaN(value) && value >= 0) state.income[key] = Math.round(value);
    }
    saveState(state);
    document.getElementById('incomeSaved').textContent = 'Income saved — dashboard and savings rate updated.';
    render();
    document.getElementById('incomeSaved').textContent = 'Income saved — dashboard and savings rate updated.';
  });
  const budgetForm = document.getElementById('budgetForm');
  budgetForm.addEventListener('submit', (event) => {
    event.preventDefault();
    budgetForm.querySelectorAll('[data-budget]').forEach((input) => {
      const value = parseMoney(input.value);
      if (!Number.isNaN(value) && value >= 0) state.budgets[input.dataset.budget] = Math.round(value);
    });
    saveState(state);
    document.getElementById('budgetSaved').textContent = 'Budgets saved — every total on the site updated.';
    render();
    document.getElementById('budgetSaved').textContent = 'Budgets saved — every total on the site updated.';
  });
  document.getElementById('resetData').addEventListener('click', () => {
    if (window.confirm('Reset to the original sample household data? Your edits will be lost.')) {
      state = resetState();
      render();
    }
  });
  const txnForm = document.getElementById('txnForm');
  txnForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(txnForm);
    const amount = parseMoney(data.get('amount'));
    const desc = String(data.get('desc') || '').trim();
    const date = String(data.get('date') || '');
    if (!desc || Number.isNaN(amount) || amount <= 0 || !date) return;
    const { params } = parseHash();
    const editingId = params.get('edit');
    const record = {
      desc,
      amount: Math.round(amount * 100) / 100,
      date,
      category: String(data.get('category')),
      type: String(data.get('type')),
    };
    if (editingId) {
      const existing = state.transactions.find((t) => t.id === editingId);
      if (existing) Object.assign(existing, record);
      saveState(state);
      location.hash = '#/planner';
      render();
      return;
    }
    state.transactions.push({ id: nextId('t'), ...record });
    saveState(state);
    document.getElementById('txnSaved').textContent = `Added “${desc}” — ${formatMoneyExact(record.amount)}. Totals updated.`;
    txnForm.reset();
    render();
  });
}

function wireTransactions() {
  wireDeletes(app);
  const filterForm = document.getElementById('filterForm');
  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(filterForm);
    const q = String(data.get('q') || '').trim();
    const category = String(data.get('category') || 'All');
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (category !== 'All') next.set('category', category);
    location.hash = '#/transactions' + (next.toString() ? `?${next.toString()}` : '');
    render();
  });
  document.getElementById('exportCsv').addEventListener('click', () => {
    const lines = ['date,description,category,type,amount'];
    for (const t of state.transactions.filter((t) => t.date.startsWith(state.month))) {
      const desc = `"${t.desc.replace(/"/g, '""')}"`;
      lines.push([t.date, desc, t.category, t.type, t.amount.toFixed(2)].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hearth-ledger-${state.month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

function wireGoals() {
  document.querySelectorAll('.goal-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const amount = parseMoney(new FormData(form).get('amount'));
      if (Number.isNaN(amount) || amount <= 0) return;
      const goal = state.goals.find((g) => g.id === form.dataset.goal);
      if (!goal) return;
      goal.saved = Math.round((goal.saved + amount) * 100) / 100;
      saveState(state);
      render();
    });
  });
  const goalForm = document.getElementById('goalForm');
  goalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(goalForm);
    const target = parseMoney(data.get('target'));
    const name = String(data.get('name') || '').trim();
    const deadline = String(data.get('deadline') || '');
    if (!name || Number.isNaN(target) || target <= 0 || !deadline) return;
    state.goals.push({ id: nextId('g'), name, target: Math.round(target), saved: 0, deadline, note: String(data.get('note') || '').trim() });
    saveState(state);
    document.getElementById('goalSaved').textContent = `Goal “${name}” created.`;
    render();
  });
}

window.addEventListener('hashchange', render);
render();
