const HOUSEHOLD_CATEGORY_TREE = [
  { group: 'Incoming funds', colour: '#14855f', categories: [
    ['Employment income', ['Salary and wages', 'Overtime and bonuses']],
    ['Benefits received', ['Pension', 'Centrelink allowances', 'Family Tax Benefit', 'Superannuation received']],
    ['Child support received', []],
    ['Sale of assets', ['Vehicle sale', 'Real estate sale', 'Other asset sale']],
    ['Gifts received', []], ['Inheritance', []],
    ['Dividends and interest', ['Dividends', 'Interest income']],
    ['Windfall gains', ['Prizes', 'Lottery and gambling winnings']],
    ['Other incoming funds', ['Scholarships and grants', 'Business and rental income', 'Miscellaneous incoming funds']],
    ['Reimbursements', ['Employer reimbursement', 'Insurance reimbursement', 'Shared-expense repayment']]
  ]},
  { group: 'Home & household', colour: '#e6a23c', categories: [
    ['Housing', ['Rent', 'Mortgage payments', 'Home insurance', 'Home maintenance', 'Council rates and taxes', 'Body corporate fees', 'Renovations']],
    ['Furnishings and equipment', ['Furniture', 'Appliances', 'Linen', 'Kitchenware', 'Household tools']],
    ['Food and groceries', ['General groceries', 'Meat', 'Fruit and vegetables', 'Pet food', 'Alcohol and tobacco']],
    ['Utilities', ['Electricity and heating', 'Gas', 'Water and sewerage']],
    ['Household services', ['Phone', 'Internet', 'Postage', 'Pest control', 'Gardening', 'Swimming pool costs', 'Housekeeping', 'Security']]
  ]},
  { group: 'Lifestyle & personal', colour: '#f9735b', categories: [
    ['Entertainment and recreation', ['Eating out', 'Takeaways', 'Lunches and coffees', 'Home entertainment', 'Computers and software', 'Books and publications', 'Sporting equipment and toys', 'Sporting fees', 'Cinema theatre and concerts', 'Streaming and pay TV', 'Entrance fees', 'Lottery and gambling']],
    ['Clothing', ['Clothing and footwear', 'Work clothing']],
    ['Grooming', ['Personal care', 'Toiletries', 'Cosmetics', 'Haircuts']]
  ]},
  { group: 'Transport', colour: '#4f86f7', categories: [
    ['Motor vehicles', ['Vehicle payments', 'Fuel', 'Tyres', 'Vehicle registration', 'Vehicle insurance', 'Vehicle maintenance', 'Parking and tolls']],
    ['Public transport', ['Train', 'Tram', 'Bus', 'Ferry']],
    ['Bicycle', ['Bicycle purchase', 'Bicycle maintenance', 'Bicycle accessories']],
    ['Taxi and rideshare', []]
  ]},
  { group: 'Health care', colour: '#df5b86', categories: [
    ['Health care', ['Health insurance', 'Medicine and natural remedies', 'Doctor and specialist', 'Dental care', 'Optical care', 'Physiotherapy and massage', 'Chiropractic and acupuncture']]
  ]},
  { group: 'Family & education', colour: '#8c6dd7', categories: [
    ['Schooling', ['Private school fees', 'School books and uniforms', 'School incidentals', 'University expenses', 'Childcare']],
    ['Child support payments', []],
    ['Other household expenses', ['Money transferred overseas', 'Support of relatives', 'Pet care', 'Gifts and donations', 'Professional services', 'Miscellaneous household expense']]
  ]},
  { group: 'Holidays', colour: '#00a0a8', categories: [
    ['Holidays', ['Domestic airfares', 'International airfares', 'Holiday accommodation', 'Camping fees', 'Holiday activities']]
  ]},
  { group: 'Financial costs', colour: '#6d4aff', categories: [
    ['Bank and loan costs', ['Bank fees', 'Credit-card interest and fees', 'Loan interest and fees']],
    ['Tax payments', ['Income tax payment', 'PAYG instalments', 'Other ATO payment']]
  ]},
  { group: 'Financial movements', colour: '#7b8794', categories: [
    ['Superannuation contributions', []],
    ['Loan repayments', ['Credit-card payment', 'Line-of-credit repayment', 'Personal-loan repayment']],
    ['Significant purchases', ['Shares', 'Other investments']],
    ['Bank account deposits', ['Savings deposits', 'Emergency savings', 'Goal savings']],
    ['Loans received', ['Family loan received', 'Other non-business loan']],
    ['Account transfers', ['Own-account transfer', 'Joint-account transfer']],
    ['Cash movements', ['Cash withdrawal', 'Cash deposit']]
  ]}
];

const DEFAULT_HOUSEHOLD_TAGS = [
  ['Work', '#4158d0'], ['Reimbursable', '#e08a18'], ['Primary home', '#e6a23c'],
  ['Rental property', '#8c6dd7'], ['Car 1', '#4f86f7'], ['Car 2', '#3b6fc4'],
  ['Holiday', '#00a0a8'], ['Renovation', '#a36b3f'], ['Recurring', '#526b88'],
  ['Tax document', '#bd5b18']
];

const LEGACY_CATEGORY_MAP = {
  'Dining': 'Entertainment and recreation', 'Dining out': 'Entertainment and recreation',
  'Takeaway': 'Entertainment and recreation', 'Transport': 'Motor vehicles',
  'Bills & utilities': 'Utilities', 'Mobile phone': 'Phone', 'Home internet': 'Internet',
  'Internet and telephone': 'Household services', 'Communications': 'Household services',
  'Home': 'Housing', 'General home': 'Housing', 'Home maintenance': 'Housing',
  'Household purchases': 'Furnishings and equipment', 'Groceries': 'Food and groceries',
  'Alcohol': 'Alcohol and tobacco', 'Health': 'Health care', 'General health': 'Health care',
  'Medical': 'Health care', 'Pharmacy': 'Health care', 'Allied health': 'Health care',
  'Fitness': 'Entertainment and recreation', 'Shopping': 'Other household expenses',
  'General personal': 'Other household expenses', 'Income': 'Other incoming funds',
  'Other income': 'Other incoming funds', 'Car running': 'Motor vehicles',
  'General transport': 'Motor vehicles', 'Children': 'Schooling', 'Education': 'Schooling',
  'Pets': 'Pet care', 'Personal care': 'Grooming', 'Gifts': 'Gifts and donations',
  'Entertainment': 'Entertainment and recreation', 'Hobbies and recreation': 'Entertainment and recreation',
  'Subscriptions': 'Entertainment and recreation', 'Travel': 'Holidays',
  'Home insurance': 'Housing', 'Vehicle insurance': 'Motor vehicles', 'Health insurance': 'Health care',
  'Life and income protection': 'Health care', 'Bank and card fees': 'Bank and loan costs',
  'Loan costs': 'Bank and loan costs', 'Professional fees': 'Professional services',
  'Charitable giving': 'Gifts and donations', 'Donations': 'Gifts and donations'
};

const MANAGED_CATEGORY_GROUPS = [
  'Income', 'Home', 'Housing', 'Food', 'Food & groceries', 'Food & drink', 'Transport',
  'Insurance', 'Health', 'Health care', 'Children & education', 'Education & children',
  'Family', 'Family & household', 'Personal', 'Pets', 'Entertainment & recreation',
  'Dining & entertainment', 'Lifestyle', 'Travel', 'Holidays', 'Subscriptions',
  'Utilities & services', 'Financial & administrative', 'Financial', 'Financial costs',
  'Financial movements', 'Giving', 'Incoming funds', 'Home & household',
  'Lifestyle & personal', 'Family & education', 'Transfers', 'Review', 'System'
];

function householdCategoryRows_() {
  const rows = [];
  const names = {};
  HOUSEHOLD_CATEGORY_TREE.forEach(function (section) {
    section.categories.forEach(function (category) {
      appendUniqueCategoryRow_(rows, names, [category[0], section.group, section.colour, true, '']);
      category[1].forEach(function (subcategory) {
        appendUniqueCategoryRow_(rows, names, [subcategory, section.group, section.colour, true, category[0]]);
      });
    });
  });
  [
    ['Transfers', 'Transfers', '#7b8794', true, ''],
    ['Balance adjustment', 'System', '#5f6c7b', true, ''],
    ['Split', 'System', '#5f6c7b', true, ''],
    ['Uncategorised', 'Review', '#9aa5b1', true, '']
  ].forEach(function (row) { appendUniqueCategoryRow_(rows, names, row); });
  return rows;
}

function appendUniqueCategoryRow_(rows, names, row) {
  const key = String(row[0]).toLowerCase();
  if (names[key]) throw new Error('Duplicate category name in household catalogue: ' + row[0]);
  names[key] = true;
  rows.push(row);
}

function installHouseholdCategorySet() {
  assertAccess_();
  const ss = getSpreadsheet_();
  ensureCurrentSchema_(ss);
  const migrated = migrateLegacyCategories_(ss);
  const categoryRows = householdCategoryRows_();
  const categoryResult = upsertCategoryRows_(ss.getSheetByName(SHEETS.CATEGORIES), categoryRows);
  const cleanupResult = retireDetailedCategories_(ss, categoryRows);
  const tagResult = upsertDefaultTags_(ss.getSheetByName(SHEETS.TAGS));
  return {
    ok: true, migratedReferences: migrated, categoriesAdded: categoryResult.added,
    categoriesUpdated: categoryResult.updated, categoriesRetired: cleanupResult.retired,
    transactionsReturnedToReview: cleanupResult.transactions,
    rulesDisabled: cleanupResult.rules, tagsAdded: tagResult
  };
}

function installAtoHouseholdCategorySet() {
  return installHouseholdCategorySet();
}

function installBasicHouseholdCategorySet() {
  return installHouseholdCategorySet();
}

function migrateLegacyCategories_(ss) {
  let changed = 0;
  Object.keys(LEGACY_CATEGORY_MAP).forEach(function (oldName) {
    const newName = LEGACY_CATEGORY_MAP[oldName];
    if (oldName === newName) return;
    changed += replaceCategoryReferences_(ss, oldName, newName);
    mergeLegacyCategoryRow_(ss.getSheetByName(SHEETS.CATEGORIES), oldName, newName);
  });
  return changed;
}

function replaceCategoryReferences_(ss, oldName, newName) {
  let changed = 0;
  [[SHEETS.TRANSACTIONS, 'Category'], [SHEETS.RULES, 'Category'], [SHEETS.SPLITS, 'Category'], [SHEETS.BUDGETS, 'Category'], [SHEETS.CATEGORIES, 'Parent']]
    .forEach(function (target) {
      const sheet = ss.getSheetByName(target[0]);
      const column = HEADERS[target[0]].indexOf(target[1]) + 1;
      if (!sheet || !column || sheet.getLastRow() < 2) return;
      const range = sheet.getRange(2, column, sheet.getLastRow() - 1, 1);
      const values = range.getValues();
      let sheetChanged = false;
      values.forEach(function (row) {
        if (String(row[0]) === oldName) { row[0] = newName; changed += 1; sheetChanged = true; }
      });
      if (sheetChanged) range.setValues(values);
    });
  return changed;
}

function mergeLegacyCategoryRow_(sheet, oldName, newName) {
  const oldRow = findRowByValue_(sheet, 1, oldName);
  if (!oldRow) return;
  const newRow = findRowByValue_(sheet, 1, newName);
  if (newRow && newRow !== oldRow) sheet.getRange(oldRow, HEADERS.Categories.indexOf('Active') + 1).setValue(false);
  else sheet.getRange(oldRow, 1).setValue(newName);
}

function upsertCategoryRows_(sheet, rows) {
  let added = 0;
  let updated = 0;
  rows.forEach(function (row) {
    const rowNumber = findRowByValue_(sheet, 1, row[0]);
    if (rowNumber) { sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]); updated += 1; }
    else { sheet.appendRow(row); added += 1; }
  });
  return { added: added, updated: updated };
}

function retireDetailedCategories_(ss, activeRows) {
  const active = {};
  activeRows.forEach(function (row) { active[String(row[0])] = true; });
  const sheet = ss.getSheetByName(SHEETS.CATEGORIES);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const nameIndex = headers.indexOf('Name');
  const groupIndex = headers.indexOf('Group');
  const activeIndex = headers.indexOf('Active');
  let retired = 0;
  for (let i = 1; i < values.length; i += 1) {
    const name = String(values[i][nameIndex] || '');
    const group = String(values[i][groupIndex] || '');
    if (!active[name] && MANAGED_CATEGORY_GROUPS.indexOf(group) !== -1 && truthy_(values[i][activeIndex])) {
      values[i][activeIndex] = false;
      retired += 1;
    }
  }
  if (values.length > 1) sheet.getRange(2, 1, values.length - 1, headers.length).setValues(values.slice(1));
  return { retired: retired, transactions: markRetiredTransactionsForReview_(ss, active), rules: disableRetiredCategoryRules_(ss, active) };
}

function markRetiredTransactionsForReview_(ss, active) {
  const sheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  if (sheet.getLastRow() < 2) return 0;
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const categoryIndex = headers.indexOf('Category');
  const reviewedIndex = headers.indexOf('Reviewed');
  let changed = 0;
  for (let i = 1; i < values.length; i += 1) {
    const category = String(values[i][categoryIndex] || 'Uncategorised');
    if (!active[category] && truthy_(values[i][reviewedIndex])) { values[i][reviewedIndex] = false; changed += 1; }
  }
  sheet.getRange(2, 1, values.length - 1, headers.length).setValues(values.slice(1));
  return changed;
}

function disableRetiredCategoryRules_(ss, active) {
  const sheet = ss.getSheetByName(SHEETS.RULES);
  if (sheet.getLastRow() < 2) return 0;
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const categoryIndex = headers.indexOf('Category');
  const activeIndex = headers.indexOf('Active');
  let changed = 0;
  for (let i = 1; i < values.length; i += 1) {
    const category = String(values[i][categoryIndex] || 'Uncategorised');
    if (!active[category] && truthy_(values[i][activeIndex])) { values[i][activeIndex] = false; changed += 1; }
  }
  sheet.getRange(2, 1, values.length - 1, headers.length).setValues(values.slice(1));
  return changed;
}

function upsertDefaultTags_(sheet) {
  let added = 0;
  DEFAULT_HOUSEHOLD_TAGS.forEach(function (tag) {
    const rowNumber = findRowByValue_(sheet, 1, tag[0]);
    if (rowNumber) sheet.getRange(rowNumber, 1, 1, 3).setValues([[tag[0], tag[1], true]]);
    else { sheet.appendRow([tag[0], tag[1], true]); added += 1; }
  });
  return added;
}
