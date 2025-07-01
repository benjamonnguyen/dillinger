'use strict'

const path = require('path')

// Show the home page
exports.index = function (req, res) {
  return res.render('index', {})
}

exports.privacy = function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'public/privacy.html'))
}

// Show the not implemented yet page
exports.not_implemented = function (req, res) {
  res.render('not-implemented')
}
