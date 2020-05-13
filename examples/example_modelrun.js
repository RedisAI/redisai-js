var redis = require('redis');
var redisai = require('redisai-js');

const example_tensorset_and_get = async () => {
    const nativeClient = redis.createClient();
    const aiclient = new redisai.Client(nativeClient);
    const tensorA = new redisai.Tensor(redisai.Dtype.float32, [1, 2], [3, 5]);
    const result = await aiclient.tensorset("tensorA", tensorA);
    console.log(`AI.TENSORSET result: ${result}`)

    // AI.TENSORSET result: OK
    const tensorGetReply = await aiclient.tensorget("tensorA");

    // AI.TENSORGET reply: datatype FLOAT shape [1,2] , data [3,5]
    console.log(`AI.TENSORGET reply: datatype ${tensorGetReply.dtype} shape [${tensorGetReply.shape}] , data [${tensorGetReply.data}]`);

    await aiclient.end();
};

example_tensorset_and_get();
