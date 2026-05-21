'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FileText, Download, Users, FolderGit2, Zap, ShieldCheck } from 'lucide-react';
import AIWorkspaceDigest from '@/components/workspace/AIWorkspaceDigest';
import Link from 'next/link';

export default function WorkspaceView({ params }: { params: { id: string } }) {
  const [workspace, setWorkspace] = useState<any>(null);

  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.get(`/workspaces/${params.id}`),
      api.get(`/workspaces/${params.id}/analytics`).catch(() => null)
    ])
    .then(([wsRes, analyticsRes]) => {
      setWorkspace(wsRes.data.data.workspace);
      if (analyticsRes) {
        setAnalytics(analyticsRes.data.data.analytics);
      }
    })
    .catch(console.error);
  }, [params.id]);

  if (!workspace) return <div className="animate-pulse h-96 bg-white/5 rounded-2xl w-full" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-8 bg-gradient-to-r from-vault-card to-vault-darker border border-white/5 rounded-2xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-vault-green/5 blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-vault-green mb-2">
            <FolderGit2 size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Workspace</span>
          </div>
          <h2 className="text-3xl font-display font-bold">{workspace.name}</h2>
          <p className="text-gray-400 mt-2">{workspace.description || 'Secure shared workspace'}</p>
        </div>
        
        <div className="relative z-10 flex flex-col items-end">
          <div className="flex -space-x-3 mb-2">
            {workspace.members.slice(0, 5).map((m: any) => (
              <div key={m.user.id} className="w-10 h-10 rounded-full border-2 border-vault-card bg-vault-darker flex items-center justify-center text-xs font-bold text-gray-300">
                {m.user.name?.[0]}
              </div>
            ))}
            {workspace.members.length > 5 && (
              <div className="w-10 h-10 rounded-full border-2 border-vault-card bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                +{workspace.members.length - 5}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
            <Users size={12} /> {workspace.members.length} Collaborators
          </span>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Active Users</p>
              <p className="text-2xl font-bold text-white">{analytics.activeUsers}</p>
            </div>
            <Users className="text-blue-400/50" size={24} />
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Documents</p>
              <p className="text-2xl font-bold text-white">{analytics.totalDocuments}</p>
            </div>
            <FileText className="text-vault-green/50" size={24} />
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">AI Context</p>
              <p className="text-xl font-bold text-white">{analytics.status === 'optimal' ? 'Optimal' : 'Needs Review'}</p>
            </div>
            <Zap className="text-yellow-400/50" size={24} />
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Isolation</p>
              <p className="text-xl font-bold text-white">Active</p>
            </div>
            <ShieldCheck className="text-vault-green/50" size={24} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Document Browser */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-vault-card border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-vault-darker/50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText size={20} className="text-gray-400" /> Files
              </h3>
              <button className="px-4 py-2 bg-vault-green text-black font-bold text-sm rounded-xl">
                Upload File
              </button>
            </div>
            
            <div className="divide-y divide-white/5">
              {workspace.documents.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 font-bold">No files uploaded yet.</p>
                </div>
              ) : (
                workspace.documents.map((doc: any) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">{doc.originalName}</p>
                        <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a href={doc.contentUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Download size={18} />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <AIWorkspaceDigest workspaceId={workspace.id} />
          
          <div className="bg-vault-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-sm mb-4 text-gray-400 uppercase tracking-wider">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/chat" className="flex items-center gap-3 w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm font-semibold">
                Open Team Chat
              </Link>
              <button className="flex items-center gap-3 w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm font-semibold">
                Manage Permissions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
