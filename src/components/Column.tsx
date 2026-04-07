import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, ChevronDown, GripHorizontal } from 'lucide-react';
import { Person } from '../types';
import { TaskCard } from './TaskCard';
import { cn } from '../lib/utils';

interface ColumnProps {
  person: Person;
  isOverlay?: boolean;
}

export const Column: React.FC<ColumnProps> = ({ person, isOverlay }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: person.id,
    data: {
      type: 'container',
    },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `droppable-${person.id}`,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col bg-gray-50/50 rounded-xl p-3 h-full transition-all duration-300",
        isCollapsed ? "w-[60px] min-w-[60px]" : "w-fit min-w-[320px]",
        isOverlay && "shadow-2xl ring-2 ring-blue-400 opacity-100"
      )}
    >
      <div 
        className={cn(
          "flex items-center mb-4 px-1 select-none group",
          isCollapsed ? "flex-col gap-4" : "justify-between"
        )}
      >
        <div 
          {...attributes}
          {...listeners}
          className={cn("flex items-center gap-2 cursor-grab active:cursor-grabbing", isCollapsed && "flex-col")}
        >
          <div className="relative">
            <img
              src={person.avatar}
              alt={person.name}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              referrerPolicy="no-referrer"
            />
            {isCollapsed && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {person.tasks.length}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h3 className="font-bold text-gray-700 text-sm flex items-center gap-1">
                {person.name} 
                <GripHorizontal className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <span className="text-[10px] text-gray-400 font-normal">({person.tasks.length} 任務)</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div
          ref={setDroppableRef}
          style={{ writingMode: 'vertical-lr' }}
          className={cn(
            "flex-1 min-h-[100px] overflow-y-hidden overflow-x-visible",
            "flex flex-wrap gap-3 content-start"
          )}
        >
          <SortableContext
            id={person.id}
            items={person.tasks.map(t => t.id)}
            strategy={rectSortingStrategy}
          >
            {person.tasks.map((task) => (
              <div 
                key={task.id} 
                style={{ writingMode: 'horizontal-tb' }}
                className="w-[300px] shrink-0 transition-all duration-300"
              >
                <TaskCard task={task} />
              </div>
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};
