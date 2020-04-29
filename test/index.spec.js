'use strict'
const ME = 'index'
process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const _ = require('lodash')
const target = require('../src/' + ME)

const FIELDS = 'compose name prefix suffix'.split(' ')

const VM = { $options: { _componentTag: 'my-self' } }
const DICT = { a: 'A', '/custom/': { a: 'CA' } }

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
      vm = _.assign({ proper: true }, VM, target(DICT))
      vm.created()
      expect(() => vm.proper()).to.throw(Error, 'vm.proper is not a function')
      vm = _.assign({}, VM, target(DICT))
      vm.created()
      expect(() => vm.proper()).to.throw(Error, 'vm.proper is not a function')
    })

    it('should bind helpers', () => {
      vm = _.assign({ proper: () => undefined }, VM, target(DICT))
      vm.created()
      expect(Object.keys(vm.proper(null)).sort()).to.eql(FIELDS)
      expect(Object.keys(vm.proper({})).sort()).to.eql(FIELDS)
    })

    it('should do standard stuff', () => {
      expect(vm.proper('field')).to.eql(
        { a: 'A', label: 'field', name: 'field', ref: 'field' })
      expect(vm.proper()).to.eql({ a: 'A' })
    })

    it('should use properName() method', () => {
      vm = _.assign({ properName: () => 'custom' }, VM)
      _.assign(vm, { proper: () => undefined }, target(DICT))
      vm.created()
      expect(vm.proper(null).name).to.equal('MySelf')
      expect(vm.proper('field')).to.eql(
        { a: 'CA', label: 'field', name: 'field', ref: 'field' })
      expect(vm.proper()).to.eql({ a: 'CA' })
    })
  })
})
