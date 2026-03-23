/**
 * @fileoverview Character Repository — Storage Layer
 *
 * This is the ONLY module allowed to perform file I/O side effects.
 * All other layers (service, cli) remain pure or side-effect-free.
 */

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "characters.json");

const { Right, Left } = require("../utils/either");

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

const EMPTY_CHARACTERS = Object.freeze([]);

/**
 * Safely parse JSON and return a fallback if parsing fails.
 *
 * @template T
 * @param {string} raw
 * @param {T} fallback
 * @returns {T}
 */
const parseJSON = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
const isRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @param {unknown} value
 * @returns {string}
 */
const toSafeString = (value) =>
    typeof value === "string" ? value : "";

/**
 * @param {unknown} value
 * @returns {number}
 */
const toSafePositiveInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
};

/**
 * Normalize one unknown value into a Character or null.
 *
 * @param {unknown} value
 * @returns {Character | null}
 */
const normalizeCharacter = (value) => {
  if (!isRecord(value)) return null;

  const character = {
    id: toSafeString(value.id),
    name: toSafeString(value.name),
    age: toSafePositiveInteger(value.age),
    race: toSafeString(value.race),
    gender: toSafeString(value.gender),
    height: toSafeString(value.height),
    description: toSafeString(value.description),
    primaryRole: toSafeString(value.primaryRole),
    ultimateWeapon: toSafeString(value.ultimateWeapon),
  };

  return character.id && character.name ? character : null;
};

/**
 * Normalize unknown parsed data into a clean Character[].
 *
 * @param {unknown} value
 * @returns {Character[]}
 */
const normalizeCharacters = (value) =>
    Array.isArray(value)
        ? value
            .map(normalizeCharacter)
            .filter((character) => character !== null)
        : EMPTY_CHARACTERS;

/**
 * Load all characters from disk.
 * Side effects remain isolated here.
 *
 * @returns {Character[]}
 */
const loadCharacters = () => {
  if (!fs.existsSync(DB_PATH)) {
    return EMPTY_CHARACTERS;
  }

  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const parsed = parseJSON(raw, EMPTY_CHARACTERS);

  return normalizeCharacters(parsed);
};

/**
 * Persist the full character array to disk.
 * Side effects remain isolated here.
 *
 * @param {Character[]} characters
 * @returns {void}
 */
const saveCharacters = (characters) => {
  const normalizedCharacters = normalizeCharacters(characters);
  fs.writeFileSync(
      DB_PATH,
      JSON.stringify(normalizedCharacters, null, 2),
      "utf-8"
  );
};

/**
 * Functional error handling variant for loading character data.
 * Models external data handling via Either.
 *
 * @returns {{ tag: "Right", value: Array<Object> } | { tag: "Left", error: string }}
 */
const loadCharactersEither = () => {
  try {
    const characters = loadCharacters();
    return Right(characters);
  } catch (error) {
    return Left(`Failed to load character data: ${error.message}`);
  }
};

module.exports = { loadCharacters, saveCharacters, loadCharactersEither };