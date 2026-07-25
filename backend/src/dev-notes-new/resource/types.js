/** Generic and dev-notes-specific typedefs for the M1 backend proof of concept. */

/** @typedef {"string" | "integer"} ResourceFieldType */
/** @typedef {"list" | "getById" | "search" | "create" | "replace" | "update" | "delete"} ResourceOperationName */
/** @typedef {string | number | boolean | null} ResourceCommandValue */

/**
 * Field definition owned by a resource contract.
 *
 * A field has three deliberately separate identities:
 *
 * - the key in `ResourceDefinition.fields` is the internal contract key;
 * - `publicName` is the JavaScript/API property name;
 * - `columnName` is the trusted SQLite identifier.
 *
 * @typedef {object} ResourceFieldDefinition
 * @property {string} publicName Public/API field name.
 * @property {string} columnName Trusted storage column name.
 * @property {ResourceFieldType} type Logical field type.
 * @property {string} sqliteType SQLite column type.
 * @property {boolean} nullable Whether the stored value may be null.
 * @property {boolean} clientWritable Whether external callers may write this field.
 * @property {boolean} [generated] Whether the backend/storage generates this field.
 * @property {boolean} [primaryKey] Whether this field is the primary key.
 * @property {boolean} [autoIncrement] Whether this field auto-increments.
 * @property {boolean} [allowEmpty] Whether an empty trimmed string is allowed as input.
 * @property {boolean} [emptyAsNull] Whether empty string input normalizes to null.
 * @property {ResourceCommandValue} [outputFallback] Public fallback for a null stored value.
 * @property {boolean} [searchable] Whether generic text search may inspect this field.
 */

/**
 * Operation-only input field definition, for example the `text` search query.
 *
 * @typedef {object} ResourceInputFieldDefinition
 * @property {string} publicName Public input field name.
 * @property {ResourceFieldType} type Logical field type.
 * @property {boolean} required Whether the field is required.
 * @property {boolean} nullable Whether the value may be null.
 * @property {boolean} [allowEmpty] Whether an empty trimmed string is allowed.
 * @property {boolean} [emptyAsNull] Whether empty string input normalizes to null.
 */

/**
 * @typedef {object} ResourceDefinition
 * @property {string} resourceName Human-readable singular resource name.
 * @property {string} tableName Trusted SQLite table name.
 * @property {Readonly<Record<string, ResourceFieldDefinition>>} fields Fields keyed by internal
 *   contract key, not necessarily by public name.
 */

/**
 * @typedef {object} ResourceOperationPolicy
 * @property {ResourceOperationName} operation Operation name.
 * @property {boolean} requiresId Whether the operation requires an id.
 * @property {boolean} acceptsBody Whether the operation accepts body fields.
 * @property {boolean} acceptsQuery Whether the operation accepts query fields.
 * @property {boolean} [requireAtLeastOneField] Whether at least one accepted field is required.
 * @property {readonly string[]} [requiredFields] Required resource contract field keys.
 * @property {readonly string[]} [acceptedFields] Accepted resource contract field keys.
 * @property {readonly string[]} [writableFields] Writable resource contract field keys.
 * @property {readonly string[]} [systemFields] Backend-written resource contract field keys.
 * @property {Readonly<Record<string, ResourceInputFieldDefinition>>} [inputFields]
 *   Operation-only inputs keyed by internal input key.
 */

/**
 * @typedef {object} RawResourceCommandInput
 * @property {unknown} [id] Raw id value.
 * @property {unknown} [body] Raw request body.
 * @property {unknown} [query] Raw request query.
 */

/**
 * Normalized command passed from validation to the service/repository boundary.
 *
 * `values` and `providedFields` use public names because they represent JavaScript resource data.
 * SQL adapters must map them through the trusted resource contract before generating SQL.
 *
 * @typedef {object} ResourceCommand
 * @property {ResourceOperationName} operation Operation name.
 * @property {number | null} id Normalized id when required.
 * @property {Readonly<Record<string, ResourceCommandValue>>} values Normalized public-name values.
 * @property {readonly string[]} providedFields Public names explicitly provided by the caller.
 */

/**
 * @typedef {object} ResourceValidationProblem
 * @property {string} field Public field name or structural location such as `body`, `query`, or `id`.
 * @property {string} reason Stable problem reason.
 * @property {unknown} [expected] Expected value/type/policy.
 * @property {unknown} [actual] Actual value/type/policy.
 */

/**
 * @typedef {object} ResourceCommandValidResult
 * @property {true} ok Validation succeeded.
 * @property {Readonly<ResourceCommand>} value Normalized command.
 */

/**
 * @typedef {object} ResourceCommandInvalidResult
 * @property {false} ok Validation failed.
 * @property {"invalid-request"} status Stable invalid-request status.
 * @property {string} message Human-readable failure message.
 * @property {Readonly<{problems: readonly ResourceValidationProblem[]}>} details Problems.
 */

/** @typedef {ResourceCommandValidResult | ResourceCommandInvalidResult} ResourceCommandValidationResult */

/**
 * @typedef {object} SqliteSchemaColumn
 * @property {string} name SQLite column name.
 * @property {string} type SQLite column type.
 * @property {boolean} notNull Whether SQLite should report NOT NULL.
 * @property {boolean} primaryKey Whether the column is part of the primary key.
 * @property {boolean} autoIncrement Whether the column auto-increments.
 */

/**
 * @typedef {object} SqliteTableSchema
 * @property {string} tableName SQLite table name.
 * @property {readonly SqliteSchemaColumn[]} columns SQLite columns.
 */

/** @typedef {Readonly<Record<string, ResourceCommandValue>>} PublicResource */

/**
 * Stable public dev-note shape.
 *
 * @typedef {object} DevNote
 * @property {number} id Dev-note id.
 * @property {string} name Dev-note name.
 * @property {string} comment Dev-note comment, filled with an empty string when stored as null.
 * @property {string} lastConfirmedInteraction Last interaction, filled when stored as null.
 * @property {string} createdAt ISO creation timestamp.
 * @property {string} updatedAt ISO update timestamp.
 */

/** @typedef {"temp" | "persistent"} DevNotesStorageKind */
/** @typedef {"ok" | "created" | "replaced" | "updated" | "deleted"} DevNotesSuccessStatus */
/** @typedef {DevNotesSuccessStatus | "not-found" | "invalid-request" | "operation-failed" | "unknown-storage" | "storage-disabled"} DevNotesResultStatus */
/** @typedef {"healthy" | "unhealthy" | "disabled"} DevNotesHealthStatus */

/**
 * @typedef {object} DevNotesBaseResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {DevNotesResultStatus} status Machine-readable status.
 * @property {string} [message] Human-readable failure message.
 */

/** @typedef {DevNotesBaseResult & {note?: Readonly<DevNote>}} DevNotesSingleResult */
/** @typedef {DevNotesBaseResult & {notes?: readonly Readonly<DevNote>[]}} DevNotesListResult */
/** @typedef {DevNotesBaseResult | DevNotesSingleResult | DevNotesListResult | ResourceCommandInvalidResult} DevNotesServiceResult */

/**
 * Repository capability contract consumed by the service layer.
 *
 * @typedef {object} DevNotesRepository
 * @property {() => readonly Readonly<DevNote>[]} list Lists all notes.
 * @property {(id: number) => Readonly<DevNote> | null} getById Gets one note.
 * @property {(text: string) => readonly Readonly<DevNote>[]} search Searches notes.
 * @property {(values: Readonly<Record<string, ResourceCommandValue>>) => Readonly<DevNote> | null} create Creates a note.
 * @property {(id: number, values: Readonly<Record<string, ResourceCommandValue>>) => Readonly<DevNote> | null} replace Replaces a note.
 * @property {(id: number, values: Readonly<Record<string, ResourceCommandValue>>, providedFields: readonly string[]) => Readonly<DevNote> | null} update Updates a note.
 * @property {(id: number) => Readonly<DevNote> | null} delete Deletes a note.
 * @property {() => Readonly<object>} getHealth Gets read-only repository health.
 */

/**
 * @typedef {object} DevNotesStorageConfig
 * @property {boolean} enabled Whether the target is enabled.
 * @property {string | null} databasePath Configured SQLite path.
 * @property {string | null} journalMode Requested SQLite journal mode.
 */

/**
 * @typedef {object} DevNotesStorageTarget
 * @property {Readonly<DevNotesStorageConfig>} config Runtime target config.
 * @property {Readonly<DevNotesRepository>} repository Repository implementation.
 */

/**
 * @typedef {object} DevNotesStorageHealth
 * @property {DevNotesStorageKind} storageKind Storage kind.
 * @property {DevNotesHealthStatus} status Storage health status.
 * @property {boolean} enabled Whether this target is enabled.
 * @property {Readonly<object>} [repository] Detailed repository health.
 */

/**
 * @typedef {object} DevNotesHealthResult
 * @property {DevNotesHealthStatus} status Overall status.
 * @property {boolean} enabled Whether the feature is enabled.
 * @property {readonly Readonly<DevNotesStorageHealth>[]} storage Storage health entries.
 */

/**
 * @typedef {object} DevNotesPartialStorageHealth
 * @property {DevNotesStorageKind} storageKind Storage kind.
 * @property {DevNotesHealthStatus} status Storage status.
 * @property {boolean} enabled Whether this target is enabled.
 */

/**
 * @typedef {object} DevNotesPartialHealthResult
 * @property {DevNotesHealthStatus} status Overall status.
 * @property {boolean} enabled Whether the feature is enabled.
 * @property {readonly Readonly<DevNotesPartialStorageHealth>[]} storage Condensed storage entries.
 */

export {};
