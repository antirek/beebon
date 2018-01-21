const nodemailer = require('nodemailer');

const Mailer = (config) => {
    let mailer = nodemailer.createTransport(config.reporter.mail);

    let send = (params) => {
        return new Promise((resolve, reject)=> {
            mailer.sendMail({
                from: config.reporter.from,
                to: config.reporter.to,
                subject: params.subject,
                html: params.data
            }, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info);
                }
            })
        });
    };

    return {
        send
    };
};

module.exports = Mailer;