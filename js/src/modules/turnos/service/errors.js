// errors.js

export class AppError extends Error {
  constructor(message, code = "APP_ERROR") {
    super(message);
    this.code = code;
  }
}

export class NetworkError extends AppError {
  constructor(message = "Network error") {
    super(message, "NETWORK_ERROR");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation error") {
    super(message, "VALIDATION_ERROR");
  }
}