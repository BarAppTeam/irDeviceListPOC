import React, { useState } from 'react';
import type { Device, Command } from '../types';
import { Edit2, Trash2, Copy, Check, Tv } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
  onCopy: (key: string, value: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onEdit, onDelete, onCopy }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (cmd: Command, index: number) => {
    navigator.clipboard.writeText(cmd.value);
    const idKey = `${device.id}-${index}`;
    setCopiedId(idKey);
    onCopy(cmd.key, cmd.value);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="group relative flex flex-col bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/40 hover:shadow-glow-primary hover:-translate-y-0.5 overflow-hidden">
      {/* Dynamic light accent top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent group-hover:via-violet-500/60 transition-all duration-500" />

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-colors duration-300">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-lg leading-tight group-hover:text-violet-300 transition-colors duration-200">
              {device.deviceName}
            </h3>
            <span className="text-xs text-slate-500">
              {device.commands.length} {device.commands.length === 1 ? 'command' : 'commands'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(device)}
            className="p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-slate-800 active:bg-slate-800 transition-all duration-200"
            title="Edit device"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(device.id)}
            className="p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:bg-slate-800 transition-all duration-200"
            title="Delete device"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Command List */}
      <div className="flex-1 mt-2">
        {device.commands.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800/80 rounded-xl">
            <p className="text-sm text-slate-500">No IR commands configured.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {device.commands.map((cmd, idx) => {
              const isCopied = copiedId === `${device.id}-${idx}`;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/40 hover:border-slate-800 transition-all duration-200 group/cmd"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-xs font-semibold text-slate-400 truncate">
                      {cmd.key}
                    </div>
                    <div className="text-xs font-mono text-emerald-400 truncate mt-0.5" title={cmd.value}>
                      {cmd.value}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCopy(cmd, idx)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isCopied
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                    }`}
                    title="Copy IR Code"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 opacity-0 group-hover/cmd:opacity-100 transition-opacity duration-200" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
