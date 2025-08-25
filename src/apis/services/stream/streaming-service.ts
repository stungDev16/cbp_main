import { v4 as uuid } from "uuid";  
  
interface StreamingOptions {  
  device?: string;  
  audio?: boolean;  
  audioCodec?: string;  
  audioEncoder?: string;  
  video?: boolean;  
  videoCodec?: string;  
  videoEncoder?: string;  
  videoBitRate?: number;  
  maxFps?: number;  
  onopen?: (ws: WebSocket, id: string, evt: Event) => void;  
  onclose?: (ws: WebSocket, id: string, evt: CloseEvent) => void;  
  onmessage?: (ws: WebSocket, id: string, evt: MessageEvent) => void;  
  onerror?: (ws: WebSocket, id: string, evt: Event) => void;  
}  
  
class StreamingService {  
  ws?: WebSocket;  
  
  async init(options: StreamingOptions): Promise<WebSocket> {  
    const id = uuid();  
    this.ws = await this.initWs(options, id.toString());  
    return this.ws;  
  }  
  
  private async initWs(options: StreamingOptions, id: string): Promise<WebSocket> {  
    const base = (import.meta as any).env?.VITE_SERVER_WS_URL ||
      (typeof window !== "undefined"
        ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`
        : "");
    const wsUri = `${base}/?id=${id}&device=${options.device}&audio=${options.audio}${options.audio ? `&audioCodec=${options.audioCodec}&audioEncoder=${options.audioEncoder}` : ""}&video=${options.video}${options.video ? `&videoCodec=${options.videoCodec}&videoEncoder=${options.videoEncoder}&maxFps=${options.maxFps}&videoBitRate=${options.videoBitRate}` : ""}`;  
      
    const ws = new WebSocket(wsUri);  
    console.log("wsUri", wsUri);
    
    ws.binaryType = "arraybuffer";  
      
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _reject) => {  
      ws.onopen = (evt) => {  
        options.onopen?.(ws, id, evt);  
        resolve(ws);  
      };  
      ws.onclose = (evt) => options.onclose?.(ws, id, evt);  
      ws.onmessage = (evt) => options.onmessage?.(ws, id, evt);  
      ws.onerror = (evt) => options.onerror?.(ws, id, evt);  
    });  
  }  
}  
  
export const streamingService = new StreamingService();