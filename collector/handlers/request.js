const console = require('tracer').colorConsole();

const handler = ({conn, kue, config}) => {

    var handleRequest = (req, res) => {
        var start = new Date().getTime();

        var key = req.swagger.params.key.value; //req.params.key;
        var tag = (req.params.tag) ? req.params.tag : '';
        var payload = JSON.stringify(req.body || {});

        console.log([
            'key: ' + key,
            'tag: ' + tag,
            'payload: ' + payload
        ].join(", "));

        if (!payload) {
            res.status(400).json({result: 'fail', description: 'not valid json'});
            return;
        }

        conn.query("INSERT INTO ?? (`tag`, `payload`) VALUES ( ? , ? );",
                [key, tag, payload])
        .then((r) => {
            let id = r[0].insertId;
            console.log('inserted id', id);
            if (req.sendToKue) {
                kue.publish(config.kue.prefix + key, req.body, id);
            }
            return Promise.resolve({id})
        })
        .then((r) => {
            res.status(200).json({result: 'success', id: r.id.toString()});
            console.log('exec time:', new Date().getTime() - start, "ms");
        })
        .catch((e) => {
            console.log('error:', e);
            res.status(500).json({error: 'error'});
        });
    };

    return { handleRequest }
};

module.exports = handler;