import React from 'react';
import { ActivityDto, ActivityStatus } from '../types';

interface ActivityTableProps {
  activities: ActivityDto[];
  onEdit: (activity: ActivityDto) => void;
  onDelete: (activity: ActivityDto) => void;
  onSubmitDraft: (activity: ActivityDto) => void;
  onTransition: (activity: ActivityDto, status: ActivityStatus) => void;
  onAddComment: (activity: ActivityDto) => void;
  canApprove: boolean;
  userId: number;
}

const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  onEdit,
  onDelete,
  onSubmitDraft,
  onTransition,
  onAddComment,
  canApprove,
  userId,
}) => {
  if (!activities.length) {
    return <p className="muted">No activities yet. Use the form above to add your first entry.</p>;
  }

  return (
    <div className="grid">
      {activities.map((activity) => {
        const isOwner = activity.owner.id === userId;
        return (
          <article className="card activity" key={activity.id}>
            <header>
              <div>
                <h3>{activity.title}</h3>
                <p className="muted">
                  {new Date(activity.activityDate).toLocaleDateString()} • {activity.activityType.replace(/_/g, ' ')} •{' '}
                  {activity.hours} hrs
                </p>
              </div>
              <span className={`status status-${activity.status.toLowerCase()}`}>{activity.status}</span>
            </header>
            {activity.provider && <p className="muted">Provider: {activity.provider}</p>}
            {activity.tags.length > 0 && (
              <p className="tags">
                {activity.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </p>
            )}
            {activity.reflection && <p className="reflection">“{activity.reflection}”</p>}
            <section className="history">
              <strong>Workflow</strong>
              <ul>
                {activity.statusHistory.map((entry) => (
                  <li key={entry.id}>
                    <span>{entry.status}</span>
                    <small>
                      {new Date(entry.createdAt).toLocaleString()} by {entry.changedBy?.displayName ?? 'System'}
                    </small>
                    {entry.comment && <p className="muted">{entry.comment}</p>}
                  </li>
                ))}
              </ul>
            </section>
            <section className="history">
              <strong>Comments</strong>
              <ul>
                {activity.comments.length === 0 && <li className="muted">No comments yet.</li>}
                {activity.comments.map((comment) => (
                  <li key={comment.id}>
                    <span>{comment.author.displayName}</span>
                    <small>{new Date(comment.createdAt).toLocaleString()}</small>
                    <p>{comment.body}</p>
                  </li>
                ))}
              </ul>
            </section>
            <footer>
              <div className="actions">
                {isOwner && activity.status === 'DRAFT' && (
                  <>
                    <button onClick={() => onEdit(activity)}>Edit</button>
                    <button className="primary" onClick={() => onSubmitDraft(activity)}>
                      Submit for Review
                    </button>
                    <button className="ghost" onClick={() => onDelete(activity)}>
                      Delete
                    </button>
                  </>
                )}
                {canApprove && activity.status === 'SUBMITTED' && (
                  <>
                    <button className="primary" onClick={() => onTransition(activity, 'APPROVED')}>
                      Approve
                    </button>
                    <button className="ghost" onClick={() => onTransition(activity, 'REJECTED')}>
                      Reject
                    </button>
                  </>
                )}
                <button onClick={() => onAddComment(activity)}>Add Comment</button>
              </div>
            </footer>
          </article>
        );
      })}
    </div>
  );
};

export default ActivityTable;
