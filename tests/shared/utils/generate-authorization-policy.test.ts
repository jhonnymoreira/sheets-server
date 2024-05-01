import { generateAuthorizationPolicy } from '@/shared/utils/index.js';

const lambdaArn = 'arn:aws:lambda:us-east-1:123456789012:function:my-function';

describe('generateAuthorizationPolicy', () => {
  test('returns an allow policy for a given resource when "allow" argument is true', () => {
    const authorizationPolicy = generateAuthorizationPolicy(lambdaArn, true);

    expect(authorizationPolicy).toMatchInlineSnapshot(`
      {
        "Statement": [
          {
            "Action": "execute-api:Invoke",
            "Effect": "Allow",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:my-function",
          },
        ],
        "Version": "2012-10-17",
      }
    `);
  });

  test('returns a deny policy for a given resource when "allow" argument is false', () => {
    const authorizationPolicy = generateAuthorizationPolicy(lambdaArn, false);

    expect(authorizationPolicy).toMatchInlineSnapshot(`
      {
        "Statement": [
          {
            "Action": "execute-api:Invoke",
            "Effect": "Deny",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:my-function",
          },
        ],
        "Version": "2012-10-17",
      }
    `);
  });
});
