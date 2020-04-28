'use strict'
const ME = 'dictionary'
process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const _ = require('lodash')
const target = require('../src/' + ME)

//  Retrieval key format:  prefix : context > name ! suffix
//  Root level attributes.
const dRoot = { attr1: 1, attr2: 2 }

const resName = { color: 'black', outlined: true, rounded: false }
const resSur = {
  borderless: true,
  color: 'black',
  outlined: false,
  rounded: false
}
const resSurF = _.assign({}, resSur, { color: 'red' })


//  Attribute name:
const rx = /^([a-z][\w-]*\w)$/i
//  Any key not an attribute name is expected to be a RegExp definition.
//  If key starts and ends with slash '/', then both will be stripped.


const defs0 = {}
const defs1 = {
  '/fun/i': {
    attr1: 'fun1',
    '>a!': { attr1: 'fun1-a' }
  },
  '!bad$': { attr2: 'red', '>a!': { attr2: 'blue' } }
}

_.assign(defs1, dRoot)

let res

describe(ME, () => {
  it('retrieve should fail before initialization', () => {
    expect(() => target.retrieve('')).to.throw('dictionary is not set')
  })

  describe('defs1', () => {
    it('should fail with bad definition', () => {
      expect(() => target.set([])).to.throw(TypeError, 'root level')
      expect(() => target.set(42)).to.throw(TypeError, 'root level')
      expect(() => target.set({ 'a/': 3 })).to.throw(Error, `by key 'a/'`)
    })

    it('should set', () => {
      expect(target.set(defs0)).to.equal(undefined)
      expect(target.set(defs1)).to.eql(defs0)
      expect(target.set(defs1)).to.not.equal(defs0)
    })

    it('should retrieve defaults', () => {
      expect(res = target.retrieve('none')).to.eql(dRoot)
    })

    it('should cache', () => {
      res.attr2 = 'x'   //  Modifying cache is a bad idea - here we just test!
      expect(target.retrieve('none').attr2).to.equal('x')
      expect(target.retrieve()).to.eql({})                //  Reset cache.
      expect(target.retrieve('nome').attr2).to.equal(2)
    })

    it('should retrieve combined', () => {
      expect(target.retrieve('a/b/justfun>a!bad')).to.eql(
        { attr1: 'fun1-a', attr2: 'blue' })
      expect(target.retrieve('a/b/justfun>b!bad')).to.eql(
        { attr1: 'fun1', attr2: 'red' })
      expect(target.retrieve('a/b/justfun>a!good')).to.eql(
        { attr1: 'fun1-a', attr2: 2 })
    })
  })
})
