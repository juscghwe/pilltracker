/** Generic resource-layer typedefs for the dev-notes M1 backend module. */

/**
 * Primitive logical field types supported by the M1 resource contract.
 *
 * This is intentionally small. New values only should be added when a real resource needs them.
 *
 * @typedef {"string" | "integer"} ResourceFieldType
 */

/**
 * Stable operation names used by resource operation policies.
 *
 * @typedef {"list" | "getById" | "search" | "create" | "replace" | "update" | "delete"} ResourceOperationName
 */

/**
 * Normalized value accepted by a resource command.
 *
 * `undefined` should mean "not provided" and should normally not be stored inside command values.
 * Use `null` when the caller explicitly cleared a nullable field.
 *
 * @typedef {string | number | boolean | null} ResourceCommandValue
 */

/**
 * Field definition owned by a resource contract.
 *
 * Field definitions describe the stable relationship between public API fields and storage fields.
 * They do not describe one specific operation. Operation-specific behavior belongs in
 * `ResourceOperationPolicy`.
 *
 * @typedef {object} ResourceFieldDefinition
 * @property {string} publicName Public/API field name.
 * @property {string} columnName Storage column name.
 * @property {ResourceFieldType} type Logical field type.
 * @property {string} sqliteType SQLite column type used for schema generation/validation.
 * @property {boolean} nullable Whether the stored value may be null.
 * @property {boolean} clientWritable Whether external callers may write this field.
 * @property {boolean} [generated] Whether the backend/storage generates this field.
 * @property {boolean} [primaryKey] Whether this field is the primary key.
 * @property {boolean} [autoIncrement] Whether this field auto-increments.
 * @property {boolean} [allowEmpty] Whether an empty trimmed string is allowed as input.
 * @property {boolean} [emptyAsNull] Whether empty string input should be normalized to null.
 * @property {ResourceCommandValue} [outputFallback] Public response fallback when stored value is
 *   null.
 * @property {boolean} [searchable] Whether generic search may inspect this field.
 */

/**
 * Operation-only input field definition.
 *
 * Use this for inputs that are not part of the returned resource shape, such as a `text` search
 * query.
 *
 * @typedef {object} ResourceInputFieldDefinition
 * @property {string} publicName Public input field name.
 * @property {ResourceFieldType} type Logical field type.
 * @property {boolean} required Whether the input field is required for the operation.
 * @property {boolean} nullable Whether the input value may be null.
 * @property {boolean} [allowEmpty] Whether an empty trimmed string is allowed as input.
 * @property {boolean} [emptyAsNull] Whether empty string input should be normalized to null.
 */

/**
 * Resource contract.
 *
 * This is the single source of truth for resource fields.
 *
 * @typedef {object} ResourceDefinition
 * @property {string} resourceName Human-readable singular resource name.
 * @property {string} tableName Primary storage table name.
 * @property {Readonly<Record<string, ResourceFieldDefinition>>} fields Resource fields keyed by
 *   public field name.
 */

/**
 * Operation policy for one resource operation.
 *
 * The policy says which parts of the raw request are meaningful for the operation. It does not
 * execute validation itself.
 *
 * @typedef {object} ResourceOperationPolicy
 * @property {ResourceOperationName} operation Operation name.
 * @property {boolean} requiresId Whether the operation requires an id.
 * @property {boolean} acceptsBody Whether the operation accepts request body fields.
 * @property {boolean} acceptsQuery Whether the operation accepts query fields.
 * @property {boolean} [requireAtLeastOneField] Whether at least one accepted field must be present.
 * @property {readonly string[]} [requiredFields] Resource fields required for this operation.
 * @property {readonly string[]} [acceptedFields] Resource fields accepted for this operation.
 * @property {readonly string[]} [writableFields] Resource fields writable for this operation. *
 * @property {readonly string[]} [systemFields] Resource fields written automatically by the
 *   backend/storage during this operation.
 * @property {Readonly<Record<string, ResourceInputFieldDefinition>>} [inputFields] Operation-only
 *   input fields, keyed by public input field name.
 */

/**
 * Raw resource command input.
 *
 * This is the flexible boundary shape passed into command validation. Route/service code may build
 * this from params, query and body.
 *
 * @typedef {object} RawResourceCommandInput
 * @property {string | number | null | undefined} [id] Raw id value from params/body.
 * @property {Readonly<Record<string, unknown>>} [body] Raw request body object.
 * @property {Readonly<Record<string, unknown>>} [query] Raw request query object.
 */

/**
 * Normalized resource command after validation.
 *
 * This is the object passed deeper into service/repository/adapter code. It should contain only
 * accepted, normalized values.
 *
 * @typedef {object} ResourceCommand
 * @property {ResourceOperationName} operation Operation name.
 * @property {number | null} id Normalized id, when required.
 * @property {Readonly<Record<string, ResourceCommandValue>>} values Normalized accepted values.
 * @property {readonly string[]} providedFields Accepted fields explicitly provided by the caller.
 */

/**
 * Validation problem for one input issue.
 *
 * Keep reasons stable enough for tests and frontend/debug output, but do not over-model them yet.
 *
 * @typedef {object} ResourceValidationProblem
 * @property {string} field Field name or `"body"`, `"query"` or `"id"` for structural issues.
 * @property {string} reason Stable problem reason.
 * @property {unknown} [expected] Expected value/type/policy.
 * @property {unknown} [actual] Actual value/type/policy.
 */

/**
 * Successful resource command validation result.
 *
 * @typedef {object} ResourceCommandValidResult
 * @property {true} ok Validation succeeded.
 * @property {Readonly<ResourceCommand>} value Normalized command.
 */

/**
 * Failed resource command validation result.
 *
 * The shape intentionally matches the backend's existing `invalid-request` style.
 *
 * @typedef {object} ResourceCommandInvalidResult
 * @property {false} ok Validation failed.
 * @property {"invalid-request"} status Stable invalid-request status.
 * @property {string} message Human-readable validation message.
 * @property {Readonly<{
 *   problems: readonly ResourceValidationProblem[];
 * }>} details Structured
 *   validation details.
 */

/**
 * Resource command validation result.
 *
 * @typedef {ResourceCommandValidResult | ResourceCommandInvalidResult} ResourceCommandValidationResult
 */

/**
 * SQLite schema column generated from a resource field definition.
 *
 * This is the normalized form used by schema generation and schema validation helpers.
 *
 * @typedef {object} SqliteSchemaColumn
 * @property {string} name SQLite column name.
 * @property {string} type SQLite column type.
 * @property {boolean} notNull Whether the column is NOT NULL.
 * @property {boolean} primaryKey Whether the column is part of the primary key.
 * @property {boolean} autoIncrement Whether the column auto-increments.
 */

/**
 * SQLite table schema generated from a resource definition.
 *
 * @typedef {object} SqliteTableSchema
 * @property {string} tableName SQLite table name.
 * @property {readonly SqliteSchemaColumn[]} columns SQLite columns.
 */

/**
 * Public resource object.
 *
 * This type is intentionally generic. Resource-specific modules should still define their own
 * public API type, such as `DevNote`, when the returned shape should be stable and explicit.
 *
 * @typedef {Readonly<Record<string, ResourceCommandValue>>} PublicResource
 */

export {};
