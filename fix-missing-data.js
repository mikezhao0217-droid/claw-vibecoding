const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://lgxjxdlscsuwgxurlxpk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneGp4ZGxzY3N1d2d4dXJseHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjQ0ODAsImV4cCI6MjA4NTQ0MDQ4MH0.MnqRHEpV603IbWdlmyGstJ2mdHJGMBfWMFpGCg9u2sg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixMissingData() {
  console.log('Attempting to add missing departments and teams...\n');

  try {
    // First, let's check if we can insert data with anon key
    // This might fail due to Row Level Security policies
    
    // Try to insert missing department
    console.log('Trying to add department: engineering2');
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .insert([{ id: 'engineering2', name: '工程二部' }])
      .select();

    if (deptError) {
      console.log(`Could not insert department directly (this is expected): ${deptError.message}`);
      console.log('This typically happens because of Row Level Security policies.');
      console.log('We need the Service Role key to bypass RLS, or the proper database permissions.');
    } else {
      console.log('✓ Department added successfully');
    }

    // Try to insert missing team
    console.log('\nTrying to add team: frontend1');
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert([{ id: 'frontend1', name: '前端一组', department_id: 'engineering2' }])
      .select();

    if (teamError) {
      console.log(`Could not insert team directly: ${teamError.message}`);
    } else {
      console.log('✓ Team added successfully');
    }

    console.log('\n--- SOLUTION ---');
    console.log('Since direct insertion with anon key failed (which is expected), here are the recommended approaches:');
    console.log('');
    console.log('1. Go to your Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/lgxjxdlscsuwgxurlxpk/sql');
    console.log('');
    console.log('2. Run these SQL commands in the SQL Editor:');
    console.log('   INSERT INTO departments (id, name) VALUES (\'engineering2\', \'工程二部\') ON CONFLICT (id) DO NOTHING;');
    console.log('   INSERT INTO teams (id, name, department_id) VALUES (\'frontend1\', \'前端一组\', \'engineering2\') ON CONFLICT (id) DO NOTHING;');
    console.log('');
    console.log('3. OR, modify the frontend to only allow valid department/team selections.');
    console.log('');
    console.log('4. Current valid departments: engineering, marketing, sales, hr');
    console.log('5. Current valid teams: frontend, backend, mobile, content, creative');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixMissingData();