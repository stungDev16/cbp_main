// components/DeviceControlManager.tsx
import { deviceControlSubject } from '@/Pattern/DeviceControlSubject';
import { useState, useEffect } from 'react';

export function DeviceControlManager() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectedDevices(deviceControlSubject.getObserverCount());
      setIsEnabled(deviceControlSubject.isActive());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleSyncControl = () => {
    if (deviceControlSubject.isActive()) {
      deviceControlSubject.disableSyncControl();
    } else {
      deviceControlSubject.enableSyncControl();
    }
  };

  return (
    <div className="device-control-manager p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Device Sync Control</h3>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSyncControl}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isEnabled 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isEnabled ? 'Disable Sync' : 'Enable Sync'}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Connected Devices:</span>
          <span className="font-semibold text-blue-600">{connectedDevices}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`font-semibold ${isEnabled ? 'text-green-600' : 'text-gray-600'}`}>
            {isEnabled ? 'Synchronized' : 'Independent'}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {isEnabled 
          ? 'All devices will mirror the actions of the device you interact with.'
          : 'Each device operates independently.'
        }
      </p>
    </div>
  );
}