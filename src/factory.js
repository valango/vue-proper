'use strict'

/* eslint  no-prototype-builtins: 0 */

const assign = require('lodash.assign')
const clone = require('lodash.clonedeep')
const camelCase = require('lodash.camelcase')
const upperFirst = require('lodash.upperfirst')

const componentName = (vm) =>
  upperFirst(camelCase((vm.$options && vm.$options._componentTag) || '?'))

const compose1 = (el, o) => o.prefix + ':' + o.name + '>' + el + '!' + o.suffix

/**
 * Create namespaced mix-in definition.
 * @param {string} namespace defaults to 'proper'.
 * @returns {{created(): (undefined)}}
 */
const factory = (namespace) => {
  const ns = namespace || 'proper', nameFn = ns + 'Name'

  const compose2 = function (el, o) {
    return o.prefix + ':' + this[nameFn]() + '>' + el + '!' + o.suffix
  }

  // https://vuejs.org/v2/guide/mixins.html
  return {
    /**
     * If any of 'proper', 'properKey', 'properEnd' methods is present, then
     * make sure they are present all. Provide native fall-backs if applicable.
     */
    created () {
      if (typeof this[ns] !== 'function') return //  Not using API.

      const settings = { prefix: '', suffix: '' }

      if (typeof this[nameFn] !== 'function') {
        settings.compose = compose1
        settings.name = componentName(this)
      } else {
        settings.compose = compose2
      }

      this[ns] = function (param = '') {
        let f, res = {}
        //  Check if we are in settings mode.
        if (typeof param === 'object') {
          if (!param) return settings     //  null: Enable straight access

          res = clone(settings)       //  enable clean access
          assign(settings, param)
          return res
        }
        //  Here for attributes retrieval mode.
        const key = settings.compose.call(this, param, settings)

        assign(res, exports.retrieve(key))

        if (param) {
          assign(res, exports.texts(param, settings.name))
          assign(res, { ref: param, name: param })
        }
        assign(res, this.$attrs)

        if ((f = settings.enhance)) res = f.call(this, res, param)
        //  istanbul ignore next
        if (param && res.innerText) {
          if ((f = this.$refs[param])) {
            f.innerText = res.innerText
            delete res.innerText
          }
        }
        if ((f = settings.debug)) f.call(this, res, param, key)

        return res
      }
    }
  }
}

exports = module.exports = factory
