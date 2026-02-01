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
  deleted?: boolean; // 是否已删除（软删除标志）
}

// 部门信息
export interface Department {
  id: string;
  name: string;
  deleted?: boolean;
}

// 小组信息
export interface Team {
  id: string;
  name: string;
  deleted?: boolean;
}

// 用于分组统计的数据结构
export interface GroupProgress {
  id: string;
  name: string;
  totalMilestones: number;
  completedMilestones: number;
  progressPercentage: number;
}

// 页面配置
export interface PageConfig {
  id: string;
  projectName: string;        // 项目名称，如"Web编码竞赛项目"
  companyProgressTitle: string;  // 公司整体进度标题
  departmentProgressTitle: string; // 部门进度标题
  teamProgressTitle: string;       // 小组进度标题
  createdAt: string;
  updatedAt: string;
  defaultMilestones?: Milestone[]; // 默认里程碑列表
}

export interface ProjectData {
  departments: Department[];
  teams: Team[];
  userProjects: UserProject[]; // 所有用户的项目
  config?: PageConfig;         // 页面配置
}