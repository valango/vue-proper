'use strict'
/* eslint no-console: 0 */
const _forEach = require('lodash.foreach')

const dict = {
  oA: [1, 2, 3],
  oO: {},
  num: 42,
  $some: {
    num: 11,
    oA: [123],
    other: {
      num: 1
    }
  }
}

const props1 = ['a', 'oA']

const proper = require('./index')

const res = proper(dict, props1, 'some')

_forEach(res, (r, k) => {
  console.debug('%s: %o', k, r)
  if (typeof r.default === 'function') console.debug('  -> ' + r.default())
})
process.exit(0)
