/* istanbul ignore next */
const systemName = (v) => {
    return Object.prototype.toString.call(v);
};

/* istanbul ignore next */
const isNanValue = (v) => {
    return systemName(v) === '[object Number]' && v !== v;
};

/* istanbul ignore next */
const isNegativeZero = (v) => {
    return v === -0 && (1 / v) === -Infinity
};

/* istanbul ignore next */
const isSymbol = (v) => {
    return systemName(v) === '[object Symbol]';
};

/* istanbul ignore next */
const isFunction = (v) => {
    return systemName(v) === '[object Function]';
};

/* istanbul ignore next */
const isObject = (v) => {
    return systemName(v) === '[object Object]';
};

/* istanbul ignore next */
const isArray = (v) => {
    return systemName(v) === '[object Array]';
};

/* istanbul ignore next */
const isInBrowser = () => {
    if (typeof document === 'undefined') {
        return false;
    }

    // Had to pull this out into variable to prevent uglify from too aggressively mangling the logic incorrectly
    const typeOfDocumentAll = typeof document.all;

    try {
        // https://github.com/denysdovhan/wtfjs#documentall-is-an-object-but-it-is-undefined
        return document.all instanceof Object && document.all !== void 0 && typeOfDocumentAll === 'undefined';
    }
    catch (e) {
        return false;
    }
};

export default {
    systemName: systemName,
    isNanValue: isNanValue,
    isNegativeZero: isNegativeZero,
    isSymbol: isSymbol,
    isFunction: isFunction,
    isObject: isObject,
    isArray: isArray,
    isInBrowser: isInBrowser,
};

// const isInBrowserThread = () => {
//     // Global window object, or window object with document key does not exist
//     if (typeof window === 'undefined' || !window || !window.document) {
//         return false;
//     }

//     // The value at the window document's key can be modified, and therefore isn't the really the global window
//     // Restore the old value and return
//     const oldDocument = window.document;
//     window.document = false;
//     if (!window.document) {
//         window.document = oldDocument;
//         return false;
//     }

//     // Had to pull this out into variable to prevent uglify from too aggressively mangling the logic incorrectly
//     const typeOfDocumentAll = typeof document.all;

//     try {
//         // https://github.com/denysdovhan/wtfjs#documentall-is-an-object-but-it-is-undefined
//         // document.all is an Object instance
//         // document.all is not equal to undefined
//         // Yet typeof document.all is undefined
//         // This is defined by the HTML spec, and as far as I know, cannot be emulated
//         return document.all instanceof Object && document.all !== void 0 && typeOfDocumentAll === 'undefined';
//     }
//     catch (e) {
//         return false;
//     }
// };

// const isInWorker = () => {
//     // Global self object, or self object with self key does not exist
//     if (typeof self === 'undefined' || !self || !self.self) {
//         return false;
//     }

//     // The value at the self's self key can be modified, and therefore isn't the really the global self
//     // Restore the old value and return
//     const oldSelf = self.self;
//     self.self = false;
//     if (!self.self) {
//         self.self = oldSelf;
//         return false;
//     }

//     return true;
// }

// module.exports = () => {
//     if (isInBrowserThread()) {
//         return window;
//     }

//     if (isInWorker()) {
//         return self;
//     }

//     return global;
// };