# ⚔ Final Fantasy XIII --- Character Database Viewer

A terminal-only Node.js application for managing Final Fantasy XIII
characters.\
The project is intentionally designed to demonstrate **Functional
Programming in JavaScript** through pure functions, immutable updates,
higher-order functions, closures, recursion, and clean architectural
separation.

------------------------------------------------------------------------

## Setup

### Requirements

-   Node.js \>= 16

### Start the application

``` bash
node index.js
```

Or:

``` bash
npm start
```

------------------------------------------------------------------------

## Features

  Key   Feature
  ----- ------------------------
  `1`   List all characters
  `2`   View character detail
  `3`   Add a new character
  `4`   Edit a character
  `5`   Delete a character
  `6`   Filter by Primary Role
  `7`   Role statistics
  `0`   Exit

All changes are automatically persisted in:

    data/characters.json

------------------------------------------------------------------------

## Project Structure

    index.js                      ← launcher only
    cli/
      menu.js                     ← CLI boundary: input/output orchestration
    data/
      characters.json             ← persistent JSON storage
      characterRepository.js      ← file I/O only
    services/
      characterService.js         ← pure business logic
    utils/
      validators.js               ← pure validation functions
      formatters.js               ← pure display/string functions

------------------------------------------------------------------------

## Architecture

### Layer Responsibilities

  ----------------------------------------------------------------------------------
  Layer                            Responsibility
  -------------------------------- -------------------------------------------------
  `index.js`                       Starts the application only

  `cli/menu.js`                    Handles user input/output and delegates to pure
                                   layers

  `data/characterRepository.js`    Performs file I/O only

  `services/characterService.js`   Implements pure business logic

  `utils/validators.js`            Validates data using pure functions

  `utils/formatters.js`            Formats display output using pure functions
  ----------------------------------------------------------------------------------

### Functional Programming Design Choices

#### 1. Pure Functions & No Side Effects

Pure business logic lives in: - `characterService.js` -
`validators.js` - `formatters.js`

These modules: - do not log - do not read or write files - do not mutate
input arguments - produce deterministic outputs

Side effects are isolated to: - `cli/menu.js` -
`characterRepository.js` - `index.js`

#### 2. Immutability

The project avoids mutating arrays and objects directly: - `map` is used
for updates - `filter` is used for deletions - spread syntax is used for
object and array copies - reducers build new accumulator objects instead
of mutating old ones

#### 3. Higher-Order Functions

The project uses: - `map` - `filter` - `reduce` - `flatMap` - custom
higher-order functions such as formatter factories and validator
builders

#### 4. Function Composition

Complex tasks are built from smaller reusable functions: - validation is
composed from smaller validators - formatting is composed from field
formatters and line builders - service operations are composed from
small transformation helpers

#### 5. Closures and Recursion

The project demonstrates JavaScript FP techniques through: -
**closures** - `createRoleFilter` - ANSI formatter factories - CLI
prompt factories - **recursion** - recursive menu loop - recursive field
collection in the CLI

#### 6. Type Safety in JavaScript

Since this project uses JavaScript rather than TypeScript: - JSDoc
typedefs document core data shapes - validators enforce runtime
correctness - repository loading normalizes persisted JSON data

------------------------------------------------------------------------

## Testing

### What is tested

1.  **Startup / Exit**
    -   application starts correctly
    -   banner and menu render correctly
    -   exit closes the application cleanly
2.  **Create**
    -   adding a valid character succeeds
    -   invalid data is rejected
    -   invalid data is not persisted
3.  **Read**
    -   list all characters works
    -   character detail view works
    -   filtering by role works
    -   role statistics are correct
4.  **Update**
    -   editing a character updates only the selected entry
    -   unchanged fields remain intact
    -   invalid edits are rejected
5.  **Delete**
    -   deleting a character removes it from the list
    -   cancellation leaves data unchanged
6.  **Persistence**
    -   added characters remain after restart
    -   edited characters remain after restart
    -   deleted characters remain deleted after restart
7.  **Empty-State Behaviour**
    -   listing, editing, viewing, and deleting behave correctly when no
        characters exist

### How to test

Run the application:

``` bash
npm start
```

Then test the flows manually through the CLI.

### Expected outcomes

-   no crashes during valid flows
-   invalid input produces readable errors
-   successful create/update/delete actions persist to `characters.json`
-   business logic remains deterministic and side‑effect free outside
    the CLI and repository layers

------------------------------------------------------------------------

## Preloaded Characters

  Name                Role
  ------------------- -----------
  Lightning           Commando
  Snow Villiers       Sentinel
  Oerba Dia Vanille   Saboteur
  Sazh Katzroy        Synergist
  Hope Estheim        Ravager
  Oerba Yun Fang      Commando

------------------------------------------------------------------------

## Summary

This project highlights functional programming strengths through: - pure
business logic - immutable updates - higher-order functions - function
composition - closures - recursion - clear separation of I/O and core
logic
