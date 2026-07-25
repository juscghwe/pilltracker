/**
 * Single source of truth for dev-note field identity and shape.
 *
 * Object keys are internal contract keys. `publicName` is the JavaScript/API property and
 * `columnName` is the trusted SQLite identifier. They currently match for several fields, but they
 * are not the same architectural namespace.
 *
 * @satisfies {import("./types.js").ResourceDefinition}
 */
export const devNotesResource = Object.freeze({
  resourceName: "devNote",
  tableName: "dev_notes",
  fields: Object.freeze({
    id: Object.freeze({
      publicName: "id",
      columnName: "id",
      type: "integer",
      sqliteType: "INTEGER",
      nullable: false,
      clientWritable: false,
      generated: true,
      primaryKey: true,
      autoIncrement: true,
    }),
    name: Object.freeze({
      publicName: "name",
      columnName: "name",
      type: "string",
      sqliteType: "TEXT",
      nullable: false,
      clientWritable: true,
      allowEmpty: false,
      searchable: true,
    }),
    comment: Object.freeze({
      publicName: "comment",
      columnName: "comment",
      type: "string",
      sqliteType: "TEXT",
      nullable: true,
      clientWritable: true,
      allowEmpty: true,
      emptyAsNull: true,
      outputFallback: "",
      searchable: true,
    }),
    lastConfirmedInteraction: Object.freeze({
      publicName: "lastConfirmedInteraction",
      columnName: "last_confirmed_interaction",
      type: "string",
      sqliteType: "TEXT",
      nullable: true,
      clientWritable: true,
      allowEmpty: true,
      emptyAsNull: true,
      outputFallback: "",
    }),
    createdAt: Object.freeze({
      publicName: "createdAt",
      columnName: "created_at",
      type: "string",
      sqliteType: "TEXT",
      nullable: false,
      clientWritable: false,
      generated: true,
    }),
    updatedAt: Object.freeze({
      publicName: "updatedAt",
      columnName: "updated_at",
      type: "string",
      sqliteType: "TEXT",
      nullable: false,
      clientWritable: false,
      generated: true,
    }),
  }),
});
