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
      expect(typeof vm.properEnd).to.equal('function')
      expect(typeof vm.properStd).to.equal('undefined')
      expect(typeof vm.properKeyStd).to.equal('undefined')
      expect(typeof vm.properEndStd).to.equal('undefined')
    })

    it('should do standard stuff', () => {
      expect(vm.proper('field')).to.eql({ a: 'A', name: 'field', ref: 'field' })
      expect(vm.proper()).to.eql({ a: 'A' })
      let retrievalKey
      vm.properEnd = (r, f, key) => (retrievalKey = key) && r
      vm.proper('field')
      expect(retrievalKey).to.equal('MySelf>field!')
      vm.proper()
      expect(retrievalKey).to.equal('MySelf>!')
    })

    it('should fail w bad property type', () => {
      vm = _.assign({ proper: () => undefined, properEnd: true }, VM, target({}))
      expect(() => vm.created()).to.throw(Error, /is expected$/)
    })

    it('should fail with occupied fallback name', () => {
      vm = _.assign({ proper: () => 0, properStd: () => 0 }, VM, target({}))
      expect(() => vm.created()).to.throw(Error, 'both')
    })

    it('should use fallback', () => {
      const stub = () => ({b: 'B'})
      vm = _.assign({ proper: stub, properKey: stub, properEnd: stub }, VM, target({}))
      vm.created()
      expect(vm.proper).to.equal(stub)
      expect(vm.properKey).to.equal(stub)
      expect(vm.properEnd).to.equal(stub)
      expect(vm.properStd).to.not.equal(stub)
      expect(vm.properKeyStd).to.not.equal(stub)
      expect(vm.properEndStd).to.not.equal(stub)
      expect(typeof vm.properStd).to.equal('function')
      expect(typeof vm.properKeyStd).to.equal('function')
      expect(typeof vm.properEndStd).to.equal('function')
    })
  })
})
