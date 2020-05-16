import { Client } from '../src/client';
import { createClient } from 'redis';
import { Tensor } from '../src/tensor';
import { Dtype } from '../src/dtype';
import 'mocha';
import { expect } from 'chai';
import { Model } from '../src/model';
import * as fs from 'fs';
import { Backend } from '../src/backend';
import { Script } from '../src/script';
import { Helpers } from '../src';
// tslint:disable-next-line:no-var-requires
const Jimp = require('jimp');

const mochaAsync = (fn: any) => {
  return (done: any) => {
    fn.call().then(done, (err: Error) => {
      done(err);
    });
  };
};

it(
  'ai.tensorset positive testing without data',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const tensor = new Tensor(Dtype.float32, [1, 1], null);
    const result = await aiclient.tensorset('t1', tensor);
    expect(result).to.equal('OK');
    aiclient.end(true);
  }),
);

it(
  'ai.tensorset positive testing with data',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const tensor = new Tensor(Dtype.float32, [1, 2], [3, 5]);
    const result = await aiclient.tensorset('t1', tensor);
    expect(result).to.equal('OK');
    aiclient.end(true);
  }),
);

it(
  'ai.tensorset negative testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const tensor = new Tensor(Dtype.float32, [-1, 1], null);
    try {
      const result = await aiclient.tensorset('t1', tensor);
    } catch (e) {
      expect(e.toString()).to.equal('ReplyError: ERR invalid or negative value found in tensor shape');
    }
    aiclient.end(true);
  }),
);

it(
  'ai.tensorset/ai.tensorget positive testing with data',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const tensor = new Tensor(Dtype.float32, [1, 2], [3, 5]);
    const result = await aiclient.tensorset('t1', tensor);
    expect(result).to.equal('OK');
    const tensorg = await aiclient.tensorget('t1');
    for (let i = 0; i < tensor.data.length; i++) {
      expect(tensorg.data[i]).to.equal(tensor.data[i]);
    }
    aiclient.end(true);
  }),
);

it(
  'ai.tensorset/ai.tensorget positive testing with default data',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const tensor = new Tensor(Dtype.float32, [1, 2], null);
    const result = await aiclient.tensorset('t1', tensor);
    expect(result).to.equal('OK');
    const tensorg = await aiclient.tensorget('t1');
    for (let i = 0; i < tensorg.data.length; i++) {
      expect(tensorg.data[i]).to.equal(0);
    }
    aiclient.end(true);
  }),
);

it(
  'ai.tensorset/ai.tensorget positive testing with default data',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const inputImage = await Jimp.read('./tests/test_data/panda-224x224.jpg');
    const imageWidth = 224;
    const imageHeight = 224;
    const image = inputImage.cover(imageWidth, imageHeight);
    const helpers = new Helpers();
    const normalized = helpers.normalizeRGB(image.bitmap.data);
    const buffer = Buffer.from(normalized.buffer);
    const tensor = new Tensor(Dtype.float32, [imageWidth, imageHeight, 3], buffer);
    const result = await aiclient.tensorset('tensor-image', tensor);
    expect(result).to.equal('OK');
    aiclient.end(true);
  }),
);

it(
  'ai.tensorget negative testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    try {
      const result = await aiclient.tensorget('dontexist');
    } catch (e) {
      expect(e.toString()).to.equal('ReplyError: ERR tensor key is empty');
    }
    aiclient.end(true);
  }),
);

it(
  'ai.modelset modelOnnx linear_iris testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const modelBlobOnnx: Buffer = fs.readFileSync('./tests/test_data/linear_iris.onnx');
    const modelOnnx = new Model(Backend.ONNX, 'CPU', [], [], modelBlobOnnx);
    const result = await aiclient.modelset('modelOnnx', modelOnnx);
    expect(result).to.equal('OK');
    aiclient.end(true);
  }),
);

it(
  'ai.modelset modelOnnx mnist testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const modelBlobOnnx: Buffer = fs.readFileSync('./tests/test_data/mnist.onnx');
    const modelOnnx = new Model(Backend.ONNX, 'CPU', [], [], modelBlobOnnx);
    const result = await aiclient.modelset('mnist', modelOnnx);
    expect(result).to.equal('OK');
    aiclient.end(true);
  }),
);

it(
  'ai.modelset positive testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const modelBlob: Buffer = fs.readFileSync('./tests/test_data/graph.pb');
    const model = new Model(Backend.TF, 'CPU', ['a', 'b'], ['c'], modelBlob);
    const result = await aiclient.modelset('m1', model);
    expect(result).to.equal('OK');
    aiclient.end(true);
  }),
);

it(
  'ai.modelset tiny-yolo-voc testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const modelBlob: Buffer = fs.readFileSync('./tests/test_data/tiny-yolo-voc.pb');
    const model = new Model(Backend.TF, 'CPU', ['input'], ['output'], modelBlob);
    const result = await aiclient.modelset('tiny-yolo-voc', model);
    expect(result).to.equal('OK');
    aiclient.end(true);
  }),
);

it(
  'ai.modelrun positive testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);

    const tensorA = new Tensor(Dtype.float32, [1, 2], [2, 3]);
    const resultA = await aiclient.tensorset('tensorA', tensorA);
    expect(resultA).to.equal('OK');

    const tensorB = new Tensor(Dtype.float32, [1, 2], [3, 5]);
    const resultB = await aiclient.tensorset('tensorB', tensorB);
    expect(resultB).to.equal('OK');

    const modelBlob: Buffer = fs.readFileSync('./tests/test_data/graph.pb');
    const model = new Model(Backend.TF, 'CPU', ['a', 'b'], ['c'], modelBlob);
    const resultModelSet = await aiclient.modelset('mymodel', model);
    expect(resultModelSet).to.equal('OK');

    const resultModelRun = await aiclient.modelrun('mymodel', ['tensorA', 'tensorB'], ['tensorC']);
    expect(resultModelRun).to.equal('OK');

    const tensorC = await aiclient.tensorget('tensorC');
    expect(tensorC.data[0]).to.closeTo(6.0, 0.1);
    expect(tensorC.data[1]).to.closeTo(15.0, 0.1);

    aiclient.end(true);
  }),
);

it(
  'ai.modelrun with tag positive testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);

    const tensorA = new Tensor(Dtype.float32, [1, 2], [2, 3]);
    const resultA = await aiclient.tensorset('tensorA', tensorA);
    expect(resultA).to.equal('OK');

    const tensorB = new Tensor(Dtype.float32, [1, 2], [3, 5]);
    const resultB = await aiclient.tensorset('tensorB', tensorB);
    expect(resultB).to.equal('OK');

    const modelBlob: Buffer = fs.readFileSync('./tests/test_data/graph.pb');
    const model = new Model(Backend.TF, 'CPU', ['a', 'b'], ['c'], modelBlob);
    model.tag = 'test_tag';
    const resultModelSet = await aiclient.modelset('mymodel-wtag', model);
    expect(resultModelSet).to.equal('OK');

    const resultModelRun = await aiclient.modelrun('mymodel-wtag', ['tensorA', 'tensorB'], ['tensorC']);
    expect(resultModelRun).to.equal('OK');

    const tensorC = await aiclient.tensorget('tensorC');
    expect(tensorC.data[0]).to.closeTo(6.0, 0.1);
    expect(tensorC.data[1]).to.closeTo(15.0, 0.1);

    let modelInfo = await aiclient.info('mymodel-wtag');
    expect(modelInfo.key).to.equal('mymodel-wtag');
    expect(modelInfo.tag).to.equal('test_tag');
    expect(modelInfo.calls).to.equal(1);

    // reset stats and get new counter
    const resultModelResetStat = await aiclient.infoResetStat('mymodel-wtag');
    expect(resultModelResetStat).to.equal('OK');
    modelInfo = await aiclient.info('mymodel-wtag');
    expect(modelInfo.calls).to.equal(0);

    aiclient.end(true);
  }),
);

it(
  'ai.modeldel positive testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);

    const modelBlob: Buffer = fs.readFileSync('./tests/test_data/graph.pb');
    const model = new Model(Backend.TF, 'CPU', ['a', 'b'], ['c'], modelBlob);
    model.tag = 'test_tag';
    const resultModelSet = await aiclient.modelset('mymodel-wtag', model);
    expect(resultModelSet).to.equal('OK');

    const resultModelDel = await aiclient.modeldel('mymodel-wtag');
    expect(resultModelDel).to.equal('OK');
    aiclient.end(true);
  }),
);

it(
  'ai.modelget positive testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);

    const modelBlob: Buffer = fs.readFileSync('./tests/test_data/graph.pb');
    const model = new Model(Backend.TF, 'CPU', ['a', 'b'], ['c'], modelBlob);
    model.tag = 'test_tag';
    const resultModelSet = await aiclient.modelset('mymodel', model);
    expect(resultModelSet).to.equal('OK');

    const modelOut = await aiclient.modelget('mymodel');
    expect(modelOut.blob.toString()).to.equal(modelBlob.toString());
    aiclient.end(true);
  }),
);

it(
  'ai.scriptrun with tag positive testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);

    const scriptFileStr: string = fs.readFileSync('./tests/test_data/script.txt').toString();
    const scriptStr: string = 'def bar(a, b):\n    return a + b\n';

    const tensorA = new Tensor(Dtype.float32, [1, 2], [2, 3]);
    const resultA = await aiclient.tensorset('tensorA', tensorA);
    expect(resultA).to.equal('OK');

    const tensorB = new Tensor(Dtype.float32, [1, 2], [3, 5]);
    const resultB = await aiclient.tensorset('tensorB', tensorB);
    expect(resultB).to.equal('OK');

    const script = new Script('CPU', scriptFileStr);

    const script2 = new Script('CPU', scriptStr);
    script2.tag = 'test_tag';

    const resultScriptSet = await aiclient.scriptset('myscript', script);
    expect(resultScriptSet).to.equal('OK');

    const resultScriptSetWithTag = await aiclient.scriptset('myscript-wtag', script2);
    expect(resultScriptSetWithTag).to.equal('OK');

    const resultScriptRun = await aiclient.scriptrun('myscript', 'bar', ['tensorA', 'tensorB'], ['tensorC']);
    const resultScriptRunWithTag = await aiclient.scriptrun(
      'myscript-wtag',
      'bar',
      ['tensorA', 'tensorB'],
      ['tensorD'],
    );
    expect(resultScriptRun).to.equal('OK');
    expect(resultScriptRunWithTag).to.equal('OK');

    const tensorC = await aiclient.tensorget('tensorC');
    expect(tensorC.data[0]).to.closeTo(5.0, 0.1);
    expect(tensorC.data[1]).to.closeTo(8.0, 0.1);

    const tensorD = await aiclient.tensorget('tensorD');
    expect(tensorD.data[0]).to.closeTo(5.0, 0.1);
    expect(tensorD.data[1]).to.closeTo(8.0, 0.1);

    const scriptInfo = await aiclient.info('myscript');
    expect(scriptInfo.key).to.equal('myscript');
    expect(scriptInfo.calls).to.equal(1);

    let scriptInfoTag = await aiclient.info('myscript-wtag');
    expect(scriptInfoTag.key).to.equal('myscript-wtag');
    expect(scriptInfoTag.tag).to.equal('test_tag');
    expect(scriptInfoTag.calls).to.equal(1);

    // reset stats and get new counter
    const resultScriptResetStat = await aiclient.infoResetStat('myscript-wtag');
    expect(resultScriptResetStat).to.equal('OK');
    scriptInfoTag = await aiclient.info('myscript-wtag');
    expect(scriptInfoTag.calls).to.equal(0);

    aiclient.end(true);
  }),
);

it(
  'ai.scriptdel positive testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);

    const scriptStr: string = 'def bar(a, b):\n    return a + b\n';
    const script = new Script('CPU', scriptStr);

    const resultScriptSet = await aiclient.scriptset('myscript', script);
    expect(resultScriptSet).to.equal('OK');

    const resultScriptDel = await aiclient.scriptdel('myscript');
    expect(resultScriptDel).to.equal('OK');
    aiclient.end(true);
  }),
);

it(
  'ai.scriptget positive testing',
  mochaAsync(async () => {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);

    const scriptStr: string = 'def bar(a, b):\n    return a + b\n';
    const script = new Script('CPU', scriptStr);

    const resultScriptSet = await aiclient.scriptset('myscript', script);
    expect(resultScriptSet).to.equal('OK');

    const scriptOut = await aiclient.scriptget('myscript');
    expect(scriptOut.script).to.equal(scriptStr);

    const scriptInfo = await aiclient.info('myscript');
    expect(scriptInfo.key).to.equal('myscript');
    aiclient.end(true);
  }),
);
