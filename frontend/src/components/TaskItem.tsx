import React from 'react';
import { Task } from '../services/api';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, status: 'pending' | 'completed') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const PRIORITY_COLORS = {
  Low: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  High: 'bg-red-100 text-red-700 border-red-200',
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const [isToggling, setIsToggling] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await onToggle(task._id, newStatus);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(task._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className={`text-base font-medium text-slate-800 ${
                task.status === 'completed' ? 'line-through text-slate-500' : ''
              }`}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p
              className={`text-sm text-slate-500 mb-3 ${
                task.status === 'completed' ? 'line-through' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                PRIORITY_COLORS[task.priority]
              }`}
            >
              {task.priority}
            </span>

            {task.createdAt && (
              <span className="text-xs text-slate-400">
                Created {formatDate(task.createdAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              task.status === 'completed'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                : 'bg-green-100 hover:bg-green-200 text-green-700'
            }`}
          >
            {isToggling ? '...' : task.status === 'completed' ? 'Undo' : 'Complete'}
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1.5 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};