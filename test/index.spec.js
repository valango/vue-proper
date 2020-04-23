'use strict'
const ME = 'index'
process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const _ = require('lodash')
const target = require('../src/' + ME)

const FIELDS = 'compose debug enhance name prefix suffix'.split(' ')

const VM = { $options: { _componentTag: 'my-self' } }

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

  describe('should run default namespace', () => {
    let vm

    it('should ignore', () => {
      vm = _.assign({ proper: true }, VM, target({ a: 'A' }))
      vm.created()
      expect(() => vm.proper()).to.throw(Error, 'vm.proper is not a function')
      vm = _.assign({}, VM, target({ a: 'A' }))
      vm.created()
      expect(() => vm.proper()).to.throw(Error, 'vm.proper is not a function')
    })

    it('should bind helpers', () => {
      vm = _.assign({ proper: () => undefined }, VM, target({ a: 'A' }))
      vm.created()
      expect(Object.keys(vm.proper(null)).sort()).to.eql(FIELDS)
      expect(Object.keys(vm.proper({})).sort()).to.eql(FIELDS)
    })

    it('should do standard stuff', () => {
      expect(vm.proper('field')).to.eql({ a: 'A', name: 'field', ref: 'field' })
      expect(vm.proper()).to.eql({ a: 'A' })
    })
  })
})
