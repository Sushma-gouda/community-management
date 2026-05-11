/**
 * Payment Reminder Cron Job
 *
 * Runs daily at 9 AM to send payment reminders to residents
 * whose maintenance bills are due within the next 3 days or overdue.
 *
 * Schedule: "0 9 * * *" — every day at 09:00
 *
 * TODO: Connect to Supabase to fetch overdue bills and send
 *       notifications via email/SMS/push.
 */

import cron from "node-cron";

// Daily at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  console.log(`[PaymentReminder] Running at ${new Date().toISOString()}`);

  try {
    // TODO: Query Supabase for bills due in next 3 days
    // const { data: dueBills } = await supabase
    //   .from("bills")
    //   .select("*, residents(name, email, phone)")
    //   .eq("status", "pending")
    //   .lte("due_date", threeDaysFromNow);

    // TODO: Send reminders via preferred channel
    // for (const bill of dueBills) {
    //   await sendEmailReminder(bill.residents.email, bill);
    //   await sendSmsReminder(bill.residents.phone, bill);
    // }

    console.log("[PaymentReminder] Completed successfully");
  } catch (error) {
    console.error("[PaymentReminder] Error:", error);
  }
});

console.log("[PaymentReminder] Cron job registered — runs daily at 09:00");
