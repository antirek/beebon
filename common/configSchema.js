const Joi = require('joi');

const configSchema = Joi.object().keys({
    collector: Joi.object().keys({
        port: Joi.number().integer().min(1).max(65535).required(),
        baseUrl: Joi.string().required(), 
    }),
    mysql: Joi.object().keys({
        host: Joi.string().required(),
        port: Joi.number().integer().min(1).max(65535).default(3306),
        user: Joi.string().required(),
        password: Joi.string().allow('').required(),
        database: Joi.string().required(),
        multipleStatements: Joi.boolean().default(true)
    }),
    reporter: Joi.object().keys({
        to: Joi.string().required(),
        from: Joi.string().required(),
        mail: Joi.object().keys({
            service: Joi.string().required(),
            auth: Joi.object().keys({
                user: Joi.string().required(),
                pass: Joi.string().required()
            })
        })
    }),
    auth: Joi.object().keys({
        users: Joi.any()
    }),
    kue: Joi.object().keys({
        prefix: Joi.string().default('beebon_'),
        redis: Joi.any()
    }),
    web: Joi.object().keys({
        port: Joi.number().integer().min(1).max(65535).required()
    }),
    filestore: Joi.string().default('/var/beebon/filestore/')
});

module.exports = configSchema;