const isContainerPointerKey = require('./utils/isContainerPointerKey.js');
const isSimplePointerKey = require('./utils/isSimplePointerKey.js');

const genDecodePointer = (pointer) => {
    return {
        k: String.prototype.substr.call(pointer, 0, 2),
        i: pointer.length <= 2 ? -1 : parseInt(String.prototype.substr.call(pointer, 2), 10),
        p: pointer,
    };
};

const getExisting = (data, p) => {
    // Simple PointerKeys are their own Pointers
    if (isSimplePointerKey(p.k)) {
        return types[p.k].g(data, p);
    }

    // Ensure that the value storage list exists
    data[p.k] = data[p.k] || [];

    // Return any value that exists at the Pointer location
    return data[p.k][p.i];
};

const getExistingOrCreate = (data, p) => {
    const ref = getExisting(data, p);

    if (ref) {
        return ref;
    }

    // If it doesn't exist, create it and store it
    data[p.k][p.i] = types[p.k].n(data, p);
    return data[p.k][p.i];
};

const getP = (data, p) => {
    return data.e[p.k][p.i];
};

const genValueOf = (data, p) => {
    const vp = genDecodePointer(getP(data, p)[0][1]);
    return types[vp.k].g(data, vp);
};

const tryEnqueuePointerItem = (data, p) => {
    if ((data[p.k] || [])[p.i] === void 0) {
        Array.prototype.push.call(data.q, p);
    }
};

const genContainerPart = (data, pointer) => {
    const p = genDecodePointer(pointer);

    if (isContainerPointerKey(p.k)) {
        tryEnqueuePointerItem(data, p);
        return getExistingOrCreate(data, p);
    }
    else {
        return generate(data, p);
    }
};

const containerGenerator = (data, p) => {
    let pairs = getP(data, p);

    const container = getExistingOrCreate(data, p);

    if (p.k === 'Se' || p.k === 'WS') {
        const pairLength = pairs.length;
        for (let i = 0; i < pairLength; i += 1) {
            container.add(genContainerPart(data, pairs[i][1]));
        }

        return container;
    }

    // Skip the first item if it is the valueOf value, indicated by a null key
    // Since Maps and WeakMaps can have null keys, they need to be accounted for
    let i = (pairs[0] || [])[0] === 'nl' ? 1 : 0;

    const pairLength = pairs.length;
    for (; i < pairLength; i += 1) {
        container[genContainerPart(data, pairs[i][0])] = genContainerPart(data, pairs[i][1]);
    }

    return container;
};

const generate = (data, p) => {
    // Containers values need to handle their own existing Pointer handling
    if (!isContainerPointerKey(p.k)) {
        const existingValue = getExisting(data, p);
        if (existingValue !== void 0) {
            return existingValue;
        }
    }

    return types[p.k] === void 0 ? p.p : types[p.k].g(data, p);
};

const genIdentityGenerator = (v) => {
    return {
        g: () => {
            return v;
        },
    }
};

const genTypeArrayGenerator = (type) => {
    return {
        g: containerGenerator,
        n: (data, p) => {
            return new type(getP(data, p).length);
        },
    };
};

const genValueObjectGenerator = (type) => {
    return {
        g: containerGenerator,
        n: (data, p) => {
            return new type(genValueOf(data, p));
        },
    };
}

const types = {
    'un': genIdentityGenerator(void 0),
    'nl': genIdentityGenerator(null),
    'bt': genIdentityGenerator(true),
    'bf': genIdentityGenerator(false),
    'na': genIdentityGenerator(NaN),
    '-i': genIdentityGenerator(-Infinity),
    '+i': genIdentityGenerator(Infinity),
    'n0': genIdentityGenerator(-0),
    'nm': {
        g: getP,
    },
    'st': {
        g: getP,
    },
    're': {
        g: containerGenerator,
        n: (data, p) => {
            const encodedArray = getP(data, genDecodePointer(getP(data, p)[0][1]));
            const value = new RegExp(getP(data, genDecodePointer(encodedArray[0][1])), getP(data, genDecodePointer(encodedArray[1][1])));
            value.lastIndex = getP(data, genDecodePointer(encodedArray[2][1]));

            return value;
        },
    },
    'sy': {
        g: (data, p) => {
            // Manually decode the array container format
            const valueArray = getP(data, genDecodePointer(getP(data, p)));

            const type = getP(data, genDecodePointer(valueArray[0][1]));
            const name = getP(data, genDecodePointer(valueArray[1][1]));

            data[p.k][p.i] = type === 1 ? Symbol.for(name) : Symbol(name);

            return data[p.k][p.i];
        },
    },
    'fu': {
        g: containerGenerator,
        n: (data, p) => {
            const decodedValue = genValueOf(data, p);

            let box = {};

            try {
                eval(`box.fn = ${decodedValue};`);
                return box.fn;
            }
            catch (e) {
                // If it was an error, then it's possible that the item was a Method Function
                if (e instanceof SyntaxError) {
                    eval(`box = { ${decodedValue} };`);
                    const key = String.prototype.match.call(decodedValue, /\s*([^\s(]+)\s*\(/)[1];
                    return box[key];
                }
            }
        },
    },
    'ob': {
        g: containerGenerator,
        n: () => {
            return {};
        },
    },
    'ar': {
        g: containerGenerator,
        n: () => {
            return [];
        },
    },
    'da': genValueObjectGenerator(Date),
    'BO': genValueObjectGenerator(Boolean),
    'NM': genValueObjectGenerator(Number),
    'ST': genValueObjectGenerator(String),
    'I1': genTypeArrayGenerator(Int8Array),
    'U1': genTypeArrayGenerator(Uint8Array),
    'C1': genTypeArrayGenerator(Uint8ClampedArray),
    'I2': genTypeArrayGenerator(Int16Array),
    'U2': genTypeArrayGenerator(Uint16Array),
    'I3': genTypeArrayGenerator(Int32Array),
    'U3': genTypeArrayGenerator(Uint32Array),
    'F3': genTypeArrayGenerator(Float32Array),
    'F4': genTypeArrayGenerator(Float64Array),
    'Se': {
        g: containerGenerator,
        n: () => {
            return new Set();
        },
    },
};

module.exports = (encodedData) => {
    const encodedDataObj = {};
    for (let e = 0; e < encodedData.length; e += 1) {
        encodedDataObj[encodedData[e][0]] = encodedData[e][1];
    }

    const data = {
        q: [], // Exploration Queue
        e: encodedDataObj, // Encoded Data
    };

    // Create PointerItem from root
    const rp = genDecodePointer(data.e.r);

    // If root value is a not a container, return its value directly
    if (!isContainerPointerKey(rp.k)) {
        return generate(data, rp);
    }

    // Prep the Exploration Queue to explore from the root
    Array.prototype.push.call(data.q, rp);

    while (data.q.length > 0) {
        generate(data, Array.prototype.shift.call(data.q));
    }

    return data[rp.k][rp.i];
};
