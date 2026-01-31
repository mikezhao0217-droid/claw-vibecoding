export interface Milestone {
  id: string;
  name: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  members: string[];
  milestones: Milestone[];
}

export interface Team {
  id: string;
  name: string;
  projects: Project[];
}

export interface Department {
  id: string;
  name: string;
  teams: Team[];
}

export interface ProjectData {
  departments: Department[];
}