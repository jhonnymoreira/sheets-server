import { insertContactSchema } from '@/shared/domain/index.js';

const {
  shape: {
    createdAt: createdAtSchema,
    email: emailSchema,
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    spreadsheetId: spreadsheetIdSchema,
    updatedAt: updatedAtSchema,
  },
} = insertContactSchema;

describe('Contact Domain', () => {
  describe('insertContactSchema', () => {
    describe('createdAt', () => {
      test('should be a date', () => {
        const { success } = createdAtSchema.safeParse(new Date());

        expect(success).toBeTruthy();
      });
    });

    describe('email', () => {
      test('should be a string', () => {
        const { error } = emailSchema.safeParse(123);

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "invalid_type",
              "expected": "string",
              "received": "number",
              "path": [],
              "message": "Expected string, received number"
            }
          ]]
        `);
      });

      test('should be a valid email', () => {
        const { error } = emailSchema.safeParse('not-a-valid-email');

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "validation": "email",
              "code": "invalid_string",
              "message": "Invalid email",
              "path": []
            }
          ]]
        `);
      });
    });

    describe('firstName', () => {
      test('should be a string', () => {
        const { error } = firstNameSchema.safeParse(123);

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "invalid_type",
              "expected": "string",
              "received": "number",
              "path": [],
              "message": "Expected string, received number"
            }
          ]]
        `);
      });

      test('must have at least 1 character', () => {
        const { error } = firstNameSchema.safeParse('');

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

      test('must not exceed 50 characters', () => {
        const { error } = firstNameSchema.safeParse('a'.repeat(50 + 1));

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "too_big",
              "maximum": 50,
              "type": "string",
              "inclusive": true,
              "exact": false,
              "message": "String must contain at most 50 character(s)",
              "path": []
            }
          ]]
        `);
      });
    });

    describe('lastName', () => {
      test('accepts null or undefined', () => {
        expect.assertions(2);

        const undefinedLastName = lastNameSchema.safeParse(undefined);
        const nullLastName = lastNameSchema.safeParse(null);

        expect(undefinedLastName.success).toBeTruthy();
        expect(nullLastName.success).toBeTruthy();
      });

      describe('when a string is provided', () => {
        test('should not be empty', () => {
          const { error } = lastNameSchema.safeParse('');

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

        test('should not exceed 50 characters', () => {
          const { error } = lastNameSchema.safeParse('a'.repeat(50 + 1));

          expect(error).toMatchInlineSnapshot(`
            [ZodError: [
              {
                "code": "too_big",
                "maximum": 50,
                "type": "string",
                "inclusive": true,
                "exact": false,
                "message": "String must contain at most 50 character(s)",
                "path": []
              }
            ]]
          `);
        });
      });
    });

    describe('spreadsheetId', () => {
      test('should be a string', () => {
        const { error } = spreadsheetIdSchema.safeParse(123);

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "invalid_type",
              "expected": "string",
              "received": "number",
              "path": [],
              "message": "Expected string, received number"
            }
          ]]
        `);
      });

      test('should be a non-empty string with a fixed length matching the ID_LENGTH', () => {
        const { error } = spreadsheetIdSchema.safeParse('       ');

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

    describe('updatedAt', () => {
      test('should be a date', () => {
        const { success } = updatedAtSchema.safeParse(new Date());

        expect(success).toBeTruthy();
      });
    });
  });
});
