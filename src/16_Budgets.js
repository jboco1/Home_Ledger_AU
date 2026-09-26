function saveBudget(budget) {
  assertAccess_();
  const category = String(budget && budget.category || '').trim();
  const financialYear = Number(budget && budget.financialYear);
  const amount = Math.round(Number(budget && budget.amount || 0) * 100) / 100;
  const periodType = String(budget && budget.periodType) === 'Monthly' ? 'Monthly' : 'Annual';
  const periodKey = periodType === 'Monthly' ? String(budget && budget.periodKey || '') : '';
  if (!category || !financialYear || !isFinite(amount) || amount < 0) throw new Error('Category, financial year and a valid budget amount are required.');
  if (periodType === 'Monthly' && !/^\d{4}-(0[1-9]|1[0-2])$/.test(periodKey)) throw new Error('A valid budget month is required.');
  if (periodType === 'Monthly') {
    const parts = periodKey.split('-');
    const monthFinancialYear = Number(parts[1]) >= 7 ? Number(parts[0]) : Number(parts[0]) - 1;
    if (monthFinancialYear !== financialYear) throw new Error('The budget month must be inside the selected financial year.');
  }
  const ss = getSpreadsheet_();
  ensureCurrentSchema_(ss);
  const sheet = ss.getSheetByName(SHEETS.BUDGETS);
  const rows = rowsAsObjects_(sheet);
  const existing = rows.filter(function (row) {
    const rowPeriodType = String(row.PeriodType || 'Annual');
    const rowPeriodKey = rowPeriodType === 'Monthly' ? String(row.PeriodKey || '') : '';
    return String(row.Category) === category && Number(row.FinancialYear) === financialYear && rowPeriodType === periodType && rowPeriodKey === periodKey;
  })[0];
  if (existing) {
    const rowNumber = findRowByValue_(sheet, 1, existing.Id);
    sheet.getRange(rowNumber, HEADERS.Budgets.indexOf('Amount') + 1).setValue(amount);
    sheet.getRange(rowNumber, HEADERS.Budgets.indexOf('UpdatedAt') + 1).setValue(new Date());
  } else {
    sheet.appendRow([Utilities.getUuid(), financialYear, category, amount, new Date(), periodType, periodKey]);
  }
  return { ok: true };
}

function deleteBudget(id) {
  assertAccess_();
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.BUDGETS);
  const row = findRowByValue_(sheet, 1, id);
  if (!row) throw new Error('Budget not found.');
  sheet.deleteRow(row);
  return { ok: true };
}
