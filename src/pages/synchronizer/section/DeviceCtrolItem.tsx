import { memo, useCallback, useEffect, useState, useMemo, useRef } from "react";
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
import { Packr, Unpackr } from "msgpackr";
import { DEAULT_BIT_RATE, DEAULT_MAX_FPS, PACK_OPTIONS } from "@/constants";
import { streamingService } from "@/apis/services/stream/streaming-service";
import { WebCodecsVideoDecoder } from "@yume-chan/scrcpy-decoder-webcodecs";
import { deviceControlSubject } from "@/Pattern/DeviceControlSubject";

const MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON = [
  AndroidMotionEventButton.Primary,
  AndroidMotionEventButton.Tertiary,
  AndroidMotionEventButton.Secondary,
  AndroidMotionEventButton.Back,
  AndroidMotionEventButton.Forward,
];
/* eslint-disable @typescript-eslint/no-explicit-any */
function DeviceCtrolItem({ device, index }: { device: any; index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<any>(null);
  const rendererRef = useRef<HTMLElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const decoderRef = useRef<any>(null);

  const videoControllerRef = useRef<any>(null);
  const audioControllerRef = useRef<any>(null);
  const framesIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hoverHelperRef = useRef(new ScrcpyHoverHelper());
  const startedRef = useRef(false);
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const rotationRef = useRef(0);
  const framesRenderedRef = useRef(0);
  const framesSkippedRef = useRef(0);
  const isStreamingRef = useRef(false);
  const isWsOpenRef = useRef(false);

  // control
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

  const [isSyncEnabled, setIsSyncEnabled] = useState(
    deviceControlSubject.isActive()
  );

  const packer = useMemo(() => new Packr(PACK_OPTIONS), []);
  const unpacker = useMemo(() => new Unpackr(PACK_OPTIONS), []);
  //   Mục đích: Cập nhật trạng thái các phím modifier (Ctrl, Shift, Alt, Meta, CapsLock, NumLock) khi nhấn/thả phím.
  // Tính năng: Giúp xác định tổ hợp phím đang được giữ để gửi đúng trạng thái phím lên thiết bị Android.
  const setModifier = useCallback(
    (keyCode: number, value: boolean) => {
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
    },
    [capsLockRef, numLockRef]
  );

  // Mục đích: Tính toán giá trị metaState (trạng thái các phím modifier) để gửi kèm khi phát sinh sự kiện phím.
  // Tính năng: Đảm bảo các sự kiện phím gửi lên thiết bị Android phản ánh đúng trạng thái tổ hợp phím.
  const getMetaState = useCallback(() => {
    let metaState = 0;
    if (altLeftRef.current) {
      metaState |= AndroidKeyEventMeta.AltOn | AndroidKeyEventMeta.AltLeftOn;
    }
    if (altRightRef.current) {
      metaState |= AndroidKeyEventMeta.AltOn | AndroidKeyEventMeta.AltRightOn;
    }
    if (shiftLeftRef.current) {
      metaState |=
        AndroidKeyEventMeta.ShiftOn | AndroidKeyEventMeta.ShiftLeftOn;
    }
    if (shiftRightRef.current) {
      metaState |=
        AndroidKeyEventMeta.ShiftOn | AndroidKeyEventMeta.ShiftRightOn;
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
  }, [
    altLeftRef,
    altRightRef,
    shiftLeftRef,
    shiftRightRef,
    controlLeftRef,
    controlRightRef,
    metaLeftRef,
    metaRightRef,
    capsLockRef,
    numLockRef,
  ]);

  // Mục đích: Đóng gói và gửi message qua WebSocket tới thiết bị Android.
  // Tính năng: Là hàm giao tiếp chính giữa client và thiết bị Android qua WebSocket.
  const send = useCallback(
    (message: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const record = packer.pack(message);
        wsRef.current.send(record);
      }
    },
    [packer]
  );
  // Mục đích: Xử lý sự kiện nhấn (down) và thả (up) phím trên bàn phím.
  // Tính năng: Gửi sự kiện phím tương ứng tới thiết bị Android, đồng thời cập nhật trạng thái các phím modifier.
  const down = useCallback(
    async (key: string) => {
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
    },
    [setModifier, keysRef, getMetaState, send]
  );

  // Mục đích: Xử lý sự kiện nhấn (down) và thả (up) phím trên bàn phím.
  // Tính năng: Gửi sự kiện phím tương ứng tới thiết bị Android, đồng thời cập nhật trạng thái các phím modifier.
  const up = useCallback(
    async (key: string) => {
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
    },
    [setModifier, keysRef, getMetaState, send]
  );

  // Mục đích: Reset trạng thái tất cả các phím modifier và gửi sự kiện thả phím cho tất cả phím đang giữ.
  // Tính năng: Đảm bảo không còn phím nào bị giữ khi cần reset trạng thái điều khiển.
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
  }, [keysRef, up]);

  // Mục đích: Giải phóng tài nguyên khi component bị unmount hoặc khi khởi động lại stream.
  // Tính năng: Dừng audio, video, đóng WebSocket, clear interval, xóa các phần tử DOM liên quan.
  const dispose = useCallback(async () => {
    await reset();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log("abortController.aborted");
    }
    if (decoderRef.current) {
      await decoderRef.current.dispose();
      decoderRef.current = null;
      console.log("decoder disposed");
    }
    if (audioPlayerRef.current) {
      await audioPlayerRef.current.stop();
      audioPlayerRef.current = null;
      console.log("audioPlayer stopped");
    }
    if (wsRef.current) {
      await wsRef.current.close();
      wsRef.current = null;
      console.log("ws closed");
    }
    if (framesIntervalRef.current) {
      clearTimeout(framesIntervalRef.current);
      framesIntervalRef.current = null;
    }
    while (containerRef.current?.firstChild) {
      console.log("Removing container.firstChild");
      containerRef.current.firstChild.remove();
    }
  }, [reset]);

  // Mục đích: Gửi sự kiện cảm ứng (touch/mouse) tới thiết bị Android.
  // Tính năng: Chuyển đổi tọa độ chuột/touch trên trình duyệt sang tọa độ thiết bị, gửi sự kiện tương ứng (down, move, up).
  const injectTouch = useCallback(
    (action: AndroidMotionEventAction, e: PointerEvent) => {
      const { pointerType } = e;
      let pointerId;
      if (pointerType === "mouse") {
        // Android 13 has bug with mouse injection
        pointerId = ScrcpyPointerId.Finger;
      } else {
        pointerId = BigInt(e.pointerId);
      }

      if (!rendererRef.current) return;

      const { x, y } = mapClientToDevicePosition(
        { x: e.clientX, y: e.clientY },
        {
          width: widthRef.current,
          height: heightRef.current,
          rotation: rotationRef.current,
        },
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

      // Notify other observers when sync enabled
      deviceControlSubject.notify({
        type: "touch",
        sourceDeviceId: device?.id,
        data: messages.length === 1 ? messages[0] : messages,
      });
    },
    [widthRef, heightRef, rotationRef, send, device?.id]
  );

  // Mục đích: Xử lý sự kiện cuộn chuột (wheel) và gửi sự kiện scroll tới thiết bị Android.
  // Tính năng: Cho phép cuộn nội dung trên thiết bị Android từ trình duyệt.
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      fullscreenRef.current?.focus();
      e.preventDefault();
      e.stopPropagation();

      if (!rendererRef.current) return;

      const { x, y } = mapClientToDevicePosition(
        { x: e.clientX, y: e.clientY },
        {
          width: widthRef.current,
          height: heightRef.current,
          rotation: rotationRef.current,
        },
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

      deviceControlSubject.notify({
        type: "scroll",
        sourceDeviceId: device?.id,
        data: {
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
    },
    [widthRef, heightRef, rotationRef, send, device?.id]
  );

  // Mục đích: Khởi tạo và bắt đầu streaming video/audio từ thiết bị Android.
  // Tính năng: Thiết lập decoder, renderer, WebSocket, các stream audio/video, và các event handler.
  const start = useCallback(
    async ({
      maxFps,
      bitRate,
      order_id,
    }: {
      maxFps: number;
      bitRate: number;
      order_id: string;
    }) => {
      console.log(order_id, maxFps, bitRate);
      await dispose();
      const { data } = await streamingService.start_streaming({ id: order_id });
      console.log(data.stream_url);
      abortControllerRef.current = new AbortController();
      isStreamingRef.current = true;
      decoderRef.current = new WebCodecsVideoDecoder(0x68_32_36_34, false);
      if (decoderRef.current && containerRef.current) {
        rendererRef.current = decoderRef.current.renderer as HTMLElement;
        if (rendererRef.current) {
          rendererRef.current.style.maxWidth = "200px";
          rendererRef.current.style.maxHeight = "300px";
          rendererRef.current.style.touchAction = "none";
          rendererRef.current.style.outline = "none";
          containerRef.current.appendChild(rendererRef.current as Node);
        }

        decoderRef.current.sizeChanged(
          (size: { width: number; height: number }) => {
            widthRef.current = size.width;
            heightRef.current = size.height;
            console.log(`RESIZE: width=${size.width}, height=${size.height}`);
          }
        );
      }

      // Setup event listeners
      if (fullscreenRef.current) {
        fullscreenRef.current.addEventListener("wheel", handleWheel, {
          passive: false,
        });
        fullscreenRef.current.tabIndex = index;
        rendererRef.current?.setAttribute("aria-label", "Device Screen");
      }

      // Setup video stream
      new ReadableStream({
        start(controller) {
          videoControllerRef.current = controller;
        },
      })
        .pipeTo(decoderRef.current.writable, {
          signal: abortControllerRef.current.signal,
        })
        .catch(() => {
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }
        });

      // Initialize WebSocket connection
      wsRef.current = await streamingService.init({
        wsUri: data?.stream_url,
        order_id,
        onopen: () => {
          console.log(`CONNECTED ${order_id}`);
          isWsOpenRef.current = true;
        },
        onclose: () => {
          console.log(`DISCONNECTED ${order_id}`);
          isWsOpenRef.current = false;
          startedRef.current = false;
        },
        onmessage: (_ws, _id, evt: MessageEvent) => {
          const record = unpacker.unpack(evt.data);
          console.log(record);

          if (record.media === "video") {
            try {
              videoControllerRef.current?.enqueue(record.packet);
            } catch (err) {
              console.log(err);
            }
          } else if (record.media === "audio") {
            try {
              audioControllerRef.current?.enqueue(record.packet);
            } catch (err) {
              console.log(err);
            }
          } else if (record.media === "message") {
            try {
              navigator.clipboard.writeText(record.message);
            } catch (err) {
              console.log(err);
            }
          }
        },
        onerror: () => {
          console.log(`WS ERROR ${order_id}`);
        },
      });

      // Start frames counter
      framesIntervalRef.current = setInterval(() => {
        const fr = decoderRef.current?.framesRendered || 0;
        const fs = decoderRef.current?.framesSkipped || 0;
        framesRenderedRef.current = fr;
        framesSkippedRef.current = fs;
        framesRenderedRef.current = fr;
        framesSkippedRef.current = fs;
      }, 1000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispose, unpacker]
  );

  // Event handlers
  // Tính năng: Gọi injectTouch hoặc down/up tương ứng để gửi sự kiện tới thiết bị Android.
  // Mục đích: Xử lý các sự kiện chuột, cảm ứng, bàn phím từ React component.
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      injectTouch(AndroidMotionEventAction.Down, e.nativeEvent);
    },
    [injectTouch]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      injectTouch(AndroidMotionEventAction.Move, e.nativeEvent);
    },
    [injectTouch]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      injectTouch(AndroidMotionEventAction.Up, e.nativeEvent);
    },
    [injectTouch]
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      injectTouch(AndroidMotionEventAction.Up, e.nativeEvent);
    },
    [injectTouch]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      down(e.code);

      // notify others
      deviceControlSubject.notify({
        type: "key",
        sourceDeviceId: device?.id,
        data: {
          action: AndroidKeyEventAction.Down,
          keyCode: (AndroidKeyCode as any)[e.code],
          metaState: getMetaState(),
          repeat: 0,
        },
      });
    },
    [down, getMetaState, device?.id]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      up(e.code);

      deviceControlSubject.notify({
        type: "key",
        sourceDeviceId: device?.id,
        data: {
          action: AndroidKeyEventAction.Up,
          keyCode: (AndroidKeyCode as any)[e.code],
          metaState: getMetaState(),
          repeat: 0,
        },
      });
    },
    [up, getMetaState, device?.id]
  );

  // Subscribe/unsubscribe observer (created inside effect so it can use latest `send`)
  useEffect(() => {
    const observer = {
      id: device?.id || String(index),
      executeAction: (action: any) => {
        if (action.sourceDeviceId === device?.id) return;
        try {
          if (action.type === "touch") {
            const data = action.data;
            if (Array.isArray(data)) {
              for (const d of data) send({ cmd: "injectTouch", payload: d });
            } else {
              send({ cmd: "injectTouch", payload: data });
            }
          } else if (action.type === "key") {
            send({ cmd: "injectKeyCode", payload: action.data });
          } else if (action.type === "scroll") {
            send({ cmd: "injectScroll", payload: action.data });
          }
        } catch (err) {
          console.error("Failed executing mirrored action", err);
        }
      },
    };

    try {
      deviceControlSubject.subscribe(observer);
    } catch {
      // ignore
    }
    return () => {
      try {
        deviceControlSubject.unsubscribe(observer.id);
      } catch {
        // ignore
      }
    };
  }, [device?.id, index, send]);
  useEffect(() => {
    if (!startedRef.current && device) {
      startedRef.current = true;
      start({
        maxFps: DEAULT_MAX_FPS,
        bitRate: DEAULT_BIT_RATE,
        order_id: device?.id,
      });
    }
    return () => {
      startedRef.current = false;
      dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  // Subscribe to sync status changes
  useEffect(() => {
    const checkSyncStatus = () => {
      setIsSyncEnabled(deviceControlSubject.isActive());
    };

    // Check initially
    checkSyncStatus();

    // Check periodically for sync status changes
    const interval = setInterval(checkSyncStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={fullscreenRef}
      className={`border flex bg-black transition-all duration-200 ${
        isSyncEnabled ? "ring-2 ring-blue-500" : ""
      }`}
      tabIndex={index}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
export default memo(DeviceCtrolItem);
