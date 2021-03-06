const later = require('later')
const config = require('config')
const console = require('tracer').colorConsole()

class Report {
  constructor (conn, mailer) {
    this._conn = conn
    this._mailer = mailer
    this.schedule = later.parse.text(this._getStringSchedule())
  }

  _getStringSchedule () {
    return 'every hour'
  }

  _getReportSubject () {
    return 'beebon report'
  }

  _getTableCount (table, beginDate, endDate) {
    return this._conn.query('SELECT count(id) FROM ?? WHERE timestamp between ? and ?;',
      [table, beginDate, endDate])
      .then(counts => {
        return Promise.resolve({
          table: table,
          count: counts[0]['count(id)']
        })
      })
      .catch(console.log)
  }

  _getTablesList () {
    return this._conn.query('SHOW TABLES;')
      .then(rows => {
        console.log('rows', rows)
        return Promise.resolve(rows.map((row) => {
          return row['Tables_in_' + config.mysql.database]
        }))
      })
  }

  _sendEmail (data) {
    return this._mailer.send({subject: this._getReportSubject(), data: data})
  }

  run () {
    console.log('base report body')
  }
}
module.exports = Report
