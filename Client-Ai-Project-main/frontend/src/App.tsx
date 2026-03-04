import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  addEdge,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { Play, MessageCircle } from 'lucide-react';

import UserQueryNode from './components/nodes/UserQueryNode';
import KnowledgeBaseNode from './components/nodes/KnowledgeBaseNode';
import LLMEngineNode from './components/nodes/LLMEngineNode';
import OutputNode from './components/nodes/OutputNode';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChatModal from './components/ChatModal';
import useStore from './store/useStore';

const nodeTypes = {
  userQuery: UserQueryNode,
  knowledgeBase: KnowledgeBaseNode,
  llmEngine: LLMEngineNode,
  customOutput: OutputNode,
};

const FlowCanvas = ({ workflowId }: { workflowId: number | null }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const setNodes = useStore((state) => state.setNodes);
  const setEdges = useStore((state) => state.setEdges);

  // Use customized standard onConnect to inject bezier curves optionally
  const onConnect = useCallback(
    (params: Connection) => setEdges(addEdge({ ...params, animated: true, type: 'default' }, edges)),
    [setEdges, edges]
  );

  const [isChatOpen, setIsChatOpen] = useState(false);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: uuidv4(),
        type,
        position,
        data: { label },
      };

      setNodes([...nodes, newNode]);
    },
    [screenToFlowPosition, nodes, setNodes]
  );

  return (
    <div className="flex-1 h-full w-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        defaultEdgeOptions={{ type: 'default', animated: true }}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' }}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background gap={24} size={2} color="#cbd5e1" variant={BackgroundVariant.Dots} />
        <Controls
          position="bottom-left"
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200/50 mb-8 ml-8 p-1 flex items-center gap-1 overflow-hidden"
          showInteractive={false}
        />
      </ReactFlow>

      {/* Floating Action Controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-4 z-10">
        <button
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors"
          onClick={() => setIsChatOpen(true)}
        >
          <Play size={24} fill="currentColor" />
        </button>
        <button
          onClick={() => setIsChatOpen(true)}
          className="h-14 px-6 bg-gray-900 rounded-full flex items-center gap-2 text-white font-medium shadow-lg hover:bg-gray-800 transition-colors tracking-wide"
        >
          <MessageCircle size={20} />
          Chat with Stack
        </button>
      </div>

      {isChatOpen && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          graphPayload={{ nodes, edges }}
          workflowId={workflowId}
        />
      )}
    </div>
  );
};

export default function App() {
  const { setNodes, setEdges } = useStore();
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const [workflowId, setWorkflowId] = useState<number | null>(null);
  const [workflowName, setWorkflowName] = useState<string>('');

  const handleLoadWorkflow = (workflow: any) => {
    setNodes(workflow.graph_json.nodes || []);
    setEdges(workflow.graph_json.edges || []);
    setWorkflowId(workflow.id);
    setWorkflowName(workflow.name);
    alert(`Loaded workflow: ${workflow.name}`);
  };

  const handleSave = async () => {
    if (nodes.length === 0) {
      alert("Please add some nodes to the workflow before saving.");
      return;
    }

    let name = workflowName;
    if (!name) {
      const inputName = prompt("Enter a name for your workflow:", `Workflow ${new Date().toLocaleString()}`);
      if (inputName === null) return; // User cancelled
      name = inputName || `Workflow ${new Date().toLocaleString()}`;
      setWorkflowName(name);
    }

    try {
      const url = workflowId
        ? `http://localhost:8000/api/workflows/${workflowId}`
        : 'http://localhost:8000/api/workflows';

      const method = workflowId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          graph_json: { nodes, edges },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (!workflowId) {
        setWorkflowId(data.workflow_id);
      }
      alert(`Workflow ${workflowId ? 'updated' : 'saved'} successfully!`);
    } catch (error: any) {
      console.error("Error saving workflow:", error);
      alert(`Failed to save workflow: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-50 overflow-hidden fade-in-animation">
      <Navbar onSave={handleSave} />
      <div className="flex flex-1 overflow-hidden h-full">
        <ReactFlowProvider>
          <Sidebar onLoadWorkflow={handleLoadWorkflow} />
          <FlowCanvas workflowId={workflowId} />
        </ReactFlowProvider>
      </div>

      {/* Floating Action Controls */}
      {/* We need to move these inside FlowCanvas or handle them here if we want to pass nodes/edges */}
    </div>
  );
}
