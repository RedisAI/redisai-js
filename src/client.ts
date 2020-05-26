import { RedisClient } from 'redis';
import { Tensor } from './tensor';
import { Model } from './model';
import * as util from 'util';
import { Script } from './script';
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
      if (t.data instanceof Buffer) {
        args.push('BLOB');
        args.push(t.data);
      } else {
        args.push('VALUES');
        t.data.forEach((value) => args.push(value.toString()));
      }
    }
    return this._sendCommand('ai.tensorset', args);
  }

  public tensorget(keName: string): Promise<any> {
    const args: any[] = [keName, 'META', 'VALUES'];
    return this._sendCommand('ai.tensorget', args)
      .then((reply: any[]) => {
        return Tensor.NewTensorFromTensorGetReply(reply);
      })
      .catch((error: any) => {
        throw error;
      });
  }

  public modelset(keyName: string, m: Model): Promise<any> {
    const args: any[] = m.modelSetFlatArgs(keyName);
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
        return Model.NewModelFromModelGetReply(reply);
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
        return Script.NewScriptFromScriptGetReply(reply);
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
        return Stats.NewStatsFromInfoReply(reply);
      })
      .catch((error: any) => {
        throw error;
      });
  }

  /**
   * Loads the DL/ML backend specified by the backend identifier from path.
   *
   * @param backend
   * @param path
   */
  public configLoadBackend(backend: string, path: string): Promise<any> {
    const args: any[] = ['LOADBACKEND', backend, path];
    return this._sendCommand('ai.config', args);
  }

  /**
   * Specifies the default base backends path to path.
   *
   * @param path
   */
  public configBackendsPath(path: string): Promise<any> {
    const args: any[] = ['BACKENDSPATH', path];
    return this._sendCommand('ai.config', args);
  }
}
