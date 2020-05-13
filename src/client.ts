import { RedisClient } from 'redis';
import { Tensor } from './tensor';
import { Model } from './model';
import * as util from 'util';
import { DTypeMap } from './dtype';

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
    const args = [keName, t.dtype];
    t.shape.forEach((value) => args.push(value.toString()));
    if (t.data != null) {
      args.push('VALUES');
      t.data.forEach((value) => args.push(value.toString()));
    }
    return this._sendCommand('ai.tensorset', args);
  }

  public tensorget(keName: string): Promise<any> {
    const args = [keName, 'META', 'VALUES'];
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
    const args = [keName, m.backend, m.device];
    if (m.inputs.length > 0) {
      args.push('INPUTS');
      m.inputs.forEach((value) => args.push(value));
    }
    if (m.outputs.length > 0) {
      args.push('OUTPUTS');
      m.outputs.forEach((value) => args.push(value));
    }
    args.push('BLOB');
    args.push(m.blob.toString());
    return this._sendCommand('ai.modelset', args);
  }

  public modelrun(modelName: string, inputs: string[], outputs: string[]): Promise<any> {
    const args = [modelName, 'INPUTS'];
    inputs.forEach((value) => args.push(value));
    args.push('OUTPUTS');
    outputs.forEach((value) => args.push(value));
    return this._sendCommand('ai.modelrun', args);
  }
}
