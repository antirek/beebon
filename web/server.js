const express = require('express');
const bodyParser = require('body-parser');
const console = require('tracer').colorConsole();
const kue = require('kue');
const kueUiExpress = require('kue-ui-express');

let server = (config) => {
  let app = express();
  let init = () => {

    kue.createQueue();
    kueUiExpress(app, '/kue/', '/kue-api');

    app.set('views', __dirname + "/views");
    app.set('view engine', 'pug');
    app.use(bodyParser.json());

    app.use('/static', express["static"](__dirname + "./../node_modules"));
    app.use('/public', express["static"](__dirname + "/public"));

    app.use('/keys', require('./router/model'));
    app.use('/kue-api', kue.app);

    app.get('/partials/:view', (req, res) => {
      return res.render('partials/' + req.params.view);
    });

    return app.get('/', (req, res) => {
      return res.render('index');
    });
  };

  run = () => {
    init();
    return app.listen(config.web.port, () => {
      console.log('web app started with config', config);
    });
  };

  return {
    run: run
  };
};

module.exports = server;