# Security notes

This document describes the security features and limitations visible in the current ShopLedger source. It is a project guide, not a formal security certification or a penetration-test report.

## Current security status

**Treat this project as a local demo or development app. Do not expose it to the public internet or use it for real customer or financial records until the controls below have been implemented and reviewed.**

The app contains no login or role checks. The browser interface and API are available to anyone who can reach the server. In particular, the current routes allow unauthenticated callers to view products, orders, customer balances, settlements, reports, create orders, cancel orders, and record repayments. The export route is guarded only by a key embedded in `config.js`; that key is a known default and is sent as a URL query parameter.

## Data handled

`data/db.json` contains the shop's product and stock information, customer names, order history, credit balances, settlement history, and audit entries. Keep it private, limit access to the computer and folder, and do not commit real customer data to a public repository. Back it up securely before changing or upgrading the app.

## Findings in the current code

- **No authentication or authorization:** API routes in `routes/` do not verify a user's identity or permissions. Read and write actions are open to any network client that can reach the app.
- **Predictable export credential:** `config.js` defines `shopledger-admin-2021`. `GET /api/admin/export` checks it through `?key=...`. Query strings can be recorded in browser history, server logs, monitoring systems, or copied links. Do not rely on this key as protection.
- **No visible HTTPS setup:** `server.js` starts a plain HTTP Express listener. If traffic crosses a network, it can be observed or altered unless HTTPS is provided by a properly configured trusted reverse proxy.
- **No visible request throttling:** Routes do not set rate limits. An exposed server could receive excessive requests.
- **JSON file storage:** `lib/store.js` reads and rewrites the entire `data/db.json` file synchronously. There is no database access control, transaction handling, or atomic-write protection shown. Concurrent writes or an interrupted write may lose or damage data.
- **Dependency maintenance needs review:** `package.json` uses older Express and body-parser version ranges. Review and update dependencies to supported versions, and commit a lockfile so installs are repeatable.
- **No automated tests are configured:** `npm test` is a placeholder, so security-related behavior currently has no automated coverage.

## Before using outside a private development computer

1. Add authentication and server-side authorization to every API route. Give staff only the actions they need; protect exports, cancellations, and settlement recording especially.
2. Remove the hardcoded admin key. Use a strong secret from the deployment environment or a secrets manager, rotate any key that has been shared, and use an authorization header rather than a URL query parameter.
3. Put the app behind HTTPS and configure secure proxy settings, request size limits, and appropriate security headers.
4. Add rate limiting and validate request fields on the server, including IDs, quantities, payment modes, customer IDs, and settlement amounts. Reject unexpected values and oversized input.
5. Replace JSON-file storage with a supported database if multiple users or reliable financial records are required. Use access controls, transactions, backups, and a tested restore procedure.
6. Upgrade and audit dependencies, create and commit a lockfile, and review security advisories during updates.
7. Add tests for access control, invalid input, stock and balance updates, order cancellation, and export protection. Keep logs free of secrets and unnecessary customer details.
8. Store backups encrypted and restrict who can read `data/db.json`, backups, deployment secrets, and logs.

## Safe local development

- Bind the service only to a trusted local environment. Do not port-forward it or make it reachable from a shared/public network.
- Use sample data only. Restore the sample `data/db.json` after experiments if you need the original demo state.
- Never publish `.env` files, credentials, customer records, or production backups. The current repository ignores `node_modules/` but does not ignore environment files or the database file.
- Do not treat the admin key in `config.js` as secret; it is part of the source code.

## Reporting a security issue

For a private copy of this project, report suspected security issues to the project owner through a private channel. Include the affected route or file, the impact, and steps to reproduce using sample data. Do not include real customer records or publish a working exploit while the issue is being reviewed.
