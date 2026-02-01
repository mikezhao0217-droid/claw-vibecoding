const axios = require('axios');

// Supabase configuration
const SUPABASE_URL = 'https://lgxjxdlscsuwgxurlxpk.supabase.co';
// Note: This is the anon key which typically doesn't have write permissions to tables
// We need the service role key for write operations
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.log("Service role key not found in environment variables.");
  console.log("You'll need to get the SERVICE_ROLE_KEY from your Supabase dashboard:");
  console.log("1. Go to https://supabase.com/dashboard/project/lgxjxdlscsuwgxurlxpk/settings/api");
  console.log("2. Copy the 'Service Role Key'");
  console.log("3. Set it as an environment variable: export SUPABASE_SERVICE_ROLE_KEY='...'"); 
  console.log("\nAlternatively, you can manually add the records via SQL in the Supabase dashboard.");
  process.exit(1);
}

const headers = {
  'apikey': SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

async function addMissingData() {
  console.log('Attempting to add missing departments and teams...\n');

  try {
    // Add missing department
    console.log('Adding department: engineering2');
    const deptResponse = await axios.post(`${SUPABASE_URL}/rest/v1/departments`, 
      { id: 'engineering2', name: '工程二部' },
      { headers }
    );
    console.log('✓ Department added successfully\n');

    // Add missing team
    console.log('Adding team: frontend1');
    const teamResponse = await axios.post(`${SUPABASE_URL}/rest/v1/teams`,
      { id: 'frontend1', name: '前端一组', department_id: 'engineering2' },
      { headers }
    );
    console.log('✓ Team added successfully\n');

    console.log('All missing data has been added successfully!');
  } catch (error) {
    if (error.response) {
      console.error('Error response from Supabase:', error.response.status, error.response.data);
      if (error.response.status === 400 && error.response.data && error.response.data.message && error.response.data.message.includes('already exists')) {
        console.log('Records may already exist, which is fine.');
      }
    } else {
      console.error('Network error:', error.message);
    }
  }
}

addMissingData();