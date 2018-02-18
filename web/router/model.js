const express = require('express');
const moment = require('moment');

function createRouter(conn, config) {
    let router = express.Router();

    let sendError = (res, err) => {
        console.log(err);
        res.sendStatus(500);
    };

    router.get('/models', (req, res) => {
        conn.query("SHOW TABLES;")
            .then((rows) => {
                console.log('rows', rows);

                let rows2 = rows.map((row) => {
                    return row["Tables_in_" + config.mysql.database];
                })
                    .filter((row) => {
                        return row != 'files';
                    });

                res.json(rows2);
            })
            .catch(err => sendError(res, err));
    });

    router.get('/:key', (req, res) => {
        let key = req.params.key;
        let select = '*';
        if (req.query.$select) {
            let fields = req.query.$select;
            select = fields.join(',');
        }
        let limit = 10;
        let offset = 0;
        if (req.query.$limit) {
            limit = req.query.$limit;
        }
        if (req.query.$offset) {
            offset = req.query.$offset;
        }
        conn.query("SELECT " + select + " FROM " + key +
            " ORDER BY timestamp desc LIMIT " + offset + ", " + limit + ";")
            .then((rows) => {
                res.json(rows.map((row) => {
                    row.timestamp = moment(row.timestamp).format('YYYY-MM-DD HH:mm:ss');
                    return row;
                }));
            })
            .catch(err => sendError(res, err));
    });

    router.get('/:key/count', (req, res) => {
        let key = req.params.key;

        conn.query("SELECT count(id) FROM " + key + ";")
            .then((rows) => {                

                let totalItemCount = rows[0]['count(id)'];
                res.json({
                    totalItemCount: totalItemCount
                });
            })
            .catch(err => sendError(res, err));
    });

    router.get('/:key/chart/:date', (req, res) => {
        let date = moment().format('YYYY-MM-DD');
        console.log('req.params.date', req.params.date);
        if (req.params.date) {
            date = req.params.date;
        }
        let key = req.params.key;
        let hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        let promises = hours.map((hour) => {
            return new Promise((resolve, reject) => {
                let beginTime = moment(date + ' 00:00:00').add(hour, 'hours').format('YYYY-MM-DD HH:mm:ss');
                let endTime = moment(date + ' 00:00:00').add(hour + 1, 'hours').format('YYYY-MM-DD HH:mm:ss');
                
                let query = "SELECT count(id) as cnt FROM " + key +
                    " WHERE timestamp BETWEEN '" + beginTime + "' AND '" + endTime + "';";
                
                conn.query(query)   
                    .then((rows) => {
                        //console.log('rows:', rows[0]);
                        resolve({
                            hour: hour,
                            count: rows[0]['cnt']
                        });
                    });
            });
        });

        Promise.all(promises)
            .then((counts) => {
                console.log('counts:', counts);
                let result = {
                    columns: [['Количество']]
                };
                counts.forEach((count) => {
                    result.columns[0].push(count.count);
                });
                res.json(result);
            })
            .catch(err => sendError(res, err));
    });

    router.get('/:key/create', (req, res) => {
        let key = req.params.key;

        let query_create_table = "CREATE TABLE `" + key + "` (" +
            "`id` int(10) NOT NULL AUTO_INCREMENT, " +
            "`timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
            "`tag` varchar(32) NOT NULL DEFAULT '', " +
            "`payload` json DEFAULT NULL, " +
            "`status` VARCHAR(32) DEFAULT NULL, " +
            "PRIMARY KEY (`id`)" +
            ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";

        let query_create_time_index = "create index " + key + "_timestamp_index on " + key + " (timestamp);";

        let query = [
          query_create_table, 
          query_create_time_index
        ].join("");

        conn.query(query)
            .then((result) => {
                console.log('result:', result);
                res.json({
                    status: "ok"
                });
            })
            .catch(err => sendError(res, err));
    });

    router.get('/:key/:id', (req, res, next) => {
        let key = req.params.key;
        let id = req.params.id;
        conn.query("SELECT * FROM " + key + " where id = " + id + ";")
            .then(rows => {
                res.json(rows[0]);
            })
            .catch(err => sendError(res, err));
    });
    return router
}

module.exports = createRouter;