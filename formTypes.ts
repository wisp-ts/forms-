import { Player, RawMessage } from "@minecraft/server";

export type FormText = string | RawMessage;
export type MaybePromise<T> = T | Promise<T>;

export type FormCancelReason = "UserBusy" | "UserClosed" | "unknown" | string;
export type BusyHandlingMode = "none" | "retry";

export type FormResult<T = undefined> =
  | { canceled: true; reason: FormCancelReason; response?: unknown }
  | { canceled: false; data: T; response?: unknown };

export type FormIssueLevel = "error" | "warning";

export type FormIssue = {
  level: FormIssueLevel;
  path: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: FormIssue[];
  warnings: FormIssue[];
  issues: FormIssue[];
};

export type FormsConfig = {
  debug?: boolean;
  strict?: boolean;
  logWarnings?: boolean;
  logToChat?: boolean;
  chatTag?: string;
  prefix?: string;
  busyHandling?: BusyHandlingMode;
  maxBusyRetries?: number;
  validateOnShow?: boolean;
};

export type ActionFormButton = {
  kind: "button";
  text: FormText;
  iconPath?: string;
};

export type ActionFormHeader = {
  kind: "header";
  text: FormText;
};

export type ActionFormLabel = {
  kind: "label";
  text: FormText;
};

export type ActionFormDivider = {
  kind: "divider";
};

export type ActionFormItem =
  | ActionFormButton
  | ActionFormHeader
  | ActionFormLabel
  | ActionFormDivider;

export type ActionFormOptions = {
  title?: FormText;
  body?: FormText;
  items: readonly ActionFormItem[];
  onSelect?: (buttonIndex: number, player: Player) => MaybePromise<void>;
  actions?: readonly (((player: Player) => MaybePromise<void>) | undefined)[];
};

export type MessageFormButton = {
  text: FormText;
};

export type MessageFormOptions = {
  title?: FormText;
  body?: FormText;
  button1: MessageFormButton;
  button2: MessageFormButton;
  onSelect?: (index: 0 | 1, player: Player) => MaybePromise<void>;
  actions?: readonly [
    ((player: Player) => MaybePromise<void>) | undefined,
    ((player: Player) => MaybePromise<void>) | undefined,
  ];
};

export type ModalHeader = {
  type: "header";
  text: FormText;
};

export type ModalLabel = {
  type: "label";
  text: FormText;
};

export type ModalDivider = {
  type: "divider";
};

export type ModalTextField = {
  type: "textField";
  label: FormText;
  placeholder?: FormText;
  defaultValue?: FormText;
  tooltip?: FormText;
};

export type ModalSlider = {
  type: "slider";
  label: FormText;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  tooltip?: FormText;
};

export type ModalToggle = {
  type: "toggle";
  label: FormText;
  defaultValue?: boolean;
  tooltip?: FormText;
};

export type ModalDropdown = {
  type: "dropdown";
  label: FormText;
  options: FormText[];
  defaultValueIndex?: number;
  tooltip?: FormText;
};

export type ModalControl =
  | ModalHeader
  | ModalLabel
  | ModalDivider
  | ModalTextField
  | ModalSlider
  | ModalToggle
  | ModalDropdown;

export type ModalInputControl = Exclude<ModalControl, ModalHeader | ModalLabel | ModalDivider>;

export type ModalValue<T extends ModalControl> =
  T extends ModalTextField ? string
  : T extends ModalSlider ? number
  : T extends ModalToggle ? boolean
  : T extends ModalDropdown ? number
  : undefined;

export type ModalValues<T extends readonly ModalControl[]> = {
  [K in keyof T]: T[K] extends ModalControl ? ModalValue<T[K]> : never;
};

export type ModalInputValue<T extends ModalInputControl> =
  T extends ModalTextField ? string
  : T extends ModalSlider ? number
  : T extends ModalToggle ? boolean
  : T extends ModalDropdown ? number
  : never;

export type ModalActionMap<T extends readonly ModalControl[]> = {
  [K in keyof T]?: T[K] extends ModalInputControl
    ? (value: ModalInputValue<T[K]>, values: ModalValues<T>, player: Player) => MaybePromise<void>
    : never;
};

export type ModalFormOptions<T extends readonly ModalControl[] = readonly ModalControl[]> = {
  title?: FormText;
  submitButton?: FormText;
  controls: T;
  onSubmit?: (values: ModalValues<T>, player: Player) => MaybePromise<void>;
  actions?: ModalActionMap<T>;
};