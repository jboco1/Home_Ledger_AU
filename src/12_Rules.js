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
