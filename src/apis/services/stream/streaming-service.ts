/* eslint-disable @typescript-eslint/no-explicit-any */
import Client, { type ApiResponse } from "@/apis/client";

interface StreamingOptions {
  // device?: string;
  // audio?: boolean;
  // audioCodec?: string;
  // audioEncoder?: string;
  // video?: boolean;
  // videoCodec?: string;
  // videoEncoder?: string;
  // videoBitRate?: number;
  // maxFps?: number;
  wsUri: string
  order_id: string
  onopen?: (ws: WebSocket, id: string, evt: Event) => void;
  onclose?: (ws: WebSocket, id: string, evt: CloseEvent) => void;
  onmessage?: (ws: WebSocket, id: string, evt: MessageEvent) => void;
  onerror?: (ws: WebSocket, id: string, evt: Event) => void;
}

class StreamingService {
  readonly #config: string = "/api/v1";

  ws?: WebSocket;

  async init(options: StreamingOptions): Promise<WebSocket> {
    this.ws = await this.initWs(options);
    return this.ws;
  }

  private async initWs(
    options: StreamingOptions,
  ): Promise<WebSocket> {
    const ws = new WebSocket(options.wsUri);
    ws.binaryType = "arraybuffer";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _reject) => {
      ws.onopen = (evt) => {
        options.onopen?.(ws, options.order_id, evt);
        resolve(ws);
      };
      ws.onclose = (evt) => options.onclose?.(ws, options.order_id, evt);
      ws.onmessage = (evt) => options.onmessage?.(ws, options.order_id, evt);
      ws.onerror = (evt) => options.onerror?.(ws, options.order_id, evt);
    });
  }

  start_streaming({
    id,
  }: {
    id: string;
  }): Promise<ApiResponse<any>> {
    return Client.post(`${this.#config}/startStream`, { order_id: id });
  }
}

export const streamingService = new StreamingService();
