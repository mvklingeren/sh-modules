//# counter - module / counter.js:
exports.count = 0;

exports.increment = function () {
    exports.count++;
    context.postMessage({ type: 'counter', value: exports.count });
};

exports.run = function () {
    setInterval(exports.increment, 1000);
};