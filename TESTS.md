# Application Test Documentation

This document provides an overview of the unit and integration tests implemented for the application.

## Unit Tests (Vitest)
Run using `npm run test:run` or `npm run test` (watch mode).

| Filename | What checks have been made | Success or Fail Expected |
| :--- | :--- | :--- |
| `src/db.test.ts` | Checks `parseVal` utility for various inputs (null, undefined, comma, dot, invalid). Checks `mapItemRow` for correct DB-to-JSON mapping. | Success |
| `src/app/api/generate_api_key/api_keys.test.ts` | Checks `POST` endpoint for secure API key generation and DB insertion. Checks handling of database connection failures (500 error). | Success / Fail (handled) |
| `src/app/api/ip-input/ip_input.test.ts` | Checks `POST` endpoint for Authentication header presence. Validates API keys against DB. Verifies client IP logging. | Success / Fail (handled) |
| `src/app/api/admin/admin_routes.test.ts` | Verifies `ping` status. Checks `data` fetching with DB mocking. Validates `items` and `categories` creation logic. | Success |
| `src/app/api/admin/backup_routes.test.ts` | Verifies full backup generation (JSON export) and listing of existing backup files. Mocks filesystem and database. | Success |
| `src/app/api/public_routes.test.ts` | Checks `menu` fetching, `orders` placement (transaction handling mock), and `pizzas` static data retrieval. | Success |

## Integration & Utility Scripts
Run using the specific `npm run` commands.

| Filename (Script) | What checks have been made | Success or Fail Expected |
| :--- | :--- | :--- |
| `scripts/test_new_endpoints.ts` | Orchestrates a full integration test: Checks if MariaDB and App are running (auto-starts them). Tests real API key generation and IP logging via HTTP requests to the running dev server. | Success |
| `scripts/list_api_keys.ts` | Connects to the database and prints all `api_keys` records in a formatted table to the console. Includes dependency checks. | Success |
| `scripts/generate_api_key.ts` | Calls the `/api/generate_api_key` endpoint and prints the result as plain terminal text. Useful for CLI piping. | Success |
| `scripts/clear_api_data.ts` | Safely wipes `pc_clients` and `api_keys` tables and resets `AUTO_INCREMENT` values to 1. | Success |
