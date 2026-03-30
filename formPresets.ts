import { ActionFormOptions, MessageFormOptions } from "./formTypes";

export class FormPresets {
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

  public static yesNo(title: string, body: string): MessageFormOptions {
    return this.confirm(title, body, "Yes", "No");
  }

  public static ok(title = "Notice", body = "Okay", button = "OK"): ActionFormOptions {
    return {
      title,
      body,
      items: [{ kind: "button", text: button }],
      actions: [undefined],
    };
  }

  public static success(
    title = "Success",
    body = "Action completed successfully.",
    button = "Nice",
  ): ActionFormOptions {
    return {
      title,
      body,
      items: [{ kind: "button", text: button }],
      actions: [undefined],
    };
  }

  public static error(
    title = "Error",
    body = "Something went wrong.",
    button = "Close",
  ): ActionFormOptions {
    return {
      title,
      body,
      items: [{ kind: "button", text: button }],
      actions: [undefined],
    };
  }

  public static menu(title: string, body: string, labels: string[]): ActionFormOptions {
    return {
      title,
      body,
      items: labels.map((text) => ({ kind: "button", text })),
      actions: labels.map(() => undefined),
    };
  }
}