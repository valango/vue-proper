'use strict'

const assign = require('lodash.assign')
const clone = require('lodash.clonedeep')

/** @type {Object<string, *>} dictionary */
let dictionary = {}

/**
 * Get current dictionary
 * @returns {Object<string, *>}
 */
const get = () => dictionary

/**
 * Set up texts dictionary.
 * @param {Object<string, *>} d
 * @returns {Object<string, *>}
 * @throws {TypeError}
 */
const set = (d) => {
  if (!d || typeof d !== 'object' || Array.isArray(d)) {
    throw new TypeError('Argument must be object')
  }
  return (dictionary = clone(d))
}

/**
 * Retrieve a text label for a field in current context.
 * @param {string} field   - UI element id.
 * @param {string} context - usually UI component name.
 * @returns {Object<{label:string}>} object with at least `label` field.
 */
exports = module.exports = (field, context) => {
  const v = dictionary[context + '.' + field] || dictionary[field] || field

  return typeof v === 'string' ? { label: v } : v
}

assign(exports, { get, set })
