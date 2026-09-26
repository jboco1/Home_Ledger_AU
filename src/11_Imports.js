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
    const hash = transactionHash_(normal.date, normal.description, normal.amount, payload.account, normal.card);
    if (existingHashes.has(hash)) { duplicates += 1; return; }
    existingHashes.add(hash);
    const classification = classify_(normal.description, normal.amount, payload.account, rules);
    output.push([
      Utilities.getUuid(), normal.date, normal.description, classification.merchant,
      normal.amount, payload.account, classification.owner || payload.owner || 'Joint',
      classification.category || 'Uncategorised', classification.taxStatus || 'Not deductible',
      Number(classification.deductiblePercent || 0), Number(classification.confidence || 0),
      payload.filename || 'CSV import', hash, classification.confidence >= 0.95,
      '', '', '', now, now, classification.tags || '', normal.card || '', normal.sourceCategory || ''
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
    credit: find(['credit', 'deposit', 'credit amount']),
    card: find(['card', 'card number', 'card no', 'cardholder', 'card holder', 'card member', 'card name']),
    sourceCategory: find(['category', 'transaction category', 'bank category', 'source category', 'category name'])
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
  const card = mapping.card >= 0 ? String(row[mapping.card] || '').trim() : '';
  const sourceCategory = mapping.sourceCategory >= 0 ? String(row[mapping.sourceCategory] || '').trim() : '';
  return { date: date, description: description, amount: amount, account: account, card: card, sourceCategory: sourceCategory };
}
