const console = require('tracer').colorConsole()
const handler = ({conn, moveFile}) => {
  const handleFile = (req, res) => {
    let file = req.swagger.params.file.value
    console.log('file:', file)

    if (!file) {
      Promise.reject(new Error({fail: true, description: 'file not send'}))
    }

    conn.query('INSERT INTO files (`filename`, `mime`, `originalname`) VALUES ( ? , ? , ? );'
      , [file.filename, file.mimetype, file.originalname])
      .then((data) => {
        console.log('data:', data)
        moveFile(file.filename, data.insertId.toString())
        return Promise.resolve({result: 'success', id: data.insertId.toString()})
      })
      .then((result) => {
        console.log('result:', result)
        res.status(200).json(result)
      })
      .catch((e) => {
        console.log('error', e)
        res.status(500).json({error: 'error', fail: true})
      })
  }

  return { handleFile }
}

module.exports = handler
