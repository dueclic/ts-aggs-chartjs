const {dataToChartJs} = require("../index");
const data = dataToChartJs(require('../data/example2.json'),'2021-12-01', '2021-12-01', 'h');

console.log(data.datasets);
