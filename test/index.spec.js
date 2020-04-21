'use strict'
const ME = 'index'
process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const _ = require('lodash')
const target = require('../src/' + ME)

describe(ME, () => {
  it('should fail on bad invocation', () => {
    expect(() => target('', {})).to.throw('invalid call')
  })

  it('should have default plugin ready', () => {
    expect(typeof target.vueProper.created).to.eql('function')
  })

  it('should replace default plugin', () => {
    let old = target.vueProper, nw = target({}, 'test')
    expect(typeof nw.created).to.eql('function')
    expect(nw).to.not.equal(old)
    expect(old = target.vueProper).to.equal(nw)
    expect(target('')).to.not.equal(old)
  })
})
