'use strict'

/* eslint  no-prototype-builtins: 0 */

const clone = require('lodash.clone')
const camelCase = require('lodash.camelcase')
const upperFirst = require('lodash.upperfirst')

const assign = Object.assign

const componentName = (vm) =>
  upperFirst(camelCase((vm.$options && vm.$options._componentTag) || '?'))

const compose = (el, o) => o.prefix + ':' + o.name + '>' + el + '!' + o.suffix

/**
 * Create namespaced mix-in definition.
 * @param {string} namespace defaults to 'proper'.
 * @returns {{created(): (undefined)}}
 */
const factory = (namespace) => {
  const ns = namespace || 'proper'

  // https://vuejs.org/v2/guide/mixins.html
  return {
    /**
     * If any of 'proper', 'properKey', 'properEnd' methods is present, then
     * make sure they are present all. Provide native fall-backs if applicable.
     */
    created () {
      if (typeof this[ns] !== 'function') return //  Not using API.

      const settings = {
        compose, debug: undefined, enhance: undefined, prefix: '', suffix: ''
      }

      settings.name = componentName(this)

      this[ns] = function (param = '') {
        let f
        //  Check if we are in settings mode.
        if (typeof param === 'object') {
          if (!param) return settings     //  null: Enable straight access

          const old = clone(settings)       //  enable clean access
          assign(settings, param)
          return old
        }
        //  Here for attributes retrieval mode.
        const key = settings.compose.call(this, param, settings)
        let res = assign(exports.retrieve(key), this.$attrs)

        if (param) {
          res.ref = param
          if (!res.name) res.name = param
        }
        if ((f = settings.enhance)) res = f.call(this, res, param)
        if ((f = settings.debug)) f.call(this, res, param, key)

        return res
      }
    }
  }
}

exports = module.exports = factory
