const {dataToChartJs} = require("../index");
const data = dataToChartJs(require('../data/example3.json'),'2021-11-26', '2021-12-02', 'd');

console.log(data);
