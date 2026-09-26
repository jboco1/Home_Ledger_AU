function saveCategory(category) {
  assertAccess_();
  const name = String(category && category.name || '').trim();
  if (!name) throw new Error('Category name is required.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.CATEGORIES);
  const existing = rowsAsObjects_(sheet).some(function (row) { return String(row.Name).toLowerCase() === name.toLowerCase() && truthy_(row.Active); });
  if (existing) throw new Error('That category already exists.');
  const parent = String(category.parent || '').trim();
  if (parent && parent === name) throw new Error('A category cannot be its own parent.');
  if (parent) {
    const parentExists = rowsAsObjects_(sheet).some(function (row) { return String(row.Name) === parent && truthy_(row.Active); });
    if (!parentExists) throw new Error('The selected parent category is not available.');
  }
  sheet.appendRow([name, category.group || 'Other', category.colour || '#4f86f7', true, parent]);
  return { ok: true };
}

function archiveCategory(name) {
  assertAccess_();
  const protectedNames = ['Uncategorised', 'Transfers', 'Split'];
  if (protectedNames.indexOf(String(name)) !== -1) throw new Error('This system category cannot be archived.');
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.CATEGORIES);
  const hasChildren = rowsAsObjects_(sheet).some(function (row) { return String(row.Parent) === String(name) && truthy_(row.Active); });
  if (hasChildren) throw new Error('Archive or move this category’s active subcategories first.');
  const row = findRowByValue_(sheet, 1, name);
  if (!row) throw new Error('Category not found.');
  sheet.getRange(row, HEADERS.Categories.indexOf('Active') + 1).setValue(false);
  return { ok: true };
}
