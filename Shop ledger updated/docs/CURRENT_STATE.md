# ShopLedger: current state

This page records what is present in the project today. It describes the checked-in code and sample JSON data; it does not claim the app is production-ready.

## Project shape

- `server.js` starts an Express app, serves `public/`, mounts the API routers, and renders an HTML invoice at `/orders/:id/invoice`.
- `public/` contains a single-page shop interface: point of sale, order history, customer khata, and inventory/GST audit views.
- `routes/` has four routers: `products.js`, `orders.js`, `customers.js`, and `reports.js`.
- `lib/` has the business helpers: `coupons.js`, `dates.js`, `inventory.js`, `invoice.js`, `ledger.js`, `orders.js`, `pricing.js`, `reports.js`, `store.js`, and `tax.js`.
- `config.js` contains shop details, GST slabs, inventory defaults, coupon configuration, port, and an admin export key.
- `data/db.json` is the data store. It holds product, order, customer, settlement, and audit-log records; `lib/store.js` reads and rewrites this file.
- `docs/architecture.svg` is the architecture diagram.

## What the app does

1. The browser requests product, customer, order, and report data through `/api/...` routes.
2. A new order resolves product IDs against the JSON data, checks stock, validates a coupon, calculates GST and totals, and optionally updates the customer's khata balance.
3. The route creates the order, changes inventory, appends an audit event, and writes the JSON file.
4. Order cancellation marks the order cancelled, restores its item quantities to inventory, and reverses the khata debit for khata orders.
5. The reporting helpers calculate dashboard numbers and compare stored order totals with invoice calculations.

## Known behavior visible in the code

- `inventory.check()` subtracts reservations from physical stock and rejects quantities greater than sellable stock. Selling exactly the remaining sellable quantity is allowed.
- Cancelling an order restores its item quantities to stock. `inventory.release()` accepts the stored `id` field and the older `productId` field.
- `ledger.recordSettlement()` checks that the amount is positive but does not cap it at the customer's outstanding balance. A repayment can take the calculated balance below zero.
- Order date filters normalize date strings, but the final order list sorts dates as text. `DD/MM/YYYY` text sorting may not match chronological order across months or years.
- The project has no authentication middleware. Routes can be reached without a user login; `GET /api/admin/export` relies on a hardcoded key in `config.js`, supplied in a query parameter.
- `npm test` runs the Node.js built-in test runner against `test/characterization.test.js`. These tests record selected current behavior, including the stock availability boundary and cancellation stock restoration; they are a small baseline, not comprehensive route or browser tests.
- `package.json` lists Express and body-parser, but this checkout has no `node_modules/` directory. Starting the server requires installing dependencies first.

## Repository and instructions files

- No `AGENTS.md` file is present in the project folder.
- No Git remote or usable Git working-tree metadata was available from this folder during inspection, so the configured remote and commit history could not be confirmed.
- `README.md` gives the folder map and startup instructions. `SECURITY.md` describes security limitations and deployment precautions.

## Run the characterization tests

Use Node.js 20 or newer, then run:

```powershell
npm test
```

The tests use Node's built-in test runner and do not require Express or `node_modules/`.
