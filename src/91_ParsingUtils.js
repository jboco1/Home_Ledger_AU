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

function transactionHash_(date, description, amount, account) {
  const dateText = Utilities.formatDate(new Date(date), 'Australia/Sydney', 'yyyy-MM-dd');
  const input = [dateText, String(description).trim().toUpperCase(), Number(amount).toFixed(2), String(account)].join('|');
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  return digest.map(function (byte) { const v = byte < 0 ? byte + 256 : byte; return ('0' + v.toString(16)).slice(-2); }).join('');
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
