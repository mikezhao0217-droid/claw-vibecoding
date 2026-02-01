export interface Milestone {
  id: string;
  name: string;
  completed: boolean;
}

// 用户特定的项目数据
export interface UserProject {
  id: string;
  name: string;
  owner: string; // 负责人
  department: string; // 部门
  team: string; // 小组
  milestones: Milestone[];
  userId: string; // 关联用户ID
}

// 部门信息
export interface Department {
  id: string;
  name: string;
}

// 小组信息
export interface Team {
  id: string;
  name: string;
  departmentId: string; // 所属部门
}

// 用于分组统计的数据结构
export interface GroupProgress {
  id: string;
  name: string;
  totalMilestones: number;
  completedMilestones: number;
  progressPercentage: number;
}

export interface ProjectData {
  departments: Department[];
  teams: Team[];
  userProjects: UserProject[]; // 所有用户的项目
}