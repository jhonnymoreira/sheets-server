import { Duration } from 'aws-cdk-lib';
import {
  AuthorizationType,
  Cors,
  IdentitySource,
  LambdaIntegration,
  RequestAuthorizer,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { type NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { type WithAppProps } from '@/shared/types/index.js';

export type APIGatewayConstructProps = WithAppProps<{
  lambdas: {
    authorizer: NodejsFunction;
    spreadsheets: {
      getUploadURL: NodejsFunction;
      getSpreadsheet: NodejsFunction;
      getSpreadsheets: NodejsFunction;
    };
  };
}>;

export class APIGatewayConstruct extends Construct {
  public APIGateway: RestApi;

  constructor(scope: Construct, id: string, props: APIGatewayConstructProps) {
    super(scope, id);

    const { lambdas, app } = props;

    const authorizer = new RequestAuthorizer(
      this,
      `api-gateway-authorizer-${app.environment}`,
      {
        handler: lambdas.authorizer,
        identitySources: [IdentitySource.header('Authorization')],
        resultsCacheTtl: Duration.seconds(0),
      }
    );

    this.APIGateway = new RestApi(this, `api-gateway-${app.environment}`, {
      restApiName: `${app.name}-${app.environment}`,
      deployOptions: {
        stageName: 'v1',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
    });

    const root = this.APIGateway.root;

    const spreadsheets = root.addResource('spreadsheets');

    spreadsheets.addMethod(
      'GET',
      new LambdaIntegration(lambdas.spreadsheets.getSpreadsheets),
      {
        authorizationType: AuthorizationType.CUSTOM,
        authorizer,
      }
    );

    spreadsheets
      .addResource('{id}')
      .addMethod(
        'GET',
        new LambdaIntegration(lambdas.spreadsheets.getSpreadsheet),
        {
          authorizationType: AuthorizationType.CUSTOM,
          authorizer,
        }
      );

    spreadsheets
      .addResource('get-upload-url')
      .addMethod(
        'POST',
        new LambdaIntegration(lambdas.spreadsheets.getUploadURL),
        {
          authorizationType: AuthorizationType.CUSTOM,
          authorizer,
        }
      );
  }
}
