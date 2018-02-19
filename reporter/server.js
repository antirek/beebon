const later = require('later');
const console = require('tracer').colorConsole();
const Joi = require('joi');

const Mailer = require('./mailer');
const DailyReport = require('./reports/daily/report');
const WeeklyReport = require('./reports/weekly/report');
const configSchema = require('./../common/configSchema');
const DBManager = require('./../common/db');

class ReportServer {
  constructor(config) {
    this._config = config;
  }

  _validateConfig() {
    let self = this;
    return new Promise((resolve, reject) => {
      Joi.validate(self._config, configSchema, (err, config) => {
        if (err) {
          reject(err);
        } else {
          self._config = config;
          resolve(config);
        }
      });
    });
  }

  async _sendReport(config) {
    let mailer = Mailer(config);
    let dbManager = await DBManager(config);

    let dailyReport = new DailyReport(dbManager, mailer);
    let weeklyReport = new WeeklyReport(dbManager, mailer);
    //let timer = later.setInterval(() => dailyReport.run(), dailyReport.schedule);
    //let timer2 = later.setInterval(() => weeklyReport.run(), weeklyReport.schedule);
    later.setInterval(() => dailyReport.run(), dailyReport.schedule);
    later.setInterval(() => weeklyReport.run(), weeklyReport.schedule);

    console.log('reporter server start');
  }

  run() {
    this._validateConfig()
      .then(this._sendReport)
      .then(console.log)
      .catch((err) => {
        console.log(err);
        process.exit(1);
      });

  }
}

module.exports = ReportServer;