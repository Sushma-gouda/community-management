# Services

Business logic layer for the Communa backend.

Services are called by controllers and handle:
- Database queries (via Supabase admin client)
- External API calls (payment gateways, SMS, email)
- Data transformation and validation

## Planned Services

| File | Purpose |
|------|---------|
| `supabaseAdmin.js` | Supabase admin client (service role key) |
| `emailService.js` | Email notifications via Resend/SendGrid |
| `smsService.js` | SMS via Twilio/MSG91 |
| `paymentService.js` | Payment gateway integration |
| `pdfService.js` | PDF bill/report generation |

## Pattern

```js
// services/emailService.js
export async function sendBillReminder(to, bill) {
  // call email provider API
}

export async function sendWelcomeEmail(to, resident) {
  // call email provider API
}
```
