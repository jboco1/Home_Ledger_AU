function saveAccount(account) {
  assertAccess_();
  if (!account || !String(account.name || '').trim()) throw new Error('Account name is required.');
  getSpreadsheet_().getSheetByName(SHEETS.ACCOUNTS).appendRow([
    Utilities.getUuid(), String(account.name).trim(), account.type || 'Transaction', account.owner || 'Joint', true, String(account.provider || '').trim()
  ]);
  return { ok: true };
}

function updateAccount(account) {
  assertAccess_();
  if (!account || !account.id || !String(account.name || '').trim()) throw new Error('Account id and name are required.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.ACCOUNTS);
  ensureSheetHeaders_(sheet, HEADERS.Accounts);
  const row = findRowByValue_(sheet, 1, account.id);
  if (!row) throw new Error('Account not found.');
  sheet.getRange(row, HEADERS.Accounts.indexOf('Name') + 1).setValue(String(account.name).trim());
  sheet.getRange(row, HEADERS.Accounts.indexOf('Type') + 1).setValue(account.type || 'Transaction');
  sheet.getRange(row, HEADERS.Accounts.indexOf('Owner') + 1).setValue(account.owner || 'Joint');
  sheet.getRange(row, HEADERS.Accounts.indexOf('Provider') + 1).setValue(String(account.provider || '').trim());
  return { ok: true };
}

function archiveAccount(id) {
  assertAccess_();
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.ACCOUNTS);
  const row = findRowByValue_(sheet, 1, id);
  if (!row) throw new Error('Account not found.');
  sheet.getRange(row, HEADERS.Accounts.indexOf('Active') + 1).setValue(false);
  return { ok: true };
}
