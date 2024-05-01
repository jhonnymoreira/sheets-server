import { Fn, Stack, StackProps } from 'aws-cdk-lib';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { APIGatewayConstruct, LambdaConstruct } from '@/constructs/index.js';
import { type WithAppProps } from '@/shared/types/index.js';

export type StatelessStackProps = WithAppProps<StackProps>;

export class StatelessStack extends Stack {
  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id);

    const { app } = props;

    const { lambdas } = new LambdaConstruct(
      this,
      `lambda-construct-${app.environment}`,
      props
    );

    new APIGatewayConstruct(this, `api-gateway-construct-${app.environment}`, {
      ...props,
      lambdas,
    });

    const sheetsBucketArn = Fn.importValue(
      `${app.name}-bucket-arn-${app.environment}`
    );
    const sheetsBucketRef = Bucket.fromBucketArn(
      this,
      `${app.name}-bucket-${app.environment}`,
      sheetsBucketArn
    );

    sheetsBucketRef.grantPut(
      lambdas.spreadsheets.getUploadURL.grantPrincipal,
      'to-process/*.csv'
    );
    sheetsBucketRef.grantRead(
      lambdas.spreadsheets.processSpreadsheet,
      'to-process/*.csv'
    );
    sheetsBucketRef.grantWrite(
      lambdas.spreadsheets.processSpreadsheet,
      'processing/*.json'
    );

    lambdas.spreadsheets.getUploadURL.addEnvironment(
      'BUCKET_NAME',
      sheetsBucketRef.bucketName
    );

    const sheetsDatabaseCredentialsArn = Fn.importValue(
      `${app.name}-database-credentials-arn-${app.environment}`
    );
    const sheetsDatabaseCredentialsRef = Secret.fromSecretCompleteArn(
      this,
      `${app.name}-database-credentials-${app.environment}`,
      sheetsDatabaseCredentialsArn
    );

    [
      lambdas.spreadsheets.getSpreadsheet,
      lambdas.spreadsheets.insertSpreadsheetContacts,
      lambdas.spreadsheets.processSpreadsheet,
    ].forEach((lambda) => {
      lambda.addEnvironment(
        'DATABASE_CREDENTIALS_ARN',
        sheetsDatabaseCredentialsArn
      );
      sheetsDatabaseCredentialsRef.grantRead(lambda);
    });

    const spreadsheetsToProcessQueueArn = Fn.importValue(
      `${app.name}-spreadsheets-to-process-queue-arn-${app.environment}`
    );
    const spreadsheetsToProcessQueueRef = Queue.fromQueueArn(
      this,
      `${app.name}-spreadsheets-to-process-queue-${app.environment}`,
      spreadsheetsToProcessQueueArn
    );
    spreadsheetsToProcessQueueRef.grantConsumeMessages(
      lambdas.spreadsheets.processSpreadsheet
    );
    lambdas.spreadsheets.processSpreadsheet.addEventSource(
      new SqsEventSource(spreadsheetsToProcessQueueRef, {
        batchSize: 1,
      })
    );

    const spreadsheetsProcessedContactsQueueArn = Fn.importValue(
      `${app.name}-processed-contacts-queue-arn-${app.environment}`
    );
    const spreadsheetsProcessedContactsQueueRef = Queue.fromQueueArn(
      this,
      `${app.name}-processed-contacts-queue-${app.environment}`,
      spreadsheetsProcessedContactsQueueArn
    );
    spreadsheetsProcessedContactsQueueRef.grantSendMessages(
      lambdas.spreadsheets.processSpreadsheet
    );
    spreadsheetsProcessedContactsQueueRef.grantConsumeMessages(
      lambdas.spreadsheets.insertSpreadsheetContacts
    );
    lambdas.spreadsheets.processSpreadsheet.addEnvironment(
      'PROCESSED_CONTACTS_QUEUE_URL',
      spreadsheetsProcessedContactsQueueRef.queueUrl
    );
    lambdas.spreadsheets.insertSpreadsheetContacts.addEventSource(
      new SqsEventSource(spreadsheetsProcessedContactsQueueRef, {
        maxConcurrency: 2,
      })
    );
  }
}
