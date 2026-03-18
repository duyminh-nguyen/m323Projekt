/**
 * @fileoverview Validators — Pure Functions
 *
 * All functions here are pure: no side effects, same input → same output.
 * They return structured result objects instead of throwing exceptions,
 * keeping error handling explicit and composable.
 */

// ---------------------------------------------------------------------------
// Types (JSDoc)
// ---------------------------------------------------------------------------

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
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} errors
 */

/**
 * @callback Validator
 * @param {Record<string, unknown>} data
 * @returns {string[]}
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REQUIRED_FIELDS = Object.freeze([
  "name",
  "age",
  "race",
  "gender",
  "height",
  "description",
  "primaryRole",
  "ultimateWeapon",
]);

const VALID_ROLES = Object.freeze([
  "Commando",
  "Ravager",
  "Sentinel",
  "Synergist",
  "Saboteur",
  "Medic",
]);

// ---------------------------------------------------------------------------
// Primitive predicates
// ---------------------------------------------------------------------------

/** @type {(value: unknown) => boolean} */
const isNonEmptyString = (value) =>
    typeof value === "string" && value.trim().length > 0;

/** @type {(value: unknown) => boolean} */
const isPositiveInteger = (value) =>
    Number.isInteger(value) && value > 0;

/** @type {(role: string) => boolean} */
const isValidRole = (role) => VALID_ROLES.includes(role);

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------

/**
 * Return the value at a field key.
 * @param {Record<string, unknown>} data
 * @param {string} field
 * @returns {unknown}
 */
const getField = (data, field) => data[field];

/**
 * Check whether a value should count as empty.
 * @param {unknown} value
 * @returns {boolean}
 */
const isEmptyValue = (value) =>
    value === undefined || value === null || String(value).trim() === "";

/**
 * Convert a predicate into a validator for a specific field.
 * Closure: captures field name, predicate, and message builder.
 *
 * @param {string} field
 * @param {(value: unknown) => boolean} predicate
 * @param {(field: string, value: unknown) => string} errorMessage
 * @returns {Validator}
 */
const createFieldValidator = (field, predicate, errorMessage) => (data) => {
  const value = getField(data, field);

  return predicate(value) ? [] : [errorMessage(field, value)];
};

/**
 * Combine multiple validators into one validator.
 * Uses flatMap to merge all error arrays into one pipeline result.
 *
 * @param {Validator[]} validators
 * @returns {Validator}
 */
const combineValidators = (validators) => (data) =>
    validators.flatMap((validate) => validate(data));

/**
 * Create a validator that checks a required field.
 * Closure captures the field name.
 *
 * @param {string} field
 * @returns {Validator}
 */
const createRequiredFieldValidator = (field) =>
    createFieldValidator(
        field,
        (value) => !isEmptyValue(value),
        (fieldName) => `Field "${fieldName}" is required and must not be empty.`
    );

/**
 * Create a validator that only runs when a field is present.
 * Closure captures field name and validation rule.
 *
 * @param {string} field
 * @param {(value: unknown) => boolean} predicate
 * @param {(field: string, value: unknown) => string} errorMessage
 * @returns {Validator}
 */
const createOptionalFieldRule = (field, predicate, errorMessage) => (data) => {
  const value = getField(data, field);

  return value === undefined || value === null || String(value).trim() === ""
      ? []
      : predicate(value)
          ? []
          : [errorMessage(field, value)];
};

// ---------------------------------------------------------------------------
// Field-level validators
// ---------------------------------------------------------------------------

/**
 * Validate that all required fields are present and non-empty.
 * Uses HOF composition rather than imperative accumulation.
 *
 * @param {Record<string, unknown>} data
 * @returns {string[]}
 */
const validateRequiredFields = (data) =>
    REQUIRED_FIELDS
        .map(createRequiredFieldValidator)
        .flatMap((validate) => validate(data));

/**
 * Validate field-specific business rules.
 * Fully immutable — no local mutation.
 *
 * @param {Record<string, unknown>} data
 * @returns {string[]}
 */
const validateFieldRules = (data) =>
    [
      createOptionalFieldRule(
          "age",
          (value) => isPositiveInteger(Number(value)),
          () => "Age must be a positive integer."
      ),
      createOptionalFieldRule(
          "primaryRole",
          (value) => typeof value === "string" && isValidRole(value),
          () => `Primary role must be one of: ${VALID_ROLES.join(", ")}.`
      ),
      createOptionalFieldRule(
          "name",
          isNonEmptyString,
          () => "Name must be a non-empty string."
      ),
    ].flatMap((validate) => validate(data));

// ---------------------------------------------------------------------------
// Composed validator
// ---------------------------------------------------------------------------

/**
 * Full character validation via function composition.
 * Combines multiple validators and merges their error lists.
 *
 * @param {Record<string, unknown>} data
 * @returns {ValidationResult}
 */
const validateCharacter = (data) => {
  const validate = combineValidators([
    validateRequiredFields,
    validateFieldRules,
  ]);

  const errors = validate(data);

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateCharacter,
  validateRequiredFields,
  validateFieldRules,
  VALID_ROLES,
  isNonEmptyString,
  isPositiveInteger,
  isValidRole,
};