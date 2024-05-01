import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { z } from 'zod';

const secretsManagerClient = new SecretsManagerClient();

export const getSecretValue = async <T extends z.ZodTypeAny>(
  secretArn: string,
  schema: T
): Promise<z.infer<T>> => {
  const command = new GetSecretValueCommand({
    SecretId: secretArn,
  });

  const { SecretString } = await secretsManagerClient.send(command);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return schema.parse(JSON.parse(SecretString || '{}'));
};
