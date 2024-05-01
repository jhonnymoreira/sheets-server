import { insertUserSchema } from '@/shared/domain/index.js';

const {
  shape: {
    createdAt: createdAtSchema,
    email: emailSchema,
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

    describe('updatedAt', () => {
      test('should be a date', () => {
        const { success } = updatedAtSchema.safeParse(new Date());

        expect(success).toBeTruthy();
      });
    });
  });
});
