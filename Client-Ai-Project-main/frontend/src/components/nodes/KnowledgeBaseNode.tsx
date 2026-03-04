import React, { useRef, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, FileText, Loader2, Upload, AlertCircle, X } from 'lucide-react';
import useStore from '../../store/useStore';

interface NodeData {
    label: string;
    uploadedFilename?: string;
    fileId?: string;
}

const KnowledgeBaseNode = ({ id, data }: { id: string; data: NodeData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const updateNodeData = useStore((state) => state.updateNodeData);
    const deleteNode = useStore((state) => state.deleteNode);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setError('Only PDF files are supported');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Using localhost:8000 as identified from ChatModal.tsx
            const response = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Upload failed');
            }

            const result = await response.json();

            // Update node data with the real filename and metadata
            updateNodeData(id, {
                uploadedFilename: file.name,
                fileId: result.document_id,
                embeddingModel: 'gemini-embedding-001'
            });

            setUploading(false);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Error uploading file');
            setUploading(false);
        }
    };

    return (
        <div className="w-[320px] rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col relative">
            <Handle
                type="target"
                position={Position.Left}
                id="query-in"
                title="Query In — receives query from User Input"
            />

            <div className="bg-emerald-50 border-b border-gray-200 px-4 py-3 flex flex-col gap-1 rounded-t-xl">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <Database size={16} />
                    Knowledge Base
                </div>
                <p className="text-xs text-gray-500 tracking-wide font-medium">Let LLM search in your file</p>
            </div>

            <button
                onClick={() => deleteNode(id)}
                className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-200 shadow-sm z-10"
                title="Delete Node"
            >
                <X size={16} />
            </button>

            <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        For Knowledge Base
                    </label>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                    />

                    <div
                        onClick={handleFileClick}
                        className={`
                            group flex items-center justify-between gap-2 p-3 
                            bg-white border-2 border-dashed rounded-xl cursor-pointer
                            transition-all duration-200
                            ${uploading ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50'}
                            ${error ? 'border-red-200 bg-red-50/30' : ''}
                        `}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {uploading ? (
                                <Loader2 size={18} className="text-emerald-500 animate-spin" />
                            ) : error ? (
                                <AlertCircle size={18} className="text-red-500" />
                            ) : (
                                <FileText size={18} className={data.uploadedFilename ? "text-emerald-600" : "text-gray-400"} />
                            )}
                            <span className={`text-sm font-medium truncate ${data.uploadedFilename ? "text-emerald-900" : "text-gray-500"}`}>
                                {data.uploadedFilename || (uploading ? "Uploading..." : "Click to upload PDF")}
                            </span>
                        </div>
                        {!uploading && !data.uploadedFilename && (
                            <Upload size={14} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        )}
                    </div>
                    {error && (
                        <p className="text-[10px] text-red-500 font-medium px-1 leading-tight">{error}</p>
                    )}
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Right}
                id="context-out"
                title="Context Out — sends context to LLM Engine"
            />
        </div>
    );
};

export default KnowledgeBaseNode;
