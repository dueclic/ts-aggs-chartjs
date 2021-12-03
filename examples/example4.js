import {readFile} from 'fs/promises';
import {performance} from 'perf_hooks';

const jsonData = JSON.parse(await readFile(new URL('../data/example4.json', import.meta.url)));


const startTime = performance.now()

import {dataToChartJs} from "../index.js";

const data = dataToChartJs(jsonData, '2021-01-01', '2021-12-02', 'h', (dataset, key) => ({
    ...dataset,
    key,
    foo: 1
}));

const endTime = performance.now()

console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
