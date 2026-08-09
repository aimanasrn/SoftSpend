export type Page =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'bills'
  | 'goals'
  | 'analytics'
  | 'reports'
  | 'household'
  | 'settings'
export type AppIdentity = { name: string; email: string; initials: string }
export type ProfileRecord = {
  id: string
  full_name: string | null
  avatar_url?: string | null
  currency?: string | null
  timezone?: string | null
  default_income?: number | null
}
