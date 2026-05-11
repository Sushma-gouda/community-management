# Routes

Express router definitions for the Communa backend API.

## Planned Endpoints

### Auth
```
POST /api/auth/signin
POST /api/auth/signout
POST /api/auth/refresh
```

### Billing
```
GET    /api/billing/bills
POST   /api/billing/bills
GET    /api/billing/bills/:id
PATCH  /api/billing/bills/:id/pay
```

### Complaints
```
GET    /api/complaints
POST   /api/complaints
GET    /api/complaints/:id
PATCH  /api/complaints/:id/status
```

### Visitors
```
GET    /api/visitors
POST   /api/visitors
PATCH  /api/visitors/:id/checkout
GET    /api/visitors/active
```

### Notifications
```
POST   /api/notifications/send
POST   /api/notifications/broadcast
```

## Pattern

```js
// routes/billing.js
import { Router } from "express";
import { getBills, createBill, payBill } from "../controllers/billingController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/bills", authenticate, getBills);
router.post("/bills", authenticate, createBill);
router.patch("/bills/:id/pay", authenticate, payBill);

export default router;
```
