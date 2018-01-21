const express = require('express');
const mysql = require('mysql2');
const moment = require('moment');
const config = require('config');

let Db = require('./../../common/db');
let conn = Db(config);

let router = express.Router();

let sendError = (err) => {
  console.log(err);
  return res.send(500);
};

router.get('/models', (req, res) => {
  return conn.then((c) => {
    return c.query("SHOW TABLES;"); })
  .then((data)=> {
    let rows = data[0];
    console.log('rows', rows);
    
    let rows2 = rows.map((row) => {
      return row["Tables_in_" + config.mysql.database];
    }).filter((row) => {
      return row != 'files';
    });

    return res.json(rows2);
  })
  .catch(sendError);
});

router.get('/:key', (req, res) => {
  var fields, key, limit, offset, select;
  key = req.params.key;
  select = '*';
  if (req.query.$select) {
    fields = req.query.$select;
    select = fields.join(',');
  }
  limit = 10;
  offset = 0;
  if (req.query.$limit) {
    limit = req.query.$limit;
  }
  if (req.query.$offset) {
    offset = req.query.$offset;
  }
  return conn.then((conn) => {
    return conn.query("SELECT " + select + " FROM " + key + 
      " ORDER BY timestamp desc LIMIT " + offset + ", " + limit + ";");
  })
  .then((data) => {
    let rows = data[0];
    return res.json(rows.map((row) => {
      row.timestamp = moment(row.timestamp).format('YYYY-MM-DD HH:mm:ss');
      return row;
    }));
  }).catch(sendError);
});

router.get('/:key/count', (req, res) => {
  var key;
  key = req.params.key;

  return conn.then((c) => {
    return c.query("SELECT count(id) FROM " + key + ";"); 
  })
  .then((data) => {
    let rows = data[0];
    var totalItemCount;

      totalItemCount = rows[0]['count(id)'];
      return res.json({
        totalItemCount: totalItemCount
      });
  }).catch(sendError);
});

router.get('/:key/chart/:date', (req, res) => {
  var date, hours, key, promises;
  date = moment().format('YYYY-MM-DD');
  console.log('req.params.date', req.params.date);
  if (req.params.date) {
    date = req.params.date;
  }
  key = req.params.key;
  hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  promises = hours.map((hour) => {
    var beginTime, deferred, endTime;
    return new Promise((resolve, reject) => {
      beginTime = moment(date + ' 00:00:00').add(hour, 'hours').format('YYYY-MM-DD HH:mm:ss');
      endTime = moment(date + ' 00:00:00').add(hour + 1, 'hours').format('YYYY-MM-DD HH:mm:ss');

      return conn.then((c) => { 
        let query = "SELECT count(id) FROM " + key + 
          " WHERE timestamp BETWEEN '" + beginTime + "' AND '" + endTime + "';";
        return c.query(query);
      }).then((data) => {
          let rows = data[0]; 
          return resolve({
            hour: hour,
            count: rows[0]['count(id)']
          });
      });
    });
  });

  return Promise.all(promises)
    .then((counts) => {
      var result;
      result = {
        columns: [['Количество']]
      };
      counts.forEach((count) => {
        return result.columns[0].push(count.count);
      });
      return res.json(result);
    }).catch(sendError);
});

router.get('/:key/create', (req, res) => {
  var key;
  key = req.params.key;
  conn.then((c) => {
    let query = "CREATE TABLE `" + key + "` (" +
        "`id` int(10) NOT NULL AUTO_INCREMENT, " +
        "`timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
        "`tag` varchar(32) NOT NULL DEFAULT '', " +
        "`payload` json DEFAULT NULL, " +
        "`status` VARCHAR(32) DEFAULT NULL, " +
        "PRIMARY KEY (`id`)" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";
    return c.query(query);
  }).then(() => {
    return res.json({
      status: "ok"
    });
  }).catch(sendError);
});

router.get('/:key/:id', (req, res, next) => {
  var id, key;
  key = req.params.key;
  id = req.params.id;
  return conn.then(c => {
    return c.query("SELECT * FROM " + key + " where id = " + id + ";"); 
  }).then(data => {
    let rows = data[0];
    return res.json(rows[0]);
  })
  .catch(sendError);
});

module.exports = router;