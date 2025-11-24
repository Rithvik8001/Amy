const MAX_INPUT_LENGTH = 2000;

// Malicious patterns to detect and block
const MALICIOUS_PATTERNS = [
  // Prompt injection attempts
  /ignore\s+previous\s+instructions/gi,
  /ignore\s+all\s+previous\s+instructions/gi,
  /forget\s+everything/gi,
  /system\s*:/gi,
  /assistant\s*:/gi,
  /user\s*:/gi,
  /\[system\]/gi,
  /\[assistant\]/gi,
  /\[user\]/gi,
  /<\|system\|>/gi,
  /<\|assistant\|>/gi,
  /<\|user\|>/gi,
  
  // SQL injection patterns
  /('|"|;)\s*(drop|delete|truncate|alter|create|insert|update|exec|execute)/gi,
  /union\s+select/gi,
  /or\s+1\s*=\s*1/gi,
  /';?\s*(drop|delete|truncate|alter|create|insert|update|exec|execute)/gi,
  
  // Script injection
  /<script/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, etc.
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  
  // Control characters and excessive special chars
  /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, // Control characters
];

// Patterns that are suspicious if repeated excessively
const SUSPICIOUS_REPEATED_PATTERNS = [
  /[<>{}[\]\\|`~]/g, // Special characters that might be used for injection
];

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Validate AI input text for malicious content and length limits
 * @param text - Input text to validate
 * @returns Validation result
 */
export function validateAiInput(text: string): ValidationResult {
  // Check if input is provided
  if (!text || typeof text !== "string") {
    return {
      valid: false,
      error: "Input is required and must be a string",
    };
  }

  // Check length limit
  if (text.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      error: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`,
    };
  }

  // Check for empty or whitespace-only input
  if (text.trim().length === 0) {
    return {
      valid: false,
      error: "Input cannot be empty",
    };
  }

  // Check for malicious patterns
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        valid: false,
        error: "Input contains prohibited content",
      };
    }
  }

  // Check for excessive special characters (more than 20% of content)
  for (const pattern of SUSPICIOUS_REPEATED_PATTERNS) {
    const matches = text.match(pattern);
    if (matches && matches.length > text.length * 0.2) {
      return {
        valid: false,
        error: "Input contains excessive special characters",
      };
    }
  }

  // Check for excessive repetition of single character (potential DoS)
  const charCounts = new Map<string, number>();
  for (const char of text) {
    charCounts.set(char, (charCounts.get(char) || 0) + 1);
  }
  const maxCharCount = Math.max(...Array.from(charCounts.values()));
  if (maxCharCount > text.length * 0.5 && text.length > 100) {
    return {
      valid: false,
      error: "Input contains excessive character repetition",
    };
  }

  return {
    valid: true,
  };
}

