'use client';

import { useState } from 'react';
import { Reorder } from 'framer-motion';
import { GlobalModal } from '@/components/ui/GlobalModal';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Settings2,
  Layout as LayoutIcon,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/store/authStore';

export const DEFAULT_LAYOUT = [
  { id: 'portfolio',    label: 'Portfolio Overview',    visible: true, order: 0 },
  { id: 'insights',     label: 'AI Insights',           visible: true, order: 1 },
  { id: 'modules',      label: 'Business Modules',      visible: true, order: 2 },
  { id: 'alerts',       label: 'Security Alerts',       visible: true, order: 3 },
  { id: 'activity',     label: 'Recent Activity',       visible: true, order: 4 },
  { id: 'quickActions', label: 'Quick Actions',         visible: true, order: 5 },
];

interface DashboardCustomizerProps {
  onClose: () => void;
}

export function DashboardCustomizer({ onClose }: DashboardCustomizerProps) {
  const { user, updateSettings } = useAuthStore();
  const currentLayout = (user?.settings?.dashboardLayout && Array.isArray(user.settings.dashboardLayout) && user.settings.dashboardLayout.length > 0)
    ? user.settings.dashboardLayout
    : DEFAULT_LAYOUT;
  const [layout, setLayout] = useState(currentLayout);
  const [isSaving, setIsSaving] = useState(false);

  const toggleVisibility = (id: string) => {
    setLayout(prev => prev.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Add current order to the layout objects
    const orderedLayout = layout.map((item, index) => ({
      ...item,
      order: index
    }));
    
    updateSettings({ dashboardLayout: orderedLayout });
    
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 800);
  };

  return (
    <GlobalModal
      isOpen={true}
      onClose={onClose}
      title="Customize Dashboard"
      description="Drag to reorder, tap to hide"
      icon={<Settings2 size={20} />}
      maxWidth="max-w-xl"
    >
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="contents"
      >
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <Reorder.Group 
            axis="y" 
            values={layout} 
            onReorder={setLayout}
            className="space-y-2"
          >
            {layout.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing",
                  item.visible 
                    ? "bg-white/5 border-white/10 text-white" 
                    : "bg-black/20 border-white/5 text-gray-600"
                )}
              >
                <div className="text-gray-600">
                  <GripVertical size={18} />
                </div>
                
                <span className="flex-1 font-medium text-sm">
                  {item.label}
                </span>

                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(item.id);
                  }}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    item.visible 
                      ? "bg-vault-green/10 text-vault-green hover:bg-vault-green/20" 
                      : "bg-white/5 text-gray-500 hover:text-white"
                  )}
                >
                  {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-vault-darker border-t border-white/5 flex items-center justify-between">
          <button 
            type="button"
            onClick={() => setLayout(DEFAULT_LAYOUT)}
            className="text-xs font-semibold text-gray-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <LayoutIcon size={14} />
            Reset to Default
          </button>
          
          <button
            type="submit"
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all",
              isSaving 
                ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                : "bg-vault-green text-black hover:bg-vault-green-hover shadow-lg shadow-vault-green/20"
            )}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? 'Saving...' : 'Apply Layout'}
          </button>
        </div>
      </form>
    </GlobalModal>
  );
}
