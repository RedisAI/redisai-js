import { Model } from './model';
import { DagScriptExecuteOptions, Script } from './script';
import { Tensor } from './tensor';
import { optionalArgument, variadicArgument } from './util';

export interface DagCommandInterface {
  tensorset(keyName: string, t: Tensor): DagCommandInterface;

  tensorget(keyName: string): DagCommandInterface;

  tensorget(keyName: string): DagCommandInterface;

  /** @deprecated */
  modelrun(modelName: string, inputs: string[], outputs: string[]): DagCommandInterface;

  modelexecute(modelName: string, inputs: string[], outputs: string[], timeout?: number): DagCommandInterface;

  /** @deprecated */
  scriptrun(scriptName: string, functionName: string, inputs: string[], outputs: string[]): DagCommandInterface;

  scriptexecute(scriptName: string, functionName: string, options: DagScriptExecuteOptions): DagCommandInterface;
}

export interface DagExecuteReadOnlyOptions {
  load?: string[];
  keys?: string[];
  timeout?: number;
}

export interface DagExecuteOptions extends DagExecuteReadOnlyOptions {
  persist?: string[];
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

  /** @deprecated */
  public modelrun(modelName: string, inputs: string[], outputs: string[]): Dag {
    const args: any[] = ['AI.MODELRUN'];
    Model.modelRunFlatArgs(modelName, inputs, outputs).forEach((arg) => args.push(arg));
    this._commands.push(args);
    this._tensorgetflag.push(false);
    return this;
  }

  public modelexecute(modelName: string, inputs: string[], outputs: string[], timeout?: number): Dag {
    this._commands.push([
      'AI.MODELEXECUTE',
      ...Model.modelExecuteFlatArgs(modelName, inputs, outputs, timeout)
    ]);
    this._tensorgetflag.push(false);
    return this;
  }

  /** @deprecated */
  public scriptrun(scriptName: string, functionName: string, inputs: string[], outputs: string[]): Dag {
    const args: any[] = ['AI.SCRIPTRUN'];
    Script.scriptRunFlatArgs(scriptName, functionName, inputs, outputs).forEach((arg) => args.push(arg));
    this._commands.push(args);
    this._tensorgetflag.push(false);
    return this;
  }

  public scriptexecute(scriptName: string, functionName: string, options?: DagScriptExecuteOptions): Dag {
    this._commands.push([
      'AI.SCRIPTEXECUTE',
      ...Script.dagScriptExecuteFlatArgs(scriptName, functionName, options)
    ]);
    this._tensorgetflag.push(false);
    return this;
  }

  /** @deprecated */
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

  public dagExecuteFlatArgs(options: DagExecuteOptions): string[] {
    const args: string[] = [
      ...variadicArgument('LOAD', options.load),
      ...variadicArgument('PERSIST', options.persist),
      ...variadicArgument('KEYS', options.keys),
      ...optionalArgument('TIMEOUT', options.timeout)
    ];

    for (const command of this._commands) {
      args.push('|>', ...command);
    }

    return args;
  }

  public dagExecuteReadOnlyFlatArgs(options: DagExecuteReadOnlyOptions): string[] {
    const args: any[] = [
      ...variadicArgument('LOAD', options.load),
      ...variadicArgument('KEYS', options.keys),
      ...optionalArgument('TIMEOUT', options.timeout)
    ];

    for (const command of this._commands) {
      args.push('|>', ...command);
    }

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
