const HOUSEHOLD_CATEGORY_TREE = [
  { group: 'Income', colour: '#14855f', categories: [
    ['Employment', ['Regular salary', 'Wages', 'Overtime', 'Bonus', 'Commission', 'Employment allowances']],
    ['Business', ['Sales revenue', 'Consulting income', 'Contract income', 'Other business income']],
    ['Government payments', ['Family assistance', 'Pension', 'JobSeeker', 'Carer payment', 'Other government payment']],
    ['Investment income', ['Bank interest', 'Dividends', 'Trust distributions', 'Capital gains']],
    ['Property income', ['Residential rent received', 'Commercial rent received', 'Short-stay income']],
    ['Retirement income', ['Superannuation pension', 'Annuity income']],
    ['Other income', ['Gifts received', 'Prizes received', 'Marketplace sales', 'Miscellaneous income']],
    ['Reimbursements', ['Employer reimbursement', 'Insurance reimbursement', 'Shared-expense repayment']]
  ]},
  { group: 'Home', colour: '#e6a23c', categories: [
    ['Housing payment', ['Rent', 'Mortgage interest', 'Mortgage fees']],
    ['Property charges', ['Council rates', 'Owners corporation', 'Land tax']],
    ['Utilities', ['Electricity', 'Gas', 'Water']],
    ['Internet and telephone', ['Home internet', 'Mobile phone', 'Home phone']],
    ['Maintenance', ['Plumbing', 'Electrical work', 'Painting', 'Gardening', 'Pest control', 'General home repairs']],
    ['Improvements', ['Renovations', 'Building materials', 'Fixtures', 'Landscaping']],
    ['Furniture and appliances', ['Furniture', 'Whitegoods', 'Kitchen appliances', 'Home electronics']],
    ['Household supplies', ['Cleaning products', 'Laundry products', 'Paper products', 'General homewares']],
    ['Household services', ['Cleaning service', 'Gardening service', 'Security monitoring', 'Waste removal']],
    ['General home', []]
  ]},
  { group: 'Food & drink', colour: '#11a683', categories: [
    ['Groceries', ['Supermarket', 'Fruit and vegetables', 'Butcher', 'Bakery', 'Seafood', 'Specialty food']],
    ['Dining out', ['Restaurant', 'Cafe', 'Pub meals', 'Food court']],
    ['Takeaway', ['Fast food', 'Local takeaway', 'Food delivery']],
    ['Snacks and drinks', ['Coffee', 'Snacks', 'Non-alcoholic drinks']],
    ['Alcohol', ['Bottle shop', 'Wine club', 'Brewery']],
    ['Entertaining', ['Party food', 'Barbecue supplies', 'Special-occasion food']]
  ]},
  { group: 'Transport', colour: '#4f86f7', categories: [
    ['Fuel and charging', ['Petrol', 'Diesel', 'LPG', 'EV charging']],
    ['Vehicle registration', ['Registration', 'Driver licence', 'Vehicle inspection']],
    ['Vehicle maintenance', ['Scheduled service', 'Mechanical repair', 'Tyres', 'Vehicle battery', 'Windscreen']],
    ['Vehicle accessories', ['Vehicle parts', 'Car accessories', 'Car cleaning']],
    ['Parking and tolls', ['Parking', 'Road tolls']],
    ['Public transport', ['Train', 'Tram', 'Bus', 'Ferry', 'Transport pass']],
    ['Taxi and rideshare', ['Taxi', 'Rideshare']],
    ['Bicycle', ['Bicycle purchase', 'Bicycle servicing', 'Bicycle parts', 'Bicycle accessories', 'Cycling safety gear']],
    ['Shared transport', ['Bike share', 'Scooter share', 'Car share']],
    ['Vehicle hire', ['Car rental', 'Van rental']],
    ['Other transport', ['Towing', 'Other transport fares']],
    ['General transport', []]
  ]},
  { group: 'Insurance', colour: '#526b88', categories: [
    ['Home insurance', ['Building insurance', 'Contents insurance', 'Landlord insurance']],
    ['Vehicle insurance', ['Comprehensive insurance', 'Third-party property insurance', 'CTP insurance']],
    ['Health insurance', ['Hospital cover', 'Extras cover', 'Ambulance cover']],
    ['Personal insurance', ['Life insurance', 'TPD insurance', 'Trauma insurance', 'Income protection']],
    ['Travel insurance', ['Domestic travel insurance', 'International travel insurance']],
    ['Pet insurance', ['Pet accident and illness cover', 'Pet routine-care cover']],
    ['Other insurance', ['Business insurance', 'Product insurance', 'Miscellaneous insurance']]
  ]},
  { group: 'Health', colour: '#df5b86', categories: [
    ['Medical', ['GP', 'Specialist', 'Hospital care', 'Pathology', 'Medical imaging']],
    ['Dental', ['Dental check-up', 'Dental treatment', 'Orthodontics']],
    ['Optical', ['Eye test', 'Glasses', 'Contact lenses']],
    ['Pharmacy', ['Prescription medicine', 'Non-prescription medicine', 'Medical supplies']],
    ['Allied health', ['Physiotherapy', 'Psychology', 'Chiropractic', 'Podiatry', 'Occupational therapy']],
    ['Fitness', ['Gym', 'Fitness classes', 'Sports club', 'Exercise equipment']],
    ['Wellbeing', ['Massage', 'Meditation', 'Other wellbeing']],
    ['General health', []]
  ]},
  { group: 'Children & education', colour: '#8c6dd7', categories: [
    ['Childcare', ['Daycare', 'Kindergarten', 'Before-school care', 'After-school care', 'Babysitting']],
    ['School', ['School fees', 'School uniforms', 'School books', 'School stationery', 'School excursions', 'School camps']],
    ['Tertiary education', ['University fees', 'TAFE fees', 'Tertiary course materials']],
    ['Lessons and tutoring', ['Tutoring', 'Music lessons', 'Language lessons']],
    ['Children activities', ['Children sport', 'Dance lessons', 'Children clubs', 'Children activity equipment']],
    ['Children general', ['Children clothing', 'Toys', 'Baby supplies', 'Pocket money']],
    ['Adult education', ['Adult courses', 'Conferences', 'Education books', 'Professional training']]
  ]},
  { group: 'Personal', colour: '#8b6f47', categories: [
    ['Clothing', ['Everyday clothing', 'Work clothing', 'Shoes', 'Clothing alterations']],
    ['Personal care', ['Hairdresser', 'Barber', 'Cosmetics', 'Toiletries', 'Beauty treatments']],
    ['Electronics', ['Computer', 'Mobile device', 'Tablet', 'Electronic accessories']],
    ['Gifts', ['Birthday gifts', 'Wedding gifts', 'Christmas gifts', 'Other gifts']],
    ['Family support', ['Support payments', 'Family care expenses', 'Other family assistance']],
    ['Other personal', ['Miscellaneous personal spending']],
    ['General personal', []]
  ]},
  { group: 'Pets', colour: '#a36b3f', categories: [
    ['Pet food', ['Regular pet food', 'Pet treats']],
    ['Veterinary', ['Vet check-up', 'Veterinary treatment', 'Veterinary surgery', 'Pet vaccinations']],
    ['Pet medication', ['Prescription pet medicine', 'Flea and worm treatment']],
    ['Pet care', ['Pet grooming', 'Pet boarding', 'Pet walking', 'Pet training']],
    ['Pet supplies', ['Pet bedding', 'Pet toys', 'Pet leads', 'Other pet equipment']],
    ['Pet registration', ['Council pet registration', 'Microchipping']]
  ]},
  { group: 'Entertainment & recreation', colour: '#f9735b', categories: [
    ['Entertainment', ['Cinema', 'Theatre', 'Concerts', 'Events']],
    ['Hobbies', ['Craft supplies', 'Photography', 'Recreational gardening', 'Collecting', 'Other hobbies']],
    ['Sport and recreation', ['Sports membership', 'Sports entry fees', 'Sports equipment', 'Outdoor activities']],
    ['Games', ['Video games', 'Game apps', 'Digital game purchases']],
    ['Books and media', ['Books', 'Magazines', 'Newspapers', 'Audiobooks']],
    ['Social activities', ['Parties', 'Social clubs', 'Community events']],
    ['Gambling', ['Lottery', 'Betting', 'Casino']]
  ]},
  { group: 'Travel', colour: '#00a0a8', categories: [
    ['Flights', ['Domestic flights', 'International flights', 'Airline fees']],
    ['Accommodation', ['Hotel', 'Holiday rental', 'Camping']],
    ['Tours and attractions', ['Tours', 'Attractions', 'Travel entry fees']],
    ['Travel administration', ['Passport', 'Visa', 'Travel vaccinations']],
    ['Travel communications', ['International roaming', 'Travel SIM']],
    ['Travel supplies', ['Luggage', 'Travel adapters', 'Other travel equipment']]
  ]},
  { group: 'Subscriptions', colour: '#4158d0', categories: [
    ['Video and television', ['Video streaming', 'Pay television', 'Sports streaming']],
    ['Music and audio', ['Music streaming', 'Podcast subscription']],
    ['Software', ['Productivity software', 'Security software', 'Creative software']],
    ['Cloud and online services', ['Cloud storage', 'Website services', 'Domain names']],
    ['Memberships', ['Professional memberships', 'Community memberships', 'Retail memberships']],
    ['News and publications', ['News subscription', 'Publication subscription', 'Digital publication']]
  ]},
  { group: 'Financial & administrative', colour: '#6d4aff', categories: [
    ['Bank fees', ['Account fees', 'ATM fees', 'Transaction fees']],
    ['Credit costs', ['Credit-card interest', 'Credit-card annual fee', 'Credit late fee']],
    ['Loan interest and fees', ['Personal-loan interest', 'Loan establishment fee', 'Other loan fees']],
    ['Investment fees', ['Brokerage', 'Investment platform fees', 'Investment management fees']],
    ['Currency costs', ['Foreign exchange fees', 'International transaction fees']],
    ['Professional services', ['Accountant', 'Solicitor', 'Financial adviser']],
    ['Government charges', ['Fines', 'Permits', 'Certificates']],
    ['Tax payments', ['Income tax payment', 'PAYG instalment', 'Other ATO payment']]
  ]},
  { group: 'Giving', colour: '#bd5b18', categories: [
    ['Charitable giving', ['Deductible donation', 'Non-deductible donation']],
    ['Community giving', ['Fundraiser', 'Sponsorship', 'Community support']],
    ['Religious giving', ['Regular religious contribution', 'Special religious contribution']]
  ]}
];

const DEFAULT_HOUSEHOLD_TAGS = [
  ['Work', '#4158d0'], ['Reimbursable', '#e08a18'], ['Primary home', '#e6a23c'],
  ['Rental property', '#8c6dd7'], ['Car 1', '#4f86f7'], ['Car 2', '#3b6fc4'],
  ['Holiday', '#00a0a8'], ['Renovation', '#a36b3f'], ['Recurring', '#526b88'],
  ['Tax document', '#bd5b18']
];

const LEGACY_CATEGORY_MAP = {
  'Dining': 'Dining out',
  'Transport': 'General transport',
  'Bills & utilities': 'Utilities',
  'Phone': 'Mobile phone',
  'Internet': 'Home internet',
  'Home': 'General home',
  'Health': 'General health',
  'Shopping': 'General personal',
  'Income': 'Other income',
  'Professional fees': 'Professional services',
  'Donations': 'Charitable giving'
};

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
  const categoryResult = upsertCategoryRows_(ss.getSheetByName(SHEETS.CATEGORIES), householdCategoryRows_());
  const tagResult = upsertDefaultTags_(ss.getSheetByName(SHEETS.TAGS));
  return {
    ok: true,
    migratedReferences: migrated,
    categoriesAdded: categoryResult.added,
    categoriesUpdated: categoryResult.updated,
    tagsAdded: tagResult
  };
}

function migrateLegacyCategories_(ss) {
  let changed = 0;
  Object.keys(LEGACY_CATEGORY_MAP).forEach(function (oldName) {
    const newName = LEGACY_CATEGORY_MAP[oldName];
    changed += replaceCategoryReferences_(ss, oldName, newName);
    mergeLegacyCategoryRow_(ss.getSheetByName(SHEETS.CATEGORIES), oldName, newName);
  });
  return changed;
}

function replaceCategoryReferences_(ss, oldName, newName) {
  let changed = 0;
  [
    [SHEETS.TRANSACTIONS, 'Category'], [SHEETS.RULES, 'Category'],
    [SHEETS.SPLITS, 'Category'], [SHEETS.BUDGETS, 'Category'],
    [SHEETS.CATEGORIES, 'Parent']
  ].forEach(function (target) {
    const sheet = ss.getSheetByName(target[0]);
    const column = HEADERS[target[0]].indexOf(target[1]) + 1;
    if (!sheet || !column || sheet.getLastRow() < 2) return;
    const range = sheet.getRange(2, column, sheet.getLastRow() - 1, 1);
    const values = range.getValues();
    let sheetChanged = false;
    values.forEach(function (row) {
      if (String(row[0]) === oldName) {
        row[0] = newName;
        changed += 1;
        sheetChanged = true;
      }
    });
    if (sheetChanged) range.setValues(values);
  });
  return changed;
}

function mergeLegacyCategoryRow_(sheet, oldName, newName) {
  const oldRow = findRowByValue_(sheet, 1, oldName);
  if (!oldRow) return;
  const newRow = findRowByValue_(sheet, 1, newName);
  if (newRow && newRow !== oldRow) {
    sheet.getRange(oldRow, HEADERS.Categories.indexOf('Active') + 1).setValue(false);
  } else {
    sheet.getRange(oldRow, 1).setValue(newName);
  }
}

function upsertCategoryRows_(sheet, rows) {
  let added = 0;
  let updated = 0;
  rows.forEach(function (row) {
    const rowNumber = findRowByValue_(sheet, 1, row[0]);
    if (rowNumber) {
      sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
      updated += 1;
    } else {
      sheet.appendRow(row);
      added += 1;
    }
  });
  return { added: added, updated: updated };
}

function upsertDefaultTags_(sheet) {
  let added = 0;
  DEFAULT_HOUSEHOLD_TAGS.forEach(function (tag) {
    const rowNumber = findRowByValue_(sheet, 1, tag[0]);
    if (rowNumber) {
      sheet.getRange(rowNumber, 1, 1, 3).setValues([[tag[0], tag[1], true]]);
    } else {
      sheet.appendRow([tag[0], tag[1], true]);
      added += 1;
    }
  });
  return added;
}
