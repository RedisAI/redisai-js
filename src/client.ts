import { Callback, RedisClient } from 'redis';
import { Tensor } from './tensor';
import { Model } from './model';
import * as util from 'util';
import { DTypeMap } from './dtype';
import { Script } from './script';
import { Backend, BackendMap } from './backend';
import { Stats } from './stats';

export class Client {
  private _sendCommand: any;

  constructor(client: RedisClient) {
    this._client = client;
    this._sendCommand = util.promisify(this._client.send_command).bind(this._client);
  }

  private _client: RedisClient;

  get client(): RedisClient {
    return this._client;
  }

  public end(flush?: boolean) {
    this._client.end(flush);
  }

  public tensorset(keName: string, t: Tensor): Promise<any> {
    const args: any[] = [keName, t.dtype];
    t.shape.forEach((value) => args.push(value.toString()));
    if (t.data != null) {
      args.push('VALUES');
      t.data.forEach((value) => args.push(value.toString()));
    }
    return this._sendCommand('ai.tensorset', args);
  }

  public tensorget(keName: string): Promise<any> {
    const args: any[] = [keName, 'META', 'VALUES'];
    return this._sendCommand('ai.tensorget', args)
      .then((reply: any[]) => {
        let dt = null;
        let shape = null;
        let values = null;
        for (let i = 0; i < reply.length; i += 2) {
          const key = reply[i];
          const obj = reply[i + 1];
          switch (key.toString()) {
            case 'dtype':
              // @ts-ignore
              dt = DTypeMap[obj.toString()];
              break;
            case 'shape':
              shape = obj;
              break;
            case 'values':
              values = obj.map(Number);
              break;
          }
        }
        if (dt == null || shape == null || values == null) {
          throw Error('tensorget reply did not had the full elements to build the tensor');
        }
        return new Tensor(dt, shape, values);
      })
      .catch((error: any) => {
        throw error;
      });
  }

  public modelset(keName: string, m: Model): Promise<any> {
    let args: any[] = [keName, m.backend.toString(), m.device];
    if (m.tag !== undefined) {
      args.push('TAG');
      args.push(m.tag.toString());
    }
    if (m.inputs.length > 0) {
      args.push('INPUTS');
      m.inputs.forEach((value) => args.push(value));
    }
    if (m.outputs.length > 0) {
      args.push('OUTPUTS');
      m.outputs.forEach((value) => args.push(value));
    }
    args.push('BLOB');
    args.push(m.blob);
    return this._sendCommand('ai.modelset', args);
  }

  public modelrun(modelName: string, inputs: string[], outputs: string[]): Promise<any> {
    const args: any[] = [modelName, 'INPUTS'];
    inputs.forEach((value) => args.push(value));
    args.push('OUTPUTS');
    outputs.forEach((value) => args.push(value));
    return this._sendCommand('ai.modelrun', args);
  }

  public modeldel(modelName: string): Promise<any> {
    const args: any[] = [modelName];
    return this._sendCommand('ai.modeldel', args);
  }

  public modelget(modelName: string): Promise<any> {
    const args: any[] = [modelName, 'META', 'BLOB'];
    return this._sendCommand('ai.modelget', args)
      .then((reply: any[]) => {
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
          throw Error('modelget reply did not had the full elements to build the tensor');
        }
        const model = new Model(backend, device, [], [], blob);
        if (tag !== null) {
          model.tag = tag;
        }
        return model;
      })
      .catch((error: any) => {
        throw error;
      });
  }

  public scriptset(keName: string, s: Script): Promise<any> {
    const args: any[] = [keName, s.device];
    if (s.tag !== undefined) {
      args.push('TAG');
      args.push(s.tag);
    }
    args.push('SOURCE');
    args.push(s.script);
    return this._sendCommand('ai.scriptset', args);
  }

  public scriptrun(scriptName: string, functionName: string, inputs: string[], outputs: string[]): Promise<any> {
    const args: any[] = [scriptName, functionName, 'INPUTS'];
    inputs.forEach((value) => args.push(value));
    args.push('OUTPUTS');
    outputs.forEach((value) => args.push(value));
    return this._sendCommand('ai.scriptrun', args);
  }

  public scriptdel(scriptName: string): Promise<any> {
    const args: any[] = [scriptName];
    return this._sendCommand('ai.scriptdel', args);
  }

  public scriptget(scriptName: string): Promise<any> {
    const args: any[] = [scriptName, 'META', 'SOURCE'];
    return this._sendCommand('ai.scriptget', args)
      .then((reply: any[]) => {
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
          throw Error('scriptget reply did not had the full elements to build the tensor');
        }
        const script = new Script(device, source);
        if (tag !== null) {
          script.tag = tag;
        }
        return script;
      })
      .catch((error: any) => {
        throw error;
      });
  }

  /**
   * resets all statistics associated with the key
   * @param keyName
   */
  public infoResetStat(keyName: string): Promise<any> {
    const args: any[] = [keyName, 'RESETSTAT'];
    return this._sendCommand('ai.info', args);
  }

  /**
   * returns information about the execution a model or a script.
   * @param keyName
   */
  public info(keyName: string): Promise<any> {
    const args: any[] = [keyName];
    return this._sendCommand('ai.info', args)
      .then((reply: any[]) => {
        let keystr: string | null = null;
        let type: string | null = null;
        let backend: Backend | null = null;
        let device: string | null = null;
        let tag: string | null = null;
        let duration: number | null = null;
        let samples: number | null = null;
        let calls: number | null = null;
        let errors: number | null = null;
        for (let i = 0; i < reply.length; i += 2) {
          const key = reply[i];
          const obj = reply[i + 1];
          switch (key.toString()) {
            case 'key':
              keystr = obj.toString();
              break;
            case 'type':
              type = obj.toString();
              break;
            case 'backend':
              // @ts-ignore
              backend = BackendMap[obj.toString()];
              break;
            case 'device':
              // @ts-ignore
              device = obj.toString();
              break;
            case 'tag':
              tag = obj.toString();
              break;
            case 'duration':
              duration = obj;
              break;
            case 'samples':
              samples = obj;
              break;
            case 'calls':
              calls = obj;
              break;
            case 'errors':
              errors = obj;
              break;
          }
        }
        if (keystr == null || type == null || backend == null || device == null) {
          throw Error('ai.info reply did not had the full elements to build the tensor');
        }
        const stat = new Stats(keystr, type, backend, device);
        if (tag !== null) {
          stat.tag = tag;
        }
        if (duration !== null) {
          stat.duration = duration;
        }
        if (samples !== null) {
          stat.samples = samples;
        }
        if (calls !== null) {
          stat.calls = calls;
        }
        if (errors !== null) {
          stat.errors = errors;
        }
        return stat;
      })
      .catch((error: any) => {
        throw error;
      });
  }
}
