import moment from "moment";

const startOfWeek = (m, weekstart) => {
    if (weekstart === undefined) {
        weekstart = 0;
    }
    const mws = weekstart + 1 > 6 ? 0 : weekstart + 1,
        diff = m.day() - mws;
    return moment(m).subtract((diff < 0) ? diff + 7 : diff, 'days');
}

const getLabels = (res) => {
    return Object.keys(res).map(function (k) {
        return parseInt(k, 10);
    }).sort();
};

const toChartView = (keys, res) => {

    let key, dataset = {
        data: []
    };

    for (let i = 0; i < keys.length; i++) {
        key = keys[i];
        dataset['data'].push(res[key]);
    }

    return dataset;
}

const normalizers = {
    h: function (map, oneHour, startMoment, endMoment) {
        const ndays = endMoment.diff(startMoment, 'days') + 1;
        let ts = startMoment.valueOf() / 1000
            , i = 0;

        while (i < 24 * ndays) {
            if (!map.hasOwnProperty(ts)) {
                map[ts] = 0;
            }
            ts += oneHour;
            i++;
        }

        return map;
    },

    d: function (map, oneDay, startMoment, endMoment) {
        const ndays = endMoment.diff(startMoment, 'days') + 1;
        let ts = startMoment.valueOf() / 1000
            , i = 0;

        while (i < ndays) {
            if (!map.hasOwnProperty(ts)) {
                map[ts] = 0;
            }
            ts += oneDay;
            i++;
        }

        return map;
    },

    w: function (map, oneDay, startMoment, endMoment) {
        const weekstartMoment = startOfWeek(startMoment),
            d = moment(weekstartMoment);

        let grid_m = null;

        while (d <= endMoment) {
            if (grid_m === null) {
                grid_m = startMoment;
            } else {
                grid_m = d;
            }

            grid_m = grid_m.valueOf() / 1000;
            if (!map.hasOwnProperty(grid_m)) {
                map[grid_m] = 0;
            }
            d.add(7 * 86400, 'seconds');
        }

        return map;
    },

    m: function (map, oneDay, startMoment, endMoment) {
        const monthstartMoment = moment(startMoment).date(1)
            , d = moment(monthstartMoment)
            , year = d.year();

        let grid_m = null,
            m = d.month();

        function daysInMonth(m, year) {
            if (m >= 12) {
                year += Math.floor(m / 12);
            }
            m %= 12;

            if (m === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
                return 29;
            } else if (m === 1) {
                return 28;
            } else if ((m < 7 && m % 2 === 0) || (m >= 7 && m % 2 === 1)) {
                return 31;
            } else {
                return 30;
            }
        }

        while (d <= endMoment) {
            if (grid_m === null) {
                grid_m = startMoment;
            } else {
                grid_m = d;
            }

            grid_m = grid_m.valueOf() / 1000;
            if (!map.hasOwnProperty(grid_m)) {
                map[grid_m] = 0;
            }
            d.add(daysInMonth(m, year) * oneDay, 'seconds');
            m++;
        }

        return map;
    }
}

const getMetrics = (grouping) => {
    if (grouping === 'h') {
        return 3600;
    }
    return 86400;
}

export const dataToChartJs = (res, start_date, end_date, grp) => {

    let startMoment = moment(start_date),
        endMoment = moment(end_date),
        val,
        key,
        maxValue = null,
        ts = 0,
        rCounter = 0,
        datasets = {},
        keys = [],
        labels = [];

    endMoment.hours(23).minutes(59).minutes(59).milliseconds(999);

    startMoment.subtract(startMoment._d.getTimezoneOffset(), 'minutes');
    startMoment.utc();
    endMoment.subtract(endMoment._d.getTimezoneOffset(), 'seconds');
    endMoment.utc();

    const metrics = getMetrics(grp);

    while ((val = res.shift()) !== undefined) {
        if (typeof val === 'string') {
            keys.push(val);
        } else if (maxValue === null) {
            maxValue = val;
        } else if (rCounter === 0) {
            ts = val * metrics;
            rCounter++;
        } else if (val === -1) {
            rCounter = 0;
        } else {
            key = keys[rCounter - 1];
            if (!datasets.hasOwnProperty(key)) {
                datasets[key] = {};
            }
            datasets[key][ts] = val;
            rCounter++;
        }
    }

    while (key = keys.shift()) {
        if (!datasets.hasOwnProperty(key)) {
            datasets[key] = {};
        }

        const dataset = normalizers[grp](datasets[key], metrics, startMoment, endMoment);
        if (key === 'all') {
            labels = getLabels(datasets['all']);
        }
        datasets[key] = toChartView(labels, dataset);
    }

    return {
        datasets,
        maxValue,
        labels
    };
}
