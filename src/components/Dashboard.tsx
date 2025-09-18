import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addComment,
  createActivity,
  deleteActivity,
  fetchActivities,
  fetchGoals,
  transitionStatus,
  updateActivity,
} from '../api';
import ActivityForm from './ActivityForm';
import ActivityTable from './ActivityTable';
import { useAuth } from '../context/AuthContext';
import { ActivityDto, ActivityInput, ActivityStatus, YearlyGoalDto } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ActivityDto | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activityQuery = useQuery({
    queryKey: ['activities', user?.id],
    queryFn: () => fetchActivities(user!.id),
    enabled: !!user,
  });

  const goalsQuery = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: () => fetchGoals(user!.id),
    enabled: !!user && hasRole('TEACHER'),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (input: ActivityInput) => createActivity(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
      setFeedback('Activity created successfully.');
    },
    onError: (error: unknown) => setFeedback((error as Error).message ?? 'Failed to create activity.'),
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: number; payload: ActivityInput }) =>
      updateActivity(user!.id, variables.id, variables.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
      setFeedback('Activity updated.');
      setEditing(null);
    },
    onError: (error: unknown) => setFeedback((error as Error).message ?? 'Failed to update activity.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (activityId: number) => deleteActivity(user!.id, activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
      setFeedback('Activity deleted.');
    },
    onError: (error: unknown) => setFeedback((error as Error).message ?? 'Unable to delete activity.'),
  });

  const transitionMutation = useMutation({
    mutationFn: (variables: { id: number; status: ActivityStatus; comment?: string }) =>
      transitionStatus(user!.id, variables.id, variables.status, variables.comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
      setFeedback('Status updated.');
      setEditing(null);
    },
    onError: (error: unknown) => setFeedback((error as Error).message ?? 'Status change failed.'),
  });

  const commentMutation = useMutation({
    mutationFn: (variables: { id: number; message: string }) => addComment(user!.id, variables.id, variables.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
      setFeedback('Comment added.');
    },
    onError: (error: unknown) => setFeedback((error as Error).message ?? 'Failed to add comment.'),
  });

  const goals = useMemo<YearlyGoalDto[]>(() => goalsQuery.data ?? [], [goalsQuery.data]);

  const handleSubmit = async (payload: ActivityInput) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleSubmitDraft = (activity: ActivityDto) => {
    const comment = window.prompt('Add a note for your reviewer (optional):');
    transitionMutation.mutate({ id: activity.id, status: 'SUBMITTED', comment: comment || undefined });
  };

  const handleApproval = (activity: ActivityDto, status: ActivityStatus) => {
    const comment = window.prompt('Leave a comment for the educator (optional):');
    transitionMutation.mutate({ id: activity.id, status, comment: comment || undefined });
  };

  const handleAddComment = (activity: ActivityDto) => {
    const comment = window.prompt('Share feedback on this activity:');
    if (comment) {
      commentMutation.mutate({ id: activity.id, message: comment });
    }
  };

  const loading = activityQuery.isLoading || goalsQuery.isLoading;
  const errorMessage = (activityQuery.error as Error)?.message ?? null;

  return (
    <div className="layout">
      <header className="top-bar">
        <div>
          <h1>Welcome back, {user?.displayName}</h1>
          <p className="muted">
            Role: <strong>{user?.role.name}</strong>
          </p>
        </div>
        <button className="ghost" onClick={logout}>
          Sign out
        </button>
      </header>

      {feedback && (
        <div className="notice" role="status">
          {feedback}
          <button className="ghost" onClick={() => setFeedback(null)}>
            ×
          </button>
        </div>
      )}

      {errorMessage && <p className="error">{errorMessage}</p>}

      {hasRole('TEACHER') && (
        <section>
          <ActivityForm
            initial={editing}
            goals={goals}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
            submitLabel={editing ? 'Save Changes' : 'Create Activity'}
          />
        </section>
      )}

      <section>
        <div className="card">
          <h2>Activity Log</h2>
          {loading && <p>Loading activities…</p>}
          {!loading && activityQuery.data && (
            <ActivityTable
              activities={activityQuery.data}
              onEdit={(activity) => setEditing(activity)}
              onDelete={(activity) => {
                if (window.confirm('Delete this draft activity?')) {
                  deleteMutation.mutate(activity.id);
                }
              }}
              onSubmitDraft={handleSubmitDraft}
              onTransition={handleApproval}
              onAddComment={handleAddComment}
              canApprove={hasRole('SUPERVISOR', 'ADMIN')}
              userId={user!.id}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
