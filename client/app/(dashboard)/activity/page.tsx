'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Activity, Clock, Filter, Plus, Edit2, Trash2, Upload, FileText, KanbanSquare, Users, Building2, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const getModuleIcon = (module: string) => {
  switch (module) {
    case 'DOCUMENT': return <FileText size={16} />;
    case 'TASK': return <KanbanSquare size={16} />;
    case 'BUSINESS': return <Briefcase size={16} />;
    case 'PROPERTY': return <Building2 size={16} />;
    case 'PROJECT': return <KanbanSquare size={16} />;
    default: return <Activity size={16} />;
  }
};

const getActionStyles = (action: string) => {
  switch (action) {
    case 'CREATE': return 'bg-vault-green/10 text-vault-green';
    case 'UPDATE': return 'bg-blue-500/10 text-blue-400';
    case 'DELETE': return 'bg-red-500/10 text-red-400';
    case 'UPLOAD': return 'bg-purple-500/10 text-purple-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const getActionIcon = (action: string) => {
  switch (action) {
    case 'CREATE': return <Plus size={14} />;
    case 'UPDATE': return <Edit2 size={14} />;
    case 'DELETE': return <Trash2 size={14} />;
    case 'UPLOAD': return <Upload size={14} />;
    default: return <Activity size={14} />;
  }
};

export default function ActivityCenter() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ module: '', action: '' });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.module) params.append('module', filters.module);
      if (filters.action) params.append('action', filters.action);
      
      const res = await api.get(`/activity?${params.toString()}`);
      setActivities(res.data.data.activities);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold">Team Activity</h2>
          <p className="text-gray-400 mt-1">Audit log of all actions across your workspaces.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Filters Sidebar */}
        <div className="space-y-4">
          <div className="bg-vault-card border border-white/5 rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-white">
              <Filter size={16} /> Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Module</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vault-green"
                  value={filters.module}
                  onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                >
                  <option value="">All Modules</option>
                  <option value="TASK">Tasks</option>
                  <option value="DOCUMENT">Documents</option>
                  <option value="PROJECT">Projects</option>
                  <option value="BUSINESS">Businesses</option>
                  <option value="PROPERTY">Properties</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Action</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vault-green"
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="UPLOAD">Upload</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-vault-card to-vault-darker border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-vault-green/5 blur-[40px] pointer-events-none" />
            <h3 className="font-bold text-sm mb-2 text-white relative z-10">Activity Stats</h3>
            <p className="text-3xl font-display font-bold text-vault-green relative z-10">{activities.length}</p>
            <p className="text-xs text-gray-400 relative z-10">Events logged in current view</p>
          </div>
        </div>

        {/* Timeline Feed */}
        <div className="lg:col-span-3 bg-vault-card border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="animate-pulse h-96 bg-white/5 w-full" />
          ) : activities.length === 0 ? (
            <div className="p-12 text-center">
              <Activity size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-bold">No activity logged matching these filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5" />
              
              {activities.map((log: any) => (
                <div key={log.id} className="p-6 flex items-start gap-6 hover:bg-white/[0.02] transition-colors relative">
                  
                  {/* Timeline Dot & Icon */}
                  <div className="relative z-10 bg-vault-card p-1">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 border-vault-card shadow-lg", getActionStyles(log.action))}>
                      {getActionIcon(log.action)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pt-2">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-white text-sm">
                        {log.user ? log.user.name : 'System User'} <span className="font-normal text-gray-400">performed an action</span>
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold whitespace-nowrap">
                        <Clock size={12} />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1", getActionStyles(log.action))}>
                        {log.action}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-gray-400 flex items-center gap-1">
                        {getModuleIcon(log.module)} {log.module}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                      {log.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
