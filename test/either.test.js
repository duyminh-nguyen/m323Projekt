const test = require("node:test");
const assert = require("node:assert/strict");

const {
    Right,
    Left,
    isRight,
    isLeft,
    mapEither,
    orElse,
} = require("../utils/either");

test("Right wraps a successful value", () => {
    const result = Right(42);

    assert.equal(result.tag, "Right");
    assert.equal(result.value, 42);
});

test("Left wraps an error value", () => {
    const result = Left("Something failed");

    assert.equal(result.tag, "Left");
    assert.equal(result.error, "Something failed");
});

test("isRight identifies Right correctly", () => {
    assert.equal(isRight(Right("ok")), true);
    assert.equal(isRight(Left("fail")), false);
});

test("isLeft identifies Left correctly", () => {
    assert.equal(isLeft(Left("fail")), true);
    assert.equal(isLeft(Right("ok")), false);
});

test("mapEither transforms Right values", () => {
    const result = mapEither(Right(5), (value) => value * 2);

    assert.deepEqual(result, Right(10));
});

test("mapEither leaves Left unchanged", () => {
    const result = mapEither(Left("fail"), (value) => value * 2);

    assert.deepEqual(result, Left("fail"));
});

test("orElse keeps Right unchanged", () => {
    const result = orElse(Right("safe"), () => Right("fallback"));

    assert.deepEqual(result, Right("safe"));
});

test("orElse recovers from Left with fallback", () => {
    const result = orElse(Left("missing"), () => Right("fallback"));

    assert.deepEqual(result, Right("fallback"));
});