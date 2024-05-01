import { z } from 'zod';
import { getEnvironmentVariables } from '@/shared/utils/index.js';

const secretArn =
  'arn:aws:secretsmanager:us-east-1:123456789012:secret:database-credentials-123456789012';

beforeEach(() => {
  process.env['DATABASE_CREDENTIALS_ARN'] = secretArn;
});

describe('getEnvironmentVariables', () => {
  test('returns the environment variables based on the given object schema', () => {
    const { DATABASE_CREDENTIALS_ARN } = getEnvironmentVariables(
      z.object({
        DATABASE_CREDENTIALS_ARN: z.string().trim().min(1),
      })
    );

    expect(DATABASE_CREDENTIALS_ARN).toStrictEqual(secretArn);
  });

  describe('when the validation schema fails', () => {
    test('should throw', () => {
      expect.assertions(1);

      process.env['DATABASE_CREDENTIALS_ARN'] = '';

      try {
        getEnvironmentVariables(
          z.object({ DATABASE_CREDENTIALS: z.string().trim().min(1) })
        );
      } catch (error) {
        expect(error).toMatchInlineSnapshot(`
          [ZodError: [
            {
              "code": "invalid_type",
              "expected": "string",
              "received": "undefined",
              "path": [
                "DATABASE_CREDENTIALS"
              ],
              "message": "Required"
            }
          ]]
        `);
      }
    });
  });
});
