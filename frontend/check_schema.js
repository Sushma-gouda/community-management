import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vckejkkswhyamhzccfiu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZja2Vqa2tzd2h5YW1oemNjZml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODcyODksImV4cCI6MjA5NDA2MzI4OX0.pk0ImqZvmZkcHZ5bigbqAMqhQp-3S8YmdqdzV1Ykd7o";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Testing join on flats.residents...");
  const { data, error } = await supabase
    .from("visitors")
    .select(`
      id,
      name,
      flat_id,
      flats:flat_id (
        id,
        flat_number,
        blocks:block_id (
          id,
          name
        ),
        residents (
          name
        )
      )
    `)
    .limit(1);

  if (error) {
    console.error("Join on flats.residents failed:", error);
  } else {
    console.log("SUCCESS! Join on flats.residents returned:", JSON.stringify(data, null, 2));
  }
}

run();
