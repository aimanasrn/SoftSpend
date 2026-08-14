export type Transaction = {
  id: number | string
  date: string
  merchant: string
  category: string
  method: string
  amount: number
  type: 'expense' | 'income'
  icon: string
  color: string
  budgetId?: string
  budgetName?: string
}
export type Budget = { name: string; category: string; limit: number; spent: number; color: string; target?: string }

export const transactions: Transaction[] = [
  {
    id: 1,
    date: 'Aug 08, 2026',
    merchant: 'Village Grocer',
    category: 'Food & Dining',
    method: 'Debit Card',
    amount: 86.4,
    type: 'expense',
    icon: 'shopping-basket',
    color: '#f5c0d0',
  },
  {
    id: 2,
    date: 'Aug 07, 2026',
    merchant: 'Grab',
    category: 'Transportation',
    method: 'E-Wallet',
    amount: 24.5,
    type: 'expense',
    icon: 'car',
    color: '#d3c8ff',
  },
  {
    id: 3,
    date: 'Aug 06, 2026',
    merchant: 'Netflix',
    category: 'Subscriptions',
    method: 'Credit Card',
    amount: 55,
    type: 'expense',
    icon: 'play',
    color: '#f9d2c5',
  },
  {
    id: 4,
    date: 'Aug 05, 2026',
    merchant: 'August Salary',
    category: 'Salary',
    method: 'Online Banking',
    amount: 4500,
    type: 'income',
    icon: 'wallet',
    color: '#bcebd7',
  },
  {
    id: 5,
    date: 'Aug 04, 2026',
    merchant: 'TNB Electricity',
    category: 'Bills & Utilities',
    method: 'Online Banking',
    amount: 86,
    type: 'expense',
    icon: 'zap',
    color: '#f8e2ae',
  },
]

export const budgets: Budget[] = [
  { name: 'Housing', category: 'Housing', limit: 1200, spent: 1200, color: '#958aff' },
  { name: 'Food & Dining', category: 'Food & Dining', limit: 600, spent: 420, color: '#f6b7c8' },
  { name: 'Transportation', category: 'Transportation', limit: 400, spent: 186, color: '#a6d5ff' },
  { name: 'Bills & Utilities', category: 'Bills & Utilities', limit: 350, spent: 215, color: '#f5d88f' },
  { name: 'Shopping', category: 'Shopping', limit: 300, spent: 180, color: '#c9bfff' },
]

export const spendingTrend = [
  { month: 'Mar', income: 4200, expense: 2680 },
  { month: 'Apr', income: 4500, expense: 3120 },
  { month: 'May', income: 4500, expense: 2740 },
  { month: 'Jun', income: 4500, expense: 2920 },
  { month: 'Jul', income: 4500, expense: 3200 },
  { month: 'Aug', income: 4500, expense: 2750 },
]

export const categoryData = [
  { name: 'Housing', value: 1200, color: '#9389ff' },
  { name: 'Food', value: 420, color: '#f2a9be' },
  { name: 'Bills', value: 350, color: '#f4d68d' },
  { name: 'Transport', value: 280, color: '#9dceff' },
  { name: 'Other', value: 500, color: '#bdebd8' },
]
