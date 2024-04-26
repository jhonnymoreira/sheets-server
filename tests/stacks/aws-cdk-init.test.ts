import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as AwsCdkInit from '@/stacks/aws-cdk-init-stack.js';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/aws-cdk-init-stack.ts
test('SQS Queue Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new AwsCdkInit.AwsCdkInitStack(app, 'MyTestStack');
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300,
  });
});
