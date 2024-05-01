import { CfnOutput } from 'aws-cdk-lib';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { type AppProps } from '@/shared/types/app-props.js';
import { Environment } from '@/shared/types/index.js';

/**
 * Avoid name collision by appending a nanoid pre-generated composed of
 * a-z and 10 characters.
 */
const BUCKET_SUFFIX: Record<
  (typeof Environment)[keyof typeof Environment],
  string
> = {
  [Environment.DEVELOPMENT]: 'rfzycyjkzs',
  [Environment.STAGING]: 'sjuhgtsirz',
  [Environment.PRODUCTION]: 'mhdrrewvlt',
};

export type S3ConstructProps = AppProps;

export class S3Construct extends Construct {
  public buckets: {
    sheets: Bucket;
  };

  constructor(scope: Construct, id: string, props: S3ConstructProps) {
    super(scope, id);

    const { app } = props;

    const sheetsBucket = new Bucket(
      this,
      `${app.name}-bucket-${app.environment}`,
      {
        bucketName: `${app.name}-${app.environment}-${BUCKET_SUFFIX[app.environment]}`,
        cors: [
          {
            allowedOrigins: ['*'],
            allowedMethods: [HttpMethods.POST, HttpMethods.PUT],
            allowedHeaders: ['*'],
          },
        ],
      }
    );

    new CfnOutput(this, `${app.name}-bucket-arn-${app.environment}`, {
      exportName: `${app.name}-bucket-arn-${app.environment}`,
      value: sheetsBucket.bucketArn,
    });

    new CfnOutput(this, `${app.name}-bucket-name-${app.environment}`, {
      exportName: `${app.name}-bucket-name-${app.environment}`,
      value: sheetsBucket.bucketName,
    });

    this.buckets = {
      sheets: sheetsBucket,
    };
  }
}
