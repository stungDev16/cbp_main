import React from "react";
import { useDevices } from "@/context/devices/hooks/useDevices";
import DeviceCtrolItem from "./DeviceCtrolItem";


const DeviceControlContainer: React.FC = () => {
  const { selectedDevices } = useDevices()
  return (
    <div className="bg-background flex-1">
      <div className="container mx-auto">
        <div className="w-full flex flex-wrap gap-2">
          {selectedDevices.map((device, id) => <DeviceCtrolItem key={id} device={device} index={id} />)}
        </div>
      </div>
    </div>
  );
};

export default DeviceControlContainer;
