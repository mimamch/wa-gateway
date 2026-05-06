import type { ContentfulStatusCode } from "hono/utils/http-status";

export class ApplicationError extends Error {
  baseName = "ApplicationError";
  code: ContentfulStatusCode = 500;

  constructor(message: string) {
    super(message);
    this.name = "ApplicationError";
  }

  getResponseMessage = () => {
    return {
      message: this.message,
    };
  };

  static isApplicationError = (error: any): error is ApplicationError => {
    return (
      error instanceof ApplicationError || error.baseName === "ApplicationError"
    );
  };
}
