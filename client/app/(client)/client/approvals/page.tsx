'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, PenTool, FileSignature, Clock, ExternalLink, FileText, CreditCard, ListTodo, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

type WorkflowType = 'task' | 'invoice' | 'contract' | 'document';
type WorkflowStatus = 'pending' | 'completed';

interface WorkflowItem {
  id: string;
  type: WorkflowType;
  title: string;
  status: WorkflowStatus;
  createdAt: string;
  completedAt?: string;
  metadata?: any;
}

export default function ClientWorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | WorkflowType>('all');

  useEffect(() => {
    // Simulated fetch from /api/client/workflows
    setTimeout(() => {
      setWorkflows([
        { id: 'w1', type: 'contract', title: 'Consulting Retainer Agreement v2', status: 'pending', createdAt: '2026-05-19T14:30:00Z' },
        { id: 'w2', type: 'invoice', title: 'Approve Invoice INV-2026-001 ($1,250.00)', status: 'pending', createdAt: '2026-05-20T09:00:00Z' },
        { id: 'w3', type: 'task', title: 'Upload W-9 Tax Form', status: 'pending', createdAt: '2026-05-18T10:00:00Z' },
        { id: 'w4', type: 'document', title: 'Review Draft: Project Architecture', status: 'completed', createdAt: '2026-05-10T10:00:00Z', completedAt: '2026-05-11T14:00:00Z' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAction = async (id: string) => {
    // Simulated action call to /api/client/workflows/:id/approve
    setWorkflows(prev => prev.map(w => 
      w.id === id ? { ...w, status: 'completed', completedAt: new Date().toISOString() } : w
    ));
  };

  const filteredWorkflows = filter === 'all' ? workflows : workflows.filter(w => w.type === filter);
  const pendingCount = workflows.filter(w => w.status === 'pending').length;

  const getTypeConfig = (type: WorkflowType) => {
    switch (type) {
      case 'contract': return { icon: PenTool, label: 'Contract', color: 'orange' };
      case 'invoice': return { icon: CreditCard, label: 'Invoice', color: 'blue' };
      case 'document': return { icon: FileText, label: 'Document', color: 'purple' };
      case 'task': return { icon: ListTodo, label: 'Task', color: 'pink' };
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-32">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <CheckSquare className="text-[var(--brand-primary,#2563EB)]" /> Tasks & Approvals Inbox
          </h1>
          <p className="text-gray-500 mt-2">Unified inbox for reviewing tasks, approving invoices, and signing contracts.</p>
        </div>
        
        {pendingCount > 0 && (
          <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold border border-orange-100 flex items-center gap-2">
            <Clock size={16} /> {pendingCount} Action Items Required
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto custom-scrollbar pb-2">
        {['all', 'contract', 'invoice', 'document', 'task'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors border ${
              filter === t 
                ? 'bg-[var(--brand-primary,#2563EB)] text-white border-transparent shadow-sm' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}s
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
           <p className="text-gray-400 p-4 col-span-full text-center">Loading workflows...</p>
        ) : filteredWorkflows.length === 0 ? (
           <p className="text-gray-400 p-4 col-span-full text-center bg-white border border-gray-200 rounded-2xl py-12 shadow-sm">No items found in this category.</p>
        ) : filteredWorkflows.map(workflow => {
          const config = getTypeConfig(workflow.type);
          const Icon = config.icon;
          
          return (
            <div key={workflow.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden group">
              {workflow.status === 'pending' ? (
                <div className={`absolute top-0 left-0 w-full h-1 bg-${config.color}-500`} />
              ) : (
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${workflow.status === 'pending' ? `bg-${config.color}-50 text-${config.color}-600` : 'bg-green-50 text-green-600'}`}>
                  {workflow.status === 'pending' ? <Icon size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                  workflow.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                  {workflow.status}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest text-${config.color}-600`}>{config.label}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{workflow.title}</h3>
              
              <div className="space-y-2 mb-8 flex-1 mt-4">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Received</span>
                  <span className="font-bold text-gray-900">{new Date(workflow.createdAt).toLocaleDateString()}</span>
                </div>
                {workflow.status === 'completed' && (
                  <div className="flex justify-between items-center text-xs text-green-600">
                    <span>Completed on</span>
                    <span className="font-bold">{new Date(workflow.completedAt!).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {workflow.status === 'pending' ? (
                <div className="space-y-3">
                  <button 
                    className="w-full py-3 text-sm font-bold text-white rounded-xl shadow-sm transition-all hover:shadow-md flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--brand-primary, #2563EB)' }}
                    onClick={() => handleAction(workflow.id)}
                  >
                    {workflow.type === 'contract' ? <PenTool size={16} /> : <CheckSquare size={16} />} 
                    {workflow.type === 'contract' ? 'E-Sign Contract' : workflow.type === 'invoice' ? 'Approve Invoice' : workflow.type === 'document' ? 'Approve Draft' : 'Mark Task Complete'}
                  </button>
                  <button className="w-full py-2.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors">
                    View Details
                  </button>
                </div>
              ) : (
                <button className="w-full py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors flex items-center justify-center gap-2">
                  View Completed Item <ExternalLink size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
