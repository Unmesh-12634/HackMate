
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env - simplified
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

async function checkSchema() {
    console.log("Checking 'tasks' table schema...");

    // Try to select assignee_id. If column is missing, this will error.
    const { data, error } = await supabase.from('tasks').select('assignee_id').limit(1);

    if (error) {
        console.error("❌ Error querying 'assignee_id':", error.message);
        if (error.message.includes("does not exist") || error.code === 'PGRST301') {
            console.error("CRITICAL: The 'assignee_id' column is MISSING. Please run 'master_database_setup.sql'.");
        }
    } else {
        console.log("✅ 'assignee_id' column exists.");
    }

    console.log("\nChecking 'teams' table for 'invite_code'...");
    const { data: teamData, error: teamError } = await supabase.from('teams').select('invite_code').limit(1);
    if (teamError) {
        console.error("❌ Error querying 'invite_code':", teamError.message);
    } else {
        console.log("✅ 'invite_code' column exists.");
    }
}

checkSchema();
