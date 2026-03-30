# Forms+ (Minecraft Bedrock Script API)

A fully-typed, production-ready wrapper around `@minecraft/server-ui` that makes forms safer, cleaner, and actually scalable.

---

## 🚀 Overview

Forms+ replaces the fragile, repetitive Bedrock UI workflow with:

* Strong typing (full TypeScript inference)
* Built-in validation system
* Retry handling for `UserBusy`
* Structured error handling
* Builder APIs for cleaner code
* Reusable presets system

---

## 📦 Installation

Drop the `FORMS` folder into your project:

```
scripts/API/FORMS/
```

Then export it:

```ts
export * from "./API/FORMS";
```

---

## 🧠 Core Philosophy

Vanilla Bedrock forms:

* break silently
* lack validation
* are hard to scale
* are painful to reuse

Forms+ fixes that by introducing:

* validation before execution
* strict error handling
* reusable abstractions
* predictable behavior

---

## 🗂 File Structure

```
FORMS/
├── forms.ts          → Core engine (execution + validation)
├── formTypes.ts      → Full type system
├── formErrors.ts     → Structured error classes
├── formBuilder.ts    → Chainable builders
├── formPresets.ts    → Prebuilt reusable forms
├── text.ts           → Text validation helpers
├── index.ts          → Exports
├── README.md         → Documentation
```

---

## ⚙️ Configuration

```ts
import { Forms } from "./API/FORMS";

Forms.configure({
  debug: true,
  strict: true,
  logWarnings: true,
  logToChat: false,
  chatTag: "debug",
  prefix: "[Forms+]",
  busyHandling: "retry",
  maxBusyRetries: 2,
});
```

### Key Options

| Option           | Description                               |
| ---------------- | ----------------------------------------- |
| `debug`          | Enables validation logs                   |
| `strict`         | Throws errors instead of failing silently |
| `busyHandling`   | Retry when UI is busy                     |
| `maxBusyRetries` | Retry attempts                            |
| `logToChat`      | Send debug logs to players                |

---

## 🎯 Usage

---

### 🟦 Action Form

```ts
import { Forms } from "./API/FORMS";

await Forms.action(player, {
  title: "Menu",
  body: "Choose something",
  items: [
    { kind: "button", text: "Say Hi" },
    { kind: "button", text: "Close" }
  ],
  actions: [
    (p) => p.runCommandAsync("say hi"),
    undefined
  ]
});
```

---

### 🟨 Message Form

```ts
await Forms.message(player, {
  title: "Confirm",
  body: "Are you sure?",
  button1: { text: "Yes" },
  button2: { text: "No" },
  actions: [
    (p) => p.runCommandAsync("say yes"),
    (p) => p.runCommandAsync("say no")
  ]
});
```

---

### 🟩 Modal Form

```ts
await Forms.modal(player, {
  title: "Settings",
  submitButton: "Save",
  controls: [
    { type: "textField", label: "Name" },
    { type: "toggle", label: "Enable feature" }
  ],
  onSubmit: (values, player) => {
    const [name, enabled] = values;
    player.sendMessage(`Name: ${name}, Enabled: ${enabled}`);
  }
});
```

---

## 🧱 Builder API (Clean Syntax)

```ts
import { FormBuilder } from "./API/FORMS";

const form = FormBuilder.action()
  .title("Menu")
  .body("Pick one")
  .button("Option 1", (p) => p.sendMessage("1"))
  .button("Option 2", (p) => p.sendMessage("2"))
  .build();

await Forms.action(player, form);
```

---

## 🔍 Validation System

Forms+ validates everything before showing:

* Missing buttons
* Invalid player
* Invalid text formats
* Empty configs

```ts
Forms.printValidation(result);
```

If `strict: true`, errors will THROW.

---

## ❌ Error Handling

Custom error classes:

* `ValidationError`
* `FormDisplayError`
* `FormCallbackError`
* `InvalidPlayerError`

Example:

```ts
try {
  await Forms.action(player, form);
} catch (e) {
  console.warn(e);
}
```

---

## 🔁 Busy Handling (FIXES RANDOM FAILS)

Bedrock randomly fails with `UserBusy`.

Forms+ automatically retries:

```ts
busyHandling: "retry"
maxBusyRetries: 2
```

---

## 🧩 Presets System

Reusable UI patterns:

```ts
import { FormPresets } from "./API/FORMS";

await Forms.message(player, FormPresets.confirm());
```

---

## 🧪 Debugging

Enable:

```ts
Forms.configure({ debug: true });
```

Logs include:

```
[Forms+] ACTION
ERROR | items[0].text | Invalid
```

---

## 💡 Advanced Features

* Supports RawMessage (`translate`, `score`, etc.)
* Async-safe callbacks
* Type-safe modal value inference
* Per-control modal actions
* Header / label / divider support in ALL forms

---

## ⚡ Why This Is Better

| Feature        | Vanilla | Forms+ |
| -------------- | ------- | ------ |
| Validation     | ❌       | ✅      |
| Retry Handling | ❌       | ✅      |
| Typed API      | ❌       | ✅      |
| Builders       | ❌       | ✅      |
| Error Handling | ❌       | ✅      |

---

## 🧠 Final Notes

This system is designed for:

* large addons
* UI-heavy systems
* scalable scripting

If you’re still writing raw forms manually… you’re wasting time.

---

## 📜 License

Use freely. Modify freely. Just don’t claim you built it from scratch.

---
