import { CfnOutput } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { AppProps } from '@/shared/types/index.js';

export type SQSConstructProps = AppProps;

export class SQSConstruct extends Construct {
  public queues: {
    deadLetterQueues: {
      spreadsheetsToProcess: Queue;
      spreadsheetsProcessedContacts: Queue;
    };
    spreadsheetsToProcess: Queue;
    spreadsheetsProcessedContacts: Queue;
  };
  constructor(scope: Construct, id: string, props: SQSConstructProps) {
    super(scope, id);

    const { app } = props;

    const spreadsheetsToProcessDLQ = new Queue(
      this,
      `${app.name}-spreadsheets-to-process-dlq-${app.environment}`,
      {
        queueName: `${app.name}-spreadsheets-to-process-dlq-${app.environment}`,
      }
    );

    const spreadsheetsToProcessQueue = new Queue(
      this,
      `${app.name}-spreadsheets-to-process-queue-${app.environment}`,
      {
        deadLetterQueue: {
          maxReceiveCount: 3,
          queue: spreadsheetsToProcessDLQ,
        },
        queueName: `${app.name}-spreadsheets-to-process-${app.environment}`,
      }
    );

    new CfnOutput(
      this,
      `${app.name}-spreadsheets-to-process-queue-arn-${app.environment}`,
      {
        exportName: `${app.name}-spreadsheets-to-process-queue-arn-${app.environment}`,
        value: spreadsheetsToProcessQueue.queueArn,
      }
    );

    const spreadsheetsProcessedContactsDLQ = new Queue(
      this,
      `${app.name}-processed-contacts-dlq-${app.environment}`,
      {
        queueName: `${app.name}-processed-contacts-dlq-${app.environment}`,
      }
    );

    const spreadsheetsProcessedContactsQueue = new Queue(
      this,
      `${app.name}-processed-contacts-queue-${app.environment}`,
      {
        deadLetterQueue: {
          maxReceiveCount: 3,
          queue: spreadsheetsProcessedContactsDLQ,
        },
        queueName: `${app.name}-processed-contacts-queue-${app.environment}`,
      }
    );

    new CfnOutput(
      this,
      `${app.name}-processed-contacts-queue-arn-${app.environment}`,
      {
        exportName: `${app.name}-processed-contacts-queue-arn-${app.environment}`,
        value: spreadsheetsProcessedContactsQueue.queueArn,
      }
    );

    this.queues = {
      spreadsheetsToProcess: spreadsheetsToProcessQueue,
      spreadsheetsProcessedContacts: spreadsheetsProcessedContactsQueue,
      deadLetterQueues: {
        spreadsheetsToProcess: spreadsheetsToProcessDLQ,
        spreadsheetsProcessedContacts: spreadsheetsProcessedContactsDLQ,
      },
    };
  }
}
