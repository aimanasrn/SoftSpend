export const money = (value: number) =>
  `RM ${Number(value || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const compactMoney = (value: number) =>
  `RM ${Number(value || 0).toLocaleString('en-MY', { maximumFractionDigits: 0 })}`
