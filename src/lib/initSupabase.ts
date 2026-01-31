// Initialize Supabase database with required table structure
// This should be run once when the application starts

import { supabase } from './supabaseClient';

export const initSupabaseTable = async () => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping table initialization');
    return;
  }

  // Create the projects table if it doesn't exist
  // Note: In a real Supabase environment, you would typically create tables via the Supabase dashboard
  // This function would be mainly for ensuring the table exists
  
  console.log('Checking for projects table...');
  
  try {
    // Check if we have any records in the projects table
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error checking projects table:', error);
      // Note: Table creation should normally be done in Supabase dashboard or migration script
      console.log('Please ensure the "projects" table exists in your Supabase database.');
      console.log('The table should have columns: id (text), data (jsonb), updated_at (timestamp)');
      return;
    }

    console.log(`Projects table exists with ${count} records`);
    
    // If no records exist, initialize with default data
    if (count === 0) {
      console.log('Initializing with default data...');
      const defaultData = {
        departments: [
          {
            id: "engineering",
            name: "工程部",
            teams: [
              {
                id: "frontend",
                name: "前端组",
                projects: [
                  {
                    id: "web-redesign",
                    name: "官网重构项目",
                    members: ["张三", "李四", "王五"],
                    milestones: [
                      { id: "planning", name: "项目规划", completed: true },
                      { id: "design", name: "UI/UX设计", completed: true },
                      { id: "development", name: "开发阶段", completed: false },
                      { id: "testing", name: "测试阶段", completed: false },
                      { id: "deployment", name: "部署上线", completed: false }
                    ]
                  }
                ]
              },
              {
                id: "backend",
                name: "后端组",
                projects: [
                  {
                    id: "api-overhaul",
                    name: "API重构项目",
                    members: ["赵六", "孙七"],
                    milestones: [
                      { id: "analysis", name: "需求分析", completed: true },
                      { id: "architecture", name: "架构设计", completed: false },
                      { id: "implementation", name: "实现阶段", completed: false },
                      { id: "review", name: "代码审查", completed: false }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: "marketing",
            name: "市场部",
            teams: [
              {
                id: "content",
                name: "内容组",
                projects: [
                  {
                    id: "campaign-q1",
                    name: "Q1营销活动",
                    members: ["周八", "吴九"],
                    milestones: [
                      { id: "research", name: "市场调研", completed: true },
                      { id: "strategy", name: "策略制定", completed: true },
                      { id: "execution", name: "执行阶段", completed: false }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const { error: insertError } = await supabase
        .from('projects')
        .insert([
          { 
            id: 'main', 
            data: defaultData, 
            updated_at: new Date().toISOString() 
          }
        ]);

      if (insertError) {
        console.error('Error inserting default data:', insertError);
      } else {
        console.log('Default data inserted successfully');
      }
    }
  } catch (err) {
    console.error('Unexpected error during table initialization:', err);
  }
};