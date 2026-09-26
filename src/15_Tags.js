function saveTag(tag) {
  assertAccess_();
  const name = String(tag && tag.name || '').trim();
  if (!name) throw new Error('Tag name is required.');
  if (name.indexOf(',') !== -1) throw new Error('Tag names cannot contain commas.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.TAGS);
  const colour = validTagColour_(tag.colour);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][0]).toLowerCase() !== name.toLowerCase()) continue;
    if (truthy_(values[i][2])) throw new Error('That tag already exists.');
    sheet.getRange(i + 1, HEADERS.Tags.indexOf('Colour') + 1).setValue(colour);
    sheet.getRange(i + 1, HEADERS.Tags.indexOf('Active') + 1).setValue(true);
    return { ok: true, tag: { Name: name, Colour: colour, Active: true } };
  }
  sheet.appendRow([name, colour, true]);
  return { ok: true, tag: { Name: name, Colour: colour, Active: true } };
}

function updateTagColour(name, colour) {
  assertAccess_();
  const tagName = String(name || '').trim();
  if (!tagName) throw new Error('Tag name is required.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.TAGS);
  const row = findRowByValue_(sheet, 1, tagName);
  if (!row) throw new Error('Tag not found.');
  const safeColour = validTagColour_(colour);
  sheet.getRange(row, HEADERS.Tags.indexOf('Colour') + 1).setValue(safeColour);
  return { ok: true, tag: { Name: tagName, Colour: safeColour, Active: true } };
}

function validTagColour_(colour) {
  const value = String(colour || '#18a889').trim();
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error('Choose a valid tag colour.');
  return value.toLowerCase();
}

function archiveTag(name) {
  assertAccess_();
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.TAGS);
  const row = findRowByValue_(sheet, 1, name);
  if (!row) throw new Error('Tag not found.');
  sheet.getRange(row, HEADERS.Tags.indexOf('Active') + 1).setValue(false);
  return { ok: true };
}
