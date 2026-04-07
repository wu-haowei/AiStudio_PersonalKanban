export type TaskStatus = 'In Progress' | 'New' | 'Resolved' | 'Rejected' | 'Feedback' | 'Pause' | 'Closed';
export type TaskType = 'Feature' | 'Bug' | 'Test' | 'Optimization' | 'Maintain' | 'Support' | 'Sales' | 'Conference';

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  project: string;
  title: string;
  issueNumber: string;
  createdAt: string;
  completedAt?: string;
  author: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  name: string;
  avatar: string;
  tasks: Task[];
}
