/*


______  _____ ______ ___  ___ _____        
|  ___||  _  || ___ \|  \/  |/  ___|   _   
| |_   | | | || |_/ /| .  . |\ `--.  _| |_ 
|  _|  | | | ||    / | |\/| | `--. \|_   _|
| |    \ \_/ /| |\ \ | |  | |/\__/ /  |_|  
\_|     \___/ \_| \_|\_|  |_/\____/        
                                           
presets, utilities, and builders for forms.
presented by:
 _    _  _____  _____ ______     _____  _____ 
| |  | ||_   _|/  ___|| ___ \   |_   _|/  ___|
| |  | |  | |  \ `--. | |_/ /     | |  \ `--. 
| |/\| |  | |   `--. \|  __/      | |   `--. \
\  /\  / _| |_ /\__/ /| |     _   | |  /\__/ /
 \/  \/  \___/ \____/ \_|    (_)  \_/  \____/ 
                                              
 */

 
import { Player, system, world } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";

import {
  ActionFormOptions,
  FormIssue,
  FormResult,
  FormsConfig,
  MessageFormOptions,
  ModalControl,
  ModalFormOptions,
  ModalValues,
  ValidationResult,
} from "./formTypes";

import { isFormText, isFunction } from "./text";
import { FormCallbackError, FormDisplayError, InvalidPlayerError, ValidationError } from "./formErrors";

/* ------------------------------ UTIL ------------------------------ */

class IssueCollector {
  private readonly issues: FormIssue[] = [];

  error(path: string, message: string) {
    this.issues.push({ level: "error", path, message });
  }

  warning(path: string, message: string) {
    this.issues.push({ level: "warning", path, message });
  }

  result(): ValidationResult {
    const errors = this.issues.filter((i) => i.level === "error");
    const warnings = this.issues.filter((i) => i.level === "warning");

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      issues: this.issues,
    };
  }
}

/* ------------------------------ CORE ------------------------------ */

export class Forms {
  private static config: Required<FormsConfig> = {
    debug: false,
    strict: true,
    logWarnings: true,
    logToChat: false,
    chatTag: "debug",
    prefix: "[Forms+]",
    busyHandling: "retry",
    maxBusyRetries: 500,
    validateOnShow: true,
  };

  /* ---------------- CONFIG ---------------- */

  static configure(config: FormsConfig) {
    this.config = { ...this.config, ...config };

    if (!Number.isInteger(this.config.maxBusyRetries) || this.config.maxBusyRetries < 0) {
      this.config.maxBusyRetries = 0;
    }

    if (!this.config.prefix.trim()) this.config.prefix = "[Forms+]";
    if (!this.config.chatTag.trim()) this.config.chatTag = "debug";
  }

  static getConfig(): Required<FormsConfig> {
    return { ...this.config };
  }

  /* ---------------- DEBUG ---------------- */

  private static debugLog(scope: string, result: ValidationResult) {
    if (!this.config.debug || result.issues.length === 0) return;

    const filtered = result.issues.filter((i) => i.level === "error" || this.config.logWarnings);

    if (!filtered.length) return;

    const text =
      `${this.config.prefix} ${scope}\n` +
      filtered.map((i) => `${i.level.toUpperCase()} | ${i.path} | ${i.message}`).join("\n");

    console.warn(text);

    if (!this.config.logToChat) return;

    for (const player of world.getAllPlayers()) {
      try {
        if (player.hasTag(this.config.chatTag)) player.sendMessage(text);
      } catch {}
    }
  }

  static printValidation(result: ValidationResult): string {
    if (!result.issues.length) return "No issues found.";
    return result.issues.map((i) => `${i.level.toUpperCase()} | ${i.path} | ${i.message}`).join("\n");
  }

  private static handleValidation(scope: string, result: ValidationResult): boolean {
    this.debugLog(scope, result);

    if (result.valid) return true;

    if (this.config.strict) {
      throw new ValidationError(
        `${this.config.prefix} ${scope} validation failed:\n` +
          result.errors.map((i) => `[${i.path}] ${i.message}`).join("\n"),
        result
      );
    }

    return false;
  }

  /* ---------------- VALIDATION ---------------- */

  private static validatePlayer(player?: Player | null): ValidationResult {
    const v = new IssueCollector();

    if (!player) {
      v.error("player", "Player is required.");
      return v.result();
    }

    if (!player.isValid) v.error("player", "Player is not valid.");

    return v.result();
  }

  static validateActionForm(options: ActionFormOptions): ValidationResult {
    const v = new IssueCollector();

    if (!options || typeof options !== "object") {
      v.error("options", "Must be object.");
      return v.result();
    }

    if (options.title && !isFormText(options.title)) v.error("title", "Invalid");
    if (options.body && !isFormText(options.body)) v.error("body", "Invalid");

    if (!Array.isArray(options.items) || !options.items.length) {
      v.error("items", "At least one item required.");
      return v.result();
    }

    let buttonCount = 0;

    options.items.forEach((item, i) => {
      const path = `items[${i}]`;
      if (!item || typeof item !== "object") return v.error(path, "Invalid item");

      switch (item.kind) {
        case "button":
          buttonCount++;
          if (!isFormText(item.text)) v.error(`${path}.text`, "Invalid");
          break;
        case "header":
        case "label":
          if (!isFormText(item.text)) v.error(`${path}.text`, "Invalid");
          break;
      }
    });

    if (!buttonCount) v.error("items", "Needs button");

    return v.result();
  }

  /* ---------------- INTERNAL ---------------- */

  private static async showWithRetry<T extends { canceled?: boolean; cancelationReason?: string }>(
    fn: () => Promise<T>
  ): Promise<T> {
    const max = this.config.busyHandling === "retry" ? this.config.maxBusyRetries : 0;

    for (let i = 0; i <= max; i++) {
      const res = await fn();

      if (res?.cancelationReason === "UserBusy" && i < max) continue;
      return res;
    }

    throw new FormDisplayError("Max retries hit");
  }

  private static async safe(scope: string, fn: () => Promise<void>) {
    try {
      await fn();
    } catch (e) {
      throw new FormCallbackError(`${scope} failed`, e);
    }
  }

  /* ---------------- ACTION ---------------- */

  static async action(player: Player, options: ActionFormOptions): Promise<FormResult<number>> {
    if (!this.handleValidation("Player", this.validatePlayer(player))) {
      return { canceled: true, reason: "invalid_player" };
    }

    const form = new ActionFormData();
    options.title && form.title(options.title);
    options.body && form.body(options.body);

    for (const item of options.items) {
      if (item.kind === "button") form.button(item.text, item.iconPath);
      if (item.kind === "header") form.header(item.text);
      if (item.kind === "label") form.label(item.text);
      if (item.kind === "divider") form.divider();
    }

const res = await this.showWithRetry(() =>
  new Promise<Awaited<ReturnType<typeof form.show>>>((resolve) => {
    system.run(async () => {
      resolve(await form.show(player));
    });
  })
);

    if (res.canceled || res.selection === undefined) {
      return { canceled: true, reason: "canceled", response: res };
    }

    const i = res.selection;

    await this.safe("action", async () => {
      await options.actions?.[i]?.(player);
      await options.onSelect?.(i, player);
    });

    return { canceled: false, data: i, response: res };
  }

  /* ---------------- MESSAGE ---------------- */

  static async message(player: Player, options: MessageFormOptions): Promise<FormResult<0 | 1>> {
    const form = new MessageFormData();

    options.title && form.title(options.title);
    options.body && form.body(options.body);
    form.button1(options.button1.text);
    form.button2(options.button2.text);

    const res = await this.showWithRetry(
      () =>
        new Promise<Awaited<ReturnType<typeof form.show>>>((resolve) => {
          system.run(async () => {
            resolve(await form.show(player));
          });
        })
    );

    if (res.canceled || res.selection === undefined) {
      return { canceled: true, reason: "canceled", response: res };
    }

    const i = res.selection as 0 | 1;

    await this.safe("message", async () => {
      await options.actions?.[i]?.(player);
      await options.onSelect?.(i, player);
    });

    return { canceled: false, data: i, response: res };
  }

  /* ---------------- MODAL ---------------- */

  static async modal<const T extends readonly ModalControl[]>(
    player: Player,
    options: ModalFormOptions<T>
  ): Promise<FormResult<ModalValues<T>>> {
    const form = new ModalFormData();

    options.title && form.title(options.title);
    options.submitButton && form.submitButton(options.submitButton);

    for (const c of options.controls) {
      switch (c.type) {
        case "textField":
          form.textField(c.label, c.placeholder ?? "", { defaultValue: c.defaultValue });
          break;
        case "slider":
          form.slider(c.label, c.min, c.max, { defaultValue: c.defaultValue ?? c.min });
          break;
        case "toggle":
          form.toggle(c.label, { defaultValue: c.defaultValue ?? false });
          break;
        case "dropdown":
          form.dropdown(c.label, c.options, { defaultValueIndex: c.defaultValueIndex ?? 0 });
          break;
        case "header":
          form.header(c.text);
          break;
        case "label":
          form.label(c.text);
          break;
        case "divider":
          form.divider();
          break;
      }
    }

    const res = await this.showWithRetry(
      () =>
        new Promise<Awaited<ReturnType<typeof form.show>>>((resolve) => {
          system.run(async () => {
            resolve(await form.show(player));
          });
        })
    );

    if (res.canceled || !res.formValues) {
      return { canceled: true, reason: "canceled", response: res };
    }

    const values = res.formValues as ModalValues<T>;

    await this.safe("modal", async () => {
      await options.onSubmit?.(values, player);
    });

    return { canceled: false, data: values, response: res };
  }
}
