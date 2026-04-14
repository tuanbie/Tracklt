export const MOCK_AVAILABLE_BALANCE = 2.74;

export const MOCK_TOTAL_SPENDING = 1348.97;

export const MOCK_WALLET_BALANCE = 1052.84;

export const MOCK_TOTAL_SAVINGS = 1324.76;

export const DONUT_STATS = [
  { pct: 13, color: '#a78bfa', label: 'violet' },
  { pct: 61, color: '#38bdf8', label: 'blue' },
  { pct: 26, color: '#2dd4bf', label: 'teal' },
] as const;

export type Transaction = {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  icon: string;
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    merchant: 'Shell',
    date: 'May 26, 2022',
    amount: -87.41,
    icon: '⛽',
  },
  {
    id: '2',
    merchant: 'Amazon',
    date: 'May 25, 2022',
    amount: -142.8,
    icon: '📦',
  },
  {
    id: '3',
    merchant: 'Apple',
    date: 'May 24, 2022',
    amount: -328.0,
    icon: '',
  },
  {
    id: '4',
    merchant: 'Carrefour',
    date: 'May 23, 2022',
    amount: -56.2,
    icon: '🛒',
  },
];

/** Week chart mock — relative heights 0–1 for Mon–Sun */
export const MOCK_WEEK_SPEND_SERIES = [0.35, 0.42, 0.38, 0.5, 0.45, 0.95, 0.3];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
