import { RedisClient } from 'redis';
import { Tensor } from './tensor';
import { Model } from './model';
import * as util from 'util';
import { Script, ScriptExecuteOptions } from './script';
import { Stats } from './stats';
import { Dag, DagExecuteOptions, DagExecuteReadOnlyOptions } from './dag';

interface ClientOptions {
  // https://oss.redislabs.com/redisai/commands/#aimodelset
  // "Since Redis supports strings up to 512MB, blobs for very large models need to be chunked"
  protoMaxBulkLength?: number
}

export class Client {
  private readonly _sendCommand: any;

  private readonly _protoMaxBulkLength: number;

  constructor(client: RedisClient, { protoMaxBulkLength }: ClientOptions = {}) {
    this._client = client;
    this._sendCommand = util.promisify(this._client.send_command).bind(this._client);
    this._protoMaxBulkLength = protoMaxBulkLength;
  }

  private readonly _client: RedisClient;

  get client(): RedisClient {
    return this._client;
  }

  public end(flush?: boolean) {
    this._client.end(flush);
  }

  public tensorset(keyName: string, t: Tensor): Promise<any> {
    const args: any[] = t.tensorSetFlatArgs(keyName);
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

  /**
   * @deprecated since 1.2, use modelstore instead
   */
  public modelset(keyName: string, m: Model): Promise<any> {
    const args: any[] = m.modelSetFlatArgs(keyName);
    return this._sendCommand('ai.modelset', args);
  }

  public modelstore(key: string, m: Model): Promise<any> {
    const args: any[] = m.modelStoreFlatArgs(key);
    return this._sendCommand('ai.modelstore', args);
  }

  /**
   * @deprecated since 1.2, use modelexecute instead
   */
  public modelrun(modelName: string, inputs: string[], outputs: string[]): Promise<any> {
    const args: any[] = Model.modelRunFlatArgs(modelName, inputs, outputs);
    return this._sendCommand('ai.modelrun', args);
  }

  public modelexecute(key: string, inputs: string[], outputs: string[], timeout?: number): Promise<any> {
    const args: string[] = Model.modelExecuteFlatArgs(key, inputs, outputs, timeout);
    return this._sendCommand('ai.modelexecute', args);
  }

  public modeldel(modelName: string): Promise<any> {
    const args: any[] = [modelName];
    return this._sendCommand('ai.modeldel', args);
  }

  public modelget(modelName: string): Promise<any> {
    const args: any[] = Model.modelGetFlatArgs(modelName);
    return this._sendCommand('ai.modelget', args)
      .then((reply: any[]) => {
        return Model.NewModelFromModelGetReply(reply, this._protoMaxBulkLength);
      })
      .catch((error: any) => {
        throw error;
      });
  }

  public scriptset(keyName: string, s: Script): Promise<any> {
    const args: any[] = s.scriptSetFlatArgs(keyName);
    return this._sendCommand('ai.scriptset', args);
  }

  /**
   * @deprecated since 1.2, use scriptexecute instead
   */
  public scriptrun(scriptName: string, functionName: string, inputs: string[], outputs: string[]): Promise<any> {
    const args: any[] = Script.scriptRunFlatArgs(scriptName, functionName, inputs, outputs);
    return this._sendCommand('ai.scriptrun', args);
  }

  public scriptexecute(key: string, functionName: string, options: ScriptExecuteOptions): Promise<any> {
    const args: string[] = Script.scriptExecuteFlatArgs(key, functionName, options);
    return this._sendCommand('ai.scriptexecute', args);
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

  /**
   * specifies a direct acyclic graph of operations to run within RedisAI
   * @deprecated since 1.2, use dagexecute instead
   *
   * @param loadKeys
   * @param persistKeys
   * @param dag
   */
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

  /**
   * specifies a direct acyclic graph of operations to run within RedisAI
   */
  public async dagexecute(options: DagExecuteOptions, dag: Dag): Promise<any> {
    const args = dag.dagExecuteFlatArgs(options);
    const reply = await this._sendCommand('AI.DAGEXECUTE', args);
    return dag.ProcessDagReply(reply);
  }

  /**
   * specifies a Read Only direct acyclic graph of operations to run within RedisAI
   * @deprecated since 1.2, use dagexecute_ro instead
   *
   * @param loadKeys
   * @param dag
   */
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

  public async dagexecute_ro(options: DagExecuteReadOnlyOptions, dag: Dag): Promise<any> {
    const args = dag.dagExecuteReadOnlyFlatArgs(options);
    const reply = await this._sendCommand('AI.DAGEXECUTE_RO', args);
    return dag.ProcessDagReply(reply);
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
