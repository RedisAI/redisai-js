import { RedisClient } from 'redis';
import { Tensor } from './tensor';
import { Model } from './model';
import * as util from 'util';
import { Script } from './script';
import { Stats } from './stats';
import { Dag, DagCommandInterface } from './dag';

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
    const args: any[] = t.tensorSetFlatArgs(keName);
    return this._sendCommand('ai.tensorset', args);
  }

  public tensorget(keyName: string): Promise<any> {
    const args: any[] = Tensor.tensorGetFlatArgs(keyName);
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
    const args: any[] = Model.modelRunFlatArgs(modelName, inputs, outputs);
    return this._sendCommand('ai.modelrun', args);
  }

  public modeldel(modelName: string): Promise<any> {
    const args: any[] = [modelName];
    return this._sendCommand('ai.modeldel', args);
  }

  public modelget(modelName: string): Promise<any> {
    const args: any[] = Model.modelGetFlatArgs(modelName);
    return this._sendCommand('ai.modelget', args)
      .then((reply: any[]) => {
        return Model.NewModelFromModelGetReply(reply);
      })
      .catch((error: any) => {
        throw error;
      });
  }

  public scriptset(keyName: string, s: Script): Promise<any> {
    const args: any[] = s.scriptSetFlatArgs(keyName);
    return this._sendCommand('ai.scriptset', args);
  }

  public scriptrun(scriptName: string, functionName: string, inputs: string[], outputs: string[]): Promise<any> {
    const args: any[] = Script.scriptRunFlatArgs(scriptName, functionName, inputs, outputs);
    return this._sendCommand('ai.scriptrun', args);
  }

  public scriptdel(scriptName: string): Promise<any> {
    const args: any[] = [scriptName];
    return this._sendCommand('ai.scriptdel', args);
  }

  public scriptget(scriptName: string): Promise<any> {
    const args: any[] = Script.scriptGetFlatArgs(scriptName);
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

  public dagrun(loadKeys: string[] | null, persistKeys: string[] | null, dag: Dag): Promise<any> {
    const args: any[] = dag.dagRunFlatArgs(loadKeys, persistKeys);
    return this._sendCommand('ai.dagrun', args)
      .then((reply: any[]) => {
        return dag.ProcessDagReply(reply);
      })
      .catch((error: any) => {
        throw error;
      });
  }

  public dagrun_ro(loadKeys: string[] | null, dag: Dag): Promise<any> {
    const args: any[] = dag.dagRunFlatArgs(loadKeys, null);
    return this._sendCommand('ai.dagrun_ro', args)
      .then((reply: any[]) => {
        return dag.ProcessDagReply(reply);
      })
      .catch((error: any) => {
        throw error;
      });
  }
}
