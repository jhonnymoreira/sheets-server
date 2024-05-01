import { StructuredContact } from '../structured-contact.js';

export type ProcessedContactBatch = {
  spreadsheetId: string;
  ownerId: string;
  data: StructuredContact[];
};
