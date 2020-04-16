'use strict'
const _clone = require('lodash.clone')
const _forEach = require('lodash.foreach')
const _pick = require('lodash.pick')

/**
 *
 * @param {Object} src
 * @param {string[]} keys
 * @param {string[]} scopes
 * @returns {Object}
 */
const get = (src, keys, scopes) => {
  const scope = scopes.shift()

  if (!src || scope === undefined) return {}

  const d = _pick(src, keys)

  if (scope) {
    Object.assign(d, get(src[scope], keys, scopes))
  }
  return d
}

/**
 *
 * @param {Object} dictionary
 * @param {Object|string[]} options
 * @param {string=} path of keys delimited by non-word symbols
 * @returns {*}
 */
/* module.exports = (dictionary, options, path) => {
  let target = {}, keys = []
  //  Create list of assignable options.
  if (!options || typeof options !== 'object') {
    throw new TypeError('bad options')
  }
  if (Array.isArray(options)) {
    (keys = options).forEach(k => (target[k] = {}))
  } else {
    keys = Object.keys(options).filter(k => !options[k].required)
    target = _clone(options)
  }
  const i = keys.findIndex(k => typeof k !== 'string' || k[0] === '$')
  if (i >= 0) throw new Error(`Illegal option key '${keys[i]}'`)

  const scope = path.split(/\W+/)
  const defaults = get(dictionary, keys, scope)

  _forEach(keys, k => {
    const d = defaults[k]
    target[k].default = (d && typeof d === 'object') ? () => d : d
  })
  return target
} */

exports = module.exports = (dictionary, namespace = undefined) => {
  if (typeof dictionary === 'string') {
    return exports.namespaced(dictionary)
  }
  exports.dictionary = dictionary
  return (exports.vueProper = exports.namespaced(namespace))
}

exports.dictionary = {}

exports.retrieve = (path) => {
  console.log('retrieve', path)
  if (path === undefined) return {}
  return exports.dictionary
}

exports.namespaced = (namespace) => {
  const ns = namespace || 'proper'
  const postMethod = ns + 'Add', tagFn = ns + 'Tag'

  // https://vuejs.org/v2/guide/mixins.html
  return {
    created () {
      if (typeof this[tagFn] !== 'function') return //  Not using API.

      if (!this.hasOwnProperty(ns)) {
        this[ns] = function (field = undefined) {
          const r = field
            ? exports.retrieve(this[tagFn](field))
            : this.$attrs
          return this[postMethod](r, field)
        }
      }

      if (!this.hasOwnProperty(postMethod)) {
        this[postMethod] = (r) => r
      }
    }
  }
}

exports.set = (v) => {
  exports.dictionary = v
  return exports
}

exports.vueProper = exports.namespaced(undefined)
