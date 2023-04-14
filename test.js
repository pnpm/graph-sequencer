'use strict';
const graphSequencer = require('./');

test('graph with no dependencies', () => {
  expect(
    graphSequencer({
      graph: new Map([
        ['a', []],
        ['b', []],
        ['c', []],
        ['d', []],
      ]),
      groups: [['a', 'b', 'c', 'd']],
    })
  ).toStrictEqual(
    {
      safe: true,
      chunks: [['a', 'b', 'c', 'd']],
      cycles: [],
    },
  );
});

test('graph with multiple dependencies on one item', () => {
  expect(
    graphSequencer({
      graph: new Map([
        ['a', ['d']],
        ['b', ['d']],
        ['c', []],
        ['d', []],
      ]),
      groups: [['a', 'b', 'c', 'd']],
    })
  ).toStrictEqual(
    {
      safe: true,
      chunks: [['c', 'd'], ['a', 'b']],
      cycles: [],
    },
  );
});

test('graph with resolved cycle', () => {
  expect(
    graphSequencer({
      graph: new Map([
        ['a', ['b']],
        ['b', ['c']],
        ['c', ['d']],
        ['d', ['a']],
      ]),
      groups: [['a'], ['b', 'c', 'd']],
    })
  ).toStrictEqual(
    {
      safe: true,
      chunks: [['a'], ['d'], ['c'], ['b']],
      cycles: [],
    },
  );
});

test('graph with resolved cycle with multiple unblocked deps', () => {
  expect(
    graphSequencer({
      graph: new Map([
        ['a', ['d']],
        ['b', ['d']],
        ['c', ['d']],
        ['d', ['a']],
      ]),
      groups: [['d'], ['a', 'b', 'c']],
    })
  ).toStrictEqual(
    {
      safe: true,
      chunks: [['d'], ['a', 'b', 'c']],
      cycles: [],
    },
  );
});

test('graph with unresolved cycle', () => {
  expect(
    graphSequencer({
      graph: new Map([
        ['a', ['b']],
        ['b', ['c']],
        ['c', ['d']],
        ['d', ['a']],
      ]),
      groups: [['a', 'b', 'c', 'd']],
    })
  ).toStrictEqual(
    {
      safe: false,
      chunks: [['a'], ['d'], ['c'], ['b']],
      cycles: [['a', 'b', 'c', 'd']],
    },
  );
});

test('graph with multiple cycles', () => {
  expect(
    graphSequencer({
      graph: new Map([
        ['a', ['b']],
        ['b', ['a']],
        ['c', ['d']],
        ['d', ['c']],
      ]),
      groups: [['a', 'b', 'c', 'd']],
    })
  ).toStrictEqual(
    {
      safe: false,
      chunks: [['a'], ['b'], ['c'], ['d']],
      cycles: [['a', 'b'], ['c', 'd']],
    },
  );
});

test('graph with multiple cycles where one is resolved', () => {
  expect(
    graphSequencer({
      graph: new Map([
        ['a', ['b']],
        ['b', ['a']],
        ['c', ['d']],
        ['d', ['c']],
      ]),
      groups: [['a', 'b', 'c'], ['d']],
    })
  ).toStrictEqual(
    {
      safe: false,
      chunks: [['c'], ['d'], ['a'], ['b']],
      cycles: [['a', 'b']],
    },
  );
});

test('graph with multiple resolves cycles', () => {
  expect(
    graphSequencer({
      graph: new Map([
        ['a', ['b']],
        ['b', ['a']],
        ['c', ['d']],
        ['d', ['c']],
      ]),
      groups: [['b', 'c'], ['a', 'd']],
    })
  ).toStrictEqual(
    {
      safe: true,
      chunks: [['b', 'c'], ['a', 'd']],
      cycles: [],
    },
  );
});
