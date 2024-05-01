#!/usr/bin/env node
import { App, Tags } from 'aws-cdk-lib';
import { AppProps, Environment } from '@/shared/types/index.js';
import { SheetsStage } from '@/stages/sheets.js';
import pkg from '../package.json';

const app = new App();

Object.values(Environment).forEach((environment) => {
  const appProps: AppProps['app'] = {
    environment: environment,
    name: 'sheets',
    version: pkg.version,
  };

  new SheetsStage(app, `sheets-${environment}`, {
    app: appProps,
  });

  Tags.of(app).add('name', appProps.name);
  Tags.of(app).add('environment', appProps.environment);
  Tags.of(app).add('version', appProps.version);
});
