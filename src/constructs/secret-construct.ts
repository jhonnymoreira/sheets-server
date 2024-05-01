import { CfnOutput } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { AppProps } from '@/shared/types/index.js';

export type SecretConstructProps = AppProps;

export class SecretConstruct extends Construct {
  constructor(scope: Construct, id: string, props: SecretConstructProps) {
    super(scope, id);

    const { app } = props;

    const databaseCredentials = new Secret(
      this,
      `${app.name}-database-credentials-${app.environment}`,
      {
        secretName: `${app.name}-database-credentials-${app.environment}`,
        description: `Database credentials for ${app.environment}`,
      }
    );

    new CfnOutput(
      this,
      `${app.name}-database-credentials-arn-${app.environment}`,
      {
        exportName: `${app.name}-database-credentials-arn-${app.environment}`,
        value: databaseCredentials.secretArn,
      }
    );
  }
}
