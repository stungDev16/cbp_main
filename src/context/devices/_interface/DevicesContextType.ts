/* eslint-disable @typescript-eslint/no-explicit-any */
export type DeviceWSMap = Record<string, WebSocket | null>;

export interface DevicesContextType {
  selectedDevices: any[];
  setSelectedDevices: (devices: any[]) => void;
  data: any[];
  screenScale: number;
  setScreenScale: (scale: number) => void;
}
