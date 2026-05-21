'use client';

import { useState } from 'react';
import { Sparkles, Palette, Upload, Monitor, LayoutTemplate, Save, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function WorkspaceBrandingSettings() {
  const [primaryColor, setPrimaryColor] = useState('#00FF88');
  const [sidebarColor, setSidebarColor] = useState('#0A0F14');
  const [aiAssistantName, setAiAssistantName] = useState('Vault AI');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <LayoutTemplate className="text-blue-600" /> Workspace Branding
        </h1>
        <p className="text-gray-500 mt-2">Customize the internal dashboard experience for your team members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Logo & Colors */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Monitor size={18} className="text-gray-400" /> UI Customization
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workspace Logo</label>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shadow-inner">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-gray-400 font-bold text-xs text-center leading-tight">No Logo</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <button className="px-4 py-2 bg-gray-100 text-gray-900 border border-gray-200 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
                      Upload Logo
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Appears at the top of the internal sidebar.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Background</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={sidebarColor} 
                      onChange={(e) => setSidebarColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={sidebarColor}
                      onChange={(e) => setSidebarColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Branding */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-gray-400" /> AI Copilot Customization
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Internal AI Assistant Name</label>
              <input
                type="text"
                value={aiAssistantName}
                onChange={(e) => setAiAssistantName(e.target.value)}
                placeholder="e.g. AcmeBot"
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">Give your workspace AI assistant a custom name that your team members will see.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSaving ? 'Saving...' : saved ? <><Check size={18} /> Saved Successfully</> : <><Save size={18} /> Update Workspace</>}
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Live Workspace Preview</h3>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden flex h-64 bg-gray-50" style={{ '--ws-primary': primaryColor, '--ws-sidebar': sidebarColor } as any}>
              {/* Mock Sidebar */}
              <div className="w-20 md:w-32 flex-shrink-0 flex flex-col p-3 border-r border-gray-200 shadow-lg" style={{ backgroundColor: 'var(--ws-sidebar)' }}>
                <div className="h-6 w-full rounded mb-6 flex items-center justify-center font-bold text-[10px]" style={{ color: 'var(--ws-primary)' }}>
                  {logoPreview ? <img src={logoPreview} className="h-4" /> : 'LOGO'}
                </div>
                
                <div className="space-y-2">
                  <div className="h-6 w-full rounded bg-white/10" />
                  <div className="h-6 w-full rounded border border-white/20" style={{ backgroundColor: 'var(--ws-primary)' }} />
                  <div className="h-6 w-full rounded bg-white/10" />
                </div>

                <div className="mt-auto h-8 w-full rounded-lg flex items-center justify-center gap-1 border border-white/10 bg-white/5">
                  <Sparkles size={10} style={{ color: 'var(--ws-primary)' }} />
                  <span className="text-[8px] font-bold text-white truncate max-w-[50px]">{aiAssistantName}</span>
                </div>
              </div>
              
              {/* Mock Content */}
              <div className="flex-1 p-4 flex flex-col">
                <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
                
                <div className="flex-1 bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                  <div className="h-8 w-8 rounded-lg mb-2" style={{ backgroundColor: 'var(--ws-primary)' }} />
                  <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
                  <div className="h-5 w-20 bg-gray-800 rounded mb-4" />
                  
                  <div className="h-6 w-full rounded" style={{ backgroundColor: 'var(--ws-primary)', opacity: 0.1 }} />
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              The AppShell dynamically inherits these CSS variables at runtime for the entire team.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
