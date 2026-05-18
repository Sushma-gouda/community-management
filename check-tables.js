import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vckejkkswhyamhzccfiu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZja2Vqa2tzd2h5YW1oemNjZml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODcyODksImV4cCI6MjA5NDA2MzI4OX0.pk0ImqZvmZkcHZ5bigbqAMqhQp-3S8YmdqdzV1Ykd7o";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTable(tableName) {
  const { data, error } = await supabase.from(tableName).select("*").limit(1);
  if (error) {
    console.log(`❌ Table '${tableName}' error:`, error.message, error.code);
  } else {
    console.log(`✅ Table '${tableName}' exists! Sample row:`, data);
  }
}

async function main() {
  console.log("Checking tables...");
  await checkTable("parking_slots");
  await checkTable("parking");
}

main();
