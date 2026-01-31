// Server-side database initialization
// This should run on the server to create required tables if they don't exist

import { createClient } from '@supabase/supabase-js';
import { ProjectData } from '@/types/project';

// Use service role key for schema operations (should be stored securely on server)
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null;

export const initializeDatabaseSchema = async () => {
  if (!supabaseService) {
    console.warn('Supabase service role key not configured, skipping schema initialization');
    return false;
  }

  try {
    // We can't run CREATE TABLE directly via the Supabase client
    // Instead, we'll verify that the table exists by trying to query it
    const { error } = await supabaseService
      .from('projects')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') { // Undefined table error code
      console.error('Projects table does not exist. Please create it manually in the Supabase dashboard.');
      console.log(`
        Run this SQL in your Supabase SQL Editor:
        
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Allow read access for all users" ON projects
          FOR SELECT TO anon
          USING (true);

        CREATE POLICY "Allow insert access for all users" ON projects
          FOR INSERT TO anon
          WITH CHECK (true);

        CREATE POLICY "Allow update access for all users" ON projects
          FOR UPDATE TO anon
          USING (true);
      `);
      return false;
    }

    console.log('Database schema verified successfully');
    return true;
  } catch (error) {
    console.error('Error verifying database schema:', error);
    return false;
  }
};

// Initialize default data if the table is empty
export const initializeDefaultData = async () => {
  if (!supabaseService) {
    console.warn('Supabase service role key not configured, skipping default data initialization');
    return false;
  }

  try {
    // Check if we already have data
    const { count, error } = await supabaseService
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error checking for existing data:', error);
      return false;
    }

    if (count === 0) {
      console.log('Initializing with default data...');
      
      const defaultData: ProjectData = {
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

      const { error: insertError } = await supabaseService
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
        return false;
      }

      console.log('Default data inserted successfully');
    }

    return true;
  } catch (error) {
    console.error('Error initializing default data:', error);
    return false;
  }
};