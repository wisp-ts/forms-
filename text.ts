import { RawMessage } from "@minecraft/server";
import { FormText } from "./formTypes";

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function isRawMessage(value: unknown): value is RawMessage {
  if (!isObject(value)) return false;

  return (
    "rawtext" in value ||
    "text" in value ||
    "translate" in value ||
    "with" in value ||
    "score" in value ||
    "selector" in value
  );
}

export function isFormText(value: unknown): value is FormText {
  return typeof value === "string" || isRawMessage(value);
}

export function isFunction<T extends (...args: any[]) => any>(value: unknown): value is T {
  return typeof value === "function";
}