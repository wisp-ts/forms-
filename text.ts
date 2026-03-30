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