/**
 * @fileoverview Formatters — Pure Display Functions
 *
 * Transform data into human-readable strings.
 * No side effects — all functions return strings, never log directly.
 */

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
 * @typedef {"reset" | "bold" | "dim" | "cyan" | "yellow" | "green" | "red" | "magenta" | "white" | "bgBlue"} ColourName
 */

// ---------------------------------------------------------------------------
// ANSI colour helpers (pure string builders)
// ---------------------------------------------------------------------------

const COLOURS = Object.freeze({
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  bgBlue: "\x1b[44m",
});

/**
 * Join lines into a single display block.
 * @param {string[]} lines
 * @returns {string}
 */
const joinLines = (lines) => lines.join("\n");

/**
 * Map items to lines, then join them.
 * HOF helper for display pipelines.
 *
 * @template T
 * @param {(value: T, index: number) => string} mapper
 * @returns {(values: T[]) => string}
 */
const mapToLines = (mapper) => (values) => values.map(mapper).join("\n");

/**
 * Wrap text in an ANSI colour code.
 * Closure: captures a colour key and returns a specialised formatter.
 *
 * @param {ColourName} colour
 * @returns {(text: string) => string}
 */
const coloured = (colour) => (text) =>
    `${COLOURS[colour] ?? ""}${text}${COLOURS.reset}`;

// Partially applied colour functions — closures capturing a colour value
const bold = coloured("bold");
const cyan = coloured("cyan");
const yellow = coloured("yellow");
const green = coloured("green");
const red = coloured("red");
const magenta = coloured("magenta");
const dim = coloured("dim");

// ---------------------------------------------------------------------------
// Header / banner
// ---------------------------------------------------------------------------

const DIVIDER = cyan("═".repeat(60));
const THIN_DIVIDER = dim("─".repeat(60));

/**
 * Format the application banner.
 * @returns {string}
 */
const formatBanner = () =>
    joinLines([
      "",
      DIVIDER,
      bold(cyan("  ⚔  Final Fantasy XIII — Character Database Viewer  ⚔")),
      DIVIDER,
      "",
    ]);

// ---------------------------------------------------------------------------
// Character list
// ---------------------------------------------------------------------------

/**
 * Format a single character row for the list view.
 * Pure: same input → same output.
 *
 * @param {Character} character
 * @param {number} index
 * @returns {string}
 */
const formatCharacterRow = (character, index) =>
    `  ${yellow(String(index + 1).padStart(2, " "))}. ` +
    `${bold(character.name.padEnd(22))} ` +
    `${cyan(character.primaryRole.padEnd(12))} ` +
    `${dim(`Age ${character.age}`)}`;

/**
 * Render the list header.
 * @returns {string}
 */
const formatCharacterListHeader = () =>
    joinLines([
      "",
      bold(`  ${"#".padStart(2)}  ${"Name".padEnd(22)} ${"Role".padEnd(12)} Age`),
      THIN_DIVIDER,
    ]);

/**
 * Format the full character list.
 * Uses HOF-based mapping to transform the array into display rows.
 *
 * @param {Character[]} characters
 * @returns {string}
 */
const formatCharacterList = (characters) => {
  if (characters.length === 0) {
    return red("  No characters found.");
  }

  const formatRows = mapToLines(formatCharacterRow);
  return `${formatCharacterListHeader()}\n${formatRows(characters)}\n`;
};

// ---------------------------------------------------------------------------
// Character detail view
// ---------------------------------------------------------------------------

/**
 * Format a labelled field line.
 *
 * @param {string} label
 * @param {string} value
 * @returns {string}
 */
const formatField = (label, value) =>
    `  ${cyan(label.padEnd(18))} ${value}`;

/**
 * Convert a character into labelled display fields.
 *
 * @param {Character} character
 * @returns {Array<[string, string]>}
 */
const toCharacterFields = (character) => [
  ["Name", bold(character.name)],
  ["Age", String(character.age)],
  ["Race", character.race],
  ["Gender", character.gender],
  ["Height", character.height],
  ["Primary Role", magenta(character.primaryRole)],
  ["Ultimate Weapon", yellow(character.ultimateWeapon)],
  ["Description", character.description],
];

/**
 * Format the full detail view for a single character.
 * Pure — composes field extraction and row formatting via map.
 *
 * @param {Character} character
 * @returns {string}
 */
const formatCharacterDetail = (character) => {
  const rows = mapToLines(([label, value]) => formatField(label, value))(
      toCharacterFields(character)
  );

  return joinLines([
    "",
    DIVIDER,
    bold(cyan(`  Character Detail: ${character.name}`)),
    DIVIDER,
    rows,
    "",
    THIN_DIVIDER,
  ]);
};

// ---------------------------------------------------------------------------
// Status messages
// ---------------------------------------------------------------------------

/**
 * Create a status formatter from a colour function and symbol.
 * Closure: captures display style and returns a specialised formatter.
 *
 * @param {(text: string) => string} colourFn
 * @param {string} symbol
 * @returns {(msg: string) => string}
 */
const createStatusFormatter = (colourFn, symbol) => (msg) =>
    colourFn(`\n  ${symbol}  ${msg}\n`);

/** @type {(msg: string) => string} */
const formatSuccess = createStatusFormatter(green, "✓");

/** @type {(msg: string) => string} */
const formatError = createStatusFormatter(red, "✗");

/** @type {(msg: string) => string} */
const formatInfo = createStatusFormatter(cyan, "ℹ");

// ---------------------------------------------------------------------------
// Validation errors
// ---------------------------------------------------------------------------

/**
 * Format a list of validation errors for display.
 * Uses map — HOF — to prepend bullet markers.
 *
 * @param {string[]} errors
 * @returns {string}
 */
const formatValidationErrors = (errors) =>
    mapToLines((error) => red(`    • ${error}`))(errors);

module.exports = {
  formatBanner,
  formatCharacterList,
  formatCharacterDetail,
  formatCharacterRow,
  formatSuccess,
  formatError,
  formatInfo,
  formatValidationErrors,
  DIVIDER,
  THIN_DIVIDER,
  bold,
  cyan,
  yellow,
  green,
  red,
  magenta,
  dim,
};