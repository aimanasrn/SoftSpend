// @ts-nocheck
import React, { useState } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  ListFilter,
  Menu,
  MoreHorizontal,
  Plus,
  Sparkles,
  Target,
  WalletCards,
  X,
} from 'lucide-react'
import { Logo } from '../layout/AppShell'
import { Aurora } from '../reactbits/Aurora'
import { BlurText } from '../reactbits/BlurText'
import { ScrollReveal } from '../reactbits/ScrollReveal'
import Scanner from '../reactbits/Scanner'
import { ShinyText } from '../reactbits/ShinyText'

function Landing({ onEnter }: { onEnter: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const enterAuth = () => {
    setMobileMenuOpen(false)
    onEnter()
  }

  return (
    <div className="landing">
      <header className="landing-nav wrap">
        <Logo />
        <nav>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
        </nav>
        <div className="nav-actions">
          <button className="text-button" onClick={enterAuth}>
            Login
          </button>
          <button className="primary-button small" onClick={enterAuth}>
            Get Started <ChevronRight size={16} />
          </button>
        </div>
        <button
          className={`mobile-icon ${mobileMenuOpen ? 'active' : ''}`}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {mobileMenuOpen && (
          <div className="landing-mobile-menu">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <div className="landing-mobile-actions">
              <button className="text-button" onClick={enterAuth}>Login</button>
              <button className="primary-button small" onClick={enterAuth}>
                Get Started <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </header>
      <main>
        <section className="hero">
          <Scanner
            className="hero-scanner"
            color1="#766cf0"
            color2="#b7a6ff"
            color3="#fff"
            speed={0.6}
            opacity={0.65}
            mouseInteraction
          />
          <div className="hero-inner wrap">
          <div className="hero-copy">
            <div className="hero-title" role="heading" aria-level={1}>
              <BlurText text="Take control" delay={70} />
              <div className="hero-title-line">
                <BlurText text="of your" delay={95} /> <em>money.</em>
              </div>
            </div>
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
              <ShinyText
                text="Simple monthly budgeting for everyday life."
                className="hero-shiny-text"
                speed={4.8}
                color="#778092"
                shineColor="#8b80f9"
                pauseOnHover
              />
            </div>
          </div>
          <div className="hero-product">
            <Aurora className="hero-aurora" />
            <div className="hero-orb orb-one" />
            <div className="hero-orb orb-two" />
            <div className="hero-dashboard-float">
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
          </div>
          </div>
        </section>
        <ScrollReveal className="trust-strip wrap" distance={18}>
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
        </ScrollReveal>
        <section id="features" className="section wrap">
          <ScrollReveal className="section-intro">
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
          </ScrollReveal>
          <ScrollReveal className="feature-grid" delay={0.08} distance={22}>
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
          </ScrollReveal>
        </section>
        <section id="how" className="how-band">
          <ScrollReveal className="wrap how-content">
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
          </ScrollReveal>
        </section>
        <ScrollReveal id="pricing" className="pricing-section wrap" distance={24}>
          <div className="pricing-intro">
            <span className="section-eyebrow">Simple pricing</span>
            <h2>
              Start free.
              <br />
              <em>Grow with clarity.</em>
            </h2>
            <p>Use the essentials for free, then unlock deeper insights and shared planning when you need them.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="price-card-top">
                <div>
                  <span className="price-label">For your everyday money</span>
                  <h3>Free</h3>
                </div>
                <span className="price-amount">RM 0</span>
              </div>
              <p className="price-description">Everything you need to build a steady monthly money habit.</p>
              <div className="price-list">
                {['Unlimited Dashboard', 'Unlimited Budgets', 'Unlimited Transactions'].map((item) => (
                  <span key={item}><Check size={15} /> {item}</span>
                ))}
              </div>
              <button className="ghost-button price-button" onClick={onEnter}>Start free <ArrowRight size={15} /></button>
            </div>
            <div className="price-card featured">
              <div className="popular-label">Most popular</div>
              <div className="price-card-top">
                <div>
                  <span className="price-label">For deeper clarity</span>
                  <h3>SoftSpend Pro</h3>
                </div>
                <span className="price-amount">RM 9.90<small>/ month</small></span>
              </div>
              <p className="price-description">Unlock the tools that make planning, sharing, and understanding your money easier.</p>
              <div className="price-list">
                {['Everything in Free', 'Household sharing', 'Excel import & downloadable reports', 'Goals and advanced analytics'].map((item) => (
                  <span key={item}><Check size={15} /> {item}</span>
                ))}
              </div>
              <button className="primary-button price-button" onClick={onEnter}>Upgrade to Pro <ArrowUpRight size={16} /></button>
              <small className="price-note">Create your account first. Upgrade anytime from Settings.</small>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal id="benefits" className="cta-section wrap" distance={24}>
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
        </ScrollReveal>
        <section id="faq" className="faq wrap">
          <ScrollReveal className="section-intro">
            <span className="section-eyebrow">Questions, answered</span>
            <h2>Good to know.</h2>
          </ScrollReveal>
          <ScrollReveal className="faq-list" delay={0.08} distance={20}>
            {[
              ['Is SoftSpend free?', 'Yes. Free includes unlimited Dashboard, Budgets, and Transactions.'],
              ['What does Pro include?', 'Pro unlocks Household sharing, Excel import, Reports, Goals, and advanced Analytics.'],
              ['Can I upgrade later?', 'Yes. Start free and upgrade anytime from Settings when you need the extra tools.'],
              ['Is my financial data secure?', 'Your account is protected by Supabase authentication, and your data stays connected to your own account.'],
              ['Can I cancel Pro?', 'Yes. You can manage or cancel your monthly subscription through the billing portal.'],
            ].map(([q, answer], i) => (
              <details key={q} open={i === 0}>
                <summary>
                  {q}
                  <Plus size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </ScrollReveal>
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
              <a href="#pricing">Pricing</a>
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

export { Feature, Landing, Step }
