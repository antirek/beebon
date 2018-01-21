const mysql = require('mysql2/promise');
const console = require('tracer').colorConsole();

const Db = (config) => {
    let conn = mysql.createConnection(config.mysql);

    let handleDisconnect = (connection) => {
        connection.catch((err) => {
            if (!err.fatal) {
                return;
            }

            if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
                throw err;
            }

            console.log('Re-connecting lost connection: ' + err.stack);
            conn = mysql.createConnection(config.mysql);
            handleDisconnect(conn);
        });
    }

    handleDisconnect(conn);

    return conn;
};

module.exports = Db;