const express = require('express');
const fs = require('fs');

const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const basicAuth = require('express-basic-auth');
const fse = require('fs-extra');
const multer = require('multer');
const console = require('tracer').colorConsole();

const HandlerRequest = require('./handlers/request');
const HandlerStatus = require('./handlers/status');
const HandlerFile = require('./handlers/file');

function createApp({conn, kue, config}) {
  let app = express();
  let upload = multer({dest: config.filestore});
  let spec = fs.readFileSync(path.join(__dirname, 'api.yaml'), 'utf8');
  let swaggerDoc = jsyaml.safeLoad(spec);

  function moveFile(fileName, targetFileName){
    let filePath = path.join(config.filestore, fileName);
    let targetFilePath = path.join(config.filestore, targetFileName);
    fse.moveSync(filePath, targetFilePath, {overwrite: true});
  }

  let handlerRequest = HandlerRequest({conn, kue, config});
  let handlerStatus = HandlerStatus({conn});
  let handlerFile = HandlerFile({conn, moveFile});

  let options = {
    controllers: {
      HandlerLogRequest: handlerRequest.handleRequest,
      HandlerTaskRequest: (req, res, next) => {
        req.sendToKue = true;
        handlerRequest.handleRequest(req, res, next);
      },
      HandlerStatusRequest: handlerStatus.handleStatus,
      HandlerFile: handlerFile.handleFile
    }
  };

  let getUnauthorizedResponse = (req) => {
    console.log('req.auth:', req.auth);
    var res = {result: 'error'};
    return res;
  };
    
  //auth
  if (config.auth && config.auth.users) {
    app.use('/api', basicAuth({
      users: config.auth.users,
      unauthorizedResponse: getUnauthorizedResponse
    }));
  }
    
  app.use(bodyParser.json());
  app.use(cors());
  app.use(upload.fields([{name: 'file'}]));

  swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
    app.use(middleware.swaggerMetadata());
    app.use(middleware.swaggerValidator({validateResponse: false}));
    app.use(middleware.swaggerUi());
        
    app.use(middleware.swaggerRouter(options));
    //app.use(middleware.swaggerSecurity(basicAuth));

    app.use((err, req, res) => {
      console.log('unsupported error', err);
      res.status(500).json(err);
    });
  });

  return app;
}

module.exports = createApp;