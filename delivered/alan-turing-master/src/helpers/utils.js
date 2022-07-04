const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

const isInt = (n) => {
    return Number.isInteger(n) || (typeof n === 'number' && isFinite(n) && Math.floor(n) === n)
}

const isNumeric = (n) => {
    if (typeof n == 'object') {
        let result = Object.values(n).map(i => isInt(i))
        // eslint-disable-next-line no-undef
         return nj.sum(result) === n.length
    } else {
        return isInt(n)
    }
}

const median = (arr) => {
    arr.sort((a, b) => (a - b));
    var i = arr.length / 2;
    return i % 1 === 0 ? (arr[i - 1] + arr[i]) / 2 : arr[Math.floor(i)];
}

export { assert, isInt, isNumeric, median };
