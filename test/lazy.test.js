const test = require("node:test");
const assert = require("node:assert/strict");

const { lazyFilter, lazyMap, toArray } = require("../utils/lazy");

test("lazyFilter returns only matching values when materialized", () => {
    const values = [1, 2, 3, 4, 5, 6];

    const result = toArray(lazyFilter(values, (value) => value % 2 === 0));

    assert.deepEqual(result, [2, 4, 6]);
});

test("lazyMap transforms values when materialized", () => {
    const values = [1, 2, 3];

    const result = toArray(lazyMap(values, (value) => value * 10));

    assert.deepEqual(result, [10, 20, 30]);
});

test("lazyFilter and lazyMap can be composed into a pipeline", () => {
    const values = [1, 2, 3, 4, 5, 6];

    const result = toArray(
        lazyMap(
            lazyFilter(values, (value) => value % 2 === 0),
            (value) => value * 2
        )
    );

    assert.deepEqual(result, [4, 8, 12]);
});

test("lazyFilter does not evaluate values until consumed", () => {
    const values = [1, 2, 3, 4];
    let calls = 0;

    const filtered = lazyFilter(values, (value) => {
        calls += 1;
        return value % 2 === 0;
    });

    assert.equal(calls, 0);

    const result = toArray(filtered);

    assert.equal(calls, 4);
    assert.deepEqual(result, [2, 4]);
});

test("lazyMap does not evaluate values until consumed", () => {
    const values = [1, 2, 3];
    let calls = 0;

    const mapped = lazyMap(values, (value) => {
        calls += 1;
        return value + 1;
    });

    assert.equal(calls, 0);

    const result = toArray(mapped);

    assert.equal(calls, 3);
    assert.deepEqual(result, [2, 3, 4]);
});

test("toArray materializes an iterable into an array", () => {
    function* values() {
        yield "Lightning";
        yield "Hope";
        yield "Fang";
    }

    const result = toArray(values());

    assert.deepEqual(result, ["Lightning", "Hope", "Fang"]);
});