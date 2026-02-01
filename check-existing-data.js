const { createClient } = require('@supabase/supabase-js');

// Directly use the Supabase credentials
const supabaseUrl = 'https://lgxjxdlscsuwgxurlxpk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneGp4ZGxzY3N1d2d4dXJseHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjQ0ODAsImV4cCI6MjA4NTQ0MDQ4MH0.MnqRHEpV603IbWdlmyGstJ2mdHJGMBfWMFpGCg9u2sg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkExistingData() {
  console.log('Checking existing departments and teams in the database...\n');

  // Check existing departments
  console.log('=== Fetching Departments ===');
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('*');

  if (deptError) {
    console.error('Error fetching departments:', deptError);
  } else {
    console.log('Departments:');
    if (departments && departments.length > 0) {
      departments.forEach(dept => {
        console.log(`- ID: ${dept.id}, Name: ${dept.name}`);
      });
    } else {
      console.log('No departments found');
    }
  }
  console.log('');

  // Check existing teams
  console.log('=== Fetching Teams ===');
  const { data: teams, error: teamError } = await supabase
    .from('teams')
    .select('*');

  if (teamError) {
    console.error('Error fetching teams:', teamError);
  } else {
    console.log('Teams:');
    if (teams && teams.length > 0) {
      teams.forEach(team => {
        console.log(`- ID: ${team.id}, Name: ${team.name}, Department ID: ${team.department_id}`);
      });
    } else {
      console.log('No teams found');
    }
  }
  console.log('');

  // Check existing projects
  console.log('=== Fetching Projects ===');
  const { data: projects, error: projError } = await supabase
    .from('user_projects')
    .select('*');

  if (projError) {
    console.error('Error fetching projects:', projError);
  } else {
    console.log('Projects:');
    if (projects && projects.length > 0) {
      projects.forEach(project => {
        console.log(`- ID: ${project.id}, Name: ${project.name}, Department: ${project.department}, Team: ${project.team}`);
      });
    } else {
      console.log('No projects found');
    }
  }
  console.log('');
}

// Run the function
checkExistingData().catch(console.error);