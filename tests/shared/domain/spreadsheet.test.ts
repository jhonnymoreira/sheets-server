import { ID_LENGTH, spreadsheetStatusEnum } from '@/db/schema.js';
import { insertSpreadsheetSchema } from '@/shared/domain/index.js';

const formattedSpreadsheetStatus = spreadsheetStatusEnum.enumValues.join(', ');

const {
  shape: {
    createdAt: createdAtSchema,
    id: idSchema,
    key: keySchema,
    name: nameSchema,
    ownerId: ownerIdSchema,
    status: statusSchema,
    updatedAt: updatedAtSchema,
  },
} = insertSpreadsheetSchema;

describe('Spreadsheet Domain', () => {
  describe('insertSpreadsheetSchema', () => {
    describe('createdAt', () => {
      test('should be a date', () => {
        const { success } = createdAtSchema.safeParse(new Date());

        expect(success).toBeTruthy();
      });
    });

    describe('id', () => {
      test('should be a string', () => {
        const { error } = idSchema.safeParse(123);

        expect(error?.issues[0]).toHaveProperty('code', 'invalid_type');
      });

      test('should be a non-empty string with a fixed length matching the ID_LENGTH', () => {
        const { error } = idSchema.safeParse('       ');

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "too_small",
              "minimum": 21,
              "type": "string",
              "inclusive": true,
              "exact": true,
              "message": "String must contain exactly 21 character(s)",
              "path": []
            }
          ]]
        `);
      });

      test('defaults to a random ID of length matching the ID_LENGTH', () => {
        const { data } = idSchema.safeParse(undefined);

        expect(data).toHaveLength(ID_LENGTH);
      });
    });

    describe('key', () => {
      test('should be a string', () => {
        const { error } = keySchema.safeParse(123);

        expect(error?.issues[0]).toHaveProperty('code', 'invalid_type');
      });

      test('should be a non-empty string with a fixed length matching the ID_LENGTH', () => {
        const { error } = keySchema.safeParse('       ');

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "too_small",
              "minimum": 21,
              "type": "string",
              "inclusive": true,
              "exact": true,
              "message": "String must contain exactly 21 character(s)",
              "path": []
            }
          ]]
        `);
      });
    });

    describe('name', () => {
      test('should be a string', () => {
        const { error } = nameSchema.safeParse(123);

        expect(error?.issues[0]).toHaveProperty('code', 'invalid_type');
      });

      test('must have at least 1 character', () => {
        const { error } = nameSchema.safeParse('');

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "too_small",
              "minimum": 1,
              "type": "string",
              "inclusive": true,
              "exact": false,
              "message": "String must contain at least 1 character(s)",
              "path": []
            }
          ]]
        `);
      });

      test('must not exceed 64 characters', () => {
        const { error } = nameSchema.safeParse('a'.repeat(64 + 1));

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "too_big",
              "maximum": 64,
              "type": "string",
              "inclusive": true,
              "exact": false,
              "message": "String must contain at most 64 character(s)",
              "path": []
            }
          ]]
        `);
      });
    });

    describe('ownerId', () => {
      test('should be a string', () => {
        const { error } = ownerIdSchema.safeParse(123);

        expect(error?.issues[0]).toHaveProperty('code', 'invalid_type');
      });

      test('should be a non-empty string with a fixed length matching the ID_LENGTH', () => {
        const { error } = ownerIdSchema.safeParse('       ');

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "too_small",
              "minimum": 21,
              "type": "string",
              "inclusive": true,
              "exact": true,
              "message": "String must contain exactly 21 character(s)",
              "path": []
            }
          ]]
        `);
      });
    });

    describe('status', () => {
      test(`should be an enum matching the spreadsheet status enum (${formattedSpreadsheetStatus})`, () => {
        const { error } = statusSchema.safeParse('not_a_valid_status');

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "received": "not_a_valid_status",
              "code": "invalid_enum_value",
              "options": [
                "to_process",
                "to_review",
                "processing",
                "processed"
              ],
              "path": [],
              "message": "Invalid enum value. Expected 'to_process' | 'to_review' | 'processing' | 'processed', received 'not_a_valid_status'"
            }
          ]]
        `);
      });
    });

    describe('updatedAt', () => {
      test('should be a date', () => {
        const { success } = updatedAtSchema.safeParse(new Date());

        expect(success).toBeTruthy();
      });
    });
  });
});
