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

import { ActionFormOptions, MessageFormOptions } from "./formTypes";

export class FormPresets {
  /* ---------------- CONFIRM ---------------- */

  public static confirm(
    title = "Confirm",
    body = "Are you sure?",
    yes = "Yes",
    no = "No",
  ): MessageFormOptions {
    return {
      title,
      body,
      button1: { text: yes },
      button2: { text: no },
    };
  }

  public static dangerConfirm(
    body = "This action cannot be undone.",
    title = "⚠ Confirm Action"
  ): MessageFormOptions {
    return this.confirm(title, body, "Confirm", "Cancel");
  }

  /* ---------------- SIMPLE ---------------- */

  public static ok(
    title = "Notice",
    body = "",
    button = "OK"
  ): ActionFormOptions {
    return {
      title,
      body,
      items: [{ kind: "button", text: button }],
      actions: [undefined],
    };
  }

  public static error(
    body = "Something went wrong.",
    title = "Error"
  ): ActionFormOptions {
    return this.ok(title, body, "Close");
  }

  public static success(
    body = "Completed successfully.",
    title = "Success"
  ): ActionFormOptions {
    return this.ok(title, body, "Nice");
  }

  /* ---------------- MENUS ---------------- */

  public static menu(
    title: string,
    body: string,
    options: {
      label: string;
      action?: () => void;
      icon?: string;
    }[]
  ): ActionFormOptions {
    return {
      title,
      body,
      items: options.map((o) => ({
        kind: "button",
        text: o.label,
        iconPath: o.icon,
      })),
      actions: options.map((o) => o.action),
    };
  }

  public static pagedMenu(
    title: string,
    body: string,
    items: string[],
    page = 0,
    pageSize = 5
  ): ActionFormOptions {
    const start = page * pageSize;
    const slice = items.slice(start, start + pageSize);

    return {
      title,
      body: `${body}\nPage ${page + 1}/${Math.ceil(items.length / pageSize)}`,
      items: [
        ...slice.map((text) => ({ kind: "button" as const, text })),
        { kind: "divider" },
        { kind: "button", text: "Next" },
        { kind: "button", text: "Back" },
      ],
      actions: [
        ...slice.map(() => undefined),
        undefined,
        undefined,
      ],
    };
  }

  /* ---------------- STATUS ---------------- */

  public static loading(
    title = "Loading...",
    body = "Please wait"
  ): ActionFormOptions {
    return {
      title,
      body,
      items: [{ kind: "label", text: "Processing..." }],
    };
  }
}