import { Handle, Position } from '@xyflow/react';
import { TerminalSquare, X } from 'lucide-react';
import useStore from '../../store/useStore';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NodeData {
    label: string;
    output?: string;
}

const OutputNode = ({ id, data }: { id: string; data: NodeData }) => {
    const deleteNode = useStore((state) => state.deleteNode);
    return (
        <div className="w-[350px] rounded-xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
            <Handle
                type="target"
                position={Position.Left}
                id="output"
                style={{ width: 10, height: 10, backgroundColor: '#4b5563', border: '2px solid white' }}
                title="Input — receives data from LLM Engine"
            />

            <div className="bg-orange-50 border-b border-gray-200 px-4 py-3 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-orange-700 font-semibold text-sm">
                    <TerminalSquare size={16} />
                    Output
                </div>
                <p className="text-xs text-gray-500 tracking-wide font-medium">Result from the workflow execution</p>
            </div>

            <button
                onClick={() => deleteNode(id)}
                className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-200 shadow-sm z-10"
                title="Delete Node"
            >
                <X size={16} />
            </button>

            <div className="p-4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Output Response</label>
                <div className="w-full text-sm p-4 rounded-lg border border-gray-100 bg-gray-50 text-gray-700 font-normal min-h-[100px] max-h-[400px] overflow-auto prose prose-sm prose-p:leading-relaxed">
                    {data.output ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {data.output}
                        </ReactMarkdown>
                    ) : (
                        <div className="text-gray-400 italic text-center py-4">
                            Output will be generated once workflow is played
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutputNode;
