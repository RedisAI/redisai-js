import { Model } from './model';
import { Script } from './script';
import { Tensor } from './tensor';

export interface DagCommandInterface {
  tensorset(keyName: string, t: Tensor): DagCommandInterface;

  tensorget(keyName: string): DagCommandInterface;

  tensorget(keyName: string): DagCommandInterface;

  modelrun(modelName: string, inputs: string[], outputs: string[]): DagCommandInterface;

  scriptrun(scriptName: string, functionName: string, inputs: string[], outputs: string[]): DagCommandInterface;
}

/**
 * Direct mapping to RedisAI DAGs
 */
export class Dag implements DagCommandInterface {
  private _commands: any[][];
  private readonly _tensorgetflag: boolean[];

  constructor() {
    this._commands = [];
    this._tensorgetflag = [];
  }

  public tensorset(keyName: string, t: Tensor): Dag {
    const args: any[] = ['AI.TENSORSET'];
    t.tensorSetFlatArgs(keyName).forEach((arg) => args.push(arg));
    this._commands.push(args);
    this._tensorgetflag.push(false);
    return this;
  }

  public tensorget(keyName: string): Dag {
    const args: any[] = ['AI.TENSORGET'];
    Tensor.tensorGetFlatArgs(keyName).forEach((arg) => args.push(arg));
    this._commands.push(args);
    this._tensorgetflag.push(true);
    return this;
  }

  public modelrun(modelName: string, inputs: string[], outputs: string[]): Dag {
    const args: any[] = ['AI.MODELRUN'];
    Model.modelRunFlatArgs(modelName, inputs, outputs).forEach((arg) => args.push(arg));
    this._commands.push(args);
    this._tensorgetflag.push(false);
    return this;
  }

  public scriptrun(scriptName: string, functionName: string, inputs: string[], outputs: string[]): Dag {
    const args: any[] = ['AI.SCRIPTRUN'];
    Script.scriptRunFlatArgs(scriptName, functionName, inputs, outputs).forEach((arg) => args.push(arg));
    this._commands.push(args);
    this._tensorgetflag.push(false);
    return this;
  }

  public dagRunFlatArgs(loadKeys: string[] | null, persistKeys: string[] | null): string[] {
    const args: any[] = [];
    if (loadKeys != null && loadKeys.length > 0) {
      args.push('LOAD');
      args.push(loadKeys.length);
      loadKeys.forEach((value) => args.push(value));
    }
    if (persistKeys != null && persistKeys.length > 0) {
      args.push('PERSIST');
      args.push(persistKeys.length);
      persistKeys.forEach((value) => args.push(value));
    }
    this._commands.forEach((value) => {
      args.push('|>');
      value.forEach((arg) => args.push(arg));
    });
    return args;
  }

  public ProcessDagReply(reply: any[]): any[] {
    for (let i = 0; i < reply.length; i++) {
      if (this._tensorgetflag[i] === true) {
        reply[i] = Tensor.NewTensorFromTensorGetReply(reply[i]);
      }
    }
    return reply;
  }
}
