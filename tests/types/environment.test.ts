import { Environment, environmentSchema } from '@/shared/types/index.js';

describe('Environment', () => {
  test('Environment.DEVELOPMENT should be equal to "development"', () => {
    expect(Environment.DEVELOPMENT).toStrictEqual('development');
  });

  test('Environment.STAGING should be equal to "staging"', () => {
    expect(Environment.STAGING).toStrictEqual('staging');
  });

  test('Environment.PRODUCTION should be equal to "production"', () => {
    expect(Environment.PRODUCTION).toStrictEqual('production');
  });

  describe('environmentSchema', () => {
    test('should be a native enum', () => {
      const { success } = environmentSchema.safeParse(Environment.DEVELOPMENT);

      expect(success).toBeTruthy();
    });

    describe('when given an invalid enum value', () => {
      test('should error', () => {
        const { error } = environmentSchema.safeParse(
          'not_a_valid_environment'
        );

        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "received": "not_a_valid_environment",
              "code": "invalid_enum_value",
              "options": [
                "development",
                "staging",
                "production"
              ],
              "path": [],
              "message": "Invalid enum value. Expected 'development' | 'staging' | 'production', received 'not_a_valid_environment'"
            }
          ]]
        `);
      });
    });
  });
});
