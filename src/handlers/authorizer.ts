import type { APIGatewayRequestAuthorizerHandler } from 'aws-lambda';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { type AuthData } from '@/shared/types/index.js';
import { generateAuthorizationPolicy, logger } from '@/shared/utils/index.js';

const JWKS = createRemoteJWKSet(
  new URL('https://stirred-mustang-79.clerk.accounts.dev/.well-known/jwks.json')
);

type JWTPayload = {
  data: AuthData;
};

export const authorizer: APIGatewayRequestAuthorizerHandler = async (event) => {
  const bearerToken = event.headers?.['Authorization'] || '';
  const token = bearerToken.replace(/^Bearer /i, '');

  try {
    const {
      payload: { data },
    } = await jwtVerify<JWTPayload>(token, JWKS);

    logger.info({ data });

    return {
      principalId: data.email,
      policyDocument: generateAuthorizationPolicy(event.methodArn, true),
      context: {
        email: data.email,
        externalId: data.externalId,
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
