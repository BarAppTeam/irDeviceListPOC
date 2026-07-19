import { useState, useEffect, useRef } from 'react';
import type { Device, Command } from './types';
import { getDevices, saveDevices } from './utils/storage';
import { SearchBar } from './components/SearchBar';
import { DeviceCard } from './components/DeviceCard';
import { DeviceModal } from './components/DeviceModal';
import {
  Plus,
  Download,
  Upload,
  Cpu,
  Layers,
  Terminal,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load devices on initial mount
  useEffect(() => {
    setDevices(getDevices());
  }, []);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Add or Edit save callback
  const handleSaveDevice = (savedDevice: Omit<Device, 'createdAt'> & { createdAt?: number }) => {
    const now = Date.now();
    let updatedDevices: Device[];

    if (editingDevice) {
      // Editing
      updatedDevices = devices.map((d) =>
        d.id === savedDevice.id
          ? {
            ...savedDevice,
            createdAt: savedDevice.createdAt || d.createdAt
          } as Device
          : d
      );
      addToast(`Updated device "${savedDevice.deviceName}"`);
    } else {
      // Creating new
      const newDevice: Device = {
        ...savedDevice,
        createdAt: now,
      };
      updatedDevices = [newDevice, ...devices];
      addToast(`Added device "${savedDevice.deviceName}"`);
    }

    setDevices(updatedDevices);
    saveDevices(updatedDevices);
    setEditingDevice(null);
  };

  // Delete callback
  const handleDeleteDevice = (id: string) => {
    const deviceToDelete = devices.find(d => d.id === id);
    if (!deviceToDelete) return;

    if (window.confirm(`Are you sure you want to delete "${deviceToDelete.deviceName}"? This cannot be undone.`)) {
      const updatedDevices = devices.filter((d) => d.id !== id);
      setDevices(updatedDevices);
      saveDevices(updatedDevices);
      addToast(`Deleted device "${deviceToDelete.deviceName}"`, 'info');
    }
  };

  // Trigger Edit Mode
  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  // Open Modal for New Device
  const handleAddNewDevice = () => {
    setEditingDevice(null);
    setIsModalOpen(true);
  };

  // Copy success handler
  const handleCopySuccess = (key: string, value: string) => {
    addToast(`Copied "${key}" IR code: ${value}`, 'success');
  };

  // Clear Database (for reset convenience)
  const handleResetDatabase = () => {
    if (window.confirm('Are you sure you want to reset all devices to initial default state?')) {
      localStorage.removeItem('ir_device_collector_devices');
      const defaults = getDevices();
      setDevices(defaults);
      addToast('Database reset to defaults', 'info');
    }
  };

  // Export JSON Database
  const handleExportDatabase = () => {
    try {
      const cleanData = devices.map(({ id, deviceName, commands }) => ({
        id,
        deviceName,
        commands: commands.map(({ key, value }) => ({ key, value }))
      }));

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(cleanData, null, 2)
      )}`;

      const downloadAnchorElement = document.createElement('a');
      downloadAnchorElement.setAttribute('href', jsonString);
      downloadAnchorElement.setAttribute(
        'download',
        `ir_devices_backup_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchorElement);
      downloadAnchorElement.click();
      downloadAnchorElement.remove();
      addToast('Backup downloaded successfully');
    } catch (error) {
      addToast('Failed to export backup', 'error');
    }
  };

  // Import JSON Database
  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawContent = event.target?.result as string;
        const parsed = JSON.parse(rawContent);

        if (!Array.isArray(parsed)) {
          throw new Error('Backup data must be an array of devices');
        }

        // Schema validation
        const validatedDevices: Device[] = parsed.map((item: any, index) => {
          if (!item.deviceName || typeof item.deviceName !== 'string') {
            throw new Error(`Device at index ${index} is missing a valid deviceName`);
          }
          if (!Array.isArray(item.commands)) {
            throw new Error(`Device "${item.deviceName}" must contain a list of commands`);
          }

          const validatedCommands: Command[] = item.commands.map((cmd: any, cmdIdx: number) => {
            if (!cmd.key || typeof cmd.key !== 'string') {
              throw new Error(`Device "${item.deviceName}" has an invalid key at command index ${cmdIdx}`);
            }
            if (!cmd.value || typeof cmd.value !== 'string') {
              throw new Error(`Device "${item.deviceName}" has an invalid value at command index ${cmdIdx}`);
            }
            return {
              key: cmd.key,
              value: cmd.value
            };
          });

          return {
            id: item.id || Math.random().toString(36).substring(2, 11),
            deviceName: item.deviceName,
            commands: validatedCommands,
            createdAt: item.createdAt || (Date.now() - index * 1000) // preserve ordering if loaded sequentially
          };
        });

        setDevices(validatedDevices);
        saveDevices(validatedDevices);
        addToast(`Successfully imported ${validatedDevices.length} devices!`, 'success');
      } catch (err: any) {
        addToast(err.message || 'Failed to read or parse file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input selection
  };

  // Filter Logic (Deep Search)
  const query = searchQuery.trim().toLowerCase();
  const filteredDevices = devices.filter((device) => {
    if (!query) return true;

    // Match device name
    const matchName = device.deviceName.toLowerCase().includes(query);
    if (matchName) return true;

    // Match any command key or value
    return device.commands.some(
      (cmd) =>
        cmd.key.toLowerCase().includes(query) ||
        cmd.value.toLowerCase().includes(query)
    );
  });

  // Calculate statistics
  const totalCommandsCount = devices.reduce((sum, d) => sum + d.commands.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1224] via-[#090b14] to-[#120f21] pb-16 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 pb-6 border-b border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white m-0 flex items-center gap-2">
                IR Collector <span className="text-xs bg-violet-500/15 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full font-semibold">PoC</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Infrared (IR) Device Code Database & Collector</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportDatabase}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-sm font-semibold transition-all duration-200"
              title="Import backup JSON file"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button
              onClick={handleExportDatabase}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-sm font-semibold transition-all duration-200"
              title="Export backup JSON file"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleAddNewDevice}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:from-violet-700 active:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Device</span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{devices.length}</div>
              <div className="text-xs text-slate-400 font-medium">Total Saved Devices</div>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{totalCommandsCount}</div>
              <div className="text-xs text-slate-400 font-medium">Captured IR Codes</div>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">Local</div>
                <div className="text-xs text-slate-400 font-medium">Database Target</div>
              </div>
            </div>
            <button
              onClick={handleResetDatabase}
              className="text-xs text-slate-500 hover:text-rose-400 underline font-semibold transition-colors duration-200"
            >
              Reset Database
            </button>
          </div>
        </section>

        {/* Search Section */}
        <section className="w-full">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </section>

        {/* Device Cards Grid */}
        <main className="mt-4">
          {filteredDevices.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl max-w-2xl mx-auto backdrop-blur-md">
              <Info className="w-10 h-10 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300">No devices found</h3>
              <p className="text-sm text-slate-500 mt-1.5 px-6">
                {searchQuery
                  ? `We couldn't find any devices matching "${searchQuery}". Try refining your search name, command keys, or IR codes.`
                  : 'Start by clicking "Add Device" to create your first Infrared controller profile!'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-5 px-4.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-slate-200 rounded-xl text-xs font-semibold border border-slate-700/60 transition-all"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {filteredDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onEdit={handleEditDevice}
                  onDelete={handleDeleteDevice}
                  onCopy={handleCopySuccess}
                />
              ))}
            </div>
          )}
        </main>

        {/* App Footer */}
        <footer className="mt-20 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} IR Collector PoC. Data persisted in client localStorage.</p>
        </footer>

      </div>

      {/* Add / Edit Modal Overlay */}
      <DeviceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDevice(null);
        }}
        onSave={handleSaveDevice}
        device={editingDevice}
      />

      {/* Floating Premium Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 bg-slate-900/95 border text-slate-200 rounded-2xl shadow-xl pointer-events-auto backdrop-blur-md transition-all duration-300 border-slate-800 animate-slideInUp`}
            role="alert"
          >
            {toast.type === 'error' ? (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-sky-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <p className="text-xs font-semibold flex-1 leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
