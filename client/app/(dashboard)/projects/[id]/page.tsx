'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { KanbanSquare, Calendar as CalendarIcon, List, AlertCircle } from 'lucide-react';
import AIWorkflowOptimizer from '@/components/project/AIWorkflowOptimizer';
import { cn } from '@/lib/utils/cn';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', label: 'Review', color: 'bg-yellow-500' },
  { id: 'done', label: 'Completed', color: 'bg-vault-green' }
];

export default function ProjectWorkspaceView({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('board');

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = () => {
    api.get(`/projects/${params.id}`)
       .then(res => setProject(res.data.data.project))
       .catch(console.error);
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    // Optimistic update
    setProject((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t)
    }));
    await api.put(`/projects/tasks/${taskId}/status`, { status: newStatus });
  };

  if (!project) return <div className="animate-pulse h-96 bg-white/5 rounded-2xl w-full" />;

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-vault-green mb-1">
            <KanbanSquare size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">{project.workspace?.name || 'Personal'}</span>
          </div>
          <h2 className="text-3xl font-display font-bold">{project.name}</h2>
        </div>
        
        <div className="flex gap-2 p-1 bg-vault-card border border-white/5 rounded-xl">
          <button 
            onClick={() => setActiveTab('board')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2", activeTab === 'board' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white")}
          >
            <KanbanSquare size={16} /> Board
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2", activeTab === 'list' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white")}
          >
            <List size={16} /> List
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2", activeTab === 'calendar' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white")}
          >
            <CalendarIcon size={16} /> Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Main Interface Area */}
        <div className="xl:col-span-3 bg-vault-card border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          {activeTab === 'board' && (
            <div className="flex-1 flex overflow-x-auto p-6 gap-6 custom-scrollbar">
              {COLUMNS.map(col => {
                const colTasks = project.tasks.filter((t: any) => t.status === col.id);
                return (
                  <div key={col.id} className="w-80 shrink-0 flex flex-col h-full bg-vault-darker/50 rounded-xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                        <h3 className="font-bold text-white text-sm">{col.label}</h3>
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                      {colTasks.map((task: any) => (
                        <div key={task.id} className="p-4 bg-vault-card border border-white/10 rounded-xl hover:border-vault-green/30 transition-all cursor-grab active:cursor-grabbing group">
                          <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                              task.priority === 'urgent' ? "bg-red-500/10 text-red-400" :
                              task.priority === 'high' ? "bg-orange-500/10 text-orange-400" : "bg-white/5 text-gray-400"
                            )}>
                              {task.priority}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-sm leading-tight mb-3">{task.title}</h4>
                          
                          {/* Mock Move Actions for Demo (No native drag n drop setup yet) */}
                          <div className="flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            {col.id !== 'todo' && (
                              <button onClick={() => moveTask(task.id, 'todo')} className="text-[10px] bg-white/10 px-2 py-1 rounded">← Move</button>
                            )}
                            {col.id !== 'done' && (
                              <button onClick={() => moveTask(task.id, 'done')} className="text-[10px] bg-vault-green/20 text-vault-green px-2 py-1 rounded ml-auto">Done ✓</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'list' && (
            <div className="p-6 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-white/5">
                  <tr>
                    <th className="px-6 py-3 rounded-tl-xl">Task</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3 rounded-tr-xl">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {project.tasks.map((task: any) => (
                    <tr key={task.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-bold text-white">{task.title}</td>
                      <td className="px-6 py-4 capitalize">{task.status.replace('_', ' ')}</td>
                      <td className="px-6 py-4 capitalize">{task.priority}</td>
                      <td className="px-6 py-4">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
              <CalendarIcon size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400 font-bold">Calendar grid layout would render here.</p>
            </div>
          )}
        </div>

        {/* AI & Meta Panel */}
        <div className="space-y-6 overflow-y-auto custom-scrollbar">
          <AIWorkflowOptimizer projectId={project.id} />
          
          <div className="bg-vault-card border border-white/5 rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-4 text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={14} /> Project Health
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Completion</span>
                  <span className="text-white font-bold">
                    {Math.round((project.tasks.filter((t:any) => t.status==='done').length / (project.tasks.length || 1)) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-vault-green rounded-full w-2/3" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Overdue Tasks</span>
                  <span className="text-red-400 font-bold">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
