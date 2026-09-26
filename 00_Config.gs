const APP_NAME = 'Home Ledger AU';
const PROP = PropertiesService.getScriptProperties();
// Replace both examples before running setupFinanceApp().
const SETUP_ALLOWED_EMAILS = ['your.email@gmail.com', 'your.wife@gmail.com'];

const SHEETS = {
  TRANSACTIONS: 'Transactions',
  ACCOUNTS: 'Accounts',
  CATEGORIES: 'Categories',
  RULES: 'Rules',
  SPLITS: 'Splits',
  TAGS: 'Tags',
  BUDGETS: 'Budgets',
  IMPORTS: 'Imports',
  SETTINGS: 'Settings'
};

const HEADERS = {
  Transactions: ['Id', 'Date', 'Description', 'Merchant', 'Amount', 'Account', 'Owner', 'Category', 'TaxStatus', 'DeductiblePercent', 'Confidence', 'Source', 'ImportHash', 'Reviewed', 'ReceiptFileId', 'ReceiptName', 'Notes', 'CreatedAt', 'UpdatedAt', 'Tags'],
  Accounts: ['Id', 'Name', 'Type', 'Owner', 'Active', 'Provider'],
  Categories: ['Name', 'Group', 'Colour', 'Active', 'Parent'],
  Rules: ['Id', 'Pattern', 'MatchType', 'Account', 'Category', 'Owner', 'TaxStatus', 'DeductiblePercent', 'Priority', 'Active', 'CreatedAt', 'Tags'],
  Splits: ['Id', 'TransactionId', 'Amount', 'Category', 'Owner', 'TaxStatus', 'DeductiblePercent', 'Notes', 'CreatedAt'],
  Tags: ['Name', 'Colour', 'Active'],
  Budgets: ['Id', 'FinancialYear', 'Category', 'Amount', 'UpdatedAt', 'PeriodType', 'PeriodKey'],
  Imports: ['Id', 'Filename', 'Account', 'RowCount', 'ImportedCount', 'DuplicateCount', 'ImportedAt', 'ImportedBy', 'RawFileId', 'RawFilename'],
  Settings: ['Key', 'Value']
};
