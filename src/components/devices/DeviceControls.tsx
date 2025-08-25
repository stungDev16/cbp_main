/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AndroidKeyCode,
  AndroidKeyEventAction,
} from "@yume-chan/scrcpy";

interface DeviceControlsProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  isConnected?: boolean;
  framesRendered?: number;
  framesSkipped?: number;
  sendEvent: (message: any) => void;
}

export default function DeviceControls({
  onConnect,
  onDisconnect,
  isConnected,
  framesRendered = 0,
  framesSkipped = 0,
  sendEvent,
}: DeviceControlsProps) {
  const sendKeyOnce = (keyCode: number) => {
    sendEvent({
      cmd: "injectKeyCode",
      payload: {
        action: AndroidKeyEventAction.Down,
        keyCode,
        repeat: 0,
        metaState: 0,
      },
    });
    sendEvent({
      cmd: "injectKeyCode",
      payload: {
        action: AndroidKeyEventAction.Up,
        keyCode,
        repeat: 0,
        metaState: 0,
      },
    });
  };

  const handleRotate = () => {
    sendEvent({ cmd: "rotateDevice" });
  };

  return (
    <div className="flex items-center justify-between mb-4 gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => sendKeyOnce(AndroidKeyCode.VolumeDown)}
        >
          Volume -
        </Button>
        <Button
          variant="outline"
          onClick={() => sendKeyOnce(AndroidKeyCode.VolumeUp)}
        >
          Volume +
        </Button>
        <Button variant="outline" onClick={handleRotate}>
          Rotate
        </Button>
        {isConnected ? (
          <Button variant="destructive" onClick={onDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button onClick={onConnect}>Connect</Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Rendered: {framesRendered}</Badge>
        <Badge variant="secondary">Skipped: {framesSkipped}</Badge>
      </div>
    </div>
  );
}


