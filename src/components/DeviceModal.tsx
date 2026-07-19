import React, { useState, useEffect } from 'react';
import type { Device, Command } from '../types';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Omit<Device, 'createdAt'> & { createdAt?: number }) => void;
  device?: Device | null; // If provided, we are in Edit Mode
}

interface LocalCommand {
  id: string; // unique identifier for form rendering keys
  key: string;
  value: string;
}

export const DeviceModal: React.FC<DeviceModalProps> = ({ isOpen, onClose, onSave, device }) => {
  const [deviceName, setDeviceName] = useState('');
  const [commands, setCommands] = useState<LocalCommand[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load device data if in Edit Mode
  useEffect(() => {
    if (device) {
      setDeviceName(device.deviceName);
      setCommands(
        device.commands.map((cmd) => ({
          id: Math.random().toString(36).substring(2, 9),
          key: cmd.key,
          value: cmd.value,
        }))
      );
    } else {
      setDeviceName('');
      setCommands([
        { id: Math.random().toString(36).substring(2, 9), key: '', value: '' },
      ]);
    }
    setError(null);
  }, [device, isOpen]);

  if (!isOpen) return null;

  const handleAddCommand = () => {
    setCommands([
      ...commands,
      { id: Math.random().toString(36).substring(2, 9), key: '', value: '' },
    ]);
  };

  const handleRemoveCommand = (id: string) => {
    setCommands(commands.filter((cmd) => cmd.id !== id));
  };

  const handleCommandChange = (id: string, field: 'key' | 'value', val: string) => {
    setCommands(
      commands.map((cmd) => {
        if (cmd.id === id) {
          return { ...cmd, [field]: val };
        }
        return cmd;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deviceName.trim()) {
      setError('Device name is required');
      return;
    }

    // Filter out completely empty rows and trim values
    const validCommands: Command[] = [];
    let hasIncompleteRow = false;

    for (const cmd of commands) {
      const hasKey = !!cmd.key.trim();
      const hasVal = !!cmd.value.trim();

      if (hasKey && hasVal) {
        validCommands.push({
          key: cmd.key.trim(),
          value: cmd.value.trim(),
        });
      } else if (hasKey || hasVal) {
        hasIncompleteRow = true;
      }
    }

    if (hasIncompleteRow) {
      setError('Please fill out both fields or delete incomplete command rows');
      return;
    }

    onSave({
      id: device?.id || Math.random().toString(36).substring(2, 11),
      deviceName: deviceName.trim(),
      commands: validCommands,
      ...(device?.createdAt ? { createdAt: device.createdAt } : {}),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-2xl bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all duration-300 transform scale-100 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-100">
            {device ? 'Edit IR Device' : 'Add New IR Device'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Device Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">
              Device Name <span className="text-violet-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Bedroom Soundbar, Projector Screen"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              required
            />
          </div>

          {/* Commands Dynamic Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-slate-300">
                IR Commands / Codes
              </label>
              <button
                type="button"
                onClick={handleAddCommand}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-violet-100 rounded-lg text-xs font-semibold shadow-md shadow-violet-900/15 hover:shadow-violet-900/30 transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Command
              </button>
            </div>

            {commands.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                <p className="text-sm text-slate-500 mb-2">No commands added yet.</p>
                <button
                  type="button"
                  onClick={handleAddCommand}
                  className="text-xs text-violet-400 hover:text-violet-300 underline font-medium"
                >
                  Create the first command
                </button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-3">
                {commands.map((cmd) => (
                  <div key={cmd.id} className="flex flex-col sm:flex-row gap-3 p-4 sm:p-0 bg-slate-950/40 sm:bg-transparent border border-slate-800/60 sm:border-transparent rounded-xl sm:rounded-none relative">
                    {/* Command Name */}
                    <div className="flex-1">
                      <span className="block sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Command Name</span>
                      <input
                        type="text"
                        placeholder="Button Name (e.g. Vol up, Mute)"
                        value={cmd.key}
                        onChange={(e) => handleCommandChange(cmd.id, 'key', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:border-violet-500/80 focus:ring-1 focus:ring-violet-500/50 text-sm transition-all"
                      />
                    </div>

                    {/* Command Value */}
                    <div className="flex-[1.5] flex gap-2 items-center">
                      <div className="flex-1">
                        <span className="block sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">IR Code</span>
                        <input
                          type="text"
                          placeholder="IR Code (e.g. 0xFF45AA, 1234)"
                          value={cmd.value}
                          onChange={(e) => handleCommandChange(cmd.id, 'value', e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:border-violet-500/80 focus:ring-1 focus:ring-violet-500/50 text-sm font-mono transition-all"
                        />
                      </div>
                      
                      {/* Delete Row Button */}
                      <div className="self-end sm:self-center">
                        <span className="block sm:hidden text-[10px] text-transparent mb-1" aria-hidden="true">&nbsp;</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCommand(cmd.id)}
                          className="p-2.5 rounded-xl text-rose-500 sm:text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 active:bg-slate-800 transition-all border border-slate-800 sm:border-transparent hover:border-slate-800"
                          title="Remove Row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800 hover:border-slate-700 active:bg-slate-900 rounded-xl text-sm font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:from-violet-700 active:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 transition-all"
          >
            {device ? 'Save Changes' : 'Create Device'}
          </button>
        </div>
      </div>
    </div>
  );
};
