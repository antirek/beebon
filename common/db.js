const mysql = require('mysql2')

function Db (config) {
  return new Promise((resolve) => {
    let conn = mysql.createConnection(config.mysql)

    function handleDisconnect (connection) {
      connection.on('error', (err) => {
        if (!err.fatal) {
          return
        }
        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
          throw err
        }
        setTimeout(() => {
          conn = mysql.createConnection(config.mysql)
          handleDisconnect(conn)
        }, 1000)
      })
    }

    handleDisconnect(conn)

    function Query (query, params = {}) {
      return new Promise((resolve, reject) => {
        conn.query(query, params, (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        })
      })
    }

    resolve({
      query: Query
    })
  })
}

module.exports = Db
