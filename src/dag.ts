interface DagCommandInterface {
  modelrun(modelName: string, inputs: string[], outputs: string[]);
}

/**
 * Direct mapping to RedisAI DAGs
 */
export class Dag {
  private _commands: any[][];
}
