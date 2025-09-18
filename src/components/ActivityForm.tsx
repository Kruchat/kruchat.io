import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ACTIVITY_TYPES } from '../api';
import { ActivityDto, ActivityInput, ActivityType, YearlyGoalDto } from '../types';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  activityType: z.enum(['SERVICE', 'PROFESSIONAL_DEVELOPMENT', 'COMMUNITY', 'OTHER']),
  provider: z.string().optional(),
  activityDate: z.string().min(1, 'Date is required.'),
  hours: z
    .number({ invalid_type_error: 'Enter a number of hours.' })
    .positive('Hours must be greater than zero.')
    .max(24, 'Split large activities into multiple entries.'),
  tags: z.string().optional(),
  reflection: z.string().optional(),
  goalId: z.union([z.number(), z.nan()]).optional(),
});

export type ActivityFormValues = z.infer<typeof schema>;

interface ActivityFormProps {
  initial?: ActivityDto | null;
  goals: YearlyGoalDto[];
  onSubmit: (input: ActivityInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ initial, goals, onSubmit, onCancel, submitLabel }) => {
  const defaultValues: ActivityFormValues = useMemo(
    () => ({
      title: initial?.title ?? '',
      activityType: initial?.activityType ?? 'PROFESSIONAL_DEVELOPMENT',
      provider: initial?.provider ?? '',
      activityDate: initial?.activityDate ?? new Date().toISOString().slice(0, 10),
      hours: initial?.hours ?? 1,
      tags: initial?.tags.join(', ') ?? '',
      reflection: initial?.reflection ?? '',
      goalId: initial?.goalId ?? Number.NaN,
    }),
    [initial],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onFormSubmit = handleSubmit(async (values) => {
    const payload: ActivityInput = {
      title: values.title,
      activityType: values.activityType as ActivityType,
      provider: values.provider || undefined,
      activityDate: values.activityDate,
      hours: values.hours,
      tags: values.tags
        ? values.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      reflection: values.reflection || undefined,
      goalId: Number.isNaN(values.goalId) ? undefined : values.goalId,
    };
    await onSubmit(payload);
    if (!initial) {
      reset(defaultValues);
    }
  });

  return (
    <form className="card" onSubmit={onFormSubmit}>
      <h2>{initial ? 'Update Activity' : 'Log a New Activity'}</h2>
      <label>
        Title
        <input type="text" {...register('title')} />
        {errors.title && <span className="error">{errors.title.message}</span>}
      </label>
      <label>
        Activity Type
        <select {...register('activityType')}>
          {ACTIVITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </label>
      <label>
        Provider
        <input type="text" {...register('provider')} />
      </label>
      <label>
        Date
        <input type="date" {...register('activityDate')} />
        {errors.activityDate && <span className="error">{errors.activityDate.message}</span>}
      </label>
      <label>
        Hours
        <input type="number" step="0.25" min="0" {...register('hours', { valueAsNumber: true })} />
        {errors.hours && <span className="error">{errors.hours.message}</span>}
      </label>
      <label>
        Tags (comma separated)
        <input type="text" placeholder="STEM, Workshop" {...register('tags')} />
      </label>
      <label>
        Reflection
        <textarea rows={4} {...register('reflection')} />
      </label>
      <label>
        Align to Goal
        <select {...register('goalId', { valueAsNumber: true })}>
          <option value="">None</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.year} Goal — {goal.targetHours} hrs target
            </option>
          ))}
        </select>
      </label>
      <div className="actions">
        {onCancel && (
          <button type="button" className="ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel ?? (initial ? 'Save Changes' : 'Create Activity')}
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;
