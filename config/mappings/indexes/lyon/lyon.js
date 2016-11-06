module.exports = {
  mappings: {
    indexes: {
      lyon: {
        lyon: {
          index: 'lyon_v2',
          body : {
            settings: {
              analysis: {
                analyzer: {
                  folding: {
                    tokenizer: 'standard',
                    filter   : [
                      'lowercase',
                      'asciifolding'
                    ]
                  }
                }
              }
            },
            aliases : {
              'lyon': {}
            }
          }
        }
      }
    }
  }
};
