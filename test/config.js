module.exports.log = {
  level: 'error'
};

module.exports.connections = {
  ES: {
    host      : 'localhost:9200',
    log       : ['error', 'warning'],
    apiVersion: '5.x'
  }
};
