import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'node:path';
import { AppProps } from '@/shared/types/index.js';

export type LambdaConstructProps = AppProps;

export class LambdaConstruct extends Construct {
  public lambdas: {
    authorizer: NodejsFunction;
    spreadsheets: {
      getSpreadsheet: NodejsFunction;
      getUploadURL: NodejsFunction;
      insertSpreadsheetContacts: NodejsFunction;
      processSpreadsheet: NodejsFunction;
    };
  };

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const {
      app: { environment },
    } = props;

    const DEFAULT_LAMBDA_OPTIONS: Omit<
      NodejsFunctionProps,
      'entry' | 'functionName' | 'handler'
    > = {
      bundling: {
        minify: true,
        sourceMap: true,
      },
      environment: {
        NODE_ENV: environment,
      },
      memorySize: 1024,
      runtime: Runtime.NODEJS_20_X,
    };

    const authorizer = new NodejsFunction(
      this,
      `api-gateway-authorizer-${environment}`,
      {
        ...DEFAULT_LAMBDA_OPTIONS,
        entry: path.resolve(import.meta.dirname, '../handlers/authorizer.ts'),
        functionName: `api-gateway-authorizer-${environment}`,
        handler: 'authorizer',
      }
    );

    const getSpreadsheet = new NodejsFunction(
      this,
      `spreadsheets-get-spreadsheet-${environment}`,
      {
        ...DEFAULT_LAMBDA_OPTIONS,
        entry: path.resolve(
          import.meta.dirname,
          '../handlers/spreadsheets/get-spreadsheet.ts'
        ),
        functionName: `spreadsheets-get-spreadsheet-${environment}`,
        handler: 'getSpreadsheet',
      }
    );

    const getUploadURL = new NodejsFunction(
      this,
      `spreadsheets-get-upload-url-${environment}`,
      {
        ...DEFAULT_LAMBDA_OPTIONS,
        entry: path.resolve(
          import.meta.dirname,
          '../handlers/spreadsheets/get-upload-url.ts'
        ),
        functionName: `spreadsheets-get-upload-url-${environment}`,
        handler: 'getUploadURL',
      }
    );

    const insertSpreadsheetContacts = new NodejsFunction(
      this,
      `spreadsheets-insert-spreadsheet-contacts-${environment}`,
      {
        ...DEFAULT_LAMBDA_OPTIONS,
        entry: path.resolve(
          import.meta.dirname,
          '../handlers/spreadsheets/insert-spreadsheet-contacts.ts'
        ),
        functionName: `spreadsheets-insert-spreadsheet-contacts-${environment}`,
        handler: 'insertSpreadsheetContacts',
      }
    );

    const processSpreadsheet = new NodejsFunction(
      this,
      `spreadsheets-process-spreadsheet-${environment}`,
      {
        ...DEFAULT_LAMBDA_OPTIONS,
        entry: path.resolve(
          import.meta.dirname,
          '../handlers/spreadsheets/process-spreadsheet.ts'
        ),
        functionName: `spreadsheets-process-spreadsheet-${environment}`,
        handler: 'processSpreadsheet',
        timeout: Duration.seconds(20),
        memorySize: 2048,
      }
    );

    this.lambdas = {
      authorizer: authorizer,
      spreadsheets: {
        getSpreadsheet,
        getUploadURL,
        insertSpreadsheetContacts,
        processSpreadsheet,
      },
    };
  }
}
