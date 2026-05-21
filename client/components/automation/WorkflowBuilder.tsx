'use client';
import { useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TriggerNode } from './TriggerNode';
import { ActionNode } from './ActionNode';
import { Settings, Plus, Save, BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

const initialNodes = [
  { id: '1', type: 'trigger', position: { x: 300, y: 100 }, data: { label: 'Invoice Overdue', condition: 'status === "overdue" && days > 7' } },
  { id: '2', type: 'action', position: { x: 300, y: 250 }, data: { label: 'Notify Tenant', details: 'Send SMS & Default Email Warning' } },
  { id: '3', type: 'action', position: { x: 300, y: 400 }, data: { label: 'Generate AI Report', details: 'VaultAI prepares delinquency risk analysis' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00ff99', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#60a5fa', strokeWidth: 2 } }
];

export function WorkflowBuilder() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#00ff99', strokeWidth: 2 } }, eds)), []);

  const addActionNode = () => {
    const newNode = {
      id: Date.now().toString(),
      type: 'action',
      position: { x: 300, y: 550 },
      data: { label: 'New Action', details: 'Configure backend execution logic' }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API POST /api/automation/workflows
    setTimeout(() => {
      setIsSaving(false);
      showToast('Workflow compiled and deployed successfully.');
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col relative bg-vault-darker rounded-[32px] overflow-hidden border border-white/[0.05] shadow-2xl">
      <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-3">
        <button className="bg-black/60 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-2 hover:bg-white/5 transition-all">
          <Settings className="w-4 h-4 text-vault-green" /> Trigger Settings
        </button>
        <button onClick={addActionNode} className="bg-black/60 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-2 hover:bg-white/5 transition-all">
          <Plus className="w-4 h-4 text-blue-400" /> Add Action Step
        </button>
        <button className="bg-black/60 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-2 hover:bg-white/5 transition-all">
          <BrainCircuit className="w-4 h-4 text-indigo-400" /> Add AI Step
        </button>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-vault-green text-black px-6 py-3 rounded-xl text-xs font-black shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Deploying...' : 'Save & Deploy'}
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-vault-darker"
        minZoom={0.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#ffffff10" />
        <Controls className="bg-black/60 backdrop-blur-md border border-white/10 fill-white !rounded-xl overflow-hidden" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
