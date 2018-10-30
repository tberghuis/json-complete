const test = require('tape');
import testHelpers from '/tests/testHelpers.mjs';
import jsonComplete from '/src/main.mjs';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

// Node does not natively support Blobs, so only run these tests in the Browser
/* istanbul ignore next */
if (testHelpers.isInBrowser()) {
    test('Blob: Normal', (t) => {
        t.plan(3);

        const obj = { a: 1 };
        const source = new Blob([JSON.stringify(obj)], { type: 'application/json' });

        encode([source], (encoded) => {
            const decoded = decode(encoded)[0];

            const reader = new FileReader();
            reader.addEventListener('loadend', function() {
                t.deepEqual(JSON.parse(reader.result), obj);
            });
            reader.readAsText(decoded);

            t.equal(testHelpers.systemName(decoded), '[object Blob]');
            t.equal(decoded.type, 'application/json');
        });
    });

    test('Blob: Empty Type', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const source = new Blob([JSON.stringify(obj)]);

        encode([source], (encoded) => {
            const decoded = decode(encoded)[0];

            t.equal(testHelpers.systemName(decoded), '[object Blob]');
            t.equal(decoded.type, '');
        });
    });

    test('Blob: Root Value', (t) => {
        t.plan(3);

        const obj = { a: 1 };
        const source = new Blob([JSON.stringify(obj)], { type: 'application/json' });

        encode(source, (encoded) => {
            const decoded = decode(encoded);

            const reader = new FileReader();
            reader.addEventListener('loadend', function() {
                t.deepEqual(JSON.parse(reader.result), obj);
            });
            reader.readAsText(decoded);

            t.equal(testHelpers.systemName(decoded), '[object Blob]');
            t.equal(decoded.type, 'application/json');
        });
    });

    test('Blob: Arbitrary Attached Data', (t) => {
        t.plan(3);

        const obj = { a: 1 };
        const source = new Blob([JSON.stringify(obj)], { type: 'application/json' });
        source.x = 2;
        source[Symbol.for('Blob')] = 'test';

        encode([source], (encoded) => {
            const decoded = decode(encoded)[0];

            t.equal(testHelpers.systemName(decoded), '[object Blob]');
            t.equal(decoded.x, 2);
            t.equal(decoded[Symbol.for('Blob')], 'test');
        });
    });

    test('Blob: Self-Containment', (t) => {
        t.plan(1);

        const obj = { a: 1 };
        const source = new Blob([JSON.stringify(obj)], { type: 'application/json' });
        source.me = source;

        encode([source], (encoded) => {
            const decoded = decode(encoded)[0];

            t.equal(decoded.me, decoded);
        });
    });

    test('Blob: Referencial Integrity', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const source = new Blob([JSON.stringify(obj)], { type: 'application/json' });

        encode({
            x: source,
            y: source,
        }, (encoded) => {
            const decoded = decode(encoded);

            t.equal(decoded.x, decoded.y);
            t.notEqual(decoded.x, source);
        });
    });
}