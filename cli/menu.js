/**
 * @fileoverview CLI Menu — Side-Effect Boundary
 *
 * This is the ONLY layer allowed to:
 *   • console.log  (output)
 *   • readline     (input)
 *   • call characterRepository (persistence)
 *
 * Business logic is NEVER duplicated here — this layer only orchestrates
 * calls to characterService and displays results via formatters.
 */

const readline = require("readline");

const repo = require("../data/characterRepository");
const service = require("../services/characterService");
const fmt = require("../utils/formatters");
const { VALID_ROLES } = require("../utils/validators");

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
 * @typedef {{ characters: Character[] }} AppState
 */

/**
 * @typedef {Object} CliDeps
 * @property {(prompt: string) => Promise<string>} askTrimmed
 * @property {(text: string) => void} print
 * @property {(msg: string) => void} printError
 * @property {(msg: string) => void} printSuccess
 * @property {(msg: string) => void} printInfo
 * @property {() => void} close
 * @property {{ loadCharacters: () => Character[], saveCharacters: (characters: Character[]) => void }} repo
 * @property {typeof service} service
 * @property {typeof fmt} fmt
 */

/**
 * Create an immutable app state object.
 * @param {Character[]} characters
 * @returns {AppState}
 */
const createState = (characters) => ({ characters });

/**
 * Create a readline-backed prompt function.
 * Closure captures the readline interface.
 * @param {readline.Interface} rl
 * @returns {(prompt: string) => Promise<string>}
 */
const createAsk = (rl) => (prompt) =>
    new Promise((resolve) => rl.question(fmt.cyan(`  → ${prompt}: `), resolve));

/**
 * Create all CLI dependencies.
 * Closure captures the readline interface and centralizes effects.
 * @returns {CliDeps}
 */
const createCliDeps = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = createAsk(rl);
  const askTrimmed = async (prompt) => (await ask(prompt)).trim();

  return {
    askTrimmed,
    print: (text) => console.log(text),
    printError: (msg) => console.log(fmt.formatError(msg)),
    printSuccess: (msg) => console.log(fmt.formatSuccess(msg)),
    printInfo: (msg) => console.log(fmt.formatInfo(msg)),
    close: () => rl.close(),
    repo,
    service,
    fmt,
  };
};

// ---------------------------------------------------------------------------
// Pure render helpers
// ---------------------------------------------------------------------------

const MAIN_MENU_ENTRIES = Object.freeze([
  ["1", "List all characters"],
  ["2", "View character detail"],
  ["3", "Add a new character"],
  ["4", "Edit a character"],
  ["5", "Delete a character"],
  ["6", "Filter by Primary Role"],
  ["7", "Role statistics"],
  ["0", "Exit"],
]);

/**
 * Render the main menu as a string.
 * @param {typeof fmt} formatter
 * @returns {string}
 */
const renderMainMenu = (formatter) =>
    [
      "",
      formatter.bold(formatter.cyan("  MAIN MENU")),
      formatter.THIN_DIVIDER,
      ...MAIN_MENU_ENTRIES.map(
          ([key, label]) => `  ${formatter.yellow(key)}  ${label}`
      ),
      "",
    ].join("\n");

/**
 * Render role statistics as a string.
 * @param {typeof fmt} formatter
 * @param {Record<string, number>} stats
 * @returns {string}
 */
const renderRoleStats = (formatter, stats) =>
    [
      "",
      formatter.bold(formatter.cyan("  Role Statistics")),
      formatter.THIN_DIVIDER,
      ...Object.entries(stats)
          .sort(([, a], [, b]) => b - a)
          .map(
              ([role, count]) =>
                  `  ${formatter.magenta(role.padEnd(12))}  ${count} character(s)`
          ),
      "",
    ].join("\n");

/**
 * Convert a 1-based user input into a valid zero-based index.
 * @param {string} input
 * @param {number} length
 * @returns {number|null}
 */
const toValidIndex = (input, length) => {
  const index = Number(input) - 1;
  return Number.isInteger(index) && index >= 0 && index < length ? index : null;
};

/**
 * Persist characters and return the next immutable state.
 * Side effects stay at the system boundary.
 * @param {CliDeps} deps
 * @param {Character[]} characters
 * @returns {AppState}
 */
const persistState = (deps, characters) => {
  deps.repo.saveCharacters(characters);
  return createState(characters);
};

/**
 * Prompt for a character index from the current list.
 * @param {CliDeps} deps
 * @param {Character[]} characters
 * @param {string} prompt
 * @returns {Promise<number|null>}
 */
const askForCharacterIndex = async (deps, characters, prompt) => {
  if (characters.length === 0) {
    deps.printError("No characters in the database.");
    return null;
  }

  deps.print(deps.fmt.formatCharacterList(characters));

  const input = await deps.askTrimmed(prompt);
  const index = toValidIndex(input, characters.length);

  if (index === null) {
    deps.printError("Invalid selection.");
    return null;
  }

  return index;
};

// ---------------------------------------------------------------------------
// Recursive field collection
// ---------------------------------------------------------------------------

const CHARACTER_FIELDS = Object.freeze([
  ["Name", "name"],
  ["Age", "age"],
  ["Race", "race"],
  ["Gender", "gender"],
  ["Height", "height"],
  ["Description", "description"],
  ["Primary Role", "primaryRole"],
  ["Ultimate Weapon", "ultimateWeapon"],
]);

/**
 * Ask for one field, showing a default in brackets when present.
 * @param {CliDeps} deps
 * @param {Partial<Character>} defaults
 * @param {string} label
 * @param {string} key
 * @returns {Promise<string>}
 */
const askForField = async (deps, defaults, label, key) => {
  const suffix = defaults[key] ? ` [${defaults[key]}]` : "";
  return deps.askTrimmed(`${label}${suffix}`);
};

/**
 * Recursively collect character fields.
 * Demonstrates recursion and immutable accumulation.
 *
 * @param {CliDeps} deps
 * @param {Array<[string, string]>} fields
 * @param {Partial<Character>} defaults
 * @param {Record<string, string>} acc
 * @returns {Promise<Record<string, string>>}
 */
const collectFieldsRecursively = async (deps, fields, defaults, acc = {}) => {
  if (fields.length === 0) {
    return acc;
  }

  const [[label, key], ...remainingFields] = fields;

  if (key === "primaryRole") {
    deps.print(deps.fmt.dim(`  Valid roles: ${VALID_ROLES.join(", ")}`));
  }

  const rawValue = await askForField(deps, defaults, label, key);
  const mergedValue = rawValue !== "" ? rawValue : String(defaults[key] ?? "");

  return collectFieldsRecursively(deps, remainingFields, defaults, {
    ...acc,
    [key]: mergedValue,
  });
};

/**
 * Prompt for all character fields.
 * Returns plain input data; ID assignment remains in the service layer.
 *
 * @param {CliDeps} deps
 * @param {Partial<Character>} defaults
 * @returns {Promise<Record<string, string>>}
 */
const collectCharacterFields = (deps, defaults = {}) =>
    collectFieldsRecursively(deps, CHARACTER_FIELDS, defaults);

// ---------------------------------------------------------------------------
// Feature handlers
// Each handler is explicit: (state, deps) => Promise<state>
// ---------------------------------------------------------------------------

/**
 * @param {AppState} state
 * @param {CliDeps} deps
 * @returns {Promise<AppState>}
 */
const handleListAll = async (state, deps) => {
  deps.print(deps.fmt.formatCharacterList(state.characters));
  return state;
};

/**
 * @param {AppState} state
 * @param {CliDeps} deps
 * @returns {Promise<AppState>}
 */
const handleViewDetail = async (state, deps) => {
  const index = await askForCharacterIndex(deps, state.characters, "Enter character number");

  if (index === null) {
    return state;
  }

  deps.print(deps.fmt.formatCharacterDetail(state.characters[index]));
  return state;
};

/**
 * @param {AppState} state
 * @param {CliDeps} deps
 * @returns {Promise<AppState>}
 */
const handleAddCharacter = async (state, deps) => {
  deps.printInfo("Enter details for the new character:");

  const data = await collectCharacterFields(deps);
  const result = deps.service.addCharacter(state.characters, data);

  if (!result.success) {
    deps.printError("Validation failed:");
    deps.print(deps.fmt.formatValidationErrors(result.error.split("\n")));
    return state;
  }

  deps.printSuccess(`Character "${result.character.name}" added successfully.`);
  return persistState(deps, result.characters);
};

/**
 * @param {AppState} state
 * @param {CliDeps} deps
 * @returns {Promise<AppState>}
 */
const handleEditCharacter = async (state, deps) => {
  if (state.characters.length === 0) {
    deps.printError("No characters to edit.");
    return state;
  }

  const index = await askForCharacterIndex(
      deps,
      state.characters,
      "Enter character number to edit"
  );

  if (index === null) {
    return state;
  }

  const existing = state.characters[index];
  deps.printInfo(`Editing "${existing.name}" — press Enter to keep current value.`);

  const data = await collectCharacterFields(deps, existing);
  const result = deps.service.updateCharacter(state.characters, existing.id, data);

  if (!result.success) {
    deps.printError("Validation failed:");
    deps.print(deps.fmt.formatValidationErrors(result.error.split("\n")));
    return state;
  }

  deps.printSuccess(`Character "${existing.name}" updated successfully.`);
  return persistState(deps, result.characters);
};

/**
 * @param {AppState} state
 * @param {CliDeps} deps
 * @returns {Promise<AppState>}
 */
const handleDeleteCharacter = async (state, deps) => {
  if (state.characters.length === 0) {
    deps.printError("No characters to delete.");
    return state;
  }

  const index = await askForCharacterIndex(
      deps,
      state.characters,
      "Enter character number to delete"
  );

  if (index === null) {
    return state;
  }

  const target = state.characters[index];
  const confirmation = await deps.askTrimmed(
      `Confirm deletion of "${target.name}"? (yes/no)`
  );

  if (confirmation.toLowerCase() !== "yes") {
    deps.printInfo("Deletion cancelled.");
    return state;
  }

  const result = deps.service.deleteCharacter(state.characters, target.id);

  if (!result.success) {
    deps.printError(result.error);
    return state;
  }

  deps.printSuccess(`Character "${target.name}" deleted.`);
  return persistState(deps, result.characters);
};

/**
 * @param {AppState} state
 * @param {CliDeps} deps
 * @returns {Promise<AppState>}
 */
const handleFilterByRole = async (state, deps) => {
  deps.print(deps.fmt.dim(`  Valid roles: ${VALID_ROLES.join(", ")}`));

  const role = await deps.askTrimmed("Enter Primary Role to filter by");

  const filterByRole = deps.service.createRoleFilter(role);
  const filtered = filterByRole(state.characters);

  if (filtered.length === 0) {
    deps.printError(`No characters found with role "${role}".`);
    return state;
  }

  deps.printInfo(`Characters with role "${role}":`);
  deps.print(deps.fmt.formatCharacterList(filtered));
  return state;
};

/**
 * @param {AppState} state
 * @param {CliDeps} deps
 * @returns {Promise<AppState>}
 */
const handleRoleStats = async (state, deps) => {
  const stats = deps.service.getRoleStats(state.characters);
  deps.print(renderRoleStats(deps.fmt, stats));
  return state;
};

/**
 * Build the menu dispatch table.
 * Closure captures dependencies once and returns state transformers.
 *
 * @param {CliDeps} deps
 * @returns {Record<string, (state: AppState) => Promise<AppState>>}
 */
const createMenuHandlers = (deps) => ({
  "1": (state) => handleListAll(state, deps),
  "2": (state) => handleViewDetail(state, deps),
  "3": (state) => handleAddCharacter(state, deps),
  "4": (state) => handleEditCharacter(state, deps),
  "5": (state) => handleDeleteCharacter(state, deps),
  "6": (state) => handleFilterByRole(state, deps),
  "7": (state) => handleRoleStats(state, deps),
});

/**
 * Recursively run the main menu.
 * This replaces mutable loop control with explicit recursive orchestration.
 *
 * @param {AppState} state
 * @param {CliDeps} deps
 * @param {Record<string, (state: AppState) => Promise<AppState>>} handlers
 * @returns {Promise<void>}
 */
const runMenu = async (state, deps, handlers) => {
  deps.print(renderMainMenu(deps.fmt));

  const choice = await deps.askTrimmed("Your choice");

  if (choice === "0") {
    deps.print(deps.fmt.formatSuccess("Goodbye, l'Cie. May your Focus guide you."));
    deps.close();
    return;
  }

  const handler = handlers[choice];

  if (!handler) {
    deps.printError(`Unknown option "${choice}". Please choose from the menu.`);
    return runMenu(state, deps, handlers);
  }

  const nextState = await handler(state);
  return runMenu(nextState, deps, handlers);
};

/**
 * Run the application.
 * Loads the initial state once, then hands control to the recursive menu.
 *
 * @returns {Promise<void>}
 */
const run = async () => {
  const deps = createCliDeps();
  const initialState = createState(deps.repo.loadCharacters());
  const handlers = createMenuHandlers(deps);

  deps.print(deps.fmt.formatBanner());
  deps.printInfo(`Loaded ${initialState.characters.length} character(s) from database.`);

  return runMenu(initialState, deps, handlers);
};

module.exports = { run };