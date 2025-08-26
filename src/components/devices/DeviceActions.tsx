import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DEAULT_BIT_RATE, DEAULT_MAX_FPS } from "@/constants";

interface DeviceActionsProps {
  isWsOpen?: boolean;
  onStart?: (config: { maxFps: number; bitRate: number }) => void;
}

export default function DeviceActions({ isWsOpen, onStart }: DeviceActionsProps) {
  const [maxFps, setMaxFps] = useState<number>(DEAULT_MAX_FPS);
  const [bitRate, setBitRate] = useState<number>(DEAULT_BIT_RATE);

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Select value={device ?? ""} onValueChange={(val) => dispatch(setDevice(val))}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select device" />
        </SelectTrigger>
        <SelectContent>
          {!device && <SelectItem value="" disabled>
            Select device
          </SelectItem>}
          {devices.map((d) => (
            <SelectItem key={d.serial} value={d.serial}>
              {d.serial}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          className="w-28"
          value={maxFps}
          min={1}
          max={90}
          onChange={(e) => setMaxFps(Number(e.target.value))}
          placeholder="FPS"
        />
        <Input
          type="number"
          className="w-28"
          value={bitRate}
          min={1}
          max={50}
          onChange={(e) => setBitRate(Number(e.target.value))}
          placeholder="Bitrate (Mbps)"
        />
      </div>

      <Button onClick={() => onStart?.({ maxFps, bitRate })}>
        {isWsOpen ? "Restart" : "Start"}
      </Button>
    </div>
  );
}


