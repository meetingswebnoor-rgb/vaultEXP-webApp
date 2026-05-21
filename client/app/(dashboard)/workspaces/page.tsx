'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FolderGit2, Users, FileText, ChevronRight } from 'lucide-react';

export default function WorkspacesDirectory() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/workspaces')
       .then(res => setWorkspaces(res.data.data.workspaces))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse h-96 bg-white/5 rounded-2xl w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold">Shared Workspaces</h2>
          <p className="text-gray-400 mt-1">Collaborate on documents with your team in secure environments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.length === 0 ? (
          <div className="col-span-full p-12 bg-white/5 border border-white/10 rounded-2xl text-center">
            <FolderGit2 size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-bold text-white">No Workspaces Found</h3>
            <p className="text-gray-400 mt-2">You haven&apos;t been added to any workspaces yet.</p>
          </div>
        ) : (
          workspaces.map(ws => (
            <Link 
              href={`/workspaces/${ws.id}`} 
              key={ws.id}
              className="group block p-6 bg-gradient-to-br from-vault-card to-vault-darker border border-white/5 hover:border-vault-green/30 rounded-2xl shadow-xl transition-all hover:scale-[1.02]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-vault-green/10 flex items-center justify-center text-vault-green">
                  <FolderGit2 size={24} />
                </div>
                <span className="flex items-center text-xs font-bold px-2.5 py-1 bg-white/5 rounded-full text-gray-400">
                  <Users size={12} className="mr-1.5" /> {ws.members?.length || 0}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{ws.name}</h3>
              <p className="text-sm text-gray-400 mb-6 line-clamp-2">{ws.description || 'No description provided.'}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <FileText size={16} />
                  <span>{ws._count?.documents || 0} Files</span>
                </div>
                <div className="flex items-center text-vault-green text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Workspace <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
