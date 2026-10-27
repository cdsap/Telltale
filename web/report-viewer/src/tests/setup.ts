import { gunzipSync } from "node:zlib";
import "@testing-library/jest-dom/vitest";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverStub;
}

if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = () => "blob:test-csv";
}
if (typeof URL.revokeObjectURL !== "function") {
  URL.revokeObjectURL = () => {};
}

if (typeof globalThis.DecompressionStream !== "function") {
  globalThis.DecompressionStream = class DecompressionStream {
    readable: ReadableStream<Uint8Array>;
    writable: WritableStream<Uint8Array>;
    constructor(format: string) {
      if (format !== "gzip") {
        throw new TypeError(`Unsupported compression format: ${format}`);
      }
      const chunks: Uint8Array[] = [];
      let readableController!: ReadableStreamDefaultController<Uint8Array>;
      this.readable = new ReadableStream({
        start(controller) {
          readableController = controller;
        },
      });
      this.writable = new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        },
        close() {
          const total = chunks.reduce((n, c) => n + c.byteLength, 0);
          const input = new Uint8Array(total);
          let offset = 0;
          for (const chunk of chunks) {
            input.set(chunk, offset);
            offset += chunk.byteLength;
          }
          const output = gunzipSync(input);
          readableController.enqueue(new Uint8Array(output.buffer, output.byteOffset, output.byteLength));
          readableController.close();
        },
      });
    }
  } as typeof DecompressionStream;
}

if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }) as MediaQueryList;
}
