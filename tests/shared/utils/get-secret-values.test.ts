import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { mockClient } from 'aws-sdk-client-mock';
import { z } from 'zod';
import { getSecretValue } from '@/shared/utils/index.js';

const secretArn =
  'arn:aws:secretsmanager:us-east-1:123456789012:secret:database-credentials-123456789012';
const clientMock = mockClient(SecretsManagerClient);

beforeEach(() => {
  clientMock.reset();
});

describe('getSecretValue', () => {
  test('returns the secret value based on the given schema', async () => {
    const dbConnectionString =
      'postgres://postgres:postgres@localhost:5432/postgres';

    const secretValue = `{"connectionString": "${dbConnectionString}"}`;

    clientMock
      .on(GetSecretValueCommand)
      .resolves({ SecretString: secretValue });

    const { connectionString } = await getSecretValue(
      secretArn,
      z.object({
        connectionString: z.string().trim().min(1),
      })
    );

    expect(connectionString).toStrictEqual(dbConnectionString);
  });

  describe('when the "SecretString" is undefined', () => {
    test('defaults to a valid JSON string ("{}") to avoid JSON parsing errors', async () => {
      expect.assertions(1);

      try {
        clientMock
          .on(GetSecretValueCommand)
          .resolves({ SecretString: undefined });

        await getSecretValue(secretArn, z.object({ a: z.string().min(1) }));
      } catch (error) {
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#exceptions
         */
        expect(error).not.toBeInstanceOf(SyntaxError);
      }
    });
  });

  describe('when the "SecretString" isn\'t a valid JSON data', () => {
    test('throws an error', async () => {
      expect.assertions(1);

      const secretValue = '}{';

      clientMock
        .on(GetSecretValueCommand)
        .resolves({ SecretString: secretValue });

      try {
        await getSecretValue(secretArn, z.object({}));
      } catch (error) {
        expect(error).toMatchInlineSnapshot(
          `[SyntaxError: Unexpected token '}', "}{" is not valid JSON]`
        );
      }
    });
  });

  describe('when the validation schema fails', () => {
    test('throws an error', async () => {
      expect.assertions(1);

      const secretValue = '{}';

      clientMock
        .on(GetSecretValueCommand)
        .resolves({ SecretString: secretValue });

      try {
        await getSecretValue(
          secretArn,
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
