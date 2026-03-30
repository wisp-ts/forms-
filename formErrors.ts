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

export class FormsError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code = "FORMS_ERROR", details?: unknown) {
    super(message);
    this.name = "FormsError";
    this.code = code;
    this.details = details;
  }
}

export class InvalidPlayerError extends FormsError {
  constructor(details?: unknown) {
    super("Invalid player supplied to Forms.", "INVALID_PLAYER", details);
    this.name = "InvalidPlayerError";
  }
}

export class ValidationError extends FormsError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class FormDisplayError extends FormsError {
  constructor(message: string, details?: unknown) {
    super(message, "FORM_DISPLAY_ERROR", details);
    this.name = "FormDisplayError";
  }
}

export class FormCallbackError extends FormsError {
  constructor(message: string, details?: unknown) {
    super(message, "FORM_CALLBACK_ERROR", details);
    this.name = "FormCallbackError";
  }
}