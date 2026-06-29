import { AppError } from "./AppError.js";

/** Error thrown when a required environment variable is missing. */
export class MissingEnvironmentVariableError extends AppError {
  /**
   * @param {string} variableName Missing environment variable name.
   * @param {object} [options] Error options.
   * @param {string} [options.moduleName] Module that required the variable.
   */
  constructor(variableName, options = {}) {
    super(`${variableName} environment variable is not configured`, {
      code: "CONFIG_MISSING_ENVIRONMENT_VARIABLE",
      details: {
        variableName,
        moduleName: options.moduleName ?? null,
      },
    });
  }
}

/** Error thrown when an environment variable contains an unsupported value. */
export class InvalidEnvironmentVariableError extends AppError {
  /**
   * @param {string} variableName Environment variable name.
   * @param {string} actualValue Actual configured value.
   * @param {Iterable<string>} allowedValues Allowed values.
   * @param {object} [options] Error options.
   * @param {string} [options.moduleName] Module that required the variable.
   */
  constructor(variableName, actualValue, allowedValues, options = {}) {
    const allowedValueList = [...allowedValues];

    super(
      `Invalid ${variableName}: ${actualValue}. Expected one of: ${allowedValueList.join(", ")}`,
      {
        code: "CONFIG_INVALID_ENVIRONMENT_VARIABLE",
        details: {
          variableName,
          actualValue,
          allowedValues: allowedValueList,
          moduleName: options.moduleName ?? null,
        },
      },
    );
  }
}
