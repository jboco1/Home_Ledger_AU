function doGet() {
  assertConfigured_();
  assertAccess_();
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Run once from the Apps Script editor before deployment.
 * First replace SETUP_ALLOWED_EMAILS above, then run setupFinanceApp().
 */

function assertConfigured_() {
  if (!PROP.getProperty('SPREADSHEET_ID') || !PROP.getProperty('ALLOWED_EMAILS')) {
    throw new Error('App not configured. Run setupFinanceApp with the permitted Google email addresses.');
  }
}

function assertAccess_() {
  assertConfigured_();
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  const allowed = String(PROP.getProperty('ALLOWED_EMAILS') || '').split(',').map(function (x) { return x.trim().toLowerCase(); });
  if (!email || allowed.indexOf(email) === -1) throw new Error('This Google account is not permitted to use ' + APP_NAME + '.');
}
