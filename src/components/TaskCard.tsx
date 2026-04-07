import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, Clock } from 'lucide-react';
import { Task, TaskType, TaskStatus } from '../types';
import { cn } from '../lib/utils';

interface TaskCardProps {
  task: Task;
}

const TYPE_COLORS: Record<TaskType, string> = {
  Feature: 'border-blue-500 text-blue-600 bg-blue-50',
  Bug: 'border-red-500 text-red-600 bg-red-50',
  Test: 'border-yellow-500 text-yellow-600 bg-yellow-50',
  Optimization: 'border-indigo-500 text-indigo-600 bg-indigo-50',
  Maintain: 'border-purple-500 text-purple-600 bg-purple-50',
  Support: 'border-emerald-500 text-emerald-600 bg-emerald-50',
  Sales: 'border-pink-500 text-pink-600 bg-pink-50',
  Conference: 'border-cyan-500 text-cyan-600 bg-cyan-50',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  'In Progress': 'text-blue-500',
  New: 'text-purple-500',
  Resolved: 'text-emerald-500',
  Rejected: 'text-red-500',
  Feedback: 'text-orange-500',
  Pause: 'text-yellow-600',
  Closed: 'text-gray-400',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeColorClass = TYPE_COLORS[task.type] || 'border-gray-500 text-gray-600 bg-gray-50';
  const statusColorClass = STATUS_COLORS[task.status] || 'text-gray-500';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white rounded-lg shadow-sm border-l-4 p-3 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
        typeColorClass.split(' ')[0], // Only border color for the card edge
        task.status === 'Closed' && "opacity-60 grayscale-[0.5]"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", typeColorClass)}>
          {task.type}
        </span>
        <span className={cn("text-[10px] font-bold uppercase", statusColorClass)}>
          {task.status}
        </span>
      </div>

      <div className="mb-2">
        <h4 className="text-sm font-bold text-gray-800 truncate">{task.project}</h4>
        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">#{task.issueNumber} {task.title}</p>
      </div>

      <div className="space-y-1 mt-3 pt-2 border-t border-gray-50">
        <div className="flex items-center text-[10px] text-gray-500">
          <Calendar className="w-3 h-3 mr-1 text-red-400" />
          <span className="mr-2">建立: {task.createdAt}</span>
          {task.completedAt && (
            <>
              <Calendar className="w-3 h-3 mr-1 text-red-400" />
              <span>完成: {task.completedAt}</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-[10px] text-gray-500">
            <User className="w-3 h-3 mr-1" />
            <span>{task.author}</span>
          </div>
          <div className="flex items-center text-[10px] text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>{task.updatedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
