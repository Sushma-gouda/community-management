# Utils

Shared utility functions for the Communa backend.

## Planned Utilities

| File | Purpose |
|------|---------|
| `dateUtils.js` | Date formatting, due date calculations |
| `currencyUtils.js` | Amount formatting, currency conversion |
| `validationUtils.js` | Input validation helpers |
| `responseUtils.js` | Standardized API response helpers |

## Pattern

```js
// utils/responseUtils.js
export function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function error(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}
```
