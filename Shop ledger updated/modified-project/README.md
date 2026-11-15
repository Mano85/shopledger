# ShopLedger

ShopLedger is a small Node.js and Express web app for a grocery shop. It provides a point-of-sale screen, product and stock views, order history, customer credit (khata) tracking, and basic GST reports. The project describes itself as an internal wholesale and retail billing tool.

## Run the app

Requirements: Node.js and npm.

From this folder, run:

```powershell
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000). The server uses port 3000 by default; setting the `PORT` environment variable changes it.

## Folder and file guide

| Path | What it contains |
| --- | --- |
| `server.js` | Starts the Express server, serves the browser app, connects API routes, and provides the printable invoice page. |
| `config.js` | Port, shop details, GST slabs, inventory defaults, coupon defaults, and the admin export key. |
| `package.json` | Project name, dependencies, and commands such as `npm start`. |
| `routes/` | HTTP API endpoints used by the browser app. |
| `routes/products.js` | Product search/listing and active coupons. |
| `routes/orders.js` | Order listing, order creation, order details, and cancellation. |
| `routes/customers.js` | Customer/khata listing and repayment recording. |
| `routes/reports.js` | Dashboard and GST reports, price preview, and data export. |
| `lib/` | Business rules and helper functions called by the routes. |
| `lib/store.js` | Reads and writes the JSON data file and adds audit log entries. |
| `lib/inventory.js` | Product lookup, available stock checks, and stock reservation. |
| `lib/pricing.js` | Subtotal, discounts, GST totals, and order totals. |
| `lib/tax.js` | Determines GST rates from product HSN codes and splits GST into CGST/SGST. |
| `lib/coupons.js` | Coupon validation, discount calculations, and active coupon listing. |
| `lib/orders.js` | Order creation, lookup, filtering, and cancellation rules. |
| `lib/ledger.js` | Customer credit balances and repayment records. |
| `lib/reports.js` | Dashboard figures and GST reconciliation calculations. |
| `lib/invoice.js` | Builds the printable HTML invoice for an order. |
| `lib/dates.js` | Date helpers used by the project. |
| `public/` | Files sent to the browser: the app page, styling, and browser-side JavaScript. |
| `public/index.html` | Main app page and its sections/tabs. |
| `public/css/style.css` | Page layout, colors, and visual styling. |
| `public/js/app.js` | Browser interactions; calls the server API to load data and submit actions. |
| `data/db.json` | Local JSON file containing the shop's products, orders, customers, settlements, and audit log. |
| `.gitignore` | Tells Git which files to leave out of version control. |

## What happens when you place an order

1. The browser sends selected product IDs, quantities, payment method, customer, and optional coupon to `POST /api/orders`.
2. The server checks that the products exist and enough stock is available.
3. It calculates discounts and GST using the helpers in `lib/`.
4. For a khata (credit) sale, it checks the registered customer's account and adds the amount owed.
5. It reserves stock, adds the order and an audit entry, and writes the updated data to `data/db.json`.

## Repository and Git

A **repository** (often called a repo) is the project folder together with its Git history. Git tracks changes to files so you can see what changed and move between saved versions. The hidden `.git/` directory stores that history and repository settings; it is not where the app's source code lives. This project folder is a local Git repository. A remote repository (for example on GitHub) is a separate online copy, if one has been configured.

## Notes

- This project uses a JSON file as its data store rather than a database server.
- `npm test` is only a placeholder in `package.json`; no automated test suite is configured there.
- `config.js` contains an admin export key in source code. Treat this as a demo/legacy setup and do not expose the app or key as-is on a public server.
