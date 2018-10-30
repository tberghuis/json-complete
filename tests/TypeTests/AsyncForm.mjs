const test = require('tape');
import jsonComplete from '/src/main.mjs';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Async Form: Using Callback', (t) => {
    t.plan(2);

    // Encode can also operate in async mode, if given a callback function
    const immediateResult = encode([1], (encoded) => {
        const decoded = decode(encoded)[0];

        t.equal(decoded, 1);
    });

    t.equal(immediateResult, void 0);
});