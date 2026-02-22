
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve('.env');
let env = {};
try {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });
} catch (e) {
    console.log("Could not read .env file");
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTeams() {
    console.log("--- DEBUGGING TEAM FETCHING ---");

    // 1. Check Schema of 'memberships'
    console.log("\n1. Checking 'memberships' columns...");
    const { data: membershipData, error: membError } = await supabase.from('memberships').select('*').limit(1);
    if (membError) {
        console.error("❌ Error querying memberships:", membError.message);
    } else if (membershipData.length > 0) {
        console.log("✅ Memberships table exists. Sample keys:", Object.keys(membershipData[0]));
        // Check for joined_at
        if ('joined_at' in membershipData[0]) {
            console.log("✅ 'joined_at' column exists.");
        } else {
            console.error("❌ 'joined_at' column is MISSING in 'memberships'.");
        }
    } else {
        console.log("⚠️ Memberships table is empty (or RLS hides rows). Cannot verify columns from data.");
    }

    // 2. Try the exact query used in AppContext
    console.log("\n2. Testing 'fetchTeams' query...");
    // We need a user ID. Let's try to sign in or just query if RLS allows public (unlikely)
    // Since we are running outside browser, we might not have a session.
    // We will try to fetch a specific user's teams if we can find one, or just check the query syntax validity.

    // To properly test RLS and query, we'd need to sign in, but let's just test the syntax first using a dummy ID if needed, 
    // or better, just try to select everything without the eq filter first to see if the select syntax holds.

    const { data: testQuery, error: queryError } = await supabase
        .from('teams')
        .select(`
        *,
        my_membership:memberships!inner(user_id),
        memberships(*, profiles(*)),
        tasks(*, profiles:assignee_id(*))
      `)
        .limit(1);

    if (queryError) {
        console.error("❌ Query Syntax Error:", queryError.message);
        console.error("Details:", queryError.details);
        console.error("Hint:", queryError.hint);
    } else {
        console.log("✅ Query Syntax seems correct (returned " + testQuery.length + " rows without user filter).");
    }
}

debugTeams();
