// Chapter 23.6 File Upload Security - Client Side Validation
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const MAX_FILE_SIZE_MB = 50; // 50MB limit
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/json',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export function validateDocumentUpload(file: File): FileValidationResult {
  // 1. Extension and MIME type verification
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Unsupported file type: ${file.type}. Please upload PDF, TXT, CSV, or Excel files.`
    };
  }

  // 2. Maximum size enforcement
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      isValid: false,
      error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum limit of ${MAX_FILE_SIZE_MB}MB.`
    };
  }

  // 3. Filename sanitization check (basic client side)
  if (/[<>:"/\\|?*]/.test(file.name)) {
    return {
      isValid: false,
      error: 'Filename contains invalid characters.'
    };
  }

  return { isValid: true };
}

// Additional utility for Prompt Injection mitigation (Section 23.7)
// Ensures any user input is properly stringified and doesn't contain obvious control characters
export function sanitizeUserInput(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}
