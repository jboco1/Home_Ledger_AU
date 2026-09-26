# Home Ledger AU

A private, two-person Australian household finance app built for Google Apps Script, Google Sheets and Google Drive.

## What works

- Imports bank and credit-card CSV files with common `Date`, `Description`, `Amount`, `Debit` and `Credit` columns.
- Blocks duplicate transactions using a stable fingerprint.
- Categorises known merchants with rules and sends uncertain items to Review.
- Learns a new merchant rule when you tick **Remember this merchant** while reviewing.
- Applies a reviewed transaction’s category, tags, tax treatment and deductible percentage to every existing transaction with the same merchant name.
- Carries the same classification into future imports when that merchant is remembered.
- Tracks category, owner, tax treatment and deductible percentage separately.
- Adds and archives household accounts and spending categories from the Manage screen.
- Supports parent categories and subcategories, including Electricity, Gas, Phone and Internet under Bills & utilities.
- Renames accounts and records their provider or bank, type and owner.
- Adds colour-coded tags and applies multiple tags to each transaction.
- Searches transactions by merchant, description, account, category, owner, notes or tags.
- Creates category budgets for each Australian financial year and compares them with actual spending.
- Supports separate annual and monthly category budgets, with a month-by-month view inside each financial year.
- Groups tax expenses by parent category and subcategory while retaining transaction-level tax detail.
- Adapts to the available browser width, with wide transaction tables scrolling inside their panels.
- Splits one transaction across multiple categories, owners and tax treatments, with cent-accurate validation.
- Uploads receipt images or PDFs up to 5 MB and links them to individual transactions in the private Drive receipts folder.
- Shows Australian financial-year summaries.
- Adds an Income & spend page with monthly comparison bars and category/subcategory spending totals.
- Exports every data table as CSV.
- Restricts access to the Google email addresses configured during setup.

## Install

1. Go to [script.google.com](https://script.google.com) while signed into the Google account that should own the data.
2. Create a **New project** and name it `Home Ledger AU`.
3. In **Project settings**, enable **Show appsscript.json manifest file in editor**.
4. Create or replace the project files using the structured files in this package. Keep the filenames exactly as supplied. The numbered `.gs` files form the server, the `App_*.html` files form the browser application, and `Index.html`, `Styles.html` and `appsscript.json` complete the project. See `STRUCTURE.md` for the file map.
5. Near the top of `Code.gs`, replace the two example addresses in `SETUP_ALLOWED_EMAILS` with your actual Google addresses:

   ```javascript
   const SETUP_ALLOWED_EMAILS = ['you@gmail.com', 'wife@gmail.com'];
   ```

6. Select the function `setupFinanceApp` in the toolbar and run it once. The first run asks for permission to create and share the app's private Sheet and receipt folder with those two addresses.
7. Open **Deploy → New deployment → Web app**.
8. Set **Execute as** to **User accessing the web app**.
9. Set access to the narrowest option that includes both configured Google accounts. Do not choose anonymous access.
10. Deploy, approve the requested Google permissions, and open the supplied web-app URL.

## Upgrade an existing installation

Remove the old `Code.gs` and `App.html` only after adding all numbered `.gs` and `App_*.html` files from this package. Replace `Index.html` and `Styles.html`, save, then update the existing web-app deployment using **Deploy → Manage deployments → Edit → New version → Deploy**. Do not run `setupFinanceApp` again. The first page load automatically adds any missing columns and creates the `Splits`, `Tags` and `Budgets` sheets in the existing database.

## Important deployment note

The access check deliberately fails if Google does not expose the signed-in user's email. Deploying as **User accessing the web app** is required. If both accounts are in the same Google Workspace organisation, restrict the deployment to that organisation. For personal Gmail accounts, choose the Google-account-only option and rely on the app's allow-list as the second access check.

## CSV format

The importer recognises case-insensitive versions of these headings:

- Date: `Date`, `Transaction Date`, `Processed Date`, `Effective Date`
- Description: `Description`, `Transaction Details`, `Narrative`, `Details`, `Merchant`
- Amount: `Amount`, `Transaction Amount`
- Or split amounts: `Debit` / `Credit`, `Withdrawal` / `Deposit`

Australian `DD/MM/YYYY` dates are supported. Expenses should be negative when the file has one Amount column. With separate Debit/Credit columns, debits are converted to negative values automatically.

## Data and backups

The setup function creates:

- `Home Ledger AU` — the parent Drive folder for the app’s private data.
  - `Home Ledger AU Database` — the live Google Sheet.
  - `Home Ledger AU Receipts` — receipt attachments organised into Australian financial-year folders.
  - `Home Ledger AU Raw Imports` — a copy of every uploaded bank CSV, timestamped to prevent filename collisions.

Existing installations are reorganised automatically on first load after deployment. Existing receipt files are moved into the correct financial-year folder using their linked transaction date.

Use **Import → Export all data** for portable CSV copies. Sync those exports and the receipt folder to the Synology rather than exposing the NAS to the internet.

## Limits in this first version

- No automatic bank feeds yet.
- No ATO lodgement or tax advice.
- No AI API is enabled. The rules engine is deterministic and private; an AI fallback can be added after you have real uncategorised examples.
- Apps Script and Drive quotas still apply, though normal two-person use should be modest.

## Recommended next test

Export one month from one bank, import it, review every uncategorised item, and export the data again. That exposes bank-specific CSV quirks before you load years of history.
