/* Hearth & Ledger — store. One job: keep the household's numbers safe in
   localStorage, and compute the month's totals from them. No network, no
   cookies: the data lives on the visitor's own device. */
import { seedState, CATEGORIES } from './data.js';

const KEY = 'hearth-ledger-v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch {
    /* Corrupt or unavailable storage: fall through to the seed. */
  }
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ }
}

export function resetState() {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

export function totalIncome(state) {
  const incomeTx = state.transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(state.month))
    .reduce((sum, t) => sum + t.amount, 0);
  if (incomeTx > 0) return incomeTx;
  return state.income.primary + state.income.secondary + state.income.other;
}

export function plannedIncome(state) {
  return state.income.primary + state.income.secondary + state.income.other;
}

export function monthTransactions(state) {
  return state.transactions
    .filter((t) => t.date.startsWith(state.month))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function monthExpenses(state) {
  return monthTransactions(state).filter((t) => t.type === 'expense');
}

export function totalSpent(state) {
  return monthExpenses(state).reduce((sum, t) => sum + t.amount, 0);
}

export function spentByCategory(state) {
  const totals = {};
  for (const category of CATEGORIES) totals[category.name] = 0;
  for (const txn of monthExpenses(state)) {
    totals[txn.category] = (totals[txn.category] || 0) + txn.amount;
  }
  return totals;
}

export function totalBudgeted(state) {
  return Object.values(state.budgets).reduce((sum, v) => sum + (Number(v) || 0), 0);
}

export function savingsRate(state) {
  const income = totalIncome(state);
  if (income <= 0) return 0;
  return Math.max(0, (income - totalSpent(state)) / income);
}

export function nextId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
}
