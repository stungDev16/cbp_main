import { memo, useCallback, useEffect, useMemo, useRef } from "react";
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
import { mapClientToDevicePosition } from "@/lib/mapClientToDevicePosition";
import { Packr, Unpackr } from "msgpackr";
import { DEAULT_BIT_RATE, DEAULT_MAX_FPS, PACK_OPTIONS } from "@/constants";
import { streamingService } from "@/apis/services/stream/streaming-service";
import { AacDecodeStream, OpusDecodeStream } from "@/lib/audio-decode-stream";
import { TinyH264Decoder } from "@yume-chan/scrcpy-decoder-tinyh264";
import { WebCodecsVideoDecoder } from "@yume-chan/scrcpy-decoder-webcodecs";


const MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON = [
  AndroidMotionEventButton.Primary,
  AndroidMotionEventButton.Tertiary,
  AndroidMotionEventButton.Secondary,
  AndroidMotionEventButton.Back,
  AndroidMotionEventButton.Forward,
];
/* eslint-disable @typescript-eslint/no-explicit-any */
function DeviceCtrolItem({ device, index }: { device: any, index: number }) {
  console.log(JSON.parse(JSON.parse(device.metadata)).encoders);
  
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
  const controlLeftRef = useRef(false)
  const controlRightRef = useRef(false)
  const shiftLeftRef = useRef(false)
  const shiftRightRef = useRef(false)
  const altLeftRef = useRef(false)
  const altRightRef = useRef(false)
  const metaLeftRef = useRef(false)
  const metaRightRef = useRef(false)
  const capsLockRef = useRef(false)
  const numLockRef = useRef(true)
  const keysRef = useRef(new Set<number>());


  const packer = useMemo(() => new Packr(PACK_OPTIONS), []);
  const unpacker = useMemo(() => new Unpackr(PACK_OPTIONS), []);
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

  // Get meta state for key events
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
  }, [altLeftRef, altRightRef, shiftLeftRef, shiftRightRef, controlLeftRef, controlRightRef, metaLeftRef, metaRightRef, capsLockRef, numLockRef]);


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

  // Key up handler
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

  // Reset all keys
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
    },
    [widthRef, heightRef, rotationRef, send]
  );
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
    [widthRef, heightRef, rotationRef, send]
  );
  const start = useCallback(
    async ({ maxFps, bitRate }: { maxFps: number; bitRate: number }) => {
      await dispose();

      abortControllerRef.current = new AbortController();
      isStreamingRef.current = true;
      const enableAudio = false;
      const audioEncoderObj = { codec: "off" } as any;
      // Choose video encoder similar to Vue: prefer h264 if available
      // let vEnc: any = videoEncoder;
      // // If store doesn't keep encoder object, try derive from metainfo in adb slice
      // // fallback to h264
      // decoderRef.current = new TinyH264Decoder();
      decoderRef.current = new WebCodecsVideoDecoder(0x68_32_36_34, false);

      // Setup renderer
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
        device: device.serial_number,
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
          isWsOpenRef.current = true;
        },
        onclose: (ws: WebSocket, id: string, evt: CloseEvent) => {
          console.log(`ID=${id} DISCONNECTED`);
          isWsOpenRef.current = false;
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
        framesRenderedRef.current = fr;
        framesSkippedRef.current = fs;
      }, 1000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispose, unpacker]
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
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      start({ maxFps: DEAULT_MAX_FPS, bitRate: DEAULT_BIT_RATE });
    }
    return () => {
      startedRef.current = false;
      dispose();
    };
  })


  return <div
    ref={fullscreenRef}
    className="border flex bg-black transition-all duration-200"
    tabIndex={index}
    onKeyDown={handleKeyDown}
    onKeyUp={handleKeyUp}
  >
    <div ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={handleContextMenu}
    />
  </div>;
}
export default memo(DeviceCtrolItem);