import type { PolicyDocument } from 'aws-lambda';

export const generateAuthorizationPolicy = (
  resource: string,
  allow: boolean
): PolicyDocument => ({
  Version: '2012-10-17',
  Statement: [
    {
      Action: 'execute-api:Invoke',
      Effect: allow ? 'Allow' : 'Deny',
      Resource: resource,
    },
  ],
});
