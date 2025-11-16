// src/types/batch.ts

/**
 * Represents a single recipient for batch certificate generation
 */
export interface BatchRecipient {
  name: string;
  email: string;
  title?: string;
  date?: string;
  customFields?: Record<string, string>;
}

/**
 * Configuration for batch generation
 */
export interface BatchConfig {
  recipients: BatchRecipient[];
  nameField: string; // Which text element to replace with name
  templateMapping: {
    [key: string]: string; // Maps placeholder like {{name}} to field
  };
}

/**
 * Progress tracking for batch generation
 */
export interface BatchProgress {
  total: number;
  current: number;
  status: "idle" | "processing" | "complete" | "error";
  currentName?: string;
  error?: string;
}

/**
 * Example JSON format for batch upload
 */
export const BATCH_JSON_EXAMPLE = {
  recipients: [
    {
      name: "John Doe",
      email: "john.doe@example.com",
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
    },
    {
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
    },
  ],
};

/**
 * Validation result for recipient data
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Options for batch generation
 */
export interface BatchGenerationOptions {
  compression?: "none" | "low" | "medium" | "high";
  imageFormat?: "png" | "jpg";
  imageQuality?: number; // 0-1 for JPEG quality
  zipFilename?: string;
}
