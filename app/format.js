/* Hearth & Ledger — money formatting. One job: turn numbers into readable
   US-dollar strings, and parse what a user types back into cents. */
export function formatMoney(amount) {
  const value = Number(amount) || 0;
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function formatMoneyExact(amount) {
  const value = Number(amount) || 0;
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatSigned(amount) {
  const value = Number(amount) || 0;
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return sign + formatMoney(Math.abs(value));
}

export function parseMoney(text) {
  if (text === null || text === undefined) return NaN;
  const cleaned = String(text).replace(/[$,\s]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return NaN;
  return Number(cleaned);
}

export function monthLabel(isoMonth) {
  const [year, month] = isoMonth.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function dateLabel(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
