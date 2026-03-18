/**
 * Lazily filters iterable values.
 *
 * @template T
 * @param {Iterable<T>} values
 * @param {(value: T) => boolean} predicate
 * @returns {Generator<T>}
 */
function* lazyFilter(values, predicate) {
    for (const value of values) {
        if (predicate(value)) {
            yield value;
        }
    }
}

/**
 * Lazily maps iterable values.
 *
 * @template T, U
 * @param {Iterable<T>} values
 * @param {(value: T) => U} mapper
 * @returns {Generator<U>}
 */
function* lazyMap(values, mapper) {
    for (const value of values) {
        yield mapper(value);
    }
}

/**
 * Materializes an iterable into an array.
 *
 * @template T
 * @param {Iterable<T>} values
 * @returns {T[]}
 */
const toArray = (values) => [...values];

module.exports = {
    lazyFilter,
    lazyMap,
    toArray,
};