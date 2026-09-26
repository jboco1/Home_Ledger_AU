function ensureCurrentSchema_(ss) {
  Object.keys(HEADERS).forEach(function (name) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) initialiseSheet_(ss.insertSheet(name), HEADERS[name]);
    else ensureSheetHeaders_(sheet, HEADERS[name]);
  });
  const categories = ss.getSheetByName(SHEETS.CATEGORIES);
  const hasSplit = rowsAsObjects_(categories).some(function (row) { return String(row.Name) === 'Split'; });
  if (!hasSplit) categories.appendRow(['Split', 'System', '#5f6c7b', true]);
}

function ensureSheetHeaders_(sheet, requiredHeaders) {
  const lastColumn = Math.max(1, sheet.getLastColumn());
  const existing = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
  requiredHeaders.forEach(function (header) {
    if (existing.indexOf(header) === -1) {
      existing.push(header);
      sheet.getRange(1, existing.length).setValue(header).setFontWeight('bold').setBackground('#102a43').setFontColor('#ffffff');
    }
  });
}

function initialiseSheet_(sheet, headers) {
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#102a43').setFontColor('#ffffff');
}

function seedDefaults_(ss) {
  const accountRows = [
    [Utilities.getUuid(), 'Joint everyday', 'Transaction', 'Joint', true],
    [Utilities.getUuid(), 'Credit card', 'Credit card', 'Joint', true]
  ];
  ss.getSheetByName(SHEETS.ACCOUNTS).getRange(2, 1, accountRows.length, accountRows[0].length).setValues(accountRows);

  const categoryRows = householdCategoryRows_();
  ss.getSheetByName(SHEETS.CATEGORIES).getRange(2, 1, categoryRows.length, categoryRows[0].length).setValues(categoryRows);

  const tagRows = DEFAULT_HOUSEHOLD_TAGS.map(function (tag) { return [tag[0], tag[1], true]; });
  ss.getSheetByName(SHEETS.TAGS).getRange(2, 1, tagRows.length, tagRows[0].length).setValues(tagRows);

  const ruleRows = [
    [Utilities.getUuid(), 'WOOLWORTHS', 'contains', '', 'Groceries', 'Joint', 'Not deductible', 0, 80, true, new Date()],
    [Utilities.getUuid(), 'COLES', 'contains', '', 'Groceries', 'Joint', 'Not deductible', 0, 80, true, new Date()],
    [Utilities.getUuid(), 'ALDI', 'contains', '', 'Groceries', 'Joint', 'Not deductible', 0, 80, true, new Date()],
    [Utilities.getUuid(), 'UBER', 'contains', '', 'Rideshare', 'Joint', 'Not deductible', 0, 40, true, new Date()],
    [Utilities.getUuid(), 'ADOBE', 'contains', '', 'Software', 'Joint', 'Needs review', 0, 60, true, new Date()]
  ];
  ss.getSheetByName(SHEETS.RULES).getRange(2, 1, ruleRows.length, ruleRows[0].length).setValues(ruleRows);
  ss.getSheetByName(SHEETS.SETTINGS).getRange(2, 1, 3, 2).setValues([
    ['Currency', 'AUD'], ['Locale', 'en-AU'], ['FinancialYearStartMonth', '7']
  ]);
}
