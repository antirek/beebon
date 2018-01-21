var moment = require('moment');
var later = require('later');
var console = require('tracer').colorConsole();
var Report = require('../report');

class DailyReport extends Report {
    _getStringSchedule() {
        return 'every 1 day at 1 AM';
    }

    _getReportSubject() {
        return 'beebon daily report';
    }

    _prepareEmailTemplate(tablesCount, beginDate, endDate) {
        console.log('prepare email');
        var result = [
            `<h4>Количество записей за ${beginDate} по ${endDate}</h4>`,
            "<table border='1'><tr><td>Ключ</td><td>Количество записей</td></tr>"];

        tablesCount.forEach(function (table) {
            result.push(`<tr><td>${table.table}</td><td>${table.count}</td></tr>`);
        });
        result.push("</table>");

        console.log('result:', result);
        return Promise.resolve(result.join(""));
    }

    run() {
        var beginDate = moment().subtract(1, 'days').format('YYYY-MM-DD 00:00:00');
        var endDate = moment().format('YYYY-MM-DD 00:00:00');
        this._getTablesList()
            .then((tables)=> {
                return Promise.all(tables.map((table)=> {
                    return this._getTableCount(table, beginDate, endDate)
                }))
            })
            .then((tablesCount) => this._prepareEmailTemplate(tablesCount, beginDate, endDate))
            .then((data) => this._sendEmail(data))
            .then((info) => {
                console.log('info', info);
            })
            .catch(function (err) {
                console.log('err', err);
            });
    }
}

module.exports = DailyReport;