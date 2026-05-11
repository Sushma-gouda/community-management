# Controllers

Route handler functions for the Communa backend API.

Each controller file corresponds to a resource domain:

| File | Purpose |
|------|---------|
| `authController.js` | Sign-in, sign-out, token refresh |
| `billingController.js` | Bill generation, payment processing |
| `complaintController.js` | Complaint CRUD, status updates |
| `notificationController.js` | Push/email/SMS dispatch |
| `visitorController.js` | Visitor entry, checkout, logs |
| `reportController.js` | PDF/CSV report generation |

## Pattern

```js
// controllers/billingController.js
export async function getBills(req, res) {
  try {
    // business logic here
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```
