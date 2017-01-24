module.exports = {
  servers: {
    one: {
      host: '52.88.106.209',
      username: 'ubuntu',
      pem: 'production.pem'
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
      ROOT_URL: 'http://prohealth.io',
      MONGO_URL: 'mongodb://prohealth:prohealth@cluster0-shard-00-00-8dzq9.mongodb.net:27017,cluster0-shard-00-01-8dzq9.mongodb.net:27017,cluster0-shard-00-02-8dzq9.mongodb.net:27017/admin?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin'
    },
    dockerImage: 'abernix/meteord:base',
    deployCheckWaitTime: 60
  }
};
