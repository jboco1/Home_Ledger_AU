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
