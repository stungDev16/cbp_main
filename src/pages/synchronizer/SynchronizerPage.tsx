import { DevicesProvider } from "@/context/devices/Devices.provider";
import ControlPanel from "./section/ControlPanel";
import DeviceControlContainer from "./section/DeviceControlContainer";

export default function SynchronizerPage() {
  return (
    <DevicesProvider>
      <div className="flex-1 size-full p-4 rounded-xl flex gap-4 overflow-auto">
        <ControlPanel />
        <DeviceControlContainer />
      </div>
    </DevicesProvider>
  );
}
