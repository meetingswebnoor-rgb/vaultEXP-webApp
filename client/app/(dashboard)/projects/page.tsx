'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Briefcase, Activity, Calendar, KanbanSquare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function ProjectsDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/projects')
       .then(res => setProjects(res.data.data.projects))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse h-96 bg-white/5 rounded-2xl w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold">Projects</h2>
          <p className="text-gray-400 mt-1">Manage cross-functional workflows and task pipelines.</p>
        </div>
        <button className="px-5 py-2.5 bg-vault-green text-black font-bold rounded-xl hover:bg-vault-green/90 transition-all flex items-center gap-2">
          <Briefcase size={16} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full p-12 bg-white/5 border border-white/10 rounded-2xl text-center">
            <KanbanSquare size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-bold text-white">No Active Projects</h3>
            <p className="text-gray-400 mt-2">Create your first project to start tracking tasks and workflows.</p>
          </div>
        ) : (
          projects.map(proj => {
            const total = proj.tasks.length;
            const completed = proj.tasks.filter((t: any) => t.status === 'done').length;
            const progress = total > 0 ? (completed / total) * 100 : 0;

            return (
              <Link 
                href={`/projects/${proj.id}`} 
                key={proj.id}
                className="group block p-6 bg-gradient-to-br from-vault-card to-vault-darker border border-white/5 hover:border-vault-green/30 rounded-2xl shadow-xl transition-all hover:scale-[1.02] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-vault-green/5 blur-[40px]" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-vault-green border border-white/10">
                    <Briefcase size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold uppercase",
                    proj.status === 'active' ? "bg-vault-green/10 text-vault-green" : "bg-white/5 text-gray-400"
                  )}>
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 relative z-10">{proj.name}</h3>
                <p className="text-sm text-gray-400 mb-6 flex items-center gap-2 relative z-10">
                  <Activity size={14} /> {proj.workspace ? proj.workspace.name : 'Personal'}
                </p>
                
                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-vault-green rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {proj.dueDate && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 relative z-10">
                    <Calendar size={12} /> Due: {new Date(proj.dueDate).toLocaleDateString()}
                  </div>
                )}
              </Link>
            )
          })
        )}
      </div>
    </div>
  );
}
