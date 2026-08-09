// @ts-nocheck
import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronRight,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Moon,
  PieChart,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Upload,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import type { AppIdentity, Page } from '../../app/types'

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'budgets', label: 'Budgets', icon: WalletCards },
  { id: 'bills', label: 'Bills', icon: CalendarDays },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'household', label: 'Household', icon: Users },
]

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="logo" to="/">
      <span className="logo-mark">
        <span />
      </span>
      {!compact && <span>SoftSpend</span>}
    </Link>
  )
}

function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="landing">
      <header className="landing-nav wrap">
        <Logo />
        <nav>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#benefits">Benefits</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-actions">
          <button className="text-button" onClick={onEnter}>
            Login
          </button>
          <button className="primary-button small" onClick={onEnter}>
            Get Started <ChevronRight size={16} />
          </button>
        </div>
        <button className="mobile-icon">
          <Menu size={20} />
        </button>
      </header>
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <h1>
              Take control
              <br />
              of your <em>money.</em>
            </h1>
            <p>
              Plan your monthly budget, track expenses, monitor your salary usage and build better financial habits —
              all in one simple dashboard.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={onEnter}>
                Start Budgeting Free <ArrowUpRight size={17} />
              </button>
              <button className="ghost-button" onClick={onEnter}>
                View Demo <ChevronRight size={17} />
              </button>
            </div>
            <div className="hero-note">
              <span className="avatar-stack">
                <i />
                <i />
                <i />
              </span>
              <span>Simple monthly budgeting for everyday life.</span>
            </div>
          </div>
          <div className="hero-product">
            <div className="hero-orb orb-one" />
            <div className="hero-orb orb-two" />
            <div className="mini-dashboard">
              <div className="mini-side">
                <div className="mini-logo">
                  <span className="logo-mark">
                    <span />
                  </span>
                </div>
                <div className="mini-nav active" />
                <div className="mini-nav" />
                <div className="mini-nav" />
                <div className="mini-nav" />
                <div className="mini-nav" />
              </div>
              <div className="mini-main">
                <div className="mini-top">
                  <div>
                    <div className="mini-kicker">
                      Good afternoon, Aiman <span>👋</span>
                    </div>
                    <div className="mini-month">
                      August 2026 <ChevronDown size={10} />
                    </div>
                  </div>
                  <div className="mini-avatar">AS</div>
                </div>
                <div className="mini-stats">
                  <div>
                    <span>Monthly Income</span>
                    <b>RM 4,500</b>
                    <small>
                      +4.2% <ArrowUpRight size={8} />
                    </small>
                  </div>
                  <div>
                    <span>Total Spent</span>
                    <b>RM 2,750</b>
                    <small className="muted">61.1% used</small>
                  </div>
                  <div>
                    <span>Remaining Balance</span>
                    <b>RM 1,750</b>
                    <small className="green">38.9% left</small>
                  </div>
                </div>
                <div className="mini-graph">
                  <div className="graph-head">
                    <span>Salary usage</span>
                    <b>61%</b>
                  </div>
                  <div className="graph-line">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="graph-foot">
                    <span>RM 2,750 of RM 4,500 used</span>
                    <span>Healthy</span>
                  </div>
                </div>
                <div className="mini-lower">
                  <div className="mini-panel">
                    <span>Spending by category</span>
                    <div className="donut" />
                    <div className="donut-legend">
                      <i /> Housing <i /> Food <i /> Other
                    </div>
                  </div>
                  <div className="mini-panel budget-panel">
                    <span>Budget overview</span>
                    {[
                      ['Food & Dining', 70],
                      ['Transport', 46],
                      ['Shopping', 60],
                    ].map(([label, val]) => (
                      <div className="tiny-progress" key={label as string}>
                        <div>
                          <small>{label}</small>
                          <small>{val}%</small>
                        </div>
                        <span>
                          <i style={{ width: `${val}%` }} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="trust-strip wrap">
          <span>Everything you need to feel good about your money.</span>
          <div>
            <span>
              <Check size={15} /> Clear every month
            </span>
            <span>
              <Check size={15} /> Built for real life
            </span>
            <span>
              <Check size={15} /> Your data, your control
            </span>
          </div>
        </section>
        <section id="features" className="section wrap">
          <div className="section-intro">
            <span className="section-eyebrow">A calmer way to budget</span>
            <h2>
              All your money,
              <br />
              <em>in one clear view.</em>
            </h2>
            <p>
              SoftSpend keeps your salary, spending, bills and goals in one peaceful place — so you can make decisions
              with confidence.
            </p>
          </div>
          <div className="feature-grid">
            <Feature
              icon={WalletCards}
              title="Monthly Budgeting"
              text="Track exactly where your salary is allocated."
              tint="lavender"
            />
            <Feature
              icon={ListFilter}
              title="Expense Tracking"
              text="Record and categorize every purchase."
              tint="blue"
            />
            <Feature icon={Activity} title="Salary Usage" text="See how much of your income you've used." tint="mint" />
            <Feature icon={Target} title="Savings Goals" text="Turn plans into measurable progress." tint="peach" />
            <Feature icon={Bell} title="Bill Reminders" text="Never forget another payment." tint="yellow" />
            <Feature icon={Sparkles} title="Smart Insights" text="Understand your habits automatically." tint="lilac" />
            <Feature
              icon={FileSpreadsheet}
              title="Excel Import"
              text="Bring in your existing records in a few clicks."
              tint="blue"
            />
          </div>
        </section>
        <section id="how" className="how-band">
          <div className="wrap how-content">
            <div className="section-intro">
              <span className="section-eyebrow">Four steps to clarity</span>
              <h2>
                Small habits.
                <br />
                <em>Big difference.</em>
              </h2>
            </div>
            <div className="steps">
              <Step n="01" title="Add your income" text="Enter your monthly salary or other income." />
              <Step n="02" title="Create your budget" text="Decide how much you want to spend." />
              <Step n="03" title="Track expenses" text="Record your spending throughout the month." />
              <Step n="04" title="Improve your finances" text="Use insights to make better decisions." />
            </div>
          </div>
        </section>
        <section id="benefits" className="cta-section wrap">
          <div>
            <h2>
              Feel better about
              <br />
              <em>your next payday.</em>
            </h2>
            <p>Start building better money habits today. Your future self will thank you.</p>
            <button className="primary-button" onClick={onEnter}>
              Create Free Account <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="cta-art">
            <div className="art-card">
              <div className="art-top">
                <span>Monthly balance</span>
                <MoreHorizontal size={16} />
              </div>
              <strong>RM 1,750</strong>
              <div className="art-bar">
                <i />
              </div>
              <small>38.9% remaining</small>
              <div className="art-spark">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </section>
        <section id="faq" className="faq wrap">
          <div className="section-intro">
            <span className="section-eyebrow">Questions, answered</span>
            <h2>Good to know.</h2>
          </div>
          <div className="faq-list">
            {[
              'Is SoftSpend free?',
              'Is my financial data secure?',
              'Can I export my data?',
              'Can I use SoftSpend on my phone?',
              'Can I create my own spending categories?',
            ].map((q, i) => (
              <details key={q} open={i === 0}>
                <summary>
                  {q}
                  <Plus size={18} />
                </summary>
                <p>
                  {i === 0
                    ? 'Yes. SoftSpend is free to get started, with the essentials you need to build a healthy monthly money habit.'
                    : 'SoftSpend is designed to keep this part simple, transparent and in your control.'}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <div>
            <Logo />
            <p>
              Simple monthly budgeting
              <br />
              for everyday life.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <b>Product</b>
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#">Dashboard</a>
            </div>
            <div>
              <b>Company</b>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#faq">FAQ</a>
            </div>
            <div>
              <b>Legal</b>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
        <div className="wrap copyright">© 2026 SoftSpend. All rights reserved.</div>
      </footer>
    </div>
  )
}

function Feature({
  icon: Icon,
  title,
  text,
  tint,
}: {
  icon: React.ElementType
  title: string
  text: string
  tint: string
}) {
  return (
    <div className="feature">
      <div className={`feature-icon ${tint}`}>
        <Icon size={20} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <ArrowUpRight className="feature-arrow" size={18} />
    </div>
  )
}
function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="step">
      <span>{n}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  )
}

function AppShell({
  page,
  setPage,
  children,
  theme,
  setTheme,
  onLogout,
  profile,
}: {
  page: Page
  setPage: (p: Page) => void
  children: React.ReactNode
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
  onLogout: () => void
  profile: AppIdentity
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="side-logo">
          <Logo compact={collapsed} />
          <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}>
            <Menu size={18} />
          </button>
        </div>
        <div className="side-label">Workspace</div>
        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={page === id ? 'active' : ''}
              onClick={() => setPage(id)}
              title={collapsed ? label : ''}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === 'bills' && <b className="nav-dot">3</b>}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button onClick={() => setPage('settings')} className={page === 'settings' ? 'active' : ''}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="side-signout" onClick={onLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
          <button className="user-mini">
            <div className="avatar">{profile.initials}</div>
            <span>
              <strong>{profile.name}</strong>
              <small>{profile.email || 'Personal workspace'}</small>
            </span>
            <MoreHorizontal size={17} />
          </button>
        </div>
      </aside>
      <section className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setCollapsed(!collapsed)}>
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              Personal workspace <ChevronRight size={14} />{' '}
              <strong>{navItems.find((n) => n.id === page)?.label || 'Settings'}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-button search-trigger" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="icon-button notification-button">
              <Bell size={18} />
              <i />
            </button>
            <div className="top-avatar">{profile.initials}</div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </section>
      <nav className="mobile-nav">
        {navItems.slice(0, 5).map(({ id, label, icon: Icon }) => (
          <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}>
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
        <button onClick={() => setAddOpen(true)}>
          <MoreHorizontal size={19} />
          <span>More</span>
        </button>
      </nav>
      <button className="floating-add" onClick={() => setAddOpen(true)}>
        <Plus size={25} />
      </button>
      {searchOpen && (
        <div className="overlay" onClick={() => setSearchOpen(false)}>
          <div className="command" onClick={(e) => e.stopPropagation()}>
            <div className="command-input">
              <Search size={18} />
              <input autoFocus placeholder="Search transactions, bills, goals..." />
              <kbd>ESC</kbd>
            </div>
            <div className="command-hint">
              <Sparkles size={15} /> Try searching for “Netflix”
            </div>
          </div>
        </div>
      )}
      {addOpen && (
        <div className="overlay" onClick={() => setAddOpen(false)}>
          <div className="quick-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-head">
              <div>
                <span className="section-eyebrow">Quick actions</span>
                <h2>What would you like to do?</h2>
              </div>
              <button className="icon-button" onClick={() => setAddOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="quick-grid">
              {[
                { label: 'Add Expense', icon: ArrowDownRight, tint: 'peach', page: 'transactions' },
                { label: 'Add Income', icon: ArrowUpRight, tint: 'mint', page: 'transactions' },
                { label: 'Create Budget', icon: WalletCards, tint: 'lavender', page: 'budgets' },
                { label: 'Add Bill', icon: CalendarDays, tint: 'yellow', page: 'bills' },
                { label: 'Create Goal', icon: Target, tint: 'blue', page: 'goals' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setPage(item.page as Page)
                    setAddOpen(false)
                  }}
                >
                  <span className={`quick-icon ${item.tint}`}>
                    <item.icon size={19} />
                  </span>
                  <span>{item.label}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <button className="logout-fake" onClick={onLogout}>
        <LogOut size={15} /> Sign out
      </button>
    </div>
  )
}

function PageHeader({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string
  title: React.ReactNode
  text?: string
  action?: React.ReactNode
}) {
  const showExcelImport = title === 'Reports'
  return (
    <div className="page-header">
      <div>
        <span className="section-eyebrow">{eyebrow || 'Overview'}</span>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      <div className="page-header-actions">
        {showExcelImport && <ExcelImportInline />}
        {action}
      </div>
    </div>
  )
}
function ExcelImportInline() {
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<string[][]>([])
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [imported, setImported] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const parseFile = async (file?: File) => {
    if (!file) return
    setError('')
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setError('Please choose an Excel file (.xlsx, .xls or .csv).')
      setOpen(true)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Files must be smaller than 10 MB.')
      setOpen(true)
      return
    }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const parsed = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' }) as string[][]
      if (parsed.length < 2) {
        setError('This sheet needs a header row and at least one data row.')
        setOpen(true)
        return
      }
      setFileName(file.name)
      setRows(parsed.slice(0, 7))
      setOpen(true)
    } catch {
      setError('We could not read this workbook. Try exporting it as .xlsx and upload again.')
      setOpen(true)
    }
  }
  const confirmImport = () => {
    setImported(true)
    setOpen(false)
    setTimeout(() => setImported(false), 3000)
  }
  return (
    <>
      <label className="ghost-button import-button">
        <Upload size={16} /> Import Excel
        <input
          ref={inputRef}
          className="file-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => parseFile(e.target.files?.[0])}
        />
      </label>
      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="section-eyebrow">Bring your records with you</span>
                <h2>Import Excel data</h2>
              </div>
              <button className="icon-button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {error ? (
              <div className="import-error">
                <FileSpreadsheet size={20} />
                <div>
                  <strong>Upload could not be completed</strong>
                  <p>{error}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="import-file">
                  <div className="file-icon">
                    <FileSpreadsheet size={19} />
                  </div>
                  <div>
                    <strong>{fileName}</strong>
                    <span>{Math.max(rows.length - 1, 0)} rows detected · first sheet</span>
                  </div>
                  <FileCheck size={19} className="file-check" />
                </div>
                <div className="import-preview">
                  <div className="preview-head">
                    <span>Preview</span>
                    <small>Showing up to 6 rows</small>
                  </div>
                  <div className="preview-table">
                    {rows[0]?.map((header, index) => (
                      <div className="preview-row" key={index}>
                        <strong>{header || `Column ${index + 1}`}</strong>
                        <span>{rows[1]?.[index] || '—'}</span>
                        {rows[2] && <span>{rows[2][index] || '—'}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="import-note">
                  SoftSpend will map common columns like Date, Description, Category, Amount and Type. You can review
                  imported transactions afterwards.
                </p>
                <button className="primary-button full" onClick={confirmImport}>
                  Import {Math.max(rows.length - 1, 0)} rows <Check size={17} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {imported && (
        <div className="toast">
          <Check size={16} /> Excel data imported successfully.
        </div>
      )}
    </>
  )
}

export { AppShell, ExcelImportInline, Logo, PageHeader }
