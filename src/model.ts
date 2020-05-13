/**
 * Direct mapping to RedisAI Model
 */
import { Backend } from './backend';

export class Model {
  constructor(backend: Backend, device: string, inputs: string[], outputs: string[], blob: Buffer | undefined) {
    this._backend = backend;
    this._device = device;
    this._inputs = inputs;
    this._outputs = outputs;
    this._blob = blob;
  }

  private _backend: Backend;

  get backend(): Backend {
    return this._backend;
  }

  set backend(value: Backend) {
    this._backend = value;
  }

  private _device: string;

  get device(): string {
    return this._device;
  }

  set device(value: string) {
    this._device = value;
  }

  private _inputs: string[];

  get inputs(): string[] {
    return this._inputs;
  }

  set inputs(value: string[]) {
    this._inputs = value;
  }

  private _outputs: string[];

  get outputs(): string[] {
    return this._outputs;
  }

  set outputs(value: string[]) {
    this._outputs = value;
  }

  private _blob: Buffer | undefined;

  get blob(): Buffer | undefined {
    return this._blob;
  }

  set blob(value: Buffer | undefined) {
    this._blob = value;
  }
}
