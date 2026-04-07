import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, ChevronDown, X, Check } from 'lucide-react';
import { Column } from './components/Column';
import { TaskCard } from './components/TaskCard';
import { MOCK_PEOPLE } from './constants';
import { Person, Task } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [people, setPeople] = useState<Person[]>(MOCK_PEOPLE);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const [showClosed, setShowClosed] = useState(true);
  const [selectedProject, setSelectedProject] = useState('所有專案');
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>(MOCK_PEOPLE.map(p => p.id));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const togglePersonFilter = (id: string) => {
    setSelectedPeopleIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const filteredPeople = people
    .filter(p => selectedPeopleIds.includes(p.id))
    .map(p => ({
      ...p,
      tasks: p.tasks.filter(t => {
        const projectMatch = selectedProject === '所有專案' || t.project === selectedProject;
        const statusMatch = showClosed || t.status !== 'Closed';
        return projectMatch && statusMatch;
      })
    }));

  const findPersonById = (id: string) => {
    // Check if it's a person ID
    if (people.some(p => p.id === id)) {
      return people.find(p => p.id === id);
    }
    // Check if it's a droppable ID
    if (id.startsWith('droppable-')) {
      const personId = id.replace('droppable-', '');
      return people.find(p => p.id === personId);
    }
    // Check if it's a task ID
    return people.find((p) => p.tasks.some((t) => t.id === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    
    // Check if dragging a person (column)
    const person = people.find(p => p.id === activeId);
    if (person) {
      setActivePerson(person);
      return;
    }

    // Check if dragging a task
    const taskPerson = findPersonById(activeId);
    if (taskPerson) {
      const task = taskPerson.tasks.find((t) => t.id === activeId);
      if (task) setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    return;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      setActivePerson(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle Person (Column) reordering
    if (activePerson) {
      const overPerson = findPersonById(overId);
      if (overPerson && activeId !== overPerson.id) {
        setPeople((prev) => {
          const oldIndex = prev.findIndex((p) => p.id === activeId);
          const newIndex = prev.findIndex((p) => p.id === overPerson.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
      setActivePerson(null);
      return;
    }

    // Handle Task reordering
    const activeTaskPerson = findPersonById(activeId);
    const overPerson = findPersonById(overId);

    if (activeTaskPerson && overPerson && activeTaskPerson.id === overPerson.id) {
      const activeIndex = activeTaskPerson.tasks.findIndex((t) => t.id === activeId);
      // If overId is a task, get its index. If it's a column/droppable, move to end.
      const isOverTask = overPerson.tasks.some(t => t.id === overId);
      const overIndex = isOverTask 
        ? overPerson.tasks.findIndex((t) => t.id === overId)
        : overPerson.tasks.length - 1;

      if (activeIndex !== overIndex) {
        setPeople((prev) =>
          prev.map((p) => {
            if (p.id === activeTaskPerson.id) {
              return {
                ...p,
                tasks: arrayMove(p.tasks, activeIndex, overIndex),
              };
            }
            return p;
          })
        );
      }
    }

    setActiveTask(null);
  };

  const allProjects = ['所有專案', ...Array.from(new Set(MOCK_PEOPLE.flatMap(p => p.tasks.map(t => t.project))))];

  return (
    <div className="flex flex-col h-screen bg-[#f4f5f7] font-sans text-gray-900">
      {/* Header */}
      <header className="bg-[#2d3748] text-white px-6 py-3 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-bold tracking-wide">人員看板</h1>
        <button className="bg-black hover:bg-gray-800 text-white text-xs font-bold py-2 px-4 rounded flex items-center gap-2 transition-all">
          <Plus className="w-4 h-4" />
          新增任務
        </button>
      </header>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center gap-6 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-gray-600 whitespace-nowrap">專案篩選 :</label>
          <div className="relative">
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px] cursor-pointer"
            >
              {allProjects.map(proj => (
                <option key={proj} value={proj}>{proj}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-gray-600 whitespace-nowrap">人員篩選</label>
          <div className="relative group">
            <div className="bg-white border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm min-w-[150px] text-gray-700 cursor-pointer flex items-center justify-between">
              {selectedPeopleIds.length === MOCK_PEOPLE.length ? '所有人員' : `已選擇 ${selectedPeopleIds.length} 人`}
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {/* Simple Dropdown for Personnel */}
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50 hidden group-hover:block">
              {MOCK_PEOPLE.map(p => (
                <div 
                  key={p.id}
                  onClick={() => togglePersonFilter(p.id)}
                  className="px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <div className={cn(
                    "w-3 h-3 rounded-sm border flex items-center justify-center",
                    selectedPeopleIds.includes(p.id) ? "bg-blue-500 border-blue-500" : "border-gray-300"
                  )}>
                    {selectedPeopleIds.includes(p.id) && <Check className="w-2 h-2 text-white" />}
                  </div>
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {MOCK_PEOPLE.filter(p => selectedPeopleIds.includes(p.id)).map(p => (
            <div 
              key={p.id} 
              onClick={() => togglePersonFilter(p.id)}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs font-medium text-gray-700 transition-colors cursor-pointer"
            >
              {p.name}
              <X className="w-3 h-3 text-gray-400" />
            </div>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div 
              onClick={() => setShowClosed(!showClosed)}
              className={cn(
                "w-4 h-4 rounded border flex items-center justify-center transition-all",
                showClosed ? "bg-black border-black" : "bg-white border-gray-300"
              )}
            >
              {showClosed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-xs font-bold text-gray-600">顯示 Closed 狀態</span>
          </label>
        </div>
      </div>

      {/* Board Content */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full items-start">
            <SortableContext
              items={filteredPeople.map(p => p.id)}
              strategy={horizontalListSortingStrategy}
            >
              {filteredPeople.map((person) => (
                <Column 
                  key={person.id} 
                  person={person} 
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeTask ? <TaskCard task={activeTask} /> : null}
            {activePerson ? <Column person={activePerson} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
