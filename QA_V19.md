# ALL RE BORN Inventory V19.0

Existing repository: `elegancemin2-lang/allrebornclinic-inventory`

Existing production address: https://allrebornclinic-inventory.vercel.app

## Changes

- Shared clinic design: warm ivory, coral accents, consistent SVG icons, readable forms and tables.
- Desktop sidebar with daily-work and administration groups; active navigation on mobile.
- Dashboard with four actionable indicators, quick operations, seven-day transaction counts, actionable alerts and recent work.
- Inventory search, existing category/location/expiry/quantity filters, removable filter chips and mobile inventory cards.
- Responsive login, password visibility, validation and submit lock.
- Accessible dialogs with focus containment, Escape dismissal and restoration of the opening control's focus.
- Preview the remaining selected-lot quantity before use or discard.
- Fix recursive `uid()` implementation; retain the existing operation locks and transaction idempotency argument.
- Prevent staff navigation to existing administrator-only pages, including mobile More.
- Keep dashboard alerts independent of filters chosen on the Alerts page.

The Supabase URL, publishable key, tables, RPC endpoints and stock accounting model remain the same. No database migrations, data resets, account creation or permission-policy changes were performed. Other applications in the repository were not edited.

## Verification

`qa/ui-regression.cjs` drives the real HTML and JavaScript using Playwright with a synthetic backend. It prevents requests to live Supabase. `qa/mock-backend.js` is loaded only by the test runner, never by the application.

Verified:

- Login renders; empty credentials validation, password visibility, Enter submission and session transition.
- 100 unique operation IDs; no recursive generation.
- All 11 administrator pages navigate and fit widths 1440, 1280, 1024, 820, 680, 390 and 360 pixels.
- Search, category and unassigned-location filters, filter chips, reset, mobile cards and expandable filters.
- Use three units: total stock 32 → 29 and the selected lot 20 → 17.
- Overstock requests are blocked; expired stock is excluded from use.
- Receipt updates stock; discard selects expired stock and validates the operator employee number.
- Simultaneous submissions produce one inventory-write call.
- Registered-code lookup, purchase-request submission and refreshed data.
- Dashboard alerts remain complete when Alerts-page filtering is active.
- Modal keyboard focus; staff menu and administrator-page restrictions.
- No uncaught JavaScript errors and no live-backend requests during the synthetic tests.

These checks validate UI and client request behavior; they are not a replacement for authenticated production database tests. Physical camera/USB scanner operation still depends on the device and browser. The existing Supabase project was confirmed `ACTIVE_HEALTHY`.

Run with Playwright and Chromium installed:

```sh
node qa/ui-regression.cjs
```

Optional environment variables: `CHROMIUM_EXECUTABLE` (Chromium path), `CLINIC_QA_OUTPUT` (evidence directory). The test's temporary web server starts and closes automatically.
