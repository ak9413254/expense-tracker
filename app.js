Chart.defaults.animation = false

const state = {
  data: null,
  calculatorExpression: "0",
  calculatorOpen: false,
  greetingTimer: null,
  openSection: "",
  financeView: localStorage.getItem("financeView") || "transactions",
  loanView: "calculator",
  transactionMode: "transaction",
  activityOpen: false,
  filters: {
    search: "",
    dateFrom: "",
    dateTo: "",
  },
  charts: {
    cashflow: null,
    category: null,
    budget: null,
  },
}

const refs = {
  toastStack: document.getElementById("toastStack"),
  topbarTitle: document.getElementById("topbarTitle"),
  topbarSubtitle: document.getElementById("topbarSubtitle"),
  welcomeGreeting: document.getElementById("welcomeGreeting"),
  welcomeClock: document.getElementById("welcomeClock"),
  calculatorToggleBtn: document.getElementById("calculatorToggleBtn"),
  quickCalculator: document.getElementById("quickCalculator"),
  closeCalculatorBtn: document.getElementById("closeCalculatorBtn"),
  calculatorDisplay: document.getElementById("calculatorDisplay"),
  scrollTopBtn: document.getElementById("scrollTopBtn"),
  sessionPill: document.getElementById("sessionPill"),
  overviewQuickLink: document.getElementById("overviewQuickLink"),
  dashboardQuickLink: document.getElementById("dashboardQuickLink"),
  workspaceTabs: document.querySelectorAll(".workspace-tab"),
  userInitials: document.getElementById("userInitials"),
  userName: document.getElementById("userName"),
  userRole: document.getElementById("userRole"),
  userEmail: document.getElementById("userEmail"),
  logoutBtn: document.getElementById("logoutBtn"),
  balanceValue: document.getElementById("balanceValue"),
  incomeValue: document.getElementById("incomeValue"),
  expenseValue: document.getElementById("expenseValue"),
  topCategoryValue: document.getElementById("topCategoryValue"),
  budgetAlertValue: document.getElementById("budgetAlertValue"),
  incomeCountText: document.getElementById("incomeCountText"),
  expenseCountText: document.getElementById("expenseCountText"),
  dashboardSubtitle: document.getElementById("dashboardSubtitle"),
  dashboardSessionStatus: document.getElementById("dashboardSessionStatus"),
  dashboardSessionMeta: document.getElementById("dashboardSessionMeta"),
  dashboardRoleLabel: document.getElementById("dashboardRoleLabel"),
  dashboardRole: document.getElementById("dashboardRole"),
  dashboardRoleMeta: document.getElementById("dashboardRoleMeta"),
  dashboardUsersLabel: document.getElementById("dashboardUsersLabel"),
  dashboardUsersValue: document.getElementById("dashboardUsersValue"),
  dashboardUsersMeta: document.getElementById("dashboardUsersMeta"),
  assetsValue: document.getElementById("assetsValue"),
  transactionsTab: document.getElementById("transactionsTab"),
  incomeTab: document.getElementById("incomeTab"),
  expenseTab: document.getElementById("expenseTab"),
  searchInput: document.getElementById("searchInput"),
  dateFromInput: document.getElementById("dateFromInput"),
  dateToInput: document.getElementById("dateToInput"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  transactionsPanel: document.getElementById("transactionsPanel"),
  incomePanel: document.getElementById("incomePanel"),
  expensePanel: document.getElementById("expensePanel"),
  transactionsMeta: document.getElementById("transactionsMeta"),
  incomeMeta: document.getElementById("incomeMeta"),
  expenseMeta: document.getElementById("expenseMeta"),
  addTransactionBtn: document.getElementById("addTransactionBtn"),
  addIncomeBtn: document.getElementById("addIncomeBtn"),
  addExpenseBtn: document.getElementById("addExpenseBtn"),
  transactionTableBody: document.getElementById("transactionTableBody"),
  incomeList: document.getElementById("incomeList"),
  expenseList: document.getElementById("expenseList"),
  assetsChip: document.getElementById("assetsChip"),
  addAccountBtn: document.getElementById("addAccountBtn"),
  accountsGrid: document.getElementById("accountsGrid"),
  addBudgetBtn: document.getElementById("addBudgetBtn"),
  budgetList: document.getElementById("budgetList"),
  addGoalBtn: document.getElementById("addGoalBtn"),
  goalsGrid: document.getElementById("goalsGrid"),
  goalsChip: document.getElementById("goalsChip"),
  usersChip: document.getElementById("usersChip"),
  addUserBtn: document.getElementById("addUserBtn"),
  adminMessage: document.getElementById("adminMessage"),
  adminStats: document.getElementById("adminStats"),
  adminQuickLink: document.getElementById("adminQuickLink"),
  adminPanel: document.getElementById("admin"),
  userWorkspace: document.getElementById("userWorkspace"),
  userWorkspaceLogin: document.getElementById("userWorkspaceLogin"),
  userWorkspaceLogout: document.getElementById("userWorkspaceLogout"),
  userWorkspaceId: document.getElementById("userWorkspaceId"),
  userRemarksInput: document.getElementById("userRemarksInput"),
  saveUserRemarksBtn: document.getElementById("saveUserRemarksBtn"),
  loanAmountInput: document.getElementById("loanAmountInput"),
  loanRateInput: document.getElementById("loanRateInput"),
  loanMonthsInput: document.getElementById("loanMonthsInput"),
  loanIncomeInput: document.getElementById("loanIncomeInput"),
  loanExpenseInput: document.getElementById("loanExpenseInput"),
  loanExistingEmiInput: document.getElementById("loanExistingEmiInput"),
  analyzeLoanBtn: document.getElementById("analyzeLoanBtn"),
  resetLoanBtn: document.getElementById("resetLoanBtn"),
  loanDetailsTableBody: document.getElementById("loanDetailsTableBody"),
  loanAnalysisOutput: document.getElementById("loanAnalysisOutput"),
  loanTabs: document.querySelectorAll(".loan-tab"),
  loanPanels: document.querySelectorAll(".loan-panel"),
  usersGrid: document.getElementById("usersGrid"),
  activityToggleBtn: document.getElementById("activityToggleBtn"),
  activityLog: document.getElementById("activityLog"),
  editProfileBtn: document.getElementById("editProfileBtn"),
  profileSubtitle: document.getElementById("profileSubtitle"),
  profilePanel: document.getElementById("profilePanel"),
  transactionModal: document.getElementById("transactionModal"),
  transactionModalTitle: document.getElementById("transactionModalTitle"),
  closeTransactionModal: document.getElementById("closeTransactionModal"),
  transactionForm: document.getElementById("transactionForm"),
  transactionId: document.getElementById("transactionId"),
  transactionDate: document.getElementById("transactionDate"),
  transactionCategory: document.getElementById("transactionCategory"),
  transactionAmount: document.getElementById("transactionAmount"),
  transactionModeHint: document.getElementById("transactionModeHint"),
  entityModal: document.getElementById("entityModal"),
  entityModalTitle: document.getElementById("entityModalTitle"),
  closeEntityModal: document.getElementById("closeEntityModal"),
  entityForm: document.getElementById("entityForm"),
  entityType: document.getElementById("entityType"),
  entityId: document.getElementById("entityId"),
  entityFields: document.getElementById("entityFields"),
  financeTabs: document.querySelectorAll(".finance-tab"),
  financeLinks: document.querySelectorAll(".finance-link"),
  financePanels: document.querySelectorAll(".finance-panel"),
  financeSummaryLinks: document.querySelectorAll("[data-finance-target]"),
  sectionLinks: document.querySelectorAll("[data-section-target]"),
  detailSections: document.querySelectorAll("[data-section-id]"),
  entitySections: document.getElementById("entitySections"),
  profileSections: document.getElementById("profileSections"),
  calculatorButtons: document.querySelectorAll("[data-calc-value], [data-calc-action]"),
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleString("en-IN", { month: "short", year: "numeric" })
}

function formatDateLabel(dateValue) {
  if (!dateValue) {
    return "-"
  }

  const [year, month, day] = String(dateValue).split("-")
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return date.toLocaleString("en-IN", { day: "numeric", month: "short" })
}

function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function normalizeDateValue(value) {
  if (!value) {
    return ""
  }

  const text = String(value)
  const match = text.match(/\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : ""
}

function normalizedFilterRange() {
  let dateFrom = normalizeDateValue(state.filters.dateFrom)
  let dateTo = normalizeDateValue(state.filters.dateTo)

  if (dateFrom && dateTo && dateFrom > dateTo) {
    ;[dateFrom, dateTo] = [dateTo, dateFrom]
  }

  return { dateFrom, dateTo }
}

function hasActiveFinanceFilters() {
  const { dateFrom, dateTo } = normalizedFilterRange()
  return Boolean(state.filters.search.trim() || dateFrom || dateTo)
}

function showToast(message, kind = "info") {
  const toast = document.createElement("div")
  toast.className = `toast ${kind}`
  toast.textContent = message
  refs.toastStack.appendChild(toast)
  setTimeout(() => toast.remove(), 2800)
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options)
  const data = await response.json()

  if (!response.ok) {
    if (response.status === 401 && data.redirect) {
      window.location.href = data.redirect
      return null
    }
    throw new Error(data.message || "Request failed.")
  }

  return data
}

function renderIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons()
  }
}

function iconMarkup(name) {
  return `<i data-lucide="${name}" aria-hidden="true"></i>`
}

function buttonContent(iconName, label) {
  return `${iconMarkup(iconName)}<span>${label}</span>`
}

function financeTabContent(iconName, label, count) {
  return `${iconMarkup(iconName)}<span>${label}</span><strong class="tab-count">${count}</strong>`
}

function sectionGroupForWorkspace(sectionId) {
  if (!sectionId) {
    return "overview"
  }

  if (["finance", "accounts"].includes(sectionId)) {
    return "cashflow"
  }

  if (["analytics", "budgets", "goals", "emi"].includes(sectionId)) {
    return "planning"
  }

  return "workspace"
}

function currentUser() {
  return state.data?.user || {}
}

function isAdmin() {
  return (currentUser().role || "").toLowerCase() === "admin"
}

function greetingLabel(hour) {
  if (hour < 12) {
    return "Good Morning"
  }
  if (hour < 17) {
    return "Good Afternoon"
  }
  if (hour < 21) {
    return "Good Evening"
  }
  return "Good Night"
}

function renderWelcomeMessage() {
  const now = new Date()
  const user = currentUser()
  refs.welcomeGreeting.textContent = `${greetingLabel(now.getHours())}, ${user.name || "User"}`
  refs.welcomeClock.textContent = now.toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function startGreetingClock() {
  if (state.greetingTimer) {
    clearInterval(state.greetingTimer)
  }
  renderWelcomeMessage()
  state.greetingTimer = setInterval(renderWelcomeMessage, 60000)
}

function updateScrollTopButton() {
  refs.scrollTopBtn.classList.toggle("visible", window.scrollY > 280)
}

function remarksStorageKey() {
  return `expense-tracker-remarks:${currentUser().id || "guest"}`
}

function loanStorageKey() {
  return `expense-tracker-loan:${currentUser().id || "guest"}`
}

function loanViewStorageKey() {
  return `expense-tracker-loan-view:${currentUser().id || "guest"}`
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

function defaultLoanInputs() {
  return {
    amount: "",
    annualRate: "",
    months: "",
    income: "",
    expenses: "",
    existingEmi: "",
  }
}

function updateCalculatorDisplay() {
  refs.calculatorDisplay.value = state.calculatorExpression || "0"
}

function setCalculatorOpen(open, scrollIntoView = false) {
  state.calculatorOpen = open
  refs.quickCalculator.hidden = !open
  refs.calculatorToggleBtn.innerHTML = buttonContent("calculator", open ? "Hide Calculator" : "Calculator")

  if (open) {
    triggerSectionReveal(refs.quickCalculator)
  }

  if (scrollIntoView && open) {
    refs.quickCalculator.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  renderIcons()
}

const interactiveSurfaceSelector = [
  ".summary-card",
].join(", ")

function reducedMotionEnabled() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function resetInteractiveSurface(surface) {
  surface.style.setProperty("--rx", "0deg")
  surface.style.setProperty("--ry", "0deg")
  surface.style.setProperty("--mx", "50%")
  surface.style.setProperty("--my", "50%")
  surface.classList.remove("is-tilting")
}

function bindInteractiveSurface(surface) {
  if (!surface || surface.dataset.interactiveBound === "true") {
    return
  }

  surface.dataset.interactiveBound = "true"
  surface.classList.add("interactive-surface")
  resetInteractiveSurface(surface)

  surface.addEventListener("pointermove", (event) => {
    if (reducedMotionEnabled() || window.innerWidth < 981 || !event.isPrimary) {
      return
    }

    const rect = surface.getBoundingClientRect()
    if (!rect.width || !rect.height) {
      return
    }

    const px = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    const py = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1)
    const rotateY = ((px - 0.5) * 10).toFixed(2)
    const rotateX = ((0.5 - py) * 10).toFixed(2)

    surface.style.setProperty("--rx", `${rotateX}deg`)
    surface.style.setProperty("--ry", `${rotateY}deg`)
    surface.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`)
    surface.style.setProperty("--my", `${(py * 100).toFixed(1)}%`)
    surface.classList.add("is-tilting")
  })

  const reset = () => resetInteractiveSurface(surface)
  surface.addEventListener("pointerleave", reset)
  surface.addEventListener("pointerup", reset)
  surface.addEventListener("blur", reset)
}

function activateInteractiveSurfaces() {
  document.querySelectorAll(interactiveSurfaceSelector).forEach(bindInteractiveSurface)
}

function triggerSectionReveal(element) {
  if (!element || reducedMotionEnabled()) {
    return
  }

  element.classList.remove("panel-reveal")
  void element.offsetWidth
  element.classList.add("panel-reveal")

  window.setTimeout(() => {
    element.classList.remove("panel-reveal")
  }, 460)
}

function hideAllDetailSections() {
  refs.detailSections.forEach((section) => {
    section.hidden = true
  })
  refs.entitySections.hidden = true
  refs.profileSections.hidden = true
  refs.sectionLinks.forEach((link) => {
    if (link.classList.contains("finance-link")) {
      return
    }
    link.classList.remove("active")
  })
  syncFinanceLinks()
  syncWorkspaceTabs()
}

function syncFinanceLinks() {
  refs.financeLinks.forEach((link) => {
    const isActive = state.openSection === "finance" && link.dataset.target === state.financeView
    link.classList.toggle("active", isActive)
  })
}

function syncWorkspaceTabs() {
  const activeGroup = sectionGroupForWorkspace(state.openSection)
  refs.workspaceTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.workspaceTarget === activeGroup)
  })
}

function openWorkspaceView(view) {
  if (view === "overview") {
    setOpenSection("")
    document.getElementById("overview").scrollIntoView({ behavior: "smooth", block: "start" })
    return
  }

  if (view === "cashflow") {
    setOpenSection("finance", true)
    return
  }

  if (view === "planning") {
    const section = ["analytics", "budgets", "goals", "emi"].includes(state.openSection) ? state.openSection : "analytics"
    setOpenSection(section, true)
    return
  }

  const defaultSection = isAdmin() ? "admin" : "user"
  const section = ["user", "admin", "profile"].includes(state.openSection) ? state.openSection : defaultSection
  setOpenSection(section, true)
}

function setOpenSection(sectionId, scrollIntoView = false) {
  if (!sectionId) {
    state.openSection = ""
    hideAllDetailSections()
    return
  }

  const targetSection = Array.from(refs.detailSections).find((section) => section.dataset.sectionId === sectionId)
  if (!targetSection) {
    state.openSection = ""
    hideAllDetailSections()
    return
  }

  state.openSection = sectionId
  refs.detailSections.forEach((section) => {
    section.hidden = section.dataset.sectionId !== sectionId
  })

  refs.entitySections.hidden = !["accounts", "budgets", "goals"].includes(sectionId)
  refs.profileSections.hidden = !["user", "admin", "profile", "emi"].includes(sectionId)

  refs.sectionLinks.forEach((link) => {
    if (link.classList.contains("finance-link")) {
      return
    }
    link.classList.toggle("active", link.dataset.sectionTarget === sectionId)
  })
  syncFinanceLinks()
  syncWorkspaceTabs()

  triggerSectionReveal(targetSection)

  if (scrollIntoView) {
    targetSection.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

function toggleSection(sectionId, scrollIntoView = false) {
  if (state.openSection === sectionId) {
    setOpenSection("")
    return
  }
  setOpenSection(sectionId, scrollIntoView)
}

function evaluateCalculatorExpression() {
  const expression = state.calculatorExpression.replace(/x/g, "*")
  if (!/^[0-9+\-*/%.()\s]+$/.test(expression)) {
    throw new Error("Invalid expression")
  }

  const result = Function(`"use strict"; return (${expression})`)()
  if (!Number.isFinite(result)) {
    throw new Error("Invalid result")
  }

  state.calculatorExpression = String(Number(result.toFixed(6)))
  updateCalculatorDisplay()
}

function pushCalculatorValue(value) {
  const current = state.calculatorExpression
  if (current === "0" && ![".", "%"].includes(value) && !/[+\-*/]/.test(value)) {
    state.calculatorExpression = value
  } else {
    state.calculatorExpression += value
  }
  updateCalculatorDisplay()
}

function handleCalculatorAction(action) {
  if (action === "clear") {
    state.calculatorExpression = "0"
    updateCalculatorDisplay()
    return
  }

  if (action === "backspace") {
    state.calculatorExpression = state.calculatorExpression.slice(0, -1) || "0"
    updateCalculatorDisplay()
    return
  }

  if (action === "equals") {
    try {
      evaluateCalculatorExpression()
    } catch (error) {
      state.calculatorExpression = "0"
      updateCalculatorDisplay()
      showToast("Calculator expression is invalid.", "warning")
    }
  }
}

function setLoanView(view) {
  state.loanView = view
  localStorage.setItem(loanViewStorageKey(), view)

  refs.loanTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.target === view)
  })

  refs.loanPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `loan${view[0].toUpperCase()}${view.slice(1)}Panel`)
  })
}

function setFinanceView(view, scrollIntoView = false) {
  const nextView = ["transactions", "income", "expense"].includes(view) ? view : "transactions"
  state.financeView = nextView
  localStorage.setItem("financeView", nextView)

  refs.financeTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.target === nextView)
  })

  refs.financePanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${nextView}Panel`)
  })
  syncFinanceLinks()

  if (scrollIntoView) {
    document.getElementById("finance").scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

function matchesFilters(item) {
  const query = state.filters.search.trim().toLowerCase()
  const { dateFrom, dateTo } = normalizedFilterRange()
  const itemDate = normalizeDateValue(item.date)
  const haystack = `${itemDate} ${item.category || ""} ${item.name || ""} ${item.email || ""} ${item.note || ""}`.toLowerCase()

  if (query && !haystack.includes(query)) {
    return false
  }
  if ((dateFrom || dateTo) && !itemDate) {
    return false
  }
  if (dateFrom && itemDate < dateFrom) {
    return false
  }
  if (dateTo && itemDate > dateTo) {
    return false
  }
  return true
}

function filteredTransactions() {
  return (state.data?.transactions || []).filter(matchesFilters)
}

function filteredIncome() {
  return (state.data?.income_transactions || []).filter(matchesFilters)
}

function filteredExpense() {
  return (state.data?.expense_transactions || []).filter(matchesFilters)
}

function activeFinanceItems() {
  if (state.financeView === "income") {
    return filteredIncome()
  }
  if (state.financeView === "expense") {
    return filteredExpense()
  }
  return filteredTransactions()
}

function buildVisibleFinanceCounts() {
  const transactionItems = filteredTransactions()
  return {
    transactions: transactionItems.length,
    income: transactionItems.filter((item) => item.amount >= 0).length,
    expense: transactionItems.filter((item) => item.amount < 0).length,
  }
}

function buildVisibleInsights() {
  if (!state.data) {
    return { monthly_flow: [], category_spend: [], budget_status: [] }
  }

  if (!hasActiveFinanceFilters()) {
    return state.data.insights || { monthly_flow: [], category_spend: [], budget_status: [] }
  }

  const items = filteredTransactions()
  const monthlyFlowMap = new Map()
  const categorySpendMap = new Map()
  const expenseByCategory = new Map()

  items.forEach((item) => {
    const itemDate = normalizeDateValue(item.date)
    const monthKey = itemDate ? itemDate.slice(0, 7) : ""

    if (monthKey) {
      const monthEntry = monthlyFlowMap.get(monthKey) || { month: monthKey, income: 0, expense: 0 }
      if (item.amount >= 0) {
        monthEntry.income += item.amount
      } else {
        monthEntry.expense += Math.abs(item.amount)
      }
      monthlyFlowMap.set(monthKey, monthEntry)
    }

    if (item.amount < 0) {
      const spend = Math.abs(item.amount)
      categorySpendMap.set(item.category, (categorySpendMap.get(item.category) || 0) + spend)
      expenseByCategory.set(item.category, (expenseByCategory.get(item.category) || 0) + spend)
    }
  })

  const monthly_flow = Array.from(monthlyFlowMap.values()).sort((left, right) => left.month.localeCompare(right.month))
  const category_spend = Array.from(categorySpendMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 6)

  const budget_status = (state.data.budgets || []).map((budget) => {
    const spent = Number(expenseByCategory.get(budget.category) || 0)
    const limit = Number(budget.limit || 0)
    const usagePercent = limit ? Number(((spent / limit) * 100).toFixed(1)) : 0

    return {
      ...budget,
      spent,
      usage_percent: usagePercent,
      remaining: Number((limit - spent).toFixed(2)),
    }
  })

  return { monthly_flow, category_spend, budget_status }
}

function setEmptyState(target, message) {
  target.innerHTML = `<div class="empty-state">${message}</div>`
}

function inputField({ label, id, type = "text", value = "", required = true, step = "", min = "" }) {
  const requiredAttr = required ? "required" : ""
  const stepAttr = step ? `step="${step}"` : ""
  const minAttr = min !== "" ? `min="${min}"` : ""
  return `
    <label class="field">
      <span>${label}</span>
      <input id="${id}" type="${type}" value="${value ?? ""}" ${requiredAttr} ${stepAttr} ${minAttr}>
    </label>
  `
}

function selectField({ label, id, value = "", options = [] }) {
  const renderedOptions = options
    .map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${option}</option>`)
    .join("")

  return `
    <label class="field">
      <span>${label}</span>
      <select id="${id}">
        ${renderedOptions}
      </select>
    </label>
  `
}

function setActivityOpen(open) {
  state.activityOpen = open

  if (!refs.activityLog || !refs.activityToggleBtn) {
    return
  }

  refs.activityLog.hidden = !open
  refs.activityToggleBtn.classList.toggle("active", open)
}

function openTransactionModal(transaction = null, mode = "transaction") {
  const resolvedMode = transaction
    ? (transaction.amount < 0 ? "expense" : "income")
    : mode

  state.transactionMode = resolvedMode
  refs.transactionForm.reset()
  refs.transactionId.value = transaction ? transaction.id : ""
  refs.transactionDate.value = transaction ? transaction.date : todayIso()
  refs.transactionCategory.value = transaction ? transaction.category : ""
  refs.transactionAmount.value = transaction ? Math.abs(transaction.amount) : ""

  if (resolvedMode === "income") {
    refs.transactionModalTitle.textContent = transaction ? "Edit Income" : "Add Income"
    refs.transactionModeHint.textContent = "Amount will be saved as income."
  } else if (resolvedMode === "expense") {
    refs.transactionModalTitle.textContent = transaction ? "Edit Expense" : "Add Expense"
    refs.transactionModeHint.textContent = "Amount will be saved as expense."
  } else {
    refs.transactionModalTitle.textContent = transaction ? "Edit Transaction" : "Add Transaction"
    refs.transactionModeHint.textContent = "Use positive amount for income and negative amount for expense."
  }

  refs.transactionModal.classList.add("open")
}

function closeTransactionModal() {
  refs.transactionModal.classList.remove("open")
}

function openEntityModal(type, mode, item = {}) {
  refs.entityType.value = type
  refs.entityId.value = item.id || ""
  refs.entityModal.classList.add("open")

  if (type === "account") {
    refs.entityModalTitle.textContent = mode === "add" ? "Add Account" : "Edit Account"
    refs.entityFields.innerHTML = [
      inputField({ label: "Account Name", id: "entity_name", value: item.name || "" }),
      inputField({ label: "Account Type", id: "entity_type", value: item.type || "" }),
      inputField({ label: "Balance", id: "entity_balance", type: "number", step: "0.01", value: item.balance || 0 }),
    ].join("")
    return
  }

  if (type === "budget") {
    refs.entityModalTitle.textContent = mode === "add" ? "Add Budget" : "Edit Budget"
    refs.entityFields.innerHTML = [
      inputField({ label: "Category", id: "entity_category", value: item.category || "" }),
      inputField({ label: "Limit", id: "entity_limit", type: "number", step: "0.01", min: "0", value: item.limit || 0 }),
    ].join("")
    return
  }

  if (type === "goal") {
    refs.entityModalTitle.textContent = mode === "add" ? "Add Goal" : "Edit Goal"
    refs.entityFields.innerHTML = [
      inputField({ label: "Goal Name", id: "entity_goal_name", value: item.name || "" }),
      inputField({ label: "Target Amount", id: "entity_target", type: "number", step: "0.01", min: "0.01", value: item.target || 0 }),
      inputField({ label: "Saved Amount", id: "entity_saved", type: "number", step: "0.01", min: "0", value: item.saved || 0 }),
      inputField({ label: "Deadline", id: "entity_deadline", type: "date", value: item.deadline || "" }),
    ].join("")
    return
  }

  if (type === "user") {
    refs.entityModalTitle.textContent = mode === "add" ? "Add User" : "Edit User"
    refs.entityFields.innerHTML = [
      inputField({ label: "Name", id: "entity_user_name", value: item.name || "" }),
      inputField({ label: "Email", id: "entity_user_email", type: "email", value: item.email || "" }),
      inputField({ label: "Location", id: "entity_user_location", value: item.location || "" }),
      inputField({
        label: mode === "add" ? "Password" : "New Password",
        id: "entity_user_password",
        type: "password",
        value: "",
        required: mode === "add",
      }),
      selectField({ label: "Role", id: "entity_user_role", value: item.role || "User", options: ["User", "Manager", "Admin"] }),
      selectField({ label: "Status", id: "entity_user_status", value: item.status || "Active", options: ["Active", "Pending", "Disabled"] }),
    ].join("")
    return
  }

  refs.entityModalTitle.textContent = "Edit Profile"
  refs.entityFields.innerHTML = [
    inputField({ label: "Name", id: "entity_profile_name", value: item.name || "" }),
    inputField({ label: "Email", id: "entity_profile_email", type: "email", value: item.email || "" }),
    inputField({ label: "Location", id: "entity_profile_location", value: item.location || "" }),
    inputField({ label: "Phone", id: "entity_profile_phone", value: item.phone || "" }),
    inputField({ label: "Department", id: "entity_profile_department", value: item.department || "" }),
  ].join("")
}

function closeEntityModal() {
  refs.entityModal.classList.remove("open")
}

function readLoanInputs() {
  return {
    amount: Number(refs.loanAmountInput.value || 0),
    annualRate: Number(refs.loanRateInput.value || 0),
    months: Number(refs.loanMonthsInput.value || 0),
    income: Number(refs.loanIncomeInput.value || 0),
    expenses: Number(refs.loanExpenseInput.value || 0),
    existingEmi: Number(refs.loanExistingEmiInput.value || 0),
  }
}

function writeLoanInputs(values) {
  refs.loanAmountInput.value = values.amount || ""
  refs.loanRateInput.value = values.annualRate || ""
  refs.loanMonthsInput.value = values.months || ""
  refs.loanIncomeInput.value = values.income || ""
  refs.loanExpenseInput.value = values.expenses || ""
  refs.loanExistingEmiInput.value = values.existingEmi || ""
}

function clearLoanDetails() {
  refs.loanDetailsTableBody.innerHTML = `
    <tr><th>Monthly EMI</th><td>-</td></tr>
    <tr><th>Total Interest</th><td>-</td></tr>
    <tr><th>Total Payment</th><td>-</td></tr>
    <tr><th>Interest Share</th><td>-</td></tr>
    <tr><th>Debt-to-Income</th><td>-</td></tr>
    <tr><th>Monthly Surplus</th><td>-</td></tr>
  `
  refs.loanAnalysisOutput.innerHTML = `Enter your loan details and click <strong>Analyze Loan</strong> to view suggestions.`
}

function calculateLoanSummary(values) {
  const monthlyRate = values.annualRate / 12 / 100
  let emi = 0

  if (values.months > 0) {
    if (monthlyRate === 0) {
      emi = values.amount / values.months
    } else {
      const multiplier = (1 + monthlyRate) ** values.months
      emi = (values.amount * monthlyRate * multiplier) / (multiplier - 1)
    }
  }

  const totalPayment = emi * values.months
  const totalInterest = totalPayment - values.amount
  const interestShare = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0
  const totalMonthlyDebt = emi + values.existingEmi
  const debtToIncome = values.income > 0 ? (totalMonthlyDebt / values.income) * 100 : 0
  const monthlySurplus = values.income > 0 ? values.income - values.expenses - totalMonthlyDebt : 0

  return {
    emi,
    totalInterest,
    totalPayment,
    interestShare,
    debtToIncome,
    monthlySurplus,
    totalMonthlyDebt,
  }
}

function renderLoanSummary(summary) {
  refs.loanDetailsTableBody.innerHTML = `
    <tr><th>Monthly EMI</th><td>${formatCurrency(summary.emi)}</td></tr>
    <tr><th>Total Interest</th><td>${formatCurrency(summary.totalInterest)}</td></tr>
    <tr><th>Total Payment</th><td>${formatCurrency(summary.totalPayment)}</td></tr>
    <tr><th>Interest Share</th><td>${formatPercent(summary.interestShare)}</td></tr>
    <tr><th>Debt-to-Income</th><td>${formatPercent(summary.debtToIncome)}</td></tr>
    <tr><th>Monthly Surplus</th><td>${formatCurrency(summary.monthlySurplus)}</td></tr>
  `
}

function buildLoanAnalysis(values, summary) {
  let scoreLabel = "Comfortable"
  let scoreClass = "healthy"
  const points = []

  if (summary.debtToIncome >= 45 || summary.monthlySurplus < 0) {
    scoreLabel = "High Risk"
    scoreClass = "over"
  } else if (summary.debtToIncome >= 30 || summary.monthlySurplus < values.income * 0.15) {
    scoreLabel = "Moderate"
    scoreClass = "warning"
  }

  if (summary.debtToIncome >= 45) {
    points.push("Your total EMI load is above a healthy debt-to-income range. Reduce the loan amount or extend planning time.")
  } else if (summary.debtToIncome >= 30) {
    points.push("The loan looks possible, but your EMI burden will take a meaningful share of monthly income.")
  } else {
    points.push("Your EMI burden is within a manageable range for current monthly income.")
  }

  if (summary.monthlySurplus < 0) {
    points.push("Your monthly cash flow turns negative after this loan. Do not proceed without changing the numbers.")
  } else if (summary.monthlySurplus < values.income * 0.15) {
    points.push("Your remaining surplus is thin. Build a stronger buffer before taking this loan.")
  } else {
    points.push("You still keep a workable monthly surplus after expenses and EMIs.")
  }

  if (summary.interestShare >= 45) {
    points.push("A large share of your repayment is interest. Compare shorter tenure options if EMI remains affordable.")
  } else {
    points.push("The interest portion is relatively controlled for this tenure.")
  }

  if (values.annualRate >= 14) {
    points.push("The rate is high. Compare lenders or negotiate before accepting this loan.")
  } else if (values.annualRate > 0) {
    points.push("The rate is in a normal band, but rate comparison is still worth doing.")
  }

  if (values.income > 0) {
    points.push(`Try keeping total monthly EMIs near ${formatCurrency(values.income * 0.3)} or lower for safer cash flow.`)
  }

  if (values.expenses > values.income * 0.6 && values.income > 0) {
    points.push("Your fixed monthly spending is already heavy. Review recurring expenses before taking a new loan.")
  }

  return {
    scoreLabel,
    scoreClass,
    points,
  }
}

function renderLoanAnalysis(analysis) {
  refs.loanAnalysisOutput.innerHTML = `
    <div class="card-head">
      <strong>AI Says</strong>
      <span class="tag ${analysis.scoreClass}">${analysis.scoreLabel}</span>
    </div>
    <ul>
      ${analysis.points.map((point) => `<li>${point}</li>`).join("")}
    </ul>
  `
}

function analyzeLoan(showToastMessage = false) {
  const values = readLoanInputs()
  if (values.amount <= 0 || values.months <= 0) {
    clearLoanDetails()
    refs.loanAnalysisOutput.innerHTML = "Enter a valid loan amount and tenure to analyze the loan."
    if (showToastMessage) {
      showToast("Enter valid loan amount and tenure.", "warning")
    }
    return
  }

  const summary = calculateLoanSummary(values)
  renderLoanSummary(summary)
  renderLoanAnalysis(buildLoanAnalysis(values, summary))
  localStorage.setItem(loanStorageKey(), JSON.stringify(values))
  setLoanView("analysis")

  if (showToastMessage) {
    showToast("Loan analysis updated.", "success")
  }
}

function resetLoanTools() {
  const defaults = defaultLoanInputs()
  writeLoanInputs(defaults)
  localStorage.removeItem(loanStorageKey())
  localStorage.removeItem(loanViewStorageKey())
  clearLoanDetails()
  setLoanView("calculator")
  showToast("Loan tools reset.", "info")
}

function renderLoanTools() {
  state.loanView = localStorage.getItem(loanViewStorageKey()) || "calculator"

  const saved = localStorage.getItem(loanStorageKey())
  if (!saved) {
    writeLoanInputs(defaultLoanInputs())
    clearLoanDetails()
    setLoanView(state.loanView)
    return
  }

  try {
    const values = { ...defaultLoanInputs(), ...JSON.parse(saved) }
    writeLoanInputs(values)
    analyzeLoan(false)
    setLoanView(state.loanView)
  } catch (error) {
    writeLoanInputs(defaultLoanInputs())
    clearLoanDetails()
    setLoanView("calculator")
  }
}

function renderTopbar(user, session) {
  const adminView = isAdmin()
  refs.topbarTitle.textContent = "Ours Finance Management"
  refs.topbarSubtitle.textContent = adminView
    ? "Interactive cashflow, analytics, admin control, and profile management in one place."
    : "Interactive cashflow, analytics, and your personal workspace in one place."
  refs.userInitials.textContent = user.initials || "NA"
  refs.userName.textContent = user.name || "User"
  refs.userRole.textContent = user.role || ""
  refs.userEmail.textContent = [user.email, user.location].filter(Boolean).join(" • ")
  refs.userEmail.textContent = [user.email, user.location].filter(Boolean).join(" | ")
  refs.sessionPill.textContent = session.status_label || "Logged Out"
}

function renderSummary(summary, financeCounts) {
  refs.balanceValue.textContent = formatCurrency(summary.balance)
  refs.incomeValue.textContent = formatCurrency(summary.income)
  refs.expenseValue.textContent = formatCurrency(summary.expense)
  refs.topCategoryValue.textContent = summary.top_category || "-"
  refs.budgetAlertValue.textContent = summary.budget_alerts
  refs.assetsChip.textContent = formatCurrency(summary.assets)
  refs.assetsValue.textContent = formatCurrency(summary.assets)
  if (refs.goalsChip) {
    refs.goalsChip.textContent = `${summary.active_goals} goals`
  }
  refs.incomeCountText.textContent = `${financeCounts.income} entries`
  refs.expenseCountText.textContent = `${financeCounts.expense} entries`
}

function renderDashboard(user, session, adminSummary) {
  const adminView = isAdmin()
  refs.dashboardSubtitle.textContent = adminView
    ? "Session state, finance totals, and user-management overview."
    : "Session state, finance totals, and your personal workspace."
  refs.dashboardSessionStatus.textContent = session.status_label || "Logged Out"
  refs.dashboardSessionMeta.textContent = `Last login: ${session.last_login || "-"} • Last logout: ${session.last_logout || "-"}`
  refs.dashboardSessionMeta.textContent = `Last login: ${session.last_login || "-"} | Last logout: ${session.last_logout || "-"}`
  refs.dashboardRole.textContent = user.role || "User"

  if (adminView) {
    refs.dashboardRoleLabel.textContent = "Admin Access"
    refs.dashboardRoleMeta.textContent = "User management available in admin tools"
    refs.dashboardUsersLabel.textContent = "Users Summary"
    refs.dashboardUsersValue.textContent = `${adminSummary.active_users} active`
    refs.dashboardUsersMeta.textContent = `${adminSummary.total_users} total users • ${adminSummary.pending_users} pending`
    return
  }

  refs.dashboardRoleLabel.textContent = "User Access"
  refs.dashboardRoleMeta.textContent = "Personal workspace enabled"
  refs.dashboardUsersLabel.textContent = "User Login"
  refs.dashboardUsersValue.textContent = `ID ${user.id || "-"}`
  refs.dashboardUsersMeta.textContent = user.email || "-"
}

function renderUserWorkspace(user, session) {
  if (isAdmin()) {
    refs.userWorkspace.hidden = true
    if (state.openSection === "user") {
      state.openSection = ""
    }
    return
  }

  refs.userWorkspace.hidden = false
  refs.userWorkspaceLogin.textContent = session.last_login || "-"
  refs.userWorkspaceLogout.textContent = session.last_logout || "-"
  refs.userWorkspaceId.textContent = `${user.id || "-"}`
  refs.userRemarksInput.value = localStorage.getItem(remarksStorageKey()) || ""
}

function renderFinanceTabs(financeCounts) {
  refs.transactionsTab.innerHTML = financeTabContent("receipt", "Transactions", financeCounts.transactions)
  refs.incomeTab.innerHTML = financeTabContent("trending-up", "Income", financeCounts.income)
  refs.expenseTab.innerHTML = financeTabContent("trending-down", "Expense", financeCounts.expense)
}

function transactionRow(tx) {
  const amountClass = tx.amount >= 0 ? "positive" : "negative"
  const amountPrefix = tx.amount >= 0 ? "+" : "-"
  return `
    <tr>
      <td>${tx.date}</td>
      <td>${tx.category}</td>
      <td class="${amountClass}">${amountPrefix} ${formatCurrency(Math.abs(tx.amount))}</td>
      <td>
        <div class="action-row">
          <button class="ghost-btn edit-transaction-btn" data-id="${tx.id}" type="button">${buttonContent("pencil", "Edit")}</button>
          <button class="danger-btn delete-transaction-btn" data-id="${tx.id}" type="button">${buttonContent("trash-2", "Delete")}</button>
        </div>
      </td>
    </tr>
  `
}

function financeCard(title, valueText, subtitle, kind = "healthy", extraButtons = "") {
  return `
    <article class="card-item">
      <div class="card-head">
        <strong>${title}</strong>
        <div class="action-row">${extraButtons}</div>
      </div>
      <div class="tag ${kind}">${valueText}</div>
      <div class="muted">${subtitle}</div>
    </article>
  `
}

function renderTransactions() {
  const items = filteredTransactions()
  refs.transactionsMeta.textContent = `Showing ${items.length} of ${(state.data?.transactions || []).length} transactions`

  if (!items.length) {
    refs.transactionTableBody.innerHTML = `<tr><td colspan="4"><div class="empty-state">No transactions match the current filters.</div></td></tr>`
    return
  }

  refs.transactionTableBody.innerHTML = items.map(transactionRow).join("")

  refs.transactionTableBody.querySelectorAll(".edit-transaction-btn").forEach((button) => {
    button.onclick = () => {
      const tx = (state.data.transactions || []).find((item) => item.id === Number(button.dataset.id))
      if (tx) {
        openTransactionModal(tx, tx.amount < 0 ? "expense" : "income")
      }
    }
  })

  refs.transactionTableBody.querySelectorAll(".delete-transaction-btn").forEach((button) => {
    button.onclick = () => deleteItem(`/api/transactions/${button.dataset.id}`, "Transaction deleted.")
  })
}

function renderIncome() {
  const items = filteredIncome()
  refs.incomeMeta.textContent = `Showing ${items.length} of ${(state.data?.income_transactions || []).length} income entries`

  if (!items.length) {
    setEmptyState(refs.incomeList, "No income entries match the current filters.")
    return
  }

  refs.incomeList.innerHTML = items
    .map((tx) => financeCard(tx.category, formatCurrency(tx.amount), tx.date, "healthy"))
    .join("")
}

function renderExpense() {
  const items = filteredExpense()
  refs.expenseMeta.textContent = `Showing ${items.length} of ${(state.data?.expense_transactions || []).length} expense entries`

  if (!items.length) {
    setEmptyState(refs.expenseList, "No expense entries match the current filters.")
    return
  }

  refs.expenseList.innerHTML = items
    .map((tx) => financeCard(tx.category, formatCurrency(Math.abs(tx.amount)), tx.date, "over"))
    .join("")
}

function renderAccounts() {
  const items = state.data?.accounts || []

  if (!items.length) {
    setEmptyState(refs.accountsGrid, "No accounts available.")
    return
  }

  refs.accountsGrid.innerHTML = items
    .map((account) => `
      <article class="card-item">
        <div class="card-head">
          <strong>${account.name}</strong>
          <div class="action-row">
            <button class="ghost-btn edit-account-btn" data-id="${account.id}" type="button">${buttonContent("pencil", "Edit")}</button>
            <button class="danger-btn delete-account-btn" data-id="${account.id}" type="button">${buttonContent("trash-2", "Delete")}</button>
          </div>
        </div>
        <div class="muted">${account.type}</div>
        <div>${formatCurrency(account.balance)}</div>
      </article>
    `)
    .join("")

  refs.accountsGrid.querySelectorAll(".edit-account-btn").forEach((button) => {
    button.onclick = () => {
      const account = items.find((item) => item.id === Number(button.dataset.id))
      if (account) {
        openEntityModal("account", "edit", account)
      }
    }
  })

  refs.accountsGrid.querySelectorAll(".delete-account-btn").forEach((button) => {
    button.onclick = () => deleteItem(`/api/accounts/${button.dataset.id}`, "Account deleted.")
  })
}

function budgetCard(budget) {
  return `
    <article class="card-item">
      <div class="card-head">
        <strong>${budget.category}</strong>
        <div class="action-row">
          <span class="tag ${budget.status}">${budget.status}</span>
          <button class="ghost-btn edit-budget-btn" data-id="${budget.id}" type="button">${buttonContent("pencil", "Edit")}</button>
          <button class="danger-btn delete-budget-btn" data-id="${budget.id}" type="button">${buttonContent("trash-2", "Delete")}</button>
        </div>
      </div>
      <div class="muted">Spent ${formatCurrency(budget.spent)} of ${formatCurrency(budget.limit)}</div>
      <div class="progress"><span style="width:${Math.min(budget.usage_percent, 100)}%;"></span></div>
      <div class="muted">${budget.usage_percent}% used • ${formatCurrency(budget.remaining)} remaining</div>
    </article>
  `
}

function renderBudgets() {
  const items = state.data?.budgets || []

  if (!items.length) {
    setEmptyState(refs.budgetList, "No budgets available.")
    return
  }

  refs.budgetList.innerHTML = items.map(budgetCard).join("")
  refs.budgetList.innerHTML = refs.budgetList.innerHTML.replaceAll("â€¢", "|")

  refs.budgetList.querySelectorAll(".edit-budget-btn").forEach((button) => {
    button.onclick = () => {
      const budget = items.find((item) => item.id === Number(button.dataset.id))
      if (budget) {
        openEntityModal("budget", "edit", budget)
      }
    }
  })

  refs.budgetList.querySelectorAll(".delete-budget-btn").forEach((button) => {
    button.onclick = () => deleteItem(`/api/budgets/${button.dataset.id}`, "Budget deleted.")
  })
}

function goalCard(goal) {
  return `
    <article class="card-item">
      <div class="card-head">
        <strong>${goal.name}</strong>
        <div class="action-row">
          <span class="tag healthy">${goal.progress_percent}%</span>
          <button class="ghost-btn edit-goal-btn" data-id="${goal.id}" type="button">${buttonContent("pencil", "Edit")}</button>
          <button class="danger-btn delete-goal-btn" data-id="${goal.id}" type="button">${buttonContent("trash-2", "Delete")}</button>
        </div>
      </div>
      <div class="muted">Saved ${formatCurrency(goal.saved)} of ${formatCurrency(goal.target)}</div>
      <div class="progress goal-bar"><span style="width:${Math.min(goal.progress_percent, 100)}%;"></span></div>
      <div class="muted">Deadline ${goal.deadline}</div>
    </article>
  `
}

function renderGoals() {
  const items = state.data?.goals || []

  if (!items.length) {
    setEmptyState(refs.goalsGrid, "No goals available.")
    return
  }

  refs.goalsGrid.innerHTML = items.map(goalCard).join("")

  refs.goalsGrid.querySelectorAll(".edit-goal-btn").forEach((button) => {
    button.onclick = () => {
      const goal = items.find((item) => item.id === Number(button.dataset.id))
      if (goal) {
        openEntityModal("goal", "edit", goal)
      }
    }
  })

  refs.goalsGrid.querySelectorAll(".delete-goal-btn").forEach((button) => {
    button.onclick = () => deleteItem(`/api/goals/${button.dataset.id}`, "Goal deleted.")
  })
}

function renderUsers() {
  const items = state.data?.users || []
  const user = currentUser()
  refs.usersChip.textContent = `${items.length + 1} users`

  const adminCard = `
    <article class="card-item">
      <div class="card-head">
        <strong>${user.name || "Admin"}</strong>
        <div class="action-row">
          <span class="tag healthy">Admin</span>
          <span class="tag warning">Protected</span>
        </div>
      </div>
      <div class="muted">${user.email || ""}</div>
      <div class="muted">${user.location || ""}</div>
    </article>
  `

  if (!isAdmin()) {
    refs.usersGrid.innerHTML = adminCard
    return
  }

  refs.usersGrid.innerHTML = [
    adminCard,
    ...items.map((member) => `
      <article class="card-item">
        <div class="card-head">
          <strong>${member.name}</strong>
          <div class="action-row">
            <span class="tag warning">ID ${member.id}</span>
            <span class="tag ${member.status === "Pending" ? "warning" : "healthy"}">${member.role}</span>
          </div>
        </div>
        <div class="muted">${member.email}</div>
        <div class="muted">Login ID ${member.id} • ${member.location || ""} • ${member.status || ""}</div>
        <div class="action-row">
          <button class="ghost-btn edit-user-btn" data-id="${member.id}" type="button">${buttonContent("pencil", "Edit / Reset Password")}</button>
          <button class="danger-btn delete-user-btn" data-id="${member.id}" type="button">${buttonContent("trash-2", "Delete")}</button>
        </div>
      </article>
    `),
  ].join("")
  refs.usersGrid.innerHTML = refs.usersGrid.innerHTML.replaceAll("â€¢", "|")

  refs.usersGrid.querySelectorAll(".edit-user-btn").forEach((button) => {
    button.onclick = () => {
      const member = items.find((item) => item.id === Number(button.dataset.id))
      if (member) {
        openEntityModal("user", "edit", member)
      }
    }
  })

  refs.usersGrid.querySelectorAll(".delete-user-btn").forEach((button) => {
    button.onclick = () => deleteItem(`/api/users/${button.dataset.id}`, "User deleted.")
  })
}

function renderAdmin(summary, recentActivity) {
  if (!isAdmin()) {
    if (refs.adminPanel) {
      refs.adminPanel.hidden = true
    }
    if (refs.adminQuickLink) {
      refs.adminQuickLink.hidden = false
      refs.adminQuickLink.innerHTML = `${iconMarkup("user")}<span>User</span>`
      refs.adminQuickLink.setAttribute("href", "#userWorkspace")
      refs.adminQuickLink.dataset.sectionTarget = "user"
    }
    return
  }

  if (refs.adminPanel) {
    refs.adminPanel.hidden = false
  }
  if (refs.adminQuickLink) {
    refs.adminQuickLink.hidden = false
    refs.adminQuickLink.innerHTML = `${iconMarkup("shield")}<span>Admin</span>`
    refs.adminQuickLink.setAttribute("href", "#admin")
    refs.adminQuickLink.dataset.sectionTarget = "admin"
  }

  if (isAdmin()) {
    refs.adminMessage.innerHTML = `
      <span>User Management</span>
      <strong>Admin Access Enabled</strong>
      <small>Each user card shows a Login ID. Use Edit / Reset Password to change details or set a new password. The signed-in admin account remains protected from deletion.</small>
    `
    refs.addUserBtn.disabled = false
    refs.addUserBtn.innerHTML = buttonContent("user-plus", "Add User")
  } else {
    refs.adminMessage.innerHTML = `
      <span>User Management</span>
      <strong>View Only</strong>
      <small>Only admin can add, edit, or delete users.</small>
    `
    refs.addUserBtn.disabled = true
    refs.addUserBtn.innerHTML = buttonContent("shield", "Admin Only")
  }

  refs.adminStats.innerHTML = `
    <article class="metric-card">
      <span>Total Users</span>
      <strong>${summary.total_users}</strong>
      <small>Including admin</small>
    </article>
    <article class="metric-card">
      <span>Active Users</span>
      <strong>${summary.active_users}</strong>
      <small>Currently active members</small>
    </article>
    <article class="metric-card">
      <span>Pending Users</span>
      <strong>${summary.pending_users}</strong>
      <small>Need follow-up</small>
    </article>
  `

  if (refs.activityToggleBtn) {
    refs.activityToggleBtn.innerHTML = buttonContent("history", `Recent Activity (${recentActivity.length})`)
  }

  if (!recentActivity.length) {
    setEmptyState(refs.activityLog, "No recent activity.")
    setActivityOpen(false)
    return
  }

  refs.activityLog.innerHTML = recentActivity
    .map((item) => {
      let levelClass = "healthy"
      if (item.level === "warning") {
        levelClass = "warning"
      } else if (item.level === "error") {
        levelClass = "over"
      }

      return `
        <article class="activity-item">
          <div>
            <strong>${item.message}</strong>
            <div class="muted">${item.time}</div>
          </div>
          <span class="tag ${levelClass}">${item.level || "info"}</span>
        </article>
      `
    })
    .join("")

  setActivityOpen(state.activityOpen)
}

function renderProfile(user, session) {
  refs.profileSubtitle.textContent = isAdmin()
    ? "Signed-in admin profile and editable account details."
    : "Signed-in user profile and editable account details."

  const profileRows = [
    `<div class="activity-item"><strong>Email</strong><span>${user.email || "-"}</span></div>`,
    `<div class="activity-item"><strong>Location</strong><span>${user.location || "-"}</span></div>`,
    `<div class="activity-item"><strong>Phone</strong><span>${user.phone || "-"}</span></div>`,
    `<div class="activity-item"><strong>Department</strong><span>${user.department || "-"}</span></div>`,
    `<div class="activity-item"><strong>Member Since</strong><span>${user.member_since || "-"}</span></div>`,
  ]

  if (isAdmin()) {
    profileRows.push(`<div class="activity-item"><strong>Last Login</strong><span>${session.last_login || "-"}</span></div>`)
    profileRows.push(`<div class="activity-item"><strong>Last Logout</strong><span>${session.last_logout || "-"}</span></div>`)
  }

  refs.profilePanel.innerHTML = `
    <div class="card-head">
      <div>
        <h3>${user.name || "User"}</h3>
        <div class="muted">${user.role || "User"} • ${user.status || "Active"}</div>
      </div>
      <div class="avatar">${user.initials || "NA"}</div>
    </div>
    <div class="stack-list">
      ${profileRows.join("")}
    </div>
  `

  const profileMeta = refs.profilePanel.querySelector(".muted")
  if (profileMeta) {
    profileMeta.textContent = `${user.role || "User"} | ${user.status || "Active"}`
  }
}

function destroyCharts() {
  Object.values(state.charts).forEach((chart) => {
    if (chart) {
      chart.destroy()
    }
  })

  state.charts.cashflow = null
  state.charts.category = null
  state.charts.budget = null
}

function renderCharts(insights) {
  destroyCharts()

  const dailyFlowMap = new Map()
  filteredTransactions().forEach((item) => {
    const itemDate = normalizeDateValue(item.date)
    if (!itemDate) {
      return
    }

    const entry = dailyFlowMap.get(itemDate) || { date: itemDate, income: 0, expense: 0 }
    if (Number(item.amount) >= 0) {
      entry.income += Number(item.amount || 0)
    } else {
      entry.expense += Math.abs(Number(item.amount || 0))
    }
    dailyFlowMap.set(itemDate, entry)
  })

  const dailyFlow = Array.from(dailyFlowMap.values()).sort((left, right) => left.date.localeCompare(right.date))
  const categorySpend = insights.category_spend || []
  const budgetStatus = insights.budget_status || []

  state.charts.cashflow = new Chart(document.getElementById("cashflowChart"), {
    type: "line",
    data: {
      labels: dailyFlow.length ? dailyFlow.map((item) => formatDateLabel(item.date)) : ["No Data"],
      datasets: [
        {
          label: "Income",
          data: dailyFlow.length ? dailyFlow.map((item) => item.income) : [0],
          borderColor: "#1f8a62",
          backgroundColor: "rgba(31, 138, 98, 0.18)",
          pointBackgroundColor: "#1f8a62",
          pointBorderColor: "#ffffff",
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 2,
          borderWidth: 3,
          tension: 0.34,
          fill: false,
        },
        {
          label: "Expense",
          data: dailyFlow.length ? dailyFlow.map((item) => item.expense) : [0],
          borderColor: "#d45044",
          backgroundColor: "rgba(212, 80, 68, 0.18)",
          pointBackgroundColor: "#d45044",
          pointBorderColor: "#ffffff",
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 2,
          borderWidth: 3,
          tension: 0.34,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Amount",
          },
        },
      },
    },
  })

  state.charts.category = new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
      labels: categorySpend.length ? categorySpend.map((item) => item.category) : ["No Data"],
      datasets: [
        {
          data: categorySpend.length ? categorySpend.map((item) => item.amount) : [0],
          backgroundColor: ["#184f7a", "#2f8f67", "#d88d2c", "#c44d44", "#7d6799", "#4d6b8b"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  })

  state.charts.budget = new Chart(document.getElementById("budgetChart"), {
    type: "bar",
    data: {
      labels: budgetStatus.length ? budgetStatus.map((item) => item.category) : ["No Data"],
      datasets: [
        {
          label: "Budget",
          data: budgetStatus.length ? budgetStatus.map((item) => item.limit) : [0],
          backgroundColor: "#d3e3f1",
          borderRadius: 8,
        },
        {
          label: "Spent",
          data: budgetStatus.length ? budgetStatus.map((item) => item.spent) : [0],
          backgroundColor: "#184f7a",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  })
}

function renderPage() {
  if (!state.data) {
    return
  }

  const { dateFrom, dateTo } = normalizedFilterRange()
  const visibleFinanceCounts = buildVisibleFinanceCounts()

  refs.searchInput.value = state.filters.search
  refs.dateFromInput.value = dateFrom
  refs.dateToInput.value = dateTo

  renderTopbar(state.data.user, state.data.session)
  startGreetingClock()
  renderSummary(state.data.summary, visibleFinanceCounts)
  renderDashboard(state.data.user, state.data.session, state.data.admin_summary)
  if (isAdmin()) {
    refs.dashboardUsersMeta.textContent = `${state.data.admin_summary.total_users} total users | ${state.data.admin_summary.pending_users} pending`
  }
  renderFinanceTabs(visibleFinanceCounts)
  renderTransactions()
  renderIncome()
  renderExpense()
  renderAccounts()
  renderBudgets()
  renderGoals()
  renderUsers()
  renderUserWorkspace(state.data.user, state.data.session)
  renderLoanTools()
  renderAdmin(state.data.admin_summary, state.data.recent_activity || [])
  renderProfile(state.data.user, state.data.session)
  renderCharts(buildVisibleInsights())
  activateInteractiveSurfaces()
  setOpenSection(state.openSection)
  setFinanceView(state.financeView)
  syncWorkspaceTabs()
  renderIcons()
}

async function loadDashboard() {
  const data = await apiRequest("/api/dashboard-data")
  if (!data) {
    return
  }

  state.data = data
  renderPage()
}

async function deleteItem(endpoint, successMessage) {
  const confirmed = window.confirm("Delete this item?")
  if (!confirmed) {
    return
  }

  await apiRequest(endpoint, { method: "DELETE" })
  showToast(successMessage, "success")
  await loadDashboard()
}

function exportFinanceCsv() {
  const items = activeFinanceItems()
  if (!items.length) {
    showToast("Nothing to export for the current view.", "warning")
    return
  }

  const rows = [
    ["Date", "Category", "Amount"],
    ...items.map((item) => [item.date, item.category, item.amount]),
  ]

  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "").replace(/"/g, "\"\"")
          return `"${value}"`
        })
        .join(",")
    )
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${state.financeView}-export.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function refreshFinanceViews() {
  const visibleFinanceCounts = buildVisibleFinanceCounts()
  renderSummary(state.data.summary, visibleFinanceCounts)
  renderFinanceTabs(visibleFinanceCounts)
  renderTransactions()
  renderIncome()
  renderExpense()
  renderCharts(buildVisibleInsights())
  renderIcons()
}

async function submitTransactionForm(event) {
  event.preventDefault()

  let amount = Number(refs.transactionAmount.value)
  if (state.transactionMode === "income") {
    amount = Math.abs(amount)
  } else if (state.transactionMode === "expense") {
    amount = -Math.abs(amount)
  }

  const payload = {
    date: refs.transactionDate.value,
    category: refs.transactionCategory.value.trim(),
    amount,
  }

  const id = refs.transactionId.value
  const method = id ? "PUT" : "POST"
  const url = id ? `/api/transactions/${id}` : "/api/transactions"

  await apiRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  closeTransactionModal()
  showToast(id ? "Transaction updated." : "Transaction added.", "success")
  await loadDashboard()
}

function buildEntityRequest() {
  const type = refs.entityType.value
  const id = refs.entityId.value

  if (type === "account") {
    return {
      url: id ? `/api/accounts/${id}` : "/api/accounts",
      method: id ? "PUT" : "POST",
      successMessage: id ? "Account updated." : "Account added.",
      payload: {
        name: document.getElementById("entity_name").value.trim(),
        type: document.getElementById("entity_type").value.trim(),
        balance: Number(document.getElementById("entity_balance").value),
      },
    }
  }

  if (type === "budget") {
    return {
      url: id ? `/api/budgets/${id}` : "/api/budgets",
      method: id ? "PUT" : "POST",
      successMessage: id ? "Budget updated." : "Budget added.",
      payload: {
        category: document.getElementById("entity_category").value.trim(),
        limit: Number(document.getElementById("entity_limit").value),
      },
    }
  }

  if (type === "goal") {
    return {
      url: id ? `/api/goals/${id}` : "/api/goals",
      method: id ? "PUT" : "POST",
      successMessage: id ? "Goal updated." : "Goal added.",
      payload: {
        name: document.getElementById("entity_goal_name").value.trim(),
        target: Number(document.getElementById("entity_target").value),
        saved: Number(document.getElementById("entity_saved").value),
        deadline: document.getElementById("entity_deadline").value,
      },
    }
  }

  if (type === "user") {
    return {
      url: id ? `/api/users/${id}` : "/api/users",
      method: id ? "PUT" : "POST",
      successMessage: id ? "User updated." : "User added.",
      payload: {
        name: document.getElementById("entity_user_name").value.trim(),
        email: document.getElementById("entity_user_email").value.trim(),
        location: document.getElementById("entity_user_location").value.trim(),
        password: document.getElementById("entity_user_password").value,
        role: document.getElementById("entity_user_role").value,
        status: document.getElementById("entity_user_status").value,
      },
    }
  }

  return {
    url: "/api/profile",
    method: "PUT",
    successMessage: "Profile updated.",
    payload: {
      name: document.getElementById("entity_profile_name").value.trim(),
      email: document.getElementById("entity_profile_email").value.trim(),
      location: document.getElementById("entity_profile_location").value.trim(),
      phone: document.getElementById("entity_profile_phone").value.trim(),
      department: document.getElementById("entity_profile_department").value.trim(),
    },
  }
}

async function submitEntityForm(event) {
  event.preventDefault()

  const requestData = buildEntityRequest()

  const response = await apiRequest(requestData.url, {
    method: requestData.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData.payload),
  })

  closeEntityModal()
  if (refs.entityType.value === "user" && requestData.method === "POST" && response?.user?.id) {
    showToast(`User added. Login ID: ${response.user.id}`, "success")
  } else {
    showToast(requestData.successMessage, "success")
  }
  await loadDashboard()
}

function applyFiltersFromInputs() {
  state.filters.search = refs.searchInput.value
  state.filters.dateFrom = normalizeDateValue(refs.dateFromInput.value)
  state.filters.dateTo = normalizeDateValue(refs.dateToInput.value)

  const { dateFrom, dateTo } = normalizedFilterRange()
  state.filters.dateFrom = dateFrom
  state.filters.dateTo = dateTo
  refs.dateFromInput.value = dateFrom
  refs.dateToInput.value = dateTo

  refreshFinanceViews()
}

function resetFilters() {
  state.filters.search = ""
  state.filters.dateFrom = ""
  state.filters.dateTo = ""
  refs.searchInput.value = ""
  refs.dateFromInput.value = ""
  refs.dateToInput.value = ""
  refreshFinanceViews()
}

function wireEvents() {
  refs.logoutBtn.addEventListener("click", async () => {
    try {
      const result = await apiRequest("/logout", { method: "POST" })
      window.location.href = result.redirect || "/login"
    } catch (error) {
      showToast(error.message || "Logout failed.", "error")
    }
  })

  refs.financeTabs.forEach((tab) => {
    tab.addEventListener("click", () => setFinanceView(tab.dataset.target))
  })

  refs.workspaceTabs.forEach((tab) => {
    tab.addEventListener("click", () => openWorkspaceView(tab.dataset.workspaceTarget))
  })

  refs.financeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault()
      setFinanceView(link.dataset.target)
      setOpenSection("finance", true)
    })
  })

  refs.sectionLinks.forEach((link) => {
    if (link.classList.contains("finance-link")) {
      return
    }
    link.addEventListener("click", (event) => {
      event.preventDefault()
      toggleSection(link.dataset.sectionTarget, true)
    })
  })

  refs.overviewQuickLink.addEventListener("click", () => setOpenSection(""))
  refs.dashboardQuickLink.addEventListener("click", () => setOpenSection(""))

  refs.loanTabs.forEach((tab) => {
    tab.addEventListener("click", () => setLoanView(tab.dataset.target))
  })

  refs.financeSummaryLinks.forEach((item) => {
    item.addEventListener("click", () => {
      setFinanceView(item.dataset.financeTarget, true)
      setOpenSection("finance", true)
    })
  })

  refs.calculatorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.calcAction) {
        handleCalculatorAction(button.dataset.calcAction)
      } else {
        pushCalculatorValue(button.dataset.calcValue)
      }
    })
  })

  refs.calculatorToggleBtn.addEventListener("click", () => {
    setCalculatorOpen(!state.calculatorOpen, true)
  })
  refs.closeCalculatorBtn.addEventListener("click", () => {
    setCalculatorOpen(false)
  })

  refs.searchInput.addEventListener("input", applyFiltersFromInputs)
  refs.dateFromInput.addEventListener("change", applyFiltersFromInputs)
  refs.dateToInput.addEventListener("change", applyFiltersFromInputs)
  refs.resetFiltersBtn.addEventListener("click", resetFilters)
  refs.exportCsvBtn.addEventListener("click", exportFinanceCsv)

  refs.addTransactionBtn.addEventListener("click", () => openTransactionModal(null, "transaction"))
  refs.addIncomeBtn.addEventListener("click", () => openTransactionModal(null, "income"))
  refs.addExpenseBtn.addEventListener("click", () => openTransactionModal(null, "expense"))
  refs.addAccountBtn.addEventListener("click", () => openEntityModal("account", "add"))
  refs.addBudgetBtn.addEventListener("click", () => openEntityModal("budget", "add"))
  refs.addGoalBtn.addEventListener("click", () => openEntityModal("goal", "add"))
  refs.addUserBtn.addEventListener("click", () => {
    if (!isAdmin()) {
      showToast("Only admin can manage users.", "warning")
      return
    }
    openEntityModal("user", "add")
  })
  refs.editProfileBtn.addEventListener("click", () => openEntityModal("profile", "edit", currentUser()))
  refs.activityToggleBtn.addEventListener("click", () => setActivityOpen(!state.activityOpen))
  refs.saveUserRemarksBtn.addEventListener("click", () => {
    localStorage.setItem(remarksStorageKey(), refs.userRemarksInput.value)
    showToast("Remark saved.", "success")
  })
  refs.analyzeLoanBtn.addEventListener("click", () => analyzeLoan(true))
  refs.resetLoanBtn.addEventListener("click", resetLoanTools)
  refs.scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  })

  refs.closeTransactionModal.addEventListener("click", closeTransactionModal)
  refs.closeEntityModal.addEventListener("click", closeEntityModal)

  refs.transactionModal.addEventListener("click", (event) => {
    if (event.target === refs.transactionModal) {
      closeTransactionModal()
    }
  })

  refs.entityModal.addEventListener("click", (event) => {
    if (event.target === refs.entityModal) {
      closeEntityModal()
    }
  })

  refs.transactionForm.addEventListener("submit", async (event) => {
    try {
      await submitTransactionForm(event)
    } catch (error) {
      showToast(error.message || "Transaction save failed.", "error")
    }
  })

  refs.entityForm.addEventListener("submit", async (event) => {
    try {
      await submitEntityForm(event)
    } catch (error) {
      showToast(error.message || "Save failed.", "error")
    }
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeTransactionModal()
      closeEntityModal()
    }

    if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      return
    }

    if (/[0-9+\-*/.%]/.test(event.key)) {
      pushCalculatorValue(event.key)
      return
    }

    if (event.key === "Enter") {
      handleCalculatorAction("equals")
      return
    }

    if (event.key === "Backspace") {
      handleCalculatorAction("backspace")
      return
    }
  })

  window.addEventListener("scroll", updateScrollTopButton)
}

wireEvents()
updateCalculatorDisplay()
setCalculatorOpen(false)
updateScrollTopButton()
loadDashboard().catch((error) => {
  console.error(error)
  showToast(error.message || "Failed to load dashboard.", "error")
})
