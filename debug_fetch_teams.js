
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

async function debugFetchTeams() {
    console.log("--- DEBUGGING 2-STEP FETCH ---");

    // 1. Get a user to test with.
    // We'll try to find a user who has a membership.
    console.log("Finding a test user...");
    const { data: membershipSample, error: sampleError } = await supabase
        .from('memberships')
        .select('user_id')
        .limit(1);

    if (sampleError) {
        console.error("❌ Error finding sample membership:", sampleError);
        return;
    }

    if (!membershipSample || membershipSample.length === 0) {
        console.log("⚠️ No memberships found in DB. Cannot test team fetching.");
        return;
    }

    const userId = membershipSample[0].user_id;
    console.log("Found Test User ID:", userId);

    // 2. Step 1: Get IDs of teams
    console.log("\nStep 1: Fetching memberships directly...");
    const { data: myMemberships, error: memError } = await supabase
        .from('memberships')
        .select('team_id, joined_at')
        .eq('user_id', userId);

    if (memError) {
        console.error("❌ Step 1 Error:", memError);
        return;
    }
    console.log(`✅ Step 1 Success. Found ${myMemberships.length} memberships.`);
    console.log("Memberships:", myMemberships);

    if (myMemberships.length === 0) return;

    const teamIds = myMemberships.map((m) => m.team_id);
    console.log("Team IDs to fetch:", teamIds);

    // 3. Step 2: Fetch Teams
    console.log("\nStep 2: Fetching teams with .in('id', teamIds)...");
    const { data: teamsData, error: teamError } = await supabase
        .from('teams')
        .select(`
        *,
        memberships(*, profiles(*)),
        tasks(*, profiles:assignee_id(*))
      `)
        .in('id', teamIds);

    if (teamError) {
        console.error("❌ Step 2 Error:", teamError);
    } else {
        console.log(`✅ Step 2 Success. Fetched ${teamsData.length} teams.`);
        if (teamsData.length > 0) {
            console.log("First team name:", teamsData[0].name);
        }
    }
}

debugFetchTeams();
