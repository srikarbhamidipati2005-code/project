import { Handle, Position } from '@xyflow/react';
import { Cpu, X } from 'lucide-react';
import useStore from '../../store/useStore';

interface NodeData {
    label: string;
}

const LLMEngineNode = ({ id, data: _data }: { id: string; data: NodeData }) => {
    const deleteNode = useStore((state) => state.deleteNode);
    return (
        <div className="w-[360px] rounded-xl bg-white border border-gray-200 shadow-sm relative">
            {/* Input handles with dot indicators */}
            <Handle
                type="target"
                position={Position.Left}
                id="context"
                style={{ top: '25%' }}
                title="Context — receives context data from Knowledge Base"
            />

            <Handle
                type="target"
                position={Position.Left}
                id="query"
                style={{ top: '55%' }}
                title="Query — receives the user query input"
            />

            {/* Header */}
            <div className="bg-blue-50 border-b border-gray-200 px-4 py-3 flex flex-col gap-1 rounded-t-xl">
                <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                    <Cpu size={16} />
                    LLM Engine
                </div>
                <p className="text-xs text-gray-500 tracking-wide font-medium">Run a query with Gemini LLM</p>
            </div>

            <button
                onClick={() => deleteNode(id)}
                className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-200 shadow-sm z-10"
                title="Delete Node"
            >
                <X size={16} />
            </button>

            {/* Inputs */}
            <div className="p-4 flex flex-col gap-4">
                {/* Model Selector */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Model</label>
                    <select className="w-full text-sm p-1.5 rounded-lg border border-gray-200 bg-gray-50 outline-none" defaultValue="gemini">
                        <option value="gemini">Gemini</option>
                        <option value="gpt-4o" disabled>GPT-4o (Coming Soon)</option>
                        <option value="claude-3.5" disabled>Claude 3.5 (Coming Soon)</option>
                    </select>
                </div>

                {/* Prompt section */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">System Prompt</label>
                    <div className="relative">
                        <textarea
                            defaultValue={`You are a helpful PDF assistant.\nCONTEXT: {context}\nUser Query: {query}`}
                            className="w-full text-xs font-mono p-2 rounded-lg border border-gray-200 bg-gray-50 min-h-[90px] outline-none resize-none leading-relaxed text-blue-900"
                        />
                    </div>
                </div>
            </div>

            {/* Output handle with dot indicator */}
            <Handle
                type="source"
                position={Position.Right}
                id="output"
                title="Output — sends LLM response to the next node"
            />
        </div>
    );
};

export default LLMEngineNode;
