/**
 * Dev-notes operation policies.
 *
 * Resource field arrays contain internal contract keys. Validation resolves each key through the
 * resource contract and then reads/writes the corresponding public name.
 *
 * @satisfies {Readonly<Record<import("./types.js").ResourceOperationName, import("./types.js").ResourceOperationPolicy>>}
 */
export const devNotesOperations = Object.freeze({
  list: Object.freeze({
    operation: "list",
    requiresId: false,
    acceptsBody: false,
    acceptsQuery: false,
  }),
  getById: Object.freeze({
    operation: "getById",
    requiresId: true,
    acceptsBody: false,
    acceptsQuery: false,
  }),
  search: Object.freeze({
    operation: "search",
    requiresId: false,
    acceptsBody: false,
    acceptsQuery: true,
    inputFields: Object.freeze({
      text: Object.freeze({
        publicName: "text",
        type: "string",
        required: true,
        nullable: false,
        allowEmpty: false,
      }),
    }),
  }),
  create: Object.freeze({
    operation: "create",
    requiresId: false,
    acceptsBody: true,
    acceptsQuery: false,
    requiredFields: Object.freeze(["name"]),
    acceptedFields: Object.freeze(["name", "comment"]),
    writableFields: Object.freeze(["name", "comment"]),
    systemFields: Object.freeze(["createdAt", "updatedAt"]),
  }),
  replace: Object.freeze({
    operation: "replace",
    requiresId: true,
    acceptsBody: true,
    acceptsQuery: false,
    requiredFields: Object.freeze(["name"]),
    acceptedFields: Object.freeze(["name", "comment"]),
    writableFields: Object.freeze(["name", "comment"]),
    systemFields: Object.freeze(["lastConfirmedInteraction", "updatedAt"]),
  }),
  update: Object.freeze({
    operation: "update",
    requiresId: true,
    acceptsBody: true,
    acceptsQuery: false,
    requireAtLeastOneField: true,
    acceptedFields: Object.freeze(["name", "comment", "lastConfirmedInteraction"]),
    writableFields: Object.freeze(["name", "comment", "lastConfirmedInteraction"]),
    systemFields: Object.freeze(["updatedAt"]),
  }),
  delete: Object.freeze({
    operation: "delete",
    requiresId: true,
    acceptsBody: false,
    acceptsQuery: false,
  }),
});
