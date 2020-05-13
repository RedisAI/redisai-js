import {RedisaiClient} from '../src/redisaiClient';
import {createClient} from "redis";
import {Tensor} from "../src/tensor";
import {DType} from "../src/DType";
import 'mocha';
import {expect} from 'chai';
import {Model} from "../src/Model";
import * as fs from "fs";
import {Backend} from "../src/Backend";

const mochaAsync = (fn: any) => {
    return (done: any) => {
        fn.call()
            .then(done, (err: Error) => {
                done(err);
            });
    };
};

it("ai.tensorset positive testing without data", mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new RedisaiClient(nativeClient);
    const tensor = new Tensor(DType.float32, [1, 1], null);
    const result = await aiclient.tensorset("t1", tensor);
    expect(result).to.equal('OK');
    aiclient.end(true);
}));

it("ai.tensorset positive testing with data", mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new RedisaiClient(nativeClient);
    const tensor = new Tensor(DType.float32, [1, 2], [3, 5]);
    const result = await aiclient.tensorset("t1", tensor);
    expect(result).to.equal('OK');
    aiclient.end(true);
}));


it("ai.tensorset negative testing", mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new RedisaiClient(nativeClient);
    const tensor = new Tensor(DType.float32, [-1, 1], null);
    try {
        const result = await aiclient.tensorset("t1", tensor);
    } catch (e) {
        expect(e.toString()).to.equal('ReplyError: ERR invalid or negative value found in tensor shape');
    }
    aiclient.end(true);
}));


it("ai.tensorset/ai.tensorget positive testing with data", mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new RedisaiClient(nativeClient);
    const tensor = new Tensor(DType.float32, [1, 2], [3, 5]);
    const result = await aiclient.tensorset("t1", tensor);
    expect(result).to.equal('OK');
    const tensorg = await aiclient.tensorget("t1");
    for (let i = 0; i < tensor.data.length; i++) {
        expect(tensorg.data[i]).to.equal(tensor.data[i]);
    }
    aiclient.end(true);
}));


it("ai.tensorset/ai.tensorget positive testing with default data", mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new RedisaiClient(nativeClient);
    const tensor = new Tensor(DType.float32, [1, 2], null);
    const result = await aiclient.tensorset("t1", tensor);
    expect(result).to.equal('OK');
    const tensorg = await aiclient.tensorget("t1");
    for (let i = 0; i < tensorg.data.length; i++) {
        expect(tensorg.data[i]).to.equal(0);
    }
    aiclient.end(true);
}));


it("ai.tensorget negative testing", mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new RedisaiClient(nativeClient);
    try {
        const result = await aiclient.tensorget("dontexist");
    } catch (e) {
        expect(e.toString()).to.equal('ReplyError: ERR tensor key is empty');
    }
    aiclient.end(true);
}));


it("ai.modelset positive testing", mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new RedisaiClient(nativeClient);
    let model_blob: Buffer = fs.readFileSync("./tests/test_data/graph.pb");
    const model = new Model(Backend.TF, "CPU", ["a", "b"], ["c"], model_blob);
    const result = await aiclient.modelset("m1", model);
    expect(result).to.equal('OK');
    aiclient.end(true);
}));

it("ai.modelrun positive testing", mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new RedisaiClient(nativeClient);


    const tensorA = new Tensor(DType.float32, [1, 2], [2, 3]);
    const resultA = await aiclient.tensorset("tensorA", tensorA);
    expect(resultA).to.equal('OK');

    const tensorB = new Tensor(DType.float32, [1, 2], [3, 5]);
    const resultB = await aiclient.tensorset("tensorB", tensorB);
    expect(resultB).to.equal('OK');


    let model_blob: Buffer = fs.readFileSync("./tests/test_data/graph.pb");
    const model = new Model(Backend.TF, "CPU", ["a", "b"], ["c"], model_blob);
    const resultModelSet = await aiclient.modelset("mymodel", model);
    expect(resultModelSet).to.equal('OK');

    const resultModelRun = await aiclient.modelrun("mymodel", ["tensorA","tensorB"], ["tensorC"]);
    expect(resultModelRun).to.equal('OK');

    const tensorC = await aiclient.tensorget("tensorC");
    expect(tensorC.data[0]).to.closeTo(6.0,0.1);
    expect(tensorC.data[1]).to.closeTo(15.0,0.1);

    aiclient.end(true);
}));
