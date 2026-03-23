/**
 * @template T
 * @param {T} value
 * @returns {{ tag: "Right", value: T }}
 */
const Right = (value) => ({ tag: "Right", value });

/**
 * @template E
 * @param {E} error
 * @returns {{ tag: "Left", error: E }}
 */
const Left = (error) => ({ tag: "Left", error });

/**
 * @param {{ tag: "Right", value: unknown } | { tag: "Left", error: unknown }} either
 * @returns {boolean}
 */
const isRight = (either) => either.tag === "Right";

/**
 * @param {{ tag: "Right", value: unknown } | { tag: "Left", error: unknown }} either
 * @returns {boolean}
 */
const isLeft = (either) => either.tag === "Left";

/**
 * @template T, U, E
 * @param {{ tag: "Right", value: T } | { tag: "Left", error: E }} either
 * @param {(value: T) => U} fn
 * @returns {{ tag: "Right", value: U } | { tag: "Left", error: E }}
 */
const mapEither = (either, fn) => (isRight(either) ? Right(fn(either.value)) : either);

/**
 * Conditional recovery:
 * if Left -> use fallback function
 * if Right -> keep value
 *
 * @template T, E
 * @param {{ tag: "Right", value: T } | { tag: "Left", error: E }} either
 * @param {() => ({ tag: "Right", value: T } | { tag: "Left", error: E })} fallbackFn
 * @returns {{ tag: "Right", value: T } | { tag: "Left", error: E }}
 */
const orElse = (either, fallbackFn) => (isRight(either) ? either : fallbackFn());

module.exports = {
    Right,
    Left,
    isRight,
    isLeft,
    mapEither,
    orElse,
};