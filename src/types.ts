export type RoleName = 'TEACHER' | 'SUPERVISOR' | 'ADMIN';

export interface RoleDto {
  id: number;
  name: RoleName;
}

export interface UserDto {
  id: number;
  email: string;
  displayName: string;
  role: RoleDto;
}

export type ActivityStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type ActivityType =
  | 'SERVICE'
  | 'PROFESSIONAL_DEVELOPMENT'
  | 'COMMUNITY'
  | 'OTHER';

export interface ActivityStatusEntry {
  id: number;
  status: ActivityStatus;
  comment?: string | null;
  changedBy?: {
    id: number;
    displayName: string;
    role: RoleName;
  } | null;
  createdAt: string;
}

export interface ActivityComment {
  id: number;
  body: string;
  author: {
    id: number;
    displayName: string;
    role: RoleName;
  };
  createdAt: string;
}

export interface ActivityDto {
  id: number;
  title: string;
  activityType: ActivityType;
  provider?: string | null;
  activityDate: string;
  hours: number;
  reflection?: string | null;
  status: ActivityStatus;
  owner: UserDto;
  reviewer?: UserDto | null;
  tags: string[];
  goalId?: number | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: ActivityStatusEntry[];
  comments: ActivityComment[];
}

export interface ActivityInput {
  title: string;
  activityType: ActivityType;
  provider?: string | null;
  activityDate: string;
  hours: number;
  reflection?: string | null;
  tags: string[];
  goalId?: number | null;
}

export interface LoginResponse {
  token: string;
  user: UserDto;
}

export interface YearlyGoalDto {
  id: number;
  year: number;
  targetHours: number;
  notes?: string | null;
}

export interface ActivityFilters {
  status?: ActivityStatus;
  ownerId?: number;
}

export interface ValidationError {
  message: string;
}
