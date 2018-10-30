const test = require('tape');
import testHelpers from '/tests/testHelpers.mjs';
import jsonComplete from '/src/main.mjs';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Number: Normal', (t) => {
    t.plan(1);
    t.equal(decode(encode([1]))[0], 1);
});

test('Number: 0', (t) => {
    t.plan(1);
    t.equal(decode(encode([0]))[0], 0);
});

test('Number: -1', (t) => {
    t.plan(1);
    t.equal(decode(encode([-1]))[0], -1);
});

test('Number: 3.14', (t) => {
    t.plan(1);
    t.equal(decode(encode([3.14]))[0], 3.14);
});

test('Number: Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode([Infinity]))[0], Infinity);
});

test('Number: -Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode([-Infinity]))[0], -Infinity);
});

test('Number: NaN', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode([NaN]))[0]));
});

test('Number: -0', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNegativeZero(decode(encode([-0]))[0]));
});

test('Number: Root Value Number', (t) => {
    t.plan(1);
    t.equal(decode(encode(1)), 1);
});

test('Number: Root Value Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode(Infinity)), Infinity);
});

test('Number: Root Value -Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode(-Infinity)), -Infinity);
});

test('Number: Root Value NaN', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode(NaN))));
});

test('Number: Root Value -0', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNegativeZero(decode(encode(-0))));
});