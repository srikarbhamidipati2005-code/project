import React, { useEffect, useState } from 'react';
import { MessageSquare, Database, Cpu, TerminalSquare, FolderOpen, Loader2, Trash2 } from 'lucide-react';

interface SidebarProps {
    onLoadWorkflow?: (workflow: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLoadWorkflow }) => {
    const [savedWorkflows, setSavedWorkflows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchWorkflows = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/workflows');
            if (response.ok) {
                const data = await response.json();
                setSavedWorkflows(data);
            }
        } catch (error) {
            console.error("Error fetching workflows:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteWorkflow = async (e: React.MouseEvent, workflowId: number) => {
        e.stopPropagation(); // Prevent loading the workflow when deleting
        if (!confirm("Are you sure you want to delete this workflow?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/workflows/${workflowId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setSavedWorkflows(prev => prev.filter(wf => wf.id !== workflowId));
            } else {
                alert("Failed to delete workflow");
            }
        } catch (error) {
            console.error("Error deleting workflow:", error);
            alert("Error deleting workflow");
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow-label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    const menuItems = [
        { type: 'userQuery', label: 'User Query', icon: <MessageSquare size={18} /> },
        { type: 'llmEngine', label: 'LLM Engine', icon: <Cpu size={18} /> },
        { type: 'knowledgeBase', label: 'Knowledge Base', icon: <Database size={18} /> },
        { type: 'customOutput', label: 'Output', icon: <TerminalSquare size={18} /> },
    ];

    return (
        <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
                <h2 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Nodes</h2>
            </div>
            <div className="p-4 flex flex-col gap-3 border-b border-gray-200 bg-white/50">
                {menuItems.map((item) => (
                    <div
                        key={item.type}
                        className="flex items-center p-3 gap-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition-all group"
                        onDragStart={(event) => onDragStart(event, item.type, item.label)}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            {item.icon}
                        </div>
                        <span className="font-medium text-gray-700 text-sm tracking-tight">{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Saved Workflows</h2>
                    <button
                        onClick={fetchWorkflows}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold"
                    >
                        Refresh
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        </div>
                    ) : savedWorkflows.length > 0 ? (
                        savedWorkflows.map((wf) => (
                            <div
                                key={wf.id}
                                onClick={() => onLoadWorkflow?.(wf)}
                                className="flex items-center p-3 gap-3 bg-white hover:bg-indigo-50 border border-gray-100 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all group relative"
                            >
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                    <FolderOpen size={16} />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="font-medium text-gray-700 text-sm truncate pr-6">{wf.name}</span>
                                    <span className="text-[10px] text-gray-400">ID: {wf.id}</span>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteWorkflow(e, wf.id)}
                                    className="absolute right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete workflow"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 text-xs py-8 italic">No saved workflows</p>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
