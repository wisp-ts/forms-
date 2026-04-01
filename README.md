# Forms+

A fully-typed, validated, and scalable form system for Minecraft Bedrock Script API.

---

## Overview

Forms+ is a production-ready abstraction layer over `@minecraft/server-ui` that replaces fragile, unvalidated UI code with a structured system built around:

- Validation
- Retry handling
- Builders
- Predictable execution

---

## The Problem

Vanilla Bedrock forms are not reliable at scale:

- Fail silently
- No validation
- Break with `UserBusy`
- Require repetitive boilerplate

---

## The Solution

Forms+ introduces a **controlled execution pipeline**:

```txt
Options → Validation → Build → Show → Response → Callbacks
```

Every form follows a predictable lifecycle.

---

## Features

- **Full Type Safety** — TypeScript inference
- **Validation System** — Before execution
- **Retry Handling** — `UserBusy` fix
- **Structured Errors** — Consistent error hierarchy
- **Builder API** — Chainable fluent syntax
- **Reusable Presets** — Common form patterns

---

## Installation

Drop the `FORMS` folder into your project:

```txt
scripts/
└── API/
    └── FORMS/
        ├── forms.ts
        ├── formTypes.ts
        ├── formBuilder.ts
        ├── formPresets.ts
        ├── formErrors.ts
        ├── text.ts
        └── index.ts
```

Then export it:

```ts
export * from "./API/FORMS";
```

---

## Requirements

| Dependency             | Version  |
| ---------------------- | -------- |
| `@minecraft/server`    | v2.6.0   |
| `@minecraft/server-ui` | v2.1.0   |
| TypeScript             | 5.5+     |
| Beta APIs              | Required |

> **Warning:** Beta APIs must be enabled in your world settings.

---

## Quick Start

```ts
import { Forms } from "./API/FORMS";

await Forms.action(player, {
  title: "Hello World",
  body: "Your first Forms+ form.",
  items: [
    { kind: "button", text: "Click Me" }
  ],
  actions: [
    (p) => p.sendMessage("It works!")
  ]
});
```

---

## Core Concept

Forms+ is not just a wrapper — it's a **system**.

```txt
User Code
  ↓
Validation
  ↓
Internal Build
  ↓
UI Display (with retry)
  ↓
Safe Callback Execution
```

---

## Configuration

```ts
import { Forms } from "./API/FORMS";

Forms.configure({
  debug: true,
  strict: true,
  busyHandling: "retry",
  maxBusyRetries: 500,
});
```

### Options

| Option           | Type      | Default      | Description                      |
| ---------------- | --------- | ------------ | -------------------------------- |
| `debug`          | `boolean` | `false`      | Enable validation logs           |
| `strict`         | `boolean` | `true`       | Throw on validation errors       |
| `logWarnings`    | `boolean` | `true`       | Include warnings in debug output |
| `logToChat`      | `boolean` | `false`      | Send debug logs to tagged players|
| `chatTag`        | `string`  | `"debug"`    | Player tag for in-chat debug     |
| `prefix`         | `string`  | `"[Forms+]"` | Prefix for log messages          |
| `busyHandling`   | `string`  | `"retry"`    | `"retry"` or `"none"`           |
| `maxBusyRetries` | `number`  | `500`        | Retry attempts on `UserBusy`     |
| `validateOnShow` | `boolean` | `true`       | Auto-validate before showing     |

---

## Action Form

```ts
await Forms.action(player, {
  title: "Menu",
  items: [
    { kind: "header", text: "Actions" },
    { kind: "button", text: "Play" },
    { kind: "button", text: "Settings" },
    { kind: "divider" },
    { kind: "button", text: "Quit" }
  ],
  actions: [
    (p) => startGame(p),
    (p) => openSettings(p),
    (p) => p.sendMessage("Goodbye")
  ]
});
```

### Item Types

| Kind      | Properties          | Description          |
| --------- | ------------------- | -------------------- |
| `button`  | `text`, `iconPath?` | Clickable button     |
| `header`  | `text`              | Section header       |
| `label`   | `text`              | Non-interactive text |
| `divider` | —                   | Visual separator     |

---

## Message Form

```ts
await Forms.message(player, {
  title: "Confirm",
  body: "Are you sure?",
  button1: { text: "Yes" },
  button2: { text: "No" },
  actions: [
    (p) => p.sendMessage("Confirmed"),
    (p) => p.sendMessage("Cancelled")
  ]
});
```

### Result

| Value | Meaning             |
| ----- | ------------------- |
| `0`   | button1 was pressed |
| `1`   | button2 was pressed |

---

## Modal Form

```ts
await Forms.modal(player, {
  title: "Settings",
  submitButton: "Save",
  controls: [
    { type: "textField", label: "Name", placeholder: "Enter name..." },
    { type: "slider", label: "Volume", min: 0, max: 100, step: 5 },
    { type: "toggle", label: "Enable Feature", defaultValue: true },
    { type: "dropdown", label: "Mode", options: ["Easy", "Normal", "Hard"] }
  ],
  onSubmit: (values, player) => {
    const [name, volume, enabled, mode] = values;
    player.sendMessage(`Name: ${name}, Volume: ${volume}`);
  }
});
```

### Control Types

| Type        | Output    | Properties                                       |
| ----------- | --------- | ------------------------------------------------ |
| `textField` | `string`  | `label`, `placeholder?`, `defaultValue?`         |
| `slider`    | `number`  | `label`, `min`, `max`, `step?`, `defaultValue?`  |
| `toggle`    | `boolean` | `label`, `defaultValue?`                         |
| `dropdown`  | `number`  | `label`, `options[]`, `defaultValueIndex?`       |
| `header`    | —         | `text` (layout only)                             |
| `label`     | —         | `text` (layout only)                             |
| `divider`   | —         | (layout only)                                    |

---

## Builder API

Cleaner syntax, safer structure:

```ts
import { FormBuilder, Forms } from "./API/FORMS";

const form = FormBuilder.action()
  .title("Menu")
  .header("Options")
  .button("Option 1", (p) => p.sendMessage("1"))
  .button("Option 2", (p) => p.sendMessage("2"))
  .divider()
  .button("Quit")
  .build();

await Forms.action(player, form);
```

### Available Builders

| Builder                 | Creates               |
| ----------------------- | --------------------- |
| `FormBuilder.action()`  | `ActionFormOptions`   |
| `FormBuilder.message()` | `MessageFormOptions`  |
| `FormBuilder.modal()`   | `ModalFormOptions<T>` |

---

## Presets

Reusable UI patterns:

```ts
import { FormPresets, Forms } from "./API/FORMS";

await Forms.message(player, FormPresets.confirm());
await Forms.message(player, FormPresets.dangerConfirm("Delete all data?"));
await Forms.action(player, FormPresets.error("Connection failed."));
await Forms.action(player, FormPresets.success("Saved!"));
```

### Available Presets

| Preset           | Returns              | Description              |
| ---------------- | -------------------- | ------------------------ |
| `confirm()`      | `MessageFormOptions` | Yes/No dialog            |
| `dangerConfirm()`| `MessageFormOptions` | Destructive action       |
| `ok()`           | `ActionFormOptions`  | Single-button notice     |
| `error()`        | `ActionFormOptions`  | Error with Close button  |
| `success()`      | `ActionFormOptions`  | Success with Nice button |
| `loading()`      | `ActionFormOptions`  | Loading indicator        |

---

## Validation

Automatically checks before display:

- Invalid or null player
- Missing buttons
- Invalid text types
- Incorrect structure
- Mismatched action arrays

```ts
const result = Forms.validateActionForm(options);
const result = Forms.validateMessageForm(options);
const result = Forms.validateModalForm(options);
```

### ValidationResult

```ts
{
  valid: boolean,
  errors: FormIssue[],
  warnings: FormIssue[],
  issues: FormIssue[]
}
```

---

## Error System

Structured error hierarchy — all extend `FormsError`:

| Error Class          | Code                  | When                            |
| -------------------- | --------------------- | ------------------------------- |
| `FormsError`         | `FORMS_ERROR`         | Base error                      |
| `InvalidPlayerError` | `INVALID_PLAYER`      | Player is null/invalid          |
| `ValidationError`    | `VALIDATION_ERROR`    | Form failed validation (strict) |
| `FormDisplayError`   | `FORM_DISPLAY_ERROR`  | Max retries exceeded            |
| `FormCallbackError`  | `FORM_CALLBACK_ERROR` | Exception inside a callback     |

```ts
try {
  await Forms.action(player, form);
} catch (e) {
  if (e instanceof ValidationError) {
    console.warn("Validation:", e.details);
  } else if (e instanceof FormCallbackError) {
    console.warn("Callback crashed:", e.details);
  }
}
```

---

## Retry System

Fixes `UserBusy` — a common Bedrock issue where forms fail to display.

```ts
Forms.configure({
  busyHandling: "retry",
  maxBusyRetries: 500
});
```

| Mode      | Behavior                                      |
| --------- | --------------------------------------------- |
| `"retry"` | Automatically retry until success or limit    |
| `"none"`  | No retries — treat `UserBusy` as cancellation |

---

## FormResult

Every form method returns a discriminated union:

```ts
type FormResult<T> =
  | { canceled: true; reason: string; response?: unknown }
  | { canceled: false; data: T; response?: unknown };
```

| Form        | `data` Type      |
| ----------- | ---------------- |
| `action()`  | `number`         |
| `message()` | `0 \| 1`        |
| `modal()`   | `ModalValues<T>` |

```ts
const result = await Forms.action(player, options);

if (result.canceled) {
  console.log(result.reason);
  return;
}

console.log(result.data); // button index
```

---

## Architecture

| File             | Responsibility                                    |
| ---------------- | ------------------------------------------------- |
| `forms.ts`       | Core engine — execution, validation, retry, debug |
| `formTypes.ts`   | Complete type system                              |
| `formBuilder.ts` | Fluent builder classes                            |
| `formPresets.ts` | Reusable form factories                           |
| `formErrors.ts`  | Error class hierarchy                             |
| `text.ts`        | `isFormText()`, `isRawMessage()`                  |
| `index.ts`       | Barrel exports                                    |

---

## Comparison

| Feature        | Vanilla | Forms+ |
| -------------- | ------- | ------ |
| Validation     | ❌      | ✅     |
| Retry Handling | ❌      | ✅     |
| Typing         | ❌      | ✅     |
| Builders       | ❌      | ✅     |
| Error System   | ❌      | ✅     |
| Presets        | ❌      | ✅     |

---

## Use Cases

- Large-scale addons with many UI flows
- Admin and moderation systems
- UI-heavy game logic (shops, warps, settings)
- Any project that needs reliable, scalable forms

---

## Philosophy

Forms+ treats UI like a system, not a collection of scattered API calls.

- **Structured** — Every form follows the same pipeline
- **Predictable** — Validation before execution, safe callbacks
- **Reusable** — Builders and presets eliminate boilerplate
- **Typed** — Full TypeScript inference from input to output
