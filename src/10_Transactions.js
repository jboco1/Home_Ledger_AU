function updateTransaction(patch) {
  assertAccess_();
  if (!patch || !patch.id) throw new Error('Transaction id is required.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.TRANSACTIONS);
  const rowNumber = findRowByValue_(sheet, 1, patch.id);
  if (!rowNumber) throw new Error('Transaction not found.');
  const header = HEADERS.Transactions;
  const allowed = ['Owner', 'Category', 'TaxStatus', 'DeductiblePercent', 'Reviewed', 'Notes', 'Tags'];
  allowed.forEach(function (field) {
    const key = field.charAt(0).toLowerCase() + field.slice(1);
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      let value = patch[key];
      if (field === 'DeductiblePercent') value = Math.max(0, Math.min(100, Number(value) || 0));
      if (field === 'Tags') value = normaliseTags_(value);
      sheet.getRange(rowNumber, header.indexOf(field) + 1).setValue(value);
    }
  });
  sheet.getRange(rowNumber, header.indexOf('UpdatedAt') + 1).setValue(new Date());
  const merchantMatches = applyMerchantClassification_(sheet, rowNumber, patch, header);
  return { ok: true, merchantMatches: merchantMatches };
}

function applyMerchantClassification_(sheet, sourceRow, patch, header) {
  const hasCategory = Object.prototype.hasOwnProperty.call(patch, 'category') && String(patch.category) !== 'Split';
  const hasTags = Object.prototype.hasOwnProperty.call(patch, 'tags');
  const hasTaxStatus = Object.prototype.hasOwnProperty.call(patch, 'taxStatus');
  const hasDeductiblePercent = Object.prototype.hasOwnProperty.call(patch, 'deductiblePercent');
  if (!hasCategory && !hasTags && !hasTaxStatus && !hasDeductiblePercent) return 0;
  const merchantColumn = header.indexOf('Merchant') + 1;
  const merchant = String(sheet.getRange(sourceRow, merchantColumn).getValue() || '').trim().toLowerCase();
  if (!merchant || sheet.getLastRow() < 3) return 0;
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, header.length).getValues();
  const merchantIndex = header.indexOf('Merchant');
  const categoryIndex = header.indexOf('Category');
  const tagsIndex = header.indexOf('Tags');
  const taxStatusIndex = header.indexOf('TaxStatus');
  const deductibleIndex = header.indexOf('DeductiblePercent');
  const updatedIndex = header.indexOf('UpdatedAt');
  const tags = normaliseTags_(patch.tags);
  const now = new Date();
  let matches = 0;
  let changed = false;
  rows.forEach(function (row, index) {
    if (index + 2 === sourceRow || String(row[merchantIndex] || '').trim().toLowerCase() !== merchant) return;
    if (hasCategory && String(row[categoryIndex]) !== 'Split') row[categoryIndex] = String(patch.category || 'Uncategorised');
    if (hasTags) row[tagsIndex] = tags;
    if (hasTaxStatus) row[taxStatusIndex] = String(patch.taxStatus || 'Not deductible');
    if (hasDeductiblePercent) row[deductibleIndex] = Math.max(0, Math.min(100, Number(patch.deductiblePercent) || 0));
    row[updatedIndex] = now;
    matches += 1;
    changed = true;
  });
  if (changed) sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
  return matches;
}

function saveTransactionSplits(payload) {
  assertAccess_();
  if (!payload || !payload.transactionId || !Array.isArray(payload.splits) || payload.splits.length < 2) {
    throw new Error('A split transaction needs at least two parts.');
  }
  const ss = getSpreadsheet_();
  ensureCurrentSchema_(ss);
  const txSheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  const txRow = findRowByValue_(txSheet, 1, payload.transactionId);
  if (!txRow) throw new Error('Transaction not found.');
  const txAmount = Math.abs(Number(txSheet.getRange(txRow, HEADERS.Transactions.indexOf('Amount') + 1).getValue()));
  const parts = payload.splits.map(function (part) {
    const amount = Math.round(Number(part.amount || 0) * 100) / 100;
    if (!(amount > 0)) throw new Error('Every split amount must be greater than zero.');
    return {
      amount: amount,
      category: String(part.category || 'Uncategorised'),
      owner: String(part.owner || 'Joint'),
      taxStatus: String(part.taxStatus || 'Not deductible'),
      deductiblePercent: Math.max(0, Math.min(100, Number(part.deductiblePercent || 0))),
      notes: String(part.notes || '')
    };
  });
  const splitTotal = Math.round(parts.reduce(function (total, part) { return total + part.amount; }, 0) * 100) / 100;
  if (Math.abs(splitTotal - txAmount) > 0.01) {
    throw new Error('Split amounts must total ' + txAmount.toFixed(2) + '. Current total: ' + splitTotal.toFixed(2) + '.');
  }

  const splitSheet = ss.getSheetByName(SHEETS.SPLITS);
  const current = splitSheet.getDataRange().getValues();
  for (let i = current.length - 1; i >= 1; i -= 1) {
    if (String(current[i][1]) === String(payload.transactionId)) splitSheet.deleteRow(i + 1);
  }
  const now = new Date();
  const rows = parts.map(function (part) {
    return [Utilities.getUuid(), payload.transactionId, part.amount, part.category, part.owner, part.taxStatus, part.deductiblePercent, part.notes, now];
  });
  splitSheet.getRange(splitSheet.getLastRow() + 1, 1, rows.length, HEADERS.Splits.length).setValues(rows);
  txSheet.getRange(txRow, HEADERS.Transactions.indexOf('Category') + 1).setValue('Split');
  txSheet.getRange(txRow, HEADERS.Transactions.indexOf('Reviewed') + 1).setValue(true);
  txSheet.getRange(txRow, HEADERS.Transactions.indexOf('UpdatedAt') + 1).setValue(now);
  return { ok: true, total: splitTotal, count: rows.length };
}
