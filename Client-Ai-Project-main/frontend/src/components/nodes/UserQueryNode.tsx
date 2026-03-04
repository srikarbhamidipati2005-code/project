import { Handle, Position } from '@xyflow/react';
import { MessageSquare, X } from 'lucide-react';
import useStore from '../../store/useStore';

interface NodeData {
    label: string;
}

const UserQueryNode = ({ id, data: _data }: { id: string; data: NodeData }) => {
    const deleteNode = useStore((state) => state.deleteNode);
    return (
        <div className="w-[300px] rounded-xl bg-white border border-gray-200 shadow-sm relative">
            <div className="bg-indigo-50 border-b border-gray-200 px-4 py-3 flex flex-col gap-1 rounded-t-xl">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                    <MessageSquare size={16} />
                    User Input
                </div>
                <p className="text-xs text-gray-500 tracking-wide font-medium">Enter point of queries</p>
            </div>

            <button
                onClick={() => deleteNode(id)}
                className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-200 shadow-sm z-10"
                title="Delete Node"
            >
                <X size={16} />
            </button>

            <div className="p-4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Query</label>
                <textarea
                    placeholder="Write your query here"
                    className="w-full text-sm min-h-[60px] p-2 rounded-lg border border-gray-200 bg-gray-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white resize-none"
                    readOnly
                />
            </div>

            <Handle
                type="source"
                position={Position.Right}
                id="query"
                title="Query — sends user query to the next node"
            />
        </div>
    );
};

export default UserQueryNode;
