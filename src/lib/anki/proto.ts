import { ScalarType } from "@bufbuild/protobuf";
import type {
  DescMessage,
  DescField,
  DescFile,
} from "@bufbuild/protobuf";

//
// Runtime constants matching @bufbuild/protobuf internals
// These are NOT exported by the library but are used internally.
// We hardcode them to avoid relying on @bufbuild/protobuf internals.
//
const EDITION_PROTO3 = 999 as const;
const EXP = 1 as const; // FeatureSet.FieldPresence.EXPLICIT – used for singular message fields
const IMP = 2 as const; // FeatureSet.FieldPresence.IMPLICIT – used for scalar, list, map fields

// ---------------------------------------------------------------------------
// Shared proto3 file descriptor (minimal runtime shape)
// ---------------------------------------------------------------------------

const file: DescFile = {
  kind: "file",
  edition: EDITION_PROTO3,
  name: "anki.proto",
  dependencies: [],
  enums: [],
  messages: [],
  extensions: [],
  services: [],
  deprecated: false,
  toString: () => "anki.proto",
  proto: { $typeName: "google.protobuf.FileDescriptorProto" },
} as unknown as DescFile;

// ---------------------------------------------------------------------------
// Field factory helpers
// ---------------------------------------------------------------------------

const fieldDefaults = {
  deprecated: false,
  utf8Validation: true,
  getDefaultValue: () => undefined as unknown,
  proto: { $typeName: "google.protobuf.FieldDescriptorProto" } as Record<string, unknown>,
  toString(): string {
    return (this as unknown as { name: string }).name;
  },
} as const;

function scalarField(
  name: string,
  localName: string,
  no: number,
  T: ScalarType,
  parent: DescMessage,
): DescField {
  return {
    kind: "field",
    ...fieldDefaults,
    name,
    localName,
    number: no,
    jsonName: localName,
    fieldKind: "scalar",
    scalar: T,
    longAsString: false,
    message: undefined,
    enum: undefined,
    presence: IMP,
    oneof: undefined,
    parent,
  } as unknown as DescField;
}

function messageField(
  name: string,
  localName: string,
  no: number,
  msgDesc: DescMessage,
  parent: DescMessage,
): DescField {
  return {
    kind: "field",
    ...fieldDefaults,
    name,
    localName,
    number: no,
    jsonName: localName,
    fieldKind: "message",
    message: msgDesc,
    scalar: undefined,
    enum: undefined,
    delimitedEncoding: false,
    presence: EXP, // explicit: avoids unsafeIsSet error for message fields
    oneof: undefined,
    parent,
  } as unknown as DescField;
}

function repeatedMessageField(
  name: string,
  localName: string,
  no: number,
  msgDesc: DescMessage,
  parent: DescMessage,
): DescField {
  return {
    kind: "field",
    ...fieldDefaults,
    name,
    localName,
    number: no,
    jsonName: localName,
    fieldKind: "list",
    listKind: "message",
    message: msgDesc,
    scalar: undefined,
    enum: undefined,
    packed: false,
    delimitedEncoding: false,
    presence: IMP,
    oneof: undefined,
    parent,
  } as unknown as DescField;
}

function buildDesc(
  typeName: string,
  fields: DescField[],
  fileDesc: DescFile,
  parent?: DescMessage,
): DescMessage {
  // Set parent on every field (must be done before creating the record)
  for (const f of fields) {
    (f as unknown as Record<string, unknown>).parent = undefined as unknown as DescMessage;
  }
  const fieldRecord: Record<string, DescField> = {};
  for (const f of fields) {
    fieldRecord[f.localName] = f;
  }

  const desc: DescMessage = {
    kind: "message",
    typeName,
    name: typeName,
    file: fileDesc,
    parent,
    fields,
    field: fieldRecord,
    members: [...fields],
    oneofs: [],
    nestedEnums: [],
    nestedMessages: [],
    nestedExtensions: [],
    deprecated: false,
    toString: () => typeName,
    proto: { $typeName: "google.protobuf.DescriptorProto", name: typeName },
  } as unknown as DescMessage;

  // Fix parent references
  for (const f of fields) {
    (f as unknown as Record<string, unknown>).parent = desc;
  }
  return desc;
}

// ---------------------------------------------------------------------------
// Login request / response
// ---------------------------------------------------------------------------

export const LoginRequestSchema = buildDesc("LoginRequest", [
  scalarField("username", "username", 1, ScalarType.STRING, undefined as unknown as DescMessage),
  scalarField("password", "password", 2, ScalarType.STRING, undefined as unknown as DescMessage),
], file);

export const LoginResponseSchema = buildDesc("LoginResponse", [
  scalarField("status", "status", 1, ScalarType.UINT32, undefined as unknown as DescMessage),
  scalarField("token", "token", 2, ScalarType.STRING, undefined as unknown as DescMessage),
], file);

// ---------------------------------------------------------------------------
// Deck list info request / response
// ---------------------------------------------------------------------------

export const DeckListRequestSchema = buildDesc("DeckListRequest", [
  scalarField("minutes_west_of_utc", "minutesWestOfUtc", 1, ScalarType.INT32, undefined as unknown as DescMessage),
], file);

// ---------------------------------------------------------------------------
// DeckNode – recursive message (children is repeated DeckNode)
// ---------------------------------------------------------------------------

function buildDeckNodeDesc(fileDesc: DescFile): DescMessage {
  // Create a placeholder shell so fields can reference it before it's
  // fully populated. Only typeName is needed for parent.typeName checks.
  const shell: DescMessage = {
    kind: "message",
    typeName: "DeckNode",
    name: "DeckNode",
    file: fileDesc,
    parent: undefined,
    fields: [],
    field: {},
    members: [],
    oneofs: [],
    nestedEnums: [],
    nestedMessages: [],
    nestedExtensions: [],
    deprecated: false,
    toString: () => "DeckNode",
    proto: { $typeName: "google.protobuf.DescriptorProto", name: "DeckNode" },
  } as unknown as DescMessage;

  const fields: DescField[] = [
    scalarField("deck_id", "deckId", 1, ScalarType.INT64, shell),
    scalarField("name", "name", 2, ScalarType.STRING, shell),
    repeatedMessageField("children", "children", 3, shell, shell),
    scalarField("level", "level", 4, ScalarType.UINT32, shell),
    scalarField("collapsed", "collapsed", 5, ScalarType.BOOL, shell),
    scalarField("review_count", "reviewCount", 6, ScalarType.UINT32, shell),
    scalarField("learn_count", "learnCount", 7, ScalarType.UINT32, shell),
    scalarField("new_count", "newCount", 8, ScalarType.UINT32, shell),
    scalarField("intraday_learning", "intradayLearning", 9, ScalarType.UINT32, shell),
    scalarField("interday_learning_uncapped", "interdayLearningUncapped", 10, ScalarType.UINT32, shell),
    scalarField("new_uncapped", "newUncapped", 11, ScalarType.UINT32, shell),
    scalarField("review_uncapped", "reviewUncapped", 12, ScalarType.UINT32, shell),
    scalarField("total_in_deck", "totalInDeck", 13, ScalarType.UINT32, shell),
    scalarField("total_including_children", "totalIncludingChildren", 14, ScalarType.UINT32, shell),
    scalarField("filtered", "filtered", 16, ScalarType.BOOL, shell),
  ];

  // Build the field record
  const fieldRecord: Record<string, DescField> = {};
  for (const f of fields) {
    fieldRecord[f.localName] = f;
  }

  // Populate the shell with all properties
  return Object.assign(shell, {
    fields,
    field: fieldRecord,
    members: fields,
  });
}

export const DeckNodeSchema = buildDeckNodeDesc(file);

export const DeckListResponseSchema = buildDesc("DeckListResponse", [
  messageField("top_node", "topNode", 1, DeckNodeSchema, undefined as unknown as DescMessage),
  scalarField("current_deck_id", "currentDeckId", 2, ScalarType.INT64, undefined as unknown as DescMessage),
  scalarField("collection_size_bytes", "collectionSizeBytes", 3, ScalarType.UINT32, undefined as unknown as DescMessage),
  scalarField("media_size_bytes", "mediaSizeBytes", 4, ScalarType.UINT64, undefined as unknown as DescMessage),
], file);

// ---------------------------------------------------------------------------
// Re-export the library functions our consumers will use
// ---------------------------------------------------------------------------

export { create, type MessageShape } from "@bufbuild/protobuf";
export { fromBinary } from "@bufbuild/protobuf";
export { toBinary } from "@bufbuild/protobuf";
