import type { Device } from '../types';

const STORAGE_KEY = 'ir_device_collector_devices';

const DEFAULT_DEVICES: Device[] = [
  {
    id: 'tv-living-room',
    deviceName: 'Living Room TV (Sony)',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    commands: [
      { key: 'Power Toggle', value: '0x20DF10EF' },
      { key: 'Volume Up', value: '0x20DF40BF' },
      { key: 'Volume Down', value: '0x20DFC03F' },
      { key: 'Mute', value: '0x20DF906F' },
      { key: 'Input HDMI 1', value: '0x20DFD02F' },
      { key: 'Input HDMI 2', value: '0x20DF30CF' },
    ],
  },
  {
    id: 'ac-master-bedroom',
    deviceName: 'Master Bedroom AC (Daikin)',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    commands: [
      { key: 'Power On/Off', value: '0x1100000000000000' },
      { key: 'Cool 22°C', value: '0x11000A2200000000' },
      { key: 'Cool 24°C', value: '0x11000A2400000000' },
      { key: 'Fan Auto', value: '0x11000B0000000000' },
    ],
  },
  {
    id: 'apple-tv-media',
    deviceName: 'Living Room Apple TV',
    createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    commands: [
      { key: 'Menu', value: '0x77E1C0A5' },
      { key: 'Play/Pause', value: '0x77E150A5' },
      { key: 'Up Arrow', value: '0x77E1D0A5' },
      { key: 'Down Arrow', value: '0x77E1B0A5' },
      { key: 'Left Arrow', value: '0x77E190A5' },
      { key: 'Right Arrow', value: '0x77E1E0A5' },
      { key: 'Select (OK)', value: '0x77E1A0A5' },
    ],
  }
];

export const getDevices = (): Device[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Prepopulate with default devices
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEVICES));
      return DEFAULT_DEVICES;
    }
    const parsed = JSON.parse(data) as Device[];
    // Sort by createdAt descending
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Failed to parse devices from localStorage:', error);
    return DEFAULT_DEVICES;
  }
};

export const saveDevices = (devices: Device[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  } catch (error) {
    console.error('Failed to save devices to localStorage:', error);
  }
};
