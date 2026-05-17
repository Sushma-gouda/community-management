#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

// Use hardcoded values from .env or environment
const SUPABASE_URL = "https://xdlgfniswbcjgepnjfuq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbGdmbmlzd2JjamdlcG5qZnVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODA1MTEsImV4cCI6MjA5MzY1NjUxMX0.kg9wzkvN8KE2MVY7WlWA7K1BHVlQ0b7ZkrOH2kdFMcI";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Error: Missing Supabase credentials");
  process.exit(1);
}

console.log("🔌 Connecting to Supabase...");
console.log(`   URL: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTableExists(tableName) {
  try {
    const { error } = await supabase.from(tableName).select("count", { count: "exact", head: true });
    if (error?.code === "PGRST301") {
      // Relation does not exist
      return false;
    }
    if (error?.code === "42P01") {
      // Table does not exist
      return false;
    }
    return !error;
  } catch {
    return false;
  }
}

async function setupDatabase() {
  console.log("\n📊 Checking database schema...");

  // Check if blocks table exists
  const blocksExist = await checkTableExists("blocks");
  if (blocksExist) {
    const { count } = await supabase
      .from("blocks")
      .select("*", { count: "exact", head: true });
    console.log(`✓ blocks table exists (${count} records)`);
  } else {
    console.log("✗ blocks table not found");
  }

  // Check if flats table exists
  const flatsExist = await checkTableExists("flats");
  if (flatsExist) {
    const { count } = await supabase
      .from("flats")
      .select("*", { count: "exact", head: true });
    console.log(`✓ flats table exists (${count} records)`);
  } else {
    console.log("✗ flats table not found");
  }

  if (!blocksExist || !flatsExist) {
    console.log("\n⚠️  Database tables are missing!");
    console.log("\n📋 To set up the database manually:");
    console.log("   1. Go to: https://supabase.com/dashboard");
    console.log("   2. Select project: xdlgfniswbcjgepnjfuq");
    console.log("   3. Go to: SQL Editor");
    console.log("   4. Create a new query and run the following SQL:");
    console.log("");
    console.log("   ===== Copy from supabase/migrations/20250512120000_profiles.sql =====");
    console.log("   ... then run each migration file in order ...");
    console.log("   ===== Copy from supabase/seed.sql =====");
    console.log("");
    console.log("   After running all migrations, return here and the app will work!");
    return false;
  }

  console.log("\n✅ Database is ready!");
  console.log("\n🏠 Testing data fetch...");

  try {
    const { data: blocks, error: blocksError } = await supabase
      .from("blocks")
      .select("*")
      .order("name");

    if (blocksError) throw blocksError;

    console.log(`✓ Blocks fetched: ${blocks?.length || 0} blocks`);

    // Check for vacant flats in first block
    if (blocks && blocks.length > 0) {
      const { data: vacantFlats, error: flatsError } = await supabase
        .from("flats")
        .select("*")
        .eq("block_id", blocks[0].id)
        .eq("status", "vacant")
        .limit(5);

      if (flatsError) throw flatsError;
      console.log(`✓ Vacant flats in ${blocks[0].name}: ${vacantFlats?.length || 0} flats`);

      if (vacantFlats && vacantFlats.length > 0) {
        console.log(`  Example: ${vacantFlats[0].flat_number}`);
      }
    }

    return true;
  } catch (err) {
    console.error(`✗ Error fetching data: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Community Apartment Management - Database Setup");
  console.log("==================================================\n");

  try {
    const isReady = await setupDatabase();

    if (isReady) {
      console.log("\n✨ Ready to use!");
      console.log("   - Resident signup will show real vacant flats");
      console.log("   - Admin flats management will show all flats");
      console.log("   - Block and flat data is dynamically fetched from database");
    } else {
      console.log("\n⏳ Please complete the manual setup steps above.");
      console.log("   Once done, restart the frontend dev server.");
    }
  } catch (err) {
    console.error("\n❌ Setup failed:", err.message);
    process.exit(1);
  }
}

main();
