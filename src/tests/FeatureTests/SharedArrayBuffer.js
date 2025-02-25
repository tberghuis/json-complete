const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof SharedArrayBuffer === 'function') {
    test('SharedArrayBuffer: Normal', (t) => {
        t.plan(3);

        const sab = new SharedArrayBuffer(2);
        const a = new Uint8Array(sab);

        a[0] = 1;
        a[1] = 2;

        const decoded = decode(encode([sab]))[0];

        t.equal(testHelpers.systemName(decoded), '[object SharedArrayBuffer]');
        t.equal(decoded.byteLength, 2);
        t.deepEqual(new Uint8Array(decoded), [1, 2]);
    });

    test('SharedArrayBuffer: Empty Cells', (t) => {
        t.plan(4);

        const sab = new SharedArrayBuffer(2);
        const a = new Uint8Array(sab);

        a[0] = 1;

        const decoded = decode(encode([sab]))[0];

        t.equal(testHelpers.systemName(decoded), '[object SharedArrayBuffer]');
        t.equal(decoded.byteLength, 2);
        t.equal(new Uint8Array(decoded)[0], 1);
        t.equal(new Uint8Array(decoded)[1], 0);
    });

    test('SharedArrayBuffer: Empty', (t) => {
        t.plan(2);

        const sab = new SharedArrayBuffer(0);

        const decoded = decode(encode([sab]))[0];

        t.equal(testHelpers.systemName(decoded), '[object SharedArrayBuffer]');
        t.equal(decoded.byteLength, 0);
    });

    test('SharedArrayBuffer: Root Value', (t) => {
        t.plan(1);

        const sab = new SharedArrayBuffer(2);
        const a = new Uint8Array(sab);

        a[0] = 1;

        t.deepEqual(new Uint8Array(decode(encode(sab))), new Uint8Array([1, 0]));
    });

    test('SharedArrayBuffer: Index Key', (t) => {
        t.plan(7);

        const sab = new SharedArrayBuffer(2);
        const a = new Uint8Array(sab);

        a[0] = 1;
        a[1] = 2;
        sab[0] = 5;
        sab[8] = 9;

        const decoded = decode(encode([sab]))[0];

        t.equal(testHelpers.systemName(decoded), '[object SharedArrayBuffer]');
        t.equal(decoded.byteLength, 2);
        t.deepEqual(new Uint8Array(decoded), [1, 2]);
        t.equal(decoded[0], 5);
        t.equal(decoded[8], 9);
        t.equal(decoded['0'], 5);
        t.equal(decoded['8'], 9);
    });

    StandardObjectTests('SharedArrayBuffer', 'SharedArrayBuffer', () => {
        return new SharedArrayBuffer(2);
    });

    test('SharedArrayBuffer: Encoding Expected', (t) => {
        t.plan(1);

        const sab = new SharedArrayBuffer(1);
        const a = new Uint8Array(sab);

        a[0] = 1;
        sab.b = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(sab)), {
            X: 'N0 S0 $3',
            N: '4',
            S: [
                'b',
            ],
            r: 'X0',
        });
    });
}
else {
    console.log('Tests for SharedArrayBuffer type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
