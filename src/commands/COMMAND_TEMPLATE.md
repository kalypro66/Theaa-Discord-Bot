# Theaa Command Standard

Every command should follow this structure.

```js
module.exports = {

    // Internal name
    name: "serverinfo",

    // Natural command detection
    aliases: [
        "serverinfo",
        "server info"
    ],

    // Future AI training
    examples: [
        "show me server info",
        "tell me about this server"
    ],

    // Command category
    category: "server",

    // Human description
    description: "...",

    // Future permissions
    permissions: [],

    // Slash command
    data,

    // Shared logic
    run(),

    // Discord execution
    execute()

};
```

## Rules

- Never duplicate logic.
- `run()` contains the actual functionality.
- `execute()` only adapts Discord interactions to `run()`.
- Prefix, slash, and natural commands should all call the same `run()` function.
- Every new command must define `aliases` and `examples`.