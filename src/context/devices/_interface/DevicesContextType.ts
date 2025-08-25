/* eslint-disable @typescript-eslint/no-explicit-any */
export type DeviceWSMap = Record<string, WebSocket | null>;

export interface DevicesContextType {
  selectedDevices: any[];
  setSelectedDevices: (devices: any[]) => void;
  deviceWSMap: DeviceWSMap;
  setDeviceWS: (id: string, ws: WebSocket | null) => void;
  sendToDevice: (id: string, data: unknown) => void;
  sendToAll: (data: unknown) => void;
  closeDeviceWS: (id: string) => void;
  closeAllWS: () => void;
  screenScale: number;
  setScreenScale: (scale: number) => void;
}