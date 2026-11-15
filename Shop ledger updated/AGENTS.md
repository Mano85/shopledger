# Instructions for working in this repository

## Project overview

- This is a CommonJS Node.js and Express app for grocery shop billing, inventory, GST, order history, and customer khata (credit) tracking.
- `server.js` serves `public/`, mounts the four API routers under `/api`, and renders printable order invoices.
- `public/` is the browser UI. Its JavaScript calls API routes; business rules belong in `lib/` and should not be duplicated in browser code.
- `routes/` contains `products.js`, `orders.js`, `customers.js`, and `reports.js`.
- `lib/` contains the business logic modules. `lib/store.js` reads and writes `data/db.json`.
- `config.js` contains shop settings, tax slabs, coupon values, and the port.
- `data/db.json` is the app's local data store. Avoid using real customer or financial data in examples and tests.

## Working conventions

- Preserve the existing CommonJS style (`require` and `module.exports`) unless a task explicitly asks for a migration.
- Keep changes focused. Do not silently change established billing, GST, inventory, cancellation, or khata behavior; document the change and update characterization tests when behavior is intentionally changed.
- Use small in-memory objects in unit tests. Do not mutate the sample `data/db.json` as part of a test.
- Do not add credentials, customer records, or production data to source control. The current app has no authentication and is not ready to expose publicly; see `SECURITY.md`.
- The `npm test` command runs the Node built-in test runner. The current characterization tests are in `test/characterization.test.js` and require Node.js 20 or newer.
- `npm start` starts the Express server on port 3000 by default. Dependencies must be installed with `npm install` first.

## Current behavior to know before editing

These are observed behaviors covered or described by the project documentation. Some are legacy edge cases and may not be desirable:

- `inventory.check()` subtracts reservations and allows an order to consume exactly all remaining sellable stock; only quantities above the remainder are rejected.
- Order line items use an `id` field. `inventory.release()` supports both `id` and `productId` and returns cancelled quantities to stock; keep cancellation restoration covered by tests.
- `ledger.recordSettlement()` requires a positive amount but does not cap the payment at the outstanding balance.
- Order date filtering normalizes dates, but `orders.list()` sorts date strings lexicographically; `DD/MM/YYYY` ordering can be wrong across month/year boundaries.
- API routes do not require authentication. The export route checks a hardcoded config key passed in a query string.

## Characterization tests

- The tests record current behavior, including the stock availability boundary and cancellation stock restoration.
- Run them with `npm test` (or `node --test`).
- When fixing a characterized bug, first update the affected assertion to describe the intended new behavior, then implement the fix and run the tests again.
- These tests cover selected business logic only. They do not exercise the Express routes, browser UI, concurrent data writes, or deployment security.

## Documentation

- `README.md` explains the folder layout and how to start the app.
- `docs/CURRENT_STATE.md` records the current implementation and known behavior.
- `docs/architecture.svg` diagrams the app components and order flow.
- `SECURITY.md` describes present security limitations and deployment precautions.
