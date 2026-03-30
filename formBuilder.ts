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

import { Player } from "@minecraft/server";
import {
  ActionFormItem,
  ActionFormOptions,
  FormText,
  MaybePromise,
  MessageFormOptions,
  ModalActionMap,
  ModalControl,
  ModalFormOptions,
  ModalValues,
} from "./formTypes";

export class ActionFormBuilder {
  private _title?: FormText;
  private _body?: FormText;
  private _items: ActionFormItem[] = [];
  private _actions: Array<((player: Player) => MaybePromise<void>) | undefined> = [];
  private _onSelect?: (buttonIndex: number, player: Player) => MaybePromise<void>;

  public title(value: FormText) {
    this._title = value;
    return this;
  }

  public body(value: FormText) {
    this._body = value;
    return this;
  }

  public header(text: FormText) {
    this._items.push({ kind: "header", text });
    return this;
  }

  public label(text: FormText) {
    this._items.push({ kind: "label", text });
    return this;
  }

  public divider() {
    this._items.push({ kind: "divider" });
    return this;
  }

  public button(
    text: FormText,
    action?: (player: Player) => MaybePromise<void>,
    iconPath?: string,
  ) {
    this._items.push({ kind: "button", text, iconPath });
    this._actions.push(action);
    return this;
  }

  public onSelect(handler: (buttonIndex: number, player: Player) => MaybePromise<void>) {
    this._onSelect = handler;
    return this;
  }

  public build(): ActionFormOptions {
    return {
      title: this._title,
      body: this._body,
      items: this._items,
      actions: this._actions,
      onSelect: this._onSelect,
    };
  }
}

export class MessageFormBuilder {
  private _title?: FormText;
  private _body?: FormText;
  private _button1?: { text: FormText };
  private _button2?: { text: FormText };
  private _actions: [
    ((player: Player) => MaybePromise<void>) | undefined,
    ((player: Player) => MaybePromise<void>) | undefined,
  ] = [undefined, undefined];
  private _onSelect?: (index: 0 | 1, player: Player) => MaybePromise<void>;

  public title(value: FormText) {
    this._title = value;
    return this;
  }

  public body(value: FormText) {
    this._body = value;
    return this;
  }

  public button1(text: FormText, action?: (player: Player) => MaybePromise<void>) {
    this._button1 = { text };
    this._actions[0] = action;
    return this;
  }

  public button2(text: FormText, action?: (player: Player) => MaybePromise<void>) {
    this._button2 = { text };
    this._actions[1] = action;
    return this;
  }

  public onSelect(handler: (index: 0 | 1, player: Player) => MaybePromise<void>) {
    this._onSelect = handler;
    return this;
  }

  public build(): MessageFormOptions {
    if (!this._button1 || !this._button2) {
      throw new Error("MessageFormBuilder requires button1 and button2.");
    }

    return {
      title: this._title,
      body: this._body,
      button1: this._button1,
      button2: this._button2,
      actions: this._actions,
      onSelect: this._onSelect,
    };
  }
}

export class ModalFormBuilder<T extends readonly ModalControl[] = readonly []> {
  private _title?: FormText;
  private _submitButton?: FormText;
  private _controls: ModalControl[] = [];
  private _actions: Partial<Record<number, (value: unknown, values: unknown, player: Player) => MaybePromise<void>>> = {};
  private _onSubmit?: (values: unknown, player: Player) => MaybePromise<void>;

  public title(value: FormText) {
    this._title = value;
    return this;
  }

  public submitButton(value: FormText) {
    this._submitButton = value;
    return this;
  }

  public header(text: FormText) {
    this._controls.push({ type: "header", text });
    return this as unknown as ModalFormBuilder<[...T, { type: "header"; text: FormText }]>;
  }

  public label(text: FormText) {
    this._controls.push({ type: "label", text });
    return this as unknown as ModalFormBuilder<[...T, { type: "label"; text: FormText }]>;
  }

  public divider() {
    this._controls.push({ type: "divider" });
    return this as unknown as ModalFormBuilder<[...T, { type: "divider" }]>;
  }

  public textField(label: FormText, placeholder?: FormText, defaultValue?: FormText, tooltip?: FormText) {
    this._controls.push({ type: "textField", label, placeholder, defaultValue, tooltip });
    return this as unknown as ModalFormBuilder<[
      ...T,
      { type: "textField"; label: FormText; placeholder?: FormText; defaultValue?: FormText; tooltip?: FormText }
    ]>;
  }

  public slider(label: FormText, min: number, max: number, step?: number, defaultValue?: number, tooltip?: FormText) {
    this._controls.push({ type: "slider", label, min, max, step, defaultValue, tooltip });
    return this as unknown as ModalFormBuilder<[
      ...T,
      { type: "slider"; label: FormText; min: number; max: number; step?: number; defaultValue?: number; tooltip?: FormText }
    ]>;
  }

  public toggle(label: FormText, defaultValue?: boolean, tooltip?: FormText) {
    this._controls.push({ type: "toggle", label, defaultValue, tooltip });
    return this as unknown as ModalFormBuilder<[
      ...T,
      { type: "toggle"; label: FormText; defaultValue?: boolean; tooltip?: FormText }
    ]>;
  }

  public dropdown(label: FormText, options: FormText[], defaultValueIndex?: number, tooltip?: FormText) {
    this._controls.push({ type: "dropdown", label, options, defaultValueIndex, tooltip });
    return this as unknown as ModalFormBuilder<[
      ...T,
      { type: "dropdown"; label: FormText; options: FormText[]; defaultValueIndex?: number; tooltip?: FormText }
    ]>;
  }

  public action<K extends keyof T>(
    index: K,
    handler: T[K] extends { type: "textField" | "slider" | "toggle" | "dropdown" }
      ? (value: T[K] extends ModalControl ? Exclude<ModalValues<T>[K], undefined> : never, values: ModalValues<T>, player: Player) => MaybePromise<void>
      : never,
  ) {
    this._actions[Number(index)] = handler as unknown as (value: unknown, values: unknown, player: Player) => MaybePromise<void>;
    return this;
  }

  public onSubmit(handler: (values: ModalValues<T>, player: Player) => MaybePromise<void>) {
    this._onSubmit = handler as unknown as (values: unknown, player: Player) => MaybePromise<void>;
    return this;
  }

  public build(): ModalFormOptions<T> {
    return {
      title: this._title,
      submitButton: this._submitButton,
      controls: this._controls as unknown as T,
      actions: this._actions as ModalActionMap<T>,
      onSubmit: this._onSubmit as ((values: ModalValues<T>, player: Player) => MaybePromise<void>) | undefined,
    };
  }
}

export class FormBuilder {
  public static action() {
    return new ActionFormBuilder();
  }

  public static message() {
    return new MessageFormBuilder();
  }

  public static modal() {
    return new ModalFormBuilder();
  }
}