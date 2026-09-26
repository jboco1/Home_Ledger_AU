function saveCategory(category) {
  assertAccess_();
  const name = String(category && category.name || '').trim();
  if (!name) throw new Error('Category name is required.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.CATEGORIES);
  const rows = rowsAsObjects_(sheet);
  const existingIndex = rows.findIndex(function (row) { return String(row.Name).toLowerCase() === name.toLowerCase(); });
  if (existingIndex !== -1 && truthy_(rows[existingIndex].Active)) throw new Error('That category already exists.');
  const parent = String(category.parent || '').trim();
  if (parent && parent === name) throw new Error('A category cannot be its own parent.');
  let group = String(category.group || 'Other');
  if (parent) {
    const parentCategory = rows.filter(function (row) { return String(row.Name) === parent && truthy_(row.Active) && !row.Parent; })[0];
    if (!parentCategory) throw new Error('The selected parent category is not available.');
    group = String(parentCategory.Group || group);
  }
  const colour = category.colour || '#4f86f7';
  const values = [name, group, colour, true, parent];
  if (existingIndex !== -1) sheet.getRange(existingIndex + 2, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
  return { ok: true, category: { Name: name, Group: group, Colour: colour, Active: true, Parent: parent } };
}

function archiveCategory(name) {
  assertAccess_();
  const protectedNames = ['Uncategorised', 'Transfers', 'Split', 'Balance adjustment'];
  if (protectedNames.indexOf(String(name)) !== -1) throw new Error('This system category cannot be archived.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.CATEGORIES);
  const hasChildren = rowsAsObjects_(sheet).some(function (row) { return String(row.Parent) === String(name) && truthy_(row.Active); });
  if (hasChildren) throw new Error('Archive or move this category’s active subcategories first.');
  const row = findRowByValue_(sheet, 1, name);
  if (!row) throw new Error('Category not found.');
  sheet.getRange(row, HEADERS.Categories.indexOf('Active') + 1).setValue(false);
  return { ok: true };
}
