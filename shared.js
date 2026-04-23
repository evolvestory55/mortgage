/* ============================================================
   MORTGAGE & LOANS — SHARED JAVASCRIPT
   ============================================================ */

window.MT_CONFIG = {
  webhookUrl: "",
  emailGateEnabled: false,
  currentMarketRate: 6.75,
  currentMarketRateDate: "2026-01",
  conformingLimit: 806500,
  conformingHighCostLimit: 1209750,
  locale: "en-US",
  currency: "USD",
  siteName: "Mortgage & Loans"
};

window.MT_RATES = {
  "_meta": { "lastUpdated": "2026-01-16", "version": "2026.01.16.v1", "schemaVersion": "1.0" },
  "mortgageRates": { "rate30yr": 6.75, "rate15yr": 6.10, "rate5_1arm": 6.20, "weekOf": "2026-01-16", "source": "Freddie Mac PMMS" },
  "loanLimits": { "year": 2026, "conformingStandard": 806500, "conformingHighCost": 1209750 },
  "fhaMip": { "upfrontPercent": 1.75, "annual": { "term_30yr": { "ltv_over_95": 0.85, "ltv_90_to_95": 0.80, "ltv_85_to_90": 0.80, "ltv_under_85": 0.55 }, "term_15yr": { "ltv_over_90": 0.70, "ltv_78_to_90": 0.50, "ltv_under_78": 0.15 } }, "cancellationRules": { "down_10_percent_plus": "Cancels after 11 years", "down_under_10_percent": "Life of loan" } },
  "vaFundingFee": { "firstUse": { "down_0_to_5_percent": 2.15, "down_5_to_10_percent": 1.50, "down_10_percent_plus": 1.25 }, "subsequentUse": { "down_0_to_5_percent": 3.30, "down_5_to_10_percent": 1.50, "down_10_percent_plus": 1.50 }, "reservistFirstUse": { "down_0_to_5_percent": 2.40, "down_5_to_10_percent": 1.75, "down_10_percent_plus": 1.50 }, "exemptions": "Service-connected disability of 10%+" },
  "usdaFees": { "upfrontGuaranteeFeePercent": 1.00, "annualFeePercent": 0.35 },
  "taxData": { "year": 2026, "tcjaStatus": "extended", "standardDeduction": { "single": 15750, "marriedFilingJointly": 31500, "marriedFilingSeparately": 15750, "headOfHousehold": 23625, "percentageWhoItemize": 13 }, "capitalGainsExclusion": { "single": 250000, "marriedFilingJointly": 500000, "longTermCapGainsRate_typical": 0.15 } },
  "homePrices": { "nationalMedian": 407200, "asOf": "2025-11", "yoyChangePercent": 4.8 },
  "pmiRates": { "table": { "ltv_80_to_85": { "score_760plus": 0.19, "score_720_759": 0.22, "score_700_719": 0.25, "score_680_699": 0.30, "score_660_679": 0.42, "score_640_659": 0.48, "score_below_640": 0.55 }, "ltv_85_to_90": { "score_760plus": 0.30, "score_720_759": 0.38, "score_700_719": 0.45, "score_680_699": 0.60, "score_660_679": 0.68, "score_640_659": 0.72, "score_below_640": 0.78 }, "ltv_90_to_95": { "score_760plus": 0.45, "score_720_759": 0.58, "score_700_719": 0.65, "score_680_699": 0.78, "score_660_679": 0.88, "score_640_659": 0.95, "score_below_640": 1.00 }, "ltv_95_plus": { "score_760plus": 0.58, "score_720_759": 0.70, "score_700_719": 0.80, "score_680_699": 1.00, "score_660_679": 1.20, "score_640_659": 1.35, "score_below_640": 1.50 } }, "cancellationRules": { "automatic": "LTV 78% original schedule", "requested": "LTV 80% current appraised value" } },
  "studentLoanDTI": { "fannieMae_2023plus": "Use actual payment; if $0, count as $0", "freddieMac": "Use 0.5% of balance if payment is $0", "fha": "Always use 0.5% of balance", "va": "Use actual payment; if $0, count as $0" }
};

async function loadRates() {
  if (window.location.protocol === 'file:') { applyRates(window.MT_RATES); return; }
  try { const r = await fetch('rates.json'); if (!r.ok) throw new Error(); const rates = await r.json(); window.MT_RATES = rates; applyRates(rates); } catch (e) { applyRates(window.MT_RATES); }
}
function applyRates(rates) { if (!rates) return; if (rates.mortgageRates) { MT_CONFIG.currentMarketRate = rates.mortgageRates.rate30yr; MT_CONFIG.currentMarketRateDate = rates.mortgageRates.weekOf; } if (rates.loanLimits) { MT_CONFIG.conformingLimit = rates.loanLimits.conformingStandard; MT_CONFIG.conformingHighCostLimit = rates.loanLimits.conformingHighCost; } }
function showFallbackBanner() { const el = document.getElementById('rates-fallback-banner'); if (el) el.style.display = 'flex'; }

function formatCurrency(amount) { return new Intl.NumberFormat(MT_CONFIG.locale, { style: 'currency', currency: MT_CONFIG.currency, maximumFractionDigits: 0 }).format(amount); }
function formatCurrencyDecimal(amount) { return new Intl.NumberFormat(MT_CONFIG.locale, { style: 'currency', currency: MT_CONFIG.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount); }
function formatPercent(value, decimals) { return value.toFixed(decimals !== undefined ? decimals : 2) + '%'; }
function formatNumber(n) { return new Intl.NumberFormat(MT_CONFIG.locale).format(n); }
function debounce(fn, delay) { let timer; return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); }; }

const STATE_KEY_PREFIX = 'mt_state_';
function saveState(toolName, stateObj) { try { sessionStorage.setItem(STATE_KEY_PREFIX + toolName, JSON.stringify(stateObj)); } catch(e) {} }
function loadState(toolName) { try { const s = sessionStorage.getItem(STATE_KEY_PREFIX + toolName); return s ? JSON.parse(s) : null; } catch(e) { return null; } }
function safeParamNumber(value, min, max) { const n = parseFloat(value); if (isNaN(n) || !isFinite(n)) return null; if (min !== undefined && n < min) return null; if (max !== undefined && n > max) return null; return n; }
function getUrlParam(name) { return new URLSearchParams(window.location.search).get(name); }
function track(event, props) { if (typeof gtag !== 'undefined') { gtag('event', event, props); } if (location.hostname === 'localhost') { console.log('[Analytics]', event, props); } }

function getRate(path) { if (!window.MT_RATES) return null; const parts = path.split('.'); let obj = window.MT_RATES; for (const p of parts) { if (obj == null) return null; obj = obj[p]; } return obj; }

function getPMIRate(creditScore, ltv) {
  const rates = getRate('pmiRates.table'); if (!rates) return 0.5;
  let ltvBand; if (ltv <= 85) ltvBand = 'ltv_80_to_85'; else if (ltv <= 90) ltvBand = 'ltv_85_to_90'; else if (ltv <= 95) ltvBand = 'ltv_90_to_95'; else ltvBand = 'ltv_95_plus';
  let scoreBand; if (creditScore >= 760) scoreBand = 'score_760plus'; else if (creditScore >= 720) scoreBand = 'score_720_759'; else if (creditScore >= 700) scoreBand = 'score_700_719'; else if (creditScore >= 680) scoreBand = 'score_680_699'; else if (creditScore >= 660) scoreBand = 'score_660_679'; else if (creditScore >= 640) scoreBand = 'score_640_659'; else scoreBand = 'score_below_640';
  const band = rates[ltvBand]; return band ? band[scoreBand] : 0.5;
}

function getFHAAnnualMIP(ltv, termYears) {
  const mipData = getRate('fhaMip.annual'); if (!mipData) return 0.85;
  const termKey = termYears <= 15 ? 'term_15yr' : 'term_30yr'; const termData = mipData[termKey]; if (!termData) return 0.85;
  if (termYears <= 15) { if (ltv < 78) return termData.ltv_under_78; if (ltv <= 90) return termData.ltv_78_to_90; return termData.ltv_over_90; }
  else { if (ltv < 85) return termData.ltv_under_85; if (ltv <= 90) return termData.ltv_85_to_90; if (ltv <= 95) return termData.ltv_90_to_95; return termData.ltv_over_95; }
}

function getVAFundingFee(downPct, isFirstUse, isReservist) {
  const feeData = getRate('vaFundingFee'); if (!feeData) return 2.15;
  let table; if (isReservist) table = feeData.reservistFirstUse; else if (isFirstUse) table = feeData.firstUse; else table = feeData.subsequentUse; if (!table) return 2.15;
  if (downPct >= 10) return table['down_10_percent_plus']; if (downPct >= 5) return table['down_5_to_10_percent']; return table['down_0_to_5_percent'];
}

function calculateMortgage(principal, annualRate, termYears) {
  const monthlyRate = annualRate / 100 / 12; const numPayments = termYears * 12;
  if (monthlyRate === 0) return { monthlyPayment: principal / numPayments, totalPayment: principal, totalInterest: 0 };
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalPayment = monthlyPayment * numPayments;
  return { monthlyPayment, totalPayment, totalInterest: totalPayment - principal };
}

function generateAmortization(principal, annualRate, termYears, extraMonthly) {
  const monthlyRate = annualRate / 100 / 12; const numPayments = termYears * 12; const base = calculateMortgage(principal, annualRate, termYears); const schedule = [];
  let balance = principal, totalInterest = 0, totalPrincipal = 0, month = 0;
  while (balance > 0.01 && month < numPayments * 2) { month++; const intP = balance * monthlyRate; let prinP = base.monthlyPayment - intP + (extraMonthly || 0); if (prinP > balance) prinP = balance; balance -= prinP; if (balance < 0) balance = 0; totalInterest += intP; totalPrincipal += prinP; schedule.push({ month, payment: prinP + intP, principal: prinP, interest: intP, totalInterest, balance }); }
  return { schedule, totalInterest, totalPrincipal, months: month };
}

function countUp(element, start, end, duration, prefix, suffix) { prefix = prefix || ''; suffix = suffix || ''; duration = duration || 1500; const st = performance.now(); function update(ct) { const p = Math.min((ct - st) / duration, 1); const e = 1 - Math.pow(1 - p, 3); element.textContent = prefix + formatNumber(Math.round(start + (end - start) * e)) + suffix; if (p < 1) requestAnimationFrame(update); } requestAnimationFrame(update); }

function initChartDefaults() { if (typeof Chart === 'undefined') return; Chart.defaults.color = '#8B9DC3'; Chart.defaults.borderColor = 'rgba(45,126,255,0.12)'; Chart.defaults.font.family = "'DM Sans', sans-serif"; Chart.defaults.animation.duration = 1200; Chart.defaults.animation.easing = 'easeInOutQuart'; }
function createGradient(ctx, c1, c2) { const g = ctx.createLinearGradient(0, 0, 0, 350); g.addColorStop(0, c1); g.addColorStop(1, c2); return g; }

function initScrollAnimations() {
  const obs = new IntersectionObserver((entries) => { entries.forEach((entry, i) => { if (entry.isIntersecting) { setTimeout(() => entry.target.classList.add('animate-in'), i * 80); obs.unobserve(entry.target); } }); }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
}

function initRipple() { document.addEventListener('click', (e) => { const btn = e.target.closest('.btn'); if (!btn) return; const r = document.createElement('span'); r.className = 'ripple'; const rect = btn.getBoundingClientRect(); const s = Math.max(rect.width, rect.height); r.style.width = r.style.height = s + 'px'; r.style.left = (e.clientX - rect.left - s / 2) + 'px'; r.style.top = (e.clientY - rect.top - s / 2) + 'px'; btn.appendChild(r); setTimeout(() => r.remove(), 600); }); }

function initNavbarScroll() { const n = document.querySelector('.navbar'); if (!n) return; window.addEventListener('scroll', () => { n.classList.toggle('scrolled', window.scrollY > 50); }, { passive: true }); }

function initMobileNav() { const t = document.querySelector('.navbar-toggle'); const n = document.querySelector('.navbar-nav'); if (!t || !n) return; t.addEventListener('click', () => { t.classList.toggle('open'); n.classList.toggle('open'); }); n.querySelectorAll('.nav-link').forEach(a => { a.addEventListener('click', () => { t.classList.remove('open'); n.classList.remove('open'); }); }); }

function setActiveNav() { const cp = window.location.pathname.split('/').pop() || 'index.html'; document.querySelectorAll('.nav-link').forEach(a => { if (a.getAttribute('href') === cp) a.classList.add('active'); }); }

function initAccordions() { document.querySelectorAll('.accordion-header').forEach(h => { h.addEventListener('click', () => { h.classList.toggle('open'); const b = h.nextElementSibling; if (b) b.classList.toggle('open'); }); }); }

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll(); initMobileNav(); setActiveNav(); initAccordions(); initScrollAnimations(); initRipple(); initChartDefaults(); loadRates();
});
