# KOT touch keyboard

The keyboard is optional: focusing an eligible field shows a compact Keyboard
icon/button, not the full keyboard. Tap the icon to open it for that field.
While open, switching inputs changes the active target and keypad mode. Done,
Close, or an outside action dismisses it; focusing a field again does not reopen
it automatically. The bottom-center launcher floats in only its icon area and
reserves no full-width row or page padding. Only the expanded keyboard is measured
and given layout clearance for the existing bottom controls.

## Integration and state inventory

The entry/create/edit screen is `RestaurantDashboard.jsx` (RestaurantPOS).
`KotPage.jsx` is the orders, kitchen-batch and payment dashboard.
`TableSelection.jsx` is both a standalone screen and an embedded POS dialog.
Their local React state owns all enabled field values. Redux supplies organization,
permissions and date settings, but does not own the edited input values. No form
library or uncontrolled/ref-owned form was introduced.

| File | Enabled fields / existing state |
| --- | --- |
| RestaurantDashboard.jsx | Item search (`searchTerm`, existing debounce); item price and fractional quantity (`orderItems`); room search (`search`); guest name (`roomDetails`); customer name, phone and delivery address (`customerDetails`); discount (`discountValue`) |
| KotPage.jsx | Order search (`searchQuery`); discount (`discountValue`); note (`note`); split payment amount, remarks and reference/cheque fields (`splitPaymentRows`); cancellation reason (`cancelReason`) |
| TableSelection.jsx | Room search (`search`); cash and online payment amounts (`cashAmount`, `onlineAmount`) |
| ParentKotPage.jsx | Voucher/table/type search (`searchQuery`) |
| CustomerSearchInPutBox.jsx | Creditor/customer search (child-owned `search`/`selectedValue`); enabled only by passing `inputComponent={TouchInput}` from KotPage |

There is no separate cooking-instruction or table-search input in the POS.
The parent KOT search already searches table numbers. ItemSelector and
KitchenBatchesViewForPrintAndEdit use cards/buttons rather than typed inputs.
Date pickers, checkboxes, selects, read-only check-in numbers, table/item cards,
action buttons and printing components do not open the keyboard.

## Files and API

- `TouchKeyboard.jsx`: QWERTY, shift, ABC/123, punctuation, space, backspace,
  clear, Done and Close, using the existing Tailwind/slate/indigo styling.
- `TouchKeyboardScope.jsx`: one active input and one keyboard per screen. Nested
  table-selection scopes reuse the outer instance. Route changes reset the scope.
- `TouchInput.jsx`: input/textarea adapter that calls the existing `onChange`
  handler with `target.value` and retains existing native handlers and refs.
  Its change callback contract is value-oriented; it is not a full synthetic event
  replacement for arbitrary form-library inputs.
- `editValue.js`: pure caret, selection and numeric validation rules.
- `touchKeyboard.css`: scoped keyboard styling and measured layout clearance.
- `editValue.test.js`: Node regression tests, with no new dependencies.
- `frontend/tests/touch-keyboard.html` and `.jsx`: local browser fixture without
  authentication, API calls or order writes; not imported by the production app.

Use `<TouchKeyboardScope>` around the workflow and replace eligible native inputs
with `<TouchInput>` (or `<TouchInput as="textarea">`). `type="number"` selects the
keypad; `keyboardType="number"` does the same for text-backed phone/discount inputs.
Decimal support comes from fractional `step`, `step="any"`, `inputMode="decimal"`,
or explicit `allowDecimal`. Quantity remains fractional because the existing POS
uses step/min 0.5. The KOT percentage discount uses integer step 1. Mobile uses
digits only. Existing maxLength/max attributes and change-handler validation apply;
the actual customer phone input has no existing length limit, so none was invented.

Existing state is authoritative for both input methods. The adapter retains only
numeric lexical editing syntax that parseFloat would otherwise discard (`1.`,
`1.0` before typing `5`); it is reconciled against the accepted field value and
cleared by physical input and blur. Text inputs have no duplicated value state.
Numeric native inputs lack a browser selection API, so virtual numeric editing
appends/backspaces; Clear supports replacement. Text supports caret/selection.

Physical typing is not prevented. `inputMode="none"` only asks the system to avoid
its software keyboard on opted-in inputs. Pointer down on the virtual panel keeps
focus and does not trigger outside-click listeners. Done/Close blur the field,
running existing blur validation; focusing another supported input switches targets.
Outside actions, removed/disabled inputs and route changes close the keyboard.
ResizeObserver is disconnected on cleanup; no global keyboard listeners are added.

The panel's measured height sets a scope CSS variable. The POS viewport, fixed
drawers and modal available area shrink by that height; document content gains
bottom clearance. Dialog contents remain scrollable and the focused field is
scrolled into view. Keys are at least 44px high and rows flex without horizontal
overflow. Short viewports can scroll the keyboard itself. Keyboard UI updates stay
inside the provider; existing form changes retain their existing render behavior.

## Preserved behavior

API calls, order creation/editing, kitchen batches, item/table/customer selection,
dine-in/takeaway/delivery/room service, calculations, payments and printing were
left in their existing handlers. The only numeric-handler adjustment is treating
a cleared item price as zero instead of NaN, avoiding invalid totals on Clear.
The shared hotel customer search defaults to its original native input; only the
KOT caller opts into the adapter. No backend, package or route changes were made.

## Verification

- Optional-opening follow-up: browser verified that focusing a field shows only
  the launcher; its icon opens working keys; Done followed by refocusing leaves
  the keyboard collapsed; physical typing continues while collapsed. Targeted
  lint and the five editing tests passed after this change.

- `node --test src/components/common/touchKeyboard/editValue.test.js`: five tests
  passed (caret/selection, deletion/clear, integers/phone length, decimals, maximum).
- Targeted ESLint passed for the keyboard implementation.
- Production Vite/PWA build passed. Existing warnings include the ES2024 target,
  outdated Browserslist data, an existing CSS comment issue and bundle sizes.
- Browser fixture: mixed virtual/physical input produced `rice`; decimal quantity
  entry produced 0.5; Clear + Done invoked the existing minimum-quantity handler;
  phone keypad omitted decimals and respected a supplied 10-character limit;
  uppercase, space, ABC/123 and backspace worked; nested dialog had one keyboard.
- At 375x667, 768x1024 and 1366x768, the fixture had no horizontal overflow and its
  Save control stayed above the measured keyboard. The small-screen remarks field
  remained visible above the panel.
- Authenticated production workflow and printer/payment regressions were not
  executed: the available app session showed the sign-in page. Validate real item
  filtering/selection, table/customer selection, each service type, KOT save/edit,
  kitchen batches, totals, split payment and printing in an authenticated test
  company before deployment. Physical Windows touch hardware was not available.

Run the browser fixture at `/tests/touch-keyboard.html` on the Vite dev server.
