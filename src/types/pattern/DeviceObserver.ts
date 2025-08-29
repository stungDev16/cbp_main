// types/DeviceObserver.ts
export interface DeviceAction {
  type: 'touch' | 'key' | 'scroll';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  sourceDeviceId?: string;
}

export interface DeviceObserver {
  id: string;
  executeAction: (action: DeviceAction) => void;
}