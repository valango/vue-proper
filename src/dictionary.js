'use strict'
const assign = require('lodash.assign')
const clone = require('lodash.clonedeep')
const forEach = require('lodash.foreach')
const $ = require('../package.json').name + ': '

const rxAttributeName = /^([a-z]([\w-]*\w)?)$/i
const rxClassicRegExp = /^\/([^/]+)\/([a-z]*)$/

const isValidDefinition = (d) => d && typeof d === 'object' && !Array.isArray(d)

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
    if (rxAttributeName.test(key)) {
      return (data[key] = v)
    }
    //  Here we have some sort of regexp definition.
    if (!isValidDefinition(v)) {
      throw new Error($ + `illegal definition by key '${key}'`)
    }

    const r = rxClassicRegExp.exec(key)

    rules.push(r ? new RegExp(r[1], r[2]) : new RegExp(key))
    trees.push(build(v))
  })
  return { data, rules, trees }
}

const set = (settings) => {
  if (!isValidDefinition(settings)) {
    throw new TypeError($ + 'illegal root level definition')
  }
  const old = oldSettings, fresh = clone(settings)
  dictionary = build(fresh)
  cache = {}
  oldSettings = fresh
  return old
}

const retrieve = (path) => {
  if (!dictionary) throw new Error($ + 'dictionary is not set')
  if (path === undefined) {
    cache = {}
    return {}
  }
  return cache[path] || (cache[path] = get(dictionary, path))
}

module.exports = { build, get, retrieve, set }
