export interface MongoServerError extends Error {
  code: number;
}

export interface DuplicateField {
  error: {
    field: string;
    value: string | number;
  };
}

export interface ErrorPayload {
  error: {
    message: string;
    duplicateFields?: DuplicateField[];
  };
}
