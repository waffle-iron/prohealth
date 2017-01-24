module.exports = {
    servers: {
        one: {
            host: '35.165.184.173',
            username: 'ubuntu',
            pem: 'development.pem'
        }
    },

    meteor: {
        name: 'prohealth',
        path: '../prohealth', //NEEDS CHANGE
        servers: {
            one: {}
        },
        buildOptions: {
            serverOnly: true,
            debug: true
        },
        env: {
            ROOT_URL: 'http://staging.prohealth.io',
        },
        dockerImage: 'abernix/meteord:base',
        deployCheckWaitTime: 60
    },
    mongo: {
        oplog: true,
        port: 27017,
        servers: {
            one: {},
        },
    },
};
