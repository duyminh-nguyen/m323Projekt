const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");

const repository = require("../data/characterRepository");

const validCharacters = [
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
];

const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;
const originalWriteFileSync = fs.writeFileSync;

test.afterEach(() => {
    fs.existsSync = originalExistsSync;
    fs.readFileSync = originalReadFileSync;
    fs.writeFileSync = originalWriteFileSync;
});

test("loadCharacters returns empty array when file does not exist", () => {
    fs.existsSync = () => false;

    const result = repository.loadCharacters();

    assert.deepEqual(result, []);
});

test("loadCharacters returns normalized characters from valid JSON", () => {
    fs.existsSync = () => true;
    fs.readFileSync = () => JSON.stringify(validCharacters);

    const result = repository.loadCharacters();

    assert.deepEqual(result, validCharacters);
});

test("loadCharacters returns empty array when JSON is invalid", () => {
    fs.existsSync = () => true;
    fs.readFileSync = () => "{ invalid json";

    const result = repository.loadCharacters();

    assert.deepEqual(result, []);
});

test("loadCharacters filters out invalid character entries", () => {
    fs.existsSync = () => true;
    fs.readFileSync = () =>
        JSON.stringify([
            validCharacters[0],
            { id: "", name: "Missing id" },
            { id: "3", name: "" },
            "not-an-object",
            {
                id: "4",
                name: "Vanille",
                age: 19,
                race: "Human",
                gender: "Female",
                height: "161 cm",
                description: "Energetic and mysterious.",
                primaryRole: "Saboteur",
                ultimateWeapon: "Binding Rod",
            },
        ]);

    const result = repository.loadCharacters();

    assert.deepEqual(result, [
        validCharacters[0],
        {
            id: "4",
            name: "Vanille",
            age: 19,
            race: "Human",
            gender: "Female",
            height: "161 cm",
            description: "Energetic and mysterious.",
            primaryRole: "Saboteur",
            ultimateWeapon: "Binding Rod",
        },
    ]);
});

test("loadCharacters normalizes invalid field types safely", () => {
    fs.existsSync = () => true;
    fs.readFileSync = () =>
        JSON.stringify([
            {
                id: 99,
                name: "Sazh",
                age: "not-a-number",
                race: "Human",
                gender: "Male",
                height: 189,
                description: "Pilot and father.",
                primaryRole: "Synergist",
                ultimateWeapon: null,
            },
        ]);

    const result = repository.loadCharacters();

    assert.deepEqual(result, []);
});

test("saveCharacters writes normalized JSON to disk", () => {
    let capturedPath = null;
    let capturedData = null;
    let capturedEncoding = null;

    fs.writeFileSync = (path, data, encoding) => {
        capturedPath = path;
        capturedData = data;
        capturedEncoding = encoding;
    };

    repository.saveCharacters(validCharacters);

    assert.ok(capturedPath.endsWith("characters.json"));
    assert.equal(capturedEncoding, "utf-8");

    const parsed = JSON.parse(capturedData);
    assert.deepEqual(parsed, validCharacters);
});

test("saveCharacters filters invalid entries before writing", () => {
    let capturedData = null;

    fs.writeFileSync = (_path, data) => {
        capturedData = data;
    };

    repository.saveCharacters([
        validCharacters[0],
        { id: "", name: "Invalid Character" },
        { id: "3", name: "" },
        {
            id: "4",
            name: "Vanille",
            age: 19,
            race: "Human",
            gender: "Female",
            height: "161 cm",
            description: "Energetic and mysterious.",
            primaryRole: "Saboteur",
            ultimateWeapon: "Binding Rod",
        },
    ]);

    const parsed = JSON.parse(capturedData);

    assert.deepEqual(parsed, [
        validCharacters[0],
        {
            id: "4",
            name: "Vanille",
            age: 19,
            race: "Human",
            gender: "Female",
            height: "161 cm",
            description: "Energetic and mysterious.",
            primaryRole: "Saboteur",
            ultimateWeapon: "Binding Rod",
        },
    ]);
});

test("saveCharacters normalizes field values before writing", () => {
    let capturedData = null;

    fs.writeFileSync = (_path, data) => {
        capturedData = data;
    };

    repository.saveCharacters([
        {
            id: "10",
            name: "Test Character",
            age: "22",
            race: "Human",
            gender: "Female",
            height: "170 cm",
            description: "Test description.",
            primaryRole: "Medic",
            ultimateWeapon: "Test Weapon",
        },
    ]);

    const parsed = JSON.parse(capturedData);

    assert.deepEqual(parsed, [
        {
            id: "10",
            name: "Test Character",
            age: 22,
            race: "Human",
            gender: "Female",
            height: "170 cm",
            description: "Test description.",
            primaryRole: "Medic",
            ultimateWeapon: "Test Weapon",
        },
    ]);
});