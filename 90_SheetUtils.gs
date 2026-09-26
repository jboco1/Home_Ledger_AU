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

function findRowByValue_(sheet, column, value) {
  if (sheet.getLastRow() < 2) return 0;
  const values = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i += 1) if (String(values[i][0]) === String(value)) return i + 2;
  return 0;
}
