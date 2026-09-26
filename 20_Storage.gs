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
