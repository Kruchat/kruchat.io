import { invoke } from '@tauri-apps/api/tauri';
import {
  ActivityDto,
  ActivityFilters,
  ActivityInput,
  ActivityStatus,
  ActivityType,
  LoginResponse,
  YearlyGoalDto,
} from './types';

export async function authenticate(email: string, password: string): Promise<LoginResponse> {
  return invoke<LoginResponse>('login', { payload: { email, password } });
}

export async function fetchActivities(actorId: number, filters?: ActivityFilters): Promise<ActivityDto[]> {
  const response = await invoke<{ activities: ActivityDto[] }>('list_activities', {
    actorId,
    filters,
  });
  return response.activities;
}

export async function createActivity(actorId: number, input: ActivityInput): Promise<ActivityDto> {
  return invoke<ActivityDto>('create_activity', { actorId, input });
}

export async function updateActivity(
  actorId: number,
  activityId: number,
  input: ActivityInput,
): Promise<ActivityDto> {
  return invoke<ActivityDto>('update_activity', { actorId, activityId, input });
}

export async function deleteActivity(actorId: number, activityId: number): Promise<void> {
  await invoke('delete_activity', { actorId, activityId });
}

export async function transitionStatus(
  actorId: number,
  activityId: number,
  status: ActivityStatus,
  comment?: string,
): Promise<ActivityDto> {
  return invoke<ActivityDto>('transition_activity_status', {
    actorId,
    payload: {
      activityId,
      status,
      comment,
    },
  });
}

export async function addComment(actorId: number, activityId: number, body: string): Promise<ActivityDto> {
  return invoke<ActivityDto>('add_comment', {
    actorId,
    payload: {
      activityId,
      body,
    },
  });
}

export async function fetchGoals(userId: number): Promise<YearlyGoalDto[]> {
  return invoke<YearlyGoalDto[]>('list_goals', { userId });
}

export const ACTIVITY_TYPES: ActivityType[] = [
  'SERVICE',
  'PROFESSIONAL_DEVELOPMENT',
  'COMMUNITY',
  'OTHER',
];
