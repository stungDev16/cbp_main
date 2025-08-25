/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  ScrcpyVideoCodecId,
  ScrcpyAudioCodec,
  AndroidKeyCode,
  AndroidKeyEventAction,
  AndroidKeyEventMeta,
  AndroidMotionEventAction,
  AndroidMotionEventButton,
  ScrcpyPointerId,
  ScrcpyHoverHelper,
} from "@yume-chan/scrcpy";
import { TinyH264Decoder } from "@yume-chan/scrcpy-decoder-tinyh264";
import { WebCodecsVideoDecoder } from "@yume-chan/scrcpy-decoder-webcodecs";
import {
  Float32PcmPlayer,
  Float32PlanerPcmPlayer,
  Int16PcmPlayer,
} from "@yume-chan/pcm-player";
import { ReadableStream, WritableStream } from "@yume-chan/stream-extra";
import { Packr, Unpackr } from "msgpackr";

import { AacDecodeStream, OpusDecodeStream } from "@/lib/audio-decode-stream";
import { DEAULT_BIT_RATE, DEAULT_MAX_FPS, PACK_OPTIONS } from "@/constants";
import { streamingService } from "@/apis/services/stream/streaming-service";
import { mapClientToDevicePosition } from "@/lib/mapClientToDevicePosition";
import DeviceControls from "@/components/devices/DeviceControls";

import { useDevices } from "@/context/devices/hooks/useDevices";

const MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON = [
  AndroidMotionEventButton.Primary,
  AndroidMotionEventButton.Tertiary,
  AndroidMotionEventButton.Secondary,
  AndroidMotionEventButton.Back,
  AndroidMotionEventButton.Forward,
];

const DeviceControlContainer: React.FC = () => {
  const { selectedDevices, screenScale } = useDevices()
  const dispatch = useDispatch<AppDispatch>();
  const { device, display, audioEncoder, videoEncoder } = useSelector(
    (state: RootState) => state.adb
  );

  // Refs for DOM elements and streaming objects
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<HTMLElement | null>(null);
  const audioPlayerRef = useRef<any>(null);
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

  // State variables
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [rotation, setRotation] = useState(0);
  const [framesRendered, setFramesRendered] = useState(0);
  const [framesSkipped, setFramesSkipped] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWsOpen, setIsWsOpen] = useState(false);

  // Keyboard state
  const [controlLeft, setControlLeft] = useState(false);
  const [controlRight, setControlRight] = useState(false);
  const [shiftLeft, setShiftLeft] = useState(false);
  const [shiftRight, setShiftRight] = useState(false);
  const [altLeft, setAltLeft] = useState(false);
  const [altRight, setAltRight] = useState(false);
  const [metaLeft, setMetaLeft] = useState(false);
  const [metaRight, setMetaRight] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [numLock, setNumLock] = useState(true);
  const [keys] = useState(new Set<number>());


  // Initialize msgpack
  const packer = useMemo(() => new Packr(PACK_OPTIONS), []);
  const unpacker = useMemo(() => new Unpackr(PACK_OPTIONS), []);

  // Initialize on mount

  // Start when device becomes available is defined after start()

  // Modifier key handling
  const setModifier = useCallback(
    (keyCode: number, value: boolean) => {
      switch (keyCode) {
        case AndroidKeyCode.ControlLeft:
          setControlLeft(value);
          break;
        case AndroidKeyCode.ControlRight:
          setControlRight(value);
          break;
        case AndroidKeyCode.ShiftLeft:
          setShiftLeft(value);
          break;
        case AndroidKeyCode.ShiftRight:
          setShiftRight(value);
          break;
        case AndroidKeyCode.AltLeft:
          setAltLeft(value);
          break;
        case AndroidKeyCode.AltRight:
          setAltRight(value);
          break;
        case AndroidKeyCode.MetaLeft:
          setMetaLeft(value);
          break;
        case AndroidKeyCode.MetaRight:
          setMetaRight(value);
          break;
        case AndroidKeyCode.CapsLock:
          if (value) {
            setCapsLock(!capsLock);
          }
          break;
        case AndroidKeyCode.NumLock:
          if (value) {
            setNumLock(!numLock);
          }
          break;
      }
    },
    [capsLock, numLock]
  );

  // Get meta state for key events
  const getMetaState = useCallback(() => {
    let metaState = 0;
    if (altLeft) {
      metaState |= AndroidKeyEventMeta.AltOn | AndroidKeyEventMeta.AltLeftOn;
    }
    if (altRight) {
      metaState |= AndroidKeyEventMeta.AltOn | AndroidKeyEventMeta.AltRightOn;
    }
    if (shiftLeft) {
      metaState |=
        AndroidKeyEventMeta.ShiftOn | AndroidKeyEventMeta.ShiftLeftOn;
    }
    if (shiftRight) {
      metaState |=
        AndroidKeyEventMeta.ShiftOn | AndroidKeyEventMeta.ShiftRightOn;
    }
    if (controlLeft) {
      metaState |= AndroidKeyEventMeta.CtrlOn | AndroidKeyEventMeta.CtrlLeftOn;
    }
    if (controlRight) {
      metaState |= AndroidKeyEventMeta.CtrlOn | AndroidKeyEventMeta.CtrlRightOn;
    }
    if (metaLeft) {
      metaState |= AndroidKeyEventMeta.MetaOn | AndroidKeyEventMeta.MetaLeftOn;
    }
    if (metaRight) {
      metaState |= AndroidKeyEventMeta.MetaOn | AndroidKeyEventMeta.MetaRightOn;
    }
    if (capsLock) {
      metaState |= AndroidKeyEventMeta.CapsLockOn;
    }
    if (numLock) {
      metaState |= AndroidKeyEventMeta.NumLockOn;
    }
    return metaState;
  }, [
    altLeft,
    altRight,
    shiftLeft,
    shiftRight,
    controlLeft,
    controlRight,
    metaLeft,
    metaRight,
    capsLock,
    numLock,
  ]);

  // Send command to WebSocket
  const send = useCallback(
    (message: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const record = packer.pack(message);
        wsRef.current.send(record);
      }
    },
    [packer]
  );

  // Key down handler
  const down = useCallback(
    async (key: string) => {
      const keyCode = (AndroidKeyCode as any)[key];
      if (!keyCode) {
        console.log("unknown key");
        return;
      }

      setModifier(keyCode, true);
      keys.add(keyCode);

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
    [setModifier, keys, getMetaState, send]
  );

  // Key up handler
  const up = useCallback(
    async (key: string) => {
      const keyCode = (AndroidKeyCode as any)[key];
      if (!keyCode) {
        return;
      }

      setModifier(keyCode, false);
      keys.delete(keyCode);

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
    [setModifier, keys, getMetaState, send]
  );

  // Reset all keys
  const reset = useCallback(async () => {
    setControlLeft(false);
    setControlRight(false);
    setShiftLeft(false);
    setShiftRight(false);
    setAltLeft(false);
    setAltRight(false);
    setMetaLeft(false);
    setMetaRight(false);
    for (const key of keys) {
      up((AndroidKeyCode as any)[key]);
    }
    keys.clear();
  }, [keys, up]);

  // Dispose resources
  const dispose = useCallback(async () => {
    if (abortControllerRef.current) {
      await abortControllerRef.current.abort();
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
  }, []);

  // Start streaming
  const start = useCallback(
    async ({ maxFps, bitRate }: { maxFps: number; bitRate: number }) => {
      await dispose();

      abortControllerRef.current = new AbortController();
      setIsStreaming(true);

      // Performance-first: disable audio path to avoid worklet load issues for now
      const enableAudio = false;
      const audioEncoderObj = { codec: enableAudio ? audioEncoder : "off" } as any;
      if (enableAudio) {
        if (["off", "raw"].includes(audioEncoderObj?.codec || "")) {
          audioPlayerRef.current = new Int16PcmPlayer(48000, 2);
        } else if (["aac"].includes(audioEncoderObj?.codec || "")) {
          audioPlayerRef.current = new Float32PlanerPcmPlayer(48000, 2);
        } else if (["opus"].includes(audioEncoderObj?.codec || "")) {
          audioPlayerRef.current = new Float32PcmPlayer(48000, 2);
        }
      }

      // Initialize video decoder
      // Choose video encoder similar to Vue: prefer h264 if available
      let vEnc: any = videoEncoder;
      // If store doesn't keep encoder object, try derive from metainfo in adb slice
      // fallback to h264
      const derivedCodec = (vEnc?.codec as string) || "h264";
      if (!vEnc || !("decoder" in vEnc) || ["off"].includes(vEnc.decoder || "")) {
        decoderRef.current = new TinyH264Decoder();
      } else if (["WebCodecs"].includes(vEnc.decoder || "")) {
        let codec: ScrcpyVideoCodecId = ScrcpyVideoCodecId.H264;
        switch (derivedCodec) {
          case "h264": {
            codec = ScrcpyVideoCodecId.H264;
            break;
          }
          case "h265": {
            codec = ScrcpyVideoCodecId.H265;
            break;
          }
          case "av1": {
            codec = ScrcpyVideoCodecId.AV1;
            break;
          }
        }
        decoderRef.current = new WebCodecsVideoDecoder(codec, false);
      }

      // Setup renderer
      if (decoderRef.current && containerRef.current) {
        rendererRef.current = decoderRef.current.renderer as HTMLElement;
        if (rendererRef.current) {
          rendererRef.current.style.maxWidth = "100%";
          rendererRef.current.style.maxHeight = "100%";
          rendererRef.current.style.touchAction = "none";
          rendererRef.current.style.outline = "none";
          containerRef.current.appendChild(rendererRef.current as Node);
        }

        decoderRef.current.sizeChanged(
          (size: { width: number; height: number }) => {
            widthRef.current = size.width;
            heightRef.current = size.height;
            setWidth(size.width);
            setHeight(size.height);
            console.log(`RESIZE: width=${size.width}, height=${size.height}`);
          }
        );
      }

      // Setup event listeners
      if (fullscreenRef.current) {
        fullscreenRef.current.addEventListener("wheel", handleWheel, {
          passive: false,
        });
        fullscreenRef.current.tabIndex = 0;
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

      // Setup audio stream based on codec (disabled for now)
      if (enableAudio && ["off", "raw"].includes(audioEncoderObj?.codec || "")) {
        new ReadableStream({
          start(controller) {
            audioControllerRef.current = controller;
          },
        })
          .pipeTo(
            new WritableStream<any>({
              write: (chunk: any) => {
                const view = new Int16Array(
                  chunk.data.buffer,
                  chunk.data.byteOffset,
                  chunk.data.byteLength / Int16Array.BYTES_PER_ELEMENT
                );
                audioPlayerRef.current?.feed(view);
              },
            }),
            {
              signal: abortControllerRef.current.signal,
            }
          )
          .catch(() => {
            if (abortControllerRef.current?.signal.aborted) {
              return;
            }
          });
      } else if (enableAudio && ["aac"].includes(audioEncoderObj?.codec || "")) {
        new ReadableStream<any>({
          start(controller) {
            audioControllerRef.current = controller;
          },
        })
          .pipeThrough(
            new AacDecodeStream({
              codec: ScrcpyAudioCodec.AAC.webCodecId,
              numberOfChannels: 2,
              sampleRate: 48000,
            }),
            {
              signal: abortControllerRef.current.signal,
            }
          )
          .pipeTo(
            new WritableStream<any>({
              write: (chunk: Float32Array[]) => {
                audioPlayerRef.current?.feed(chunk);
              },
            }),
            {
              signal: abortControllerRef.current.signal,
            }
          )
          .catch(() => {
            if (abortControllerRef.current?.signal.aborted) {
              return;
            }
          });
      } else if (enableAudio && ["opus"].includes(audioEncoderObj?.codec || "")) {
        new ReadableStream<any>({
          start(controller) {
            audioControllerRef.current = controller;
          },
        })
          .pipeThrough(
            new OpusDecodeStream({
              codec: ScrcpyAudioCodec.OPUS.webCodecId,
              numberOfChannels: 2,
              sampleRate: 48000,
            }),
            {
              signal: abortControllerRef.current.signal,
            }
          )
          .pipeTo(
            new WritableStream<any>({
              write: (chunk: Float32Array) => {
                audioPlayerRef.current?.feed(chunk);
              },
            }),
            {
              signal: abortControllerRef.current.signal,
            }
          )
          .catch((e) => {
            if (abortControllerRef.current?.signal.aborted) {
              return;
            }
          });
      }

      // Start audio player (disabled for now)
      if (enableAudio) {
        await audioPlayerRef.current?.start();
      }

      // Initialize WebSocket connection
      wsRef.current = await streamingService.init({
        device: "988a973546554f465030",
        audio: true,
        audioCodec: "raw",
        audioEncoder: "raw",
        video: true,
        videoCodec: "h264",
        videoEncoder: "OMX.Exynos.AVC.Encoder", // send an encoder name to satisfy server
        videoBitRate: bitRate,
        maxFps: maxFps,
        onopen: (ws: WebSocket, id: string, evt: Event) => {
          console.log(`ID=${id} CONNECTED`);
          setIsWsOpen(true);
        },
        onclose: (ws: WebSocket, id: string, evt: CloseEvent) => {
          console.log(`ID=${id} DISCONNECTED`);
          setIsWsOpen(false);
          startedRef.current = false;
        },
        onmessage: (ws: WebSocket, id: string, evt: MessageEvent) => {
          const record = unpacker.unpack(evt.data);
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
        onerror: (ws: WebSocket, id: string, evt: Event) => {
          console.log(`ID=${id} ERROR=${evt}`);
        },
      });

      // Start frames counter
      framesIntervalRef.current = setInterval(() => {
        const fr = decoderRef.current?.framesRendered || 0;
        const fs = decoderRef.current?.framesSkipped || 0;
        framesRenderedRef.current = fr;
        framesSkippedRef.current = fs;
        setFramesRendered(fr);
        setFramesSkipped(fs);
      }, 1000);
    },
    [dispose, audioEncoder, videoEncoder, unpacker]
  );

  // Handle wheel events for scrolling
  const handleWheel = useCallback(
    (e: WheelEvent) => {
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
          screenWidth: width,
          screenHeight: height,
          pointerX: x,
          pointerY: y,
          scrollX: -e.deltaX / 100,
          scrollY: -e.deltaY / 100,
          buttons: 0,
        },
      });
    },
    [width, height, rotation, send]
  );

  // Inject touch events
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
        { width: widthRef.current, height: heightRef.current, rotation: rotationRef.current },
        rendererRef.current
      );

      const messages = hoverHelperRef.current.process({
        action,
        pointerId,
        screenWidth: width,
        screenHeight: height,
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
    },
    [width, height, rotation, send]
  );

  // Event handlers
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
    },
    [down]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      up(e.code);
    },
    [up]
  );

  // Connect/Disconnect handlers
  const handleConnect = useCallback(() => {
    start({ maxFps: DEAULT_MAX_FPS, bitRate: DEAULT_BIT_RATE });
  }, [start]);

  const handleDisconnect = useCallback(() => {
    dispose();
    setIsStreaming(false);
    setIsWsOpen(false);
  }, [dispose]);



  return (
    <div className="bg-background flex-1">
      <div className="container mx-auto">
        <div className="w-full flex flex-wrap gap-2">
          {selectedDevices.map((device, id) => (
            <div
            
              key={id}
              className="p-4 border min-w-[10rem] min-h-[15rem] transition-all duration-200"
              style={{
                width: `${screenScale * 2.5}px`,
                height: `${screenScale * 4}px`,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              <div className="text-xs text-center">{device.seri}</div>
            </div>
          ))}
          {/* <div
              ref={fullscreenRef}
              className="w-full h-full flex flex-col bg-black"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "black",
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              tabIndex={0}
            >
              <div
                ref={containerRef}
                className="flex-1"
                style={{
                  transform: `translate(${(rotatedWidth - width) / 2}px, ${(rotatedHeight - height) / 2
                    }px) rotate(${rotation * 90}deg)`,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                onContextMenu={handleContextMenu}
              />
            </div> */}
        </div>

        {/* Options and file list are temporarily disabled for performance-first view-only */}
      </div>
    </div>
  );
};

export default DeviceControlContainer;
