import type {
  KVNamespace,
  KVNamespaceGetOptions,
  KVNamespaceListOptions,
  KVNamespaceListResult,
  KVNamespacePutOptions,
} from '@cloudflare/workers-types';
import { BunSqliteKeyValue } from 'bun-sqlite-key-value';

import { OPEN_GSIO_DATA_DIR } from '../../vars.ts';

interface BaseKV extends KVNamespace {}

interface _Options {
  namespace: string;
  path: string;
}

const defaultOptions = {
  namespace: 'open-gsio',
  path: OPEN_GSIO_DATA_DIR,
};

export class BunSqliteKVNamespace implements BaseKV {
  private db: any;

  constructor(options?: { namespace?: string; path?: string }) {
    const merged = { ...defaultOptions, ...options };
    const { namespace, path } = merged;

    this.db = new BunSqliteKeyValue(`${path}/${namespace}`);
  }

  async delete(key: string): Promise<void> {
    await this.db.delete(key);
  }

  async get(
    key: string | Array<string>,
    options?:
      | Partial<KVNamespaceGetOptions<undefined>>
      | 'text'
      | 'json'
      | 'arrayBuffer'
      | 'stream'
      | KVNamespaceGetOptions<'text'>
      | KVNamespaceGetOptions<'json'>
      | KVNamespaceGetOptions<'arrayBuffer'>
      | KVNamespaceGetOptions<'stream'>
      | 'text'
      | 'json',
  ): Promise<any> {
    if (Array.isArray(key)) {
      const result = new Map();
      for (const k of key) {
        const value = await this.db.get(k);
        result.set(k, value);
      }
      return result;
    }

    const value = await this.db.get(key);
    if (value === undefined) return null;

    if (
      !options ||
      options === 'text' ||
      (typeof options === 'object' && options.type === 'text')
    ) {
      return value;
    }
    if (options === 'json' || (typeof options === 'object' && options.type === 'json')) {
      return JSON.parse(value);
    }
    if (
      options === 'arrayBuffer' ||
      (typeof options === 'object' && options.type === 'arrayBuffer')
    ) {
      return new TextEncoder().encode(value).buffer;
    }
    if (options === 'stream' || (typeof options === 'object' && options.type === 'stream')) {
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(value));
          controller.close();
        },
      });
    }
    return value;
  }

  getWithMetadata(_key: string | Array<string>, _options?: any): any {
    return null;
  }

  async list<Metadata = unknown>(
    _options?: KVNamespaceListOptions,
  ): Promise<KVNamespaceListResult<Metadata, string>> {
    const keys = await this.db.keys();
    return {
      keys: keys.map(key => ({ name: key })),
      list_complete: true,
      cursor: '',
    };
  }

  async put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    _options?: KVNamespacePutOptions,
  ): Promise<void> {
    if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
      value = new TextDecoder().decode(value);
    } else if (value instanceof ReadableStream) {
      const reader = value.getReader();
      const chunks = [];
      let readDone = false;
      while (!readDone) {
        const { done, value } = await reader.read();
        if (done) {
          readDone = true;
        } else {
          chunks.push(value);
        }
      }
      value = new TextDecoder().decode(new Uint8Array(Buffer.concat(chunks)));
    }
    await this.db.set(key, value);
  }
}
