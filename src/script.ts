/**
 * Direct mapping to RedisAI Script
 */

export class Script {
  /**
   *
   * @param device - the device that will execute the model. can be of CPU or GPU
   * @param script - a string containing TorchScript source code
   */
  constructor(device: string, script: string) {
    this._device = device;
    this._script = script;
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

  private _device: string;

  get device(): string {
    return this._device;
  }

  set device(value: string) {
    this._device = value;
  }

  private _script: string;

  get script(): string {
    return this._script;
  }

  set script(value: string) {
    this._script = value;
  }
}
