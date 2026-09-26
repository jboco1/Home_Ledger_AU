function getAppData() {
  assertAccess_();
  const ss = getSpreadsheet_();
  ensureCurrentSchema_(ss);
  ensureStorageStructure_(ss);
  const transactions = rowsAsObjects_(ss.getSheetByName(SHEETS.TRANSACTIONS));
  const accounts = rowsAsObjects_(ss.getSheetByName(SHEETS.ACCOUNTS)).filter(function (x) { return truthy_(x.Active); });
  const categories = rowsAsObjects_(ss.getSheetByName(SHEETS.CATEGORIES)).filter(function (x) { return truthy_(x.Active); });
  const rules = rowsAsObjects_(ss.getSheetByName(SHEETS.RULES)).filter(function (x) { return truthy_(x.Active); });
  const splits = rowsAsObjects_(ss.getSheetByName(SHEETS.SPLITS));
  const tags = rowsAsObjects_(ss.getSheetByName(SHEETS.TAGS)).filter(function (x) { return truthy_(x.Active); });
  const budgets = rowsAsObjects_(ss.getSheetByName(SHEETS.BUDGETS));
  const settings = rowsAsObjects_(ss.getSheetByName(SHEETS.SETTINGS));
  const email = Session.getActiveUser().getEmail();

  return {
    appName: APP_NAME,
    userEmail: email,
    transactions: transactions.map(serializeTransaction_),
    accounts: accounts.map(serializeRow_),
    categories: categories.map(serializeRow_),
    rules: rules.map(serializeRow_),
    splits: splits.map(serializeRow_),
    tags: tags.map(serializeRow_),
    budgets: budgets.map(serializeRow_),
    settings: settings.reduce(function (out, row) { out[row.Key] = row.Value; return out; }, {})
  };
}
