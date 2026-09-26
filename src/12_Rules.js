function saveRule(rule) {
  assertAccess_();
  if (!rule) throw new Error('Rule details are required.');
  const pattern = String(rule.pattern || '').trim();
  const amountOperator = normaliseAmountOperator_(rule.amountOperator);
  if (!pattern && amountOperator === 'none') throw new Error('Enter a description pattern, an amount condition, or both.');
  const amounts = validateRuleAmounts_(amountOperator, rule.amountMin, rule.amountMax);
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.RULES);
  sheet.appendRow([
    Utilities.getUuid(), pattern.toUpperCase(), rule.matchType || 'contains',
    rule.account || '', rule.category || 'Uncategorised', rule.owner || 'Joint',
    rule.taxStatus || 'Not deductible', Number(rule.deductiblePercent || 0),
    Number(rule.priority || 50), true, new Date(), normaliseTags_(rule.tags),
    amountOperator, amounts.min, amounts.max
  ]);
  return { ok: true };
}

function normaliseAmountOperator_(value) {
  const operator = String(value || 'none').toLowerCase();
  return ['none', 'equals', 'above', 'below', 'between'].indexOf(operator) !== -1 ? operator : 'none';
}

function validateRuleAmounts_(operator, minValue, maxValue) {
  if (operator === 'none') return { min: '', max: '' };
  const minText = String(minValue == null ? '' : minValue).trim();
  const maxText = String(maxValue == null ? '' : maxValue).trim();
  if (!minText || !isFinite(Number(minText)) || Number(minText) < 0) throw new Error('Enter a valid non-negative amount.');
  const min = Math.round(Number(minText) * 100) / 100;
  if (operator !== 'between') return { min: min, max: '' };
  if (!maxText || !isFinite(Number(maxText)) || Number(maxText) < 0) throw new Error('Enter a valid maximum amount.');
  const max = Math.round(Number(maxText) * 100) / 100;
  if (max < min) throw new Error('The maximum amount must be greater than or equal to the minimum amount.');
  return { min: min, max: max };
}

function deleteRule(id) {
  assertAccess_();
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.RULES);
  const row = findRowByValue_(sheet, 1, id);
  if (!row) throw new Error('Rule not found.');
  sheet.deleteRow(row);
  return { ok: true };
}

function classify_(description, amount, account, rules) {
  const upper = String(description).toUpperCase();
  const absoluteAmount = Math.abs(Number(amount || 0));
  const sorted = rules.slice().sort(function (a, b) { return Number(b.Priority || 0) - Number(a.Priority || 0); });
  for (let i = 0; i < sorted.length; i += 1) {
    const rule = sorted[i];
    if (rule.Account && String(rule.Account) !== String(account)) continue;
    const pattern = String(rule.Pattern || '').toUpperCase();
    let descriptionMatched = !pattern;
    if (pattern && rule.MatchType === 'exact') descriptionMatched = upper === pattern;
    else if (pattern && rule.MatchType === 'starts with') descriptionMatched = upper.indexOf(pattern) === 0;
    else if (pattern) descriptionMatched = upper.indexOf(pattern) !== -1;
    if (descriptionMatched && amountRuleMatches_(absoluteAmount, rule)) {
      return {
        merchant: merchantName_(description), category: rule.Category, owner: rule.Owner,
        taxStatus: rule.TaxStatus, deductiblePercent: rule.DeductiblePercent, tags: normaliseTags_(rule.Tags), confidence: 1
      };
    }
  }
  return { merchant: merchantName_(description), category: 'Uncategorised', owner: '', taxStatus: 'Needs review', deductiblePercent: 0, tags: '', confidence: 0 };
}

function amountRuleMatches_(amount, rule) {
  const operator = normaliseAmountOperator_(rule.AmountOperator);
  if (operator === 'none') return true;
  const min = Number(rule.AmountMin);
  const max = Number(rule.AmountMax);
  if (!isFinite(min)) return false;
  if (operator === 'equals') return Math.abs(amount - min) < 0.005;
  if (operator === 'above') return amount > min;
  if (operator === 'below') return amount < min;
  if (operator === 'between') return isFinite(max) && amount >= min && amount <= max;
  return true;
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
