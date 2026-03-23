const test = require("node:test");
const assert = require("node:assert/strict");
const { isRight, isLeft } = require("../utils/either");

const {
    addCharacter,
    updateCharacter,
    deleteCharacter,
    findCharacterById,
    findCharacterByIdRecursive,
    createRoleFilter,
    sortByName,
    getRoleStats,
    getRoleStatsRecursive,
    generateNextId,
    findCharacterByIdEither,
} = require("../services/characterService");

const baseCharacters = [
    {
        id: "1",
        name: "Lightning",
        age: 21,
        race: "Human",
        gender: "Female",
        height: "171 cm",
        description: "Former soldier.",
        primaryRole: "Commando",
        ultimateWeapon: "Blazefire Saber",
    },
    {
        id: "2",
        name: "Hope Estheim",
        age: 14,
        race: "Human",
        gender: "Male",
        height: "153 cm",
        description: "Young and intelligent.",
        primaryRole: "Ravager",
        ultimateWeapon: "Hawkeye",
    },
    {
        id: "3",
        name: "Snow Villiers",
        age: 21,
        race: "Human",
        gender: "Male",
        height: "200 cm",
        description: "Leader of NORA.",
        primaryRole: "Sentinel",
        ultimateWeapon: "Wild Bear",
    },
];

const validCharacterData = {
    name: "Fang",
    age: 21,
    race: "Human",
    gender: "Female",
    height: "175 cm",
    description: "Strong warrior from Gran Pulse.",
    primaryRole: "Commando",
    ultimateWeapon: "Pandoran Spear",
};

test("generateNextId returns '1' for an empty array", () => {
    assert.equal(generateNextId([]), "1");
});

test("generateNextId returns the next highest numeric id", () => {
    assert.equal(generateNextId(baseCharacters), "4");
});

test("findCharacterById returns the matching character", () => {
    const result = findCharacterById(baseCharacters, "2");

    assert.equal(result.name, "Hope Estheim");
});

test("findCharacterById returns undefined when id does not exist", () => {
    const result = findCharacterById(baseCharacters, "999");

    assert.equal(result, undefined);
});

test("addCharacter adds a valid character and returns a new array", () => {
    const originalSnapshot = JSON.parse(JSON.stringify(baseCharacters));

    const result = addCharacter(baseCharacters, validCharacterData);

    assert.equal(result.success, true);
    assert.equal(result.character.id, "4");
    assert.equal(result.character.name, "Fang");
    assert.equal(result.characters.length, 4);

    assert.notEqual(result.characters, baseCharacters);
    assert.deepEqual(baseCharacters, originalSnapshot);
});

test("addCharacter normalizes age to a number", () => {
    const result = addCharacter(baseCharacters, {
        ...validCharacterData,
        age: "19",
    });

    assert.equal(result.success, true);
    assert.equal(result.character.age, 19);
    assert.equal(typeof result.character.age, "number");
});

test("addCharacter rejects invalid character data", () => {
    const result = addCharacter(baseCharacters, {
        ...validCharacterData,
        primaryRole: "Warrior",
    });

    assert.equal(result.success, false);
    assert.match(result.error, /Primary role must be one of:/);
});

test("updateCharacter updates the correct character immutably", () => {
    const originalSnapshot = JSON.parse(JSON.stringify(baseCharacters));

    const result = updateCharacter(baseCharacters, "2", {
        age: 15,
        primaryRole: "Medic",
        description: "Now more experienced.",
    });

    assert.equal(result.success, true);
    assert.equal(result.characters.length, 3);

    const updated = result.characters.find((character) => character.id === "2");
    const untouched = result.characters.find((character) => character.id === "1");

    assert.equal(updated.age, 15);
    assert.equal(updated.primaryRole, "Medic");
    assert.equal(updated.description, "Now more experienced.");
    assert.equal(updated.name, "Hope Estheim");
    assert.equal(untouched.name, "Lightning");

    assert.notEqual(result.characters, baseCharacters);
    assert.deepEqual(baseCharacters, originalSnapshot);
});

test("updateCharacter preserves the original id even if updates contain id", () => {
    const result = updateCharacter(baseCharacters, "2", {
        id: "999",
        primaryRole: "Medic",
    });

    assert.equal(result.success, true);

    const updated = result.characters.find((character) => character.id === "2");
    assert.equal(updated.id, "2");
});

test("updateCharacter normalizes updated age to a number", () => {
    const result = updateCharacter(baseCharacters, "1", {
        age: "22",
    });

    assert.equal(result.success, true);

    const updated = result.characters.find((character) => character.id === "1");
    assert.equal(updated.age, 22);
    assert.equal(typeof updated.age, "number");
});

test("updateCharacter fails when character id does not exist", () => {
    const result = updateCharacter(baseCharacters, "999", {
        age: 18,
    });

    assert.equal(result.success, false);
    assert.equal(result.error, 'Character with id "999" not found.');
});

test("updateCharacter rejects invalid updates", () => {
    const result = updateCharacter(baseCharacters, "1", {
        primaryRole: "Warrior",
    });

    assert.equal(result.success, false);
    assert.match(result.error, /Primary role must be one of:/);
});

test("deleteCharacter removes the correct character immutably", () => {
    const originalSnapshot = JSON.parse(JSON.stringify(baseCharacters));

    const result = deleteCharacter(baseCharacters, "2");

    assert.equal(result.success, true);
    assert.equal(result.characters.length, 2);
    assert.equal(result.characters.some((character) => character.id === "2"), false);

    assert.notEqual(result.characters, baseCharacters);
    assert.deepEqual(baseCharacters, originalSnapshot);
});

test("deleteCharacter fails when id does not exist", () => {
    const result = deleteCharacter(baseCharacters, "999");

    assert.equal(result.success, false);
    assert.equal(result.error, 'Character with id "999" not found.');
});

test("createRoleFilter returns only matching roles and is case-insensitive", () => {
    const filterCommandos = createRoleFilter("commando");
    const result = filterCommandos(baseCharacters);

    assert.equal(result.length, 1);
    assert.equal(result[0].name, "Lightning");
});

test("sortByName returns a new alphabetically sorted array", () => {
    const unsorted = [baseCharacters[2], baseCharacters[0], baseCharacters[1]];
    const originalSnapshot = JSON.parse(JSON.stringify(unsorted));

    const result = sortByName(unsorted);

    assert.deepEqual(
        result.map((character) => character.name),
        ["Hope Estheim", "Lightning", "Snow Villiers"]
    );

    assert.notEqual(result, unsorted);
    assert.deepEqual(unsorted, originalSnapshot);
});

test("getRoleStats returns correct role counts", () => {
    const characters = [
        ...baseCharacters,
        {
            id: "4",
            name: "Fang",
            age: 21,
            race: "Human",
            gender: "Female",
            height: "175 cm",
            description: "Warrior from Gran Pulse.",
            primaryRole: "Commando",
            ultimateWeapon: "Pandoran Spear",
        },
        {
            id: "5",
            name: "Vanille",
            age: 19,
            race: "Human",
            gender: "Female",
            height: "161 cm",
            description: "Energetic and mysterious.",
            primaryRole: "Saboteur",
            ultimateWeapon: "Binding Rod",
        },
    ];

    const result = getRoleStats(characters);

    assert.deepEqual(result, {
        Commando: 2,
        Ravager: 1,
        Sentinel: 1,
        Saboteur: 1,
    });
});

test("getRoleStats returns an empty object for an empty array", () => {
    assert.deepEqual(getRoleStats([]), {});
});

test("findCharacterByIdRecursive returns the matching character recursively", () => {
    const result = findCharacterByIdRecursive(baseCharacters, "3");
    assert.equal(result.name, "Snow Villiers");
});

test("findCharacterByIdRecursive returns undefined when id is missing", () => {
    const result = findCharacterByIdRecursive(baseCharacters, "999");
    assert.equal(result, undefined);
});

test("findCharacterByIdEither returns Right for an existing character", () => {
    const result = findCharacterByIdEither(baseCharacters, "2");

    assert.equal(isRight(result), true);
    assert.equal(result.value.name, "Hope Estheim");
});

test("findCharacterByIdEither returns Left for a missing character", () => {
    const result = findCharacterByIdEither(baseCharacters, "999");

    assert.equal(isLeft(result), true);
    assert.equal(result.error, 'Character with id "999" not found.');
});