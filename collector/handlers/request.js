const console = require('tracer').colorConsole();
const clientIp = require('client-ip');

const preparePayload = (req, rawPayload) => {
  console.log('raw payload:', rawPayload);
  if (rawPayload.origin) {
    rawPayload.origin.ip = clientIp(req);   
  } else {
    rawPayload['origin'] = { 
      ip: clientIp(req)
    };
  }
  return JSON.stringify(rawPayload);
};

const isJson = (rawPayload) => {
  return new Promise((resolve, reject) => {
    try {
      var payload = JSON.stringify(rawPayload);
      resolve(payload);
    } catch (err) {
      console.log('err parse', err);
      reject({result: 'fail', description: 'not valid json'});
    }
  });
};

const handler = ({conn, kue, config}) => {

  const handleRequest = (req, res) => {
    let start = new Date().getTime();

    let key = req.swagger.params.key.value; //req.params.key;
    let tag = (req.params.tag) ? req.params.tag : '';
    let rawPayload = req.body || null;
        
    console.log('data:', {key, tag, rawPayload});

    isJson(rawPayload).then(() => {
      return preparePayload(req, rawPayload);
    }).then((preparedPayload) => {
      return conn.query('INSERT INTO ?? (`tag`, `payload`) VALUES ( ? , ? );',
        [key, tag, preparedPayload]);    
    }).then((r) => {
      console.log('result:', r);
      let id = r.insertId;
      console.log('inserted id', id);
      if (req.sendToKue) {
        kue.publish(config.kue.prefix + key, req.body, id);
      }
      return Promise.resolve({id});
    })
      .then((r) => {
        console.log('r:', r);
        res.status(200).json({result: 'success', id: r.id.toString()});
        console.log('exec time:', new Date().getTime() - start, 'ms');
      })
      .catch((e) => {
        console.log('error:', e);
        res.status(500).json({error: 'error'});
      });
  };

  return { handleRequest };
};

module.exports = handler;