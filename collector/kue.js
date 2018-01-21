const kue = require('kue');
const console = require('tracer').colorConsole();

class Publisher {
    constructor({conn, config}) {
        this.jobs = {};
        this.prefix = config.kue.prefix;

        this.queue = kue.createQueue();
        this.queue.on('job complete', (id, type) => {
            console.log('job complete id', id, 'type', type);
            setStatus(this.jobs[id], 'complete');
            delete this.jobs[id]
        });
    }

    setStatus (data, status) {
        if (!data) {
            return 
        }

        conn.then((c) => {
            return c.query("UPDATE ?? SET `status` = ? where `id` = ? ;", 
                [data.key, status, data.id]);
        }).then((r) => {
            console.log('status updated', r);
        }).catch((e) => {
            console.log('err', e)
        })
    }

    publish(task, data, id) {
        let jobData = { id,
            key: task.replace(this.prefix, '')
        };
        
        let job = this.queue.create(task, data).save((err) => {
            if (err) {
                console.log('err', err);
                setStatus(jobData, 'error');
            } else {
                console.log('publish to kue', jobData);
                this.jobs[job.id] = jobData;
            }
        });
    }
};

module.exports = Publisher;