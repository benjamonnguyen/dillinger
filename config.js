'use strict'
const rc = require('rc')

const defaultConfig = {
  title: 'Online Markdown Editor - Dillinger, the Last Markdown Editor ever.',
  author: 'Benjamin Nguyen',
  // Add default database configuration
  development: {
    port: 8080,
  }
}

// Export a function that returns the configuration
module.exports = function() {
  return rc('dillinger', defaultConfig)
}
