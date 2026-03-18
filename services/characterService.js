/**
 * @fileoverview Character Service — Pure Business Logic
 *
 * FP CONTRACT: Every exported function here is a PURE FUNCTION.
 * - No console.log, no file I/O, no mutation of arguments.
 * - Same input always produces the same output.
 * - Side effects live exclusively in characterRepository.js and menu.js.
 */

const { validateCharacter } = require("../utils/validators");

/**
 * @typedef {Object} Character
 * @property {string} id
 * @property {string} name
 * @property {number} age
 * @property {string} race
 * @property {string} gender
 * @property {string} height
 * @property {string} description
 * @property {string} primaryRole
 * @property {string} ultimateWeapon
 */

/**
 * @typedef {Object} FailureResult
 * @property {false} success
 * @property {string} error
 */

/**
 * @typedef {Object} AddSuccessResult
 * @property {true} success
 * @property {Character} character
 * @property {Character[]} characters
 */

/**
 * @typedef {Object} CollectionSuccessResult
 * @property {true} success
 * @property {Character[]} characters
 */

/**
 * @callback CharacterTransformer
 * @param {Character[]} characters
 * @returns {Character[]}
 */

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------

/**
 * Join validation errors into a single message.
 * @param {string[]} errors
 * @returns {string}
 */
const formatValidationError = (errors) => errors.join("\n");

/**
 * Return a success result for collection-updating operations.
 * @param {Character[]} characters
 * @returns {CollectionSuccessResult}
 */
const successWithCharacters = (characters) => ({
  success: true,
  characters,
});

/**
 * Return a failure result.
 * @param {string} error
 * @returns {FailureResult}
 */
const failure = (error) => ({
  success: false,
  error,
});

/**
 * Convert age to a number while preserving all other fields.
 * @param {Omit<Character, "id"> | Partial<Omit<Character, "id">>} data
 * @returns {Omit<Character, "id"> | Partial<Omit<Character, "id">>}
 */
const normaliseAge = (data) => ({
  ...data,
  ...(data.age !== undefined ? { age: Number(data.age) } : {}),
});

/**
 * Validate a character-like object and convert the validator result
 * into a business-friendly result shape.
 * @param {Record<string, unknown>} character
 * @returns {{ valid: true } | { valid: false, error: string }}
 */
const validateOrExplain = (character) => {
  const { valid, errors } = validateCharacter(character);
  return valid
      ? { valid: true }
      : { valid: false, error: formatValidationError(errors) };
};

/**
 * Build a new character with generated ID and normalised age.
 * @param {Character[]} characters
 * @param {Omit<Character, "id">} characterData
 * @returns {Character}
 */
const buildNewCharacter = (characters, characterData) => ({
  ...normaliseAge(characterData),
  id: generateNextId(characters),
});

/**
 * Merge updates into an existing character while preserving immutable ID.
 * @param {Character} existing
 * @param {Partial<Omit<Character, "id">>} updates
 * @returns {Character}
 */
const mergeCharacterUpdates = (existing, updates) => ({
  ...existing,
  ...normaliseAge(updates),
  id: existing.id,
});

/**
 * Find a single character by ID.
 * Pure: no side effects.
 * @param {Character[]} characters
 * @param {string} id
 * @returns {Character | undefined}
 */
const findCharacterById = (characters, id) =>
    characters.find((character) => character.id === id);

/**
 * Check whether a character exists.
 * @param {Character[]} characters
 * @param {string} id
 * @returns {boolean}
 */
const hasCharacterId = (characters, id) =>
    characters.some((character) => character.id === id);

/**
 * Replace one character by ID using an immutable map transformation.
 * @param {Character[]} characters
 * @param {string} id
 * @param {Character} replacement
 * @returns {Character[]}
 */
const replaceCharacterById = (characters, id, replacement) =>
    characters.map((character) => (character.id === id ? replacement : character));

/**
 * Remove one character by ID using immutable filtering.
 * @param {Character[]} characters
 * @param {string} id
 * @returns {Character[]}
 */
const removeCharacterById = (characters, id) =>
    characters.filter((character) => character.id !== id);

/**
 * Create a comparator from a projection function.
 * HOF: returns a reusable comparator builder.
 *
 * @template T
 * @param {(value: T) => string} project
 * @returns {(left: T, right: T) => number}
 */
const compareByString = (project) => (left, right) =>
    project(left).localeCompare(project(right));

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/**
 * Generate the next unique string ID from the existing character list.
 * Pure: depends only on the input array.
 * @param {Character[]} characters
 * @returns {string}
 */
const generateNextId = (characters) => {
  if (characters.length === 0) return "1";

  const maxId = characters.reduce(
      (max, character) => Math.max(max, Number(character.id)),
      0
  );

  return String(maxId + 1);
};

// ---------------------------------------------------------------------------
// CRUD operations — all immutable, pure, and explicit
// ---------------------------------------------------------------------------

/**
 * Add a new character to the collection.
 * @param {Character[]} characters
 * @param {Omit<Character, "id">} characterData
 * @returns {AddSuccessResult | FailureResult}
 */
const addCharacter = (characters, characterData) => {
  const validation = validateOrExplain(characterData);

  if (!validation.valid) {
    return failure(validation.error);
  }

  const newCharacter = buildNewCharacter(characters, characterData);

  return {
    success: true,
    character: newCharacter,
    characters: [...characters, newCharacter],
  };
};

/**
 * Update an existing character by ID.
 * @param {Character[]} characters
 * @param {string} id
 * @param {Partial<Omit<Character, "id">>} updates
 * @returns {CollectionSuccessResult | FailureResult}
 */
const updateCharacter = (characters, id, updates) => {
  const existing = findCharacterById(characters, id);

  if (!existing) {
    return failure(`Character with id "${id}" not found.`);
  }

  const mergedCharacter = mergeCharacterUpdates(existing, updates);
  const validation = validateOrExplain(mergedCharacter);

  if (!validation.valid) {
    return failure(validation.error);
  }

  return successWithCharacters(
      replaceCharacterById(characters, id, mergedCharacter)
  );
};

/**
 * Delete a character by ID.
 * @param {Character[]} characters
 * @param {string} id
 * @returns {CollectionSuccessResult | FailureResult}
 */
const deleteCharacter = (characters, id) => {
  if (!hasCharacterId(characters, id)) {
    return failure(`Character with id "${id}" not found.`);
  }

  return successWithCharacters(removeCharacterById(characters, id));
};

// ---------------------------------------------------------------------------
// Filtering / sorting / statistics
// ---------------------------------------------------------------------------

/**
 * Factory that returns a role-filter function.
 * Closure: the returned function captures the normalised role once.
 *
 * @param {string} role
 * @returns {(characters: Character[]) => Character[]}
 */
const createRoleFilter = (role) => {
  const normalisedRole = role.toLowerCase();

  return (characters) =>
      characters.filter(
          (character) => character.primaryRole.toLowerCase() === normalisedRole
      );
};

/**
 * Return the sorted character list (alphabetically by name).
 * Immutability: copies before sorting so the original array stays untouched.
 * @param {Character[]} characters
 * @returns {Character[]}
 */
const sortByName = (characters) =>
    [...characters].sort(compareByString((character) => character.name));

/**
 * Gather role statistics from the character list.
 * Uses reduce to build a new immutable accumulator at each step.
 *
 * @param {Character[]} characters
 * @returns {Record<string, number>}
 */
const getRoleStats = (characters) =>
    characters.reduce(
        (stats, character) => ({
          ...stats,
          [character.primaryRole]: (stats[character.primaryRole] ?? 0) + 1,
        }),
        {}
    );

module.exports = {
  addCharacter,
  updateCharacter,
  deleteCharacter,
  findCharacterById,
  createRoleFilter,
  sortByName,
  getRoleStats,
  generateNextId,
};