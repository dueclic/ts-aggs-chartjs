const { performance } = require('perf_hooks');

const startTime = performance.now()

const {dataToChartJs} = require("../index");
const data = dataToChartJs(require('../data/example4.json'),'2021-01-01', '2021-12-02', 'h');

console.log(data.datasets);

const endTime = performance.now()

console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
