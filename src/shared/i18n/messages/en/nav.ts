/** Navigation: groups, pages (label, short tab label, one-line description) and quick-add actions. */
export const nav = {
  groups: {
    overview: "Overview",
    planning: "Planning",
    records: "Records",
    system: "System",
  },
  items: {
    dashboard: { label: "Dashboard", short: "Home", description: "Net worth, cash flow and goal health at a glance" },
    goals: { label: "Goals", short: "Goals", description: "Goal plans, projections and checkpoints" },
    allocations: { label: "Liquidity", short: "Liquidity", description: "How assets are committed across plans" },
    assets: { label: "Assets", short: "Assets", description: "Everything you own and how fast you can access it" },
    income: { label: "Income & spending", short: "Income", description: "Income sources and average monthly spending" },
    debts: { label: "Debts", short: "Debts", description: "Loans, cards and other liabilities" },
    loans: { label: "Personal loans", short: "Loans", description: "Informal money lent or borrowed" },
    settings: { label: "Settings", short: "Settings", description: "Appearance, sync and session" },
  },
  quickAdd: {
    asset: { label: "Add asset", short: "Asset", keywords: "create new asset" },
    income: { label: "Add income source", short: "Income", keywords: "create new income salary" },
    debt: { label: "Add debt", short: "Debt", keywords: "create new debt loan liability" },
    loan: { label: "Add personal loan", short: "Loan", keywords: "create new lend borrow" },
    plan: { label: "New goal plan", short: "Plan", keywords: "create new goal plan" },
  },
};
