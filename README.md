[![license](https://img.shields.io/github/license/filipecosta90/redisai-js.svg)](https://github.com/filipecosta90/redisai-js)
[![CircleCI](https://circleci.com/gh/filipecosta90/redisai-js/tree/master.svg?style=svg)](https://circleci.com/gh/filipecosta90/redisai-js/tree/master)
[![npm version](https://badge.fury.io/js/redisai-js.svg)](https://badge.fury.io/js/redisai-js)

## A high performance node.js RedisAI client
[![Forum](https://img.shields.io/badge/Forum-RedisAI-blue)](https://forum.redislabs.com/c/modules/redisai)
[![Gitter](https://badges.gitter.im/RedisLabs/RedisAI.svg)](https://gitter.im/RedisLabs/RedisAI?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)


## Usage

```typescript
npm install --save redisai-js
```
### ES6/TypeScript:

```typescript
import {Client} from 'redisai-js';
import {createClient} from "redis";
import {Tensor} from "../src/tensor";
import {Dtype} from "../src/Dtype";

(async function() {
    const nativeClient = createClient();
    const aiclient = new Client(nativeClient);
    const tensor = new Tensor(Dtype.float32, [1, 2], [3, 5]);
    const result = await aiclient.tensorset("t1", tensor);
    console.log(result);
    // prints: OK
})();
```


### Vanilla JS:

```javascript
TBD
```