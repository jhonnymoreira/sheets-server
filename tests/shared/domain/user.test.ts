import { ID_LENGTH } from '@/db/schema.js';
import { insertUserSchema } from '@/shared/domain/index.js';

const {
  shape: {
    createdAt: createdAtSchema,
    email: emailSchema,
    githubHandler: githubHandlerSchema,
    id: idSchema,
    updatedAt: updatedAtSchema,
  },
} = insertUserSchema;

describe('User Domain', () => {
  describe('insertUserSchema', () => {
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

    describe('githubHandler', () => {
      test('should be a string', () => {
        const { error } = githubHandlerSchema.safeParse(123);

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

      test('should have at least 1 character', () => {
        const { error } = githubHandlerSchema.safeParse('');

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

      test('should not exceed 39 characters', () => {
        const { error } = githubHandlerSchema.safeParse('a'.repeat(39 + 1));

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "too_big",
              "maximum": 39,
              "type": "string",
              "inclusive": true,
              "exact": false,
              "message": "String must contain at most 39 character(s)",
              "path": []
            }
          ]]
        `);
      });
    });

    describe('id', () => {
      test('should be a string', () => {
        const { error } = idSchema.safeParse(123);

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

    describe('updatedAt', () => {
      test('should be a date', () => {
        const { success } = updatedAtSchema.safeParse(new Date());

        expect(success).toBeTruthy();
      });
    });
  });
});
