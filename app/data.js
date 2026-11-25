/* Hearth & Ledger — seed data. One job: the household's starting numbers.
   The Marlowe family (two adults, two kids, rented three-bedroom house) with
   a realistic November 2026 month, so every page opens with real figures. */
export const CATEGORIES = [
  { name: 'Housing', color: '#1d4d3b' },
  { name: 'Groceries', color: '#2e7d5b' },
  { name: 'Utilities', color: '#e8a33d' },
  { name: 'Transport', color: '#3f7d8c' },
  { name: 'Dining Out', color: '#c4553b' },
  { name: 'Kids & School', color: '#7a5ea3' },
  { name: 'Health', color: '#b06a8a' },
  { name: 'Entertainment', color: '#8a6d3b' },
  { name: 'Household', color: '#5f6f66' },
  { name: 'Other', color: '#9aa5a0' },
];

export const MONTHS = ['2026-09', '2026-10', '2026-11'];

export const DEFAULT_BUDGETS = {
  Housing: 1450,
  Groceries: 620,
  Utilities: 210,
  Transport: 340,
  'Dining Out': 180,
  'Kids & School': 260,
  Health: 150,
  Entertainment: 120,
  Household: 140,
  Other: 80,
};

export const DEFAULT_INCOME = { primary: 3850, secondary: 2000, other: 0 };

export const DEFAULT_GOALS = [
  { id: 'g-emergency', name: 'Emergency fund — 3 months of rent', target: 4350, saved: 2980, deadline: '2027-03-31', note: 'One month of rent set aside each quarter.' },
  { id: 'g-summer', name: 'Summer road trip to the lake', target: 1200, saved: 640, deadline: '2027-06-15', note: 'Cabin, gas, and ice cream money for four.' },
  { id: 'g-bike', name: 'Maya’s first bike', target: 320, saved: 285, deadline: '2026-12-20', note: 'Almost there — birthday is December 20.' },
  { id: 'g-roof', name: 'New water heater fund', target: 950, saved: 150, deadline: '2027-02-28', note: 'The old one rattles every morning.' },
];

/* Spending history for the trend chart (Sep–Nov 2026). */
export const MONTHLY_HISTORY = [
  { month: '2026-09', income: 5850, spent: 3340 },
  { month: '2026-10', income: 5850, spent: 3612 },
  { month: '2026-11', income: 5850, spent: 0 }, // filled in live from transactions
];

const NOV = '2026-11';
export const SEED_TRANSACTIONS = [
  { id: 't01', date: `${NOV}-01`, desc: 'Rent — Maple Street house', category: 'Housing', amount: 1450, type: 'expense' },
  { id: 't02', date: `${NOV}-01`, desc: 'Paycheck — Daniel (teacher)', category: 'Other', amount: 3850, type: 'income' },
  { id: 't03', date: `${NOV}-02`, desc: 'Weekly shop — GreenMart', category: 'Groceries', amount: 142.60, type: 'expense' },
  { id: 't04', date: `${NOV}-03`, desc: 'Electric bill — City Power', category: 'Utilities', amount: 96.40, type: 'expense' },
  { id: 't05', date: `${NOV}-04`, desc: 'School lunch money — Maya & Leo', category: 'Kids & School', amount: 60, type: 'expense' },
  { id: 't06', date: `${NOV}-05`, desc: 'Gas — Shell, family car', category: 'Transport', amount: 48.20, type: 'expense' },
  { id: 't07', date: `${NOV}-06`, desc: 'Pizza night — Tony’s', category: 'Dining Out', amount: 38.50, type: 'expense' },
  { id: 't08', date: `${NOV}-07`, desc: 'Pharmacy — Leo’s inhaler refill', category: 'Health', amount: 24.99, type: 'expense' },
  { id: 't09', date: `${NOV}-08`, desc: 'Weekly shop — GreenMart', category: 'Groceries', amount: 128.15, type: 'expense' },
  { id: 't10', date: `${NOV}-09`, desc: 'Water bill', category: 'Utilities', amount: 54.30, type: 'expense' },
  { id: 't11', date: `${NOV}-10`, desc: 'Bus passes — Daniel & Priya', category: 'Transport', amount: 85, type: 'expense' },
  { id: 't12', date: `${NOV}-11`, desc: 'Paycheck — Priya (nurse, part-time)', category: 'Other', amount: 2000, type: 'income' },
  { id: 't13', date: `${NOV}-12`, desc: 'Kids’ shoes — Maya outgrew hers again', category: 'Kids & School', amount: 74.95, type: 'expense' },
  { id: 't14', date: `${NOV}-13`, desc: 'Movie night — streaming rental', category: 'Entertainment', amount: 12.99, type: 'expense' },
  { id: 't15', date: `${NOV}-14`, desc: 'Weekly shop — GreenMart', category: 'Groceries', amount: 156.80, type: 'expense' },
  { id: 't16', date: `${NOV}-15`, desc: 'Internet — Fiber 200', category: 'Utilities', amount: 59.99, type: 'expense' },
  { id: 't17', date: `${NOV}-16`, desc: 'Car insurance — monthly', category: 'Transport', amount: 118.40, type: 'expense' },
  { id: 't18', date: `${NOV}-17`, desc: 'Birthday gift — Grandma’s 70th', category: 'Other', amount: 45, type: 'expense' },
  { id: 't19', date: `${NOV}-18`, desc: 'Dentist check-up — Maya', category: 'Health', amount: 65, type: 'expense' },
  { id: 't20', date: `${NOV}-19`, desc: 'Takeout — Thai place, late shift', category: 'Dining Out', amount: 42.75, type: 'expense' },
  { id: 't21', date: `${NOV}-20`, desc: 'Weekly shop — GreenMart', category: 'Groceries', amount: 133.40, type: 'expense' },
  { id: 't22', date: `${NOV}-21`, desc: 'Laundry detergent & cleaning', category: 'Household', amount: 36.80, type: 'expense' },
  { id: 't23', date: `${NOV}-22`, desc: 'Soccer fees — Leo, winter league', category: 'Kids & School', amount: 90, type: 'expense' },
  { id: 't24', date: `${NOV}-23`, desc: 'Gas — Shell, family car', category: 'Transport', amount: 52.10, type: 'expense' },
  { id: 't25', date: `${NOV}-24`, desc: 'Library fine + new board game', category: 'Entertainment', amount: 28.40, type: 'expense' },
  { id: 't26', date: `${NOV}-25`, desc: 'Thanksgiving groceries — turkey & sides', category: 'Groceries', amount: 96.30, type: 'expense' },
];

export function seedState() {
  return {
    version: 1,
    month: '2026-11',
    income: { ...DEFAULT_INCOME },
    budgets: { ...DEFAULT_BUDGETS },
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    goals: DEFAULT_GOALS.map((g) => ({ ...g })),
  };
}
