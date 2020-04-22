'use strict'
const ME = 'dictionary'
process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const _ = require('lodash')
const target = require('../src/' + ME)

const data0 = { color: 'black', outlined: true, rounded: true }
const resName = { color: 'black', outlined: true, rounded: false }
const resSur = {
  borderless: true,
  color: 'black',
  outlined: false,
  rounded: false
}
const resSurF = _.assign({}, resSur, {color: 'red'})

const defs0 = {}
const defs1 = {
  '/straightname[^>]*>me>.*name!/': {
    rounded: false,
    '/me>surname!/': {
      borderless: true,
      outlined: false
    }
  },
  '/!failed/i': { color: 'red' }
}

_.assign(defs1, data0)

let res

describe(ME, () => {
  it('retrieve should fail before initialization', () => {
    expect(() => target.retrieve('')).to.throw('dictionary is not set')
  })

  describe('defs1', () => {
    it('should set', () => {
      expect(() => target.set([])).to.throw(TypeError)
      expect(() => target.set(42)).to.throw(TypeError)
      expect(target.set(defs0)).to.equal(undefined)
      expect(target.set(defs1)).to.eql(defs0)
      expect(target.set(defs1)).to.not.equal(defs0)
    })

    it('should retrieve defaults', () => {
      expect(res = target.retrieve('some')).to.eql(data0)
    })

    it('should cache', () => {
      res.color = 'blue'                    //  Modifying cache is a bad idea!
      expect(target.retrieve('some').color).to.eql('blue')
      expect(target.retrieve()).to.eql({})  //  Resetting cache.
      expect(target.retrieve('some').color).to.eql('black')
    })

    it('should retrieve combined', () => {
      expect(target.retrieve('a/b/c>d>e!failed')).to.eql(
        { color: 'red', outlined: true, rounded: true })
      expect(target.retrieve('oh/so-straightname>me>name!')).to.eql(resName,
        'name')
      expect(target.retrieve('oh/so-straightname>me>surname!')).to.eql(resSur,
        'surname')
      expect(target.retrieve('oh/so-straightname>me>surname!failed'))
        .to.eql(resSurF, 'surname failed')
    })
  })
})
