import { Stack, StackProps } from 'aws-cdk-lib';
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { EventType } from 'aws-cdk-lib/aws-s3';
import { SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import {
  S3Construct,
  SQSConstruct,
  SecretConstruct,
} from '@/constructs/index.js';
import { type WithAppProps } from '@/shared/types/index.js';

export type StatefulStackProps = WithAppProps<StackProps>;

export class StatefulStack extends Stack {
  constructor(scope: Construct, id: string, props: StatefulStackProps) {
    super(scope, id);

    const { app } = props;

    new SecretConstruct(this, `secrets-construct-${app.environment}`, props);
    const { buckets } = new S3Construct(
      this,
      `s3-construct-${app.environment}`,
      props
    );

    const { queues } = new SQSConstruct(
      this,
      `sqs-construct-${app.environment}`,
      props
    );

    buckets.sheets.addEventNotification(
      EventType.OBJECT_CREATED_POST,
      new SqsDestination(queues.spreadsheetsToProcess)
    );

    queues.spreadsheetsToProcess.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('s3.amazonaws.com').grantPrincipal],
        actions: ['SQS:SendMessage'],
        resources: [queues.spreadsheetsToProcess.queueArn],
        conditions: {
          ArnLike: {
            'aws:SourceArn': `arn:aws:s3:*:*:${buckets.sheets.bucketName}`,
          },
        },
      })
    );
  }
}
