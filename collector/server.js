const Joi = require('joi');
const console = require('tracer').colorConsole();

const configSchema = require('./../common/configSchema');
const Kue = require('./kue');
const Db = require('./../common/db');
const createApp = require('./app');


class CollectorServer {
  constructor(config) {
    this._config = config;
  }

  async init(config) {
    let conn = await Db(config);
    let kue = new Kue({conn, config});
    let app = createApp({conn, kue, config});
    return {app, config};
  }

  _validateConfig() {
    let self = this;
    return new Promise((resolve, reject) => {
      Joi.validate(self._config, configSchema, {allowUnknown: true}, (err, config) => {
        if (err) {
          reject(err);
        } else {
          self._config = config;
          resolve(config);
        }
      });
    });
  }

  _startApp({app, config}) {
    app.listen(config.collector.port, () => {
      console.log('collector app start with config:', config);
    });
  }

  run() {
    this._validateConfig()
      .then(this.init)
      .then(this._startApp)
      .catch((err) => {
        console.log(err);
        process.exit(1);
      });

  }
}
module.exports = CollectorServer;