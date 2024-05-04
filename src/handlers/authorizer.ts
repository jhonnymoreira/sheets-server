import type { APIGatewayRequestAuthorizerHandler } from 'aws-lambda';
import { and, eq } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';
import { users } from '@/db/schema.js';
import { db } from '@/shared/clients/index.js';
import {
  generateAuthorizationPolicy,
  getEnvironmentVariables,
  logger,
} from '@/shared/utils/index.js';

type JWTPayload = {
  data: {
    email: string;
    externalId: string;
  };
};

export const authorizer: APIGatewayRequestAuthorizerHandler = async (event) => {
  const bearerToken = event.headers?.['Authorization'] || '';
  const token = bearerToken.replace(/^Bearer /i, '');

  try {
    const { JWK_URL } = getEnvironmentVariables(
      z.object({
        JWK_URL: z.string().trim().min(1),
      })
    );

    const JWKS = createRemoteJWKSet(new URL(JWK_URL));
    const {
      payload: { data },
    } = await jwtVerify<JWTPayload>(token, JWKS);

    /**
     * Workaround to keep the users table in sync with the auth provider.
     */
    let userId: string | undefined = undefined;
    const [selectedUser] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(
        and(eq(users.email, data.email), eq(users.externalId, data.externalId))
      )
      .limit(1);
    userId = selectedUser?.id;

    if (!userId) {
      const [insertedUser] = await db
        .insert(users)
        .values({
          email: data.email,
          externalId: data.externalId,
        })
        .returning({
          id: users.id,
        });
      userId = insertedUser?.id;
    }

    if (!userId) {
      logger.error({ data });
      throw new Error('Unable to retrieve user');
    }

    return {
      principalId: data.email,
      policyDocument: generateAuthorizationPolicy(event.methodArn, true),
      context: {
        userId,
      },
    };
  } catch (error) {
    logger.error({ error });
    return {
      principalId: '',
      policyDocument: generateAuthorizationPolicy(event.methodArn, false),
    };
  }
};
