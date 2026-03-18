const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateCharacter,
    VALID_ROLES,
} = require("../utils/validators");

const validCharacter = {
    name: "Lightning",
    age: 21,
    race: "Human",
    gender: "Female",
    height: "171 cm",
    description: "Former soldier and main protagonist.",
    primaryRole: "Commando",
    ultimateWeapon: "Blazefire Saber",
};

test("validateCharacter returns valid=true for a correct character", () => {
    const result = validateCharacter(validCharacter);

    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
});

test("validateCharacter fails when a required field is missing", () => {
    const invalidCharacter = {
        ...validCharacter,
        name: "",
    };

    const result = validateCharacter(invalidCharacter);

    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
});

test("validateCharacter fails when age is not a positive integer", () => {
    const invalidCharacter = {
        ...validCharacter,
        age: -5,
    };

    const result = validateCharacter(invalidCharacter);

    assert.equal(result.valid, false);
    assert.ok(result.errors.includes("Age must be a positive integer."));
});

test("validateCharacter fails when primaryRole is invalid", () => {
    const invalidCharacter = {
        ...validCharacter,
        primaryRole: "Warrior",
    };

    const result = validateCharacter(invalidCharacter);

    assert.equal(result.valid, false);
    assert.ok(
        result.errors.includes(
            `Primary role must be one of: ${VALID_ROLES.join(", ")}.`
        )
    );
});