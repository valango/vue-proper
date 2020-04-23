'use strict'

/* eslint  no-prototype-builtins: 0 */

const camelCase = require('lodash.camelcase')
const upperFirst = require('lodash.upperfirst')

const P = 'vue-proper: '

const assign = Object.assign
const cap = (s) => upperFirst(camelCase(s))

const componentName = (vm) =>
  cap((vm.$options && vm.$options._componentTag) || '')

//  Standard properKey method.
const fKey = (el, comp) => comp + '>' + el + '!'

//  Standard properEnd method.
const fEnd = (r) => r

/**
 * Bind a method my `name` to Vue instance.
 * If such method exists already, then use fallback name `name` + 'Std'.
 *
 * @param {Vue} vm
 * @param {string} name
 * @param {function(*,[*]):*} method
 * @throws {Error} if `name` is used by non-function or if backup is in use.
 */
const properBind = (vm, name, method) => {
  const typ = typeof vm[name]

  if (typ === 'function') {
    const fallback = name + 'Std'

    if (vm.hasOwnProperty(fallback)) {
      throw new Error(
        P + `both '${name}' and '${fallback}' methods are defined`)
    }
    vm[fallback] = method
  } else if (typ === 'undefined') {
    vm[name] = method
  } else {
    throw new Error(
      P + `property '${name}' is '${typ}', but 'function' is expected`)
  }
}

/**
 * Create namespaced mix-in definition.
 * @param {string} namespace defaults to 'proper'.
 * @returns {{created(): (undefined)}}
 */
const factory = (namespace) => {
  const ns = namespace || 'proper'
  const sEnd = ns + 'End', sKey = ns + 'Key'

  // https://vuejs.org/v2/guide/mixins.html
  return {
    /**
     * If any of 'proper', 'properKey', 'properEnd' methods is present, then
     * make sure they are present all. Provide native fall-backs if applicable.
     */
    created () {
      if (![ns, sEnd, sKey].some(n => typeof this[n] === 'function')) return //  Not using API.

      const fProper = function (field = '') {
        const key = this[sKey](field, componentName(this))
        const res = exports.retrieve(key)

        assign(res, this.$attrs)
        if (field) {
          res.ref = field
          if (!res.name) res.name = field
        }
        return this[sEnd](res, field, key)
      }
      if (this[ns] && this[ns]('') === undefined) delete this[ns] //  It was a stub.

      properBind(this, ns, fProper)
      properBind(this, sKey, fKey)
      properBind(this, sEnd, fEnd)
    }
  }
}

exports = module.exports = factory
