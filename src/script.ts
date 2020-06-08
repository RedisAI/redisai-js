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

  static NewScriptFromScriptGetReply(reply: any[]) {
    let device = null;
    let tag = null;
    let source = null;
    for (let i = 0; i < reply.length; i += 2) {
      const key = reply[i];
      const obj = reply[i + 1];
      switch (key.toString()) {
        case 'device':
          // @ts-ignore
          device = obj.toString();
          break;
        case 'tag':
          tag = obj.toString();
          break;
        case 'source':
          source = obj.toString();
          break;
      }
    }
    if (device == null || source == null) {
      const missingArr = [];
      if (device == null) {
        missingArr.push('device');
      }
      if (source == null) {
        missingArr.push('source');
      }
      throw Error(
        'AI.SCRIPTGET reply did not had the full elements to build the Script. Missing ' + missingArr.join(',') + '.',
      );
    }
    const script = new Script(device, source);
    if (tag !== null) {
      script.tag = tag;
    }
    return script;
  }

  scriptSetFlatArgs(keyName: string): string[] {
    const args: string[] = [keyName, this.device];
    if (this.tag !== undefined) {
      args.push('TAG');
      args.push(this.tag);
    }
    args.push('SOURCE');
    args.push(this.script);
    return args;
  }

  static scriptRunFlatArgs(scriptName: string, functionName: string, inputs: string[], outputs: string[]): string[] {
    const args: string[] = [scriptName, functionName, 'INPUTS'];
    inputs.forEach((value) => args.push(value));
    args.push('OUTPUTS');
    outputs.forEach((value) => args.push(value));
    return args;
  }

  static scriptGetFlatArgs(scriptName: string): string[] {
    const args: string[] = [scriptName, 'META', 'SOURCE'];
    return args;
  }
}
