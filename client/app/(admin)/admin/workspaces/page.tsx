
import { FolderKanban, Activity } from 'lucide-react';

export default function WorkspacesAdmin() {
  return (
    <div className='p-8 pb-32 max-w-7xl mx-auto w-full'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white tracking-tight'>Workspace Management</h1>
        <p className='text-gray-400 mt-2'>Monitor global enterprise workspaces.</p>
      </div>
      <div className='bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <FolderKanban className='text-vault-green' />
          <h2 className='text-xl text-white font-bold'>Active Workspaces</h2>
        </div>
        <p className='text-gray-400'>Workspace management API connection pending.</p>
      </div>
    </div>
  );
}

