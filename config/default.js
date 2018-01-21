module.exports = {
    collector: {
        port: 3000,
        baseUrl: 'http://localhost:3000'
    },
    mysql: {
        host: '127.0.0.1',
        user: 'root',
        password: '1234',
        database: 'beebon',
        multipleStatements: true
    },
    kue: {
        prefix: 'beebon_'
    },
    web: {
        port: 3101
    },
    /*auth: {
        users: {
            'user': 'password'
        }
    },*/
    reporter: {
        to: 'serge.dmitriev@gmail.com',
        from: 'avat12111@yandex.ru',
        mail: {
            service: 'Yandex',
            auth: {
                user: 'avat12111',
                pass: 'nononame'
            }
        }
    },
    filestore: 'uploads'
};