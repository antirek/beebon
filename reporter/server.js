const later = require('later');
const console = require('tracer').colorConsole();
const Joi = require('joi');

const Mailer = require('./mailer');
const DailyReport = require('./reports/daily/report');
const WeeklyReport = require('./reports/weekly/report');
const configSchema = require('./../common/configSchema');
const DBManager = require('./../common/db');

const server = (config) => {

    let init = () => {
        var mailer = Mailer(config);
        var dbManager = DBManager(config);

        var dailyReport = new DailyReport(dbManager, mailer);
        var weeklyReport = new WeeklyReport(dbManager, mailer);
        var timer = later.setInterval(() => dailyReport.run(), dailyReport.schedule);
        var timer2 = later.setInterval(() => weeklyReport.run(), weeklyReport.schedule);

        console.log('reporter server start');
    };

    let run = () => {
        Joi.validate(config, configSchema, (err, config) => {
            if (err) {
                console.log(err);
                process.exit(1);
            } else {
                init();
            }
        });
    };

    return {
        run: run
    };
};

module.exports = server;