'use strict'

/* eslint  no-prototype-builtins: 0 */

const camelCase = require('lodash.camelcase')
const upperFirst = require('lodash.upperfirst')

const assign = Object.assign
const cap = (s) => upperFirst(camelCase(s))

const componentName = (vm) =>
  cap((vm.$options && vm.$options._componentTag) || '')

const factory = (namespace) => {
  const properFn = namespace || 'proper'
  const dynamicFn = properFn + 'Final', keyFn = properFn + 'Key'

  // https://vuejs.org/v2/guide/mixins.html
  return {
    created () {
      if (typeof this[properFn] !== 'function') return  //  Not using API.

      const compName = componentName(this)

      /* istanbul ignore next */
      if (this[properFn]('') === undefined) {           //  It is a stub.
        this[properFn] = function (field = undefined) {
          const k = this[keyFn](field, compName)
          const r = exports.retrieve(k)

          assign(r, this.$attrs)
          if (field) {
            r.ref = field
            if (!r.name) r.name = field
          }
          return this[dynamicFn](r, field)
        }
      }

      if (!this.hasOwnProperty(keyFn)) {
        this[keyFn] = (el = '', comp) => (comp || compName) + '>' + el + '!'
      }

      if (!this.hasOwnProperty(dynamicFn)) {
        this[dynamicFn] = (r) => r
      }
    }
  }
}

exports = module.exports = factory
