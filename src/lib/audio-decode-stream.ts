import { TransformStream } from "@yume-chan/stream-extra";

interface AudioChunk {
  type: "configuration" | "data";
  data: ArrayBuffer | Uint8Array;
}

interface AudioDecoderConfig {
  codec: string;
  numberOfChannels: number;
  sampleRate: number;
  description?: ArrayBuffer | Uint8Array;
}

interface AudioDecoderInit {
  error: (error: DOMException) => void;
  output: (output: AudioData) => void;
}

interface AudioCopyToOptions {
  format: "f32-planar" | "f32";
  planeIndex: number;
}

export class AacDecodeStream extends TransformStream<
  AudioChunk,
  Float32Array[]
> {
  constructor(config: AudioDecoderConfig) {
    let decoder: AudioDecoder;

    super({
      start(controller) {
        decoder = new AudioDecoder({
          error(error) {
            console.log('audio decoder error: ', error)
            controller.error(error)
          },
          output(output) {
            controller.enqueue(
              Array.from({ length: 2 }, (_, i) => {
                const options = {
                  // AAC decodes to "f32-planar",
                  // converting to another format may cause audio glitches on Chrome.
                  format: 'f32-planar',
                  planeIndex: i,
                }
                const buffer = new Float32Array(
                  output.allocationSize(options as any) /
                  Float32Array.BYTES_PER_ELEMENT,
                )
                output.copyTo(buffer, options as any)
                return buffer
              }),
            )
          },
        })
      },
      transform(chunk) {
        switch (chunk.type) {
          case 'configuration':
            // https://www.w3.org/TR/webcodecs-aac-codec-registration/#audiodecoderconfig-description
            // Raw AAC stream needs `description` to be set.
            decoder.configure({
              ...config,
              description: chunk.data,
            })
            break
          case 'data':
            decoder.decode(
              new EncodedAudioChunk({
                data: chunk.data,
                type: 'key',
                timestamp: 0,
              }),
            )
        }
      },
      async flush() {
        if (decoder) {
          await decoder.flush()
        }
      },
    })
  }
}

export class OpusDecodeStream extends TransformStream<
  AudioChunk,
  Float32Array
> {
  constructor(config: AudioDecoderConfig) {
    let decoder: AudioDecoder;

    super({
      start(controller: TransformStreamDefaultController<Float32Array>) {
        decoder = new AudioDecoder({
          error(error: DOMException) {
            console.log("audio decoder error: ", error);
            controller.error(error);
          },
          output(output: AudioData) {
            // Opus decodes to "f32",
            // converting to another format may cause audio glitches on Chrome.
            const options: AudioCopyToOptions = {
              format: "f32",
              planeIndex: 0,
            };
            const buffer = new Float32Array(
              output.allocationSize(options) / Float32Array.BYTES_PER_ELEMENT
            );
            output.copyTo(buffer, options);
            controller.enqueue(buffer);
          },
        } as AudioDecoderInit);
        decoder.configure(config);
      },
      transform(chunk: AudioChunk) {
        switch (chunk.type) {
          case "configuration":
            // configuration data is a opus-in-ogg identification header,
            // but stream data is raw opus,
            // so it has no use here.
            break;
          case "data": {
            const dataLength =
              chunk.data instanceof Uint8Array
                ? chunk.data.length
                : chunk.data.byteLength;
            if (dataLength === 0) {
              break;
            }
            decoder.decode(
              new EncodedAudioChunk({
                type: "key",
                timestamp: 0,
                data: chunk.data,
              })
            );
          }
        }
      },
      async flush() {
        if (decoder) {
          await decoder.flush();
        }
      },
    });
  }
}
