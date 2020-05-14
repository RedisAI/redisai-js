[![license](https://img.shields.io/github/license/filipecosta90/redisai-js.svg)](https://github.com/filipecosta90/redisai-js)
[![CircleCI](https://circleci.com/gh/filipecosta90/redisai-js/tree/master.svg?style=svg)](https://circleci.com/gh/filipecosta90/redisai-js/tree/master)
[![npm version](https://badge.fury.io/js/redisai-js.svg)](https://badge.fury.io/js/redisai-js)
[![codecov](https://codecov.io/gh/filipecosta90/redisai-js/branch/master/graph/badge.svg)](https://codecov.io/gh/filipecosta90/redisai-js)

## A high performance node.js RedisAI client
[![Forum](https://img.shields.io/badge/Forum-RedisAI-blue)](https://forum.redislabs.com/c/modules/redisai)
[![Gitter](https://badges.gitter.im/RedisLabs/RedisAI.svg)](https://gitter.im/RedisLabs/RedisAI?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

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