'use strict'
process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const _ = require('lodash')
const target = require('../src/texts')

describe('texts', () => {
  it('should start with empty dictionary', () => {
    expect(target.get()).to.eql({})
    expect(target('a', 'c1')).to.eql({ label: 'a' })
  })

  it('should retrieve texts', () => {
    let d = target.set({ a: 'A', b: { hint: 'BH', place: 'B' } })
    expect(target('a', 'c1')).to.eql({ label: 'A' })
    d['c1.a'] = 'AA'
    expect(target('a', 'c1')).to.eql({ label: 'AA' })
    expect(target('b', 'c1')).to.eql({ hint: 'BH', place: 'B' })
    expect(target('x')).to.eql({ label: 'x' })
    expect(target('x', '', true)).to.eql({})
    expect(target('a', 'strange', false)).to.equal('A')
    expect(target('b', 'strange', false)).to.equal('b')
    expect(target('x', 'strange', false)).to.equal('x')
  })

  it('should fail with bad dictionary assignment', () => {
    expect(() => target.set([2])).to.throw(TypeError, 'object')
    expect(() => target.set(() => 0)).to.throw(TypeError, 'object')
    expect(() => target.set(Symbol())).to.throw(TypeError, 'object')
  })

  it('should not mutate the original definition', () => {
    const def = { a: { l: 'A' } }, d = target.set(def)

    expect(d).to.eql(def)
    expect(d).not.to.equal(def)
    d.a.l = 'B'
    expect(target('a', '')).to.eql({ l: 'B' })
    expect(def).to.eql({ a: { l: 'A' } })
  })
})
