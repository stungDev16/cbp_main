/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from "react";  
import {  
  AndroidKeyCode,  
  AndroidKeyEventAction,  
  AndroidKeyEventMeta,  
  AndroidMotionEventAction,  
  AndroidMotionEventButton,  
  ScrcpyPointerId,  
  ScrcpyHoverHelper,  
} from "@yume-chan/scrcpy";  
import { mapClientToDevicePosition } from "@/lib/mapClientToDevicePosition";  
  
const MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON = [  
  AndroidMotionEventButton.Primary,  
  AndroidMotionEventButton.Tertiary,  
  AndroidMotionEventButton.Secondary,  
  AndroidMotionEventButton.Back,  
  AndroidMotionEventButton.Forward,  
];  
  
interface UseDeviceControlOptions {  
  send: (message: any) => void;  
  widthRef: React.MutableRefObject<number>;  
  heightRef: React.MutableRefObject<number>;  
  rotationRef: React.MutableRefObject<number>;  
  rendererRef: React.MutableRefObject<HTMLElement | null>;  
  fullscreenRef: React.MutableRefObject<HTMLDivElement | null>;  
}  
  
export function useDeviceControl({  
  send,  
  widthRef,  
  heightRef,  
  rotationRef,  
  rendererRef,  
  fullscreenRef,  
}: UseDeviceControlOptions) {  
  // Keyboard modifier states  
  const controlLeftRef = useRef(false);  
  const controlRightRef = useRef(false);  
  const shiftLeftRef = useRef(false);  
  const shiftRightRef = useRef(false);  
  const altLeftRef = useRef(false);  
  const altRightRef = useRef(false);  
  const metaLeftRef = useRef(false);  
  const metaRightRef = useRef(false);  
  const capsLockRef = useRef(false);  
  const numLockRef = useRef(true);  
  const keysRef = useRef(new Set<number>());  
  const hoverHelperRef = useRef(new ScrcpyHoverHelper());  
  
  // Keyboard modifier management  
  const setModifier = useCallback((keyCode: number, value: boolean) => {  
    switch (keyCode) {  
      case AndroidKeyCode.ControlLeft:  
        controlLeftRef.current = value;  
        break;  
      case AndroidKeyCode.ControlRight:  
        controlRightRef.current = value;  
        break;  
      case AndroidKeyCode.ShiftLeft:  
        shiftLeftRef.current = value;  
        break;  
      case AndroidKeyCode.ShiftRight:  
        shiftRightRef.current = value;  
        break;  
      case AndroidKeyCode.AltLeft:  
        altLeftRef.current = value;  
        break;  
      case AndroidKeyCode.AltRight:  
        altRightRef.current = value;  
        break;  
      case AndroidKeyCode.MetaLeft:  
        metaLeftRef.current = value;  
        break;  
      case AndroidKeyCode.MetaRight:  
        metaRightRef.current = value;  
        break;  
      case AndroidKeyCode.CapsLock:  
        if (value) {  
          capsLockRef.current = !capsLockRef.current;  
        }  
        break;  
      case AndroidKeyCode.NumLock:  
        if (value) {  
          numLockRef.current = !numLockRef.current;  
        }  
        break;  
    }  
  }, []);  
  
  const getMetaState = useCallback(() => {  
    let metaState = 0;  
    if (altLeftRef.current) {  
      metaState |= AndroidKeyEventMeta.AltOn | AndroidKeyEventMeta.AltLeftOn;  
    }  
    if (altRightRef.current) {  
      metaState |= AndroidKeyEventMeta.AltOn | AndroidKeyEventMeta.AltRightOn;  
    }  
    if (shiftLeftRef.current) {  
      metaState |= AndroidKeyEventMeta.ShiftOn | AndroidKeyEventMeta.ShiftLeftOn;  
    }  
    if (shiftRightRef.current) {  
      metaState |= AndroidKeyEventMeta.ShiftOn | AndroidKeyEventMeta.ShiftRightOn;  
    }  
    if (controlLeftRef.current) {  
      metaState |= AndroidKeyEventMeta.CtrlOn | AndroidKeyEventMeta.CtrlLeftOn;  
    }  
    if (controlRightRef.current) {  
      metaState |= AndroidKeyEventMeta.CtrlOn | AndroidKeyEventMeta.CtrlRightOn;  
    }  
    if (metaLeftRef.current) {  
      metaState |= AndroidKeyEventMeta.MetaOn | AndroidKeyEventMeta.MetaLeftOn;  
    }  
    if (metaRightRef.current) {  
      metaState |= AndroidKeyEventMeta.MetaOn | AndroidKeyEventMeta.MetaRightOn;  
    }  
    if (capsLockRef.current) {  
      metaState |= AndroidKeyEventMeta.CapsLockOn;  
    }  
    if (numLockRef.current) {  
      metaState |= AndroidKeyEventMeta.NumLockOn;  
    }  
    return metaState;  
  }, []);  
  
  // Keyboard event handlers  
  const down = useCallback(async (key: string) => {  
    const keyCode = (AndroidKeyCode as any)[key];  
    if (!keyCode) {  
      console.log("unknown key");  
      return;  
    }  
  
    setModifier(keyCode, true);  
    keysRef.current.add(keyCode);  
  
    const payload = {  
      action: AndroidKeyEventAction.Down,  
      keyCode,  
      metaState: getMetaState(),  
      repeat: 0,  
    };  
    send({  
      cmd: "injectKeyCode",  
      payload,  
    });  
  }, [setModifier, getMetaState, send]);  
  
  const up = useCallback(async (key: string) => {  
    const keyCode = (AndroidKeyCode as any)[key];  
    if (!keyCode) {  
      return;  
    }  
  
    setModifier(keyCode, false);  
    keysRef.current.delete(keyCode);  
  
    send({  
      cmd: "injectKeyCode",  
      payload: {  
        action: AndroidKeyEventAction.Up,  
        keyCode,  
        metaState: getMetaState(),  
        repeat: 0,  
      },  
    });  
  }, [setModifier, getMetaState, send]);  
  
  const reset = useCallback(async () => {  
    controlRightRef.current = false;  
    controlLeftRef.current = false;  
    shiftRightRef.current = false;  
    shiftLeftRef.current = false;  
    altRightRef.current = false;  
    altLeftRef.current = false;  
    metaRightRef.current = false;  
    metaLeftRef.current = false;  
    for (const key of keysRef.current) {  
      up((AndroidKeyCode as any)[key]);  
    }  
    keysRef.current.clear();  
  }, [up]);  
  
  // Touch/Pointer event handlers  
  const injectTouch = useCallback((action: AndroidMotionEventAction, e: PointerEvent) => {  
    const { pointerType } = e;  
    let pointerId;  
    if (pointerType === "mouse") {  
      pointerId = ScrcpyPointerId.Finger;  
    } else {  
      pointerId = BigInt(e.pointerId);  
    }  
  
    if (!rendererRef.current) return;  
  
    const { x, y } = mapClientToDevicePosition(  
      { x: e.clientX, y: e.clientY },  
      { width: widthRef.current, height: heightRef.current, rotation: rotationRef.current },  
      rendererRef.current  
    );  
  
    const messages = hoverHelperRef.current.process({  
      action,  
      pointerId,  
      screenWidth: widthRef.current,  
      screenHeight: heightRef.current,  
      pointerX: x,  
      pointerY: y,  
      pressure: e.pressure,  
      actionButton: MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON[e.button],  
      buttons: e.buttons,  
    });  
  
    for (const message of messages) {  
      send({  
        cmd: "injectTouch",  
        payload: message,  
      });  
    }  
  }, [send, widthRef, heightRef, rotationRef, rendererRef]);  
  
  // Mouse wheel handler  
  const handleWheel = useCallback((e: WheelEvent) => {  
    fullscreenRef.current?.focus();  
    e.preventDefault();  
    e.stopPropagation();  
  
    if (!rendererRef.current) return;  
  
    const { x, y } = mapClientToDevicePosition(  
      { x: e.clientX, y: e.clientY },  
      { width: widthRef.current, height: heightRef.current, rotation: rotationRef.current },  
      rendererRef.current  
    );  
  
    send({  
      cmd: "injectScroll",  
      payload: {  
        screenWidth: widthRef.current,  
        screenHeight: heightRef.current,  
        rotation: rotationRef.current,  
        pointerX: x,  
        pointerY: y,  
        scrollX: -e.deltaX / 100,  
        scrollY: -e.deltaY / 100,  
        buttons: 0,  
      },  
    });  
  }, [send, widthRef, heightRef, rotationRef, rendererRef, fullscreenRef]);  
  
  // React event handlers  
  const handlePointerDown = useCallback((e: React.PointerEvent) => {  
    injectTouch(AndroidMotionEventAction.Down, e.nativeEvent);  
  }, [injectTouch]);  
  
  const handlePointerMove = useCallback((e: React.PointerEvent) => {  
    injectTouch(AndroidMotionEventAction.Move, e.nativeEvent);  
  }, [injectTouch]);  
  
  const handlePointerUp = useCallback((e: React.PointerEvent) => {  
    injectTouch(AndroidMotionEventAction.Up, e.nativeEvent);  
  }, [injectTouch]);  
  
  const handlePointerLeave = useCallback((e: React.PointerEvent) => {  
    injectTouch(AndroidMotionEventAction.Up, e.nativeEvent);  
  }, [injectTouch]);  
  
  const handleContextMenu = useCallback((e: React.MouseEvent) => {  
    e.preventDefault();  
  }, []);  
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {  
    e.preventDefault();  
    down(e.code);  
  }, [down]);  
  
  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {  
    e.preventDefault();  
    up(e.code);  
  }, [up]);  
  
  return {  
    // Keyboard handlers  
    down,  
    up,  
    reset,  
      
    // Touch/Pointer handlers  
    injectTouch,  
    handlePointerDown,  
    handlePointerMove,  
    handlePointerUp,  
    handlePointerLeave,  
      
    // Mouse handlers  
    handleWheel,  
    handleContextMenu,  
      
    // React event handlers  
    handleKeyDown,  
    handleKeyUp,  
  };  
}