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
