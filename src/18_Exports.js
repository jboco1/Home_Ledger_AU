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
