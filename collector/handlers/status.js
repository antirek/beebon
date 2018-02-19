const console = require('tracer').colorConsole();

const handler = ({conn}) => {

  var handleStatus = (req, res) => {
    var key = req.swagger.params.key.value;
    var id = req.swagger.params.id.value;

    conn.query('SELECT * FROM ?? where `id` = ?', [key, id])
      .then((data) => {
        let d = data[0][0];
        if (d && d.status) {
          return Promise.resolve({status: d.status, id});
        } else {
          return Promise.reject({result: 'fail', description: 'no data'});
        }
      })
      .then((result) => {
        console.log('result:', result);
        res.status(200).json(result);
      })
      .catch((e) => {
        console.log('error', e);
        res.status(400).json({result: 'fail', description: 'error on request'});
      });
  };

  return {handleStatus};
};

module.exports = handler;