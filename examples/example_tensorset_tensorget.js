var redis = require('redis');
var redisai = require('redisai-js');
var fs = require("fs");

const example_modelset_and_modelrun = async () => {
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
};

example_modelset_and_modelrun();