'use client';

import { useState } from 'react';
import { Palette, Link as LinkIcon, Mail, Upload, Save, Check } from 'lucide-react';

export default function WhiteLabelBrandingSettings() {
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
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
          <Palette className="text-vault-green" /> White-Label Branding
        </h1>
        <p className="text-gray-500 mt-2">Customize your Client Portal, Invoices, and System Emails to match your exact brand identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Logo & Colors */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Upload size={18} className="text-gray-400" /> Visual Identity
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-gray-400 font-bold text-sm">No Logo</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-3">Upload your company logo. Recommended format: PNG with transparent background, at least 400x100px.</p>
                    <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
                      Upload Image
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Brand Color</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono w-32 focus:outline-none focus:ring-2 focus:ring-vault-green"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">This color will be dynamically injected into the Client Portal interface, buttons, and PDF invoices.</p>
              </div>
            </div>
          </div>

          {/* Domain Mapping */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LinkIcon size={18} className="text-gray-400" /> Custom Domain
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portal URL</label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm font-mono">
                  https://
                </span>
                <input
                  type="text"
                  placeholder="portal.yourcompany.com"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border border-gray-300 focus:outline-none focus:ring-vault-green focus:border-vault-green sm:text-sm font-mono"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Map your own domain to the client portal. Requires CNAME DNS configuration.</p>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Mail size={18} className="text-gray-400" /> Email Communications
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply-To Address</label>
                <input
                  type="email"
                  placeholder="support@yourcompany.com"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-vault-green focus:border-vault-green sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Signature HTML</label>
                <textarea
                  rows={4}
                  placeholder="<p>Thank you,<br/>The Team</p>"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-vault-green focus:border-vault-green sm:text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-vault-green text-[#0A0F14] font-bold rounded-xl hover:bg-vault-green/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSaving ? 'Saving Config...' : saved ? <><Check size={18} /> Saved Successfully</> : <><Save size={18} /> Save Brand Settings</>}
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Live Portal Preview</h3>
            
            {/* Mock Client Portal Interface */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50" style={{ '--brand-color': primaryColor } as any}>
              <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4">
                {logoPreview ? (
                   <img src={logoPreview} className="h-6" alt="Logo" />
                ) : (
                  <div className="h-6 w-24 rounded" style={{ backgroundColor: 'var(--brand-color)' }} />
                )}
              </div>
              <div className="p-4 space-y-4">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                
                {/* Mock Card */}
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="h-8 w-8 rounded-lg mb-3 flex items-center justify-center text-white" style={{ backgroundColor: 'var(--brand-color)' }}>
                    <Check size={16} />
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-6 w-24 bg-gray-900 rounded" />
                  <button className="mt-4 w-full py-2 text-white text-xs font-bold rounded" style={{ backgroundColor: 'var(--brand-color)' }}>
                    Action Button
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              The Client Portal dynamically applies your CSS brand variables at runtime without duplicating the UI shell.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
