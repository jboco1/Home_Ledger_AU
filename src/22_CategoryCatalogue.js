const SIMPLE_CATEGORY_ROWS = [
  ['Employment income', 'Income', '#14855f', true, ''],
  ['Other income', 'Income', '#14855f', true, ''],
  ['Reimbursements', 'Income', '#14855f', true, ''],

  ['Housing', 'Home', '#e6a23c', true, ''],
  ['Utilities', 'Home', '#e6a23c', true, ''],
  ['Household', 'Home', '#e6a23c', true, ''],

  ['Groceries', 'Food', '#11a683', true, ''],
  ['Eating out', 'Food', '#11a683', true, ''],

  ['Vehicle', 'Transport', '#4f86f7', true, ''],
  ['Public transport', 'Transport', '#4f86f7', true, ''],
  ['Bicycle', 'Transport', '#4f86f7', true, ''],
  ['Other transport', 'Transport', '#4f86f7', true, ''],

  ['Health care', 'Health', '#df5b86', true, ''],

  ['Children and education', 'Family', '#8c6dd7', true, ''],
  ['Pets', 'Family', '#8c6dd7', true, ''],

  ['Personal', 'Lifestyle', '#f9735b', true, ''],
  ['Entertainment', 'Lifestyle', '#f9735b', true, ''],
  ['Holidays', 'Lifestyle', '#f9735b', true, ''],

  ['Insurance', 'Financial', '#6d4aff', true, ''],
  ['Financial costs', 'Financial', '#6d4aff', true, ''],
  ['Tax', 'Financial', '#6d4aff', true, ''],

  ['Savings and investments', 'Transfers', '#7b8794', true, ''],
  ['Debt repayments', 'Transfers', '#7b8794', true, ''],
  ['Account transfers', 'Transfers', '#7b8794', true, ''],

  ['Uncategorised', 'Review', '#9aa5b1', true, ''],
  ['Split', 'System', '#5f6c7b', true, ''],
  ['Balance adjustment', 'System', '#5f6c7b', true, '']
];

const DEFAULT_HOUSEHOLD_TAGS = [
  ['Work', '#4158d0'], ['Reimbursable', '#e08a18'], ['Primary home', '#e6a23c'],
  ['Rental property', '#8c6dd7'], ['Car 1', '#4f86f7'], ['Car 2', '#3b6fc4'],
  ['Holiday', '#00a0a8'], ['Renovation', '#a36b3f'], ['Recurring', '#526b88'],
  ['Tax document', '#bd5b18']
];

function householdCategoryRows_() {
  return SIMPLE_CATEGORY_ROWS.map(function (row) { return row.slice(); });
}

function installSimpleHouseholdCategorySet() {
  assertAccess_();
  const resetKey = 'SIMPLE_CATEGORY_RESET_VERSION';
  if (PROP.getProperty(resetKey) === '1') {
    throw new Error('The simple category reset has already been completed. It was not run again.');
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('The ledger is currently busy. Try the reset again shortly.');

  try {
    const ss = getSpreadsheet_();
    ensureCurrentSchema_(ss);

    const categorySheet = ss.getSheetByName(SHEETS.CATEGORIES);
    clearSheetDataRows_(categorySheet);
    categorySheet.getRange(2, 1, SIMPLE_CATEGORY_ROWS.length, SIMPLE_CATEGORY_ROWS[0].length).setValues(householdCategoryRows_());

    const transactionCount = resetTransactionCategories_(ss.getSheetByName(SHEETS.TRANSACTIONS));
    const splitCount = resetSplitCategories_(ss.getSheetByName(SHEETS.SPLITS));
    const ruleCount = clearSheetDataRows_(ss.getSheetByName(SHEETS.RULES));
    const budgetCount = clearSheetDataRows_(ss.getSheetByName(SHEETS.BUDGETS));

    PROP.setProperty(resetKey, '1');
    return {
      ok: true,
      categoriesInstalled: SIMPLE_CATEGORY_ROWS.length,
      transactionsReturnedToReview: transactionCount,
      splitCategoriesReset: splitCount,
      rulesRemoved: ruleCount,
      budgetsRemoved: budgetCount
    };
  } finally {
    lock.releaseLock();
  }
}

function resetTransactionCategories_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return 0;
  const rowCount = sheet.getLastRow() - 1;
  const categoryColumn = HEADERS.Transactions.indexOf('Category') + 1;
  const reviewedColumn = HEADERS.Transactions.indexOf('Reviewed') + 1;
  const confidenceColumn = HEADERS.Transactions.indexOf('Confidence') + 1;
  sheet.getRange(2, categoryColumn, rowCount, 1).setValues(makeColumnValues_(rowCount, 'Uncategorised'));
  sheet.getRange(2, reviewedColumn, rowCount, 1).setValues(makeColumnValues_(rowCount, false));
  sheet.getRange(2, confidenceColumn, rowCount, 1).setValues(makeColumnValues_(rowCount, 0));
  return rowCount;
}

function resetSplitCategories_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return 0;
  const rowCount = sheet.getLastRow() - 1;
  const categoryColumn = HEADERS.Splits.indexOf('Category') + 1;
  sheet.getRange(2, categoryColumn, rowCount, 1).setValues(makeColumnValues_(rowCount, 'Uncategorised'));
  return rowCount;
}

function clearSheetDataRows_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return 0;
  const rowCount = sheet.getLastRow() - 1;
  sheet.getRange(2, 1, rowCount, Math.max(1, sheet.getLastColumn())).clearContent();
  return rowCount;
}

function makeColumnValues_(count, value) {
  const values = [];
  for (let i = 0; i < count; i += 1) values.push([value]);
  return values;
}
