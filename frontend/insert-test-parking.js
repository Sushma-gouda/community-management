import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vckejkkswhyamhzccfiu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZja2Vqa2tzd2h5YW1oemNjZml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODcyODksImV4cCI6MjA5NDA2MzI4OX0.pk0ImqZvmZkcHZ5bigbqAMqhQp-3S8YmdqdzV1Ykd7o";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("Attempting to insert a test parking record with numeric flat_id...");
  const testRecord = {
    flat_id: 1, // numeric flat_id
    slot_number: "P-999",
    vehicle_type: "Car",
    vehicle_model: "Model S",
    plate_number: "MH-12 TS-9999",
  };

  const { data, error } = await supabase
    .from("parking")
    .insert(testRecord)
    .select();

  if (error) {
    console.error("❌ Insertion failed:", error.message, error.code, error.details);
  } else {
    console.log("✅ Insertion succeeded! Inserted data:", data);
    // Delete it so we clean up
    await supabase.from("parking").delete().eq("slot_number", "P-999");
    console.log("🗑️ Deleted test parking record.");
  }
}

main();
