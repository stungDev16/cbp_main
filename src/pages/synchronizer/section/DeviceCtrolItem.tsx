import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  ScrcpyAudioCodec,
} from "@yume-chan/scrcpy";
import { Packr, Unpackr } from "msgpackr";
import { DEAULT_BIT_RATE, DEAULT_MAX_FPS, PACK_OPTIONS } from "@/constants";
import { streamingService } from "@/apis/services/stream/streaming-service";
import { AacDecodeStream, OpusDecodeStream } from "@/lib/audio-decode-stream";
import { WebCodecsVideoDecoder } from "@yume-chan/scrcpy-decoder-webcodecs";
import { useDeviceControl } from "./_hook/useControlDevices";

/* eslint-disable @typescript-eslint/no-explicit-any */
function DeviceCtrolItem({ device, index }: { device: any, index: number }) {
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
  const startedRef = useRef(false);
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const rotationRef = useRef(0);
  const framesRenderedRef = useRef(0);
  const framesSkippedRef = useRef(0);
  const isStreamingRef = useRef(false);
  const isWsOpenRef = useRef(false);

  const packer = useMemo(() => new Packr(PACK_OPTIONS), []);
  const unpacker = useMemo(() => new Unpackr(PACK_OPTIONS), []);

  const send = useCallback(
    (message: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const record = packer.pack(message);
        wsRef.current.send(record);
      }
    },
    [packer]
  );
  // Sử dụng hook để xử lý sự kiện  
  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    handleContextMenu,
    handleKeyDown,
    handleKeyUp,
    handleWheel,
  } = useDeviceControl({
    send,
    widthRef,
    heightRef,
    rotationRef,
    rendererRef,
    fullscreenRef,
  });

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
  const start = useCallback(
    async ({ maxFps, bitRate, order_id }: { maxFps: number; bitRate: number; order_id: string }) => {
      await dispose();
      console.log(maxFps, bitRate,);
      const { data } = await streamingService.start_streaming({ order_id });
      abortControllerRef.current = new AbortController();
      isStreamingRef.current = true;
      const enableAudio = false;
      const audioEncoderObj = { codec: "off" } as any;

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

      // Setup event listeners - sử dụng handleWheel từ hook  
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

      // Setup audio streams (giữ nguyên logic audio)  
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
            }) as TransformStream<any, any>,
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
            (new OpusDecodeStream({
              codec: ScrcpyAudioCodec.OPUS.webCodecId,
              numberOfChannels: 2,
              sampleRate: 48000,
            }) as unknown) as TransformStream<any, any>,
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
          .catch(() => {
            if (abortControllerRef.current?.signal.aborted) {
              return;
            }
          });
      }
      if (enableAudio) {
        await audioPlayerRef.current?.start();
      }

      // Initialize WebSocket connection  
      wsRef.current = await streamingService.init({
        wsUri: data?.stream_url,
        order_id,
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

      framesIntervalRef.current = setInterval(() => {
        const fr = decoderRef.current?.framesRendered || 0;
        const fs = decoderRef.current?.framesSkipped || 0;
        framesRenderedRef.current = fr;
        framesSkippedRef.current = fs;
      }, 1000);
    },
    [dispose, unpacker, handleWheel, index]
  );

  // Cleanup wheel event listener  
  useEffect(() => {
    const currentRef = fullscreenRef.current;
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleWheel]);

  useEffect(() => {
    if (!startedRef.current && device) {
      startedRef.current = true;
      start({ maxFps: DEAULT_MAX_FPS, bitRate: DEAULT_BIT_RATE, order_id: device.id });
    }
    return () => {
      startedRef.current = false;
      dispose();
    };
  }, [device, start, dispose]);

  return (
    <div
      ref={fullscreenRef}
      tabIndex={index}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      // onClick={(e) => {
      //   e.stopPropagation();
      //   if (fullscreenRef.current) {
      //     fullscreenRef.current.classList.toggle("select");
      //   }
      // }}
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