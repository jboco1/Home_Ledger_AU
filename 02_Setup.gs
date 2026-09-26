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
