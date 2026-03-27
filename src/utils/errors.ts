import { ApiErrorShape } from "@/types/api";

export class AppError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly validation?: ApiErrorShape["errors"];

  constructor(message: string, options?: { status?: number; code?: string; validation?: ApiErrorShape["errors"] }) {
    super(message);
    this.name = "AppError";
    this.status = options?.status;
    this.code = options?.code;
    this.validation = options?.validation;
  }
}

export function errorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

