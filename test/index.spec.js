'use strict'
const ME = 'index'
process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const _ = require('lodash')
const target = require('../src/' + ME)

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

    it('should leave untouched', () => {
      vm = _.assign({}, VM, target({ a: 'A' }))
      vm.created()
      expect(vm.proper).to.equal(undefined)
      expect(vm.properKey).to.equal(undefined)
      expect(vm.properFinal).to.equal(undefined)
    })

    it('should bind helpers', () => {
      vm = _.assign({ proper: () => undefined }, VM, target({ a: 'A' }))
      vm.created()
      expect(typeof vm.proper).to.equal('function')
      expect(typeof vm.properKey).to.equal('function')
      expect(typeof vm.properFinal).to.equal('function')
    })

    it('should do the stuff', () => {
      expect(vm.proper('field')).to.eql({ a: 'A', name: 'field', ref: 'field' })
      expect(vm.proper()).to.eql({ a: 'A' })
    })
  })
})
