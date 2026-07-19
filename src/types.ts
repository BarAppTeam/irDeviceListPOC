export interface Command {
  key: string;
  value: string;
}

export interface Device {
  id: string;
  deviceName: string;
  commands: Command[];
  createdAt: number; // useful for sorting
}
