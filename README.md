[![license](https://img.shields.io/github/license/RedisAI/redisai-js.svg)](https://github.com/RedisAI/redisai-js)
[![CircleCI](https://circleci.com/gh/RedisAI/redisai-js/tree/master.svg?style=svg)](https://circleci.com/gh/RedisAI/redisai-js/tree/master)
[![npm version](https://badge.fury.io/js/redisai-js.svg)](https://badge.fury.io/js/redisai-js)
[![codecov](https://codecov.io/gh/RedisAI/redisai-js/branch/master/graph/badge.svg)](https://codecov.io/gh/RedisAI/redisai-js)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/RedisAI/redisai-js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/RedisAI/redisai-js/context:javascript)
[![Known Vulnerabilities](https://snyk.io/test/github/RedisAI/redisai-js/badge.svg?targetFile=package.json)](https://snyk.io/test/github/RedisAI/redisai-js?targetFile=package.json)

## A high performance node.js RedisAI client
[![Forum](https://img.shields.io/badge/Forum-RedisAI-blue)](https://forum.redislabs.com/c/modules/redisai)
[![Gitter](https://badges.gitter.im/RedisLabs/RedisAI.svg)](https://gitter.im/RedisLabs/RedisAI?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

You can use this client to query RedisAI using plain Javascript, or in a type-safe manner using Typescript, since redisai-js comes with its own type definitions built-in. 

## Installation

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install --save redisai-js
```

## Overview

### Vanilla JS:

Example of AI.TENSORSET and AI.TENSORGET

```javascript
var redis = require('redis');
var redisai = require('redisai-js');

(async () => {
    const nativeClient = redis.createClient();
    const aiclient = new redisai.Client(nativeClient);
    const tensorA = new redisai.Tensor(redisai.Dtype.float32, [1, 2], [3, 5]);
    const result = await aiclient.tensorset("tensorA", tensorA);

    // AI.TENSORSET result: OK
    console.log(`AI.TENSORSET result: ${result}`)

    const tensorGetReply = await aiclient.tensorget("tensorA");

    // AI.TENSORGET reply: datatype FLOAT shape [1,2] , data [3,5]
    console.log(`AI.TENSORGET reply: datatype ${tensorGetReply.dtype} shape [${tensorGetReply.shape}] , data [${tensorGetReply.data}]`);

    await aiclient.end();
})();
```


Example of AI.MODELSET and AI.MODELRUN

```javascript
var redis = require('redis');
var redisai = require('redisai-js');
var fs = require("fs");

(async () => {
    const nativeClient = redis.createClient();
    const aiclient = new redisai.Client(nativeClient);
    const tensorA = new redisai.Tensor(redisai.Dtype.float32, [1, 2], [2, 3]);
    const tensorB = new redisai.Tensor(redisai.Dtype.float32, [1, 2], [3, 5]);
    const result_tA = await aiclient.tensorset("tA", tensorA);
    const result_tB = await aiclient.tensorset("tB", tensorB);

    const model_blob = fs.readFileSync("./test_data/graph.pb");
    // AI.TENSORSET tA result: OK
    console.log(`AI.TENSORSET tA result: ${result_tA}`)
    // AI.TENSORSET tB result: OK
    console.log(`AI.TENSORSET tB result: ${result_tB}`)

    const mymodel = new redisai.Model(redisai.Backend.TF, "CPU", ["a", "b"], ["c"], model_blob);

    const result_modelSet = await aiclient.modelset("mymodel", mymodel);

    // AI.MODELSET result: OK
    console.log(`AI.MODELSET result: ${result_modelSet}`)

    const result_modelRun = await aiclient.modelrun("mymodel", ["tA", "tB"], ["tC"]);

    console.log(`AI.MODELRUN result: ${result_modelRun}`)
    const tensorC = await aiclient.tensorget("tC");

    // AI.TENSORGET tC reply: datatype FLOAT shape [1,2] , data [6,15]
    console.log(`AI.TENSORGET tC reply: datatype ${tensorC.dtype} shape [${tensorC.shape}] , data [${tensorC.data}]`);

    await aiclient.end();
})();
```

Example of AI.SCRIPTSET and AI.SCRIPTRUN

```javascript
(async () => {
    const nativeClient = redis.createClient();
    const aiclient = new redisai.Client(nativeClient);
    const tensorA = new redisai.Tensor(redisai.Dtype.float32, [1, 2], [2, 3]);
    const tensorB = new redisai.Tensor(redisai.Dtype.float32, [1, 2], [3, 5]);
    const script_str = 'def bar(a, b):\n    return a + b\n';

    const result_tA = await aiclient.tensorset("tA", tensorA);
    const result_tB = await aiclient.tensorset("tB", tensorB);
    // AI.TENSORSET tA result: OK
    console.log(`AI.TENSORSET tA result: ${result_tA}`)
    // AI.TENSORSET tB result: OK
    console.log(`AI.TENSORSET tB result: ${result_tB}`)

    const myscript = new redisai.Script("CPU", script_str);

    const result_scriptSet = await aiclient.scriptset("myscript", myscript);

    // AI.SCRIPTSET result: OK
    console.log(`AI.SCRIPTSET result: ${result_scriptSet}`)

    const result_scriptRun = await aiclient.scriptrun("myscript", "bar",["tA", "tB"], ["tD"]);

    console.log(`AI.SCRIPTRUN result: ${result_scriptRun}`)
    const tensorD = await aiclient.tensorget("tD");

    // AI.TENSORGET tD reply: datatype FLOAT shape [1,2] , data [5,8]
    console.log(`AI.TENSORGET tD reply: datatype ${tensorD.dtype} shape [${tensorD.shape}] , data [${tensorD.data}]`);

    await aiclient.end();
})();
```

Example of AI.DAGRUN enqueuing multiple SCRIPTRUN and MODELRUN commands

A common pattern is enqueuing multiple SCRIPTRUN and MODELRUN commands within a DAG. The following example uses ResNet-50,to classify images into 1000 object categories. 

Given that our input tensor contains each color represented as a 8-bit integer and that neural networks usually work with floating-point tensors as their input we need to cast a tensor to floating-point and normalize the values of the pixels - for that we will use `pre_process_4ch` function. 

To optimize the classification process we can use a post process script to return only the category position with the maximum classification - for that we will use `post_process` script. 

Using the DAG capabilities we've removed the necessity of storing the intermediate tensors in the keyspace. You can even run the entire process without storing the output tensor, as follows:


```javascript
var redis = require('redis');
var redisai = require('redisai-js');
var fs = require("fs");
var Jimp = require('jimp');

(async () => {
    const nativeClient = redis.createClient();
    const aiclient = new redisai.Client(nativeClient);
    const scriptFileStr = fs.readFileSync('./tests/test_data/imagenet/data_processing_script.txt').toString();
    const jsonLabels = fs.readFileSync('./tests/test_data/imagenet/imagenet_class_index.json');
    const labels = JSON.parse(jsonLabels);

    const dataProcessingScript = new redisai.Script('CPU', scriptFileStr);
    const resultScriptSet = await aiclient.scriptset('data_processing_script', dataProcessingScript);
    // AI.SCRIPTSET result: OK
    console.log(`AI.SCRIPTSET result: ${resultScriptSet}`)

    const modelBlob = fs.readFileSync('./tests/test_data/imagenet/resnet50.pb');
    const imagenetModel = new redisai.Model(redisai.Backend.TF, 'CPU', ['images'], ['output'], modelBlob);
    const resultModelSet = await aiclient.modelset('imagenet_model', imagenetModel);
    
    // AI.MODELSET result: OK
    console.log(`AI.MODELSET result: ${resultModelSet}`)

    const inputImage = await Jimp.read('./tests/test_data/imagenet/cat.jpg');
    const imageWidth = 224;
    const imageHeight = 224;
    const image = inputImage.cover(imageWidth, imageHeight);
    const tensor = new redisai.Tensor(redisai.Dtype.uint8, [imageWidth, imageHeight, 4], Buffer.from(image.bitmap.data));
    
    ///
    // Prepare the DAG enqueuing multiple SCRIPTRUN and MODELRUN commands
    const dag = new redisai.Dag();
    
    dag.tensorset('tensor-image', tensor);
    dag.scriptrun('data_processing_script', 'pre_process_4ch', ['tensor-image'], ['temp_key1']);
    dag.modelrun('imagenet_model', ['temp_key1'], ['temp_key2']);
    dag.scriptrun('data_processing_script', 'post_process', ['temp_key2'], ['classification']);
    dag.tensorget('classification');

    // Send the AI.DAGRUN command to RedisAI server
    const resultDagRun = await aiclient.dagrun_ro(null, dag);
    
    // The 5th element of the reply will be the `classification` tensor 
    const classTensor = resultDagRun[4];
    
    // Print the category in the position with the max classification
    const idx = classTensor.data[0];

    // 281 [ 'n02123045', 'tabby' ]
    console.log(idx, labels[idx.toString()]);

    await aiclient.end();
})();
```

### Further examples

The [RedisAI examples repo](https://github.com/RedisAI/redisai-examples) shows more advanced examples
made using redisai-js under [js_client](https://github.com/RedisAI/redisai-examples/tree/master/js_client) folder. 


### Supported RedisAI Commands

| Command | Recommended API and JSDoc  |
| :---          |  ----: |
AI.TENSORSET | tensorset
AI.TENSORGET | tensorget
AI.MODELSET | modelset
AI.MODELGET | modelget
AI.MODELDEL | modeldet
AI.MODELRUN | modelrun
AI._MODELSCAN | N/A
AI.SCRIPTSET | scriptset
AI.SCRIPTGET | scriptget
AI.SCRIPTDEL | scriptdel
AI.SCRIPTRUN | scriptrun
AI._SCRIPTSCAN | N/A  
AI.DAGRUN | dagrun
AI.DAGRUN_RO | dagrun_ro
AI.INFO | info and infoResetStat (for resetting stats)
AI.CONFIG * | configLoadBackend and configBackendsPath


### Running tests

A simple test suite is provided, and can be run with:

```sh
$ npm test
```

The tests expect a Redis server with the RedisAI module loaded to be available at localhost:6379

## License

redisai-js is distributed under the BSD3 license - see [LICENSE](LICENSE)

[npm-image]: https://img.shields.io/npm/v/express.svg
[npm-url]: https://npmjs.org/package/redisgraph.js



