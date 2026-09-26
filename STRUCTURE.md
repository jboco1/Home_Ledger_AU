# Project structure

This version is a structure-only refactor of Home Ledger AU. Function names, function bodies, sheet names, headers and browser behaviour are unchanged. Google Apps Script loads all `.gs` files into the same global runtime. The browser script remains one closure assembled from the ordered `App_*.html` includes in `Index.html`.

## Server files

| File | Responsibility |
| --- | --- |
| `00_Config.gs` | Application constants, sheet names and headers |
| `01_WebApp.gs` | Web entry point, includes and access checks |
| `02_Setup.gs` | First-run setup |
| `03_AppData.gs` | Initial application data response |
| `10_Transactions.gs` | Transaction updates, merchant propagation and splits |
| `11_Imports.gs` | CSV import and row normalisation |
| `12_Rules.gs` | Merchant rules and classification |
| `13_Accounts.gs` | Account management |
| `14_Categories.gs` | Category and subcategory management |
| `15_Tags.gs` | Tag management |
| `16_Budgets.gs` | Annual and monthly budgets |
| `17_Receipts.gs` | Receipt upload and retrieval |
| `18_Exports.gs` | Data export and storage links |
| `20_Storage.gs` | Drive folders, raw imports and receipt migration |
| `21_Schema.gs` | Sheet schema upgrades and default data |
| `90_SheetUtils.gs` | Sheet and row helpers |
| `91_ParsingUtils.gs` | Date, money, tag and hash helpers |

## Browser files

The browser files are included in the order shown in `Index.html`. `Index.html` supplies the single outer `<script>` element, `App_Core.html` opens the existing private closure and `App_Events.html` closes it. The partial files therefore contain JavaScript snippets without their own `<script>` tags.

- `App_Core.html`: state, server calls and shared calculations
- `App_Overview.html`: overview and income/spend summary
- `App_Transactions.html`: transaction list and filters
- `App_Budget.html`: budget view
- `App_Tax.html`: tax view
- `App_FormHelpers.html`: option and category helpers
- `App_Rules.html`: rule management view
- `App_ImportView.html`: CSV import view
- `App_Manage.html`: accounts, categories and tags view
- `App_Router.html`: view selection and rendering
- `App_TransactionEditor.html`: editing, splitting and receipts
- `App_ImportActions.html`: CSV reading and export actions
- `App_Events.html`: event binding and startup

## Upgrade safety

Do not run `setupFinanceApp` again. Add every new file, remove the legacy `Code.gs` and `App.html`, save, then deploy a new web-app version.
