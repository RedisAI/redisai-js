import {RedisClient} from "redis";
import {Tensor} from "./tensor";
import * as util from 'util';
import {DTypeMap} from "./DType";

export class RedisaiClient {
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
        t.shape.forEach(value => args.push(value.toString()));
        if (t.data != null) {
            args.push("VALUES");
            t.data.forEach(value => args.push(value.toString()));
        }
        return this._sendCommand("ai.tensorset", args);
    }

    public tensorget(keName: string): Promise<any> {
        const args = [keName, "META", "VALUES"];
        return this._sendCommand("ai.tensorget", args).then((reply) => {
            const tensor = new Tensor(DTypeMap[reply[1]], reply[3], reply[5].map(Number));
            return tensor;
        })
            .catch((error) => {
                throw error;
            });
    }
}