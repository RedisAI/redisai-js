/**
 * Direct mapping to RedisAI Model
 */
import { Backend, BackendMap } from './backend';

export class Model {
  /**
   *
   * @param backend - the backend for the model. can be one of TF, TFLITE, TORCH or ONNX
   * @param device - the device that will execute the model. can be of CPU or GPU
   * @param inputs - one or more names of the model's input nodes (applicable only for TensorFlow models)
   * @param outputs - one or more names of the model's output nodes (applicable only for TensorFlow models)
   * @param blob - the Protobuf-serialized model
   */
  constructor(backend: Backend, device: string, inputs: string[], outputs: string[], blob: Buffer | undefined) {
    this._backend = backend;
    this._device = device;
    this._inputs = inputs;
    this._outputs = outputs;
    this._blob = blob;
    this._tag = undefined;
  }

  // tag is an optional string for tagging the model such as a version number or any arbitrary identifier
  private _tag: string | undefined;

  get tag(): string | undefined {
    return this._tag;
  }

  /**
   * sets an optional string for tagging the model such as a version number or any arbitrary identifier
   * @param value
   */
  set tag(value: string | undefined) {
    this._tag = value;
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

  static NewModelFromModelGetReply(reply: any[]) {
    let backend = null;
    let device = null;
    let tag = null;
    let blob = null;
    for (let i = 0; i < reply.length; i += 2) {
      const key = reply[i];
      const obj = reply[i + 1];
      switch (key.toString()) {
        case 'backend':
          backend = BackendMap[obj.toString()];
          break;
        case 'device':
          // @ts-ignore
          device = obj.toString();
          break;
        case 'tag':
          tag = obj.toString();
          break;
        case 'blob':
          // blob = obj;
          blob = Buffer.from(obj);
          break;
      }
    }
    if (backend == null || device == null || blob == null) {
      const missingArr = [];
      if (backend == null) {
        missingArr.push('backend');
      }
      if (device == null) {
        missingArr.push('device');
      }
      if (blob == null) {
        missingArr.push('blob');
      }
      throw Error(
        'AI.MODELGET reply did not had the full elements to build the Model. Missing ' + missingArr.join(',') + '.',
      );
    }
    const model = new Model(backend, device, [], [], blob);
    if (tag !== null) {
      model.tag = tag;
    }
    return model;
  }
}
