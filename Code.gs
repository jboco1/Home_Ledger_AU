const APP_NAME = 'Home Ledger AU';
const PROP = PropertiesService.getScriptProperties();
// Replace both examples before running setupFinanceApp().
const SETUP_ALLOWED_EMAILS = ['your.email@gmail.com', 'your.wife@gmail.com'];

const SHEETS = {
  TRANSACTIONS: 'Transactions',
  ACCOUNTS: 'Accounts',
  CATEGORIES: 'Categories',
  RULES: 'Rules',
  SPLITS: 'Splits',
  TAGS: 'Tags',
  BUDGETS: 'Budgets',
  IMPORTS: 'Imports',
  SETTINGS: 'Settings'
};

const HEADERS = {
  Transactions: ['Id', 'Date', 'Description', 'Merchant', 'Amount', 'Account', 'Owner', 'Category', 'TaxStatus', 'DeductiblePercent', 'Confidence', 'Source', 'ImportHash', 'Reviewed', 'ReceiptFileId', 'ReceiptName', 'Notes', 'CreatedAt', 'UpdatedAt', 'Tags'],
  Accounts: ['Id', 'Name', 'Type', 'Owner', 'Active', 'Provider'],
  Categories: ['Name', 'Group', 'Colour', 'Active', 'Parent'],
  Rules: ['Id', 'Pattern', 'MatchType', 'Account', 'Category', 'Owner', 'TaxStatus', 'DeductiblePercent', 'Priority', 'Active', 'CreatedAt', 'Tags'],
  Splits: ['Id', 'TransactionId', 'Amount', 'Category', 'Owner', 'TaxStatus', 'DeductiblePercent', 'Notes', 'CreatedAt'],
  Tags: ['Name', 'Colour', 'Active'],
  Budgets: ['Id', 'FinancialYear', 'Category', 'Amount', 'UpdatedAt', 'PeriodType', 'PeriodKey'],
  Imports: ['Id', 'Filename', 'Account', 'RowCount', 'ImportedCount', 'DuplicateCount', 'ImportedAt', 'ImportedBy', 'RawFileId', 'RawFilename'],
  Settings: ['Key', 'Value']
};

function doGet() {
  assertConfigured_();
  assertAccess_();
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Run once from the Apps Script editor before deployment.
 * First replace SETUP_ALLOWED_EMAILS above, then run setupFinanceApp().
 */
function setupFinanceApp() {
  const emails = SETUP_ALLOWED_EMAILS
    .map(function (email) { return email.trim().toLowerCase(); })
    .filter(Boolean);
  if (!emails.length || emails.some(function (email) { return email.indexOf('your.') === 0; })) {
    throw new Error('Replace SETUP_ALLOWED_EMAILS with the permitted Google email addresses first.');
  }

  const spreadsheet = SpreadsheetApp.create(APP_NAME + ' Database');
  PROP.setProperty('SPREADSHEET_ID', spreadsheet.getId());
  PROP.setProperty('ALLOWED_EMAILS', emails.join(','));

  const defaultSheet = spreadsheet.getSheets()[0];
  defaultSheet.setName(SHEETS.TRANSACTIONS);
  Object.keys(HEADERS).forEach(function (name) {
    const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
    initialiseSheet_(sheet, HEADERS[name]);
  });

  seedDefaults_(spreadsheet);
  const parentFolder = DriveApp.createFolder(APP_NAME);
  const receiptsFolder = parentFolder.createFolder(APP_NAME + ' Receipts');
  const rawImportsFolder = parentFolder.createFolder(APP_NAME + ' Raw Imports');
  DriveApp.getFileById(spreadsheet.getId()).moveTo(parentFolder);
  PROP.setProperty('PARENT_FOLDER_ID', parentFolder.getId());
  PROP.setProperty('RECEIPTS_FOLDER_ID', receiptsFolder.getId());
  PROP.setProperty('RAW_IMPORTS_FOLDER_ID', rawImportsFolder.getId());
  PROP.setProperty('STORAGE_STRUCTURE_VERSION', '1');
  spreadsheet.addEditors(emails);
  parentFolder.addEditors(emails);

  return {
    spreadsheetUrl: spreadsheet.getUrl(),
    parentFolderUrl: parentFolder.getUrl(),
    receiptsFolderUrl: receiptsFolder.getUrl(),
    rawImportsFolderUrl: rawImportsFolder.getUrl(),
    allowedEmails: emails
  };
}

function getAppData() {
  assertAccess_();
  const ss = getSpreadsheet_();
  ensureCurrentSchema_(ss);
  ensureStorageStructure_(ss);
  const transactions = rowsAsObjects_(ss.getSheetByName(SHEETS.TRANSACTIONS));
  const accounts = rowsAsObjects_(ss.getSheetByName(SHEETS.ACCOUNTS)).filter(function (x) { return truthy_(x.Active); });
  const categories = rowsAsObjects_(ss.getSheetByName(SHEETS.CATEGORIES)).filter(function (x) { return truthy_(x.Active); });
  const rules = rowsAsObjects_(ss.getSheetByName(SHEETS.RULES)).filter(function (x) { return truthy_(x.Active); });
  const splits = rowsAsObjects_(ss.getSheetByName(SHEETS.SPLITS));
  const tags = rowsAsObjects_(ss.getSheetByName(SHEETS.TAGS)).filter(function (x) { return truthy_(x.Active); });
  const budgets = rowsAsObjects_(ss.getSheetByName(SHEETS.BUDGETS));
  const settings = rowsAsObjects_(ss.getSheetByName(SHEETS.SETTINGS));
  const email = Session.getActiveUser().getEmail();

  return {
    appName: APP_NAME,
    userEmail: email,
    transactions: transactions.map(serializeTransaction_),
    accounts: accounts.map(serializeRow_),
    categories: categories.map(serializeRow_),
    rules: rules.map(serializeRow_),
    splits: splits.map(serializeRow_),
    tags: tags.map(serializeRow_),
    budgets: budgets.map(serializeRow_),
    settings: settings.reduce(function (out, row) { out[row.Key] = row.Value; return out; }, {})
  };
}

function importCsv(payload) {
  assertAccess_();
  if (!payload || !payload.csvText || !payload.account) throw new Error('CSV data and account are required.');
  if (String(payload.csvText).length > 5 * 1024 * 1024) throw new Error('CSV is too large. Split it into files under 5 MB.');

  const ss = getSpreadsheet_();
  ensureCurrentSchema_(ss);
  const storage = ensureStorageStructure_(ss);
  const rawFile = saveRawImport_(storage.rawImportsFolder, payload.filename, payload.csvText);
  const parsed = Utilities.parseCsv(String(payload.csvText));
  if (parsed.length < 2) throw new Error('The CSV does not contain transaction rows.');
  const mapping = detectColumns_(parsed[0]);
  const txSheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  const rules = rowsAsObjects_(ss.getSheetByName(SHEETS.RULES)).filter(function (x) { return truthy_(x.Active); });
  const existingHashes = new Set(rowsAsObjects_(txSheet).map(function (row) { return String(row.ImportHash); }));
  const now = new Date();
  const output = [];
  let duplicates = 0;

  parsed.slice(1).forEach(function (row) {
    if (!row.join('').trim()) return;
    const normal = normaliseCsvRow_(row, mapping, payload.account);
    if (!normal) return;
    const hash = transactionHash_(normal.date, normal.description, normal.amount, payload.account);
    if (existingHashes.has(hash)) { duplicates += 1; return; }
    existingHashes.add(hash);
    const classification = classify_(normal.description, payload.account, rules);
    output.push([
      Utilities.getUuid(), normal.date, normal.description, classification.merchant,
      normal.amount, payload.account, classification.owner || payload.owner || 'Joint',
      classification.category || 'Uncategorised', classification.taxStatus || 'Not deductible',
      Number(classification.deductiblePercent || 0), Number(classification.confidence || 0),
      payload.filename || 'CSV import', hash, classification.confidence >= 0.95,
      '', '', '', now, now, classification.tags || ''
    ]);
  });

  if (output.length) txSheet.getRange(txSheet.getLastRow() + 1, 1, output.length, HEADERS.Transactions.length).setValues(output);

  const importSheet = ss.getSheetByName(SHEETS.IMPORTS);
  importSheet.appendRow([
    Utilities.getUuid(), payload.filename || 'CSV import', payload.account,
    Math.max(0, parsed.length - 1), output.length, duplicates, now, Session.getActiveUser().getEmail(),
    rawFile.getId(), rawFile.getName()
  ]);

  return { imported: output.length, duplicates: duplicates, totalRows: Math.max(0, parsed.length - 1), rawFilename: rawFile.getName() };
}

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

function saveRule(rule) {
  assertAccess_();
  if (!rule || !String(rule.pattern || '').trim()) throw new Error('Rule pattern is required.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.RULES);
  sheet.appendRow([
    Utilities.getUuid(), String(rule.pattern).trim().toUpperCase(), rule.matchType || 'contains',
    rule.account || '', rule.category || 'Uncategorised', rule.owner || 'Joint',
    rule.taxStatus || 'Not deductible', Number(rule.deductiblePercent || 0),
    Number(rule.priority || 50), true, new Date(), normaliseTags_(rule.tags)
  ]);
  return { ok: true };
}

function deleteRule(id) {
  assertAccess_();
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.RULES);
  const row = findRowByValue_(sheet, 1, id);
  if (!row) throw new Error('Rule not found.');
  sheet.deleteRow(row);
  return { ok: true };
}

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

function saveCategory(category) {
  assertAccess_();
  const name = String(category && category.name || '').trim();
  if (!name) throw new Error('Category name is required.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.CATEGORIES);
  const existing = rowsAsObjects_(sheet).some(function (row) { return String(row.Name).toLowerCase() === name.toLowerCase() && truthy_(row.Active); });
  if (existing) throw new Error('That category already exists.');
  const parent = String(category.parent || '').trim();
  if (parent && parent === name) throw new Error('A category cannot be its own parent.');
  if (parent) {
    const parentExists = rowsAsObjects_(sheet).some(function (row) { return String(row.Name) === parent && truthy_(row.Active); });
    if (!parentExists) throw new Error('The selected parent category is not available.');
  }
  sheet.appendRow([name, category.group || 'Other', category.colour || '#4f86f7', true, parent]);
  return { ok: true };
}

function archiveCategory(name) {
  assertAccess_();
  const protectedNames = ['Uncategorised', 'Transfers', 'Split'];
  if (protectedNames.indexOf(String(name)) !== -1) throw new Error('This system category cannot be archived.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.CATEGORIES);
  const hasChildren = rowsAsObjects_(sheet).some(function (row) { return String(row.Parent) === String(name) && truthy_(row.Active); });
  if (hasChildren) throw new Error('Archive or move this category’s active subcategories first.');
  const row = findRowByValue_(sheet, 1, name);
  if (!row) throw new Error('Category not found.');
  sheet.getRange(row, HEADERS.Categories.indexOf('Active') + 1).setValue(false);
  return { ok: true };
}

function saveTag(tag) {
  assertAccess_();
  const name = String(tag && tag.name || '').trim();
  if (!name) throw new Error('Tag name is required.');
  if (name.indexOf(',') !== -1) throw new Error('Tag names cannot contain commas.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.TAGS);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][0]).toLowerCase() !== name.toLowerCase()) continue;
    if (truthy_(values[i][2])) throw new Error('That tag already exists.');
    sheet.getRange(i + 1, HEADERS.Tags.indexOf('Colour') + 1).setValue(tag.colour || '#18a889');
    sheet.getRange(i + 1, HEADERS.Tags.indexOf('Active') + 1).setValue(true);
    return { ok: true };
  }
  sheet.appendRow([name, tag.colour || '#18a889', true]);
  return { ok: true };
}

function archiveTag(name) {
  assertAccess_();
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.TAGS);
  const row = findRowByValue_(sheet, 1, name);
  if (!row) throw new Error('Tag not found.');
  sheet.getRange(row, HEADERS.Tags.indexOf('Active') + 1).setValue(false);
  return { ok: true };
}

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

function uploadReceipt(payload) {
  assertAccess_();
  if (!payload || !payload.transactionId || !payload.base64) throw new Error('Receipt data is incomplete.');
  if (String(payload.base64).length > 8 * 1024 * 1024) throw new Error('Receipt is too large. Keep files under 5 MB.');
  const ss = getSpreadsheet_();
  ensureCurrentSchema_(ss);
  const storage = ensureStorageStructure_(ss);
  const sheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  const row = findRowByValue_(sheet, 1, payload.transactionId);
  if (!row) throw new Error('Transaction not found.');
  const transactionDate = sheet.getRange(row, HEADERS.Transactions.indexOf('Date') + 1).getValue();
  const folder = getOrCreateChildFolder_(storage.receiptsFolder, financialYearFolderName_(transactionDate));
  const safeName = String(payload.filename || 'receipt').replace(/[^a-zA-Z0-9._ -]/g, '_');
  const bytes = Utilities.base64Decode(String(payload.base64));
  const blob = Utilities.newBlob(bytes, payload.mimeType || 'application/octet-stream', safeName);
  const file = folder.createFile(blob);
  sheet.getRange(row, HEADERS.Transactions.indexOf('ReceiptFileId') + 1).setValue(file.getId());
  sheet.getRange(row, HEADERS.Transactions.indexOf('ReceiptName') + 1).setValue(safeName);
  sheet.getRange(row, HEADERS.Transactions.indexOf('UpdatedAt') + 1).setValue(new Date());
  return { fileId: file.getId(), filename: safeName };
}

function getReceiptUrl(fileId) {
  assertAccess_();
  if (!fileId) throw new Error('No receipt is attached.');
  return DriveApp.getFileById(fileId).getUrl();
}

function exportAllData() {
  assertAccess_();
  const ss = getSpreadsheet_();
  const result = {};
  Object.keys(HEADERS).forEach(function (name) {
    const sheet = ss.getSheetByName(name);
    result[name] = sheet.getDataRange().getDisplayValues();
  });
  return result;
}

function getSpreadsheetUrl() {
  assertAccess_();
  return getSpreadsheet_().getUrl();
}

function getReceiptFolderUrl() {
  assertAccess_();
  return ensureStorageStructure_(getSpreadsheet_()).receiptsFolder.getUrl();
}

function assertConfigured_() {
  if (!PROP.getProperty('SPREADSHEET_ID') || !PROP.getProperty('ALLOWED_EMAILS')) {
    throw new Error('App not configured. Run setupFinanceApp with the permitted Google email addresses.');
  }
}

function assertAccess_() {
  assertConfigured_();
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  const allowed = String(PROP.getProperty('ALLOWED_EMAILS') || '').split(',').map(function (x) { return x.trim().toLowerCase(); });
  if (!email || allowed.indexOf(email) === -1) throw new Error('This Google account is not permitted to use ' + APP_NAME + '.');
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(PROP.getProperty('SPREADSHEET_ID'));
}

function ensureStorageStructure_(ss) {
  if (PROP.getProperty('STORAGE_STRUCTURE_VERSION') === '1') {
    try {
      return {
        parentFolder: DriveApp.getFolderById(PROP.getProperty('PARENT_FOLDER_ID')),
        receiptsFolder: DriveApp.getFolderById(PROP.getProperty('RECEIPTS_FOLDER_ID')),
        rawImportsFolder: DriveApp.getFolderById(PROP.getProperty('RAW_IMPORTS_FOLDER_ID'))
      };
    } catch (error) {
      PROP.deleteProperty('STORAGE_STRUCTURE_VERSION');
    }
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (PROP.getProperty('STORAGE_STRUCTURE_VERSION') === '1') {
      return {
        parentFolder: DriveApp.getFolderById(PROP.getProperty('PARENT_FOLDER_ID')),
        receiptsFolder: DriveApp.getFolderById(PROP.getProperty('RECEIPTS_FOLDER_ID')),
        rawImportsFolder: DriveApp.getFolderById(PROP.getProperty('RAW_IMPORTS_FOLDER_ID'))
      };
    }

    let parentFolder = folderFromProperty_('PARENT_FOLDER_ID');
    if (!parentFolder) parentFolder = DriveApp.createFolder(APP_NAME);

    let receiptsFolder = folderFromProperty_('RECEIPTS_FOLDER_ID');
    if (!receiptsFolder) receiptsFolder = parentFolder.createFolder(APP_NAME + ' Receipts');
    else receiptsFolder.moveTo(parentFolder);

    let rawImportsFolder = folderFromProperty_('RAW_IMPORTS_FOLDER_ID');
    if (!rawImportsFolder) rawImportsFolder = parentFolder.createFolder(APP_NAME + ' Raw Imports');
    else rawImportsFolder.moveTo(parentFolder);

    DriveApp.getFileById(ss.getId()).moveTo(parentFolder);
    const emails = String(PROP.getProperty('ALLOWED_EMAILS') || '').split(',').map(function (email) { return email.trim(); }).filter(Boolean);
    if (emails.length) parentFolder.addEditors(emails);

    migrateReceiptsToFinancialYears_(ss, receiptsFolder);
    PROP.setProperties({
      PARENT_FOLDER_ID: parentFolder.getId(),
      RECEIPTS_FOLDER_ID: receiptsFolder.getId(),
      RAW_IMPORTS_FOLDER_ID: rawImportsFolder.getId(),
      STORAGE_STRUCTURE_VERSION: '1'
    });
    return { parentFolder: parentFolder, receiptsFolder: receiptsFolder, rawImportsFolder: rawImportsFolder };
  } finally {
    lock.releaseLock();
  }
}

function folderFromProperty_(key) {
  const id = PROP.getProperty(key);
  if (!id) return null;
  try {
    const folder = DriveApp.getFolderById(id);
    return folder.isTrashed() ? null : folder;
  } catch (error) {
    return null;
  }
}

function getOrCreateChildFolder_(parent, name) {
  const matches = parent.getFoldersByName(name);
  return matches.hasNext() ? matches.next() : parent.createFolder(name);
}

function financialYearFolderName_(value) {
  const date = value instanceof Date ? value : parseDate_(value);
  const valid = date && !isNaN(date.getTime()) ? date : new Date();
  const start = valid.getMonth() >= 6 ? valid.getFullYear() : valid.getFullYear() - 1;
  return 'FY ' + start + '-' + String(start + 1).slice(-2);
}

function migrateReceiptsToFinancialYears_(ss, receiptsFolder) {
  const transactions = rowsAsObjects_(ss.getSheetByName(SHEETS.TRANSACTIONS));
  const moved = {};
  transactions.forEach(function (transaction) {
    const fileId = String(transaction.ReceiptFileId || '');
    if (!fileId || moved[fileId]) return;
    moved[fileId] = true;
    try {
      const file = DriveApp.getFileById(fileId);
      if (!file.isTrashed()) file.moveTo(getOrCreateChildFolder_(receiptsFolder, financialYearFolderName_(transaction.Date)));
    } catch (error) {
      console.warn('Could not move receipt ' + fileId + ': ' + error.message);
    }
  });
}

function saveRawImport_(folder, filename, csvText) {
  const safeName = String(filename || 'bank-import.csv').replace(/[^a-zA-Z0-9._ -]/g, '_');
  const timestamp = Utilities.formatDate(new Date(), 'Australia/Sydney', 'yyyyMMdd-HHmmss');
  const blob = Utilities.newBlob(String(csvText), 'text/csv', timestamp + '-' + safeName);
  return folder.createFile(blob);
}

function ensureCurrentSchema_(ss) {
  Object.keys(HEADERS).forEach(function (name) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) initialiseSheet_(ss.insertSheet(name), HEADERS[name]);
    else ensureSheetHeaders_(sheet, HEADERS[name]);
  });
  const categories = ss.getSheetByName(SHEETS.CATEGORIES);
  const hasSplit = rowsAsObjects_(categories).some(function (row) { return String(row.Name) === 'Split'; });
  if (!hasSplit) categories.appendRow(['Split', 'System', '#5f6c7b', true]);
  ensureDefaultSubcategories_(categories);
}

function ensureDefaultSubcategories_(sheet) {
  const existing = rowsAsObjects_(sheet).map(function (row) { return String(row.Name).toLowerCase(); });
  const defaults = [
    ['Electricity', 'Household', '#f2b544', true, 'Bills & utilities'],
    ['Gas', 'Household', '#ef7d57', true, 'Bills & utilities'],
    ['Phone', 'Household', '#4f86f7', true, 'Bills & utilities'],
    ['Internet', 'Household', '#7257d7', true, 'Bills & utilities']
  ];
  defaults.forEach(function (row) {
    if (existing.indexOf(String(row[0]).toLowerCase()) === -1) sheet.appendRow(row);
  });
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

  const categoryRows = [
    ['Groceries', 'Household', '#11a683', true, ''], ['Dining', 'Lifestyle', '#f9735b', true, ''],
    ['Transport', 'Household', '#4f86f7', true, ''], ['Bills & utilities', 'Household', '#7257d7', true, ''],
    ['Electricity', 'Household', '#f2b544', true, 'Bills & utilities'], ['Gas', 'Household', '#ef7d57', true, 'Bills & utilities'],
    ['Phone', 'Household', '#4f86f7', true, 'Bills & utilities'], ['Internet', 'Household', '#7257d7', true, 'Bills & utilities'],
    ['Home', 'Household', '#e6a23c', true, ''], ['Health', 'Personal', '#df5b86', true, ''],
    ['Shopping', 'Lifestyle', '#8b6f47', true, ''], ['Income', 'Income', '#14855f', true, ''],
    ['Transfers', 'Excluded', '#7b8794', true, ''], ['Software', 'Work', '#4158d0', true, ''],
    ['Professional fees', 'Work', '#6d4aff', true, ''], ['Donations', 'Tax', '#bd5b18', true, ''],
    ['Uncategorised', 'Review', '#9aa5b1', true, '']
  ];
  ss.getSheetByName(SHEETS.CATEGORIES).getRange(2, 1, categoryRows.length, categoryRows[0].length).setValues(categoryRows);

  const ruleRows = [
    [Utilities.getUuid(), 'WOOLWORTHS', 'contains', '', 'Groceries', 'Joint', 'Not deductible', 0, 80, true, new Date()],
    [Utilities.getUuid(), 'COLES', 'contains', '', 'Groceries', 'Joint', 'Not deductible', 0, 80, true, new Date()],
    [Utilities.getUuid(), 'ALDI', 'contains', '', 'Groceries', 'Joint', 'Not deductible', 0, 80, true, new Date()],
    [Utilities.getUuid(), 'UBER', 'contains', '', 'Transport', 'Joint', 'Not deductible', 0, 40, true, new Date()],
    [Utilities.getUuid(), 'ADOBE', 'contains', '', 'Software', 'Joint', 'Needs review', 0, 60, true, new Date()]
  ];
  ss.getSheetByName(SHEETS.RULES).getRange(2, 1, ruleRows.length, ruleRows[0].length).setValues(ruleRows);
  ss.getSheetByName(SHEETS.SETTINGS).getRange(2, 1, 3, 2).setValues([
    ['Currency', 'AUD'], ['Locale', 'en-AU'], ['FinancialYearStartMonth', '7']
  ]);
}

function rowsAsObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter(function (row) { return row.some(function (cell) { return cell !== ''; }); }).map(function (row) {
    return headers.reduce(function (obj, key, i) { obj[key] = row[i]; return obj; }, {});
  });
}

function serializeTransaction_(row) {
  const out = {};
  Object.keys(row).forEach(function (key) {
    const camel = key.charAt(0).toLowerCase() + key.slice(1);
    out[camel] = row[key] instanceof Date ? Utilities.formatDate(row[key], 'Australia/Sydney', key === 'Date' ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm:ss") : row[key];
  });
  out.amount = Number(out.amount || 0);
  out.deductiblePercent = Number(out.deductiblePercent || 0);
  out.confidence = Number(out.confidence || 0);
  out.reviewed = truthy_(out.reviewed);
  return out;
}

function serializeRow_(row) {
  return JSON.parse(JSON.stringify(row));
}

function detectColumns_(headers) {
  const norm = headers.map(function (h) { return String(h).trim().toLowerCase().replace(/[^a-z0-9]+/g, ' '); });
  function find(names) {
    for (let i = 0; i < names.length; i += 1) {
      const idx = norm.indexOf(names[i]);
      if (idx >= 0) return idx;
    }
    return -1;
  }
  const mapping = {
    date: find(['date', 'transaction date', 'processed date', 'effective date']),
    description: find(['description', 'transaction details', 'narrative', 'details', 'merchant']),
    amount: find(['amount', 'transaction amount']),
    debit: find(['debit', 'withdrawal', 'debit amount']),
    credit: find(['credit', 'deposit', 'credit amount'])
  };
  if (mapping.date < 0 || mapping.description < 0 || (mapping.amount < 0 && mapping.debit < 0 && mapping.credit < 0)) {
    throw new Error('Could not recognise the CSV columns. Include Date, Description and Amount, or Debit/Credit columns.');
  }
  return mapping;
}

function normaliseCsvRow_(row, mapping, account) {
  const description = String(row[mapping.description] || '').trim();
  if (!description) return null;
  const date = parseDate_(row[mapping.date]);
  let amount;
  if (mapping.amount >= 0) {
    amount = parseMoney_(row[mapping.amount]);
  } else {
    const debit = mapping.debit >= 0 ? Math.abs(parseMoney_(row[mapping.debit])) : 0;
    const credit = mapping.credit >= 0 ? Math.abs(parseMoney_(row[mapping.credit])) : 0;
    amount = credit - debit;
  }
  if (!date || !isFinite(amount) || amount === 0) return null;
  return { date: date, description: description, amount: amount, account: account };
}

function parseDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const text = String(value || '').trim();
  let match = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (match) {
    let year = Number(match[3]);
    if (year < 100) year += 2000;
    const date = new Date(year, Number(match[2]) - 1, Number(match[1]));
    return isNaN(date.getTime()) ? null : date;
  }
  const parsed = new Date(text);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function parseMoney_(value) {
  let text = String(value == null ? '' : value).trim();
  const negative = /^\(.*\)$/.test(text);
  text = text.replace(/[,$()\sAUD]/gi, '');
  const number = Number(text || 0);
  return negative ? -Math.abs(number) : number;
}

function classify_(description, account, rules) {
  const upper = String(description).toUpperCase();
  const sorted = rules.slice().sort(function (a, b) { return Number(b.Priority || 0) - Number(a.Priority || 0); });
  for (let i = 0; i < sorted.length; i += 1) {
    const rule = sorted[i];
    if (rule.Account && String(rule.Account) !== String(account)) continue;
    const pattern = String(rule.Pattern || '').toUpperCase();
    let matched = false;
    if (rule.MatchType === 'exact') matched = upper === pattern;
    else if (rule.MatchType === 'starts with') matched = upper.indexOf(pattern) === 0;
    else matched = upper.indexOf(pattern) !== -1;
    if (matched) {
      return {
        merchant: merchantName_(description), category: rule.Category, owner: rule.Owner,
        taxStatus: rule.TaxStatus, deductiblePercent: rule.DeductiblePercent, tags: normaliseTags_(rule.Tags), confidence: 1
      };
    }
  }
  return { merchant: merchantName_(description), category: 'Uncategorised', owner: '', taxStatus: 'Needs review', deductiblePercent: 0, tags: '', confidence: 0 };
}

function merchantName_(description) {
  return String(description)
    .toUpperCase()
    .replace(/\b(AUS|AU|NSW|VIC|QLD|SA|WA|TAS|ACT|NT)\b/g, '')
    .replace(/\b\d{3,}\b/g, '')
    .replace(/[^A-Z0-9&' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 4)
    .map(function (word) { return word.charAt(0) + word.slice(1).toLowerCase(); })
    .join(' ') || 'Unknown merchant';
}

function transactionHash_(date, description, amount, account) {
  const dateText = Utilities.formatDate(new Date(date), 'Australia/Sydney', 'yyyy-MM-dd');
  const input = [dateText, String(description).trim().toUpperCase(), Number(amount).toFixed(2), String(account)].join('|');
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  return digest.map(function (byte) { const v = byte < 0 ? byte + 256 : byte; return ('0' + v.toString(16)).slice(-2); }).join('');
}

function findRowByValue_(sheet, column, value) {
  if (sheet.getLastRow() < 2) return 0;
  const values = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i += 1) if (String(values[i][0]) === String(value)) return i + 2;
  return 0;
}

function truthy_(value) {
  return value === true || String(value).toLowerCase() === 'true' || value === 1;
}

function normaliseTags_(value) {
  const input = Array.isArray(value) ? value : String(value || '').split(',');
  const seen = {};
  return input.map(function (tag) { return String(tag).trim(); }).filter(function (tag) {
    const key = tag.toLowerCase();
    if (!tag || seen[key]) return false;
    seen[key] = true;
    return true;
  }).join(', ');
}
