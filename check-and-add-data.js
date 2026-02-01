const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndAddDepartmentsAndTeams() {
  console.log('Checking for existing departments and teams...\n');

  // Check existing departments
  const { data: existingDepts, error: deptError } = await supabase
    .from('departments')
    .select('*');

  if (deptError) {
    console.error('Error fetching departments:', deptError);
    return;
  }

  console.log('Current departments:');
  existingDepts.forEach(dept => {
    console.log(`- ID: ${dept.id}, Name: ${dept.name}`);
  });
  console.log('');

  // Check existing teams
  const { data: existingTeams, error: teamError } = await supabase
    .from('teams')
    .select('*');

  if (teamError) {
    console.error('Error fetching teams:', teamError);
    return;
  }

  console.log('Current teams:');
  existingTeams.forEach(team => {
    console.log(`- ID: ${team.id}, Name: ${team.name}, Department ID: ${team.department_id}`);
  });
  console.log('');

  // Define missing departments and teams that were referenced in the error
  const requiredDepartments = [
    { id: "engineering2", name: "工程二部" },
    { id: "engineering", name: "工程部" }
  ];

  const requiredTeams = [
    { id: "frontend1", name: "前端一组", department_id: "engineering2" },
    { id: "frontend", name: "前端组", department_id: "engineering" }
  ];

  // Add missing departments
  for (const dept of requiredDepartments) {
    const exists = existingDepts.some(d => d.id === dept.id);
    if (!exists) {
      console.log(`Adding department: ${dept.id} (${dept.name})`);
      const { error } = await supabase
        .from('departments')
        .insert([dept]);
      
      if (error) {
        console.error(`Error adding department ${dept.id}:`, error);
      } else {
        console.log(`✓ Successfully added department: ${dept.id}`);
      }
    } else {
      console.log(`- Department ${dept.id} already exists`);
    }
  }

  console.log('');

  // Add missing teams
  for (const team of requiredTeams) {
    const exists = existingTeams.some(t => t.id === team.id);
    if (!exists) {
      console.log(`Adding team: ${team.id} (${team.name})`);
      const { error } = await supabase
        .from('teams')
        .insert([team]);
      
      if (error) {
        console.error(`Error adding team ${team.id}:`, error);
      } else {
        console.log(`✓ Successfully added team: ${team.id}`);
      }
    } else {
      console.log(`- Team ${team.id} already exists`);
    }
  }

  console.log('\nCheck and add operation completed.');
}

// Run the function
checkAndAddDepartmentsAndTeams().catch(console.error);