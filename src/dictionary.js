'use strict'
const clone = require('lodash.clonedeep')
const forEach = require('lodash.foreach')
const $ = require('../package.json').name + ': '

const assign = Object.assign

let cache
let dictionary
let oldSettings

/**
 * Recursively retrieve data.
 * @param {Object<{data: Object, rules: Array, trees: Array}>} dict
 * @param {string} key
 * @returns {Object}
 */
const get = (dict, key) => {
  const res = clone(dict.data)

  for (let i = 0, rule; (rule = dict.rules[i]); ++i) {
    if (rule.test(key)) assign(res, get(dict.trees[i], key))
  }
  return res
}

const build = (settings) => {
  const data = {}, rules = [], trees = []

  forEach(settings, (v, key) => {
    const r = /^\/([^/]+)\/([a-z]*)$/.exec(key)
    if (r) {
      rules.push(new RegExp(r[1], r[2]))
      trees.push(build(v))
    } else {
      data[key] = v
    }
  })
  return { data, rules, trees }
}

const set = (settings) => {
  if (typeof settings !== 'object' || Array.isArray(settings)) {
    throw new TypeError($ + '\'settings\' must be object')
  }
  const old = oldSettings
  dictionary = build(oldSettings = clone(settings))
  cache = {}
  return old
}

const retrieve = (path) => {
  if (!dictionary) throw new Error($ + 'dictionary is not set')
  if (path === undefined) {
    cache = {}
    return {}
  }
  return cache[path] || (cache[path] = get(path))
}

module.exports = { build, get, retrieve, set }
