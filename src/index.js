'use strict'

const factory = require('./factory')
const { retrieve, set } = require('./dictionary')
const me = require('../package').name

exports = module.exports = (dictionary, namespace = undefined) => {
  if (typeof dictionary === 'string') {
    if (namespace !== undefined) throw new Error(me + '.mixin: invalid call')
    exports.vueProper = exports.factory(namespace)
  } else {
    set(dictionary)
    if (namespace) {
      exports.vueProper = exports.factory(namespace)
    }
  }
  return exports.vueProper
}

exports.factory = factory
exports.mixin = exports
exports.retrieve = factory.retrieve = retrieve
exports.set = set

/*
  When loading, default mixin definition is crated.
  It will always contain the most recent factory result.
 */
exports.vueProper = factory('')
